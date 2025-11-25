"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { logout } from "@/store/authSlice";
import {  ClockArrowDown, GraduationCapIcon, LogOut } from "lucide-react";
import EdexLogo from "@/components/ui/logo";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [user, setUser] = useState<any>(reduxUser || null);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!reduxUser && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Userni localStorage'dan o'qishda xato:", e);
        router.replace("/login");
      }
    } else {
      setUser(reduxUser);
    }
  }, [reduxUser, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      if (user.role !== "TEACHER") {
        if (user.role === "ADMIN") router.replace("/admin");
        if (user.role === "STUDENT") router.replace("/student");
        return;
      }

      try {
        const res = await api.get("/grades/my");
        setGrades(res.data);
      } catch (err) {
        console.error("O'qituvchi sinflarini olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500flex gap-2 items-center"> <ClockArrowDown /> Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg border-r p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Link href="/teacher" className="text-xl font-bold text-green-600 flex gap-2 items-center">
           <EdexLogo className="w-10 h-10"/>EdEx
        </Link>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-2">
          {grades.length === 0 ? (
            <p className="text-gray-500 text-sm">Sizga sinf biriktirilmagan.</p>
          ) : (
            grades.map((grade) => (
              <Link
                key={grade.id}
                href={`/teacher/grade/${grade.id}`}
                className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${
                  pathname.includes(`/grade/${grade.id}`)
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              > <GraduationCapIcon />
                {grade.name}
              </Link>
            ))
          )}
        </nav>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {user.name} {user.surname}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs cursor-pointer"
            >
              <LogOut/>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <section className="flex-1 overflow-y-auto p-6">{children}</section>
      </main>
    </div>
  );
}
