"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import api, { finishTest } from "@/lib/axios";

let socket: any = null;

export default function TestPage() {
  const { id } = useParams(); // test id
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🧩 Test ma’lumotlarini olish
  useEffect(() => {
    if (!id) return;

    async function fetchTest() {
      try {
        setLoading(true);
        const res = await api.get(`/tests/${id}`);
        setTest(res.data);

        // vaqtni hisoblash
        const endTime = new Date(res.data.endTime).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));

        // socketga ulan
        socket = io("http://localhost:3001"!, {
          query: { testId: id },
        });

        socket.emit("student_join", { testId: id });

        socket.on("test_force_end", () => {
          alert("⏰ Test vaqti tugadi!");
          handleSubmit();
        });
      } catch (err) {
        console.error("Testni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTest();

    return () => {
      socket?.disconnect();
    };
  }, [id]);

  // ⏳ Timer
  useEffect(() => {
    if (!timeLeft || submitted) return;
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
  }, [timeLeft, submitted]);

  const handleAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    try {
      setSubmitted(true);
     const res = await finishTest(Number(id),answers);
      alert(`✅ Test yakunlandi!`);
      router.push(`/student`);
    } catch (err) {
      console.error("Natijani yuborishda xatolik:", err);
      alert("Xatolik yuz berdi.");
    }
  };

  if (loading) return <div className="p-6">Yuklanmoqda...</div>;
  if (!test) return <div className="p-6 text-red-600">Test topilmadi.</div>;
  if (submitted) return <div className="p-6 text-green-600">Test yakunlandi!</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <span className="text-red-600 font-semibold">
          ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </span>
      </div>

      {test.questions.map((q: any, idx: number) => (
        <div key={q.id} className="border rounded-lg p-4 space-y-2">
          <p className="font-semibold">
            {idx + 1}. {q.text}
          </p>
          <div className="space-y-1">
            {q.options.map((opt: any) => (
              <label
                key={opt.id}
                className={`block cursor-pointer border rounded p-2 ${
                  answers[q.id] === opt.id ? "bg-blue-100 border-blue-400" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleAnswer(q.id, opt.id)}
                  className="mr-2"
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Yakunlash
      </button>
    </div>
  );
}
