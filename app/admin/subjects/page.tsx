"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/axios";

interface Grade {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  gradeId: number;
  grade?: Grade;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState<{ name: string; gradeId: string }>({
    name: "",
    gradeId: "",
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // 🔹 Ma’lumotlarni olish
  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      alert("Fanlarni olishda xatolik!");
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades");
      setGrades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
  }, []);

  // 🔹 Qo‘shish / Tahrirlash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.name || !form.gradeId) {
        alert("Fan nomi va sinf tanlanishi kerak!");
        return;
      }

      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, {
          name: form.name,
          gradeId: Number(form.gradeId),
        });
      } else {
        await api.post("/subjects", {
          name: form.name,
          gradeId: Number(form.gradeId),
        });
      }

      setForm({ name: "", gradeId: "" });
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert("Saqlashda xatolik!");
    }
  };

  // 🔹 O‘chirish
  const handleDelete = async (id: number) => {
    if (confirm("Rostdan ham o‘chirilsinmi?")) {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    }
  };

  // 🔹 Tahrirlash
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({ name: subject.name, gradeId: String(subject.gradeId) });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Fanlar boshqaruvi</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2  p-4 rounded mb-6"
      >
        <input
          type="text"
          placeholder="Fan nomi (masalan: Matematika)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />

        <select
          value={form.gradeId}
          onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
          className="border p-2 rounded w-full sm:w-1/3"
          required
        >
          <option value="">Sinf tanlang</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingSubject ? "Yangilash" : "Qo‘shish"}
        </button>

        {editingSubject && (
          <button
            type="button"
            onClick={() => {
              setEditingSubject(null);
              setForm({ name: "", gradeId: "" });
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
            <th className="p-2">Fan nomi</th>
            <th className="p-2">Sinf</th>
            <th className="p-2">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.grade?.name || "—"}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {subjects.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Hozircha fanlar mavjud emas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
