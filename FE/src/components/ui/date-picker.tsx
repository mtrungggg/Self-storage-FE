import { useLanguage } from "../../context/LanguageContext";
import React from "react";
import { DatePicker as ArkDatePicker, parseDate } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string | Date | null;
  defaultValue?: string | null;
  onChange?: (val: any) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
}

function safeParseDate(val?: string | Date | null) {
  if (!val) return undefined;
  try {
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return undefined;
      const yyyy = val.getFullYear();
      const mm = String(val.getMonth() + 1).padStart(2, "0");
      const dd = String(val.getDate()).padStart(2, "0");
      return parseDate(`${yyyy}-${mm}-${dd}`);
    }
    const str = String(val).trim();
    const match = str.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
      return parseDate(match[0]);
    }
  } catch {
    // Return undefined on invalid date string
  }
  return undefined;
}

export const DatePickerComponent: React.FC<DatePickerProps> = ({
  id,
  name,
  label,
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder,

  disabled = false,
  required = false,
  className = "",
  triggerClassName = "",
}) => {
  const { lang, t } = useLanguage();
  const effectivePlaceholder = placeholder ?? t("common.select_date", "Chọn ngày...");
  const parsedVal = safeParseDate(value ?? defaultValue);
  const parsedMin = safeParseDate(min);
  const parsedMax = safeParseDate(max);

  const arkValue = parsedVal ? [parsedVal] : [];

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <ArkDatePicker.Root
        locale={lang === "vi" ? "vi-VN" : "en-US"}
        id={id}
        name={name}
        disabled={disabled}
        readOnly={disabled}
        min={parsedMin}
        max={parsedMax}
        value={arkValue}
        onValueChange={(details) => {
          const selected = details.value[0];
          const dateStr = selected ? selected.toString() : "";
          if (onChange) {
            // Support both direct string (dateStr) and synthetic event object
            try {
              onChange({
                target: { value: dateStr, name: name || id },
                currentTarget: { value: dateStr, name: name || id },
              });
            } catch {
              onChange(dateStr);
            }
          }
        }}
      >
        <ArkDatePicker.Control className="w-full">
          <ArkDatePicker.Trigger
            type="button"
            className={`flex w-full items-center justify-between gap-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 px-3.5 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-100 shadow-xs hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all cursor-pointer ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${triggerClassName}`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <CalendarIcon size={16} className="text-zinc-400 shrink-0" />
              <ArkDatePicker.ValueText
                placeholder={effectivePlaceholder}
                className="truncate font-medium text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <span className="text-zinc-400 hover:text-zinc-600 transition shrink-0">
              <ChevronRight size={14} className="rotate-90 opacity-60" />
            </span>
          </ArkDatePicker.Trigger>
        </ArkDatePicker.Control>

        <Portal>
          <ArkDatePicker.Positioner className="z-[99999]">
            <ArkDatePicker.Content className="w-[300px] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/98 dark:bg-zinc-900/98 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95">
              <ArkDatePicker.Context>
                {(datePicker) => (
                  <>
                    <ArkDatePicker.View view="day">
                      <ArkDatePicker.ViewControl className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <ArkDatePicker.PrevTrigger className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer">
                          <ChevronLeft size={16} />
                        </ArkDatePicker.PrevTrigger>

                        <ArkDatePicker.ViewTrigger className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 transition cursor-pointer">
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>

                        <ArkDatePicker.NextTrigger className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer">
                          <ChevronRight size={16} />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>

                      <ArkDatePicker.Table className="w-full mt-2.5 border-collapse">
                        <ArkDatePicker.TableHead>
                          <ArkDatePicker.TableRow className="grid grid-cols-7 text-center">
                            {datePicker.weekDays.map((weekDay, idx) => (
                              <ArkDatePicker.TableHeader
                                key={idx}
                                className="text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1.5 uppercase tracking-wide"
                              >
                                {weekDay.narrow}
                              </ArkDatePicker.TableHeader>
                            ))}
                          </ArkDatePicker.TableRow>
                        </ArkDatePicker.TableHead>

                        <ArkDatePicker.TableBody className="mt-1 space-y-1 block">
                          {datePicker.weeks.map((week, weekIdx) => (
                            <ArkDatePicker.TableRow
                              key={weekIdx}
                              className="grid grid-cols-7 gap-1 text-center"
                            >
                              {week.map((day, dayIdx) => (
                                <ArkDatePicker.TableCell
                                  key={dayIdx}
                                  value={day}
                                  className="flex items-center justify-center p-0"
                                >
                                  <ArkDatePicker.TableCellTrigger
                                    className="group relative flex h-9 w-9 flex-col items-center justify-center rounded-xl text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer data-[outside-range]:text-zinc-300 dark:data-[outside-range]:text-zinc-600 data-[outside-range]:pointer-events-none data-[disabled]:opacity-40 data-[disabled]:pointer-events-none data-[today]:after:content-[''] data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:h-1 data-[today]:after:w-1 data-[today]:after:rounded-full data-[today]:after:bg-zinc-900 dark:data-[today]:after:bg-zinc-100 data-[selected]:bg-zinc-900 dark:data-[selected]:bg-zinc-100 data-[selected]:text-white dark:data-[selected]:text-zinc-900 data-[selected]:font-semibold data-[selected]:shadow-xs data-[selected]:hover:bg-zinc-800 dark:data-[selected]:hover:bg-zinc-200 data-[selected]:after:bg-white dark:data-[selected]:after:bg-zinc-900"
                                  >
                                    <span>{day.day}</span>
                                  </ArkDatePicker.TableCellTrigger>
                                </ArkDatePicker.TableCell>
                              ))}
                            </ArkDatePicker.TableRow>
                          ))}
                        </ArkDatePicker.TableBody>
                      </ArkDatePicker.Table>
                    </ArkDatePicker.View>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Portal>
      </ArkDatePicker.Root>
    </div>
  );
};

export const Basic = () => {
  return <DatePickerComponent />;
};

export default DatePickerComponent;
