"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { logout } from "@/store/authSlice";
import {
  ClockArrowDown,
  GraduationCapIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import EdexLogo from "@/components/ui/logo";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [user, setUser] = useState<any>(reduxUser || null);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Body scroll lock
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [sidebarOpen]);

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
      <div className="flex justify-center items-center min-h-screen text-gray-500 gap-2">
        <ClockArrowDown size={24} /> Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg border-r p-4 flex-col">
        <SidebarContent user={user} grades={grades} pathname={pathname} handleLogout={handleLogout} onLinkClick={() => {}} />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed inset-0 z-50 pointer-events-none">
        {/* overlay */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full"
          }`}
        >
          <SidebarContent
            user={user}
            grades={grades}
            pathname={pathname}
            handleLogout={handleLogout}
            onLinkClick={() => setSidebarOpen(false)} 
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between bg-white shadow px-4 py-2">
          <button onClick={() => setSidebarOpen(true)} className="text-green-700">
            <Menu size={24} />
          </button>
            <EdexLogo className="w-10 h-10 text-green-600" />
         
        </header>
        <section className="flex-1 overflow-y-auto p-2 sm:p-6">{children}</section>
      </main>
    </div>
  );
}

function SidebarContent({
  user,
  grades,
  pathname,
  handleLogout,
  onLinkClick,
}: {
  user: any;
  grades: any[];
  pathname: string;
  handleLogout: () => void;
  onLinkClick: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between  items-center mb-4">
        <Link href="/teacher" className="text-xl font-bold text-green-600 flex gap-2 items-center" onClick={onLinkClick}>
          <EdexLogo className="w-10 h-10" /> EdEx
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
              className={`flex items-center gap-2 px-3 py-2 font-bold rounded-md transition-colors ${
                pathname.includes(`/grade/${grade.id}`)
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={onLinkClick} 
            >
              <GraduationCapIcon size={24} />
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
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
