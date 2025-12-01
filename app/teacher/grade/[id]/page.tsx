"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api, {
  getTeacherSubjects,
  getStudentsByGrade,
  getTeacherTestsBySubject,
  getAverageBySubject,
} from "@/lib/axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ChartLine,
  DiamondPlus,
  LibraryBig,
  ChevronDown,
  ChevronUp,
  BookMarked,
  ChartBar,
  UsersRound,
  UserRound,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";

export default function GradeDetailsPage() {
  const { id } = useParams();
  const gradeId = Number(id);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [gradeRes, setGradesRes] = useState<string>("");

  const [openStudents, setOpenStudents] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentResults, setStudentResults] = useState<any>(null);

  
  useEffect(() => {
    async function loadData() {
      try {
        const [gradeRes] = await Promise.all([api.get(`/grades/${gradeId}`)]);
        setGradesRes(gradeRes.data?.name);
        const [subsRes, studentsRes] = await Promise.all([
          getTeacherSubjects(),
          getStudentsByGrade(gradeId),
        ]);
        setSubjects(subsRes.data.filter((s: any) => s.gradeId === gradeId));
        setStudents(studentsRes.data);
      } catch (err) {
        console.error("Ma'lumotlarni olishda xatolik:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (gradeId) loadData();
  }, [gradeId]);

  const handleSelectSubject = async (subjectId: number) => {
    setSelectedSubject(subjectId);
    try {
      const [testsRes, avgRes] = await Promise.all([
      getTeacherTestsBySubject(subjectId),
      getAverageBySubject(subjectId),     
    ]) ;

      setTests(testsRes.data);
      setChartData(avgRes.data.reverse());
    } catch (err) {
      console.error("Fan ma'lumotlarini olishda xatolik:", err);
    }
  };

  const handleShowStudentResults = async (student: any) => {
    if (!selectedSubject) {
      toast.error('Avval fan tanlang!', {
       position: "bottom-center"
      })
      return;
    }

    setSelectedStudent(student);

    try {
      const res = await api.get(
        `/tests/results/student/${student.id}/${selectedSubject}`
      );
      setStudentResults(res.data || null);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Natijalarni olishda xatolik:", err);
      setStudentResults(null);
      setIsModalOpen(true);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Yuklanmoqda...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {gradeRes || ""}-sinf paneli
      </h1>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
          <LibraryBig /> Fanlar
        </h2>
        <div className="flex flex-wrap gap-3">
          {subjects.length === 0 ? (
            <p className="text-gray-500">Bu sinfga fanlar biriktirilmagan.</p>
          ) : (
            subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSubject(s.id)}
                className={`flex gap-2 px-4 py-2 rounded-lg border ${
                  selectedSubject === s.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >  <BookMarked />
                {s.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setOpenStudents(!openStudents)}
        >
          <h3 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-blue-600" />
            O'quvchilar
          </h3>
          {openStudents ? (
            <ChevronUp className="text-gray-500" />
          ) : (
            <ChevronDown className="text-gray-500" />
          )}
        </div>

        {openStudents && (
          <div className="mt-4 ">
            {students.length === 0 ? (
              <p className="text-gray-500">Bu sinfda o'quvchilar topilmadi.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {students.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleShowStudentResults(s)}
                    className={`flex items-center gap-2 border p-2 rounded-md text-sm cursor-pointer hover:bg-blue-50 transition w-full ${
                      !selectedSubject && "opacity-60 cursor-not-allowed"
                    }`}
                  >
                  <UserRound />  {s.surname} {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {selectedSubject && chartData.length > 0 && (
  <div className="border rounded-lg p-4 bg-white shadow-sm">
    <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
      <ChartLine />
      {subjects.find((s) => s.id === selectedSubject)?.name} fani bo'yicha o'rtacha natijalar
    </h3>

    <div className="max-w-full overflow-x-auto ">
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
                  O'rtacha natija: <span className="font-bold text-blue-600">{entry.value}%</span>
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
              dataKey="averageResult"
              stroke="#27a55d"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}
      {selectedSubject && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              {
                subjects.find((s) => s.id === selectedSubject)?.name
              }{" "}
              fanidagi testlar:
            </h3>
            <Link
              href={`/teacher/tests/create?subjectId=${selectedSubject}`}
              className="flex gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
            >
              <DiamondPlus /> Test yaratish
            </Link>
          </div>

          {tests.length === 0 ? (
            <p className="text-gray-500">Bu fan uchun hali test yaratilmagan.</p>
          ) : (
            <ul className="space-y-3">
              {tests.map((t) => (
                <li
                  key={t.id}
                  className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <Link href={`/teacher/tests/${t.id}`} className="flex-1">
                    <p className="font-medium hover:underline">{t.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-bold text-gray-800 mb-2 flex gap-2">
             <ChartBar /> {selectedStudent?.surname} {selectedStudent?.name}
            </Dialog.Title>

            {!studentResults?.results?.length ? (
              <p className="text-gray-500 text-center">
                Bu o'quvchi hali test topshirmagan.
              </p>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm">O'rtacha natija</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {studentResults.averageScore}%
                  </p>
                </div>

                <ul className="space-y-2 overflow-y-auto h-64">
                  {studentResults.results.map((r: any, i: number) => (
                    <li
                      key={i}
                      className="border rounded-md p-2 flex justify-between text-sm"
                    >
                      <span>{r.testName}</span>
                      <span
                        className={`font-medium ${
                          r.score === 0
                            ? "text-red-500"
                            : r.score >= 70
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {`${r.score ? r.score+"%":"0"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Yopish
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
