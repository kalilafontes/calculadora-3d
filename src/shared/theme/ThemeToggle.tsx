import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export type ColorTheme = "light" | "dark";
export const THEME_STORAGE_KEY = "calculadora3d:theme";

function getInitialTheme(): ColorTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // A preferência ainda funciona na sessão quando o storage está indisponível.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ColorTheme>(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Preferência local é opcional e nunca impede o uso da calculadora.
    }
  }, [theme]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
