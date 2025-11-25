"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Search, Edit, Trash2, X, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

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
  const [filtered, setFiltered] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { showConfirm } = useConfirmToast();
  const [form, setForm] = useState<{ name: string; gradeId: string }>({
    name: "",
    gradeId: "",
  });

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Fanlarni olishda xatolik!");
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

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      subjects.filter((s) =>
        s.name.toLowerCase().includes(q)
      )
    );
  }, [query, subjects]);

  const openAdd = () => {
    setEditingSubject(null);
    setForm({ name: "", gradeId: "" });
    setShowModal(true);
  };

  const handleEdit = (s: Subject) => {
    setEditingSubject(s);
    setForm({ name: s.name, gradeId: String(s.gradeId) });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await showConfirm("Haqiqatan ham fanni o'chirmoqchimisiz?");
    if (!ok) return;

    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
      toast.success("Fan o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, {
          name: form.name,
          gradeId: Number(form.gradeId),
        });
        toast.success("Fan muvaffaqiyatli yangilandi");
      } else {
        await api.post(`/subjects`, {
          name: form.name,
          gradeId: Number(form.gradeId),
        });
        toast.success("Fan muvaffaqiyatli yaratildi");
      }

      setShowModal(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch {
      toast.error("Saqlashda xatolik!");
    }
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen /> Fanlar boshqaruvi ({subjects.length})
        </h1>

        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded flex items-center gap-1 cursor-pointer"
        >
          <Plus size={18} /> Yangi fan
        </button>
      </div>

      {/* Search */}
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

      {/* List */}
      <div className="bg-gray-800 rounded p-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-4">Hech narsa topilmadi</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((s, i) => (
              <div
                key={s.id}
                className="bg-gray-900 p-3 rounded flex justify-between items-center hover:bg-gray-700"
              >
                <div className="flex gap-4 items-center">
                  <p>{i + 1}.</p>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-gray-400 text-sm">
                      Sinf: {s.grade?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)}>
                    <Edit className="text-yellow-400 hover:text-yellow-300 cursor-pointer" />
                  </button>
                  <button onClick={() => handleDelete(s.id)}>
                    <Trash2 className="text-red-500 hover:text-red-300 cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md p-6 rounded shadow-lg relative">
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingSubject ? "Fan tahrirlash" : "Yangi fan qo‘shish"}
            </h2>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Fan nomi (masalan: Matematika)"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="p-2 rounded bg-gray-800"
                required
              />

              <select
                value={form.gradeId}
                onChange={(e) =>
                  setForm({ ...form, gradeId: e.target.value })
                }
                className="p-2 rounded bg-gray-800"
                required
              >
                <option value="">Sinf tanlang</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
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
