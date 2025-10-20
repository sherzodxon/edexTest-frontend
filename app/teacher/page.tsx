"use client";

import { useEffect, useState } from "react";
import {
  getTeacherGrades,
  getTeacherSubjects,
  getStudentsByGrade,
} from "@/lib/axios";

interface Grade {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  grade: { id: number; name: string };
}

interface Student {
  id: number;
  name: string;
  surname: string;
  username?: string;
}

export default function TeacherDashboardPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTeacherGrades();
        setGrades(res.data);
      } catch (err) {
        console.error("Grade olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectGrade = async (gradeId: number) => {
    setSelectedGrade(gradeId);
    try {
      // Fanlar teacherga qarab olinadi
      const subjectRes = await getTeacherSubjects();
      const filteredSubjects = subjectRes.data.filter(
        (s: Subject) => s.grade.id === gradeId
      );
      setSubjects(filteredSubjects);

      // O‘quvchilarni sinf bo‘yicha olish
      const studentsRes = await getStudentsByGrade(gradeId);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Ma'lumot olishda xatolik:", err);
    }
  };

  if (loading) return <div className="p-4">Yuklanmoqda...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">📚 Teacher Dashboard</h1>

      {/* Sinflar ro‘yxati */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Mening sinflarim</h2>
        <div className="flex gap-2 flex-wrap">
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => handleSelectGrade(grade.id)}
              className={`px-4 py-2 rounded-lg border transition ${
                selectedGrade === grade.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fanlar ro‘yxati */}
      {selectedGrade && (
        <div>
          <h2 className="text-xl font-semibold mb-2">📖 Fanlar</h2>
          {subjects.length === 0 ? (
            <p>Fanlar topilmadi</p>
          ) : (
            <ul className="list-disc ml-5">
              {subjects.map((subject) => (
                <li key={subject.id}>{subject.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* O‘quvchilar ro‘yxati */}
      {selectedGrade && (
        <div>
          <h2 className="text-xl font-semibold mb-2">👨‍🎓 O‘quvchilar</h2>
          {students.length === 0 ? (
            <p>Bu sinfda hozircha o‘quvchi yo‘q</p>
          ) : (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">#</th>
                  <th className="border px-3 py-2 text-left">Ism</th>
                  <th className="border px-3 py-2 text-left">Familiya</th>
                  <th className="border px-3 py-2 text-left">Login</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="border px-3 py-2">{idx + 1}</td>
                    <td className="border px-3 py-2">{s.name}</td>
                    <td className="border px-3 py-2">{s.surname}</td>
                    <td className="border px-3 py-2">{s.username ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
