"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { PencilLine, Check, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "katex/dist/katex.min.css";
import RenderMixedContent from "@/components/renderMixedContent";



export default function EditTestPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<{ type: 'q' | 'o', qIdx: number, oIdx?: number } | null>(null);
 const MathField = "math-field" as any;
  useEffect(() => {
   
    if (typeof window !== "undefined") {
      import("mathlive");
    }

    const fetchTestData = async () => {
  try {
    const res = await api.get(`/tests/${id}`);
    setTest(res.data); 
  } catch (err: any) {
    toast.error("Ma'lumot yuklashda xato");
  } finally {
    setLoading(false);
  }
};
    fetchTestData();
  }, [id, router]);
const handleUpdate = (val: string, qIdx: number, oIdx?: number) => {
 
  const currentVal = oIdx !== undefined 
    ? test.questions[qIdx].options[oIdx].text.replace(/\$/g, "")
    : test.questions[qIdx].text.replace(/\$/g, "");

  if (val === currentVal) return;

  const updated = { ...test };
  const cleanVal = val.replace(/\$/g, "");
  const formattedVal = `$${cleanVal}$`;

  if (oIdx !== undefined) {
    updated.questions[qIdx].options[oIdx].text = formattedVal;
  } else {
    updated.questions[qIdx].text = formattedVal;
  }
  setTest(updated);
};
const toggleCorrect = (qIdx: number, oIdx: number) => {
  setTest((prevTest: any) => {
   
    const updatedTest = { ...prevTest };
    const updatedQuestions = [...updatedTest.questions];
    const updatedOptions = [...updatedQuestions[qIdx].options];

    updatedQuestions[qIdx].options = updatedOptions.map((opt: any, index: number) => ({
      ...opt,
      isCorrect: index === oIdx
    }));

    updatedTest.questions = updatedQuestions;
    return updatedTest;
  });
  
  toast.success("To'g'ri javob belgilandi");
};
const onSave = async () => {
  if (!test.questions || test.questions.length === 0) {
    toast.error("Kamida bitta savol bo'lishi shart!");
    return;
  }

  setIsSaving(true);
  try {
    const formData = new FormData();
    
    const payload = {
      title: test.title,
      subjectId: Number(test.subjectId),
      startTime: test.startTime,
      endTime: test.endTime,
      questions: test.questions.map((q: any) => ({
        text: q.text.includes('$') ? q.text : `$${q.text}$`,
        img: q.imgKey || q.img || null, 
        options: q.options.map((o: any) => ({
          text: o.text,
          isCorrect: o.isCorrect === true || String(o.isCorrect) === "true"
        }))
      }))
    };

    formData.append("data", JSON.stringify(payload));
    
    const res = await api.put(`/tests/${id}`, formData);
  
    setTest(res.data.test); 
    
    toast.success("Test muvaffaqiyatli yangilandi");
    setEditTarget(null); 
  } catch (err: any) {
    console.error("Saqlashda xato:", err.response?.data);
    toast.error(err.response?.data?.message || "Saqlashda xatolik");
  } finally {
    setIsSaving(false);
  }
};
  if (loading || !test) return (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
  </div>
);

  return (
    <div className="min-h-screen  pb-24">
      <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Tahrirlash</h1>
            <p className="text-xs text-slate-400 font-medium tracking-widest">{test?.title}</p>
          </div>
        </div>
        
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="font-bold">Saqlash</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-8 mt-6">
        {test?.questions.map((q: any, qIdx: number) => (
          <div key={q.id || qIdx} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 relative">
            <div className="absolute -left-3 top-8 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xl ring-4 ring-white">
              {qIdx + 1}
            </div>

            <div className="space-y-8">
              {/* SAVOL EDITOR */}
              <div className="relative group rounded-3xl p-6 bg-slate-50/50 border-2 border-transparent hover:border-indigo-100 transition-all">
                {editTarget?.type === 'q' && editTarget?.qIdx === qIdx ? (
                  <div className="space-y-4">
                   <MathField
                 onInput={(e: any) => handleUpdate(e.target.value, qIdx)}
                 className="w-full bg-white border-2 border-indigo-200 rounded-2xl p-4 outline-none shadow-inner"
                >
                {q.text.replace(/\$/g, "")}
                </MathField>
                    <button onClick={() => setEditTarget(null)} className="ml-auto flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-all">
                      <Check className="w-4 h-4" /> Tayyor
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 overflow-x-auto pt-1">
                      <RenderMixedContent text={q.text} textClass="text-xl text-slate-800 font-bold leading-relaxed" />
                    </div>
                    <button onClick={() => setEditTarget({ type: 'q', qIdx })} className="p-3 text-indigo-600 bg-white rounded-2xl shadow-sm border border-slate-100 hover:scale-110 transition-all">
                      <PencilLine className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

            
              <div className="grid grid-cols-1 gap-4">
                {q.options.map((opt: any, oIdx: number) => (
  <div 
    key={opt.id || oIdx} 
    className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
      opt.isCorrect 
      ? 'bg-emerald-50 border-emerald-300 shadow-sm' 
      : 'bg-white border-slate-100 hover:border-slate-300'
    }`}
  >
    {editTarget?.type === 'o' && editTarget?.qIdx === qIdx && editTarget?.oIdx === oIdx ? (
    
      <div className="flex items-center gap-3">
<input 
  type="radio"
  name={`q-${qIdx}-view`}
  
  checked={!!opt.isCorrect} 
  readOnly
  className="w-5 h-5 accent-emerald-500 cursor-pointer"
/>
        <MathField
          onInput={(e: any) => handleUpdate(e.target.value, qIdx, oIdx)}
          className="flex-1 bg-white border border-indigo-200 rounded-xl p-2.5 outline-none shadow-sm"
        >
          {opt.text.replace(/\$/g, "")}
        </MathField>
        <button 
          onClick={() => setEditTarget(null)} 
          className="p-3 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>
    ) : (
      
      <div className="flex justify-between items-center group">
        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleCorrect(qIdx, oIdx)}>
      
          <input 
            type="radio"
            name={`q-${qIdx}-view`}
            checked={opt.isCorrect}
            readOnly
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
          <RenderMixedContent 
            text={opt.text} 
            textClass={`text-base font-medium ${opt.isCorrect ? 'text-emerald-800' : 'text-slate-600'}`} 
          />
        </div>
       
        <button 
          onClick={() => setEditTarget({ type: 'o', qIdx, oIdx })}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <PencilLine className="w-5 h-5" />
        </button>
      </div>
    )}
  </div>
))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}