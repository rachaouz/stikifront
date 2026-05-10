/**
 * Utilitaires d'export local (côté client, depuis un objet `report`).
 * Extraits de MessageBubble.jsx où ils étaient définis inline.
 *
 * À ne pas confondre avec api/export.js qui appelle le backend.
 * Ces fonctions construisent et téléchargent le fichier depuis les données
 * déjà présentes dans le rapport affiché dans le chat.
 */

import { THREAT_META, IOC_TYPE_META, scoreColor } from "../constants";

/** Télécharge le rapport en CSV. */
export function dlCSV(report) {
  const rows = [
    ["Champ", "Valeur"],
    ["Indicateur", report.ioc],
    ["Type", report.type || ""],
    ["Verdict", report.verdict],
    ["Score", report.score],
    ["Niveau menace", report.threat_level || ""],
    ["Tags", (report.tags || []).join(", ")],
    ["Message", (report.message || "").replace(/"/g, "'")],
    ...(report.isp         ? [["ISP", report.isp]] : []),
    ...(report.asn         ? [["ASN", report.asn]] : []),
    ...(report.country     ? [["Pays", report.country]] : []),
    ...(report.vt_malicious  != null ? [["VT Malicious", report.vt_malicious]] : []),
    ...(report.vt_suspicious != null ? [["VT Suspicious", report.vt_suspicious]] : []),
    ...(report.vt_reputation != null ? [["VT Réputation", report.vt_reputation]] : []),
    ...(report.vt_tags?.length       ? [["VT Tags", report.vt_tags.join(", ")]] : []),
    ...(report.abuseipdb   != null ? [["AbuseIPDB Score", report.abuseipdb]] : []),
    ...(report.otx_pulses  != null ? [["OTX Pulses", report.otx_pulses]] : []),
    ...(report.file_type   ? [["Type Fichier", report.file_type]] : []),
    ...(report.first_seen  ? [["Premier vu", report.first_seen]] : []),
    ...(report.vt_undetected != null ? [["VT Undetected", report.vt_undetected]] : []),
    ...(report.registrar   ? [["Registrar", report.registrar]] : []),
    ...(report.created     ? [["Créé le", report.created]] : []),
    ...(report.subdomains_count != null ? [["Sous-domaines", report.subdomains_count]] : []),
    ...(report.domain      ? [["Domaine", report.domain]] : []),
    ...(report.ip          ? [["IP", report.ip]] : []),
    ...(report.hosting_platform ? [["Plateforme hosting", report.hosting_platform]] : []),
    ...((report.phishing_signals || []).map((s, i) => [`Signal phishing ${i + 1}`, s])),
    ...(report.gsb_threats ? [["Google Safe Browsing", report.gsb_threats.join(", ")]] : []),
    ...(report.phishtank   ? [["PhishTank", report.phishtank]] : []),
    ...(report.mail_domain ? [["Mail Domain", report.mail_domain]] : []),
    ...(report.provider    ? [["Provider", report.provider]] : []),
    ...(report.mx          ? [["MX", report.mx]] : []),
    ...(report.spf         ? [["SPF", report.spf]] : []),
    ...(report.dmarc       ? [["DMARC", report.dmarc]] : []),
    ...(report.severity    ? [["Sévérité", report.severity]] : []),
    ...(report.cvss_score  != null ? [["CVSS Score", report.cvss_score]] : []),
    ...(report.cvss_vector ? [["CVSS Vector", report.cvss_vector]] : []),
    ...(report.cwe         ? [["CWE", report.cwe.join(", ")]] : []),
    ...(report.published   ? [["Publié le", report.published]] : []),
    ...((report.associated_domains || []).map((d, i) => [`Domaine associé ${i + 1}`, d])),
    ...((report.associated_files   || []).map((f, i) => [`Fichier associé ${i + 1}`, f])),
    ...((report.alerts             || []).map((a, i) => [`Alerte ${i + 1}`, a])),
    ...((report.mitre_attack       || []).map(m => [`MITRE ${m.technique_id}`, `${m.technique_name} (${m.matched_on})`])),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  _download(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), `socilis_${_slug(report.ioc)}.csv`);
}

/** Télécharge le rapport en JSON. */
export function dlJSON(report) {
  _download(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }), `socilis_${_slug(report.ioc)}.json`);
}

