/**
 * Utilitaires de formatage — centralisés ici au lieu d'être inline dans les composants.
 *
 * Provenance :
 *   - capitalize()  → était dans ChatSidebar.jsx
 *   - formatDate()  → était dans ChatSidebar.jsx
 *   - getTime()     → était dans useChat.js
 *   - highlight()   → était définie dans le .map() de ChatSidebar (recréée à chaque render !)
 */

/** "critical" → "Critical" */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formate une date ISO en "Aujourd'hui", "Hier", ou "12 mai".
 * Logique extraite de ChatSidebar.jsx.
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date      = new Date(dateStr);
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime())     return "Aujourd'hui";
  if (d.getTime() === yesterday.getTime()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Heure courante "HH:MM" — extraite de useChat.js */
export function getTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Surligne `search` dans `text` en retournant du JSX.
 * Était définie à l'intérieur du .map() de ChatSidebar → recréée à chaque render.
 *
 * @param {string} text   - Texte à afficher
 * @param {string} search - Terme recherché
 * @param {{ accent: string }} th - Thème (pour la couleur du highlight)
 */
export function highlightMatch(text, search, th) {
  if (!search) return text;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `${th.accent}30`, color: th.accent, borderRadius: "2px", padding: "0 1px" }}>
        {text.slice(idx, idx + search.length)}
      </mark>
      {text.slice(idx + search.length)}
    </>
  );
}