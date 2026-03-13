"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import RenderMixedContent from "@/components/renderMixedContent";
import "katex/dist/katex.min.css";

export default function AdminTestViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.get(`/tests/admin/${id}`);
        setTest(res.data);
      } catch (err) {
        toast.error("Test ma'lumotini olishda xatolik");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, router]);

  if (loading) {
    return <div className="p-6 text-white">Yuklanmoqda...</div>;
  }

  if (!test) return null;

  return (
    <div className="space-y-4 text-white">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Orqaga
      </button>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h1 className="text-xl font-bold">{test.title}</h1>
        <p className="text-gray-400 text-sm">
          Fan: <span className="text-gray-200">{test.subject.name}</span>
        </p>
      </div>

      <div className="space-y-4">
        {test.questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4"
          >
            <h3 className="font-semibold mb-2 flex items-start gap-2  text-white font-bold leading-relaxed">
  <span>{index + 1}.</span> 
  {/* <RenderMixedContent 
    text={q.text} 
    textClass="text-xl text-white font-bold leading-relaxed" 
  /> */}
  {q.text}
</h3>

<div className="space-y-2">
  {q.options.map((o: any) => (
    <div
      key={o.id}
      className={`flex items-center gap-2 p-2 rounded transition-colors ${
        o.isCorrect ? "bg-green-900/40 border border-green-700" : "bg-gray-800"
      }`}
    >
      {o.isCorrect ? (
        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-500 shrink-0" />
      )}
      {/* <RenderMixedContent 
        text={o.text} 
        textClass="text-gray-200" 
      /> */}{o.text}
    </div>
  ))}
</div>
          </div>
        ))}
      </div>
    </div>
  );
}
