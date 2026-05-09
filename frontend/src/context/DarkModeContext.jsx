import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "socilis_dark_mode";

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  });

  const setDarkMode = (value) => {
    setDarkModeState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  const toggle = () => setDarkMode(!darkMode);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}