import { useState, useEffect } from "react";

export default function ThemeSwitcher({ className = "" }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  return (
    <button
      id="theme-switcher-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Night Shift Mode"}
      title={isDark ? "Chuyển sang Chế độ Sáng" : "Chế độ Trực Đêm (Night Shift Mode)"}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${className}`}
    >
      {isDark ? (
        <span className="material-symbols-outlined text-[18px] text-amber-400 transition-transform duration-300 rotate-0">
          light_mode
        </span>
      ) : (
        <span className="material-symbols-outlined text-[18px] text-indigo-500 transition-transform duration-300 rotate-0">
          dark_mode
        </span>
      )}
    </button>
  );
}
