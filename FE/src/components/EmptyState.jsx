import { useLanguage } from "../context/LanguageContext";

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  actionText = null,
  onAction = null,
  className = "",
}) {
  const { t } = useLanguage();
  const displayTitle = title ?? t("common.no_data", "Không có dữ liệu");
  const displayDesc = description ?? t("common.empty_description", "Hiện tại chưa có bản ghi nào để hiển thị.");

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-10 text-center backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`}
    >
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full text-zinc-100 dark:text-zinc-800/40"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M38.5,-63.4C50.2,-57.4,60.3,-47.9,67.8,-36.2C75.3,-24.5,80.2,-10.6,79.1,2.8C78,16.2,70.9,29.1,62.1,39.9C53.3,50.7,42.8,59.4,30.8,64.7C18.8,70,5.3,71.9,-7.7,70.1C-20.7,68.3,-33.2,62.8,-43.8,54.5C-54.4,46.2,-63.1,35.1,-68.2,22.3C-73.3,9.5,-74.8,-5,-70.7,-17.6C-66.6,-30.2,-56.9,-40.9,-45.5,-47.1C-34.1,-53.3,-21,-55,-8,-60.8C5,-66.6,26.8,-69.4,38.5,-63.4Z" transform="translate(50 50)" />
        </svg>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md">
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>
      </div>

      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{displayTitle}</h4>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {displayDesc}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-xs font-bold shadow-xs transition hover:bg-zinc-800 dark:hover:bg-white active:scale-95 cursor-pointer"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
