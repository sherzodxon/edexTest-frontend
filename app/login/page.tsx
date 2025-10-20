"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/authSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = await dispatch(
      loginUser({ username, password }) as any
    );
    if (loginUser.fulfilled.match(action)) {
      const role = action.payload.user.role;
      if (role === "ADMIN") router.push("/admin");
      if (role === "TEACHER") router.push("/teacher");
      if (role === "STUDENT") router.push("/student");
    }
  };

  // Agar user allaqachon login bo‘lgan bo‘lsa
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") router.replace("/admin");
      if (user.role === "TEACHER") router.replace("/teacher");
      if (user.role === "STUDENT") router.replace("/student");
    }
  }, [user]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Kirish</h1>

        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}
