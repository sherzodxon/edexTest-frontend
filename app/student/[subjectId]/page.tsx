"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

// 🧩 Recharts komponentlari
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlarmClock, AlarmClockMinus, AlarmClockOff, Book, ChartPie, CirclePlay, ClockArrowDown, Eye, ListCheck } from "lucide-react";

export default function SubjectTestsPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [notResult , setNotResults]=useState<boolean>(false)

  useEffect(() => {
    async function loadSubject() {
      try {
        setLoading(true);
        const res = await api.get(`subjects/${subjectId}/tests`);
        setSubject(res.data);
      } catch (err: any) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (subjectId) loadSubject();
  }, [subjectId]);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await api.get(`/tests/results/${subjectId}`); 
        setResults(res.data.reverse() || []);
      } catch (err:any) {
      if (err.response.status == 404) {
          setNotResults(true)
      }
      else
       setError(true)
      }
    }

    if (subjectId) loadResults();
  }, [subjectId]);

  if (loading) {
    return <div className="p-8 text-gray-500 text-center flex gap-2 items-center"> <ClockArrowDown /> Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">Server bilan bo'g'liq muommo mavjud</div>;
  }

  if (!subject) {
    return <div className="p-8 text-gray-500 text-center">Fan topilmadi.</div>;
  }
 
  const now = new Date();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold flex gap-2 items-center text-gray-800">
        <Book /> {subject.name} ({subject.grade?.name})
      </h1>

      {!notResult && results.length > 0 ? (
        <div className="bg-white p-4 border rounded-lg bg-white shadow-sm">
         <ResponsiveContainer width="100%" height={300} className="p-2">
            <LineChart data={results} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis hide dataKey="testName" />
              <YAxis domain={[0, 100]} />
               <Tooltip
                  content={({ active, payload, label }) => {
                   if (active && payload && payload.length) {
                    return (
              <div className="bg-white shadow-lg border rounded-md p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-1">{label}</p>
              {payload.map((entry, index) => (
                <p key={index} className="text-gray-600">
                  Natija: <span className="font-bold text-blue-600">{entry.value}%</span>
                </p>
              ))}
            </div>
          );
        }
        return null;
      }}
    />
              <Line
                type="monotone"
                dataKey="result"
                stroke="#27a55d"
                strokeWidth={3}
                
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          Hozircha bu fan bo'yicha natijalar mavjud emas.
        </div>
      )}

      {subject.tests?.length === 0 ? (
        <p className="text-gray-500">Bu fan uchun hali testlar mavjud emas.</p>
      ) : (
        <ul className="space-y-4">
          {subject.tests?.map((test: any) => {
            const start = new Date(test.startTime);
            const end = new Date(test.endTime);
            const isActive = now >= start && now <= end;
            const isExpired = now > end;
            const isUpcoming = now < start;

            const userTest = test.userTests?.[0];
            const finished = userTest?.finished;
            const score = userTest?.score;

            return (
              <li
                key={test.id}
                className={`border p-4 rounded-lg bg-white shadow-sm ${
                  isActive
                    ? "border-blue-500"
                    : isExpired
                    ? "border-gray-400 opacity-70"
                    : "border-green-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">{test.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <AlarmClockMinus /> {start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {finished && (
                      <p className="mt-1 text-sm text-green-600 flex gap-2 items-center">
                        <ListCheck /> Siz bu testni {score ?? 0} ball bilan yakunlagansiz
                      </p>
                    )}
                    {!finished && isExpired && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-2">
                        <AlarmClockOff /> Test vaqti tugagan
                      </p>
                    )}
                    {isUpcoming && (
                      <p className="mt-1 text-sm text-yellow-600 flex gap-2 items-center">
                        <AlarmClock /> Test boshlanmagan
                      </p>
                    )}
                  </div>

                  <div>
                    {finished ? (
                      <button
                        onClick={() =>
                          router.push(`/student/tests/${test.id}/result`)
                        }
                        className="flex gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                      >
                        <ChartPie /> Natijani ko'rish
                      </button>
                    ) : isActive ? (
                      <Link
                        href={`/student/tests/${test.id}`}
                        className="flex gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        <CirclePlay /> Testni boshlash
                      </Link>
                    ) : isUpcoming ? (
                      <button
                        disabled
                        className="flex gap-2 px-3 py-2 bg-yellow-400 text-white rounded-lg cursor-not-allowed"
                      >
                        <AlarmClock />  Hali boshlanmagan
                      </button>
                    ) : (
                      <Link
                        className="flex gap-2 px-3 py-2 bg-green-800 text-white rounded-lg cursor-pointer"
                        href={`/student/tests/${test.id}`}
                      >
                        <Eye />Ko'rish
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
