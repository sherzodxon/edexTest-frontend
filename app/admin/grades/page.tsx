"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Search, Edit, Trash2, X, Layers } from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

interface Grade {
  id: number;
  name: string;
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filtered, setFiltered] = useState<Grade[]>([]);
  const [query, setQuery] = useState("");
 const { showConfirm } = useConfirmToast();
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form, setForm] = useState<{ name: string }>({ name: "" });

  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades");
      setGrades(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Sinf ma'lumotlarini olishda xatolik!")
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(grades.filter((g) => g.name.toLowerCase().includes(q)));
  }, [query, grades]);

  const handleAdd = () => {
    setEditingGrade(null);
    setForm({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setForm({ name: grade.name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm("Haqiqatan ham sinfni o'chirmoqchimisiz?");
    if (!ok) return;
    await api.delete(`/grades/${id}`);
    toast.success("Sinf o'chirildi")
    fetchGrades();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, form);
        toast.success("Sinf muvafaqqiyatli o'zgartildi")
      } else {
        await api.post("/grades", form);
        toast.success("Sinf muvafaqqiyatli yaratildi")
      }

      setShowModal(false);
      setEditingGrade(null);
      setForm({ name: "" });
      fetchGrades();
      
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik yuz berdi!")
    }
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex gap-2 items-center"><Layers/> Sinflar boshqaruvi ({grades.length})</h1>

        <button
          className="bg-blue-600 px-3 py-2 rounded flex items-center gap-1 hover:bg-blue-700 cursor-pointer"
          onClick={handleAdd}
        >
          <Plus size={18} /> Yangi sinf
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Qidirish..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-800 p-2 pl-10 rounded"
        />
      </div>

      <div className="bg-gray-800 rounded p-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-4">Hech narsa topilmadi</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((g, i) => (
              <div
                key={g.id}
                className="bg-gray-900 p-3 rounded flex justify-between items-center hover:bg-gray-700"
              >
                <div className="flex gap-4">
                  <p>{i + 1}.</p>
                  <p className="font-semibold">{g.name}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(g)}>
                    <Edit  className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
                  </button>
                  <button onClick={() => handleDelete(g.id)}>
                    <Trash2 className="text-red-500 hover:text-red-300 cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md p-6 rounded shadow-lg relative">
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingGrade ? "Sinfni tahrirlash" : "Yangi sinf qo'shish"}
            </h2>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Sinf nomi (masalan: 7-A)"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                className="p-2 rounded bg-gray-800"
                required
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
