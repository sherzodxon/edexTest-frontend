"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { motion } from "framer-motion";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  return hasMounted;
}

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function MagicParticles() {
  const mounted = useHasMounted();
  if (!mounted) return null; 

  const particles = Array.from({ length: 80 }, (_, i) => ({
    width: seededRand(i * 7 + 1) * 4 + 2,
    height: seededRand(i * 7 + 2) * 4 + 2,
    left: seededRand(i * 7 + 3) * 100,
    top: seededRand(i * 7 + 4) * 100,
    duration: 6 + seededRand(i * 7 + 5) * 10,
    delay: seededRand(i * 7 + 6) * 5,
    color: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#a78bfa" : "#6ee7b7",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full" style={{
            width: p.width + "px", height: p.height + "px",
            left: p.left + "%", top: p.top + "%",
            background: p.color, boxShadow: `0 0 6px 2px ${p.color}`,
            animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.2; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px) scale(1.5); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

function FlyingOwl() {
  const mounted = useHasMounted();
  if (!mounted) return null; 

  return (
    <div className="fixed top-16 left-0 z-20 pointer-events-none" style={{ animation: "owl-fly 18s linear infinite" }}>
      <div style={{ fontSize: "2.5rem", filter: "drop-shadow(0 0 8px #fbbf24)" }}>🦉</div>
      <style jsx>{`
        @keyframes owl-fly {
          0% { transform: translateX(-100px) translateY(0); }
          30% { transform: translateX(30vw) translateY(-40px); }
          60% { transform: translateX(65vw) translateY(10px); }
          100% { transform: translateX(110vw) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

function ForestBackground() {
  const mounted = useHasMounted();
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000005 0%, #0a0515 30%, #0d1a0a 70%, #000000 100%)" }} />
      <div style={{ position: "absolute", top: "5%", right: "12%", width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fffde7 0%, #f9e784 40%, #c8a000 100%)", boxShadow: "0 0 60px 30px rgba(251,191,36,0.18), 0 0 120px 60px rgba(251,191,36,0.07)", animation: "moon-pulse 6s ease-in-out infinite" }} />
    
      {mounted && Array.from({ length: 80 }, (_, i) => {
        const w = seededRand(i * 5 + 100) * 2 + 1;
        return (
          <div key={i} style={{
            position: "absolute", width: w + "px", height: w + "px",
            left: seededRand(i * 5 + 101) * 100 + "%",
            top: seededRand(i * 5 + 102) * 55 + "%",
            background: "#fff", borderRadius: "50%",
            opacity: 0.4 + seededRand(i * 5 + 103) * 0.6,
            animation: `star-twinkle ${2 + seededRand(i * 5 + 104) * 4}s ${seededRand(i * 5 + 105) * 3}s ease-in-out infinite alternate`
          }} />
        );
      })}

      <div style={{ position: "absolute", bottom: "15%", left: 0, right: 0, height: "25%", background: "linear-gradient(to top, rgba(30,50,20,0.7) 0%, transparent 100%)", animation: "fog-drift 12s ease-in-out infinite alternate" }} />
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "55%" }} viewBox="0 0 1200 400" preserveAspectRatio="none">
        {[50, 130, 200, 300, 420, 520, 600, 700, 800, 900, 1000, 1100, 1150].map((x, i) => (
          <g key={i}>
            <polygon points={`${x},${280 + (i % 3) * 20} ${x - 35 - (i % 4) * 8},400 ${x + 35 + (i % 4) * 8},400`} fill={i % 2 === 0 ? "#061008" : "#040c06"} />
            <polygon points={`${x},${230 + (i % 3) * 15} ${x - 25 - (i % 3) * 6},300 ${x + 25 + (i % 3) * 6},300`} fill={i % 2 === 0 ? "#071209" : "#050e07"} />
            <polygon points={`${x},${190 + (i % 2) * 10} ${x - 18},255 ${x + 18},255`} fill="#081408" />
          </g>
        ))}
      </svg>
      <style jsx>{`
        @keyframes moon-pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
        @keyframes star-twinkle { 0% { opacity: 0.2; } 100% { opacity: 1; } }
        @keyframes fog-drift { 0% { transform: translateX(-2%); } 100% { transform: translateX(2%); } }
      `}</style>
    </div>
  );
}

function ScrollingStudents({ students }: { students: any[] }) {
  if (!students || students.length === 0) return null;
  const sorted = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const doubled = [...sorted, ...sorted];

  return (
    <div style={{ overflow: "hidden", flex: 1, position: "relative", minHeight: 0 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 2, background: "linear-gradient(to bottom, rgba(10,18,10,0.95) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, zIndex: 2, background: "linear-gradient(to top, rgba(10,18,10,0.95) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", animation: `scroll-down ${Math.max(sorted.length * 2, 10)}s linear infinite`, padding: "4px 0" }}>
        {doubled.map((st, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(167,139,250,0.06) 100%)", border: "1px solid rgba(167,139,250,0.13)", borderRadius: "10px", padding: "8px 14px", backdropFilter: "blur(4px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Harry P', sans-serif", color: "#fbbf24", fontSize: "22px", minWidth: 24 }}>{(i % sorted.length) + 1}.</span>
              <span style={{ fontFamily: "'Cinzel', serif", color: "#e2e8f0", fontSize: "14px" }}>
                {st.name} {st.surname}
              </span>
            </div>
            <span style={{ fontFamily: "'Harry P', sans-serif", fontSize: "28px", color: (st.totalPoints || 0) >= 0 ? "#6ee7b7" : "#f87171" }}>
              {(st.totalPoints || 0) > 0 ? `+${st.totalPoints}` : st.totalPoints || 0}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{` @keyframes scroll-down { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } } `}</style>
    </div>
  );
}

function LiveMarquee({ logs, groupId }: { logs: any[]; groupId: number }) {
  const groupLogs = logs.filter((l) => l.groupId === groupId).slice(0, 12);
  const items = [...groupLogs, ...groupLogs];

  return (
    <div style={{ height: 48, background: "rgba(0,0,0,0.85)", borderTop: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 5, background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", display: "flex", alignItems: "center", padding: "0 12px" }}>
        <span style={{ fontFamily: "'Harry P', sans-serif", color: "#fbbf24", fontSize: "18px" }}>⚡ LIVE</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", animation: "marquee-h 28s linear infinite", paddingLeft: 80 }}>
        {items.length > 0 ? items.map((log, i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", marginRight: 40, gap: 8, borderLeft: "1px solid rgba(167,139,250,0.2)", paddingLeft: 16 }}>
            <span style={{ fontFamily: "'Harry P', sans-serif", fontSize: "24px", color: log.points > 0 ? "#6ee7b7" : "#f87171" }}>{log.points > 0 ? `+${log.points}` : log.points}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#e2e8f0" }}>{log.student ? `${log.student.name} ${log.student.surname}` : "Guruh Bali"}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: "#a78bfa" }}>🧙 {log.teacher?.name +" "+ log.teacher?.surname || "Ustoz"}</div>
            </div>
          </div>
        )) : <span style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: "#4b5563", paddingLeft: 20 }}>Sehrli yangilanishlar kutilmoqda...</span>}
      </div>
      <style jsx>{` @keyframes marquee-h { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } `}</style>
    </div>
  );
}

const HOUSE_COLORS = [
  { from: "#7f1d1d", to: "#991b1b", accent: "#fbbf24", glow: "rgba(251,191,36,0.4)" },
  { from: "#14532d", to: "#166534", accent: "#a3e635", glow: "rgba(163,230,53,0.4)" },
  { from: "#1e3a5f", to: "#1e40af", accent: "#60a5fa", glow: "rgba(96,165,250,0.4)" },
  { from: "#4a3728", to: "#78350f", accent: "#fde68a", glow: "rgba(253,230,138,0.4)" },
];

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [scoreFlash, setScoreFlash] = useState<Record<number, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, logsRes] = await Promise.all([api.get("/groups"), api.get("/points/logs")]);
      const groups = groupsRes.data;

      const fullData = await Promise.all(groups.map(async (group: any) => {
        try {
          const stRes = await api.get(`/groups/${group.id}/students`);
          const students = stRes.data;
          const studentsSum = students.reduce((sum: number, s: any) => sum + (s.totalPoints || 0), 0);
          return { ...group, students, calculatedTotal: (group.totalPoints || 0) + studentsSum };
        } catch {
          return { ...group, students: [], calculatedTotal: group.totalPoints };
        }
      }));

      setDashboardData(prev => {
        const flashes: Record<number, boolean> = {};
        fullData.forEach(g => {
          const old = prev.find(p => p.id === g.id);
          if (old && old.calculatedTotal !== g.calculatedTotal) flashes[g.id] = true;
        });
        if (Object.keys(flashes).length) {
          setScoreFlash(flashes);
          setTimeout(() => setScoreFlash({}), 2000);
        }
        return fullData;
      });
      setLogs(logsRes.data);
    } catch (err) { console.error("Data fetch error:", err); }
  }, []);

  useEffect(() => {
    fetchData();
    // 20 daqiqalik interval (20 * 60 * 1000 = 1,200,000 ms)
    const interval = setInterval(fetchData, 1200000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", fontFamily: "'Cinzel', serif", overflow: "hidden" }}>
      {/* Harry P CDN Linki va Cinzel */}
      <link href="https://fonts.cdnfonts.com/css/harry-p" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />

      <ForestBackground />
      <FlyingOwl />
      <MagicParticles />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "10px 0", background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
        <h1 style={{ fontFamily: "'Cinzel Decorative', cursive", fontSize: "clamp(16px, 2.5vw, 24px)", color: "#fbbf24", letterSpacing: "0.3em" }}>⚡ EdEx — Ball Taxtasi ⚡</h1>
      </div>

      <div style={{ position: "relative", zIndex: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "10px", padding: "10px", height: "calc(100vh - 60px)", boxSizing: "border-box" }}>
        {dashboardData.slice(0, 4).map((group, idx) => {
          const colors = HOUSE_COLORS[idx % HOUSE_COLORS.length];
          return (
            <motion.div key={group.id} style={{ borderRadius: "20px", border: `1px solid ${colors.accent}33`, background: "rgba(10,15,10,0.95)", backdropFilter: "blur(10px)", boxShadow: `0 0 30px ${colors.glow}`, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              
              <div style={{ padding: "12px", background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${colors.accent}` }}>
                <h2 style={{ fontFamily: "'Harry P', sans-serif", fontSize: "56px", color: "#fff", margin: 0, lineHeight: 1 }}>{group.name}</h2>
                <div style={{ background: "rgba(0,0,0,0.5)", border: `2px solid ${colors.accent}`, borderRadius: "10px", padding: "4px 14px" }}>
                  <span style={{ fontFamily: "'Harry P', sans-serif", fontSize: "44px", color: colors.accent }}>{group.calculatedTotal}</span>
                </div>
              </div>

              <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <ScrollingStudents students={group.students} />
              </div>

              <LiveMarquee logs={logs} groupId={group.id} />
              {scoreFlash[group.id] && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" style={{ zIndex: 25 }} />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}