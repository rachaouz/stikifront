import { useNavigate }  from "react-router-dom";
import Button           from "../ui/Button";
import { exportApi }    from "../../api";

const EXPORT_FORMATS = ["csv", "json", "pdf"];

/**
 * Barre de navigation du Dashboard.
 * Props : darkMode, setDarkMode, C (thème), pendingResets (nombre)
 */
export default function TopBar({ darkMode, setDarkMode, C, pendingResets }) {
  const navigate = useNavigate();

  const handleExport = async (fmt) => {
    try {
      await exportApi[fmt]();
    } catch (e) {
      console.error(`Export ${fmt}:`, e);
      alert(`Erreur export ${fmt.toUpperCase()} : ${e.message}`);
    }
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("socilis_dark_mode", String(next));
  };

  return (
    <div style={{
      height: "56px", display: "flex", alignItems: "center",
      padding: "0 24px", gap: "10px",
      borderBottom: `1px solid ${C.border}`,
      background: C.topbar,
      backdropFilter: "blur(20px)",
      flexShrink: 0, zIndex: 20, position: "relative",
    }}>
      {/* Navigation */}
      <Button variant="outline" theme={C} onClick={() => navigate("/chat")}>
        ← CHAT
      </Button>

      <div style={{ width: "1px", height: "20px", background: C.border, margin: "0 4px" }} />

      {/* Titre */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
        </svg>
        <span style={{ color: C.green, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em" }}>DASHBOARD</span>
        <span style={{ color: C.textFaint, fontSize: "0.6rem", letterSpacing: "0.12em" }}>/ THREAT INTELLIGENCE</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Export */}
      {EXPORT_FORMATS.map(fmt => (
        <Button key={fmt} variant="outline" size="sm" theme={C} icon="↓" onClick={() => handleExport(fmt)}>
          {fmt.toUpperCase()}
        </Button>
      ))}

      {/* Toggle dark/light */}
      <Button
        variant="outline"
        size="sm"
        theme={C}
        onClick={toggleDark}
        title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        style={{ background: darkMode ? "rgba(127,216,50,0.08)" : "rgba(34,110,34,0.10)" }}
      >
        {darkMode ? "☀ LIGHT" : "◑ DARK"}
      </Button>

      {/* Badge resets en attente */}
      {pendingResets > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: "0.58rem", color: "#f97316", letterSpacing: "0.12em" }}>
            {pendingResets} RESET{pendingResets > 1 ? "S" : ""}
          </span>
        </div>
      )}
    </div>
  );
}