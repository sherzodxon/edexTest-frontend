"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Layers,
  ChevronRight,
  Hash
} from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

interface Grade {
  id: number;
  name: string;
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [query, setQuery] = useState("");
  const { showConfirm } = useConfirmToast();
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form, setForm] = useState({ name: "" });

  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades");
      setGrades(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Sinf ma'lumotlarini olishda xatolik!");
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const filtered = grades.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

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
    const ok = await showConfirm("Haqiqatan ham ushbu sinfni o'chirmoqchimisiz?");
    if (!ok) return;
    try {
      await api.delete(`/grades/${id}`);
      toast.success("Sinf muvaffaqiyatli o'chirildi");
      fetchGrades();
    } catch (err) {
      toast.error("O'chirishda xatolik!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, form);
        toast.success("Sinf yangilandi");
      } else {
        await api.post("/grades", form);
        toast.success("Yangi sinf yaratildi");
      }
      setShowModal(false);
      fetchGrades();
    } catch (err) {
      toast.error("Saqlashda xatolik!");
    }
  };

  return (
    <div className="min-h-screen text-gray-100">
      {/* Scrollbar Customization */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0F172A; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Layers className="text-blue-400" size={28} />
            </div>
            Sinflar
            <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
              {grades.length} jami
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Maktab sinflari va guruhlarini tahrirlash</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#27a55d] hover:bg-[#218c4f] text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#27a55d]/20 active:scale-95 font-bold uppercase text-xs tracking-wider"
        >
          <Plus size={18} />
          Yangi Sinf
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1E293B] p-3 rounded-2xl border border-gray-800 shadow-sm mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Sinf nomini yozing..."
            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grades List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#1E293B] rounded-3xl border border-dashed border-gray-700">
            <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Hech qanday sinf topilmadi</p>
          </div>
        ) : (
          filtered.map((g, index) => (
            <div
              key={g.id}
              className="group bg-[#1E293B] border border-gray-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Hash size={20} className="text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">{g.name}</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(g)}
                    className="p-2 hover:bg-yellow-500/10 rounded-lg text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
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
          <div className="bg-[#1E293B] w-full max-w-sm rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1e293b]">
              <h2 className="text-xl font-bold text-white">
                {editingGrade ? "Sinfni tahrirlash" : "Yangi Sinf Qo'shish"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px]  text-gray-500 uppercase ml-1 tracking-wider">
                  Sinf Nomi
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masalan: 9-2025"
                  className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-4 outline-none focus:border-blue-500 transition-all text-white font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                />
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
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-xl shadow-blue-500/10 transition-all uppercase tracking-widest"
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