import { memo }          from "react";
import { IOC_TYPE_META } from "../../constants";
import ScoreRing         from "./ScoreRing";
import VerdictBadge      from "../chat/VerdictBadge";

const IOCRow = memo(function IOCRow({ ioc, selected, onSelect, C }) {
  const tyM = IOC_TYPE_META[ioc.ioc_type] || { color: C.cyan, icon: "IOC", symbol: "◆" };
  const sc  = ioc.risk_score || 0;

  return (
    <div
      onClick={() => onSelect(ioc)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 12px", marginBottom: "3px",
        background:   selected ? `${C.green}08` : "transparent",
        border:       `1px solid ${selected ? C.borderHover : "transparent"}`,
        borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = C.surfaceHover; e.currentTarget.style.borderColor = C.border; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
    >
      <ScoreRing score={sc} size={42} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: "5px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.52rem", letterSpacing: "0.12em", color: tyM.color, fontFamily: "'DM Mono', monospace", padding: "2px 7px", border: `1px solid ${tyM.color}35`, borderRadius: "3px", background: `${tyM.color}08` }}>
            {tyM.symbol} {tyM.icon}
          </span>
          <VerdictBadge verdict={ioc.final_verdict} />
        </div>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ioc.indicator}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: C.textFaint }}>
          {ioc.created_at?.slice(0, 16)}
        </div>
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  );
});

export default IOCRow;