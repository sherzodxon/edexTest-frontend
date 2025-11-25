"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import api, { finishTest } from "../../../../lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { CheckCircle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Option {
  id: number;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: number;
  text: string;
  img?: string | null;
  correctOption?: string | null;
  selectedOption?: string | null;
  isCorrect?: boolean;
  options: Option[];
}

interface TestData {
  id: number;
  title: string;
  subject: string;
  duration: number;
  userFinished: boolean;
  userScore?: number;
  questions: Question[];
}

export default function StudentTestPage() {
  const { id } = useParams();
  const [test, setTest] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);


  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await api.get(`/tests/${id}`);
      const data = res.data;
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const now = new Date();

      if (now < start) {
        toast(
         "Test hali boshlanmagan. Iltimos, boshlanish vaqtini kuting.",
         {
           duration: 6000,
         }
        );
        setTimeLeft(Math.floor((end.getTime() - start.getTime()) / 1000));
      } else if (now >= start && now < end) {
        setTimeLeft(Math.floor((end.getTime() - now.getTime()) / 1000));
      } else {
        setTimeLeft(0);
      }

      setTest({ ...data, startTime: start, endTime: end });

      const savedAnswers = localStorage.getItem(`answers_${id}`);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    };

    fetchData();
  }, [id]);


  useEffect(() => {
    if (!timeLeft || test?.userFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, test?.userFinished]);

  const handleSelect = (questionId: number, optionText: string) => {
    if (test?.userFinished) return;
    const newAnswers = { ...answers, [questionId]: optionText };
    setAnswers(newAnswers);
    localStorage.setItem(`answers_${id}`, JSON.stringify(newAnswers));
  };

  const handleSubmit = async () => {
    if (!test || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answerArray: { questionId: number; optionId: number }[] = [];

      for (const q of test.questions) {
        const selectedText = answers[q.id];
        if (!selectedText) continue;

        const foundOpt = q.options.find(
          (o) => String(o.text).trim() === String(selectedText).trim()
        );

        if (foundOpt) answerArray.push({ questionId: q.id, optionId: foundOpt.id });
      }

      const payload = { answers: answerArray };
      const res = await finishTest(Number(id), payload);
      localStorage.removeItem(`answers_${id}`);

      setTest(res);
      setTimeLeft(0);
      toast.success("Test muvaffaqiyatli yakunlandi!")
    } catch (err: any) {
      console.error("Submit error:", err);
     toast.error("Testni yakunlashda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false);
    }
  };
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

  useEffect(() => {
    if (!id) return;

    const socket = io("http://localhost:3001", { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;

    const student = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = student?.id;
    const name = student?.name ?? student?.fullName ?? "NoName";
    const surname = student?.surname ?? "";

    socket.on("connect", () => {
      if (userId) {
        socket.emit("joinTest", { userId, name, surname, testId: Number(id), role: "student" });
      }
    });

    const handleBeforeUnload = () => {
      if (userId) socket.emit("leaveTest", { userId, testId: Number(id) });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.disconnect();
    };
  }, [id]);

  if (!test) return <p className="p-6">Yuklanmoqda...</p>;

  if (test.userFinished) {
    const correctCount = test.questions.filter((q) => q.isCorrect).length;
    const total = test.questions.length;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
        <p className="text-gray-600 mb-4">Fan: {test.subject}</p>

        <div className="bg-green-50 border flex gap-2 border-green-300 text-green-700 p-4 rounded-xl mb-6">
          <CheckCircle />
          Test yakunlandi! Sizning natijangiz:{" "}
          <span className="font-bold">
            {test.userScore ?? ((correctCount / total) * 100).toFixed(0)}%
          </span>{" "}
          ({correctCount} / {total})
        </div>

        <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-center">#</th>
              <th className="border px-4 py-2 text-center">Savol</th>
              <th className="border px-4 py-2 text-center">Natija</th>
            </tr>
          </thead>
          <tbody>
            {test.questions.map((q, idx) => (
              <tr key={q.id} className="border-b">
                <td className="border px-4 py-2">{idx + 1}</td>
                <td className="border px-4">
                  <div className={`${/[\u0600-\u06FF]/.test(q.text) ? "text-right" : "text-left"}`}>
                    <BlockMath math={q.text?.replace(/ /g, "\\ ") || ""} />
                  </div>
                </td>
                <td className="px-4 py-5 font-medium gap-2">
                  {q.isCorrect ? (
                    <span className="text-green-600">
                      <CheckCircle2 className="w-6 h-6 mx-auto" />
                    </span>
                  ) : (
                    <span className="text-red-500">
                      <XCircle className="w-6 h-6 mx-auto" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
      <p className="text-gray-600 mb-4">Fan: {test.subject}</p>
     <p className="text-red-500 font-semibold mb-6">
       Qolgan vaqt: {formatTime(timeLeft)}
</p>


      {test.questions.map((q, idx) => (
        <Card key={q.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <span>{idx + 1}.</span>
              <div className={`${/[\u0600-\u06FF]/.test(q.text) ? "text-right" : "text-left"}`}>
                <BlockMath math={q.text || ""} />
              </div>
            </div>

            {q.img && (
                <img
                src={q.img}
                 alt="question"
                 className="w-48 mb-3 rounded-lg border cursor-pointer hover:opacity-80 transition"
                  onClick={() => setFullImage(q.img??null)}
               />
              )}


            <div className="grid gap-2">
              {q.options.map((opt) => (
                <Button
                  key={opt.id}
                  variant={answers[q.id] === opt.text ? "default" : "outline"}
                  className={`${/[\u0600-\u06FF]/.test(q.text) ? "text-right" : "text-left"} cursor-pointer selected:bg-blue-600 px-2 py-0`}
                  onClick={() => handleSelect(q.id, opt.text)}
                >
                 <BlockMath math={opt.text || ""}  />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="default"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 w-full bg-blue-500 text-white cursor-pointer"
      >
        {isSubmitting ? "Yuborilmoqda..." : "Testni yakunlash"}
      </Button>
      {fullImage && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setFullImage(null)}
  >
    <img
      src={fullImage}
      className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
      onClick={(e) => e.stopPropagation()}
    />

    <button
      onClick={() => setFullImage(null)}
      className="absolute top-5 right-5 text-white text-3xl font-bold"
    >
      ×
    </button>
  </div>
)}

    </div>
  );
}
