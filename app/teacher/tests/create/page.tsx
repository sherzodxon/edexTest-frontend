"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { getTeacherGrades, createTest } from "@/lib/axios";
import "katex/dist/katex.min.css";
import "mathlive";
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
    CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

    const mathRefs = useRef<Record<string, any>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isArabicPanelOpen, setIsArabicPanelOpen] = useState(false);
    
    const [questions, setQuestions] = useState<Question[]>([
        { id: Math.random(), text: "", image: null, options: ["", "", "", ""], correctIndex: null }
    ]);

    const arabicLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ة", "ٱ", "لا", "َ", "ُ", "ِ", "ً", "ٌ", "ٍ", "ْ", "ّ", "ٰ", "ٓ", "؟", "،", "؛", "ـ", "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    useEffect(() => {
        getTeacherGrades().then((res) => setGrades(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        questions.forEach((q, qIndex) => {
            const syncField = (id: string, ref: string, value: string, isOption = false, optIdx = 0) => {
                const el = document.getElementById(id);
                if (!el) return;
                let mf = el.querySelector("math-field") as any;
                if (!mf) {
                    mf = document.createElement("math-field") as any;
                    mf.className = isOption 
                        ? "w-full border rounded-lg px-3 py-1 bg-white min-h-[40px] focus-within:ring-2 ring-blue-300 transition"
                        : "w-full border rounded-lg px-3 py-2 bg-white min-h-[60px] text-lg focus-within:ring-2 ring-blue-300 transition";
                    
                    mf.defaultMode = "text"; 
                    
                    mf.addEventListener("input", (e: any) => {
                        const val = e.target.getValue();
                        setQuestions(prev => {
                            const newQs = [...prev];
                            if (newQs[qIndex]) {
                                if (isOption) newQs[qIndex].options[optIdx] = val;
                                else newQs[qIndex].text = val;
                            }
                            return newQs;
                        });
                    });
                    mf.addEventListener("focus", () => setFocusedField(ref));
                    mf.addEventListener("blur", () => setFocusedField(null));
                    el.appendChild(mf);
                    mathRefs.current[ref] = mf;
                }
            };

            syncField(`mathfield-${qIndex}`, `q-${qIndex}`, q.text);
            q.options.forEach((opt, oIdx) => {
                syncField(`mathfield-${qIndex}-opt-${oIdx}`, `q-${qIndex}-opt-${oIdx}`, opt, true, oIdx);
            });
        });
    }, [questions.length]);

    const addQuestion = () => {
        setQuestions([...questions, { id: Math.random(), text: "", image: null, options: ["", "", "", ""], correctIndex: null }]);
    };

    const removeQuestion = (i: number) => {
        setQuestions(questions.filter((_, idx) => idx !== i));
    };

    const validate = () => {
        const invalids: number[] = [];
        let error = "";
        
        if (!title.trim()) error = "Test nomini kiriting!";
        else if (!selectedGrade) error = "Sinfni tanlang!";
        else if (!startTime || !endTime) error = "Vaqtlarni belgilang!";
        else if (startTime >= endTime) error = "Tugash vaqti boshlanishidan keyin bo'lishi kerak!";

        if (error) { toast.error(error); return false; }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Bo'sh savol matni
            if (!q.text.trim()) {
                invalids.push(i);
                toast.error(`${i + 1}-savol matni bo'sh!`);
                setInvalidIndexes(invalids);
                return false;
            }

            // Javob variantlari soni va bo'shligi
            const filledOptions = q.options.filter(opt => opt.trim() !== "");
            if (filledOptions.length < 4) {
                invalids.push(i);
                toast.error(`${i + 1}-savolda barcha variantlarni to'ldiring!`);
                setInvalidIndexes(invalids);
                return false;
            }

            // --- Bir xil javoblarni tekshirish ---
            const uniqueOptions = new Set(q.options.map(o => o.trim().toLowerCase()));
            if (uniqueOptions.size < q.options.length) {
                invalids.push(i);
                toast.error(`${i + 1}-savolda bir xil javob variantlari bor!`);
                setInvalidIndexes(invalids);
                return false;
            }

            // To'g'ri javob tanlanganligi
            if (q.correctIndex === null) {
                invalids.push(i);
                toast.error(`${i + 1}-savolda to'g'ri javob tanlanmagan!`);
                setInvalidIndexes(invalids);
                return false;
            }
        }

        setInvalidIndexes([]);
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
                    options: q.options.map((opt, idx) => ({ text: opt, isCorrect: q.correctIndex === idx }))
                }))
            };
            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            questions.forEach((q, i) => { if (q.image) formData.append(`image_${i}`, q.image); });
            
            await createTest(formData);
            toast.success("Test muvaffaqiyatli yaratildi!");
            // Siz yuborgan yo'nalishga push qilindi:
            router.push(`/teacher`);
        } catch (err) {
            toast.error("Saqlashda xatolik yuz berdi!");
        } finally { setLoading(false); }
    };

    const onDrop = useCallback((acceptedFiles: File[], index: number) => {
        const newQs = [...questions];
        newQs[index].image = acceptedFiles[0];
        setQuestions(newQs);
    }, [questions]);

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-2 pb-40">
            {/* Header va Form qolgan qismlari o'zgarmasdan saqlandi */}
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <BadgeQuestionMark className="text-blue-600" /> Yangi test yaratish
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Card (Title, Grade, Time) */}
                <Card className="p-6 bg-emerald-50 border-emerald-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-emerald-900">Test nomi</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-2 border-emerald-200 p-2.5 rounded-xl focus:ring-2 ring-emerald-400 outline-none transition bg-white"
                                placeholder="Test nomini kiriting"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-emerald-900">Sinf</label>
                            <select
                                value={selectedGrade || ""}
                                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                                className="w-full border-2 border-emerald-200 p-2.5 rounded-xl focus:ring-2 ring-emerald-400 outline-none transition bg-white"
                            >
                                <option value="">Sinfni tanlang</option>
                                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Flatpickr
                            value={startTime || ""}
                            onChange={([date]) => setStartTime(date)}
                            options={{ locale: Uzbek, enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true, disableMobile: true }}
                            className="w-full border-2 border-emerald-200 p-2.5 rounded-xl bg-white outline-none"
                            placeholder="Boshlanish vaqti"
                        />
                        <Flatpickr
                            value={endTime || ""}
                            onChange={([date]) => setEndTime(date)}
                            options={{ locale: Uzbek, enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true, disableMobile: true, minDate: startTime || "today" }}
                            className="w-full border-2 border-emerald-200 p-2.5 rounded-xl bg-white outline-none"
                            placeholder="Tugash vaqti"
                        />
                    </div>
                </Card>

                {/* Questions List */}
                {questions.map((q, qIndex) => (
                    <Card key={q.id} className={`p-6 space-y-4 relative border-2 transition-all ${invalidIndexes.includes(qIndex) ? "border-red-300 bg-red-50" : "border-slate-100 shadow-lg"}`}>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-bold text-slate-700">Savol {qIndex + 1}</span>
                            {qIndex > 0 && (
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                                    <CircleX className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-600 font-medium">Savol matni va formulasi</label>
                            <div id={`mathfield-${qIndex}`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm text-slate-600 font-medium">Javob variantlari</label>
                                {q.options.map((_, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newQs = [...questions];
                                                newQs[qIndex].correctIndex = optIndex;
                                                setQuestions(newQs);
                                            }}
                                            className={`p-2 cursor-pointer rounded-lg border-2 transition-all ${q.correctIndex === optIndex ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-slate-200 text-slate-300 hover:border-blue-300"}`}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <div id={`mathfield-${qIndex}-opt-${optIndex}`} className="flex-1" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 md:col-span-1">
                                <label className="text-sm text-slate-600 font-medium">Rasm qo'shish (ixtiyoriy)</label>
                                <DropzoneWrapper onDrop={(files) => onDrop(files, qIndex)} image={q.image} />
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Submit Buttons */}
                <div className="flex justify-between  sm:flex-row gap-4">
                    <Button 
                        type="button" 
                        onClick={addQuestion} 
                        variant="outline" 
                        className="flex items-center justify-center cursor-pointer h-14 border border-slate-300 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 text-slate-600 transition-all "
                    >
                        <Plus className="mr-2" /> Yangi savol qo'shish
                    </Button>

                    <Button 
                        variant="default" 
                        type="submit" 
                        disabled={loading} 
                        className="flex items-center cursor-pointer h-14 justify-center bg-amber-500 hover:bg-amber-600 text-white shadow-xl transition-all"
                    >
                        {loading ? <Loader className="animate-spin mr-2" /> : <HardDriveUpload className="mr-2" />}
                        {loading ? "Saqlanmoqda..." : "Testni Saqlash"}
                    </Button>
                </div>
            </form>

            {/* Arabic Keyboard */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[60]">
                {isArabicPanelOpen && (
                    <Card className="p-3 shadow-2xl border-2 border-blue-100 max-w-[90vw] bg-white/95 backdrop-blur mb-2">
                        <div className="flex flex-wrap gap-1.5 justify-center max-h-60 overflow-y-auto p-1">
                            {arabicLetters.map((char, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        if (!focusedField) return;
                                        const mf = mathRefs.current[focusedField];
                                        if (mf) { mf.insert(char); mf.focus(); }
                                    }}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-xl"
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    </Card>
                )}
                <Button 
                    variant="default" 
                    onClick={() => setIsArabicPanelOpen(!isArabicPanelOpen)} 
                    className="rounded-full cursor-pointer shadow-2xl bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center"
                >
                    <Languages className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}

function DropzoneWrapper({ onDrop, image }: { onDrop: (f: File[]) => void, image: File | null | undefined }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { "image/*": [] }, 
        multiple: false 
    });

    return (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all h-[180px] flex flex-col items-center justify-center ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
            <input {...getInputProps()} />
            {image ? (
                <div className="relative w-full h-full">
                    <img src={URL.createObjectURL(image)} alt="preview" className="w-full h-full object-contain rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs rounded-lg transition-opacity">
                        Rasmni almashtirish
                    </div>
                </div>
            ) : (
                <div className="text-slate-400">
                    <Upload className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium text-slate-600">Rasmni yuklang</p>
                </div>
            )}
        </div>
    );
}