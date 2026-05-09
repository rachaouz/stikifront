import { useNavigate } from "react-router-dom";
import { useAuth }     from "../../context/AuthContext";
import { exportApi }   from "../../api/export";

function TopBtn({ label, onClick, icon, C }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", padding: "6px 12px", color: C.textMuted, fontSize: "0.6rem", letterSpacing: "0.12em", cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "all 0.18s", display: "flex", alignItems: "center", gap: "5px" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.green; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
    >
      {icon && <span style={{ fontSize: "0.65rem" }}>{icon}</span>}
      {label}
    </button>
  );
}

export default function TopBar({ darkMode, setDarkMode, C, pendingResets = 0 }) {
  const navigate    = useNavigate();
  const { isAdmin } = useAuth();

  const handleExport = async (fmt) => {
    try {
      await exportApi[fmt]();
    } catch (e) {
      console.error(`Export ${fmt} error:`, e);
      alert(`Erreur export ${fmt.toUpperCase()} : ${e.message}`);
    }
  };

  return (
    <div style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 24px", gap: "10px", borderBottom: `1px solid ${C.border}`, background: C.topbar, backdropFilter: "blur(20px)", flexShrink: 0, zIndex: 20, position: "relative" }}>
      <TopBtn label="← CHAT" onClick={() => navigate("/chat")} C={C} />
      <div style={{ width: "1px", height: "20px", background: C.border, margin: "0 4px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
        </svg>
        <span style={{ color: C.green, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em" }}>DASHBOARD</span>
        <span style={{ color: C.textFaint, fontSize: "0.6rem", letterSpacing: "0.12em" }}>/ THREAT INTELLIGENCE</span>
      </div>
      <div style={{ flex: 1 }} />
      {["csv", "json", "pdf"].map(fmt => (
        <TopBtn key={fmt} label={fmt.toUpperCase()} icon="↓" C={C} onClick={() => handleExport(fmt)} />
      ))}
      <button
        onClick={() => { const next = !darkMode; setDarkMode(next); }}
        title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        style={{ background: darkMode ? "rgba(127,216,50,0.08)" : "rgba(34,110,34,0.10)", border: `1px solid ${C.border}`, borderRadius: "6px", padding: "6px 10px", color: C.green, fontSize: "0.65rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "5px" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = `${C.green}14`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = darkMode ? "rgba(127,216,50,0.08)" : "rgba(34,110,34,0.10)"; }}
      >
        {darkMode ? "☀ LIGHT" : "◑ DARK"}
      </button>
      {isAdmin && pendingResets > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: "0.58rem", color: "#f97316", letterSpacing: "0.12em" }}>{pendingResets} RESET{pendingResets > 1 ? "S" : ""}</span>
        </div>
      )}
    </div>
  );
}