"use client";

import { useParams, useRouter } from "next/navigation";

export default function TeacherSubjectPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fan ID: {id}</h1>
      <button
        onClick={() => router.push(`/teacher/subject/${id}/tests`)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        📋 Testlar ro‘yxati
      </button>
    </div>
  );
}
