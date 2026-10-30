import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AdminSidebar({ navGroups = [], activeId, isOpen = false, onClose, isAdmin = false }) {
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
    <aside className="flex h-screen w-full flex-col bg-[#111e35] text-slate-300">
      {/* Brand Header */}
      <div className="shrink-0 px-4 py-4 border-b border-slate-800">
        <Link
          to={isAdmin ? "/admin-overview" : "/manager-dashboard"}
          onClick={onClose}
          className="block text-base font-bold text-white no-underline tracking-tight"
        >
          G1SelfStorage
        </Link>
      </div>

      {/* Admin Console indicator - ONLY shown for system_administrator */}
      {isAdmin && (
        <div className="shrink-0 mx-3 mt-3 px-3 py-2 rounded-md border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300">
          Admin Console
        </div>
      )}

      {/* Navigation list: flex-1 min-h-0 overflow-y-auto ensures it never overlaps footer */}
      <nav aria-label="Management Navigation" className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[#3659df] text-white font-semibold"
                        : "text-slate-300 font-medium hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer pinned to bottom */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        <Link
          to="/staff-dashboard"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700/80 bg-slate-900/40 px-3 py-2 text-center text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <span className="material-symbols-outlined text-[15px]">badge</span>
          <span>Staff Ops Hub</span>
        </Link>
      </div>
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
