import { useState, useRef, useEffect } from "react";
import { chatbotApi }                  from "../api";
import { stripIOCPrefix }              from "../utils/iocDetector";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function makeInitMsg() {
  return {
    id: 1, role: "bot",
    content: "Système SOCILIS initialisé. Soumettez un IOC (Hash, IP, URL, Domaine, Email ou CVE) pour analyse, ou posez une question en cybersécurité.",
    timestamp: getTime(),
  };
}

/**
 * Construit l'objet `report` à partir de la réponse API.
 * Extrait ici pour garder sendMessage lisible.
 */
function buildReport(data, clean) {
  const ti = data.ti_summary || {};
  return {
    ioc:               clean,
    type:              data.type,
    verdict:           data.verdict?.threat_level  || "unknown",
    threat_level:      data.verdict?.threat_level  || "unknown",
    score:             data.verdict?.score         || 0,
    message:           data.message                || "",
    tags:              data.verdict?.tags          || [],
    isp:               ti.isp,
    asn:               ti.asn,
    country:           ti.country,
    vt_malicious:      ti.reputation?.virustotal?.malicious  ?? ti.detection?.virustotal?.malicious,
    vt_suspicious:     ti.reputation?.virustotal?.suspicious ?? ti.detection?.virustotal?.suspicious,
    vt_undetected:     ti.detection?.virustotal?.undetected,
    vt_tags:           ti.vt_tags         || [],
    vt_reputation:     ti.reputation?.vt_reputation,
    vt_votes:          ti.vt_votes,
    abuseipdb:         ti.reputation?.abuseipdb?.score,
    otx_pulses:        ti.reputation?.otx?.pulses ?? ti.detection?.otx?.pulses,
    associated_domains: ti.associated_domains || [],
    associated_files:   ti.associated_files   || [],
    ip_domain:          ti.ip,
    registrar:          ti.registrar,
    created:            ti.created,
    subdomains_count:   ti.subdomains_count,
    global_risk_score:  ti.global_risk_score,
    domain:             ti.domain,
    file_type:          ti.file_type,
    first_seen:         ti.first_seen,
    mitre_attack:       ti.mitre_attack || [],
    gsb_threats:        ti.detection?.google_safe_browsing?.threats || [],
    phishtank:          ti.detection?.phishtank?.verdict,
    mail_domain:        ti.domain,
    provider:           ti.provider,
    mx:                 ti.security?.mx,
    spf:                ti.security?.spf,
    dmarc:              ti.security?.dmarc,
    alerts:             ti.alerts      || [],
    severity:           ti.severity,
    cvss_score:         ti.cvss_score,
    cvss_vector:        ti.cvss_vector,
    cwe:                ti.cwe         || [],
    published:          ti.published,
    phishing_signals:   ti.phishing_signals || [],
    hosting_platform:   ti.hosting_platform,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Gère toute la logique du chat :
 * - messages + scroll automatique
 * - envoi de message + appel API
 * - gestion IOC actif
 * - nouveau chat
 *
 * Remplace toute la logique inline de ChatbotPage.jsx
 */
export function useChat(selectedModel) {
  const [messages,  setMessages]  = useState([makeInitMsg()]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [activeIOC, setActiveIOC] = useState(null);
  const bottomRef = useRef();

  // Scroll automatique à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectIOC = (type) => {
    setActiveIOC(type);
    setInput(prev => type
      ? `[${type}] ${stripIOCPrefix(prev)}`
      : stripIOCPrefix(prev)
    );
  };

  const sendMessage = async (text) => {
    const raw = (text || input).trim();
    if (!raw || loading) return;

    setInput("");
    setMessages(prev => [...prev, {
      id: Date.now(), role: "user",
      content: raw, timestamp: getTime(),
    }]);
    setLoading(true);

    const clean = stripIOCPrefix(raw);

    try {
      const data = await chatbotApi.message(clean, null, selectedModel);

      const botMsg = (data.type && data.type !== "question")
        ? { id: Date.now() + 1, role: "bot", content: data.message || `Analyse terminée — ${data.type} : ${clean}`, timestamp: getTime(), report: buildReport(data, clean) }
        : { id: Date.now() + 1, role: "bot", content: data.message || "Pas de réponse.", timestamp: getTime() };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "bot",
        content: `Erreur : ${e.message}`,
        timestamp: getTime(),
      }]);
    } finally {
      setLoading(false);
      setActiveIOC(null);
    }
  };

  const handleNewChat = () => {
    setMessages([makeInitMsg()]);
    setInput("");
    setActiveIOC(null);
    setLoading(false);
  };

  return {
    messages,
    input, setInput,
    loading,
    activeIOC,
    bottomRef,
    handleSelectIOC,
    sendMessage,
    handleNewChat,
  };
}