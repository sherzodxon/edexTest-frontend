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
      <div className="flex justify-center items-center min-h-screen text-gray-500flex gap-2 items-center"> <ClockArrowDown /> Yuklanmoqda
      </div>
    );

  return (
    <div className="p-8">
      <div className="bg-white shadow rounded-xl p-6  mb-8 flex items-center justify-center">
        <div>
            <div className="flex items-center justify-center mb-4">
              <CircleUserRound className="w-28 h-28 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
           Assalomu alaykum, {user.name} {user.surname}
          </h1>
          <p className="text-gray-600 text-center">
            Sizning o'qituvchi panelingizga xush kelibsiz!
          </p>
        </div>

      </div>
      <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-600">
        <p>
          Chap tarafdagi <span className="font-medium text-blue-600">sinflar</span>{" "}
          ro'yxatidan birini tanlang va o'quvchilar, fanlar hamda test
          natijalarini ko'ring.
        </p>
      </div>
    </div>
  );
}
