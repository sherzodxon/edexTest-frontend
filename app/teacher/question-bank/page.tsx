"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { 
  Plus, Trash2, Languages, Loader, 
  Database, CheckCircle2, XCircle, Search, X 
} from "lucide-react";
import { toast } from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [text, setText] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const [focusedField, setFocusedField] = useState<{type: 'text' | 'option', idx?: number} | null>(null);
  const [isArabicPanelOpen, setIsArabicPanelOpen] = useState(false);
  const { showConfirm } = useConfirmToast();

  const arabicLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ة", "َ", "ُ", "ِ", "ً", "ٌ", "ٍ", "ْ", "ّ"];

  useEffect(() => { fetchBank(); }, []);

  const fetchBank = async () => {
    try {
      const res = await api.get("/question-bank");
      setQuestions(res.data);
    } catch (err) { 
      toast.error("Bankni yuklab bo'lmadi"); 
    } finally { 
      setLoading(false); 
    }
  };

  const insertChar = (char: string) => {
    if (!focusedField) return;
    if (focusedField.type === 'text') {
      setText(prev => prev + char);
    } else if (focusedField.type === 'option' && focusedField.idx !== undefined) {
      const newOpts = [...options];
      newOpts[focusedField.idx].text += char;
      setOptions(newOpts);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Savol matni bo'sh!");

    try {
      // Backend JSON string kutayotgan bo'lsa JSON.stringify ishlatiladi
      await api.post("/question-bank", { 
        text, 
        options: JSON.stringify(options) 
      });
      toast.success("Savol bankka saqlandi");
      setIsModalOpen(false);
      resetForm();
      fetchBank();
    } catch (err) { 
      toast.error("Saqlashda xato"); 
    }
  };

  const resetForm = () => {
    setText("");
    setOptions([
      { text: "", isCorrect: true }, 
      { text: "", isCorrect: false }, 
      { text: "", isCorrect: false }, 
      { text: "", isCorrect: false }
    ]);
    setIsArabicPanelOpen(false);
  };

  const deleteQuestion = async (id: number) => {
    const confirm = await showConfirm("Ushbu savol bankdan butunlay o'chirilsinmi?");
    if (!confirm) return;
    try {
      await api.delete(`/question-bank/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Savol o'chirildi");
    } catch (err) {
      toast.error("O'chirishda xatolik");
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 pt-0 max-w-6xl mx-auto pb-24 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Database className="text-emerald-600 w-8 h-8" /> Savollar Majmui
          </h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95 font-bold"
        >
          <Plus size={20} /> Savol Qo'shish
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Savol matni bo'yicha qidirish..."
          className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-start gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="flex-1">
                <div className="mb-4">
                  <p className="text-slate-600 font-bold text-lg leading-relaxed">{q.text}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt: any, idx: number) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                      {opt.isCorrect ? <CheckCircle2 size={18} /> : <div className="w-[18px]" />}
                      <span className="text-sm font-semibold">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => deleteQuestion(q.id)} 
                className="text-slate-300 hover:text-red-500 p-3 cursor-pointer hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 size={22}/>
              </button>
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
              Savollar topilmadi
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh]">
            <button 
              onClick={() => { setIsModalOpen(false); resetForm(); }} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-black mb-4 text-slate-800">Yangi Savol Qo'shish</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setFocusedField({ type: 'text' })}
                  placeholder="Savol matnini bu yerga yozing..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] p-5 outline-none transition-all min-h-[100px] text-lg font-medium"
                />
              </div>
              
              <div className="space-y-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setOptions(newOpts);
                      }}
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${opt.isCorrect ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 text-slate-300 hover:border-emerald-300'}`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      onFocus={() => setFocusedField({ type: 'option', idx })}
                      placeholder={`${idx + 1}-variant`}
                      className="flex-1 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-3 outline-none transition-all font-semibold text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  className="flex-1 py-3 cursor-pointer bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 cursor-pointer bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                >
                 Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARABIC PANEL FLOAT */}
      {isModalOpen && (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-[110]">
          {isArabicPanelOpen && (
            <div className="bg-white/80 backdrop-blur-xl p-5 shadow-2xl border border-white rounded-[2.5rem] max-w-[360px] animate-in slide-in-from-bottom-5 duration-300">
              <div className="grid grid-cols-7 gap-2">
                {arabicLetters.map((char, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertChar(char)}
                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm transition-all text-xl font-arabic border border-slate-50"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsArabicPanelOpen(!isArabicPanelOpen)} 
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 ${isArabicPanelOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-emerald-600 text-white hover:scale-110'}`}
          >
            {isArabicPanelOpen ? <X size={28} /> : <Languages size={28} />}
          </button>
        </div>
      )}
    </div>
  );
}