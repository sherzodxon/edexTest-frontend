"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { getTeacherGrades, createTest } from "@/lib/axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { CustomLocale } from "flatpickr/dist/types/locale";
import {
    Upload,
    CircleX,
    BadgeQuestionMark,
    Plus,
    Loader,
    HardDriveUpload,
    Languages,
    CheckCircle2,
    Database,
    AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { QuestionBankModal } from "@/components/ui/questionBankModal";

const Uzbek: CustomLocale = {
    weekdays: {
        shorthand: ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"],
        longhand: ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"]
    },
    months: {
        shorthand: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
        longhand: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
    },
    firstDayOfWeek: 1,
    rangeSeparator: " dan ",
    time_24hr: true
};
interface Question {
    id: number;
    text: string;
    image?: File | null;
    options: string[];
    correctIndex: number | null;
}
const STORAGE_KEY = "gradoria_test_draft";

export default function CreateTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectId = Number(searchParams.get("subjectId"));

    const [title, setTitle] = useState("");
    const [grades, setGrades] = useState<any[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [isArabicPanelOpen, setIsArabicPanelOpen] = useState(false);
    const lastFocusedRef = useRef<{ id: string; selectionStart: number } | null>(null);
    const [bankModal, setBankModal] = useState<{ isOpen: boolean; targetIndex: number | null }>({
        isOpen: false,
        targetIndex: null
    });

    const arabicLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ة", "ٱ", "لا", "َ", "ُ", "ِ", "ً", "ٌ", "ٍ", "ْ", "ّ", "ٰ", "ٓ", "؟", "،", "؛", "ـ", "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    const [questions, setQuestions] = useState<Question[]>([
        { id: Math.random(), text: "", image: null, options: ["", "", "", ""], correctIndex: null }
    ]);

    
useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.title) setTitle(parsed.title);
            if (parsed.selectedGrade) setSelectedGrade(parsed.selectedGrade);
            if (parsed.startTime) setStartTime(new Date(parsed.startTime));
            if (parsed.endTime) setEndTime(new Date(parsed.endTime));
            
            if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                const restored = parsed.questions.map((q: any) => ({
                    ...q,
                    id: q.id || Math.random(),
                    image: null 
                }));
                setQuestions(restored);
            }
        } catch (e) {
            console.error("Yuklashda xato:", e);
        }
    }
    getTeacherGrades().then((res) => setGrades(res.data)).catch(console.error);
}, []); 

