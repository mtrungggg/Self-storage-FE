import { useStaffDashboard } from "../hooks/useStaffDashboard";

function StaffDashboard() {
  const {
    profile,
    facilityStats,
    ticketTabs,
    shiftSchedule,
    activeTicketTab,
    setActiveTicketTab,
    filteredTickets,
    ticketStats,
  } = useStaffDashboard();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <header className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[#0b1c30]">VaultSpace</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8996a9]">Staff Operations Console</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <span className="hidden items-center gap-1 md:flex">
              <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">domain</span>
              {profile.facility}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <div className="hidden leading-tight lg:block">
              <div className="text-[12px] font-bold text-[#0b1c30]">{profile.name}</div>
              <div className="text-[10px] text-[#8996a9]">{profile.role}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="rounded-[16px] bg-[#0b1c30] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Ca trực: {profile.shift}
              </div>
              <h1 className="mt-2 text-[24px] font-bold tracking-[-0.02em]">Bảng điều khiển Nhân viên Vận hành</h1>
              <p className="mt-2 max-w-[520px] text-[12px] leading-6 text-[#c7d1e6]">
                Theo dõi tình trạng cơ sở, xử lý yêu cầu hỗ trợ kỹ thuật và bàn giao ca làm việc.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            {facilityStats.map((stat) => (
              <div key={stat.id} className="rounded-[12px] border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                  {stat.label}
                  <span className="material-symbols-outlined text-[14px]">{stat.icon}</span>
                </div>
                <div className="mt-1 text-[16px] font-bold">{stat.value}</div>
                <div className="text-[10px] text-[#8f9cbd]">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[15px] font-bold text-[#0b1c30]">Yêu cầu hỗ trợ được phân công</div>
                <p className="text-[11px] text-[#8996a9]">
                  {ticketStats.pending} đang chờ • {ticketStats.inProgress} đang xử lý • {ticketStats.resolved} đã xử lý
                </p>
              </div>
              <div className="inline-flex flex-wrap rounded-[10px] bg-[#eef4ff] p-1">
                {ticketTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTicketTab(tab.id)}
                    className={`rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold transition ${
                      activeTicketTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#1d5fe5]">{ticket.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ticket.status === "pending"
                          ? "bg-[#eef4ff] text-[#1d5fe5]"
                          : ticket.status === "in_progress"
                          ? "bg-[#0b1c30] text-white"
                          : "bg-[#e7f8ee] text-[#0e7b4c]"
                      }`}
                    >
                      {ticket.statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#0b1c30]">{ticket.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-[#8996a9]">
                    <span>Khoang: {ticket.unit}</span>
                    <span>{ticket.time}</span>
                    <span className="font-semibold text-[#c0362c]">{ticket.priority}</span>
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="rounded-[12px] border border-dashed border-[#dfe7f5] p-6 text-center text-[12px] text-[#8996a9]">
                  Không có yêu cầu nào trong mục này.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="text-[15px] font-bold text-[#0b1c30]">Lịch trình ca trực</div>
            <p className="text-[11px] text-[#8996a9]">Danh sách công việc cần thực hiện trong ca hôm nay</p>

            <div className="mt-4 space-y-3">
              {shiftSchedule.map((item) => (
                <div key={item.time} className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[11px] font-bold text-[#1d5fe5]">{item.time}</div>
                  <div className="mt-0.5 text-[12px] text-[#3a475a]">{item.task}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffDashboard;
