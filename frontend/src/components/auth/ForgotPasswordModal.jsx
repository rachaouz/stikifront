import { COLORS }            from "../../constants";
import { useForgotPassword } from "../../hooks/useAuthForm";
import StyledInput           from "./StyledInput";
import ModalShell            from "../chat/settings/ModalShell";

const G = COLORS.green;

const BTN_STYLE = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  width: "100%", padding: "12px 22px",
  background: "rgba(127,216,50,0.05)",
  border: "1px solid rgba(127,216,50,0.3)",
  borderRadius: "8px",
  color: G, fontSize: "0.68rem", letterSpacing: "0.22em",
  fontFamily: "'DM Mono', monospace", fontWeight: 600,
  transition: "all 0.2s", textTransform: "uppercase",
};

export default function ForgotPasswordModal({ onClose }) {
  const { email, setEmail, sent, loading, error, handleReset } = useForgotPassword();

  return (
    <ModalShell
      onClose={onClose}
      darkMode={true}
      accentColor={G}
      titleIcon="🔑"
      title="MOT DE PASSE OUBLIÉ"
      maxWidth="380px"
      zIndex={50}
    >
      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", lineHeight: 1.6, marginBottom: "24px" }}>
        {sent
          ? "Demande envoyée. L'administrateur vous contactera."
          : "Entrez votre email. L'administrateur vous enverra votre nouveau mot de passe."}
      </div>

      {!sent ? (
        <>
          <StyledInput
            label="Email Address" type="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="analyst@socilis.com"
          />
          <button
            onClick={handleReset} disabled={loading}
            style={{ ...BTN_STYLE, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "rgba(127,216,50,0.1)"; e.currentTarget.style.borderColor = "rgba(127,216,50,0.5)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(127,216,50,0.05)"; e.currentTarget.style.borderColor = "rgba(127,216,50,0.3)"; }}
          >
            {loading ? "ENVOI..." : "ENVOYER LA DEMANDE"}
          </button>
          {error && <div style={{ marginTop: "10px", color: "#ff8080", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>⚠ {error}</div>}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "20px", background: "rgba(127,216,50,0.05)", border: "1px solid rgba(127,216,50,0.2)", borderRadius: "6px" }}>
            <span style={{ color: G }}>✓</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: G }}>Email envoyé avec succès</span>
          </div>
          <button
            onClick={onClose}
            style={{ ...BTN_STYLE, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(127,216,50,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(127,216,50,0.05)"; }}
          >FERMER</button>
        </>
      )}
    </ModalShell>
  );
}