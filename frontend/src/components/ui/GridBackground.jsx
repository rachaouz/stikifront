/**
 * GridBackground — fond en grille réutilisé dans ChatbotPage et DashboardPage.
 * Props : color (couleur de la ligne), size (taille de la cellule, défaut 44px)
 */
export default function GridBackground({ color, size = 44 }) {
  if (!color) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }} />
  );
}