"use client";

import {useEffect, useState, useCallback, useRef} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useDropzone} from "react-dropzone";
import {getTeacherGrades, createTest} from "@/lib/axios";
import "katex/dist/katex.min.css";
import "mathlive";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import {CustomLocale} from "flatpickr/dist/types/locale";
import {
    Upload,
    CircleX,
    BadgeQuestionMark,
    Plus,
    Loader,
    HardDriveUpload,
    Languages,
    CheckLine
} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import toast from "react-hot-toast";

const Uzbek : CustomLocale = {
    weekdays: {
        shorthand: [
            "Yak",
            "Du",
            "Se",
            "Ch",
            "Pa",
            "Ju",
            "Sh"
        ],
        longhand: [
            "Yakshanba",
            "Dushanba",
            "Seshanba",
            "Chorshanba",
            "Payshanba",
            "Juma",
            "Shanba"
        ]
    },
    months: {
        shorthand: [
            "Yan",
            "Fev",
            "Mar",
            "Apr",
            "May",
            "Iyn",
            "Iyl",
            "Avg",
            "Sen",
            "Okt",
            "Noy",
            "Dek"
        ],
        longhand: [
            "Yanvar",
            "Fevral",
            "Mart",
            "Aprel",
            "May",
            "Iyun",
            "Iyul",
            "Avgust",
            "Sentabr",
            "Oktabr",
            "Noyabr",
            "Dekabr"
        ]
    },
    firstDayOfWeek: 1,
    rangeSeparator: " dan ",
    time_24hr: true
};

interface Question {
    text : string;
    image?: File | null;
    options : string[];
    correctIndex : number | null;
}

