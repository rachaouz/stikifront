import { useState, useEffect } from "react";

const STORAGE_KEY = "socilis_dark_mode";

/**
 * Gère le mode dark/light avec persistance localStorage.
 * Utilisé dans DashboardPage et ChatbotPage.
 *
 * Remplace ce pattern dupliqué dans 2 fichiers :
 *   const [darkMode, setDarkMode] = useState(true);
 *   useEffect(() => {
 *     const saved = localStorage.getItem("socilis_dark_mode");
 *     if (saved !== null) setDarkMode(saved === "true");
 *   }, []);
 */
export function useDarkMode(defaultValue = true) {
  const [darkMode, setDarkModeState] = useState(() => {
    // Initialisation directe depuis localStorage — évite le flash au premier render
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === "true" : defaultValue;
  });

  const setDarkMode = (value) => {
    setDarkModeState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  const toggle = () => setDarkMode(!darkMode);

  return { darkMode, setDarkMode, toggle };
}