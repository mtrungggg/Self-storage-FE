import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectDropdownProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string | number | null;
  defaultValue?: string | number | null;
  options?: SelectOption[];
  onChange?: (val: any) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  children?: React.ReactNode;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  id,
  name,
  label,
  value,
  defaultValue,
  options = [],
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  required = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  children,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Extract options from props or children (<option value="xyz">Label</option>)
  const parsedOptions: SelectOption[] = React.useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    const extracted: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && (child.type === "option" || (child.props && "value" in child.props))) {
        const val = child.props.value;
        const lbl = child.props.children || child.props.label || String(val);
        extracted.push({
          value: val,
          label: lbl,
          disabled: child.props.disabled,
        });
      }
    });
    return extracted;
  }, [options, children]);

  // Handle uncontrolled vs controlled
  const [internalValue, setInternalValue] = useState<string | number>(
    value ?? defaultValue ?? ""
  );

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInternalValue(value);
    }
  }, [value]);

  // Find currently selected option
  const selectedOption = parsedOptions.find(
    (opt) => String(opt.value) === String(internalValue)
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleSelect(option: SelectOption) {
    if (option.disabled || disabled) return;
    setInternalValue(option.value);
    setIsOpen(false);

    if (onChange) {
      try {
        onChange({
          target: { value: option.value, name: name || selectId },
          currentTarget: { value: option.value, name: name || selectId },
        });
      } catch {
        onChange(option.value);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden input for HTML form compliance */}
      <input
        type="hidden"
        id={selectId}
        name={name}
        value={String(internalValue ?? "")}
        required={required}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 px-3.5 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100 shadow-xs hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${isOpen ? "ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 border-zinc-300 dark:border-zinc-700" : ""} ${triggerClassName}`}
      >
        <span
          className={`truncate ${
            selectedOption
              ? "text-zinc-900 dark:text-zinc-100 font-medium"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={15}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-zinc-700 dark:text-zinc-300" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 ${openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"} max-h-60 overflow-y-auto overscroll-contain rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-md z-[99999] animate-in fade-in-0 zoom-in-95 ${menuClassName}`}
        >
          {parsedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-400 text-center">
              No options available
            </div>
          ) : (
            parsedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(internalValue);
              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors ${
                    opt.disabled
                      ? "opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      size={14}
                      className="text-zinc-900 dark:text-zinc-100 shrink-0 ml-2"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