export default function CreateTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectId = Number(searchParams.get("subjectId"));

    const [title,
        setTitle] = useState("");
    const [grades,
        setGrades] = useState < any[] > ([]);
    const [selectedGrade,
        setSelectedGrade] = useState < number | null > (null);
    const [startTime,
        setStartTime] = useState < Date | undefined > (undefined);
    const [endTime,
        setEndTime] = useState < Date | undefined > (undefined);

    const [questions,
        setQuestions] = useState < Question[] > ([
        {
            text: "",
            image: null,
            options: [
                "", "", "", ""
            ],
            correctIndex: null
        }
    ]);
    const [invalidIndexes,
        setInvalidIndexes] = useState < number[] > ([]);
    const [loading,
        setLoading] = useState(false);

    const mathRefs = useRef < Record < string,
        any >> ({});
    const [focusedField,
        setFocusedField] = useState < string | null > (null);

    const [isArabicPanelOpen,
        setIsArabicPanelOpen] = useState(false);

   const arabicKeyboard = [
    // Asosiy 28 ta harf
    "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش",
    "ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي",

    // Qo‘shimcha harf shakllari
    "أ","إ","آ","ؤ","ئ","ء","ة","ٱ","لا",

    // Harakatlar (diakritik belgilar)
    "َ","ُ","ِ",
    "ً","ٌ","ٍ",
    "ْ","ّ","ٰ","ٓ",

    // Maxsus belgilar
    "؟","،","؛","ـ",

    // Sharq arab raqamlari
    "٠","١","٢","٣","٤","٥","٦","٧","٨","٩"
];

    const flatpickrOptions = {
        locale: Uzbek,
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        disableMobile: true,
        minDate: "today",
        maxDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d;
        })()
    };

    useEffect(() => {
        getTeacherGrades().then((res) => setGrades(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") 
            return;
        
        requestAnimationFrame(() => {
            questions.forEach((q, qIndex) => {
                const qId = `mathfield-${qIndex}`;
                const el = document.getElementById(qId);
                if (el && !el.querySelector("math-field")) {
                    const mf = new(window as any).MathfieldElement();
                    mf.className = "w-full border rounded-lg px-3 py-2 bg-white min-h-[60px] text-lg focus-within:ri" +
                            "ng-2 ring-blue-300 transition";
                    mf.value = q.text || "";
                    mf.placeholder = "Savol formulasi yoki matnni kiriting...";
                    mf.addEventListener("input", () => {
                        const newQs = [...questions];
                        newQs[qIndex].text = mf.getValue("latex");
                        setQuestions(newQs);
                    });
                    mf.addEventListener("focus", () => setFocusedField(`q-${qIndex}`));
                    mf.addEventListener("blur", () => setFocusedField(null));
                    el.appendChild(mf);
                    mathRefs.current[`q-${qIndex}`] = mf;
                }

                q
                    .options
                    .forEach((_, optIndex) => {
                        const optId = `mathfield-${qIndex}-opt-${optIndex}`;
                        const optEl = document.getElementById(optId);
                        if (optEl && !optEl.querySelector("math-field")) {
                            const mfOpt = new(window as any).MathfieldElement();
                            mfOpt.className = "w-full border rounded-lg px-3 py-1 bg-white min-h-[40px] focus-within:ring-2 rin" +
                                    "g-blue-300 transition";
                            mfOpt.value = q.options[optIndex] || "";
                            mfOpt.placeholder = `Variant ${optIndex + 1}`;
                            mfOpt.addEventListener("input", () => {
                                const newQs = [...questions];
                                newQs[qIndex].options[optIndex] = mfOpt.getValue("latex");
                                setQuestions(newQs);
                            });
                            mfOpt.addEventListener("focus", () => setFocusedField(`q-${qIndex}-opt-${optIndex}`));
                            mfOpt.addEventListener("blur", () => setFocusedField(null));
                            optEl.appendChild(mfOpt);
                            mathRefs.current[`q-${qIndex}-opt-${optIndex}`] = mfOpt;
                        }
                    });
            });
        });
    }, [questions]);

    const onDrop = useCallback((acceptedFiles : File[], index : number) => {
        const newQs = [...questions];
        newQs[index].image = acceptedFiles[0];
        setQuestions(newQs);
    }, [questions]);

    const Dropzone = ({qIndex, q} : {
        qIndex: number;
        q: Question
    }) => {
        const {getRootProps, getInputProps} = useDropzone({
            onDrop: (files) => onDrop(files, qIndex),
            accept: {
                "image/*": []
            },
            multiple: false
        });
        return (
            <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition">
                <input {...getInputProps()}/> {q.image
                    ? (
                        <div className="flex flex-col items-center">
                            <img
                                src={URL.createObjectURL(q.image)}
                                alt="preview"
                                className="w-32 h-32 object-cover rounded-md"/>
                            <span className="text-gray-500 text-sm mt-2">{q.image.name}</span>
                        </div>
                    )
                    : (
                        <div className="flex flex-col items-center text-gray-600">
                            <Upload className="w-8 h-8 mb-2 text-blue-500"/>
                            <p className="text-xs text-gray-400">(bosing yoki tashlang)</p>
                        </div>
                    )}
            </div>
        );
    };

    const addQuestion = () => setQuestions([
        ...questions, {
            text: "",
            image: null,
            options: [
                "", "", "", ""
            ],
            correctIndex: null
        }
    ]);
    const removeQuestion = (i : number) => setQuestions(questions.filter((_, idx) => idx !== i));

    const validate = () => {
        const invalids : number[] = [];
        questions.forEach((q, i) => {
            if (!q.text.trim() || q.correctIndex === null) 
                invalids.push(i);
            }
        );
        setInvalidIndexes(invalids);
        return invalids.length === 0;
    };

    const handleSubmit = async(e : React.FormEvent) => {
        e.preventDefault();
        if (!title || !subjectId || !startTime || !endTime) {
            toast.error("Barcha maydonlarni to'ldiring!")
            return;
        }
        if (!validate()) {
            toast.error("Har bir savolda matn va to'g'ri javob bo'lishi shart!")
            return;
        }

        const payload = {
            title,
            subjectId,
            startTime,
            endTime,
            questions: questions.map((q, i) => ({
                text: q.text,
                imgKey: q.image
                    ? `image_${i}`
                    : null,
                options: q
                    .options
                    .map((opt, idx) => ({
                        text: opt,
                        isCorrect: q.correctIndex === idx
                    }))
            }))
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        questions.forEach((q, i) => {
            if (q.image) 
                formData.append(`image_${i}`, q.image);
            }
        );

        try {
            setLoading(true);
            await createTest(formData);
            toast.success("Test yaratildi!")
            router.push(`/teacher`);
        } catch (err) {
            console.error(err);
            toast.error("Xatolik yuz berdi!")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-32">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BadgeQuestionMark/>
                Yangi test yaratish
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-4 space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border p-2 rounded-lg"
                        placeholder="Test nomi"/>
                    <select
                        value={selectedGrade || ""}
                        onChange={(e) => setSelectedGrade(Number(e.target.value))}
                        required
                        className="w-full border p-2 rounded-lg">
                        <option value="" disabled>
                            Sinf tanlang
                        </option>
                        {grades.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Flatpickr
                           value={startTime ? [startTime] : []}
                            onChange={(date) => setStartTime(date[0])}
                            options={{
                            ...flatpickrOptions,
                            maxDate: endTime
                        }}
                            className="w-full border p-2 rounded-lg"
                            placeholder="Boshlanish vaqtini tanlang"/>

                        <Flatpickr
                              value={endTime ? [endTime] : []}
                            onChange={(date) => setEndTime(date[0])}
                            options={{
                            ...flatpickrOptions,
                            minDate: startTime || "today"
                        }}
                            className="w-full border p-2 rounded-lg"
                            placeholder="Tugash vaqtini tanlang"/>

                    </div>

                </Card>
                {questions.map((q, qIndex) => (
                    <Card
                        key={qIndex}
                        className={`p-4 space-y-4 relative ${invalidIndexes.includes(qIndex)
                        ? "border-red-400"
                        : ""}`}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Savol {qIndex + 1}</h3>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-red-500 hover:underline">
                                    <CircleX/>
                                </button>
                            )}
                        </div>

                        <div id={`mathfield-${qIndex}`} className="mt-2"></div>

                        <Dropzone qIndex={qIndex} q={q}/>
                        <div className="space-y-2">
                            {q
                                .options
                                .map((_, optIndex) => (
                                    <div key={optIndex} className="relative border rounded-lg p-2 bg-gray-50">

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                className="sr-only"
                                                name={`correct-${qIndex}`}
                                                checked={q.correctIndex === optIndex}
                                                required
                                                onChange={() => {
                                                const newQs = [...questions];
                                                newQs[qIndex].correctIndex = optIndex;
                                                setQuestions(newQs);
                                            }}/>
                                            <span
                                                className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-colors ${q.correctIndex === optIndex
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-gray-300 bg-white"}`}>
                                                {q.correctIndex === optIndex && (<CheckLine className="w-3 h-3 text-white"/>)}
                                            </span>
                                            <span className="select-none">Variant {optIndex + 1}</span>
                                        </label>

                                        <div id={`mathfield-${qIndex}-opt-${optIndex}`} className="mt-2"></div>
                                    </div>
                                ))}
                        </div>
                    </Card>
                ))}

                <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    className="ml-auto flex items-center gap-2">
                    <Plus/>
                    Yangi savol qo'shish
                </Button>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-yellow-600 cursor-pointer p-2 px-4 mx-auto rounded-lg border flex items-center gap-2">
                        {loading
                            ? <Loader/>
                            : <HardDriveUpload/>}
                        {loading
                            ? "Saqlanmoqda..."
                            : "Saqlash"}
                    </button>
                </div>
            </form>

            <button
                type="button"
                onClick={() => setIsArabicPanelOpen(!isArabicPanelOpen)}
                className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 z-50 flex items-center gap-2  cursor-pointer">
                <Languages className="w-4 h-4"/> {isArabicPanelOpen
                    ? "Yopish"
                    : "Ochish"}
            </button>

            {isArabicPanelOpen && (
                <div
                    className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white border rounded-lg shadow-xl p-2 flex flex-wrap gap-2 z-50">
                    {arabicKeyboard.map((l, i) => (
                        <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                            if (!focusedField) 
                                return;
                            const mf = mathRefs.current[focusedField];
                            if (mf && mf.insert) {
                                mf.insert(l);
                                mf.focus();
                            }
                        }}
                            className="px-3 py-1 bg-gray-200 hover:bg-blue-300 rounded text-lg cursor-pointer">
                            {l}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
