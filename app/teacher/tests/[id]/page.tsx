"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getTestById, getTestResults } from "@/lib/axios";
import { Bubbles, ClockArrowDown, NotebookPen, UserRoundX } from "lucide-react";

interface StudentOnline {
  userId: number;
  name: string;
}

interface Result {
  studentId: number;
  student: string;
  score: number;
  finished: boolean;
}

export default function TestDetailsPage() {
  const { id } = useParams();
  const testId = Number(id);
  const [test, setTest] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<StudentOnline[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    (async () => {
      const res = await getTestById(testId);
      setTest(res.data);
    })();
  }, [testId]);

  useEffect(() => {
  if (!test) return;

  const now = new Date();
  const isOngoing = test.endTime && new Date(test.endTime) > now;

  const s = io("http://localhost:3001", { transports: ["websocket"] });

  if (isOngoing) {
   s.on("connect", () => {
    console.log("Teacher socket connected:", s.id);
    s.emit("joinTest", { userId: "teacher", name: "Teacher", testId, role: "teacher" });
  });

  s.on("userOnline", (data) => {
    setActiveStudents((prev) => {
      const exists = prev.some((p) => p.userId === data.userId);
      return exists ? prev : [...prev, data];
    });
  });

  s.on("userOffline", (data) => {
    setActiveStudents((prev) => prev.filter((p) => p.userId !== data.userId));
  });

  s.on("connect_error", (err) => console.warn("Teacher socket error:", err));
  setSocket(s);
  } else {
    (async () => {
      const res = await getTestResults(testId);
      setResults(res.data);
    })();
    
  }

  return () => {
    s.off("userOnline");
    s.off("userOffline");
    s.disconnect();
  };
}, [test]);

  if (!test) return <p className="p-8flex gap-2 items-center"> <ClockArrowDown />Yuklanmoqda...</p>;
  
  const now = new Date();
  const isOngoing = test.endTime && new Date(test.endTime) > now;

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-4 shadow bg-white">
        <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
        <p className="text-gray-600">
          Fan: <strong>{test.subject}</strong>
        </p>
       
        <p
          className={`mt-2 font-semibold ${
            isOngoing ? "text-green-600" : "text-red-500"
          }`}
        >
          {isOngoing ? "Test davom etmoqda..." : "Test yakunlangan"}
        </p>
      </div>

      {isOngoing ? (
        <div className="border rounded-xl p-4 shadow bg-white">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Bubbles className="text-green-500" /> Onlayn talabalar</h2>

          {activeStudents.length ? (
            <ul className="space-y-2">
              {activeStudents.map((s) => (
                <li
                  key={s.userId}
                  className="border p-2 rounded bg-green-50 flex justify-between items-center"
                >
                  <span>{s.name}</span>
                  <span className="text-gray-500 text-sm">
                    ID: {s.userId}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex gap-2 items-center"><UserRoundX /> Onlayn o'quvchilar hozircha yo'q</p>
          )}
        </div>
      ) : (
        <div className="border rounded-xl p-4 shadow bg-white">
          <h2 className="text-xl font-semibold mb-3 flex gap-2 items-center"><NotebookPen /> Test natijalari</h2>

          {results.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">Ism</th>
                    <th className="p-2 border text-center">Ball (100)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={r.studentId || i}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-2 border">{i + 1}</td>
                      <td className="p-2 border">{r.student}</td>
                      <td className="p-2 border font-semibold text-center">
                        {r.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Natijalar topilmadi.</p>
          )}
        </div>
      )}
    </div>
  );
}
