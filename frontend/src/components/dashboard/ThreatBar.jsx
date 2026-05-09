import { THREAT_META } from "../../constants";

/**
 * Barre horizontale de répartition des menaces par niveau.
 * Props : data (liste des scans), C (thème)
 */
export default function ThreatBar({ data, C }) {
  const counts = data.reduce((acc, d) => {
    const lvl = d.final_verdict || "unknown";
    acc[lvl] = (acc[lvl] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts);
  const total   = data.length || 1;

  return (
    <div style={{
      flex: "2 1 240px", minWidth: "240px",
      padding: "16px 20px",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "10px",
    }}>
      <span style={{
        fontSize: "0.55rem", letterSpacing: "0.2em",
        color: C.textFaint, textTransform: "uppercase",
        fontFamily: "'DM Mono', monospace",
        display: "block", marginBottom: "12px",
      }}>
        Répartition des menaces
      </span>

      {/* Barre colorée */}
      <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
        {entries.map(([lvl, cnt]) => (
          <div
            key={lvl}
            style={{ flex: cnt / total, background: THREAT_META[lvl]?.color || "#64748b", opacity: 0.85 }}
          />
        ))}
      </div>

      {/* Légende */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {entries.map(([lvl, cnt]) => {
          const tm = THREAT_META[lvl] || { color: "#64748b", label: lvl };
          return (
            <div key={lvl} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: tm.color, display: "inline-block" }} />
              <span style={{ fontSize: "0.58rem", color: C.textMuted, letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>
                {tm.label} ({cnt})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}