"use client";

import { useEffect, useState } from "react";
import api, { deleteTest } from "@/lib/axios";
import { 
  Trash2, 
  FileText, 
  Search, 
  Eye, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  Loader
} from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";
import { useRouter } from "next/navigation";
import EditTestTimeModal from "@/components/editTestModal";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const { showConfirm } = useConfirmToast();
  const router = useRouter();

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tests");
      setTests(res.data);
    } catch (err) {
      toast.error("Testlarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const filtered = tests.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    const ok = await showConfirm("Haqiqatan ham ushbu testni o'chirmoqchimisiz?");
    if (!ok) return;

    try {
      await deleteTest(id);
      toast.success("Test o'chirildi");
      fetchTests();
    } catch {
      toast.error("Testni o'chirishda xatolik!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Loader   className="animate-spin text-green-600" size={40} /></div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <FileText className="text-purple-400" size={28} />
            </div>
            Testlar
            <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
              {tests.length} jami
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Imtihonlarni nazorat qilish va vaqtlarini boshqarish</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1E293B] p-3 rounded-2xl border border-gray-800 shadow-sm mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Test nomini yozing..."
            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-purple-500 transition-colors text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-[#1E293B] rounded-3xl border border-dashed border-gray-700">
            <FileText className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-500 font-medium">Hech qanday test topilmadi</p>
          </div>
        ) : (
          filtered.map((test) => {
            const now = new Date();
            const hasStarted = test.startTime && new Date(test.startTime) <= now;
            const hasEnded = test.endTime && new Date(test.endTime) < now;

            return (
              <div
                key={test.id}
                className="group bg-[#1E293B] border border-gray-800 hover:border-purple-500/40 rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${
                    hasEnded ? 'bg-red-500/10' : hasStarted ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`}>
                    <Timer size={24} className={
                      hasEnded ? 'text-red-400' : hasStarted ? 'text-green-400' : 'text-blue-400'
                    } />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {test.title}
                      </h2>
                      {/* Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        hasEnded 
                          ? 'bg-red-500/5 text-red-500 border-red-500/20' 
                          : hasStarted 
                          ? 'bg-green-500/5 text-green-500 border-green-500/20 animate-pulse' 
                          : 'bg-blue-500/5 text-blue-500 border-blue-500/20'
                      }`}>
                        {hasEnded ? "Yakunlangan" : hasStarted ? "Jarayonda" : "Kutilmoqda"}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-purple-500" />
                        <span>Fan: <span className="text-gray-300 font-medium">{test.subject?.name || "—"}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-gray-600" />
                        <span>Savollar: <span className="text-gray-300 font-medium">{test.questions?.length || 0} ta</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-600" />
                        <span>Tugash: <span className="text-gray-300 font-medium">
                          {test.endTime ? new Date(test.endTime).toLocaleString('uz-UZ') : "Belgilanmagan"}
                        </span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center bg-[#0F172A] p-1.5 rounded-xl border border-gray-700/50">
                  <button
                    onClick={() => router.push(`/admin/tests/${test.id}`)}
                    className="p-2.5 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-400 transition-all active:scale-90"
                    title="Ko'rish"
                  >
                    <Eye size={20} />
                  </button>

                  <button
                    onClick={() => {
                      if (hasEnded) return toast.error("Test tugagan. Vaqtni o'zgartirib bo'lmaydi");
                      if (hasStarted) return toast.error("Test boshlangan. Boshlanish vaqti bloklangan");
                      setSelectedTest(test);
                    }}
                    className={`p-2.5 rounded-lg transition-all active:scale-90 ${
                      hasEnded || hasStarted 
                        ? 'opacity-30 cursor-not-allowed text-gray-600' 
                        : 'hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500'
                    }`}
                    title="Vaqtni o'zgartirish"
                  >
                    <Clock size={20} />
                  </button>

                  <div className="w-[1px] h-6 bg-gray-700 mx-1"></div>

                  <button
                    onClick={() => handleDelete(test.id)}
                    className="p-2.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all active:scale-90"
                    title="O'chirish"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTest && (
        <EditTestTimeModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
          onUpdated={fetchTests}
        />
      )}
    </div>
  );
}