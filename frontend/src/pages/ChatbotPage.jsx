// Problème corrigé :
// - Le bloc de mapping `report: { ioc, type, verdict, ... }` extrait dans une
//   fonction `buildReport(data, clean)` → plus lisible et testable séparément.
// - `now()` renommé `getTime()` pour éviter la confusion avec Date.now()

import { useState, useRef, useEffect } from "react";
import ChatSidebar     from "../components/chat/ChatSidebar";
import ChatTopBar      from "../components/chat/ChatTopBar";
import ChatInput       from "../components/chat/ChatInput";
import MessageBubble   from "../components/chat/MessageBubble";
import TypingIndicator from "../components/chat/TypingIndicator";
import SettingsModal   from "../components/chat/SettingsModal";
import CreateUserModal from "../components/chat/settings/CreateUserModal";
import DeleteUserModal from "../components/chat/settings/DeleteUserModal";
import { t }           from "../components/chat/chatTheme";
import { MODELS }      from "../components/chat/ModelSelector";
import { detectInputType, stripIOCPrefix } from "../utils/iocDetector";
import { chatbotApi }  from "../api/chatbot";

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
 * Construit l'objet `report` à partir de la réponse de l'API chatbot.
 * Extrait ici pour alléger sendMessage et faciliter les tests unitaires futurs.
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
    // Network
    isp:               ti.isp,
    asn:               ti.asn,
    country:           ti.country,
    // VirusTotal
    vt_malicious:      ti.reputation?.virustotal?.malicious  ?? ti.detection?.virustotal?.malicious,
    vt_suspicious:     ti.reputation?.virustotal?.suspicious ?? ti.detection?.virustotal?.suspicious,
    vt_undetected:     ti.detection?.virustotal?.undetected,
    vt_tags:           ti.vt_tags         || [],
    vt_reputation:     ti.reputation?.vt_reputation,
    vt_votes:          ti.vt_votes,
    // Other TI sources
    abuseipdb:         ti.reputation?.abuseipdb?.score,
    otx_pulses:        ti.reputation?.otx?.pulses ?? ti.detection?.otx?.pulses,
    // Domain / IP
    associated_domains: ti.associated_domains || [],
    associated_files:   ti.associated_files   || [],
    ip_domain:          ti.ip,
    registrar:          ti.registrar,
    created:            ti.created,
    subdomains_count:   ti.subdomains_count,
    global_risk_score:  ti.global_risk_score,
    domain:             ti.domain,
    // File
    file_type:          ti.file_type,
    first_seen:         ti.first_seen,
    // MITRE
    mitre_attack:       ti.mitre_attack || [],
    // URL / Mail
    gsb_threats:        ti.detection?.google_safe_browsing?.threats || [],
    phishtank:          ti.detection?.phishtank?.verdict,
    mail_domain:        ti.domain,
    provider:           ti.provider,
    // Security (mail)
    mx:                 ti.security?.mx,
    spf:                ti.security?.spf,
    dmarc:              ti.security?.dmarc,
    // CVE
    alerts:             ti.alerts      || [],
    severity:           ti.severity,
    cvss_score:         ti.cvss_score,
    cvss_vector:        ti.cvss_vector,
    cwe:                ti.cwe         || [],
    published:          ti.published,
    // Phishing
    phishing_signals:   ti.phishing_signals || [],
    hosting_platform:   ti.hosting_platform,
  };
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ChatbotPage() {
  const [messages,      setMessages]      = useState([makeInitMsg()]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [darkMode,      setDarkMode]      = useState(true);
  const [selectedChat,  setSelectedChat]  = useState(null);
  const [activeIOC,     setActiveIOC]     = useState(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [adminModal,    setAdminModal]    = useState(null);
  const bottomRef = useRef();
  const th = t(darkMode);

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

    const userMsg = { id: Date.now(), role: "user", content: raw, timestamp: getTime() };
    setMessages(prev => [...prev, userMsg]);
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
    setSelectedChat(null);
    setInput("");
    setActiveIOC(null);
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: th.bg,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      fontSize: "14px",
      color: th.text,
      overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: darkMode
          ? `linear-gradient(rgba(0,168,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,168,255,0.018) 1px,transparent 1px)`
          : "none",
        backgroundSize: "44px 44px",
      }} />

      {/* Modals */}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenAdminModal={(type) => { setSettingsOpen(false); setAdminModal(type); }}
        />
      )}
      {adminModal === "create" && <CreateUserModal darkMode={darkMode} onClose={() => setAdminModal(null)} />}
      {adminModal === "delete" && <DeleteUserModal darkMode={darkMode} onClose={() => setAdminModal(null)} />}

      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        darkMode={darkMode}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={handleNewChat}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <ChatTopBar
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onOpenSettings={() => setSettingsOpen(true)}
          activeIOC={activeIOC}
          onSelectIOC={handleSelectIOC}
        />

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "24px 32px",
          scrollbarWidth: "thin",
          scrollbarColor: `${th.scrollThumb} transparent`,
        }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} darkMode={darkMode} />
          ))}
          {loading && <TypingIndicator darkMode={darkMode} />}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          darkMode={darkMode}
          input={input}
          loading={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onInputChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          onSend={sendMessage}
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50%     { opacity: 1;   transform: scale(1.2); }
        }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${th.scrollThumb}; border-radius: 2px; }

        .chat-message-content { font-size: 14px !important; line-height: 1.75 !important; }
        .chat-sidebar-item    { font-size: 13px !important; }
        .chat-topbar          { font-size: 13px !important; }
        .chat-input-area      { font-size: 14px !important; }
        .ioc-badge            { font-size: 11px !important; letter-spacing: 0.1em !important; }
      `}</style>
    </div>
  );
}