"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleUserRound, ClockArrowDown, LogOut } from "lucide-react";
import EdexLogo from "@/components/ui/logo";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  if (!user)
    return (
      <div className="flex gap-2 items-center justify-center h-screen text-gray-500">
        <ClockArrowDown /> Yuklanmoqda...
      </div>
    );

  return (
    <div>
      <header className="bg-white fixed w-full z-50 shadow">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <Link
            href="/student"
            className="flex items-center text-green-600 font-bold"
          >
            <EdexLogo className="w-8 h-8 sm:w-10 sm:h-10" />
            {/* Matn faqat sm+ */}
            <span className="hidden sm:inline ml-2 text-lg sm:text-xl">
              EdEx
            </span>
          </Link>

          {/* User info + Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Foydalanuvchi nomi faqat sm+ */}
            <span className="flex items-center gap-2 px-3 py-1 font-medium sm:text-lg text-sm">
              <CircleUserRound className="w-5 h-5" />
              {user.name} {user.surname}
            </span>

           
            <button
              onClick={handleLogout}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 px-4 sm:px-6">{children}</main>
    </div>
  );
}
