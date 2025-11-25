"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginUser } from "@/store/authSlice";
import { RootState } from "@/store/store";
import EdexLogo from "@/components/ui/logo";


const schema = z.object({
  username: z.string().min(1, "Login majburiy"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const action = await dispatch(loginUser(data) as any);
    if (loginUser.fulfilled.match(action)) {
      const role = action.payload.user.role;
      if (role === "ADMIN") router.push("/admin/users");
      if (role === "TEACHER") router.push("/teacher");
      if (role === "STUDENT") router.push("/student");
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") router.replace("/admin/users");
      if (user.role === "TEACHER") router.replace("/teacher");
      if (user.role === "STUDENT") router.replace("/student");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100"
      >
       <EdexLogo className="text-[#27a55d] w-16 h-16 m-auto"/>
       <p className="text-center mb-5 text-[#27a55d] font-bold">EdEx School</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Login
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="Login kiriting"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                errors.username
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-[#27a55d]"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Parol
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Parol kiriting"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none pr-10 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-[#27a55d]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.8} />
                ) : (
                  <Eye size={20} strokeWidth={1.8} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#27a55d] text-white py-2 rounded-lg hover:bg-[#239255] transition font-medium cursor-pointer"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </div>
      </form>
    </div>
  );
}

