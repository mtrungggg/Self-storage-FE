// Shared topbar used by every Admin console page.
function AdminTopbar({ activeHub, statusBanner, profile }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-[#e6ebf5] bg-white px-4 lg:px-6">
      <button className="hidden items-center gap-1 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a] md:flex">
        <span className="material-symbols-outlined text-[14px]">domain</span>
        {activeHub}
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>

      <div className="flex flex-1 items-center gap-1.5 rounded-[8px] bg-[#f5f7fd] px-3 py-1.5">
        <span className="material-symbols-outlined text-[15px] text-[#8996a9]">search</span>
        <input
          placeholder="Search by name, contract #, ID, customer..."
          className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8996a9]"
        />
      </div>

      <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#0e7b4c] xl:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
        {statusBanner.label} • {statusBanner.detail}
      </span>

      <span className="material-symbols-outlined text-[18px] text-[#58657a]">notifications</span>
      <span className="material-symbols-outlined text-[18px] text-[#58657a]">settings</span>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
          <span className="material-symbols-outlined text-[16px]">person</span>
        </div>
        <div className="hidden leading-tight lg:block">
          <div className="text-[11px] font-bold">{profile.name}</div>
          <div className="text-[9px] text-[#8996a9]">{profile.role}</div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
