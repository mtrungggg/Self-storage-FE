import { useState, useEffect, useMemo, useRef } from "react";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import managerTicketService from "../api/managerTicketService";
import AssignStaffModal from "../components/AssignStaffModal";
import EmergencyReassignModal from "../components/EmergencyReassignModal";
import StaffTicketReply from "../components/StaffTicketReply";
import StaffTicketCharge from "../components/StaffTicketCharge";

function formatDate(val) {
  const d = val ? new Date(val) : null;
  return d && !isNaN(d.getTime()) ? d.toLocaleString("vi-VN") : "—";
}

const STATUS_FILTERS = [
  { key: "", label: "Tất cả" },
  { key: "pending_manager_review", label: "Chờ Manager duyệt" },
  { key: "in_progress", label: "Đang xử lý / Đã giao Staff" },
  { key: "severe_need_relocation", label: "Hư hỏng nặng (Đổi kho)" },
  { key: "resolved", label: "Đã xử lý xong" },
  { key: "closed", label: "Đã đóng" },
];

export default function ManagerTicketsPage() {
  const { activeFacility, facilityId } = useManagerFacility();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Modals state
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [emergencyTicket, setEmergencyTicket] = useState(null);

  const requestId = useRef(0);

  const loadTickets = async () => {
    const cur = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const data = await managerTicketService.getTickets({
        facilityId,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      if (cur === requestId.current) {
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (cur === requestId.current) {
        setError(err.message || "Không thể tải danh sách ticket cơ sở.");
      }
    } finally {
      if (cur === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, statusFilter]);

  // Client-side filtering & sorting
  const filteredTickets = useMemo(() => {
    let list = [...tickets];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          String(t.ticketNo || t.id).toLowerCase().includes(q) ||
          (t.subject || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.unitCode || "").toLowerCase().includes(q) ||
          (t.customerName || "").toLowerCase().includes(q) ||
          (t.agreementNo || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      list = list.filter((t) => {
        const s = String(t.status || t.reportResult || "").toLowerCase();
        if (statusFilter === "pending_manager_review") {
          return s.includes("pending") || s.includes("review") || !t.assignedEmployeeId;
        }
        if (statusFilter === "severe_need_relocation") {
          return s.includes("severe") || s.includes("relocation") || t.reportResult === "Severe_Need_Relocation";
        }
        if (statusFilter === "resolved") {
          return s.includes("resolved") || s.includes("completed") || t.reportResult === "Resolved";
        }
        return s === statusFilter.toLowerCase();
      });
    }

    return list;
  }, [tickets, searchQuery, statusFilter]);

  // Đếm số lượng ticket cần Manager duyệt
  const pendingReviewCount = useMemo(() => {
    return tickets.filter((t) => {
      const s = String(t.status || "").toLowerCase();
      return s.includes("pending") || s.includes("review") || !t.assignedEmployeeId;
    }).length;
  }, [tickets]);

  // Đếm số lượng ticket hư hại nặng cần đổi kho
  const severeRelocationCount = useMemo(() => {
    return tickets.filter((t) => {
      const s = String(t.status || t.reportResult || "").toLowerCase();
      return s.includes("severe") || s.includes("relocation") || t.reportResult === "Severe_Need_Relocation";
    }).length;
  }, [tickets]);

  function handleAssignSuccess(assignedData) {
    const tNo = assigningTicket?.ticketNo || `#${assigningTicket?.id}`;
    setToastMsg(`Đã giao Ticket ${tNo} cho nhân viên ${assignedData.assignedEmployeeName} thành công.`);

    setTickets((prev) =>
      prev.map((t) =>
        t.id === assigningTicket.id
          ? {
              ...t,
              status: "in_progress",
              assignedEmployeeId: assignedData.assignedEmployeeId,
              assignedEmployeeName: assignedData.assignedEmployeeName,
            }
          : t
      )
    );
  }

  function handleEmergencyReassignSuccess(reassignData) {
    const tNo = emergencyTicket?.ticketNo || `#${emergencyTicket?.id}`;
    setToastMsg(
      `Đã hoàn tất đổi kho khẩn cấp cho Ticket ${tNo}! Kho cũ ${reassignData.oldUnitCode} chuyển sang bảo trì, kho mới ${reassignData.newUnitCode} đã cấp cho khách (Mã PIN mới: ${reassignData.newPin}).`
    );

    setTickets((prev) =>
      prev.map((t) =>
        t.id === emergencyTicket.id
          ? {
              ...t,
              status: "resolved",
              reportResult: "Resolved_Relocated",
              reassignedUnitCode: reassignData.newUnitCode,
            }
          : t
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Điều phối Ticket sự cố &amp; Đổi kho khẩn cấp
            </h1>
            {pendingReviewCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold text-white animate-pulse">
                {pendingReviewCount} cần duyệt
              </span>
            )}
            {severeRelocationCount > 0 && (
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                {severeRelocationCount} đổi kho khẩn cấp
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cơ sở: <strong className="text-slate-800">{activeFacility?.name ? `${activeFacility.name} (${activeFacility.code || `ID: ${facilityId}`})` : facilityId ? `Cơ sở #${facilityId}` : "Tất cả cơ sở"}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {toastMsg && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-24">
            Trạng thái:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((pill) => {
              const isSelected = statusFilter === pill.key;
              const isPending = pill.key === "pending_manager_review";
              const isSevere = pill.key === "severe_need_relocation";

              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setStatusFilter(pill.key)}
                  className={`relative rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-[#1d5fe5] text-white shadow-xs ring-2 ring-blue-200"
                      : isPending && pendingReviewCount > 0
                      ? "bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold"
                      : isSevere && severeRelocationCount > 0
                      ? "bg-rose-100 text-rose-900 hover:bg-rose-200 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{pill.label}</span>
                  {isPending && pendingReviewCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                      {pendingReviewCount}
                    </span>
                  )}
                  {isSevere && severeRelocationCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-rose-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                      {severeRelocationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã ticket, tên khách, số điện thoại, kho, hợp đồng..."
            className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tickets List */}
      <section aria-label="Manager tickets list" className="space-y-4">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Đang tải danh sách ticket...</p>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
            <p className="font-semibold text-slate-700">Không có ticket nào cần xử lý.</p>
            <p className="text-xs text-slate-400">
              Các sự cố do khách hàng báo lên hoặc yêu cầu đổi kho sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTickets.map((ticket) => {
              const isPendingReview =
                String(ticket.status || "").toLowerCase().includes("pending") ||
                String(ticket.status || "").toLowerCase().includes("review") ||
                !ticket.assignedEmployeeId;
              const isSevere =
                ticket.reportResult === "Severe_Need_Relocation" ||
                String(ticket.status || "").toLowerCase().includes("severe");
              const isResolved =
                ticket.reportResult === "Resolved" ||
                ticket.status === "completed" ||
                ticket.status === "resolved";

              return (
                <article
                  key={ticket.id}
                  className={`rounded-2xl border p-5 shadow-xs transition hover:shadow-sm flex flex-col justify-between ${
                    isSevere
                      ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                      : isPendingReview
                      ? "border-amber-300 bg-amber-50/15"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1d5fe5]">
                          {ticket.ticketNo || `#${ticket.id}`}
                        </span>

                        {isPendingReview && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300 animate-pulse">
                            <span className="material-symbols-outlined text-[12px] text-amber-700">schedule</span>
                            Pending_Manager_Review
                          </span>
                        )}

                        {isSevere && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300">
                            <span className="material-symbols-outlined text-[12px] text-rose-600">warning</span>
                            Severe_Need_Relocation
                          </span>
                        )}

                        {isResolved && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                            Resolved
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500 capitalize">
                        {ticket.category || "Sự cố thiết bị"}
                      </span>
                    </div>

                    {/* Subject & Description */}
                    <div className="mt-3">
                      <h2 className="text-sm font-bold text-slate-900">
                        {ticket.subject || "Sự cố phản ánh từ khách hàng"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {ticket.description || "Không có mô tả chi tiết."}
                      </p>
                    </div>

                    {/* Meta info */}
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
                      <div>
                        <dt className="text-[11px] text-slate-400">Khách hàng</dt>
                        <dd className="font-semibold text-slate-800 truncate">{ticket.customerName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-slate-400">Số điện thoại</dt>
                        <dd className="font-semibold text-slate-800 truncate">{ticket.customerPhone || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-slate-400">Ô kho hiện tại</dt>
                        <dd className="font-bold text-slate-900 truncate">
                          {ticket.unitCode ? `Kho ${ticket.unitCode}` : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-slate-400">Hợp đồng</dt>
                        <dd className="font-mono text-slate-700 truncate">{ticket.agreementNo || `#${ticket.id}`}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-slate-400">Nhân viên phụ trách</dt>
                        <dd className="font-semibold text-slate-800 truncate">
                          {ticket.assignedEmployeeName ? (
                            <span className="text-blue-700 font-bold">{ticket.assignedEmployeeName}</span>
                          ) : (
                            <span className="text-amber-700 font-bold italic">Chưa giao Staff</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-slate-400">Thời gian tạo</dt>
                        <dd className="text-slate-600 truncate">{formatDate(ticket.createdAt)}</dd>
                      </div>
                    </dl>

                    {/* BÁO CÁO TỪ STAFF (NẾU ĐÃ CÓ BÁO CÁO) */}
                    {isSevere && (
                      <div className="mt-3 rounded-xl bg-rose-50 border-2 border-rose-400 p-3 text-xs text-rose-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-extrabold text-rose-800 text-sm">
                          <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                          <span>BÁO CÁO TỪ STAFF: HƯ HỎNG NẶNG (Severe_Need_Relocation)</span>
                        </div>
                        <p className="text-slate-800">
                          {ticket.reportNote || ticket.notes || "Kho bị sự cố nghiêm trọng không thể khắc phục tại chỗ. Yêu cầu Quản lý cơ sở đổi sang ô kho tương đương cho khách."}
                        </p>
                        <div className="text-[11px] font-bold text-rose-700 pt-0.5">
                          → Cần xử lý: Bấm nút &ldquo;Đổi kho khẩn cấp (0đ)&rdquo; bên dưới để cấp ô kho mới và sinh mã PIN/QR cho khách.
                        </div>
                      </div>
                    )}

                    {isResolved && !isSevere && (
                      <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">done_all</span>
                          <span>Báo cáo Staff: Đã sửa / dọn dẹp xong (Resolved)</span>
                        </div>
                        <p className="text-slate-700">{ticket.reportNote || ticket.resolution || "Sự cố đã được khắc phục hoàn tất."}</p>
                      </div>
                    )}

                    {/* Ảnh nghiệm thu / hiện trường nếu có */}
                    {Array.isArray(ticket.evidenceUrls) && ticket.evidenceUrls.length > 0 && (
                      <div className="mt-2.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Ảnh hiện trường từ Staff ({ticket.evidenceUrls.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ticket.evidenceUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden block hover:opacity-80 transition"
                            >
                              <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION BAR */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Nút Giao việc Staff */}
                    <button
                      type="button"
                      onClick={() => setAssigningTicket(ticket)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                        isPendingReview
                          ? "bg-[#1d5fe5] hover:bg-[#1550c7] text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                      <span>{ticket.assignedEmployeeId ? "Đổi Staff khác" : "Giao việc cho Staff"}</span>
                    </button>

                    {/* NÚT LÀM NỔI BẬT: Đổi kho khẩn cấp (0đ) khi Severe_Need_Relocation */}
                    {isSevere && (
                      <button
                        type="button"
                        onClick={() => setEmergencyTicket(ticket)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 animate-bounce-short"
                      >
                        <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                        <span>Đổi kho khẩn cấp (0đ)</span>
                      </button>
                    )}
                  </div>

                  {/* Mở rộng chi tiết trao đổi tin nhắn */}
                  <details className="group mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                      <span>Trao đổi tin nhắn nội bộ &amp; Phụ phí</span>
                      <span className="text-[10px] text-slate-500 transition-transform duration-200 group-open:rotate-180">▼</span>
                    </summary>
                    <div className="border-t border-slate-200 bg-white p-3">
                      <StaffTicketReply ticketId={ticket.id} />
                      <StaffTicketCharge ticketId={ticket.id} />
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL 1: GIAO VIỆC CHO STAFF */}
      {assigningTicket && (
        <AssignStaffModal
          ticket={assigningTicket}
          facilityId={facilityId}
          isOpen={Boolean(assigningTicket)}
          onClose={() => setAssigningTicket(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* MODAL 2: ĐỔI KHO KHẨN CẤP (0 VNĐ) */}
      {emergencyTicket && (
        <EmergencyReassignModal
          ticket={emergencyTicket}
          facilityId={facilityId}
          isOpen={Boolean(emergencyTicket)}
          onClose={() => setEmergencyTicket(null)}
          onSuccess={handleEmergencyReassignSuccess}
        />
      )}
    </div>
  );
}
