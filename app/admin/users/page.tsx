"use client";

import React, { useEffect, useState } from "react";
import api, { getAllGrades, getSubjectsByGrade, createUser, updateUser, deleteUser } from "@/lib/axios";
import Link from "next/link";
import { Search, ChevronRight, GraduationCap, UserCog, Shield, Trash2, Edit, Plus, EyeOff, Eye, Users } from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";
interface Grade { id: number; name: string; }
interface Subject { id: number; name: string; }
interface User { id: number; name?: string; surname?: string; username: string; role: "STUDENT" | "TEACHER" | "ADMIN"; }

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
    formData.grades.forEach(async (gradeId) => {
      if (!subjectsByGrade[gradeId]) {
        const res = await getSubjectsByGrade(gradeId);
        setSubjectsByGrade((prev) => ({ ...prev, [gradeId]: res.data }));
      }
    });
  }, [formData.grades]);

 const filtered = users.filter((u) => {
  const name = `${u.name || ""} ${u.surname || ""}`.toLowerCase();
  const username = u.username?.toLowerCase() || "";
  const search = query.toLowerCase();

  let ok = name.includes(search) || username.includes(search);

  if (roleFilter !== "ALL") {
    ok = ok && u.role === roleFilter;
  }

  if (gradeFilter !== "ALL") {
    const gId = Number(gradeFilter);

    if (u.role === "STUDENT") {
      ok = ok && (u as any).gradeId === gId;
    }

    if (u.role === "TEACHER") {
      ok =
        ok &&
        Array.isArray((u as any).teacherGrades) &&
        (u as any).teacherGrades.some((gr: any) => gr.id === gId);
    }
  }

  return ok;
});

  const getRoleIcon = (role: User["role"]) => {
    if (role === "TEACHER") return <UserCog className="text-blue-400" />;
    if (role === "STUDENT") return <GraduationCap className="text-green-400" />;
    return <Shield className="text-yellow-400" />;
  };

  const handleDelete = async (id: number) => {
     const ok = await showConfirm("Haqiqatan ham foydalanuvchini o'chirmoqchimisiz?");
      if (!ok) return;

    await deleteUser(id);
    fetchUsers();
    toast.success("Foydalanuvchi olib tashlandi");
  };

