import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function cleanCity(city) {
  if (!city) return "Vietnam";
  return city
    .replace(/Há»“\s*ChÃ­?\s*Minh/gi, "Hồ Chí Minh")
    .replace(/HÃ\s*Ná»™i/gi, "Hà Nội")
    .replace(/Ä\s*Ã\s*Náºµng|Ä\s*Ä\s*Náºµng/gi, "Đà Nẵng")
    .replace(/BÃ¬nh\s*DÆ°Æ¡ng/gi, "Bình Dương");
}

/**
 * Top horizontal facility control bar: Minimalist, Text-only, No icons.
 * Left: Facility dropdown.
 * Right: Portal destination for page-level actions (e.g. Refresh, tab toggles).
 */
export function FacilitySwitcher() {
  const { t } = useLanguage();
  const { facilities, facilityId, setFacilityId, loading, error } = useManagerFacility();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 lg:px-8">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Facility:</span>
        {loading ? (
          <span className="text-xs text-slate-400 dark:text-zinc-500">{t("common.loading", "Đang tải cơ sở...")}</span>
        ) : error ? (
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</span>
        ) : facilities.length === 1 ? (
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
            <span>
              {facilities[0].code} — {facilities[0].name} ({cleanCity(facilities[0].city)})
            </span>
            <span className="rounded bg-slate-200/80 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-zinc-300">
              {t("common.assigned", "Đã phân công")}
            </span>
          </div>
        ) : (
          <SelectDropdown
            value={facilityId ?? ""}
            onChange={(event) => setFacilityId(Number(event.target.value))}
            className="rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-100 shadow-none focus:outline-none focus:border-slate-400"
          >
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.code} — {facility.name} ({cleanCity(facility.city)})
              </option>
            ))}
          </SelectDropdown>
        )}
      </div>

      {/* Target container for Portal actions injected by individual manager pages */}
      <div id="manager-portal-actions" className="flex items-center gap-2 empty:hidden" />
    </div>
  );
}

/**
 * Helper hook / component for manager pages to inject custom header actions
 * (such as "Refresh", "Add Unit", tab buttons) into the top FacilitySwitcher bar.
 */
export function ManagerActionPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const target = document.getElementById("manager-portal-actions");
  if (!target) return null;

  return createPortal(children, target);
}

export const FacilityBarActions = ManagerActionPortal;

export default FacilitySwitcher;
