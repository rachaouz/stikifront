import { useState, useRef, useEffect } from "react";
import { chatbotApi }                  from "../api";
import { stripIOCPrefix }              from "../utils/iocDetector";
import { getTime }                     from "../utils/formatUtils";
import { buildReport }                 from "../utils/reportUtils";

function makeInitMsg() {
  return {
    id: 1, role: "bot",
    content: "Système SOCILIS initialisé. Soumettez un IOC (Hash, IP, URL, Domaine, Email ou CVE) pour analyse, ou posez une question en cybersécurité.",
    timestamp: getTime(),
  };
}

export function useChat(selectedModel) {
  const [messages,  setMessages]  = useState([makeInitMsg()]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [activeIOC, setActiveIOC] = useState(null);
  const bottomRef = useRef();

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

  const sendMessage = async () => {
    const raw = input.trim();
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
        ? {
            id: Date.now() + 1, role: "bot",
            content: data.message || `Analyse terminée — ${data.type} : ${clean}`,
            timestamp: getTime(),
            report: buildReport(data, clean),
          }
        : {
            id: Date.now() + 1, role: "bot",
            content: data.message || "Pas de réponse.",
            timestamp: getTime(),
          };

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