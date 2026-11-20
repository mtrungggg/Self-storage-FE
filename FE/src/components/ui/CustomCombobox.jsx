import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function CustomCombobox({
  value = "",
  onChange,
  options = [],
  placeholder,
  error = "",
  className = "",
  required = false,
}) {
  const { lang } = useLanguage();
  const isVi = lang === "vi";

  const effectivePlaceholder =
    placeholder ||
    (isVi ? "Chọn hoặc nhập loại kho..." : "Select or type category name...");

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedValue = (value || "").trim();
  const lowerValue = trimmedValue.toLowerCase();

  // Find if currently typed value exactly matches an existing category
  const matchedOption = options.find(
    (opt) => (opt.name || "").trim().toLowerCase() === lowerValue
  );

  const isExactSelected = Boolean(
    matchedOption && matchedOption.name.trim().toLowerCase() === lowerValue
  );

  const filteredOptions =
    isExactSelected || !trimmedValue
      ? options
      : options.filter((opt) =>
          (opt.name || "").toLowerCase().includes(lowerValue)
        );

  const isCustomNew = trimmedValue.length >= 2 && !matchedOption;

  function handleSelectOption(optName) {
    onChange(optName);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={value}
          placeholder={effectivePlaceholder}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
            if (e.key === "Enter" && isOpen && filteredOptions.length > 0) {
              e.preventDefault();
              handleSelectOption(filteredOptions[0].name);
            }
          }}
          className={`w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 pr-14 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none transition-all ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          }`}
        />

        {value ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-8 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title={isVi ? "Xóa để chọn loại kho khác" : "Clear selection"}
          >
            <X size={14} />
          </button>
        ) : null}

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) inputRef.current?.focus();
          }}
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : ""}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl backdrop-blur-md z-[99999] animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isVi
              ? `Danh mục loại kho (Hệ thống) (${filteredOptions.length})`
              : `System Categories (${filteredOptions.length})`}
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected =
                (opt.name || "").trim().toLowerCase() === lowerValue;
              const surcharge = Number(opt.surchargeAmount || 0);

              return (
                <div
                  key={opt.id || opt.name}
                  onClick={() => handleSelectOption(opt.name)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-semibold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{opt.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        surcharge > 0
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      +{surcharge.toLocaleString(isVi ? "vi-VN" : "en-US")} {isVi ? "đ" : "₫"}
                    </span>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-1" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">
              {isVi
                ? "Không tìm thấy loại kho trùng khớp"
                : "No matching categories found"}
            </div>
          )}

          {/* Option to create a new category if typed text does not match */}
          {isCustomNew && (
            <div
              onClick={() => handleSelectOption(trimmedValue)}
              className="mt-1 border-t border-slate-100 dark:border-zinc-800 pt-1 flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/70 cursor-pointer font-medium transition"
            >
              <Plus size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">
                {isVi ? "Dùng loại kho mới: " : "Use new category: "}
                <strong className="font-bold">"{trimmedValue}"</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Badges below input */}
      <div className="mt-1.5">
        {matchedOption ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            {isVi
              ? `✓ Đã chọn: ${matchedOption.name} (Phụ phí: +${Number(matchedOption.surchargeAmount || 0).toLocaleString("vi-VN")} đ)`
              : `✓ Selected: ${matchedOption.name} (Surcharge: +${Number(matchedOption.surchargeAmount || 0).toLocaleString("en-US")} VND)`}
          </span>
        ) : isCustomNew ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            {isVi
              ? "✓ Loại kho mới (Phụ phí mặc định: 0 đ)"
              : "✓ New category (Default surcharge: 0 VND)"}
          </span>
        ) : null}

        {error && (
          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <span>✕</span> {error}
          </p>
        )}
      </div>
    </div>
  );
}
