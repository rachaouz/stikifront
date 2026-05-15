import { overlay, card, modalHeader, closeBtn } from "./styles";

/**
 * ModalShell — enveloppe commune à tous les modals de l'app.
 *
 * Utilisé par : CreateUserModal, DeleteUserModal, SettingsModal,
 *               ApproveModal, ForgotPasswordModal
 *
 * Props :
 *   onClose       — ferme le modal
 *   darkMode      — thème clair/sombre
 *   accentColor   — couleur principale du modal
 *   titleIcon     — icône dans le header
 *   title         — titre dans le header
 *   maxWidth      — largeur max de la card (défaut : "340px")
 *   zIndex        — z-index de l'overlay (défaut : 1100)
 *   children      — contenu
 */
export default function ModalShell({
  onClose, darkMode, accentColor,
  titleIcon, title, children,
  maxWidth = "340px", zIndex = 1100,
}) {
  return (
    <div style={{ ...overlay, zIndex }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...card(darkMode, accentColor), maxWidth, width: "100%", margin: "0 16px" }}
      >
        <div style={modalHeader(accentColor)}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: accentColor, fontSize: "11px", letterSpacing: "2.5px", fontWeight: "700" }}>
            {titleIcon && <span>{titleIcon}</span>}
            <span>{title}</span>
          </div>
          <button onClick={onClose} style={{ ...closeBtn, color: "rgba(160,210,255,0.28)" }}>✕</button>
        </div>

        {children}
      </div>
    </div>
  );
}