"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  const [results, setResults] = useState<Result[]>([]);
 


  useEffect(() => {
    (async () => {
      const res = await getTestById(testId);
      setTest(res.data);
    })();
  }, [testId]);

  useEffect(() => {
  if (!test) return;

   else {
    (async () => {
      const res = await getTestResults(testId);
      setResults(res.data);
    })();
    
  }

  
}, [test]);

  if (!test) return <div className="min-h-screen flex items-center justify-center text-gray-500">
  <div className="flex items-center gap-2">
    <ClockArrowDown className="w-5 h-5" />
    <span>Yuklanmoqda...</span>
  </div>
</div>
;
  
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

     {!isOngoing && (
  <div className="border rounded-xl p-4 shadow bg-white">
    <h2 className="text-xl font-semibold mb-3 flex gap-2 items-center">
      <NotebookPen /> Test natijalari
    </h2>

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
              <tr key={r.studentId || i}>
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
