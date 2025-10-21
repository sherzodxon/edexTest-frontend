"use client";

import { useEffect, useState } from "react";
import { getStudentsByGrade } from "@/lib/axios";

interface Student {
  id: number;
  name: string;
  surname: string;
  username: string;
}

export default function GradeStudents({ gradeId }: { gradeId: number }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const { data } = await getStudentsByGrade(gradeId);
        setStudents(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [gradeId]);

  if (loading) return <div className="p-4">⏳ Yuklanmoqda...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">📋 O‘quvchilar ro‘yxati</h2>
      {students.length === 0 ? (
        <p>Sinfda hali o‘quvchilar mavjud emas.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Ism</th>
              <th className="py-2 px-3 text-left">Familiya</th>
              <th className="py-2 px-3 text-left">Login</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3">{idx + 1}</td>
                <td className="py-2 px-3">{s.name}</td>
                <td className="py-2 px-3">{s.surname}</td>
                <td className="py-2 px-3">{s.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
