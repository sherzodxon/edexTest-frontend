"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api, { finishTest } from "../../../../lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import "katex/dist/katex.min.css";
import { CheckCircle, ClockArrowDown, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import RenderMixedContent from "@/components/renderMixedContent";

interface Option { id: number; text: string; isCorrect?: boolean; }
interface Question { id: number; text: string; img?: string | null; options: Option[]; isCorrect?: boolean; }
interface TestData { id: number; title: string; subject: string; startTime: Date; endTime: Date; userFinished: boolean; userScore?: number; questions: Question[]; }

export default function StudentTestPage() {
    const { id } = useParams();
    const [test, setTest] = useState<TestData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullImage, setFullImage] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!id) return;
        const fetchData = async () => {
            try {
                const res = await api.get(`/tests/${id}`);
                const data = res.data;
                const start = new Date(data.startTime);
                const end = new Date(data.endTime);
                const now = new Date();
                if (now >= start && now < end) setTimeLeft(Math.floor((end.getTime() - now.getTime()) / 1000));
                setTest({ ...data, startTime: start, endTime: end });
                const savedAnswers = localStorage.getItem(`answers_${id}`);
                const savedIndex = localStorage.getItem(`current_idx_${id}`);
                if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
                if (savedIndex) setCurrentIndex(Number(savedIndex));
            } catch (err) { toast.error("Ma'lumot yuklashda xato"); }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!timeLeft || test?.userFinished) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(interval); handleSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, test?.userFinished]);

    const handleSelect = (questionId: number, optionText: string) => {
        if (test?.userFinished) return;
        setAnswers((prev) => {
            const newAnswers = { ...prev, [questionId]: optionText };
            localStorage.setItem(`answers_${id}`, JSON.stringify(newAnswers));
            return newAnswers;
        });
    };

    useEffect(() => {
        if (isMounted && id) localStorage.setItem(`current_idx_${id}`, String(currentIndex));
    }, [currentIndex, id, isMounted]);

    const handleSubmit = async () => {
        if (!test || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const answerArray = test.questions
                .map((q) => {
                    const selectedText = answers[q.id];
                    const foundOpt = q.options.find((o) => String(o.text).trim() === String(selectedText).trim());
                    return foundOpt ? { questionId: q.id, optionId: foundOpt.id } : null;
                }).filter((a): a is { questionId: number; optionId: number } => a !== null);
            const res = await finishTest(Number(id), { answers: answerArray });
            localStorage.removeItem(`answers_${id}`);
            localStorage.removeItem(`current_idx_${id}`);
            setTest(res);
            setTimeLeft(0);
            toast.success("Test yakunlandi!");
        } catch (err) { toast.error("Xatolik yuz berdi"); } finally { setIsSubmitting(false); }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-blue-600";
    return "text-red-600";
};
    if (!isMounted || !test) return <div className="p-10 text-center">Yuklanmoqda...</div>;

    if (test.userFinished) {
        return (
            <div className="p-4 max-w-4xl mx-auto ">
                <Card className="bg-green-50 mt-2 p-3 mb-6 flex items-center">
                    <h2 className="text-2xl text-green-700 flex items-center gap-1">
                        <CheckCircle /> Test Yakunlandi
                    </h2>
                  <p className="text-lg">Natijangiz: <strong className={getScoreColor(test.userScore || 0)}>{test.userScore}%</strong></p>
                </Card>
                
                <Card className="p-0 rounded-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center rounded">
                            <thead className="bg-slate-50 border-b rounded">
                                <tr>
                                    <th className="p-4">#</th>
                                    <th className="p-4">Savol</th>
                                    <th className="p-4">Natija</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {test.questions.map((q, idx) => (
                                    <tr key={q.id}>
                                        <td className="p-4">{idx + 1}</td>
                                        <td className="p-4"><RenderMixedContent text={q.text} /></td>
                                       <td className="p-4 text-center">
                                     {q.isCorrect ? (
                                     <div className="text-green-600 flex justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    ) : (
                                      <div className="text-red-600 flex justify-center">
                                      <XCircle className="w-5 h-5" />
                                    </div>
                                    )}
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQuestion = test.questions[currentIndex];
    const progress = Math.round((Object.keys(answers).length / test.questions.length) * 100);
    const isLast = currentIndex === test.questions.length - 1;

    return (
        <div className="px-3 sm:px-6 py-4 max-w-6xl mx-auto">
            <div className="mb-6 sticky top-0 bg-white z-10 py-2 border-b">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-600">Savol {currentIndex + 1}/{test.questions.length}</span>
                    <span className="font-mono text-red-500 font-bold">{formatTime(timeLeft)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full text-[0px]">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="p-6 py-4">
                    <div className="text-lg font-semibold mb-4 text-slate-800">
                        <RenderMixedContent text={currentQuestion.text} />
                    </div>

                    {currentQuestion.img && (
                        <img src={currentQuestion.img} alt="savol" 
                             className="max-h-60 mb-4 rounded border cursor-pointer hover:opacity-90 transition-opacity" 
                             onClick={() => setFullImage(currentQuestion.img!)} />
                    )}

                    <div className="grid gap-4">
                        {currentQuestion.options.map((opt, index) => {
                            const isSelected = answers[currentQuestion.id] === opt.text;
                            return (
                                <button key={opt.id} onClick={() => handleSelect(currentQuestion.id, opt.text)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border-2 cursor-pointer
                                    ${isSelected ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-200" : "bg-white border-slate-100 hover:border-slate-300"}`}>
                                    <div className={`text-base sm:text-lg ${isSelected ? "text-blue-900 font-semibold" : "text-slate-700"}`}>
                                        <RenderMixedContent text={opt.text} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-8 gap-4 pb-6">
                <Button key={`prev-${currentIndex}`} variant="outline" onClick={() => setCurrentIndex(p => p - 1)} disabled={currentIndex === 0}
                    className={`h-12 px-6 flex-1 sm:flex-none border-2 transition-all ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "border-slate-200 hover:bg-slate-100 cursor-pointer"}`}>
                    Orqaga
                </Button>

                <Button variant="default" key={`next-${currentIndex}`} disabled={!answers[currentQuestion.id] || isSubmitting}
                    onClick={() => isLast ? handleSubmit() : setCurrentIndex(p => p + 1)}
                    className={`h-12 px-8 flex-1 sm:flex-none font-bold text-white transition-all ${
                        !answers[currentQuestion.id] || isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : 
                        isLast ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    }`}
                >
                    {isLast ? (isSubmitting ? "Yuborilmoqda..." : "Testni yakunlash") : "Keyingisi"}
                </Button>
            </div>

            {fullImage && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullImage(null)}>
                    <X className="absolute top-4 right-4 text-white w-8 h-8 cursor-pointer" />
                    <img src={fullImage} className="max-w-full max-h-full object-contain" alt="Full" />
                </div>
            )}
        </div>
    );
}