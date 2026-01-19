"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, BookOpen, Layers, FileText, LogOut, Menu, X } from "lucide-react";
import EdexLogo from "@/components/ui/logo";
import { logout } from "@/store/authSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Foydalanuvchilar", href: "/admin/users", icon: <Users size={22} className="text-[#90EE90]" /> },
    { name: "Sinflar", href: "/admin/grades", icon: <Layers size={22} className="text-[#89CFF0]" /> },
    { name: "Fanlar", href: "/admin/subjects", icon: <BookOpen size={22} className="text-[#FDAA48]" /> },
    { name: "Testlar", href: "/admin/tests", icon: <FileText size={22} className="text-[#DA70D6]" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50
          w-64 h-full bg-gray-800 p-4 flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/admin/users"
            className="text-xl font-bold text-green-600 flex gap-2 items-center"
            onClick={() => setOpen(false)}
          >
            <EdexLogo className="w-10 h-10" />
            EdEx
          </Link>

        </div>

        <nav className="flex-1 overflow-y-auto space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 font-bold rounded-md transition
                ${pathname === item.href ? "bg-blue-600 text-white" : "hover:bg-gray-700"}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-xs flex items-center gap-2"
          >
            <LogOut size={16} />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header (mobile & tablet) */}
        <header className="lg:hidden flex items-center gap-3 p-4 bg-gray-800 border-b border-gray-700 justify-between">
          <button onClick={() => setOpen(true)}>
            <Menu size={24} />
          </button>
          <EdexLogo className="w-10 h-10" />
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
