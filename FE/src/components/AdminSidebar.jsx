import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AdminSidebar({
 navGroups = [], activeId, isOpen = false, onClose, isAdmin = false }) {
  const { t } = useLanguage();
  const drawerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector("a, button")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab") return;
      const items = drawerRef.current?.querySelectorAll("a, button");
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [isOpen, onClose]);

  const content = (
    <aside className="flex h-screen w-full flex-col bg-zinc-950 text-slate-300">
      {/* Brand Header */}
      <div className="shrink-0 px-4 py-4 border-b border-zinc-900">
        <Link
          to={isAdmin ? "/admin-overview" : "/manager-dashboard"}
          onClick={onClose}
          className="block text-base font-bold text-white no-underline tracking-tight"
        >
          G1SelfStorage
        </Link>
      </div>

      {/* {t("admin.console", "Admin Console")} indicator - ONLY shown for system_administrator */}
      {isAdmin && (
        <div className="shrink-0 mx-3 mt-3 px-3 py-2 rounded-md border border-zinc-900 bg-zinc-900/80 text-xs font-semibold text-slate-300">
          {t("admin.console", "Admin Console")}
        </div>
      )}

      {/* Navigation list: flex-1 min-h-0 overflow-y-auto ensures it never overlaps footer */}
      <nav aria-label="Management Navigation" className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.to || "#"}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-800 ring-1 ring-zinc-700/60 text-white font-semibold"
                        : "text-slate-300 font-medium hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      <a className="admin-skip-link" href="#admin-content">Skip to main content</a>
      <div className="admin-desktop-sidebar hidden lg:block">{content}</div>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu" ref={drawerRef}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <div className="relative h-full w-[280px] max-w-[90vw]">
            {content}
            <button type="button" className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/10" onClick={onClose} aria-label="Close menu">
              <span className="text-base font-bold leading-none">✕</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
