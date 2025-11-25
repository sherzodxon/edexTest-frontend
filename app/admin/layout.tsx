"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Layers, FileText } from "lucide-react";
import EdexLogo from "@/components/ui/logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Foydalanuvchilar", href: "/admin/users", icon: <Users size={22} /> },
    { name: "Sinflar", href: "/admin/grades", icon: <Layers size={22} /> },
    { name: "Fanlar", href: "/admin/subjects", icon: <BookOpen size={22} /> },
    { name:"Testlar", href:"/admin/tests",icon:<FileText size={22}/>}
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <Link href="/admin/users" className="text-xl flex items-center font-bold text-green-600 mb-2">
          <EdexLogo className="w-10 h-10"/> EdEx
         </Link>

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
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
