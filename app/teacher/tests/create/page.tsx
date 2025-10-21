"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTeacherGrades, createTest } from "@/lib/axios";

interface Question {
  text: string;
  image?: File | null;
  options: string[];
  correctIndex: number | null;
}

export default function CreateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = Number(searchParams.get("subjectId")); // /teacher/tests/create?subjectId=12

  const [title, setTitle] = useState("");
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", image: null, options: ["", "", "", ""], correctIndex: null },
  ]);
  const [loading, setLoading] = useState(false);

  // 🔸 O‘qituvchining sinflarini olish
  useEffect(() => {
    getTeacherGrades()
      .then((res) => setGrades(res.data))
      .catch((err) => console.error(err));
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", image: null, options: ["", "", "", ""], correctIndex: null },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newQuestions = [...questions];
    newQuestions[index].image = file;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !subjectId || !startTime || !endTime || !questions.length) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }

    // 🔹 Ma'lumotlarni JSON shaklida yig‘amiz
    const payload = {
      title,
      subjectId,
      startTime,
      endTime,
      questions: questions.map((q, i) => ({
        text: q.text,
        imgKey: q.image ? `image_${i}` : null,
        options: q.options.map((opt, idx) => ({
          text: opt,
          isCorrect: q.correctIndex === idx,
        })),
      })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    // 🔹 Rasmlarni qo‘shish
    questions.forEach((q, i) => {
      if (q.image) {
        formData.append(`image_${i}`, q.image);
      }
    });

    try {
      setLoading(true);
      await createTest(formData);
      alert("✅ Test muvaffaqiyatli yaratildi!");
      router.push(`/teacher`);
    } catch (err) {
      console.error("❌ Test yaratishda xatolik:", err);
      alert("❌ Testni yaratishda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🧩 Yangi test yaratish</h1>

      {!subjectId && (
        <p className="text-red-600 font-semibold">
          ⚠️ Fan identifikatori topilmadi. Fan sahifasidan kirganingizga ishonch hosil qiling.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test nomi */}
        <div>
          <label className="block font-medium mb-1">Test nomi:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Masalan: 7-sinf Informatika 1-test"
          />
        </div>

        {/* Sinf tanlash */}
        <div>
          <label className="block font-medium mb-1">Sinf:</label>
          <select
            value={selectedGrade || ""}
            onChange={(e) => setSelectedGrade(Number(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Tanlang</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Boshlanish / Tugash vaqtlarini tanlash */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Boshlanish vaqti:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tugash vaqti:</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        {/* Savollar bo‘limi */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Savol {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:underline"
                  >
                    O‘chirish
                  </button>
                )}
              </div>

              <input
                type="text"
                value={q.text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].text = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full border p-2 rounded-lg mb-3"
                placeholder="Savol matni..."
              />

              {/* Rasm yuklash */}
              <div className="mb-3">
                <label className="block font-medium mb-1">Rasm (ixtiyoriy):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(qIndex, e.target.files?.[0] || null)
                  }
                />
                {q.image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Yuklangan fayl: {q.image.name}
                  </p>
                )}
              </div>

              {/* Variantlar */}
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center mb-2 gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctIndex === optIndex}
                    onChange={() => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].correctIndex = optIndex;
                      setQuestions(newQuestions);
                    }}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].options[optIndex] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className="flex-1 border p-2 rounded-lg"
                    placeholder={`Variant ${optIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            ➕ Yangi savol qo‘shish
          </button>
        </div>

        {/* Saqlash tugmasi */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Saqlanmoqda..." : "💾 Testni saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}
