"use client";

import React, { useEffect, useState } from "react";
import api, { getAllGrades, getSubjectsByGrade, createUser, updateUser, deleteUser } from "@/lib/axios";
import Link from "next/link";
import { 
  Search, ChevronRight, GraduationCap, UserCog, Shield, 
  Trash2, Edit, Plus, EyeOff, Eye, Users, X 
} from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

interface Grade { id: number; name: string; }
interface Subject { id: number; name: string; }
interface User { 
  id: number; 
  name?: string; 
  surname?: string; 
  username: string; 
  role: "STUDENT" | "TEACHER" | "ADMIN"; 
  gradeId?: number;
  teacherGrades?: Grade[];
  teacherSubjects?: Subject[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const { showConfirm } = useConfirmToast();
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "TEACHER">("ALL");
  const [gradeFilter, setGradeFilter] = useState<number | "ALL">("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",   
    role: "STUDENT" as User["role"],
    grades: [] as number[],
    subjects: [] as number[],
  });

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState<{ [key: number]: Subject[] }>({});

  useEffect(() => {
    fetchUsers();
    fetchGrades();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const fetchGrades = async () => {
    const res = await getAllGrades();
    setGrades(res.data);
  };

  useEffect(() => {
    const fetchNeededSubjects = async () => {
      const missingGrades = formData.grades.filter(id => !subjectsByGrade[id]);
      if (missingGrades.length === 0) return;
      try {
        const results = await Promise.all(missingGrades.map(id => getSubjectsByGrade(id)));
        const newSubjects = { ...subjectsByGrade };
        results.forEach((res, index) => { newSubjects[missingGrades[index]] = res.data; });
        setSubjectsByGrade(newSubjects);
      } catch (err) { console.error("Fanlarni yuklashda xatolik:", err); }
    };
    fetchNeededSubjects();
  }, [formData.grades]);

  const filtered = users.filter((u) => {
    const fullName = `${u.name || ""} ${u.surname || ""}`.toLowerCase();
    const search = query.toLowerCase();
    let ok = fullName.includes(search) || u.username.toLowerCase().includes(search);
    if (roleFilter !== "ALL") ok = ok && u.role === roleFilter;
    if (gradeFilter !== "ALL") {
      const gId = Number(gradeFilter);
      if (u.role === "STUDENT") ok = ok && (u as any).gradeId === gId;
      if (u.role === "TEACHER") {
        const teacherGrades = (u as any).teacherGrades;
        ok = ok && Array.isArray(teacherGrades) && teacherGrades.some((gr: any) => gr.id === gId);
      }
    }
    return ok;
  });

  const handleDelete = async (id: number) => {
    const ok = await showConfirm("Foydalanuvchini o'chirib tashlamoqchimisiz?");
    if (!ok) return;
    await deleteUser(id);
    fetchUsers();
    toast.success("O'chirildi");
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    const userGrades = user.role === "STUDENT" 
      ? (user.grade?.id ? [user.grade.id] : []) 
      : (user.teacherGrades?.map((g: any) => g.id) || []);
    const userSubjects = user.role === "TEACHER" ? (user.teacherSubjects?.map((s: any) => s.id) || []) : [];

    setFormData({
      name: user.name || "",
      surname: user.surname || "",
      username: user.username,
      password: "",
      role: user.role,
      grades: userGrades,
      subjects: userSubjects,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sendData: any = { ...formData, password: formData.password || undefined };
    if (formData.role === "STUDENT") sendData.gradeId = formData.grades[0] || null;
    if (formData.role === "TEACHER") {
      sendData.teacherGradeIds = formData.grades;
      sendData.teacherSubjectIds = formData.subjects;
    }

    try {
      editingUser ? await updateUser(editingUser.id, sendData) : await createUser(sendData);
      toast.success(editingUser ? "Yangilandi" : "Qo'shildi");
      setShowModal(false);
      fetchUsers();
    } catch (err) { toast.error("Xatolik!"); }
  };

  return (
    <div className="min-h-screen text-gray-100">
    
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0F172A; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 pt-4">
        <div>
         
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
                      <div className="bg-lime-500/10 p-2 rounded-lg">
                        <Users className="text-green-500" size={28} />
                      </div>
                      Foydalanuvchilar
                      <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                         {users.length} jami
                      </span>
                    </h1>
          <p className="text-gray-500 text-sm mt-1">O'qituvchi va o'quvchilar ma'lumotlarini boshqarish</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setFormData({name:"", surname:"", username:"", password:"", role:"STUDENT", grades:[], subjects:[]}); setShowModal(true); }}
          className="bg-[#27a55d] hover:bg-[#218c4f] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#27a55d]/20 active:scale-95 font-semibold"
        >
          <Plus size={20} />
          Yangi foydalanuvchi
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Ism yoki login orqali qidirish..."
            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#27a55d] transition-colors text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#27a55d] text-gray-300"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="ALL">Barcha</option>
            <option value="STUDENT">O'quvchilar</option>
            <option value="TEACHER">O'qituvchilar</option>
          </select>
          <select 
            className="bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#27a55d] text-gray-300"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          >
            <option value="ALL">Sinflar</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u) => {
          const isAdmin = u.role === "ADMIN";
          return (
            <div key={u.id} className={`group bg-[#1E293B] border ${isAdmin ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-gray-800 hover:border-[#27a55d]/50'} rounded-2xl p-5 transition-all hover:shadow-xl relative overflow-hidden`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-105 ${isAdmin ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[#0F172A] border-gray-800'}`}>
                  {u.role === "TEACHER" ? <UserCog className="text-blue-400" /> : u.role === "STUDENT" ? <GraduationCap className="text-emerald-400" /> : <Shield className="text-amber-500" />}
                </div>
                <div>
                  <h3 className={`text-lg font-bold leading-tight ${isAdmin ? 'text-amber-500' : 'text-white'}`}>
                    {u.name} {u.surname}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">@{u.username}</p>
                </div>
              </div>

              {!isAdmin && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(u)} className="p-2 hover:bg-amber-500/10 rounded-lg text-gray-500 hover:text-amber-500 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-1 text-xs font-black tracking-widest text-[#27a55d] hover:text-[#218c4f] transition-colors">
                    TAHLIL <ChevronRight size={14} />
                  </Link>
                </div>
              )}
              {isAdmin && (
                <div className="pt-4 border-t border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">Tizim Administratori</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] w-full max-w-lg rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 py-0 pt-4 border-b border-gray-800 flex justify-between items-center bg-[#1e293b]">
              <h2 className="text-xl font-bold text-white">{editingUser ? "Ma'lumotlarni tahrirlash" : "Yangi foydalanuvchi"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="space-y-1">
                  <label className="text-[10px]  text-gray-500 uppercase ml-1 tracking-wider">Ism</label>
                  <input required className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 outline-none focus:border-[#27a55d] transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px]  text-gray-500 uppercase ml-1 tracking-wider">Familiya</label>
                  <input required className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 outline-none focus:border-[#27a55d] transition-all" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1 mb-2">
                <label className="text-[10px] text-gray-500 uppercase ml-1 tracking-wider">Username</label>
                <input required className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 outline-none focus:border-[#27a55d] transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>

              <div className="space-y-1 relative mb-2">
                <label className="text-[10px]  text-gray-500 uppercase ml-1 tracking-wider">Parol</label>
                <input type={showPassword ? "text" : "password"} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 pr-12 outline-none focus:border-[#27a55d] transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? "O'zgartirish shart emas..." : "****"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="p-1.5 bg-[#0F172A] rounded-2xl flex gap-1.5 border mb-2 border-gray-800">
                {["STUDENT", "TEACHER"].map((r) => (
                  <button key={r} type="button" onClick={() => setFormData({ ...formData, role: r as any, grades: [], subjects: [] })} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.role === r ? "bg-[#27a55d] text-white shadow-lg" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}>
                    {r === "STUDENT" ? "O'QUVCHI" : "O'QITUVCHI"}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-2">
                <label className="text-[10px]  text-gray-500 uppercase ml-1 tracking-wider">Sinfni biriktirish</label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-[#0F172A] rounded-2xl border border-gray-800 custom-scrollbar">
                  {grades.map((g) => (
                    <label key={g.id} className={`flex items-center justify-center p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${formData.grades.includes(g.id) ? "border-[#27a55d] bg-[#27a55d]/10 text-[#27a55d]" : "border-gray-800 text-gray-500 hover:border-gray-600"}`}>
                      <input type="checkbox" className="hidden" checked={formData.grades.includes(g.id)} onChange={(e) => {
                        let newGrades = formData.role === "STUDENT" ? [g.id] : (e.target.checked ? [...formData.grades, g.id] : formData.grades.filter(id => id !== g.id));
                        setFormData({...formData, grades: newGrades});
                      }} />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>

              {formData.role === "TEACHER" && formData.grades.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Fanlarni tanlang</label>
                  <div className="space-y-1 p-2 bg-[#0F172A] rounded-2xl border border-gray-800 max-h-48 overflow-y-auto custom-scrollbar">
                    {formData.grades.map(gId => subjectsByGrade[gId]?.map(s => (
                      <label key={s.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors group">
                        <input type="checkbox" className="accent-[#27a55d] w-4 h-4 rounded-md" checked={formData.subjects.includes(s.id)} onChange={(e) => {
                          const newSubjs = e.target.checked ? [...formData.subjects, s.id] : formData.subjects.filter(id => id !== s.id);
                          setFormData({...formData, subjects: newSubjs});
                        }} />
                        <span className="text-sm text-gray-300 group-hover:text-white">{s.name} <span className="text-[10px] text-gray-600 font-bold">({grades.find(g=>g.id===gId)?.name})</span></span>
                      </label>
                    )))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-gray-400 font-bold text-xs hover:bg-gray-700 transition-colors uppercase tracking-widest">Bekor qilish</button>
                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-[#27a55d] text-white font-bold text-xs hover:bg-[#218c4f] shadow-xl shadow-[#27a55d]/10 transition-all uppercase tracking-widest">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}