// Fond décoratif partagé (Home + Auth)
export const PAGE_BG_LAYERS = [
  // Grid
  {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(127,216,50,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(127,216,50,0.025) 1px, transparent 1px)`,
    backgroundSize: "clamp(28px, 3.5vw, 44px) clamp(28px, 3.5vw, 44px)",
  },
  // Dégradé directionnel
  {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "linear-gradient(135deg, rgba(0,20,60,0.55) 0%, transparent 40%, rgba(10,70,5,0.08) 85%, rgba(20,100,10,0.12) 100%)",
  },
  // Vignette centrale
  {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 10%, #040a12 80%)",
  },
  // Blob bleu — haut gauche
  {
    position: "absolute", top: "-10%", left: "-10%", width: "55vw", height: "55vw",
    borderRadius: "50%", pointerEvents: "none",
    background: "radial-gradient(circle, rgba(0,40,120,0.18) 0%, transparent 65%)",
  },
  // Blob vert — bas droite
  {
    position: "absolute", bottom: "-40%", right: "-30%", width: "80vw", height: "80vw",
    borderRadius: "50%", pointerEvents: "none",
    background: "radial-gradient(circle, rgba(30,110,20,0.12) 0%, rgba(10,60,5,0.06) 40%, transparent 65%)",
  },
  
  {
    position: "absolute", top: 0, left: 0, right: 0, height: "1px", pointerEvents: "none",
    background: "linear-gradient(90deg, transparent, rgba(0,80,200,0.3) 40%, rgba(127,216,50,0.2) 60%, transparent)",
  },
];

export function PageBackground() {
  return (
    <>
      {PAGE_BG_LAYERS.map((style, i) => (
        <div key={i} style={style} />
      ))}
    </>
  );
}