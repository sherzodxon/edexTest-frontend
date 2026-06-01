"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users2, Plus, Minus, Trash2, UserPlus, Loader2, X, Search, 
  CheckCircle2, UserCheck, Users, History, Calendar, Star,
  TrendingUp, Award, Loader, Check, Filter, BarChart2, ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";
import useConfirmToast from "@/components/hooks/useConfirmToast";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

// Sana yordamchi funksiyalar
const getMonthRange = (offset = 0) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(now.setDate(diff));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    from: mon.toISOString().split("T")[0],
    to: sun.toISOString().split("T")[0],
  };
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showPointModal, setShowPointModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pointAction, setPointAction] = useState<{ type: "plus" | "minus"; target: "group" | "student"; id: number | null }>({ type: "plus", target: "group", id: null });
  const [pointValue, setPointValue] = useState("");
  const [pointDesc, setPointDesc] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);

  // --- RANGE STATS STATE ---
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [rangeFrom, setRangeFrom] = useState(getMonthRange().from);
  const [rangeTo, setRangeTo] = useState(getMonthRange().to);
  const [statsGroupId, setStatsGroupId] = useState<number | "">("");
  const [activePreset, setActivePreset] = useState<"week" | "month" | "prev" | "custom">("month");

  const presets = [
    { key: "week",  label: "Bu hafta",   range: getWeekRange() },
    { key: "month", label: "Bu oy",      range: getMonthRange(0) },
    { key: "prev",  label: "O'tgan oy",  range: getMonthRange(-1) },
    { key: "custom",label: "Boshqa",     range: null },
  ] as const;

  const applyPreset = (key: typeof activePreset) => {
    setActivePreset(key);
    const preset = presets.find(p => p.key === key);
    if (preset?.range) {
      setRangeFrom(preset.range.from);
      setRangeTo(preset.range.to);
    }
  };

  const fetchRangeStats = async () => {
    setStatsLoading(true);
    setStatsData(null);
    try {
      const token = localStorage.getItem("token");
      const params: any = { from: rangeFrom, to: rangeTo };
      if (statsGroupId !== "") params.groupId = statsGroupId;
      const res = await axios.get(`${API_BASE_URL}/points/range-stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setStatsData(res.data);
    } catch {
      toast.error("Statistikani yuklab bo'lmadi");
    } finally {
      setStatsLoading(false);
    }
  };

  const openStatsModal = () => {
    setShowStatsModal(true);
    fetchRangeStats();
  };

  // Log tanlash
  const toggleSelect = (id: number) => setSelectedLogIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedLogIds(selectedLogIds.length === logs.length ? [] : logs.map(l => l.id));

  const { showConfirm } = useConfirmToast();

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } });
      setGroups(res.data);
    } catch {
      toast.error("Guruhlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Nom kiriting");
    setBtnLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/groups`, { name: newGroupName }, { headers: { Authorization: `Bearer ${token}` } });
      setNewGroupName("");
      fetchGroups();
      toast.success("Guruh yaratildi");
    } catch { toast.error("Xatolik yuz berdi"); }
    finally { setBtnLoading(false); }
  };

  const handleDeleteGroup = async (id: number) => {
    const confirm = await showConfirm("Guruhni o'chirmoqchimisiz?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchGroups();
      toast.success("Guruh o'chirildi");
    } catch { toast.error("Guruhda o'quvchilar bo'lishi mumkin"); }
  };

  const handlePointSubmit = async () => {
    if (!pointValue || Number(pointValue) <= 0) return toast.error("Ball miqdorini kiriting");
    try {
      const token = localStorage.getItem("token");
      const finalPoints = pointAction.type === "plus" ? Number(pointValue) : -Number(pointValue);
      const payload: any = { points: finalPoints, description: pointDesc || "Admin tomonidan o'zgartirildi" };
      if (pointAction.target === "group") payload.groupId = pointAction.id;
      else payload.studentId = pointAction.id;
      await axios.post(`${API_BASE_URL}/points/admin/adjust`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Ball yozildi");
      setShowPointModal(false);
      setPointValue("");
      setPointDesc("");
      fetchGroups();
      if (showMembersModal) openMembersModal(selectedGroup);
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const openArchive = async (group: any) => {
    setSelectedGroup(group);
    setShowArchiveModal(true);
    setLogsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/points/logs?groupId=${group.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(res.data);
    } catch { toast.error("Tarixni yuklab bo'lmadi"); }
    finally { setLogsLoading(false); }
  };

  const cancelPointLogs = async (ids: number | number[]) => {
    const targetIds = Array.isArray(ids) ? ids : [ids];
    if (targetIds.length === 0) return;
    const confirm = await showConfirm(targetIds.length === 1 ? "Ushbu ballni bekor qilmoqchimisiz?" : `Tanlangan ${targetIds.length} ta ballni bekor qilmoqchimisiz?`);
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await Promise.all(targetIds.map(id => axios.delete(`${API_BASE_URL}/points/admin/cancel/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      setLogs(prev => prev.filter(l => !targetIds.includes(l.id)));
      setSelectedLogIds([]);
      fetchGroups();
      toast.success(targetIds.length === 1 ? "Ball bekor qilindi" : "Barcha tanlangan ballar bekor qilindi");
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const openAddModal = async (group: any) => {
    setSelectedGroup(group);
    setSelectedIds([]);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data.filter((u: any) => u.role === "STUDENT" && !u.groupId));
      setShowAddModal(true);
    } catch { toast.error("Yuklashda xatolik"); }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return toast.error("O'quvchilarni tanlang");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/groups/${selectedGroup.id}/add-students`, { studentIds: selectedIds }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("O'quvchilar qo'shildi");
      setShowAddModal(false);
      fetchGroups();
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const openMembersModal = async (group: any) => {
    setSelectedGroup(group);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/groups/${group.id}/students`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data);
      setShowMembersModal(true);
    } catch { toast.error("A'zolarni yuklashda xatolik"); }
  };

  const handleRemoveFromGroup = async (studentId: number) => {
    const confirm = await showConfirm("O'quvchini guruhdan chiqarmoqchimisiz?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/groups/remove-student`, { studentId }, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(prev => prev.filter(s => s.id !== studentId));
      fetchGroups();
      toast.success("O'quvchi chiqarildi");
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-green-600" size={40} /></div>;

  return (
    <div className="text-gray min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Users2 size={28} className="text-[#00CED1]" />
            </div>
            Guruhlar
          </h1>
          {/* Statistika tugmasi */}
          <button
            onClick={openStatsModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl transition-all text-sm font-bold"
          >
            <BarChart2 size={16} /> Statistika
          </button>
        </div>
        <div className="flex gap-3 w-full md:w-auto bg-gray-900/50 p-2 rounded-2xl border border-gray-800">
          <input
            type="text"
            placeholder="Yangi guruh nomi..."
            className="bg-transparent px-4 py-2 w-full md:w-64 outline-none font-medium"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button
            disabled={btnLoading}
            onClick={handleCreateGroup}
            className="bg-[#27a55d] hover:bg-[#218c4f] text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#27a55d]/20 active:scale-95 font-bold uppercase text-xs tracking-wider"
          >
            {btnLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} Yaratish
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-6 hover:border-blue-500/50 transition-all duration-500 shadow-2xl relative group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2 items-center">
                <div className="p-3 bg-gray-800 rounded-2xl text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Users size={22} />
                </div>
                <span className="text-sm font-bold">{group._count?.students || 0} ta</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openArchive(group)} className="p-2.5 text-gray-500 hover:bg-amber-500/10 hover:text-amber-500 rounded-xl transition-all"><History size={20} /></button>
                <button onClick={() => handleDeleteGroup(group.id)} className="p-2.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"><Trash2 size={20} /></button>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <h3 className="text-xl font-black text-center mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{group.name}</h3>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative text-6xl font-[1000] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 leading-none">
                  {(group.totalGroupPoints || 0) + (group.totalPoints || 0)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex gap-2">
                <button onClick={() => { setPointAction({ type: "plus", target: "group", id: group.id }); setSelectedGroup(group); setShowPointModal(true); }} className="flex-1 bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white py-3 rounded-2xl transition-all flex justify-center border border-green-500/10"><Plus size={22} /></button>
                <button onClick={() => { setPointAction({ type: "minus", target: "group", id: group.id }); setSelectedGroup(group); setShowPointModal(true); }} className="flex-1 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white py-3 rounded-2xl transition-all flex justify-center border border-red-500/10"><Minus size={22} /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openAddModal(group)} className="flex-[2] bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white py-3 rounded-2xl text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all"><UserPlus size={16} /> Biriktirish</button>
                <button onClick={() => openMembersModal(group)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-2xl text-gray-400 hover:text-white transition-all flex justify-center items-center"><UserCheck size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============ STATS MODAL ============ */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-gray-950 w-full max-w-6xl rounded-[3rem] border border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><BarChart2 size={24} /></div>
                <div>
                  <h2 className="text-xl font-black">Statistika</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Vaqt oralig'i bo'yicha</p>
                </div>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="p-3 hover:bg-gray-800 rounded-2xl transition-all text-gray-500 hover:text-white"><X /></button>
            </div>

            {/* Filter Panel */}
            <div className="p-6 border-b border-gray-800 space-y-4 bg-gray-900/30">
              {/* Preset tugmalar */}
              <div className="flex gap-2 flex-wrap">
                {presets.map(p => (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      activePreset === p.key
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom sana + guruh filter */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-700">
                  <Calendar size={14} className="text-gray-500" />
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={e => { setRangeFrom(e.target.value); setActivePreset("custom"); }}
                    className="bg-transparent text-sm font-bold outline-none text-white"
                  />
                </div>
                <span className="text-gray-600 font-black">—</span>
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-700">
                  <Calendar size={14} className="text-gray-500" />
                  <input
                    type="date"
                    value={rangeTo}
                    onChange={e => { setRangeTo(e.target.value); setActivePreset("custom"); }}
                    className="bg-transparent text-sm font-bold outline-none text-white"
                  />
                </div>

                {/* Guruh filter */}
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-700 min-w-[160px]">
                  <Filter size={14} className="text-gray-500" />
                  <select
                    value={statsGroupId}
                    onChange={e => setStatsGroupId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-transparent text-sm font-bold outline-none text-white flex-1"
                  >
                    <option value="">Barcha guruhlar</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={fetchRangeStats}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  {statsLoading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                  Ko'rish
                </button>
              </div>
            </div>

            {/* Stats Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {statsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="animate-spin text-purple-500" />
                  <p className="text-gray-500 text-sm font-bold">Yuklanmoqda...</p>
                </div>
              ) : !statsData ? (
                <div className="text-center py-20">
                  <BarChart2 size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
                  <p className="text-gray-600 font-bold italic">Yuqoridagi filterni qo'llab "Ko'rish" tugmasini bosing</p>
                </div>
              ) : statsData.groupStats.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 font-bold italic">Bu vaqt oralig'ida ma'lumot topilmadi</p>
                </div>
              ) : (
                <>
                  {/* Period info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                    <Calendar size={12} />
                    {new Date(statsData.period.from).toLocaleDateString("uz-UZ")} — {new Date(statsData.period.to).toLocaleDateString("uz-UZ")}
                    <span className="ml-auto text-purple-400">{statsData.recentLogs.length} ta log</span>
                  </div>

                  {/* 2 ustunli layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* CHAP: Guruh reytingi */}
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Award size={12} /> Guruhlar reytingi
                      </p>
                      {statsData.groupStats.map((g: any, i: number) => {
                        const maxPts = statsData.groupStats[0]?.totalPoints || 1;
                        const pct = Math.round((g.totalPoints / maxPts) * 100);
                        return (
                          <div key={g.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 hover:border-purple-500/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`text-lg font-[1000] w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-600"}`}>
                                  #{i + 1}
                                </span>
                                <span className="font-black text-white">{g.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-[1000] text-purple-400">{g.totalPoints}</span>
                                <span className="text-xs text-gray-600 font-bold">ball</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            {g.students.slice(0, 3).map((s: any, si: number) => (
                              <div key={s.id} className="flex items-center justify-between py-1.5 border-t border-gray-800/50">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 w-4">{si + 1}</span>
                                  <span className="text-sm font-bold text-gray-300">{s.name} {s.surname}</span>
                                </div>
                                <span className={`text-sm font-black ${s.points > 0 ? "text-green-400" : s.points < 0 ? "text-red-400" : "text-gray-500"}`}>
                                  {s.points > 0 ? "+" : ""}{s.points}
                                </span>
                              </div>
                            ))}
                            {g.students.length > 3 && (
                              <p className="text-xs text-gray-600 font-bold mt-2 text-center">+{g.students.length - 3} ta boshqa</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* O'NG: So'nggi loglar */}
                    {statsData.recentLogs.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                          <History size={12} /> So'nggi harakatlar
                          <span className="ml-auto text-purple-400 normal-case font-bold">{statsData.recentLogs.length} ta</span>
                        </p>
                        <div className="space-y-2">
                          {statsData.recentLogs.slice(0, 20).map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-[1000] w-10 text-center shrink-0 ${log.points > 0 ? "text-green-400" : "text-red-400"}`}>
                                  {log.points > 0 ? `+${log.points}` : log.points}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white truncate">
                                    {log.student ? `${log.student.name} ${log.student.surname}` : log.group?.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {log.teacher ? `${log.teacher.name} ${log.teacher.surname}` : "Admin"} · {log.group?.name}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-600 font-bold shrink-0 ml-2">
                                {new Date(log.createdAt).toLocaleDateString("uz-UZ")}
                              </span>
                            </div>
                          ))}
                          {statsData.recentLogs.length > 20 && (
                            <p className="text-center text-xs text-gray-600 font-bold py-2">
                              +{statsData.recentLogs.length - 20} ta log arxivda
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ POINT MODAL ============ */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-gray-950 w-full max-w-sm rounded-[3rem] border border-gray-800 p-8 shadow-2xl">
            <input
              autoFocus
              type="text"
              placeholder="0"
              className="w-full bg-transparent text-center text-8xl font-[1000] outline-none mb-8 placeholder:text-gray-800"
              value={pointValue}
              onChange={(e) => setPointValue(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPointModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:text-white transition-colors">Bekor qilish</button>
              <button onClick={handlePointSubmit} className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-white ${pointAction.type === "plus" ? "bg-green-600 shadow-lg shadow-green-600/20" : "bg-red-600 shadow-lg shadow-red-600/20"}`}>Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD STUDENT MODAL ============ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-950 w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-black tracking-tight">O'quvchi biriktirish</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X /></button>
            </div>
            <div className="p-4 bg-gray-900/50">
              <div className="relative">
                <Search className="absolute left-4 top-3 text-gray-500" size={18} />
                <input type="text" placeholder="Ism bo'yicha qidirish..." className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-blue-500" onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
              {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                <div key={s.id} onClick={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedIds.includes(s.id) ? "bg-blue-600/10 border-blue-500 text-blue-400" : "bg-gray-900 border-gray-800 hover:border-gray-700"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedIds.includes(s.id) ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"}`}>{s.name[0]}</div>
                    <span className="font-bold">{s.name} {s.surname}</span>
                  </div>
                  {selectedIds.includes(s.id) && <CheckCircle2 size={20} />}
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-gray-800 bg-gray-900/50">
              <button onClick={handleAssign} disabled={selectedIds.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">
                Tanlanganlarni qo'shish ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MEMBERS MODAL ============ */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-950 w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">{selectedGroup?.name}</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Guruh a'zolari</p>
              </div>
              <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-3xl group">
                  <div className="flex flex-col">
                    <p className="font-black text-[15px]">{s.name} {s.surname}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <p className="text-xs font-bold text-gray-400"><span className="text-blue-400">{s.totalPoints || 0} ball</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setPointAction({ type: "plus", target: "student", id: s.id }); setShowPointModal(true); }} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white rounded-xl transition-all"><Plus size={16} /></button>
                    <button onClick={() => { setPointAction({ type: "minus", target: "student", id: s.id }); setShowPointModal(true); }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Minus size={16} /></button>
                    <button onClick={() => handleRemoveFromGroup(s.id)} className="p-2 text-gray-600 hover:text-red-500 ml-1 transition-colors"><X size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ ARCHIVE MODAL ============ */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 text-white">
          <div className="bg-gray-950 w-full max-w-2xl rounded-[3rem] border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><History size={24} /></div>
                <div>
                  <h2 className="text-xl font-black">{selectedGroup?.name}</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Ballar tarixi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedLogIds.length > 0 && (
                  <button onClick={() => cancelPointLogs(selectedLogIds)} className="bg-red-500 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <Trash2 size={14} /> O'chirish ({selectedLogIds.length})
                  </button>
                )}
                <button onClick={() => { setShowArchiveModal(false); setSelectedLogIds([]); }} className="p-3 hover:bg-gray-800 rounded-2xl transition-all text-gray-500 hover:text-white"><X /></button>
              </div>
            </div>

            {!logsLoading && logs.length > 0 && (
              <div className="px-8 py-3 bg-gray-900/30 border-b border-gray-800/50 flex items-center gap-3">
                <input type="checkbox" checked={selectedLogIds.length === logs.length} onChange={toggleSelectAll} className="w-5 h-5 rounded-md border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Barchasini tanlash</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {logsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20">
                  <History size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
                  <p className="text-gray-600 font-bold italic">Hozircha tarix bo'sh</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} onClick={() => toggleSelect(log.id)} className={`bg-gray-900 border transition-all cursor-pointer rounded-3xl p-4 flex items-center justify-between group ${selectedLogIds.includes(log.id) ? "border-amber-500/50 bg-amber-500/5" : "border-gray-800 hover:border-gray-700"}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedLogIds.includes(log.id) ? "bg-amber-500 border-amber-500" : "border-gray-700"}`}>
                        {selectedLogIds.includes(log.id) && <Check size={12} strokeWidth={4} className="text-black" />}
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-[1000] text-xl ${log.points > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-blue-400">{log.student ? `${log.student.name} ${log.student.surname}` : "Guruhga"}</span>
                          <span className="text-gray-700 font-black">/</span>
                          <span className="text-gray-400 text-sm font-bold italic">{log.teacher ? `${log.teacher.name} ${log.teacher.surname}` : "Admin"}</span>
                        </div>
                        <p className="text-gray-500 text-xs font-medium max-w-sm line-clamp-1 italic">"{log.description}"</p>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-600 tracking-tighter mt-1">
                          <Calendar size={10} /> {new Date(log.createdAt).toLocaleString("uz-UZ")}
                        </div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); cancelPointLogs(log.id); }} className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl md:opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}