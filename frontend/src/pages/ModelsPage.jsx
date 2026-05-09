import { useNavigate } from "react-router-dom";
import { COLORS }      from "../constants";
import { prose, bullet } from "../styles/infoPages";
import InfoPageLayout  from "./InfoPageLayout";

const { green: G, cyan: CYAN } = COLORS;

const MODEL_CARDS = [
  {
    color: G,
    label: "PHI-3 MINI",
    text: `Phi-3 Mini is a lightweight and efficient model designed for fast inference. It performs well in
real-time environments where speed is critical, such as Security Operations Centers (SOC). It is
capable of delivering quick and structured responses, making it ideal for initial threat assessments
and high-volume analysis.`,
    cardBg: "rgba(127,216,50,0.04)",
    cardBorder: "rgba(127,216,50,0.22)",
  },
  {
    color: CYAN,
    label: "GEMMA 3",
    text: `Gemma 3, on the other hand, is a more powerful and expressive model. It provides deeper contextual
understanding and more detailed explanations. It is particularly useful for complex investigations,
where interpreting relationships between threats and understanding attack patterns is essential.`,
    cardBg: "rgba(0,212,255,0.04)",
    cardBorder: "rgba(0,212,255,0.22)",
  },
];

const COMPLEMENTS = [
  { color: G,    text: "Phi-3 Mini ensures fast response and system efficiency" },
  { color: CYAN, text: "Gemma 3 enhances depth, reasoning, and analysis quality" },
];

export default function ModelsPage() {
  const navigate = useNavigate();
  return (
    <InfoPageLayout
      onBack={() => navigate("/home")}
      badge="AI MODELS"
      title="Model Comparison"
      subtitle="Phi-3 Mini vs Gemma 3"
    >
      <p style={{ ...prose, marginBottom: "1.6rem" }}>
        This chatbot relies on two advanced language models specifically adapted for cybersecurity analysis.
        Both models have been fine-tuned using LoRA and QLoRA techniques to better understand Indicators of
        Compromise (IOCs) such as IP addresses, hashes, domains, URLs, emails, and CVEs.
      </p>

      {MODEL_CARDS.map(({ color, label, text, cardBg, cardBorder }) => (
        <div key={label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "8px", padding: "1.6rem", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, display: "inline-block", flexShrink: 0 }} />
            <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.88rem", letterSpacing: "0.15em", color, fontWeight: "700", margin: 0 }}>{label}</h2>
          </div>
          <p style={prose}>{text}</p>
        </div>
      ))}

      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", letterSpacing: "0.2em", color: "#7aa3c0", fontWeight: "700", marginBottom: "1rem" }}>
        BOTH MODELS COMPLEMENT EACH OTHER:
      </div>

      {COMPLEMENTS.map(({ color, text }) => (
        <div key={text} style={bullet}>
          <span style={{ color, fontWeight: "700", flexShrink: 0 }}>-</span>
          <span style={prose}>{text}</span>
        </div>
      ))}

      <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(127,216,50,0.4), transparent)", margin: "1.6rem 0" }} />

      <p style={prose}>
        By combining these two models, the chatbot achieves a balance between performance and intelligence,
        allowing SOC analysts to work faster while maintaining high accuracy in threat analysis.
      </p>
    </InfoPageLayout>
  );
}