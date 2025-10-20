"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RootState } from "@/store/store";

interface Props {
  children: React.ReactNode;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export default function ProtectedRoute({ children, role }: Props) {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else if (user.user.role !== role) {
      router.push("/");
    }
  }, [user, router, role]);

  if (!user || user.user.role !== role) {
    return null;
  }

  return <>{children}</>;
}
