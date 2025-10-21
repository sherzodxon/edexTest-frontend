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
}
interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  role: string;
  grade?: Grade | null;
  teacherGrades?: Grade[];
  teacherSubjects?: Subject[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    surname: "",
    username: "",
    password: "",
    role: "TEACHER",
    gradeId: "",
    teacherGradeIds: [] as number[],
    teacherSubjectIds: [] as number[],
  });

  // 🔹 Ma'lumotlarni olish
  const fetchData = async () => {
    const [usersRes, gradesRes, subjectsRes] = await Promise.all([
      api.get("/users"),
      api.get("/grades"),
      api.get("/subjects"),
    ]);
    setUsers(usersRes.data);
    setGrades(gradesRes.data);
    setSubjects(subjectsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Foydalanuvchini yaratish yoki tahrirlash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, form);
      } else {
        await api.post("/users", form);
      }
      setEditingUser(null);
      setForm({
        name: "",
        surname: "",
        username: "",
        password: "",
        role: "TEACHER",
        gradeId: "",
        teacherGradeIds: [],
        teacherSubjectIds: [],
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  };

  // 🔹 Foydalanuvchini o‘chirish
  const handleDelete = async (id: number) => {
    if (confirm("Rostdan ham o‘chirilsinmi?")) {
      await api.delete(`/users/${id}`);
      fetchData();
    }
  };

  // 🔹 Tahrirlash uchun ma’lumotni formaga yuklash
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      surname: user.surname,
      username: user.username,
      password: "",
      role: user.role,
      gradeId: user.grade?.id || "",
      teacherGradeIds: user.teacherGrades?.map((g) => g.id) || [],
      teacherSubjectIds: user.teacherSubjects?.map((s) => s.id) || [],
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        👤 Foydalanuvchilar boshqaruvi ({users.length} ta)
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-2  p-4 rounded mb-6"
      >
        <input
          placeholder="Ism"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          placeholder="Familiya"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          placeholder="Login"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="border p-2 rounded"
          required
        />
        {!editingUser && (
          <input
            placeholder="Parol"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded"
            required
          />
        )}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="TEACHER">O'qituvchi</option>
          <option value="STUDENT">O'quvchi</option>
        </select>

        {/* Agar student bo‘lsa */}
        {form.role === "STUDENT" && (
          <select
            value={form.gradeId}
            onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">Sinf tanlang</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}

        {form.role === "TEACHER" && (
          <>
            <select
              multiple
              value={form.teacherGradeIds}
              onChange={(e) =>
                setForm({
                  ...form,
                  teacherGradeIds: Array.from(e.target.selectedOptions, (opt) =>
                    Number(opt.value)
                  ),
                })
              }
              className="border p-2 rounded h-32"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              multiple
              value={form.teacherSubjectIds}
              onChange={(e) =>
                setForm({
                  ...form,
                  teacherSubjectIds: Array.from(e.target.selectedOptions, (opt) =>
                    Number(opt.value)
                  ),
                })
              }
              className="border p-2 rounded h-32"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded mt-2"
        >
          {editingUser ? "Yangilash" : "Qo‘shish"}
        </button>
      </form>

      {/* RO‘YXAT */}
      <table className="w-full border">
        <thead className="text-left">
          <tr>
            <th className="p-2">Ism</th>
            <th className="p-2">Familiya</th>
            <th className="p-2">Login</th>
            <th className="p-2">Ro'li</th>
            <th className="p-2">Sinf</th>
            <th className="p-2">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.surname}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                {u.role === "STUDENT"
                  ? u.grade?.name
                  : u.teacherSubjects?.map((s) => s.name).join(", ")}
              </td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
