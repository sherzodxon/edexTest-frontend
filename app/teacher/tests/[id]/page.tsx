"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import {
  getTestById,
  getActiveStudents,
  getTestResults,
} from "@/lib/axios";

const socket = io("http://localhost:3001");

export default function TestDetailsPage() {
  const { id } = useParams();
  const testId = Number(id);
  const [test, setTest] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

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

    if (isOngoing) {
      socket.emit("joinTest", { userId: "teacher", testId });
      socket.on("userOnline", (data) => {
        setActiveStudents((prev) =>
          prev.find((s) => s.userId === data.userId)
            ? prev
            : [...prev, data]
        );
      });
    } else {
      (async () => {
        const res = await getTestResults(testId);
        setResults(res.data);
      })();
    }

    return () => {
      socket.disconnect();
    };
  }, [test]);

  if (!test) return <p>Yuklanmoqda...</p>;

  const now = new Date();
  const isOngoing = test.endTime && new Date(test.endTime) > now;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
      <p className="text-gray-600 mb-4">
        {test.subject.name} | Boshlanish:{" "}
        {new Date(test.startTime).toLocaleString()} — Tugash:{" "}
        {new Date(test.endTime).toLocaleString()}
      </p>

      {isOngoing ? (
        <>
          <h2 className="text-xl font-semibold mb-3">
            🟢 Onlayn talabalar
          </h2>
          {activeStudents.length ? (
            <ul>
              {activeStudents.map((s, i) => (
                <li
                  key={i}
                  className="border p-2 rounded mb-1 bg-green-50"
                >
                  Talaba ID: {s.userId}
                </li>
              ))}
            </ul>
          ) : (
            <p>Hozircha testni hech kim boshlamagan.</p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">
            📊 Test natijalari
          </h2>
          {results.length ? (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Ism</th>
                  <th className="p-2 border">Ball</th>
                  <th className="p-2 border">Tugatdi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id}>
                    <td className="border p-2">{i + 1}</td>
                    <td className="border p-2">{r.student}</td>
                    <td className="border p-2">{r.score}</td>
                    <td className="border p-2">
                      {r.finished ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Natijalar topilmadi.</p>
          )}
        </>
      )}
    </div>
  );
}
