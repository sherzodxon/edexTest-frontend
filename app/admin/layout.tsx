"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Users, BookOpen, Layers } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Foydalanuvchilar", href: "/admin/users", icon: <Users size={18} /> },
    { name: "Sinflar", href: "/admin/grades", icon: <Layers size={18} /> },
    { name: "Fanlar", href: "/admin/subjects", icon: <BookOpen size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                  ${pathname === item.href ? "bg-blue-600 text-white" : "hover:bg-gray-700"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <Button variant="danger" className="w-full flex items-center gap-2">
            <LogOut size={18} /> Chiqish
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
