"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getTestsBySubject } from "@/lib/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { ArrowLeft, CircleUser, TrendingUp } from "lucide-react";

export default function UserDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [average, setAverage] = useState<number | null>(null); // Jami natija uchun
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!userId || !token) {
      router.replace("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const resUser = await api.get(`/users/${userId}`);
        const userData = resUser.data;
        setUser(userData);

        let userSubjects = [];
        if (userData.role === "TEACHER") {
          userSubjects = userData.teacherSubjects || [];
        } else {
          const resSubj = await api.get(`/subjects/grade/${userData.gradeId}`);
          userSubjects = resSubj.data;
        }
        setSubjects(userSubjects);

        const resRadar = await api.get(`/users/user-analysis/${userId}`);
        const formattedRadar = resRadar.data.labels.map((label: string, index: number) => ({
          subject: label,
          score: resRadar.data.dataset.data[index],
        }));
        setRadarData(formattedRadar);
      } catch (err) {
        console.error(err);
        setError("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, token]);

  const handleSubjectClick = async (subject: any) => {
    if (selectedSubject?.id === subject.id) {
      setSelectedSubject(null);
      setTests([]);
      setAverage(null);
      return;
    }

    setSelectedSubject(subject);
    try {
      const res = await getTestsBySubject(subject.id, "ADMIN"); 
      const rawTests = Array.isArray(res?.data) ? res.data : res?.data.tests ?? [];
      
      let totalSum = 0;
      const testsData = rawTests.map((t: any) => {
        let score = 0;
        if (user.role === "STUDENT") {
          score = t.userTests?.find((ut: any) => ut.userId === Number(userId))?.score ?? 0;
        } else {
          const allScores = t.userTests?.map((ut: any) => ut.score ?? 0) ?? [];
          score = allScores.length ? allScores.reduce((a: any, b: any) => a + b, 0) / allScores.length : 0;
        }
        totalSum += score;
        return {
          id: t.id,
          name: t.title,
          result: score
        };
      });

      setTests(testsData);
      setAverage(testsData.length > 0 ? totalSum / testsData.length : 0);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400 bg-[#0F172A] min-h-screen">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen p-4 sm:p-6 sm:py-0 text-gray-100">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Orqaga
      </button>

      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <CircleUser size={28} className="text-[#27a55d]" />
        {user.name} {user.surname}
      </h1>

      <div className="mb-4 flex flex-wrap gap-3">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSubjectClick(s)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              selectedSubject?.id === s.id
                ? "bg-[#27a55d] border-[#27a55d] text-white"
                : "bg-[#0F172A] text-gray-400 border-gray-700 hover:border-[#27a55d] hover:text-[#27a55d]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="bg-[#0F172A] p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-sm text-gray-400 uppercase tracking-wider">
            {selectedSubject ? `${selectedSubject.name} natijalari` : "Umumiy ko'rsatkichlar"}
          </h2>
          
          {average !== null && (
            <div className="flex items-center gap-2 bg-[#27a55d]/10 border border-[#27a55d]/20 px-4 py-1.5 rounded-full">
              <TrendingUp size={16} className="text-[#27a55d]" />
              <span className="text-sm font-bold text-[#27a55d]">
                Ja'mi natija: {Math.floor(average)} %
              </span>
            </div>
          )}
        </div>

        {selectedSubject ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tests}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} tick={{fill: '#94a3b8'}} stroke="#334155" />
                <Tooltip
                    content={({ active, payload, label }) => {
                   if (active && payload && payload.length) {
                    return (
                   <div className="bg-[#1E293B] border border-gray-700 shadow-2xl rounded-lg p-3 text-sm">
                   <p className="font-semibold text-white mb-2 border-b border-gray-700 pb-1">{label}</p>
                   {payload.map((entry, index) => (
                  <p key={index} className="text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#27a55d]"></span>
                  {user?.role === "TEACHER" ? "O'rtacha natija:" : "Natija:"} 
                   <span className="font-bold text-[#27a55d]">{Math.floor(entry.value as number)}%</span>
                </p>
          ))}
        </div>
      );
    }
    return null;
  }}
/>
                <Bar dataKey="result" fill="#27a55d" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#64748b'}} stroke="#334155" />
                <Radar
                  name="Natija"
                  dataKey="score"
                  stroke="#27a55d"
                  fill="#27a55d"
                  fillOpacity={0.5}
                />
               <Tooltip
               content={({ active, payload }) => {
               if (active && payload && payload.length) {
               return (
               <div className="bg-[#1E293B] border border-gray-700 shadow-2xl rounded-lg p-3 text-sm">
               <p className="font-semibold text-white mb-1">
               {payload[0].payload.subject} 
               </p>
               <div className="flex items-center gap-2 text-gray-300">
               <span className="w-2 h-2 rounded-full bg-[#27a55d]"></span>
               <span>Ko'rsatkich:</span>
               <span className="font-bold text-[#27a55d]">
               {Math.floor(payload[0].value as number)}%
              </span>
          </div>
        </div>
      );
    }
    return null;
  }}
/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}