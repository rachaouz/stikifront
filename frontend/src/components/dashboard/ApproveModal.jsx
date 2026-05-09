import Button from "../ui/Button";

/**
 * Modal de confirmation pour approuver un reset de mot de passe.
 * Props : request, newPassword, setNewPassword, loading, darkMode, C, onConfirm, onClose
 */
export default function ApproveModal({ request, newPassword, setNewPassword, loading, darkMode, C, onConfirm, onClose }) {
  if (!request) return null;

  const isValid = newPassword.length >= 6;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: darkMode ? "rgba(4,10,18,0.9)" : "rgba(200,235,200,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: "360px", margin: "0 16px", background: darkMode ? "rgba(6,14,26,0.99)" : "rgba(245,253,245,0.99)", border: `1px solid ${C.green}25`, borderRadius: "12px", padding: "28px" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: C.green, marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>
          // RESET PASSWORD
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, marginBottom: "20px" }}>
          {request.email}
        </div>

        <div style={{ fontSize: "0.58rem", letterSpacing: "0.15em", color: C.textFaint, marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>
          NOUVEAU MOT DE PASSE
        </div>
        <input
          type="text"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="min. 6 caractères"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", background: C.input, border: `1px solid ${C.border}`, borderRadius: "6px", color: C.text, fontSize: "0.82rem", fontFamily: "'DM Mono', monospace", outline: "none", marginBottom: "16px", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = `${C.green}60`}
          onBlur={e => e.target.style.borderColor = C.border}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={!isValid}
            onClick={onConfirm}
            style={{
              flex: 1,
              background:  isValid ? C.green : `${C.green}20`,
              color:       isValid ? (darkMode ? "#040a12" : "#fff") : C.textFaint,
              borderColor: isValid ? C.green : `${C.green}20`,
            }}
          >
            CONFIRMER
          </Button>
          <Button variant="outline" size="md" theme={C} onClick={onClose}>
            ANNULER
          </Button>
        </div>
      </div>
    </div>
  );
}