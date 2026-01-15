"use client";

import Link from "next/link";
import { usePathname ,useRouter} from "next/navigation";
import { Users, BookOpen, Layers, FileText, LogOut } from "lucide-react";
import EdexLogo from "@/components/ui/logo";
import { logout } from "@/store/authSlice";
import { useDispatch } from "react-redux";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const navItems = [
    { name: "Foydalanuvchilar", href: "/admin/users", icon: <Users size={22} className="text-[#90EE90]" /> },
    { name: "Sinflar", href: "/admin/grades", icon: <Layers size={22} className="text-[#89CFF0]" /> },
    { name: "Fanlar", href: "/admin/subjects", icon: <BookOpen size={22} className="text-[#FDAA48]"/> },
    { name:"Testlar", href:"/admin/tests",icon:<FileText size={22} className="text-[#DA70D6]"/>}
  ];
  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    router.replace("/login");
  };
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col  ">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin/users" className="text-xl font-bold text-green-600 flex gap-2 items-center">
          <EdexLogo className="w-10 h-10"/> EdEx
         </Link>
         </div>
          <nav className="flex-1 overflow-y-auto space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-3 font-bold rounded-md transition
                  ${pathname === item.href ? "bg-blue-600 text-white" : "hover:bg-gray-700"}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 mt-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs cursor-pointer"
                    >
                      <LogOut/>
                </button>
              </div>  
          </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
