"use client";

import {useEffect, useState} from "react";
import api, {deleteTest} from "@/lib/axios";
import {Trash2, FileText, Search, Eye, Clock} from "lucide-react";
import toast from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";
import {useRouter} from "next/navigation";
import EditTestTimeModal from "@/components/editTestModal";

export default function AdminTestsPage() {
    const [tests,
        setTests] = useState < any[] > ([]);
    const [filtered,
        setFiltered] = useState < any[] > ([]);
    const [query,
        setQuery] = useState("");
    const [loading,
        setLoading] = useState(true);
    const [selectedTest,
        setSelectedTest] = useState < any > (null);

    const {showConfirm} = useConfirmToast();
    const router = useRouter();

    const fetchTests = async() => {
        try {
            setLoading(true);
            const res = await api.get("/tests");
            setTests(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Testlarni olishda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        const q = query.toLowerCase();
        setFiltered(tests.filter((t) => t.title.toLowerCase().includes(q)));
    }, [query, tests]);

    const handleDelete = async(id : number) => {
        const ok = await showConfirm("Haqiqatan ham testni o‘chirmoqchimisiz?");
        if (!ok) 
            return;
        
        try {
            await deleteTest(id);
            toast.success("Test o‘chirildi");
            fetchTests();
        } catch {
            toast.error("Testni o‘chirishda xatolik!");
        }
    };

    if (loading) 
        return <div className="p-6 text-white">Yuklanmoqda...</div>;
    
    return (
        <div className="space-y-4 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-[#DA70D6] w-6 h-6"/>
                    Testlar boshqaruvi
                    <span className="text-orange-300">({tests.length})</span>
                </h1>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4"/>
                <input
                    type="text"
                    placeholder="Qidirish..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-gray-800 p-2 pl-10 rounded"/>
            </div>

            {filtered.length === 0
                ? (
                    <p className="text-gray-400">Hech narsa topilmadi.</p>
                )
                : (
                    <div className="space-y-3">
                        {filtered.map((test) => {
                            const now = new Date();
                            const hasStarted = test.startTime && new Date(test.startTime) <= now;
                            const hasEnded = test.endTime && new Date(test.endTime) < now;

                            return (
                                <div
                                    key={test.id}
                                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-800 transition">
                                    {/* LEFT */}
                                    <div>
                                        <h2 className="font-semibold text-sm sm:text-lg">
                                            {test.title}
                                        </h2>

                                        <p className="text-gray-400 text-xs sm:text-sm">
                                            Fan:{" "}
                                            <span className="text-gray-200 font-medium">
                                                {test.subject
                                                    ?.name || "—"}
                                            </span>
                                            {" "}• Savollar: {test.questions
                                                ?.length || 0}
                                            ta
                                        </p>

                                        <p className="text-gray-400 text-xs sm:text-sm">
                                            Tugash vaqti:{" "}
                                            <span className="font-medium">
                                                {test.endTime
                                                    ? new Date(test.endTime).toLocaleString()
                                                    : "Belgilanmagan"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* View */}
                                        <button
                                            onClick={() => router.push(`/admin/tests/${test.id}`)}
                                            className="p-1 hover:text-blue-400 text-blue-500 cursor-pointer"
                                            title="Testni ko'rish">
                                            <Eye className="w-5 h-5"/>
                                        </button>

                                        {/* Edit time */}
                                        <button
                                            onClick={() => {
                                            if (hasEnded) {
                                                toast.error("Test tugagan. Vaqtni o'zgartirib bo'lmaydi");
                                                return;
                                            }
                                            if (hasStarted) {
                                                toast.error("Test boshlangan. Boshlanish vaqti bloklangan");
                                                return;
                                            }
                                            setSelectedTest(test);
                                        }}
                                            className={`p-1 hover:text-yellow-400 text-yellow-500 cursor-pointer`}
                                            title="Vaqtni o'zgartirish">
                                            <Clock className="w-5 h-5"/>
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(test.id)}
                                            className="p-1 hover:text-red-400 text-red-500 cursor-pointer"
                                            title="O'chirish">
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            {selectedTest && (<EditTestTimeModal
                test={selectedTest}
                onClose={() => setSelectedTest(null)}
                onUpdated={fetchTests}/>)}

        </div>
    );
}
