// Sahifaning yuqori qismida qo'shimcha importlar
import { Database, Search, Library, CircleX, Loader } from "lucide-react";
import RenderMixedContent from "../renderMixedContent";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Card } from "./card";
import { Button } from "./button";

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (question: any) => void;
}

export function QuestionBankModal({ isOpen, onClose, onSelect }: BankModalProps) {
    const [bankQuestions, setBankQuestions] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get("/question-bank")
                .then(res => setBankQuestions(res.data))
                .catch(() => toast.error("Bankni yuklashda xato"))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = bankQuestions.filter(q => 
        q.text.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl bg-white overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Library className="text-blue-600"/> Savollar majmui</h2>
                    <Button variant="ghost" onClick={onClose}><CircleX /></Button>
                </div>
                
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ring-blue-500"
                            placeholder="Savollarni qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? <div className="text-center py-10"><Loader className="animate-spin mx-auto"/></div> : 
                     filtered.length > 0 ? filtered.map((q) => (
                        <div key={q.id} 
                             onClick={() => onSelect(q)}
                             className="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group relative">
                          <div className="flex-1 min-w-0"> 
    <div className="truncate pr-4">
        <RenderMixedContent 
            text={q.text} 
            textClass="text-sm font-medium text-slate-700 whitespace-nowrap" 
        />
    </div>

    <div className="mt-2 flex flex-wrap gap-2">
        {q.options.map((opt: any, idx: number) => (
            <div 
                key={idx} 
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] transition-all 
                    ${opt.isCorrect 
                        ? 'bg-green-100 border-green-200 text-green-700' 
                        : 'bg-gray-50 border-gray-100 text-gray-500'
                    }`}
            >
                {opt.isCorrect && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                <div className="max-w-[100px] truncate">
                    <RenderMixedContent text={opt.text} />
                </div>
            </div>
        ))}
    </div>
</div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                                Tanlash
                            </div>
                        </div>
                    )) : <p className="text-center text-slate-400 py-10">Savollar topilmadi</p>}
                </div>
            </Card>
        </div>
    );
}