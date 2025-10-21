"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/axios";

interface Grade {
  id: number;
  name: string;
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState<{ name: string }>({ name: "" });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  // 🔹 Ma'lumotlarni olish
  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades");
      setGrades(res.data);
    } catch (err) {
      console.error(err);
      alert("Sinf ma’lumotlarini olishda xatolik!");
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  // 🔹 Sinfni qo‘shish yoki tahrirlash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, form);
      } else {
        await api.post("/grades", form);
      }

      setForm({ name: "" });
      setEditingGrade(null);
      fetchGrades();
    } catch (err) {
      console.error(err);
      alert("Saqlashda xatolik yuz berdi!");
    }
  };

  // 🔹 O‘chirish
  const handleDelete = async (id: number) => {
    if (confirm("Rostdan ham o‘chirilsinmi?")) {
      await api.delete(`/grades/${id}`);
      fetchGrades();
    }
  };

  // 🔹 Tahrirlash
  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setForm({ name: grade.name });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏫 Sinflar boshqaruvi</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 items-center  p-4 rounded mb-6"
      >
        <input
          type="text"
          placeholder="Sinf nomi (masalan: 5-A)"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingGrade ? "Yangilash" : "Qo‘shish"}
        </button>
        {editingGrade && (
          <button
            type="button"
            onClick={() => {
              setEditingGrade(null);
              setForm({ name: "" });
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Bekor qilish
          </button>
        )}
      </form>

      {/* Jadval */}
      <table className="w-full border">
        <thead className=" text-left">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Sinf nomi</th>
            <th className="p-2">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g, i) => (
            <tr key={g.id} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{g.name}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleEdit(g)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {grades.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                Hozircha sinflar mavjud emas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
