"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { PencilLine, Check, Save, ArrowLeft, Loader2, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

export default function EditTestPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<{ type: 'q' | 'o', qIdx: number, oIdx?: number } | null>(null);

  useEffect(() => {
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
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, qIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...test };
      updated.questions[qIdx].imgPreview = reader.result;
      updated.questions[qIdx].newFile = file; 
      setTest(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (qIdx: number) => {
    const updated = { ...test };
    updated.questions[qIdx].img = null;
    updated.questions[qIdx].imgKey = null;
    updated.questions[qIdx].imgPreview = null;
    updated.questions[qIdx].newFile = null;
    setTest(updated);
  };

  const handleUpdate = (val: string, qIdx: number, oIdx?: number) => {
    const updated = { ...test };
    if (oIdx !== undefined) {
      updated.questions[qIdx].options[oIdx].text = val;
    } else {
      updated.questions[qIdx].text = val;
    }
    setTest(updated);
  };

  const toggleCorrect = (qIdx: number, oIdx: number) => {
    const updated = { ...test };
    updated.questions[qIdx].options = updated.questions[qIdx].options.map((opt: any, index: number) => ({
      ...opt,
      isCorrect: index === oIdx
    }));
    setTest(updated);
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      
      const questionsData = test.questions.map((q: any) => ({
        text: q.text,
        // Agar yangi rasm yuklanmagan bo'lsa, eskisini (imgKey yoki img) saqlab qolamiz
        img: q.newFile ? null : (q.imgKey || q.img || null),
        options: q.options.map((o: any) => ({
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }));

      const payload = {
        title: test.title,
        subjectId: Number(test.subjectId),
        startTime: test.startTime,
        endTime: test.endTime,
        questions: questionsData
      };

      formData.append("data", JSON.stringify(payload));

      // Yangi fayllarni FormData'ga qo'shish
      test.questions.forEach((q: any, index: number) => {
        if (q.newFile) {
          formData.append(`files`, q.newFile);
          // Backend'da qaysi savolga tegishliligini bilish uchun index yuborish mumkin (backend mantiqiga qarab)
        }
      });

      await api.put(`/tests/${id}`, formData);
      toast.success("Muvaffaqiyatli saqlandi");
      setEditTarget(null);
    } catch (err: any) {
      toast.error("Saqlashda xatolik");
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
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className=" border-b px-6 py-4 flex justify-between items-center ">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Testni tahrirlash</h1>
        </div>
        
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="font-bold">Saqlash</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-8 mt-6">
        {test.questions.map((q: any, qIdx: number) => (
          <div key={q.id || qIdx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative">
            <div className="absolute -left-3 top-8 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xl ring-4 ring-white">
              {qIdx + 1}
            </div>

            <div className="space-y-6">
              {/* SAVOL QISMI */}
              <div className="space-y-4">
                <div className="relative group rounded-2xl p-4 bg-slate-50/50 border-2 border-transparent hover:border-indigo-100 transition-all">
                  {editTarget?.type === 'q' && editTarget?.qIdx === qIdx ? (
                    <div className="space-y-4">
                      <textarea
                        autoFocus
                        value={q.text}
                        onChange={(e) => handleUpdate(e.target.value, qIdx)}
                        className="w-full bg-white border-2 border-indigo-200 rounded-xl p-4 outline-none shadow-inner min-h-[100px]"
                      />
                      <button onClick={() => setEditTarget(null)} className="ml-auto flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
                        <Check className="w-4 h-4" /> Tayyor
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <p className="flex-1 text-lg text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">{q.text}</p>
                      <button onClick={() => setEditTarget({ type: 'q', qIdx })} className="p-3 text-indigo-600 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                        <PencilLine className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4">
                  {(q.img || q.imgPreview) ? (
                    <div className="relative w-full max-w-md mx-auto group">
                      <img 
                        src={q.imgPreview || q.img} 
                        alt="Savol rasmi" 
                        className="rounded-2xl border border-slate-200 w-full object-cover max-h-[300px]"
                      />
                      <button 
                        onClick={() => removeImage(qIdx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Rasm yuklash</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, qIdx)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt: any, oIdx: number) => (
                  <div key={oIdx} className={`p-4 rounded-xl border-2 transition-all ${opt.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-100'}`}>
                    {editTarget?.type === 'o' && editTarget?.qIdx === qIdx && editTarget?.oIdx === oIdx ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          autoFocus
                          value={opt.text}
                          onChange={(e) => handleUpdate(e.target.value, qIdx, oIdx)}
                          className="flex-1 bg-white border border-indigo-200 rounded-lg p-2 outline-none"
                        />
                        <button onClick={() => setEditTarget(null)} className="p-2 bg-emerald-600 text-white rounded-lg"><Check size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleCorrect(qIdx, oIdx)}>
                          <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                            {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={`text-base ${opt.isCorrect ? 'text-emerald-800 font-medium' : 'text-slate-600'}`}>{opt.text}</span>
                        </div>
                        <button onClick={() => setEditTarget({ type: 'o', qIdx, oIdx })} className="p-2 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100"><PencilLine size={18}/></button>
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