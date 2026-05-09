// ─── Thème visuel du Dashboard (dark / light) ────────────────────────────────
export const DARK_C = {
  bg:           "#040a12",
  surface:      "rgba(8,16,28,0.95)",
  surfaceHover: "rgba(12,22,38,0.9)",
  border:       "rgba(127,216,50,0.09)",
  borderHover:  "rgba(127,216,50,0.22)",
  green:        "#7FD832",
  cyan:         "#00c8ff",
  text:         "#c8dff0",
  textMuted:    "rgba(200,223,240,0.45)",
  textFaint:    "rgba(200,223,240,0.22)",
  topbar:       "rgba(4,10,18,0.98)",
  filtersBar:   "rgba(4,10,18,0.7)",
  input:        "rgba(4,10,18,0.95)",
  scrollThumb:  "rgba(127,216,50,0.15)",
  gridLine:     "rgba(127,216,50,0.02)",
};

export const LIGHT_C = {
  bg:           "#eef7ee",
  surface:      "rgba(255,255,255,0.97)",
  surfaceHover: "rgba(210,240,210,0.75)",
  border:       "rgba(34,110,34,0.15)",
  borderHover:  "rgba(34,110,34,0.40)",
  green:        "#1a6e1a",
  cyan:         "#0e7a6e",
  text:         "#0d2e0d",
  textMuted:    "rgba(15,55,15,0.62)",
  textFaint:    "rgba(15,55,15,0.36)",
  topbar:       "rgba(230,248,230,0.98)",
  filtersBar:   "rgba(225,245,225,0.90)",
  input:        "rgba(245,253,245,0.99)",
  scrollThumb:  "rgba(34,110,34,0.20)",
  gridLine:     "rgba(34,110,34,0.03)",
};

/** Retourne le thème actif selon le mode. */
export const getDashboardTheme = (darkMode) => darkMode ? DARK_C : LIGHT_C;