useEffect(() => {
    if (questions.length === 0) return;

    const timeoutId = setTimeout(() => {
        const draft = {
            title,
            selectedGrade,
            startTime,
            endTime,
            questions: questions.map(q => ({
                id: q.id,
                text: q.text,
                options: q.options,
                correctIndex: q.correctIndex
            }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 500); 

    return () => clearTimeout(timeoutId);
}, [title, selectedGrade, startTime, endTime, questions]);
const validate = () => {
    const invalids: number[] = [];
    
    if (!title.trim()) { 
        toast.error("Test nomi yozilmagan!"); 
        return false; 
    }
    if (!selectedGrade) { 
        toast.error("Sinf tanlanmagan!"); 
        return false; 
    }
    if (!startTime || !endTime) { 
        toast.error("Vaqtlar belgilanmagan!"); 
        return false; 
    }
    
    if (startTime >= endTime) { 
        toast.error("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak!"); 
        return false; 
    }
    
    if (questions.length < 15) {
        toast.error(`Kamida 15 ta savol bo'lishi kerak. Hozir: ${questions.length}`);
        return false;
    }

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        const uniqueOptions = new Set(q.options.map((o: string) => o.trim().toLowerCase()));
        
        if (!q.text.trim() || q.options.some((o: string) => !o.trim()) || q.correctIndex === null) {
            invalids.push(i);
        } 
        else if (uniqueOptions.size !== q.options.length) {
            toast.error(`${i + 1}-savolda bir xil javob variantlari bor!`);
            invalids.push(i);
        }
    }

    setInvalidIndexes(invalids);

    if (invalids.length > 0) {
        toast.error("Ba'zi savollarda xatolik bor!");
        return false;
    }

    return true; 
};
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                title, subjectId, gradeId: selectedGrade,
                startTime: startTime?.toISOString(),
                endTime: endTime?.toISOString(),
                questions: questions.map((q, i) => ({
                    text: q.text,
                    imgKey: q.image ? `image_${i}` : null,
                    // TypeScript xatosi uchun turlar qo'shildi:
                    options: q.options.map((opt: string, idx: number) => ({ 
                        text: opt, 
                        isCorrect: q.correctIndex === idx 
                    }))
                }))
            };
            
            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            questions.forEach((q, i) => { if (q.image) formData.append(`image_${i}`, q.image); });
            
            await createTest(formData);
            toast.success("Test muvaffaqiyatli saqlandi!");
            localStorage.removeItem(STORAGE_KEY); // Faqat muvaffaqiyatli bo'lganda o'chiramiz
            router.push(`/teacher`);
        } catch (err) {
            toast.error("Xatolik yuz berdi!");
        } finally { setLoading(false); }
    };
    const insertArabicChar = (char: string) => {
        if (!lastFocusedRef.current) { toast.error("Avval matn maydonini tanlang"); return; }
        const { id, selectionStart } = lastFocusedRef.current;
        const element = document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement;

        if (element) {
            const val = element.value;
            const newVal = val.substring(0, selectionStart) + char + val.substring(selectionStart);
            
            if (id.startsWith('q-text-')) {
                handleQuestionTextChange(parseInt(id.replace('q-text-', '')), newVal);
            } else if (id.includes('-opt-')) {
                const parts = id.split('-opt-');
                handleOptionChange(parseInt(parts[0].replace('q-', '')), parseInt(parts[1]), newVal);
            }

            setTimeout(() => {
                element.focus();
                element.setSelectionRange(selectionStart + char.length, selectionStart + char.length);
                lastFocusedRef.current = { id, selectionStart: selectionStart + char.length };
            }, 0);
        }
    };

    const handleFocus = (e: any) => {
        lastFocusedRef.current = { id: e.target.id, selectionStart: e.target.selectionStart || 0 };
    };

  const addQuestion = () => {
    setQuestions([...questions, { 
        id: Date.now(), 
        text: "", 
        image: null, 
        options: ["", "", "", ""], 
        correctIndex: null 
    }]);
};

    const removeQuestion = (i: number) => {
        setQuestions(questions.filter((_, idx) => idx !== i));
    };

    const handleQuestionTextChange = (index: number, val: string) => {
        const newQs = [...questions];
        newQs[index].text = val;
        setQuestions(newQs);
    };

    const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
        const newQs = [...questions];
        newQs[qIndex].options[optIndex] = val;
        setQuestions(newQs);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-2 pb-40">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <BadgeQuestionMark className="text-blue-600" /> Yangi test yaratish
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="p-6 bg-emerald-50 border-emerald-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-emerald-900">Test nomi</label>
                            <input
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-2 border-emerald-200 p-2.5 rounded-xl focus:ring-2 ring-emerald-400 outline-none transition bg-white"
                                placeholder="Test nomini kiriting"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-emerald-900">Sinf</label>
                            <select
                                value={selectedGrade || ""} onChange={(e) => setSelectedGrade(Number(e.target.value))}
                                className="w-full border-2 border-emerald-200 p-2.5 rounded-xl focus:ring-2 ring-emerald-400 outline-none transition bg-white"
                            >
                                <option value="">Sinfni tanlang</option>
                                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Flatpickr
                            value={startTime || ""} onChange={([date]) => setStartTime(date)}
                            options={{ locale: Uzbek, enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true, disableMobile: true }}
                            className="w-full border-2 border-emerald-200 p-2.5 rounded-xl bg-white outline-none" placeholder="Boshlanish vaqti"
                        />
                        <Flatpickr
                            value={endTime || ""} onChange={([date]) => setEndTime(date)}
                            options={{ locale: Uzbek, enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true, disableMobile: true }}
                            className="w-full border-2 border-emerald-200 p-2.5 rounded-xl bg-white outline-none" placeholder="Tugash vaqti"
                        />
                    </div>
                </Card>

                {questions.map((q, qIndex) => (
                    <Card key={q.id} className={`p-6 space-y-4 relative border-2 transition-all ${invalidIndexes.includes(qIndex) ? "border-red-300 bg-red-50" : "border-slate-100 shadow-lg"}`}>
                        <div className="flex items-center justify-between m-0">
                            <span className="px-3 py-1 rounded-lg text-sm text-gray-300">{qIndex + 1}-savol</span>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setBankModal({ isOpen: true, targetIndex: qIndex })} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer">
                                    <Database className="w-5 h-5" />
                                </button>
                                {qIndex > 0 && (
                                    <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 cursor-pointer">
                                        <CircleX className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 m-0">
                            <textarea
                                id={`q-text-${qIndex}`} value={q.text} onFocus={handleFocus}
                                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-white min-h-[100px] text-lg focus:ring-2 ring-blue-300 outline-none transition resize-none"
                                placeholder="Savolni kiriting..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="space-y-3 md:col-span-2">
                                {q.options.map((opt: string, optIndex: number) => (
                                    <div key={optIndex} className="flex gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newQs = [...questions];
                                                newQs[qIndex].correctIndex = optIndex;
                                                setQuestions(newQs);
                                            }}
                                            className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${q.correctIndex === optIndex ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-300"}`}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <input
                                            id={`q-${qIndex}-opt-${optIndex}`} type="text" value={opt}
                                            onFocus={handleFocus} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                            className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 ring-blue-300 outline-none transition"
                                            placeholder={`${optIndex + 1}-variant`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="md:col-span-1">
                                <DropzoneWrapper onDrop={(files) => {
                                    const newQs = [...questions];
                                    newQs[qIndex].image = files[0];
                                    setQuestions(newQs);
                                }} image={q.image} />
                            </div>
                        </div>
                    </Card>
                ))}

                <div className="space-y-4 border-t pt-6">
                    {questions.length < 15 && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 self-start w-fit">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">Limit: {15 - questions.length} ta savol qoldi.</p>
                        </div>
                    )}
                    <div className="flex justify-between flex-wrap gap-4">
                        <Button type="button" onClick={addQuestion} variant="outline" className="h-14 px-6 border-slate-300 hover:border-blue-600 hover:text-blue-600 rounded-xl cursor-pointer flex items-center">
                            <Plus className="mr-2" size={20} /> Yangi savol
                        </Button>
                        <Button variant="default" type="submit" disabled={loading || questions.length < 15} className={`h-14 px-8 shadow-xl rounded-xl  flex items-center ${questions.length < 15 ? 'bg-slate-100 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 cursor-pointer text-white'}`}>
                            {loading ? <Loader className="animate-spin mr-2" /> : <HardDriveUpload className="mr-2" />}
                            Testni Yakunlash
                        </Button>
                    </div>
                </div>
            </form>

            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[60]">
                {isArabicPanelOpen && (
                    <Card className="p-3 shadow-2xl border-2 border-blue-100 max-w-[320px] bg-white/95 backdrop-blur mb-2">
                        <div className="flex flex-wrap gap-1 justify-center max-h-60 overflow-y-auto">
                            {arabicLetters.map((char, i) => (
                                <button
                                    key={i} type="button" onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => insertArabicChar(char)}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-lg cursor-pointer"
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    </Card>
                )}
                <Button onClick={() => setIsArabicPanelOpen(!isArabicPanelOpen)} variant="default" className="rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center cursor-pointer">
                    <Languages className="w-6 h-6" />
                </Button>
            </div>

            <QuestionBankModal 
                isOpen={bankModal.isOpen} 
                onClose={() => setBankModal({ isOpen: false, targetIndex: null })} 
                onSelect={(bankQ: any) => {
                    if (bankModal.targetIndex === null) return;
                    const newQs = [...questions];
                    newQs[bankModal.targetIndex] = {
                        ...newQs[bankModal.targetIndex],
                        text: bankQ.text,
                        options: bankQ.options.map((o: any) => o.text),
                        correctIndex: bankQ.options.findIndex((o: any) => o.isCorrect)
                    };
                    setQuestions(newQs);
                    setBankModal({ isOpen: false, targetIndex: null });
                }}
            />
        </div>
    );
}

function DropzoneWrapper({ onDrop, image }: { onDrop: (f: File[]) => void, image: File | null | undefined }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: false });
    return (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer h-[180px] flex flex-col items-center justify-center transition-all ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
            <input {...getInputProps()} />
            {image ? (
                <img src={URL.createObjectURL(image)} alt="preview" className="w-full h-full object-contain rounded-lg" />
            ) : (
                <div className="text-slate-400 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-medium text-slate-500">Rasm yuklash</p>
                </div>
            )}
        </div>
    );
}