/**
 * Génère et télécharge un rapport PDF HTML.
 * Utilise THREAT_META et IOC_TYPE_META depuis constants.js
 * au lieu de les redéfinir localement.
 */
export function dlPDF(report) {
  const now     = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const sc      = report.score || 0;
  const scColor = scoreColor(sc);
  const tm      = THREAT_META[report.threat_level] || THREAT_META[report.verdict] || THREAT_META.medium;
  const tyM     = IOC_TYPE_META[report.type] || { color: "#00a8ff", symbol: "◆" };

  const row = (label, value, color) =>
    `<div style="display:flex;gap:0;margin-bottom:7px;border-bottom:1px solid rgba(0,168,255,0.06);padding-bottom:7px">
      <span style="min-width:160px;font-size:9px;letter-spacing:1.5px;color:rgba(160,210,255,0.35)">${label}</span>
      <span style="font-size:10px;color:${color || "#e2f0ff"};word-break:break-all">${value}</span>
    </div>`;

  const section = (title, content) =>
    `<div style="margin-bottom:20px">
      <div style="font-size:8px;letter-spacing:3px;color:rgba(160,210,255,0.3);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(0,168,255,0.08)">${title}</div>
      ${content}
    </div>`;

  const tagHtml = (report.tags || []).map(tag =>
    `<span style="display:inline-block;padding:2px 9px;background:rgba(0,168,255,0.07);border:1px solid rgba(0,168,255,0.2);border-radius:3px;color:#00a8ff;font-size:9px;margin:2px">${tag}</span>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>SOCILIS Report — ${report.ioc}</title>
  <style>
    body { margin:0; padding:32px; background:#040a12; color:#e2f0ff; font-family:'Courier New',monospace; font-size:11px; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style></head><body>
  <div style="max-width:800px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(0,168,255,0.15)">
      <div>
        <div style="font-size:18px;font-weight:900;letter-spacing:6px;color:#00a8ff">SOC<span style="color:#7FD832">ILIS</span></div>
        <div style="font-size:8px;letter-spacing:3px;color:rgba(160,210,255,0.4);margin-top:3px">THREAT INTELLIGENCE PLATFORM</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:8px;letter-spacing:2px;color:rgba(160,210,255,0.35)">RAPPORT GÉNÉRÉ LE</div>
        <div style="font-size:10px;color:rgba(160,210,255,0.6);margin-top:3px">${now}</div>
      </div>
    </div>
    ${section("INDICATEUR ANALYSÉ", `
      <div style="padding:14px;background:rgba(0,168,255,0.04);border:1px solid rgba(0,168,255,0.12);border-radius:6px">
        <div style="font-size:13px;color:#e2f0ff;word-break:break-all;margin-bottom:8px">${report.ioc}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span style="padding:3px 10px;background:rgba(0,168,255,0.08);border:1px solid rgba(0,168,255,0.2);border-radius:3px;color:${tyM.color};font-size:9px">${tyM.symbol} ${(report.type || "").toUpperCase()}</span>
          <span style="padding:3px 10px;background:${tm.bg};border:1px solid ${tm.border};border-radius:3px;color:${tm.color};font-size:9px;font-weight:700">${tm.label}</span>
        </div>
      </div>
    `)}
    ${section("SCORE DE RISQUE", `
      <div style="display:flex;align-items:center;gap:16px">
        <div style="font-size:40px;font-weight:900;color:${scColor}">${sc}</div>
        <div style="font-size:9px;color:rgba(160,210,255,0.4)">/100</div>
      </div>
    `)}
    ${(report.tags || []).length > 0 ? section("TAGS", `<div style="display:flex;flex-wrap:wrap;gap:4px">${tagHtml}</div>`) : ""}
    ${report.message ? section("ANALYSE", `<div style="line-height:1.7;color:rgba(226,240,255,0.8)">${report.message}</div>`) : ""}
  </div>
  </body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }
}

// ── Helpers internes ──────────────────────────────────────────────────────────
function _slug(str) {
  return (str || "ioc").replace(/[^a-z0-9]/gi, "_");
}

function _download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}