const handleEdit = (user: any) => {
  setEditingUser(user);

  const userGrades =
    user.role === "STUDENT"
      ? user.grade?.id
        ? [user.grade.id]
        : []
      : Array.isArray(user.teacherGrades)
      ? user.teacherGrades.map((g: any) => g.id)
      : [];

  const userSubjects =
    user.role === "TEACHER" && Array.isArray(user.teacherSubjects)
      ? user.teacherSubjects.map((s: any) => s.id)
      : [];

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

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", surname: "", username: "", password: "", role: "STUDENT", grades: [], subjects: [] });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const sendData: any = {
    name: formData.name,
    surname: formData.surname,
    username: formData.username,
    password: formData.password || undefined,
    role: formData.role
  };

  if (formData.role === "STUDENT") {
    sendData.gradeId = formData.grades[0] || null;
  }

  if (formData.role === "TEACHER") {
    sendData.teacherGradeIds = formData.grades.map((id) => Number(id));
    sendData.teacherSubjectIds = formData.subjects.map((id) => Number(id));
  }

  try {
    if (editingUser) {
      await updateUser(editingUser.id, sendData);
      toast.success("Foydalanuvchi yangilandi");
    } else {
      await createUser(sendData);
      toast.success("Yangi foydalanuvchi qo'shildi");
    }
    setShowModal(false);
    fetchUsers();
  } catch (err: any) {
    console.error(err);
    toast.error("Xatolik yuz berdi");
  }
};


  const UserCard = (u: User) => {
    const card = (
      <div className="bg-gray-800 hover:bg-gray-700 transition rounded p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {getRoleIcon(u.role)}
          <div>
            <p className="text-lg">{u.name} {u.surname}</p>
            <p className="text-sm text-gray-400">{u.username}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {u.role !== "ADMIN" && (
            <>
              <button onClick={() => handleEdit(u)}><Edit className="text-yellow-400 cursor-pointer" /></button>
              <button onClick={() => handleDelete(u.id)}><Trash2 className="text-red-500 cursor-pointer" /></button>
              <Link href={`/admin/users/${u.id}`}><ChevronRight /></Link>
            </>
          )}
        </div>
      </div>
    );

    if (u.role === "ADMIN") return <div key={u.id} className="cursor-not-allowed opacity-70">{card}</div>;
    return <div key={u.id}>{card}</div>;
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users/> Foydalanuvchilar ({users.length})</h1>
        <button className="flex items-center gap-1 bg-blue-500 px-3 py-2 rounded hover:bg-blue-600 cursor-pointer" onClick={handleAdd}>
          <Plus />Foydalanuvchi Qo'shish
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-800 p-2 pl-10 rounded"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="ALL">Barchasi</option>
          <option value="STUDENT">O'quvchilar</option>
          <option value="TEACHER">O'qituvchilar</option>
        </select>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="ALL">Sinflar</option>
          {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">{filtered.map(UserCard)}</div>

     {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">{editingUser ? "Tahrirlash" : "Yangi foydalanuvchi"}</h2>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="p-2 rounded bg-gray-800"
          placeholder="Ism"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          className="p-2 rounded bg-gray-800"
          placeholder="Familiya"
          value={formData.surname}
          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
        />
        <input
          className="p-2 rounded bg-gray-800"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={editingUser ? "Yangi parol (ixtiyoriy)" : "Parol"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex gap-2">
          <label>
            <input
              type="radio"
              value="STUDENT"
              checked={formData.role === "STUDENT"}
              disabled={editingUser?.role === "ADMIN"}
              onChange={() => setFormData({ ...formData, role: "STUDENT", grades: [], subjects: [] })}
            /> O'quvchi
          </label>
          <label>
            <input
              type="radio"
              value="TEACHER"
              checked={formData.role === "TEACHER"}
              disabled={editingUser?.role === "ADMIN"}
              onChange={() => setFormData({ ...formData, role: "TEACHER", grades: [], subjects: [] })}
            /> O'qituvchi
          </label>
        </div>
        <div>
          <h4 className="font-semibold">Sinflar</h4>
          <div className="max-h-32 overflow-y-auto pr-1">
            {grades.map((g) => {
              const checked = formData.grades.includes(g.id);
              const canSelect = formData.role === "TEACHER" || (formData.role === "STUDENT" && (formData.grades[0] === g.id || formData.grades.length === 0));

              return (
                <label key={g.id} className={`flex items-center gap-2 ${!canSelect ? "opacity-50" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={!canSelect}
                    checked={checked}
                    onChange={(e) => {
                      let newGrades = [...formData.grades];
                      if (e.target.checked) newGrades = formData.role === "STUDENT" ? [g.id] : [...newGrades, g.id];
                      else newGrades = newGrades.filter((id) => id !== g.id);
                      setFormData({ ...formData, grades: newGrades, subjects: formData.role === "TEACHER" ? formData.subjects : [] });
                    }}
                  />
                  {g.name}
                </label>
              );
            })}
          </div>
        </div>

        {formData.role === "TEACHER" && (
          <div className="max-h-32 overflow-y-auto pr-1 border-t border-gray-700 pt-2">
            {formData.grades.map((gradeId) =>
              subjectsByGrade[gradeId]?.map((s) => (
                <label key={s.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(s.id)}
                    onChange={(e) => {
                      let newSubjects = [...formData.subjects];
                      if (e.target.checked) newSubjects.push(s.id);
                      else newSubjects = newSubjects.filter((id) => id !== s.id);
                      setFormData({ ...formData, subjects: newSubjects });
                    }}
                  />
                  {s.name}
                </label>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600" onClick={() => setShowModal(false)}>Bekor qilish</button>
          <button type="submit" className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600">Saqlash</button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
