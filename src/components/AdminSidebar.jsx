import { Link } from "react-router-dom";

// Shared sidebar navigation used by every Admin console page.
function AdminSidebar({ navGroups, activeId, footer, sectionBadge, networkStatus }) {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#e6ebf5] bg-white lg:flex">
      <div className="flex items-center gap-2 border-b border-[#eef1f8] p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
          <span className="material-symbols-outlined text-[16px]">lock</span>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold">VaultSpace</div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8996a9]">OPS B2B Portal</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold text-[#0e7b4c]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
        Hệ thống Sẵn sàng
        <span className="ml-auto text-[9px] text-[#8996a9]">{footer.version}</span>
      </div>

      <div className="flex items-center gap-1.5 border-b border-[#eef1f8] px-4 pb-2 text-[10px] font-semibold text-[#3a475a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1d5fe5]" />
        {sectionBadge.label}
        <span className="ml-auto rounded-full bg-[#eef4ff] px-1.5 py-0.5 text-[8px] font-bold text-[#1d5fe5]">{sectionBadge.tag}</span>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
          <div key={group.id}>
            <div className="px-2.5 pb-1 text-[8px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const className = `flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[11px] font-semibold transition ${
                  activeId === item.id ? "bg-[#eef4ff] text-[#1d5fe5]" : "text-[#58657a] hover:bg-[#f5f7fd]"
                }`;
                return item.to ? (
                  <Link key={item.id} to={item.to} className={className}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.id} className={className}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1.5 border-t border-[#eef1f8] p-4 text-[10px] font-semibold text-[#3a475a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
        {networkStatus.label}
        <span className="ml-auto text-[9px] text-[#8996a9]">{networkStatus.detail}</span>
      </div>
    </aside>
  );
}

export default AdminSidebar;
