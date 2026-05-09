import { scoreColor } from "../../constants";

/**
 * Anneau SVG affichant un score de risque (0-100).
 * Réutilisable dans IOCRow et DetailPanel.
 */
export default function ScoreRing({ score, size = 52 }) {
  const r    = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const cx   = size / 2;
  const cy   = size / 2;
  const sc   = scoreColor(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(127,216,50,0.08)" strokeWidth="3" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={sc} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx} y={cy + 0.5}
        textAnchor="middle" dominantBaseline="middle"
        fill={sc}
        fontSize={size > 60 ? "14" : "11"}
        fontWeight="700"
        fontFamily="'DM Mono', monospace"
      >
        {score}
      </text>
    </svg>
  );
}