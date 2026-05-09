import Button from "../ui/Button";

/**
 * Panneau flottant (coin bas-droite) listant les demandes de reset en attente.
 * Visible uniquement pour les admins quand pendingResets.length > 0.
 */
export default function ResetRequestsPanel({ pendingResets, darkMode, C, onApprove, onReject }) {
  return (
    <div style={{
      position: "fixed", bottom: "20px", right: "20px", zIndex: 50,
      width: "320px",
      background: darkMode ? "rgba(4,10,18,0.98)" : "rgba(240,250,240,0.98)",
      border: "1px solid rgba(249,115,22,0.25)",
      borderRadius: "10px",
      padding: "16px",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: "#f97316", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>
        ⚠ DEMANDES RESET ({pendingResets.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
        {pendingResets.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: "6px" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.email}
            </span>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginLeft: "8px" }}>
              <Button variant="success" size="sm" onClick={() => onApprove(r)}>OK</Button>
              <Button variant="danger"  size="sm" onClick={() => onReject(r.id)}>✕</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}