"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {CircleUserRound, ClockArrowDown, LogOut} from "lucide-react";
import EdexLogo from "@/components/ui/logo";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

export default function StudentLayout({children} : {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [user,
        setUser] = useState < any > (null);

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
        dispatch(logout());
        router.replace("/login");
    };

    if (!user) 
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                <div className="flex items-center gap-2">
                    <ClockArrowDown className="w-5 h-5"/>
                    <span>Yuklanmoqda...</span>
                </div>
            </div>

        );
    
    return (
        <div>
            <header className="bg-white fixed w-full z-50 shadow">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">

                    <Link href="/student" className="flex items-center text-green-600 font-bold">
                        <EdexLogo className="w-8 h-8 sm:w-10 sm:h-10"/>

                        <span className="hidden sm:inline ml-2 text-lg sm:text-xl">
                            EdEx
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">

                        <span
                            className="flex items-center gap-2 px-3 py-1 font-medium sm:text-lg text-sm">
                            <CircleUserRound className="w-5 h-5"/>{`${user.name} 
                            ${user.surname}`}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-lg transition">
                            <LogOut className="w-5 h-5 sm:mr-2"/>
                            <span className="hidden sm:inline">Chiqish</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="pt-10 sm:pt-16 px-0 sm:px-6">{children}</main>
        </div>
    );
}
