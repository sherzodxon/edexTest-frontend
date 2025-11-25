"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import { ClockArrowDown, LibraryBig } from "lucide-react";

export default function StudentPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (!parsedUser?.gradeId) {
      setError("Foydalanuvchi sinfi aniqlanmadi.");
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/subjects/grade/${parsedUser.gradeId}`);
        setSubjects(res.data);
      } catch (err: any) {
        console.error(err);
        setError("Fanlarni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [router]);

  if (loading)
    return <div className="p-6 text-gray-500 flex gap-2 items-center"> <ClockArrowDown /> Yuklanmoqda...</div>;

  if (error)
    return <div className="p-6 text-red-600 font-semibold">⚠️ {error}</div>;

  if (!user)
    return <div className="p-6 text-gray-500">Foydalanuvchi topilmadi.</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 flex gap-2">
          Mening fanlarim
        </h2>
     

      {/* 🔹 Asosiy qism */}
      <main className="mt-6">
        {subjects.length === 0 ? (
          <div className="text-gray-600">
            Sizga biriktirilgan fanlar mavjud emas.
          </div>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subj) => (
              <li key={subj.id}>
                <Link
                  href={`/student/${subj.id}`}
                  className="flex gap-2 block p-3 bg-green-500 hover:bg-green-600 transition text-white rounded-lg shadow"
                >    <LibraryBig /> 
                  {subj.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
