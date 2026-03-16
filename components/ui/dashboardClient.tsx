"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

// Zarrachalar komponenti (O'zgarishsiz)
function MagicParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-yellow-400 opacity-40"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            left: Math.random() * 100 + "%",
            top: "110%",
            boxShadow: "0 0 10px 2px rgba(251,191,36,0.5)",
            animation: `float-tv ${10 + Math.random() * 15}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            willChange: "transform",
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes float-tv {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(-120vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const HOUSE_COLORS = [
  { from: "#450a0a", to: "#1a0505", accent: "#fbbf24" },
  { from: "#064e3b", to: "#021a14", accent: "#a3e635" },
  { from: "#1e3a8a", to: "#0a183d", accent: "#60a5fa" },
  { from: "#78350f", to: "#2a1305", accent: "#fde68a" },
];

export default function DashboardClient() {
  // Boshlang'ich holat: 4 ta placeholder obyekt
  const [groups, setGroups] = useState<any[]>(
    [1, 2, 3, 4].map((i) => ({
      id: `loading-${i}`,
      name: "Yuklanmoqda...",
      totalPoints: 0,
      students: []
    }))
  );
  
  const [logs, setLogs] = useState<any[]>([]);
  const [scoreFlash, setScoreFlash] = useState<Record<number, boolean>>({});

  // fetchData funksiyasi: groups ga bog'liq emas, shuning uchun intervalni buzmaydi
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/points/weekly-stats?t=${Date.now()}`);
      const { groupStats, recentLogs } = res.data;

      if (!groupStats) return;

      // Functional Update - prevGroups orqali tekshiramiz
      setGroups((prevGroups) => {
        const flashes: Record<number, boolean> = {};
        
        groupStats.slice(0, 4).forEach((g: any) => {
          const currentGroup = prevGroups.find(p => p.id === g.id);
          // Faqat ball o'zgarganda miltillashni yoqamiz
          if (currentGroup && !String(currentGroup.id).includes('loading') && currentGroup.totalPoints !== g.totalPoints) {
            flashes[g.id] = true;
          }
        });

        if (Object.keys(flashes).length > 0) {
          setScoreFlash(flashes);
          setTimeout(() => setScoreFlash({}), 3000);
        }

        // 8 ta bo'lib ketmasligi uchun massivni to'liq almashtiramiz
        return groupStats.slice(0, 4);
      });

      setLogs(recentLogs || []);
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    }
  }, []); // <--- Bo'sh dependency! Muhim!

  useEffect(() => {
    fetchData(); // Birinchi marta ma'lumotni olib kelish

    const THIRTY_MINS = 30 * 60 * 1000;
    const interval = setInterval(() => {
      fetchData();
    }, THIRTY_MINS);

    return () => clearInterval(interval);
  }, [fetchData]); // fetchData o'zgarmas funksiya bo'lgani uchun interval buzilmaydi

  return (
    <div className="fixed inset-0 bg-[#020617] text-white font-serif overflow-hidden select-none">
      <link href="https://fonts.cdnfonts.com/css/harry-p" rel="stylesheet" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#051e16] to-black opacity-80" />
      
      <MagicParticles />

      <div className="relative z-10 text-center py-2 bg-black/40 border-b border-yellow-600/20">
        <h1 className="text-2xl tracking-[0.3em] text-yellow-500 font-bold" style={{ fontFamily: "'Harry P', sans-serif" }}>
          EDEX HAFTALIK REYTING
        </h1>
      </div>

      <div className="relative z-10 grid grid-cols-2 grid-rows-2 gap-4 p-4 h-[calc(100vh-80px)]">
        {groups.map((group, idx) => {
          const theme = HOUSE_COLORS[idx % HOUSE_COLORS.length];
          // O'quvchilarni render vaqtida dublyaj qilamiz (Scroller uchun)
          const scrollStudents = group.students?.length > 0 ? [...group.students, ...group.students] : [];

          return (
            <div
              key={group.id}
              className={`relative flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-black/50 backdrop-blur-sm transition-all duration-1000 ${
                scoreFlash[group.id] ? 'ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(251,191,36,0.4)]' : ''
              }`}
            >
              {/* Header */}
              <div 
                className="p-2 flex justify-between items-center border-b shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, borderColor: theme.accent + '55' }}
              >
                <h2 className="text-4xl" style={{ fontFamily: "'Harry P', sans-serif" }}>{group.name}</h2>
                <div className="bg-black/60 px-5 py-1 rounded-xl border-2" style={{ borderColor: theme.accent }}>
                  <span className="text-4xl text-yellow-400" style={{ fontFamily: "'Harry P', sans-serif" }}>
                    {group.totalPoints}
                  </span>
                </div>
              </div>

              {/* Students Scroll */}
              <div className="flex-1 relative overflow-hidden bg-black/20">
                <div className="absolute w-full animate-student-scroll">
                  {scrollStudents.map((st: any, i: number) => (
                    <div key={`${group.id}-st-${i}`} className="flex justify-between items-center bg-white/5 mx-3 my-2 px-4 py-3 rounded-xl border border-white/5">
                      <span className="text-xl opacity-90 truncate max-w-[220px]">
                        {(i % (group.students?.length || 1)) + 1}. {st.name} {st.surname?.[0]}.
                      </span>
                      <span className={`text-2xl font-bold ${st.totalPoints < 0 ? 'text-red-500' : 'text-green-400'}`} style={{ fontFamily: "'Harry P', sans-serif" }}>
                         {st.totalPoints > 0 ? `+${st.totalPoints}` : st.totalPoints}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent z-10" />
              </div>

              {/* Log Marquee */}
              <div className="bg-black/80 h-12 flex items-center px-4 border-t border-white/10 overflow-hidden">
                <div className="flex gap-12 animate-tv-marquee whitespace-nowrap">
                  {logs.filter(l => l.groupId === group.id).map((log, i) => (
                    <div key={`log-${group.id}-${i}`} className="text-lg flex items-center gap-2">
                      <b className={`${log.points < 0 ? 'text-red-500' : 'text-yellow-500'} font-bold`}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </b> 
                      <span className="opacity-90">{log.student?.name}</span>
                      <span className="text-xs opacity-40 italic font-sans translate-y-[1px]">
                        - {`${log.teacher?.name} ${log.teacher?.surname}`}
                      </span>
                      <span className="mx-1 opacity-20">✦</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .animate-tv-marquee { animation: horizontal-scroll 45s linear infinite; }
        .animate-student-scroll { animation: vertical-scroll 30s linear infinite; }
        @keyframes horizontal-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes vertical-scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>
    </div>
  );
}