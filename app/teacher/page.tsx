"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTeacherGrades,
  getTeacherSubjects,
  getStudentsByGrade,
  getTestsBySubject,
} from "@/lib/axios";
import Link from "next/link";

export default function TeacherDashboard() {
  const router = useRouter();

  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 O‘qituvchining sinflari va fanlarini olish
  useEffect(() => {
    async function loadData() {
      try {
        const [gradesRes, subjectsRes] = await Promise.all([
          getTeacherGrades(),
          getTeacherSubjects(),
        ]);
        setGrades(gradesRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error("Ma’lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🔹 SINF tanlanganda o‘quvchilarni yuklash
  const handleSelectGrade = async (gradeId: number) => {
    setSelectedGrade(gradeId);
    setSelectedSubject(null);
    setTests([]);
    try {
      const res = await getStudentsByGrade(gradeId);
      setStudents(res.data);
    } catch (err) {
      console.error("O‘quvchilarni olishda xatolik:", err);
    }
  };

  // 🔹 FAN tanlanganda testlarni yuklash
  const handleSelectSubject = async (subjectId: number) => {
    setSelectedSubject(subjectId);
    try {
      const res = await getTestsBySubject(subjectId);
      setTests(res.data);
    } catch (err) {
      console.error("Testlarni olishda xatolik:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 text-center">Yuklanmoqda...</div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        👨‍🏫 O‘qituvchi paneli
      </h1>

      {/* 🔹 SINFLAR RO‘YXATI */}
      <div>
        <h2 className="text-lg font-semibold mb-3">🎓 Mening sinflarim</h2>
        {grades.length === 0 ? (
          <p className="text-gray-500">Sizga biriktirilgan sinflar yo‘q.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {grades.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGrade(g.id)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedGrade === g.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 O‘QUVCHILAR RO‘YXATI */}
      {selectedGrade && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">
            {grades.find((g) => g.id === selectedGrade)?.name} sinf o‘quvchilari:
          </h3>
          {students.length === 0 ? (
            <p className="text-gray-500">Bu sinfda o‘quvchilar topilmadi.</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {students.map((s) => (
                <li key={s.id} className="border p-2 rounded-md text-sm">
                  {s.surname} {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 🔹 FANLAR RO‘YXATI */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📚 Mening fanlarim</h2>
        {subjects.length === 0 ? (
          <p className="text-gray-500">Sizga biriktirilgan fanlar yo‘q.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSubject(s.id)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedSubject === s.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {s.name} ({s.grade.name})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 FAN TESTLARI */}
      {selectedSubject && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              {subjects.find((s) => s.id === selectedSubject)?.name} fanidagi testlar:
            </h3>
            <button
              onClick={() => router.push(`/teacher/tests/create?subjectId=${selectedSubject}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
            >
              ➕ Yangi test yaratish
            </button>
          </div>

          {tests.length === 0 ? (
            <p className="text-gray-500">Bu fan uchun hali test yaratilmagan.</p>
          ) : (
            <ul className="space-y-3">
  {tests.map((t) => (
    <li
      key={t.id}
      className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50"
    >
      <Link href={`/teacher/tests/${t.id}`} className="flex-1">
        <p className="font-medium hover:underline">{t.title}</p>
        <p className="text-sm text-gray-500">
          {new Date(t.createdAt).toLocaleDateString()}
        </p>
      </Link>

      <Link
        href={`/teacher/tests/${t.id}/results`}
        className="text-blue-600 hover:underline"
      >
        Natijalar →
      </Link>
    </li>
  ))}
</ul>
          )}
        </div>
      )}
    </div>
  );
}
