"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { 
  Plus, Trash2, Languages, Loader, 
  Database, CheckCircle2, XCircle, Search 
} from "lucide-react";
import { toast } from "react-hot-toast";
import "mathlive";
import RenderMixedContent from "@/components/renderMixedContent";
import "katex/dist/katex.min.css";
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

  const mathRefs = useRef<Record<string, any>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isArabicPanelOpen, setIsArabicPanelOpen] = useState(false);
 const {showConfirm}=useConfirmToast()
  const arabicLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ة", "ٱ", "لا", "َ", "ُ", "ِ", "ً", "ٌ", "ٍ", "ْ", "ّ", "ٰ", "ٓ", "؟", "،", "؛", "ـ", "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  useEffect(() => { fetchBank(); }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const syncField = (id: string, refKey: string, initialValue: string, isOption = false, optIdx = 0) => {
      const el = document.getElementById(id);
      if (!el) return;
      let mf = el.querySelector("math-field") as any;
      if (!mf) {
        mf = document.createElement("math-field") as any;
        mf.className = "w-full border rounded-lg px-3 py-2 bg-white focus-within:ring-2 ring-green-300 transition outline-none";
        mf.defaultMode = "text";
        mf.value = initialValue;

        mf.addEventListener("input", (e: any) => {
          const val = e.target.getValue("latex");
          if (isOption) {
            setOptions(prev => {
              const newOpts = [...prev];
              newOpts[optIdx].text = val;
              return newOpts;
            });
          } else {
            setText(val);
          }
        });

        mf.addEventListener("focus", () => setFocusedField(refKey));
        el.appendChild(mf);
        mathRefs.current[refKey] = mf;
      }
    };

    setTimeout(() => {
      syncField("bank-math-text", "text", text);
      options.forEach((opt, idx) => {
        syncField(`bank-math-opt-${idx}`, `opt-${idx}`, opt.text, true, idx);
      });
    }, 100);
  }, [isModalOpen]);

  const fetchBank = async () => {
    try {
      const res = await api.get("/question-bank");
      setQuestions(res.data);
    } catch (err) { toast.error("Bankni yuklab bo'lmadi"); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Savol matni bo'sh!");

    try {
      await api.post("/question-bank", { text, options: JSON.stringify(options) });
      toast.success("Savol bankka saqlandi");
      setIsModalOpen(false);
      resetForm();
      fetchBank();
    } catch (err) { toast.error("Saqlashda xato"); }
  };

  const resetForm = () => {
    setText("");
    setOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    mathRefs.current = {};
  };

  const deleteQuestion = async (id: number) => {
  const confirm = await showConfirm("Ushbu savol bankdan butunlay o'chirilsinmi?");
   if(!confirm) return;
    try {
      await api.delete(`/question-bank/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      
      toast.success("Savol muvaffaqiyatli o'chirildi");
    } catch (err) {
      console.error(err);
      toast.error("O'chirishda xatolik yuz berdi");
    }
  
};

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 pt-0 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-green-600" /> Savollar Majmui
          </h1>
          <p className="text-sm text-slate-500">Barcha fanlar uchun tayyor savollar zaxirasi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition shadow-lg active:scale-95"
        >
          <Plus size={20} /> Savol Qo'shish
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Savollardan qidirish..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-green-500 outline-none transition-all bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-green-600" size={40} /></div>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start gap-4 hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="mb-3">
                  <RenderMixedContent text={q.text} textClass="text-slate-800 font-medium text-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt: any) => (
                    <div key={opt.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                      {opt.isCorrect ? <CheckCircle2 size={16} className="text-green-600" /> : <div className="w-4" />}
                      <RenderMixedContent text={opt.text} textClass="text-sm text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => deleteQuestion(q.id)} 
                className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-1">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-4 px-8 overflow-y-auto max-h-[90vh] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
              <XCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Yangi savol yaratish</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Savol matni va formula</label>
                <div id="bank-math-text"  />
              </div>
              
              <div className="space-y-3 m-0">
                <label className="text-sm font-semibold text-slate-700">Javob variantlari</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setOptions(newOpts);
                      }}
                      className={`p-2 rounded-full border-2 transition-all ${opt.isCorrect ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200 text-slate-200'}`}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div id={`bank-math-opt-${idx}`} className="flex-1" />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-2xl hover:bg-slate-200 transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-3 z-[110]">
          {isArabicPanelOpen && (
            <div className="bg-white p-4 shadow-2xl border border-slate-100 rounded-3xl max-w-[400px] mb-4 grid grid-cols-8 gap-1">
              {arabicLetters.map((char, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (!focusedField) return;
                    const mf = mathRefs.current[focusedField];
                    if (mf) { mf.insert(char); mf.focus(); }
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-green-500 hover:text-white rounded-xl transition-all text-xl"
                >
                  {char}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setIsArabicPanelOpen(!isArabicPanelOpen)} 
            className="w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <Languages size={24} />
          </button>
        </div>
      )}
    </div>
  );
}