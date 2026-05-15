import { useState } from "react";
import { COLORS }   from "../../constants";

const G = COLORS.green;

export default function StyledInput({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: "0.58rem",
        letterSpacing: "0.2em", color: focused ? G : "rgba(127,216,50,0.45)",
        marginBottom: "8px", textTransform: "uppercase", transition: "color 0.2s",
      }}>
        {label}
      </div>
      <div style={{
        position: "relative",
        border: `1px solid ${focused ? "rgba(127,216,50,0.45)" : "rgba(127,216,50,0.12)"}`,
        borderRadius: "6px",
        background: focused ? "rgba(127,216,50,0.03)" : "rgba(4,10,18,0.6)",
        transition: "all 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(127,216,50,0.05)" : "none",
      }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "11px 14px",
            background: "transparent", border: "none", outline: "none",
            color: "#c8dff0", fontSize: "0.82rem",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
          }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: focused ? "0%" : "50%",
          width: focused ? "100%" : "0%", height: "1px",
          background: G, transition: "all 0.35s ease",
          borderRadius: "0 0 6px 6px",
        }} />
      </div>
    </div>
  );
}