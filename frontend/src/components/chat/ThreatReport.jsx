import { useState } from "react";
import VerdictBadge from "./VerdictBadge";
import { t } from "./chatTheme";

export default function ThreatReport({ data, darkMode }) {
  const [copied, setCopied] = useState(false);
  const th = t(darkMode);
  const score = data?.score || 0;
  const verdict = (data?.verdict?.threat_level || data?.verdict || "unknown").toLowerCase();
  const isClean = verdict === "clean" || verdict === "low";
  const scoreColor = score > 70 ? "#f87171" : score > 40 ? "#fb923c" : "#4ade80";

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── CAS CLEAN : affichage simplifié ──────────────────────────
  if (isClean) {
    return (
      <div style={{
        background: darkMode ? "rgba(4,20,12,0.95)" : "rgba(240,255,245,0.98)",
        border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: "8px",
        padding: "14px 16px",
        marginTop: "8px",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 4px 20px rgba(74,222,128,0.06)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid rgba(74,222,128,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
            <span style={{ color: "#4ade80", fontWeight: "700", letterSpacing: "2px", fontSize: "10px" }}>THREAT INTELLIGENCE REPORT</span>
          </div>
          <button onClick={handleCopy} style={{
            background: "transparent", border: `1px solid ${copied ? "#4ade80" : "rgba(74,222,128,0.2)"}`,
            color: copied ? "#4ade80" : "rgba(74,222,128,0.5)", padding: "3px 10px", borderRadius: "4px",
            fontSize: "9px", cursor: "pointer", letterSpacing: "1.5px",
          }}>{copied ? "✓ COPIÉ" : "⎘ COPIER"}</button>
        </div>

        {/* IOC + Type */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ color: "rgba(74,222,128,0.5)", fontSize: "9px", letterSpacing: "2px" }}>
            {(data?.type || data?.ioc_type || "IOC").toUpperCase()}
          </span>
          <span style={{
            color: "#4ade80", background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)", padding: "2px 8px",
            borderRadius: "3px", fontSize: "11px",
          }}>{data?.indicator || data?.ioc}</span>
        </div>

        {/* Verdict clean */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)",
            color: "#4ade80", padding: "4px 12px", borderRadius: "4px",
            fontSize: "10px", fontWeight: "700", letterSpacing: "2px",
          }}>✓ CLEAN</span>
          <span style={{ color: "rgba(74,222,128,0.6)", fontSize: "10px" }}>
            Score : {score}/100
          </span>
        </div>

        {/* Summary si disponible */}
        {data?.verdict?.summary || data?.summary ? (
          <div style={{ marginTop: "10px", color: "rgba(74,222,128,0.7)", fontSize: "10px", lineHeight: "1.6", borderTop: "1px solid rgba(74,222,128,0.1)", paddingTop: "10px" }}>
            {data?.verdict?.summary || data?.summary}
          </div>
        ) : null}
      </div>
    );
  }

  // ── CAS MALICIOUS / SUSPECT : affichage complet ───────────────
  const iocType = (data?.type || data?.ioc_type || "").toUpperCase();
  const ti      = data?.ti_summary || {};

  return (
    <div style={{
      background: darkMode ? "rgba(4,12,24,0.95)" : "rgba(245,250,255,0.98)",
      border: `1px solid ${th.borderActive}`, borderRadius: "8px",
      padding: "14px 16px", marginTop: "8px",
      fontSize: "11px", fontFamily: "'JetBrains Mono',monospace",
      boxShadow: "0 4px 20px rgba(0,168,255,0.08)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: `1px solid ${th.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: th.accent, boxShadow: `0 0 6px ${th.accent}` }} />
          <span style={{ color: th.accent, fontWeight: "700", letterSpacing: "2px", fontSize: "10px" }}>THREAT INTELLIGENCE REPORT</span>
        </div>
        <button onClick={handleCopy} style={{
          background: "transparent", border: `1px solid ${copied ? "#4ade80" : th.border}`,
          color: copied ? "#4ade80" : th.textMuted, padding: "3px 10px", borderRadius: "4px",
          fontSize: "9px", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s",
        }}>{copied ? "✓ COPIÉ" : "⎘ COPIER"}</button>
      </div>

      {/* IOC + Type */}
      <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px" }}>{iocType}</span>
        <span style={{ color: th.accent, background: th.accentSubtle, border: `1px solid ${th.border}`, padding: "2px 8px", borderRadius: "3px", fontSize: "11px" }}>
          {data?.indicator || data?.ioc}
        </span>
      </div>

      {/* Score + Verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <VerdictBadge verdict={data?.verdict} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px" }}>THREAT SCORE</span>
            <span style={{ color: scoreColor, fontWeight: "700", fontSize: "12px" }}>
              {score}<span style={{ color: th.textFaint, fontSize: "9px" }}>/100</span>
            </span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${score}%`,
              background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
              borderRadius: "2px", boxShadow: `0 0 8px ${scoreColor}60`,
              transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>
      </div>

      {/* Tags */}
      {(data?.verdict?.tags || data?.tags)?.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>TAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(data?.verdict?.tags || data?.tags).map(tag => (
              <span key={tag} style={{ padding: "3px 9px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "3px", color: "#f87171", fontSize: "10px" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Infos réseau IP */}
      {ti.country && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>INFORMATIONS RÉSEAU</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            {[
              ["ISP",     ti.isp],
              ["ASN",     ti.asn],
              ["PAYS",    ti.country],
            ].filter(([,v]) => v).map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: "6px" }}>
                <span style={{ color: th.textFaint, fontSize: "9px", minWidth: "50px" }}>{label}</span>
                <span style={{ color: th.text, fontSize: "10px" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Réputation */}
      {ti.reputation && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>RÉPUTATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            {[
              ["VT MALICIOUS",    ti.reputation?.virustotal?.malicious],
              ["VT SUSPICIOUS",   ti.reputation?.virustotal?.suspicious],
              ["ABUSEIPDB SCORE", ti.reputation?.abuseipdb?.score],
              ["OTX PULSES",      ti.reputation?.otx?.pulses],
            ].filter(([,v]) => v !== undefined && v !== null).map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: "6px" }}>
                <span style={{ color: th.textFaint, fontSize: "9px", minWidth: "100px" }}>{label}</span>
                <span style={{ color: th.text, fontSize: "10px" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domaines associés */}
      {ti.associated_domains?.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>DOMAINES ASSOCIÉS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {ti.associated_domains.slice(0, 5).map(d => (
              <span key={d} style={{ color: th.textMuted, fontSize: "10px" }}>→ {d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Fichiers associés */}
      {ti.associated_files?.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>FICHIERS ASSOCIÉS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {ti.associated_files.slice(0, 5).map(f => (
              <span key={f} style={{ color: th.textMuted, fontSize: "10px", wordBreak: "break-all" }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary LLM */}
      {(data?.verdict?.summary || data?.summary) && (
        <div style={{ marginTop: "10px", color: th.textMuted, fontSize: "10px", lineHeight: "1.6", borderTop: `1px solid ${th.border}`, paddingTop: "10px" }}>
          {data?.verdict?.summary || data?.summary}
        </div>
      )}

      {/* CVEs */}
      {data?.cves?.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ color: th.textFaint, fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>CVEs ASSOCIÉES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {data.cves.map(c => (
              <span key={c} style={{ padding: "3px 9px", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.28)", borderRadius: "3px", color: "#fb923c", fontSize: "10px" }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}