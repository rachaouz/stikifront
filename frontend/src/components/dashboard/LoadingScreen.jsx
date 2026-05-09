export default function LoadingScreen({ C }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${C.green}30`, borderTop: `2px solid ${C.green}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: C.textFaint }}>CHARGEMENT...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}