"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getTestsBySubject } from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function UserDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!userId || !token) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const resUser = await api.get(`/users/${userId}`);
        setUser(resUser.data);

        if (resUser.data.role === "TEACHER") {
          setGrades(resUser.data.teacherGrades || []);
          setSubjects(resUser.data.teacherSubjects || []);
        }

        if (resUser.data.role === "STUDENT") {
          const gradeId = resUser.data.gradeId;
          if (!gradeId) return setError("Foydalanuvchi sinfi topilmadi");
          const resSubj = await api.get(`/subjects/grade/${gradeId}`);
          setSubjects(resSubj.data);
        }
      } catch (err) {
        console.error(err);
        setError("Foydalanuvchini olishda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleSubjectClick = async (subject: any) => {
  setSelectedSubject(subject);
  setTests([]);
  setAverage(null);
  setError(null);

  try {
    const role = user?.role ?? "STUDENT";

    const res = await getTestsBySubject(subject.id, "ADMIN");
    const rawTests = Array.isArray(res?.data) ? res.data : res?.data.tests ?? [];
    let testsData: any[] = [];

    if (role === "STUDENT") {
      testsData = rawTests.map((t: any) => ({
        id: t.id,
        name: t.title,
        result: t.userTests?.find((ut: any) => ut.userId === user.id)?.score ?? 0,
        finished: !!t.userTests?.find((ut: any) => ut.userId === user.id)?.finished,
        startTime: t.startTime,
        endTime: t.endTime,
      }));
    }

    if (role === "TEACHER") {
      testsData = rawTests.map((t: any) => {
        const allScores = t.userTests?.map((ut: any) => ut.score ?? 0) ?? [];
        const avg =
          allScores.reduce((sum: number, score: number) => sum + score, 0) /
          (allScores.length || 1);
        return {
          id: t.id,
          name: t.title,
          result: avg,
          startTime: t.startTime,
          endTime: t.endTime,
        };
      });

      const avgTotal =
        testsData.reduce((sum, t) => sum + (t.result ?? 0), 0) /
        (testsData.length || 1);
      setAverage(avgTotal);
    }

    setTests(testsData);
  } catch (err: any) {
    console.error("handleSubjectClick error:", err?.response ?? err);
    const msg = err?.response?.data?.message || "Testlarni olishda xatolik";
    setError(msg);
  }
};


  if (loading) return <div className="p-6">Yuklanmoqda...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Foydalanuvchi topilmadi</div>;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        {user.name} {user.surname}
      </h1>

      {subjects.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSubjectClick(s)}
              className={`px-4 py-2 rounded shadow text-black cursor-pointer ${
                selectedSubject?.id === s.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      {tests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Testlar</h2>

          {average !== null && user.role === "TEACHER" && (
            <div className="mb-4 font-semibold">
              Ja'mi natija: {Math.floor(average)} %
            </div>
          )}

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tests}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"  hide className="z-index-100"/>
              <YAxis domain={[0,100]} />
              <Tooltip
                  content={({ active, payload, label }) => {
                   if (active && payload && payload.length) {
                    return (
                   <div className="bg-white shadow-lg border rounded-md p-3 text-sm">
                 <p className="font-semibold text-gray-700 mb-1">{label}</p>
              {payload.map((entry, index) => (
                <p key={index} className="text-gray-600">
                 {user.role==="TEACHER"?"O'rtacha natija:":"Natija:"} <span className="font-bold text-blue-600">{Math.floor(entry.value)}%</span>
                </p>
              ))}
            </div>
          );
        }
        return null;
      }}
    />
              <Bar dataKey="result" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
