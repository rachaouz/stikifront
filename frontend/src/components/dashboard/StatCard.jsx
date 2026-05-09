/**
 * Carte statistique affichée dans la barre du haut du Dashboard.
 * Props : label, value, color, C (thème)
 */
export default function StatCard({ label, value, color, C }) {
  return (
    <div style={{
      flex: "1 1 100px", minWidth: "100px",
      padding: "16px 20px",
      background: C.surface,
      border: `1px solid ${color}20`,
      borderRadius: "10px",
      display: "flex", flexDirection: "column", gap: "6px",
    }}>
      <span style={{
        fontSize: "0.55rem", letterSpacing: "0.2em",
        color: C.textFaint, textTransform: "uppercase",
        fontFamily: "'DM Mono', monospace",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "1.8rem", fontWeight: 800,
        color, fontFamily: "'Syne', sans-serif", lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  );
}