import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Box, X, ShieldCheck } from "lucide-react";

export default function AdminSidebar({ navGroups = [], activeId, isOpen = false, onClose }) {
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

  const content = <aside className="admin-sidebar">
    <Link to="/home" onClick={onClose} className="admin-brand">
      <span className="admin-brand-icon"><Box size={23} strokeWidth={1.7} /></span>
      <span><strong>G1 SelfStorage</strong><small>MANAGEMENT CONSOLE</small></span>
    </Link>
    <div className="admin-workspace"><ShieldCheck size={18} /><div><strong>Admin Console</strong><span>Centralized system governance</span></div></div>
    <nav aria-label="Admin Navigation" className="admin-nav">
      {navGroups.map((group) => <div key={group.id} className="admin-nav-group">
        <p>{group.label}</p>
        {group.items.map((item) => <Link key={item.id} to={item.to || "#"} onClick={onClose} aria-current={activeId === item.id ? "page" : undefined} className={`admin-nav-link ${activeId === item.id ? "is-active" : ""}`}>
          <span aria-hidden="true" className="material-symbols-outlined">{item.icon}</span>
          <span>{item.label}</span>
          {activeId === item.id && <span className="admin-nav-dot" />}
        </Link>)}
      </div>)}
    </nav>
  </aside>;
  return <>
    <a className="admin-skip-link" href="#admin-content">Skip to main content</a>
    <div className="admin-desktop-sidebar hidden lg:block">{content}</div>
    {isOpen && <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu" ref={drawerRef}>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative h-full w-[280px] max-w-[90vw]">
        {content}
        <button type="button" className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/10" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
      </div>
    </div>}
  </>;
}
