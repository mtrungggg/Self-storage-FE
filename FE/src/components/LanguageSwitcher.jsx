import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className = "", compact = false }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/90 p-0.5 text-xs font-semibold shadow-xs transition hover:border-slate-300 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="flex items-center pl-1.5 text-slate-400">
        <Globe size={13} className="text-slate-500" />
      </div>

      <button
        type="button"
        onClick={() => setLang("vi")}
        aria-pressed={lang === "vi"}
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
          lang === "vi"
            ? "bg-zinc-900 text-white text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Tiếng Việt"
      >
        VIE
      </button>

      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
          lang === "en"
            ? "bg-zinc-900 text-white text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="English"
      >
        ENG
      </button>
    </div>
  );
}
