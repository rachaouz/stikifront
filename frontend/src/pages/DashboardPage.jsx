import { useState }            from "react";
import { useAuth }             from "../context/AuthContext";
import { getDashboardTheme }   from "../styles/dashboardTheme";
import { useDarkMode }         from "../context/DarkModeContext";
import { useDashboardData }    from "../hooks/useDashboardData";
import { useResetRequests }    from "../hooks/useResetRequests";
import LoadingScreen           from "../components/dashboard/LoadingScreen";
import TopBar                  from "../components/dashboard/TopBar";
import StatCard                from "../components/dashboard/StatCard";
import ThreatBar               from "../components/dashboard/ThreatBar";
import IOCList                 from "../components/dashboard/IOCList";
import DetailPanel             from "../components/dashboard/DetailPanel";
import ResetRequestsPanel      from "../components/dashboard/ResetRequestsPanel";
import ApproveModal            from "../components/dashboard/ApproveModal";

export default function DashboardPage() {
  const { isAdmin }                   = useAuth();
  const { darkMode, setDarkMode, toggle } = useDarkMode();
  const { loading, scans, stats }     = useDashboardData();
  const resetCtx                      = useResetRequests(isAdmin);
  const C                             = getDashboardTheme(darkMode);

  const [selectedIOC, setSelectedIOC] = useState(null);
  const [filter,      setFilter]      = useState("all");

  const totalScans    = stats?.total_scans         || scans.length;
  const avgScore      = stats?.avg_risk_score       || 0;
  const criticalCount = stats?.by_verdict?.critical || 0;
  const highCount     = stats?.by_verdict?.high     || 0;
  const lowCount      = stats?.by_verdict?.low      || 0;

  if (loading) return <LoadingScreen C={C} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, color: C.text, overflow: "hidden", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.scrollThumb}; border-radius: 2px; }
        @keyframes spin           { to { transform: rotate(360deg) } }
      `}</style>

      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      <TopBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        toggle={toggle}
        C={C}
        pendingResets={resetCtx.pendingResets.length}
      />

      {/* Stats */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap", zIndex: 1, position: "relative" }}>
        <StatCard label="Total IOCs"  value={totalScans}           color={C.cyan}  C={C} />
        <StatCard label="Critiques"   value={criticalCount}        color="#ef4444" C={C} />
        <StatCard label="Élevés"      value={highCount}            color="#f97316" C={C} />
        <StatCard label="Score moyen" value={Math.round(avgScore)} color="#ca8a04" C={C} />
        <StatCard label="Faibles"     value={lowCount}             color="#16a34a" C={C} />
        <ThreatBar data={scans} C={C} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", zIndex: 1, position: "relative" }}>
        <IOCList
          scans={scans}
          filter={filter}
          onFilter={setFilter}
          selectedIOC={selectedIOC}
          onSelect={setSelectedIOC}
          C={C}
        />

        {/* Panneau détail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.filtersBar, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: C.textFaint }}>DÉTAIL IOC</span>
            {selectedIOC && (
              <button
                onClick={() => setSelectedIOC(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textFaint, fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = C.text}
                onMouseLeave={e => e.currentTarget.style.color = C.textFaint}
              >
                ✕ FERMER
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <DetailPanel ioc={selectedIOC} C={C} />
          </div>
        </div>
      </div>

      {isAdmin && resetCtx.pendingResets.length > 0 && (
        <ResetRequestsPanel
          pendingResets={resetCtx.pendingResets}
          darkMode={darkMode}
          C={C}
          onApprove={resetCtx.openApproveModal}
          onReject={resetCtx.handleReject}
        />
      )}

      <ApproveModal
        request={resetCtx.approveModal}
        newPassword={resetCtx.newPassword}
        setNewPassword={resetCtx.setNewPassword}
        loading={resetCtx.approveLoading}
        darkMode={darkMode}
        C={C}
        onConfirm={resetCtx.handleApprove}
        onClose={resetCtx.closeApproveModal}
      />
    </div>
  );
}