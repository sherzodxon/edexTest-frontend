"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Library
} from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { showConfirm } = useConfirmToast();
  const [form, setForm] = useState({ name: "", gradeId: "" });

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
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

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

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
    const ok = await showConfirm("Haqiqatan ham ushbu fanni o'chirmoqchimisiz?");
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
      const payload = { name: form.name, gradeId: Number(form.gradeId) };
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, payload);
        toast.success("Fan yangilandi");
      } else {
        await api.post(`/subjects`, payload);
        toast.success("Yangi fan yaratildi");
      }
      setShowModal(false);
      fetchSubjects();
    } catch {
      toast.error("Saqlashda xatolik!");
    }
  };

  return (
    <div className="min-h-screen text-gray-100 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <BookOpen className="text-orange-400" size={28} />
            </div>
            Fanlar
            <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
              {subjects.length} jami
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">O'quv rejasidagi fanlar va ularning sinflari</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#27a55d] hover:bg-[#218c4f] text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#27a55d]/20 active:scale-95 font-bold uppercase text-xs tracking-wider"
        >
          <Plus size={18} />
          Fan Qo'shish
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1E293B] p-3 rounded-2xl border border-gray-800 shadow-sm mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Fan nomini qidirish..."
            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-orange-500 transition-colors text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#1E293B] rounded-3xl border border-dashed border-gray-700">
            <Library className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-500 font-medium">Hech qanday fan topilmadi</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="group bg-[#1E293B] border border-gray-800 hover:border-orange-500/50 rounded-2xl p-4 transition-all hover:shadow-xl relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <BookOpen size={20} className="text-orange-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{s.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                      <GraduationCap size={14} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {s.grade?.name || "Sinf biriktirilmagan"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50 mt-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-2 hover:bg-yellow-500/10 rounded-lg text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
               
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingSubject ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Fan Nomi</label>
                <input
                  required
                  type="text"
                  placeholder="Masalan: Informatika"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500 transition-all text-white font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Tegishli Sinf</label>
                <select
                  required
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500 transition-all text-white appearance-none cursor-pointer"
                  value={form.gradeId}
                  onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
                >
                  <option value="">Sinfni tanlang</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-gray-400 font-bold text-xs hover:bg-gray-700 transition-colors uppercase tracking-widest"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 shadow-xl shadow-orange-500/10 transition-all uppercase tracking-widest"
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