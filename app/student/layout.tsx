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

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <Link href="/student" className="text-xl flex items-center font-bold text-green-600">
          <EdexLogo className="w-10 h-10"/> EdEx
        </Link>
        
        <div className="flex items-center gap-4 text-gray-700">
          <span className="flex items-center gap-2 px-3 py-2 font-medium">
            <CircleUserRound /> {user.name} {user.surname}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition cursor-pointer"
          >
            <LogOut/>
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
