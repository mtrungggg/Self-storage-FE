import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffSupportService from "../api/staffSupportService";
import StaffTicketReply from "../components/StaffTicketReply";
import StaffTicketCharge from "../components/StaffTicketCharge";
import TicketReportModal from "../components/TicketReportModal";
import ManagerFacilityContext from "../context/ManagerFacilityContext";
import { useAuth } from "../context/AuthContext";
import { TICKET_STATUS_LIST } from "../constants/ticketConstants";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("vi-VN") : "—";
}

const CATEGORY_PILLS = [
  { key: "", label: "Tất cả" },
  { key: "cleaning", label: "Vệ sinh / Dọn dẹp" },
  { key: "maintenance", label: "Bảo trì / Sửa chữa" },
  { key: "damage", label: "Hư hỏng / Sự cố" },
];

const STATUS_PILLS = [
  { key: "", label: "Tất cả" },
  { key: "open", label: "Chờ xử lý" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "completed", label: "Đã hoàn tất" },
];

export default function StaffSupportTickets() {
  const location = useLocation();
  const isManagerRoute = location.pathname.startsWith("/manager-");
  const managerFacilityContext = useContext(ManagerFacilityContext);
  const { user } = useAuth();

  const activeFacilityId = managerFacilityContext?.facilityId || user?.facilityId || "";
  const activeFacility = managerFacilityContext?.activeFacility || null;

  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState(() => ({
    facilityId: activeFacilityId || undefined,
    onlyAssignedToMe: !isManagerRoute ? true : undefined,
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportingTicket, setReportingTicket] = useState(null);

  const requestId = useRef(0);

  // Bộ lọc: chỉ hiển thị Ticket do Manager phân công cho Staff đang đăng nhập
  const displayTickets = useMemo(() => {
    if (isManagerRoute) return tickets;

    const currentUserId = user?.id || user?.userId || user?.employeeId;
    const currentEmpId = user?.employeeId;
    const currentName = (user?.fullName || user?.name || "").trim().toLowerCase();

    return tickets.filter((ticket) => {
      // Nếu backend đã flag isAssignedToMe
      if (ticket.isAssignedToMe === true) return true;

      // So khớp với ID nhân viên
      if (currentUserId && (ticket.assignedEmployeeId === currentUserId || ticket.assignedToId === currentUserId || String(ticket.assignedEmployeeId) === String(currentUserId))) {
        return true;
      }
      if (currentEmpId && (ticket.assignedEmployeeId === currentEmpId || String(ticket.assignedEmployeeId) === String(currentEmpId))) {
        return true;
      }

      // So khớp tên nhân viên
      if (currentName && ticket.assignedEmployeeName && ticket.assignedEmployeeName.trim().toLowerCase() === currentName) {
        return true;
      }

      // Nếu ticket chưa gán hoặc gán cho người khác, Staff không được tự nhận
      return false;
    });
  }, [tickets, isManagerRoute, user]);

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;

    const fetchParams = {
      ...query,
      onlyAssignedToMe: !isManagerRoute ? true : undefined,
    };

    staffSupportService
      .getTickets(fetchParams)
      .then((data) => {
        if (!active || id !== requestId.current) return;
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active && id === requestId.current) {
          setError(
            err.status === 403
              ? "Bạn không có quyền xem danh sách ticket này."
              : err.message || "Không thể tải danh sách ticket."
          );
        }
      })
      .finally(() => {
        if (active && id === requestId.current) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, isManagerRoute]);

  function load(filters) {
    requestId.current++;
    setLoading(true);
    setError("");
    setQuery({
      ...filters,
      onlyAssignedToMe: !isManagerRoute ? true : undefined,
    });
  }

  // Cập nhật khi cơ sở thay đổi
  useEffect(() => {
    if (activeFacilityId) {
      load({
        facilityId: activeFacilityId,
        category: category || undefined,
        status: status || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacilityId]);

  function handleCategoryChange(catKey) {
    setCategory(catKey);
    load({
      facilityId: activeFacilityId || undefined,
      category: catKey || undefined,
      status: status || undefined,
    });
  }

  function handleStatusChange(statKey) {
    setStatus(statKey);
    load({
      facilityId: activeFacilityId || undefined,
      category: category || undefined,
      status: statKey || undefined,
    });
  }

  function handleClearFilters() {
    setCategory("");
    setStatus("");
    load({
      facilityId: activeFacilityId || undefined,
    });
  }

  function handleReportSuccess(ticket, result) {
    const isSevere = result?.result === "Severe_Need_Relocation";
    setReportSuccess(
      isSevere
        ? `Đã gửi báo cáo Ticket ${ticket.ticketNo || `#${ticket.id}`}: Hư hỏng nặng (Severe_Need_Relocation). Yêu cầu đổi ô kho đã được chuyển đến Quản lý cơ sở.`
        : `Đã gửi báo cáo nghiệm thu hoàn tất (Resolved) cho Ticket ${ticket.ticketNo || `#${ticket.id}`}.`
    );
    load(query);
  }

  return (
    <div className="relative min-h-screen text-[#0b1c30]">
      <PageBackground />
      <main className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
        {!isManagerRoute && (
          <Link
            to="/staff-dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1d5fe5] hover:underline"
          >
            ← Quay lại Bảng điều khiển Nhân viên
          </Link>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Ticket &amp; Sự cố kho</h1>
            <p className="mt-1 text-xs text-slate-500">
              Cơ sở: <span className="font-semibold text-slate-700">{activeFacility?.name ? `${activeFacility.name} (${activeFacility.code || `ID: ${activeFacilityId}`})` : activeFacilityId ? `Cơ sở #${activeFacilityId}` : "Tất cả cơ sở"}</span>
              {!isManagerRoute && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  <span className="material-symbols-outlined text-[13px]">person_check</span>
                  Chỉ hiển thị Ticket do Manager phân công cho bạn
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(query)}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            {loading ? "Đang tải lại..." : "Làm mới"}
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-24">Danh mục:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PILLS.map((pill) => {
                const isSelected = category === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => handleCategoryChange(pill.key)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1d5fe5] text-white shadow-xs ring-2 ring-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-24">Trạng thái:</span>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_PILLS.map((pill) => {
                const isSelected = status === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => handleStatusChange(pill.key)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1d5fe5] text-white shadow-xs ring-2 ring-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Reset */}
          {(category || status) && (
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        <section aria-label="Support ticket list" aria-busy={loading} className="mt-5">
          {reportSuccess && (
            <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
              <span>{reportSuccess}</span>
            </div>
          )}

          {loading ? (
            <p role="status" className="p-6 text-center text-sm text-slate-500">Đang tải danh sách ticket được phân công...</p>
          ) : error ? (
            <div role="alert" className="rounded-xl bg-white p-6 text-red-600 border border-red-100">
              <p className="font-semibold">{error}</p>
              <button type="button" onClick={() => load(query)} className="mt-2 text-sm text-[#1d5fe5] underline">
                Thử lại
              </button>
            </div>
          ) : displayTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
              <p className="font-semibold text-slate-700">
                {!isManagerRoute
                  ? "Hiện tại không có Ticket nào do Manager phân công cho bạn."
                  : "Không có ticket nào khớp với bộ lọc."}
              </p>
              <p className="text-xs text-slate-400">
                {!isManagerRoute
                  ? "Khi Quản lý cơ sở phân công ticket sự cố hoặc dọn dẹp kho, ticket sẽ hiển thị tại đây."
                  : "Vui lòng chọn cơ sở hoặc điều chỉnh bộ lọc tìm kiếm."}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-[#58657a]">
                Hiển thị {displayTickets.length} ticket được Manager phân công
              </p>
              <div className="grid items-start gap-4 lg:grid-cols-2">
                {displayTickets.map((ticket) => {
                  const isSevere = ticket.reportResult === "Severe_Need_Relocation" || ticket.evaluationResult === "Severe_Need_Relocation";
                  const isResolved = ticket.reportResult === "Resolved" || ticket.status === "completed" || ticket.status === "resolved";

                  return (
                    <article
                      key={ticket.id}
                      className="min-w-0 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-xs transition hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1d5fe5]">
                            {ticket.ticketNo || `#${ticket.id}`}
                          </span>
                          {ticket.hasProposedCharges && (
                            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                              Đã đề xuất phí
                            </span>
                          )}
                          {isSevere && (
                            <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">warning</span>
                              Hư hỏng nặng - Đổi kho
                            </span>
                          )}
                          {isResolved && !isSevere && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              Đã xử lý xong
                            </span>
                          )}
                        </div>
                        <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-semibold text-[#1d5fe5] capitalize">
                          {ticket.status || "—"}
                        </span>
                      </div>

                      <h2 className="mt-3 break-words font-bold text-slate-900 text-sm">
                        {ticket.subject || "Sự cố thiết bị / kho"}
                      </h2>

                      <dl className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                        {[
                          ["Khách hàng", ticket.customerName || ticket.customerId],
                          [
                            "Cơ sở",
                            ticket.facilityName || ticket.facilityCode || ticket.facilityId,
                          ],
                          ["Hợp đồng", ticket.agreementNo || ticket.agreementId],
                          ["Ô kho", ticket.unitCode || ticket.storageUnitId],
                          ["Danh mục", ticket.category],
                          ["Mức ưu tiên", ticket.priority],
                          [
                            "Nhân viên phụ trách",
                            ticket.assignedEmployeeName ||
                              (ticket.assignedEmployeeId
                                ? `Staff #${ticket.assignedEmployeeId}`
                                : "Chưa gán"),
                          ],
                          ["Ngày tạo", formatDate(ticket.createdAt)],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-[11px] text-[#58657a]">{label}</dt>
                            <dd className="font-semibold text-slate-800 truncate">{value ?? "—"}</dd>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-3 whitespace-pre-wrap break-words border-t border-slate-100 pt-2.5 text-xs text-[#58657a]">
                        {ticket.description || "Không có mô tả chi tiết."}
                      </p>

                      {/* Hiển thị kết quả báo cáo nếu có */}
                      {isSevere && (
                        <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-950 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-800">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span>Kết quả: Hư hỏng nặng (Severe_Need_Relocation)</span>
                          </div>
                          <p className="text-slate-700">
                            {ticket.reportNote || ticket.note || ticket.resolution || "Kho hư hỏng nghiêm trọng, yêu cầu đổi kho tương đương."}
                          </p>
                          <p className="text-[11px] font-semibold text-rose-700">
                            → Đang chờ Quản lý cơ sở thực hiện đổi ô kho tương đương 0 VNĐ cho khách.
                          </p>
                        </div>
                      )}

                      {isResolved && !isSevere && (
                        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Kết quả: Đã giải quyết xong (Resolved)</span>
                          </div>
                          <p className="text-slate-700">
                            {ticket.reportNote || ticket.note || ticket.resolution || "Đã kiểm tra, vệ sinh và sửa chữa hoàn tất."}
                          </p>
                        </div>
                      )}

                      {/* Ảnh bằng chứng nghiệm thu EvidenceUrls */}
                      {Array.isArray(ticket.evidenceUrls) && ticket.evidenceUrls.length > 0 && (
                        <div className="mt-3 border-t border-slate-100 pt-2.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Ảnh chụp nghiệm thu ({ticket.evidenceUrls.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ticket.evidenceUrls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="h-14 w-14 rounded-lg border border-slate-200 overflow-hidden block hover:opacity-80 transition"
                                title="Xem ảnh gốc"
                              >
                                <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nút Báo cáo kết quả xử lý (Nghiệm thu) */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-medium text-slate-500">
                          {isSevere
                            ? "Đã yêu cầu đổi kho"
                            : isResolved
                            ? "Đã hoàn tất nghiệm thu"
                            : "Đang chờ bạn xử lý & nghiệm thu"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReportingTicket(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                          <span>{isResolved || isSevere ? "Báo cáo lại" : "Báo cáo kết quả xử lý"}</span>
                        </button>
                      </div>

                      {/* Mở rộng chi tiết phụ: Trả lời & Đề xuất phụ phí */}
                      <details className="group mt-3 overflow-hidden rounded-xl border border-[#dfe7f5] bg-[#f8faff]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs font-bold text-[#0b1c30] transition hover:bg-[#eef4ff] [&::-webkit-details-marker]:hidden">
                          <span>Trao đổi tin nhắn &amp; Đề xuất phụ phí</span>
                          <span className="text-xs text-[#58657a] transition-transform duration-200 group-open:rotate-180">▼</span>
                        </summary>
                        <div className="border-t border-[#dfe7f5] bg-white px-4 pb-4">
                          <StaffTicketReply ticketId={ticket.id} />
                          <StaffTicketCharge ticketId={ticket.id} />
                        </div>
                      </details>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* TicketReportModal: Báo cáo kết quả xử lý (Resolved / Severe_Need_Relocation) */}
      {reportingTicket && (
        <TicketReportModal
          ticket={reportingTicket}
          isOpen={Boolean(reportingTicket)}
          onClose={() => setReportingTicket(null)}
          onSuccess={(res) => handleReportSuccess(reportingTicket, res)}
        />
      )}
    </div>
  );
}
