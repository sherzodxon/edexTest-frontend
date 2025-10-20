"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/axios";
import socket from "@/lib/socket";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginRequest({ username, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // socket ulanish + foydalanuvchini ro'yxatdan o'tkazish
      socket.connect();
      socket.emit("join_user", user.id);

      if (user.role === "ADMIN") router.push("/admin");
      else if (user.role === "TEACHER") router.push("/teacher");
      else router.push("/student");
    } catch (err: any) {
      console.error(err);
      alert("Login xato");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Login</h1>
      <input
        placeholder="Username"
        className="border p-2 w-full mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        className="border p-2 w-full mb-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 w-full">Kirish</button>
    </form>
  );
}
