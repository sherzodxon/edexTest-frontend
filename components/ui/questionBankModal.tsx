"use client";

import { Search, Library, CircleX, Loader } from "lucide-react";
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
            <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl bg-white overflow-hidden border-none pt-0">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Library className="text-blue-600" /> Savollar majmui
                    </h2>
                    <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-red-200 cursor-pointer text-red-400">
                        <CircleX size={24} />
                    </Button>
                </div>
                
                <div className="p-4 pt-0 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500 transition-all bg-slate-50 focus:bg-white"
                            placeholder="Savollarni qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 flex flex-col items-center gap-2 text-slate-400">
                            <Loader className="animate-spin text-blue-600" size={32} />
                            <p className="text-sm">Savollar yuklanmoqda...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map((q) => (
                            <div 
                                key={q.id} 
                                onClick={() => onSelect(q)}
                                className="p-4 border border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group relative bg-white shadow-sm"
                            >
                                <div className="flex-1 min-w-0 pr-16"> 
                                    <div className="truncate text-sm font-semibold text-slate-600 mb-2">
                                        {q.text}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {q.options.map((opt: any, idx: number) => (
                                            <div 
                                                key={idx} 
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-medium transition-all 
                                                    ${opt.isCorrect 
                                                        ? 'bg-green-100 border-green-200 text-green-700 shadow-sm' 
                                                        : 'bg-slate-50 border-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {opt.isCorrect && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                                                <span className="max-w-[120px] truncate">{opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg shadow-lg transition-all transform scale-90 group-hover:scale-100">
                                    Tanlash
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <Library className="mx-auto text-slate-200 mb-2" size={48} />
                            <p className="text-slate-400 font-medium text-sm">Savollar topilmadi</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}