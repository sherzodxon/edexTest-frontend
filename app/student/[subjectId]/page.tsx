"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function SubjectTestsPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubject() {
      try {
        setLoading(true);
        const res = await api.get(`/subjects/${subjectId}/tests`);
        setSubject(res.data);
      } catch (err: any) {
        console.error(err);
        setError("Fan ma'lumotlarini olishda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    }

    if (subjectId) loadSubject();
  }, [subjectId]);

  if (loading) {
    return <div className="p-8 text-gray-500 text-center">⏳ Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  if (!subject) {
    return <div className="p-8 text-gray-500 text-center">Fan topilmadi.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        📘 {subject.name} ({subject.grade.name})
      </h1>

      {subject.tests.length === 0 ? (
        <p className="text-gray-500">Bu fan uchun hali testlar mavjud emas.</p>
      ) : (
        <ul className="space-y-4">
          {subject.tests.map((test: any) => (
            <li
              key={test.id}
              className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-800">{test.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(test.createdAt).toLocaleDateString()}
                </p>

                {/* Agar test tugagan bo‘lsa, natijani ko‘rsatamiz */}
                {test.userTests?.length > 0 && test.userTests[0].finished && (
                  <p className="mt-1 text-sm text-green-600">
                    ✅ Natija: {test.userTests[0].score} ball
                  </p>
                )}
              </div>

              <div>
                {test.userTests?.length > 0 && test.userTests[0].finished ? (
                  <button
                    onClick={() =>
                      router.push(`/student/tests/${test.id}/result`)
                    }
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  >
                    📊 Natijani ko‘rish
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/student/tests/${test.id}`)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    🚀 Testni boshlash
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
