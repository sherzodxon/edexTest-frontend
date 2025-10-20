"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import  api  from "../../lib/axios";

export default function StudentPage() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    api.get("/subjects").then((res) => setSubjects(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📘 Mening fanlarim</h1>
      <ul className="space-y-2">
        {subjects.map((subj) => (
          <li key={subj.id}>
            <Link
              href={`/student/${subj.id}`}
              className="block p-3 bg-green-500 text-white rounded"
            >
              {subj.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
