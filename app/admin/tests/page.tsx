"use client";

import { useEffect, useState } from "react";
import api, { deleteTest } from "@/lib/axios";
import { Trash2, FileText, Search } from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
 const { showConfirm } = useConfirmToast();
  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tests");
      setTests(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Testlarni olishda xatolik:", err);
      toast.error("Testlar ma'lumotini olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      tests.filter((t) => t.title.toLowerCase().includes(q))
    );
  }, [query, tests]);

  const handleDelete = async (id: number) => {
    const ok = await showConfirm("Haqiqatan ham testni o'chirmoqchimisiz?");
    if (!ok) return;

    try {
      await deleteTest(id);
      toast.success("Test muvaffaqiyatli o'chirildi");
      fetchTests();
    } catch (err) {
      console.error("Testni o'chirishda xatolik:", err);
      toast.error("Testni o'chirishda xatolik yuz berdi!");
    }
  };

  if (loading) return <div className="p-6 text-white">Yuklanmoqda...</div>;

  return (
    <div className="space-y-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText /> Testlar boshqaruvi ({tests.length})
        </h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Qidirish..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-800 p-2 pl-10 rounded"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">Hech narsa topilmadi.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-800 transition"
            >
              <div>
                <h2 className="font-semibold text-lg">{test.title}</h2>
                <p className="text-gray-400 text-sm">
                  Savollar: {test.questions?.length || 0} ta | Tugash vaqti:{" "}
                  <span className="font-medium">
                    {new Date(test.endTime).toLocaleString()}
                  </span>
                </p>
              </div>

             
              <button onClick={() => handleDelete(test.id)}>
                  <Trash2 className="text-red-500 hover:text-red-300 cursor-pointer" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
