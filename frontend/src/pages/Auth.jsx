// Problèmes corrigés :
// - `G = "#7FD832"` supprimé → COLORS.green depuis constants
// - `onNavigate` prop supprimée → useNavigate directement
// - `@import` Google Fonts supprimé (centralisé dans index.html)
// - `useAuthForm(login, onNavigate)` → useAuthForm(login, navigate)
// - `PageBackground` importé pour éviter la duplication du fond

import { useState }       from "react";
import { useNavigate }    from "react-router-dom";
import { LOGO_URL, COLORS } from "../constants";
import { useAuth }        from "../context/AuthContext";
import { authApi }        from "../api/auth";
import { PageBackground } from "../styles/background";

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

// ── StyledInput ───────────────────────────────────────────────────────────────
function StyledInput({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: "0.58rem",
        letterSpacing: "0.2em", color: focused ? G : "rgba(127,216,50,0.45)",
        marginBottom: "8px", textTransform: "uppercase", transition: "color 0.2s",
      }}>
        {label}
      </div>
      <div style={{
        position: "relative",
        border: `1px solid ${focused ? "rgba(127,216,50,0.45)" : "rgba(127,216,50,0.12)"}`,
        borderRadius: "6px",
        background: focused ? "rgba(127,216,50,0.03)" : "rgba(4,10,18,0.6)",
        transition: "all 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(127,216,50,0.05)" : "none",
      }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "11px 14px",
            background: "transparent", border: "none", outline: "none",
            color: "#c8dff0", fontSize: "0.82rem",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
          }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: focused ? "0%" : "50%",
          width: focused ? "100%" : "0%", height: "1px",
          background: G, transition: "all 0.35s ease",
          borderRadius: "0 0 6px 6px",
        }} />
      </div>
    </div>
  );
}

// ── useAuthForm ───────────────────────────────────────────────────────────────
// Problème corrigé : navigate est maintenant passé directement, plus de prop onNavigate.
function useAuthForm(login, navigate) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password || password.length < 6)       return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login({ email, role: data.role === "superadmin" ? 0 : 1, name: email.split("@")[0] });
      navigate("/chat");
    } catch (e) {
      setError(e.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, loading, handleSubmit };
}

// ── ForgotPasswordModal ───────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [resetEmail, setResetEmail] = useState("");
  const [sent,       setSent]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleReset = async () => {
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) { setError("Email invalide."); return; }
    setError(""); setLoading(true);
    try {
      await authApi.forgotPassword(resetEmail);
      setSent(true);
    } catch (e) {
      setError(e.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2,8,18,0.85)", backdropFilter: "blur(12px)",
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: "380px", margin: "0 16px",
        background: "rgba(4,12,24,0.97)",
        border: "1px solid rgba(127,216,50,0.2)",
        borderRadius: "12px", padding: "36px 32px",
        boxShadow: "0 0 60px rgba(0,0,0,0.6)", position: "relative",
      }} onClick={e => e.stopPropagation()}>

        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 16, background: "transparent", border: "none", cursor: "pointer", color: "rgba(127,216,50,0.4)", fontSize: "1rem", fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = G}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(127,216,50,0.4)"}
        >✕</button>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.2em", color: G, marginBottom: "6px" }}>// RESET ACCESS</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#fff", marginBottom: "8px" }}>MOT DE PASSE OUBLIÉ</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", lineHeight: 1.6, marginBottom: "24px" }}>
          {sent
            ? "Demande envoyée. L'administrateur vous contactera."
            : "Entrez votre email. L'administrateur vous enverra votre nouveau mot de passe."}
        </div>

        {!sent ? (
          <>
            <StyledInput
              label="Email Address" type="email"
              value={resetEmail} onChange={e => setResetEmail(e.target.value)}
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
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Auth() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useAuthForm(login, navigate);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div style={{
      position: "relative", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#040a12", overflow: "hidden",
      fontFamily: "'DM Mono', monospace",
    }}>
      <PageBackground />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "420px",
        background: "rgba(4,10,18,0.75)",
        border: "1px solid rgba(127,216,50,0.1)",
        borderRadius: "16px", padding: "44px 40px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 0 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(127,216,50,0.05)",
      }}>
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: 28, borderTop: `1px solid ${G}`, borderLeft: `1px solid ${G}`, borderRadius: "16px 0 0 0", opacity: 0.4 }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderBottom: `1px solid ${G}`, borderRight: `1px solid ${G}`, borderRadius: "0 0 16px 0", opacity: 0.4 }} />

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
          <img src={LOGO_URL} alt="Socilis" style={{ height: "72px", width: "auto", marginBottom: "12px", filter: "drop-shadow(0 0 16px rgba(0,200,255,0.5)) drop-shadow(0 0 32px rgba(127,216,50,0.2))" }} />
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "0.15em" }}>
            <span style={{ color: "#fff" }}>SOC</span>
            <span style={{ color: G, filter: "drop-shadow(0 0 12px rgba(127,216,50,0.4))" }}>ILIS</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px", fontSize: "0.58rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
          // Secure Access Portal
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.2)", borderRadius: "6px", padding: "10px 14px", marginBottom: "20px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff4444", flexShrink: 0, display: "inline-block" }} />
            <span style={{ color: "#ff8080", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>{error}</span>
          </div>
        )}

        <StyledInput label="Email Address" type="email"   value={email}    onChange={e => setEmail(e.target.value)}    placeholder="analyst@socilis.com" />
        <StyledInput label="Password"      type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" />

        {/* Forgot */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px", marginTop: "-8px" }}>
          <button
            onClick={() => setShowForgot(true)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(127,216,50,0.45)", fontSize: "0.65rem", letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace", transition: "color 0.2s", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}
            onMouseEnter={e => e.currentTarget.style.color = G}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(127,216,50,0.45)"}
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit} disabled={loading}
          style={{ ...BTN_STYLE, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "rgba(127,216,50,0.1)"; e.currentTarget.style.borderColor = "rgba(127,216,50,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(127,216,50,0.05)"; e.currentTarget.style.borderColor = "rgba(127,216,50,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {loading ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${G}`, borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              AUTHENTICATING...
            </>
          ) : "LOGIN"}
        </button>

        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          style={{ display: "block", width: "100%", textAlign: "center", marginTop: "16px", fontSize: "0.65rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", cursor: "pointer", transition: "color 0.2s", fontFamily: "'DM Mono', monospace" }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
        >
          ← Return to <span style={{ color: G }}>SOCILIS</span>
        </button>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}