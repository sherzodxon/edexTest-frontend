"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestsBySubject } from "@/lib/axios";

export default function SubjectTestsPage() {
  const { id } = useParams();
  const [tests, setTests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getTestsBySubject(Number(id))
        .then((res) => setTests(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">📝 Testlar ro‘yxati</h1>
        <button
          onClick={() => router.push(`/teacher/subject/${id}/tests/create`)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Yangi test
        </button>
      </div>

      {tests.length === 0 ? (
        <p>Hozircha testlar yo‘q.</p>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{test.title}</h2>
                <p className="text-sm text-gray-500">
                  Savollar soni: {test.questionCount || 0}
                </p>
              </div>
              <button
                onClick={() =>
                  router.push(`/teacher/subject/${id}/tests/${test.id}`)
                }
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                👁 Ko‘rish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
