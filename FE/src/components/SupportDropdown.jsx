import { useEffect, useId, useRef, useState } from "react";

export default function SupportDropdown({
  label,
  icon = "expand_circle_down",
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listId = useId();
  const selected = options.find((option) => String(option.value) === String(value));

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
        className="group relative flex w-full flex-col items-start rounded-[14px] border border-[#d8e3f5] bg-white/70 p-3 text-left transition hover:border-[#1d5fe5] hover:bg-white hover:shadow-sm focus:border-[#1d5fe5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d5fe5]/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718299]">
          <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">{icon}</span>
          {label}
        </span>
        <span className="flex w-full items-center justify-between gap-2">
          <span className="truncate text-[13px] font-bold text-[#0b1c30]">{selected?.label || placeholder}</span>
          <span className={`material-symbols-outlined text-[18px] text-[#8996a9] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </span>
      </button>

      {!disabled && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          aria-hidden={!open}
          className={`absolute z-30 mt-1.5 max-h-52 w-full origin-top overflow-y-auto rounded-[14px] border border-[#d8e3f5] bg-white p-1.5 shadow-[0_14px_32px_rgba(15,23,42,0.14)] transition-all duration-200 ease-out motion-reduce:transition-none ${
            open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
          }`}
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-xs font-semibold transition ${
                  active ? "bg-[#1d5fe5] text-white" : "text-[#334155] hover:bg-[#eef4ff] hover:text-[#1d5fe5]"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-white" : "bg-[#9cb5df]"}`} />
                <span className="min-w-0 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
