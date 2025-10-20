"use client";
import { useState, useEffect } from "react";
import  api  from "../../../lib/axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    role: "TEACHER",
  });

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/users", form);
    setForm({ name: "", surname: "", username: "", password: "", role: "TEACHER" });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">👤 Foydalanuvchi qo‘shish</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 mb-6">
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
        <input
          placeholder="Parol"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="TEACHER">O‘qituvchi</option>
          <option value="STUDENT">O‘quvchi</option>
        </select>
        <button className="bg-blue-600 text-white rounded p-2" type="submit">
          Qo‘shish
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">📋 Ro‘yxat</h3>
      <ul className="divide-y">
        {users.map((u) => (
          <li key={u.id} className="py-2 flex justify-between">
            <span>{u.name} {u.surname} — {u.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
