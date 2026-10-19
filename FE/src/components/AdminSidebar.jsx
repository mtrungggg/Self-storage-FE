import { Link } from "react-router-dom";

/**
 * Sidebar điều hướng thống nhất dùng chung cho Admin và Manager.
 * - Hiển thị rạch ròi 2 khu vực: Quản trị hệ thống (Admin) và Vận hành kho (Manager).
 * - Hỗ trợ responsive: Drawer trượt trên mobile / tablet và cố định trên desktop.
 */
function AdminSidebar({ navGroups, activeId, footer, sectionBadge, networkStatus, isOpen = false, onClose }) {
  const content = (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[#e6ebf5] bg-white">
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-[#eef1f8] p-4">
        <Link to="/home" onClick={onClose} className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1d5fe5] text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">warehouse</span>
          </div>
          <span className="text-[16px] tracking-tight">
            <span className="font-black text-[#0a3d91]">G1</span>
            <span className="font-bold text-[#0b1c30]">SelfStorage</span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8996a9] hover:bg-[#f5f7fd] lg:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* System status pill */}
      <div className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold text-[#0e7b4c]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
        System Active
        <span className="ml-auto text-[9px] text-[#8996a9]">{footer?.version || "v2.0"}</span>
      </div>

      {/* Console Section Badge */}
      <div className="flex items-center gap-1.5 border-b border-[#eef1f8] px-4 pb-2 text-[10px] font-semibold text-[#3a475a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1d5fe5]" />
        {sectionBadge?.label || "Management Portal"}
        <span className="ml-auto rounded-full bg-[#eef4ff] px-2 py-0.5 text-[8px] font-bold text-[#1d5fe5]">
          {sectionBadge?.tag || "PORTAL"}
        </span>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              <span>{group.label}</span>
              {group.badge && (
                <span className="rounded-[4px] bg-[#f1f4f9] px-1.5 py-0.2 text-[8px] font-bold text-[#627184]">
                  {group.badge}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                const className = `flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-[#eef4ff] text-[#1d5fe5] shadow-xs font-bold"
                    : "text-[#58657a] hover:bg-[#f5f7fd] hover:text-[#0b1c30]"
                }`;

                return item.to ? (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={className}
                  >
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isActive ? "text-[#1d5fe5]" : "text-[#7b8a9f]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <button key={item.id} className={className}>
                    <span className="material-symbols-outlined text-[17px] text-[#7b8a9f]">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to Home customer link */}
      <div className="border-t border-[#eef1f8] p-2.5">
        <Link
          to="/home"
          onClick={onClose}
          className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold text-[#58657a] hover:bg-[#f5f7fd] hover:text-[#0b1c30] transition"
        >
          <span className="material-symbols-outlined text-[16px] text-[#8996a9]">storefront</span>
          Trang chủ khách hàng
        </Link>
      </div>

      {/* Network / Security badge */}
      <div className="flex items-center gap-1.5 border-t border-[#eef1f8] px-4 py-2.5 text-[10px] font-semibold text-[#3a475a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
        {networkStatus?.label || "Bảo mật kết nối"}
        <span className="ml-auto text-[9px] text-[#8996a9]">{networkStatus?.detail || "TLS 1.3"}</span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">{content}</div>

      {/* Mobile drawer with backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
