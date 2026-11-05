import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../locales/translations";

const LanguageContext = createContext({
  lang: "vi",
  setLang: () => {},
  toggleLang: () => {},
  t: (key, fallback) => fallback || key,
  translateStatus: (status) => String(status || ""),
  formatDate: (date) => String(date),
  formatCurrency: (amount) => String(amount),
});

const STORAGE_KEY = "app_language";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "vi" || saved === "en") return saved;
      // Default to Vietnamese as requested
      return "vi";
    } catch {
      return "vi";
    }
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((newLang) => {
    if (newLang === "vi" || newLang === "en") {
      setLangState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch (err) {
        console.warn("Failed to persist language:", err);
      }
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "vi" ? "en" : "vi");
  }, [lang, setLang]);

  const t = useCallback(
    (key, fallback) => {
      if (!key) return "";
      const currentDict = translations[lang] || {};
      if (currentDict[key] !== undefined) {
        return currentDict[key];
      }
      // Fallback to Vietnamese dictionary if key missing in English
      const fallbackDict = translations.vi || {};
      if (fallbackDict[key] !== undefined) {
        return fallbackDict[key];
      }
      return fallback !== undefined ? fallback : key;
    },
    [lang]
  );

  const formatDate = useCallback(
    (date, options = { dateStyle: "medium" }) => {
      if (!date) return "";
      try {
        const d = new Date(date);
        return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", options).format(d);
      } catch {
        return String(date);
      }
    },
    [lang]
  );

  const formatCurrency = useCallback(
    (amount) => {
      const val = Number(amount) || 0;
      if (lang === "vi") {
        return `${val.toLocaleString("vi-VN")} đ`;
      }
      return `${val.toLocaleString("en-US")} VND`;
    },
    [lang]
  );

  const translateStatus = useCallback(
    (status) => {
      if (!status) return "";
      const raw = String(status).trim();
      const key = raw.toLowerCase().replace(/[-\s]/g, "_");
      const currentDict = translations[lang] || {};
      const statusKey = `status.${key}`;
      if (currentDict[statusKey]) return currentDict[statusKey];
      const fallbackDict = translations.vi || {};
      if (fallbackDict[statusKey]) return fallbackDict[statusKey];
      // Humanize fallback
      return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, toggleLang, t, translateStatus, formatDate, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
