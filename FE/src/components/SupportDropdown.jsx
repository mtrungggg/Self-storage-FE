import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function SupportDropdown({
  label,
  icon = "expand_circle_down",
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listId = useId();
  const selected = options.find((option) => String(option.value) === String(value));
  const defaultPlaceholder = placeholder ?? t("common.select_option", "Chọn một mục...");

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="custom-dropdown-container relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="group relative flex w-full flex-col items-start rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-3 text-left transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="pointer-events-none mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="material-symbols-outlined text-[16px] text-zinc-700 dark:text-zinc-300">{icon}</span>
          {label}
        </span>
        <span className="flex w-full items-center justify-between gap-2">
          <span className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {selected?.label || defaultPlaceholder}
          </span>
          <span className={`material-symbols-outlined text-[18px] text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </span>
      </button>

      {open && !disabled && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl backdrop-blur-md"
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                  active
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>{option.label}</span>
                {active && <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-zinc-100">check</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
