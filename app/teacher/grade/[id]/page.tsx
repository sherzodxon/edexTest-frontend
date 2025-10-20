"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSubjectsByGrade } from "@/lib/axios";

export default function TeacherGradePage() {
  const { id } = useParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getSubjectsByGrade(Number(id))
        .then((res) => setSubjects(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Fanlar ro‘yxati</h1>
      {subjects.length === 0 ? (
        <p>Bu sinfda hali fanlar yo‘q.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="border p-4 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/teacher/subject/${subject.id}`)}
            >
              <h2 className="font-semibold">{subject.name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
