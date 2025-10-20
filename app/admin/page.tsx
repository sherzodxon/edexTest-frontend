"use client";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">👑 Admin paneli</h1>
      <div className="space-y-2">
        <Link href="/admin/users" className="block p-3 bg-blue-600 text-white rounded">
          👤 Foydalanuvchilarni boshqarish
        </Link>
        <Link href="/admin/results" className="block p-3 bg-green-600 text-white rounded">
          📊 Test natijalari
        </Link>
      </div>
    </div>
  );
}
