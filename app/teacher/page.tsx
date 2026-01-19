"use client";

import { CircleUserRound, ClockArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Userni parse qilishda xatolik:", e);
      }
    }
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 gap-2">
        <ClockArrowDown className="w-5 h-5" />
        Yuklanmoqda...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* PROFILE CARD */}
      <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <CircleUserRound className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-blue-600" />
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
            Assalomu alaykum, {user.name} {user.surname}
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            Shaxsiy panelingizga xush kelibsiz!
          </p>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-gray-50 border rounded-lg p-4 sm:p-6 text-center text-sm sm:text-base text-gray-600">
        <p>
          <span className="font-medium text-blue-600">Ro'yxat</span>{" "}
          dagi sinflardan birini tanlang va o'quvchilar, fanlar hamda test
          natijalarini ko'ring.
        </p>
      </div>
    </div>
  );
}
