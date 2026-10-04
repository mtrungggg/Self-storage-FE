import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSupport } from "../hooks/useSupport";
import { getCategoryLabel, getPriorityLabel, getStatusMeta } from "../data/supportRepository";
import { normalizeTicketStage } from "../domain/usecases/filterSupportRecords";
import { SUPPORT_HOTLINE } from "../constants/brand";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function Support() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    unitTabs,
    ticketTabs,
    categories,
    statusSteps,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    unitsLoading,
    unitsError,
    filteredUnits,
    ticketsLoading,
    ticketsError,
    filteredTickets,
    ticketSummaryStats,
    fetchTickets,

    // Create ticket form
    targetOptions,
    selectedTarget,
    setSelectedTarget,
    category,
    setCategory,
    priority,
    setPriority,
    subject,
    setSubject,
    description,
    setDescription,
    attachments,
    handleAddFiles,
    handleRemoveAttachment,
    allowMasterKey,
    setAllowMasterKey,
    submittingTicket,
    submitTicketError,
    submitTicketSuccess,
    handleCreateTicket,
    selectUnitForSupport,

    // Detail & Staff chat modal
    selectedTicketId,
    ticketDetail,
    detailLoading,
    detailError,
    openTicketDetail,
    closeTicketDetail,
    messageBody,
    setMessageBody,
    sendingMessage,
    messageError,
    handleSendMessage,

    // Confirm & Rate
    ratingScore,
    setRatingScore,
    ratingComment,
    setRatingComment,
    submittingRating,
    ratingError,
    ratingSuccess,
    handleConfirmAndRate,

    // Helpers
    formatDateTime,
    formatFileSize,
  } = useSupport();

  const detailStage = ticketDetail ? normalizeTicketStage(ticketDetail) : "Reported";
  const detailStatusMeta = ticketDetail
    ? getStatusMeta(ticketDetail.status, ticketDetail.displayStatus)
    : null;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === detailStage);

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="support" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="rounded-[16px] bg-[#0b1c30] p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {ticketSummaryStats.primaryFacilityName || "Hệ thống Kho Tự Quản"}
              </div>
              <h1 className="mt-1 text-[22px] sm:text-[24px] font-bold tracking-[-0.02em]">
                Trung tâm Hỗ trợ Kỹ thuật &amp; Báo cáo Sự cố
              </h1>
              <p className="mt-1 text-[13px] text-[#c7d1e6]">
                Xử lý yêu cầu sửa chữa, sự cố mã PIN/khóa điện tử, ô kho hư hỏng và hỗ trợ thanh toán.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("create-support-ticket-form");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[16px]">build</span>
                Gửi báo cáo sự cố
              </button>
              <a
                href={`tel:${SUPPORT_HOTLINE}`}
                className="flex items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                {SUPPORT_HOTLINE}
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Kho quản lý
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {ticketSummaryStats.totalUnits} Kho thuê
              </div>
              <div className="text-[10px] text-[#8f9cbd]">
                {ticketSummaryStats.activeUnitsCount} kho đang hoạt động
              </div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Cần gia hạn
                <span className="material-symbols-outlined text-[14px]">schedule</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {ticketSummaryStats.firstRenewUnit
                  ? `Kho #${ticketSummaryStats.firstRenewUnit.id}`
                  : `${ticketSummaryStats.renewUnitsCount} Kho`}
              </div>
              <div className="text-[10px] text-[#f2b8a4]">
                {ticketSummaryStats.firstRenewUnit
                  ? `⚠ ${ticketSummaryStats.firstRenewUnit.statusLabel}`
                  : "Tất cả hợp đồng còn hạn"}
              </div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Đang xử lý
                <span className="material-symbols-outlined text-[14px]">support_agent</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {ticketSummaryStats.activeCount} Yêu cầu
              </div>
              <div className="text-[10px] text-[#8f9cbd]">
                {ticketSummaryStats.reportedCount} mới báo • {ticketSummaryStats.inProgressCount} đang kiểm tra
              </div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Đã giải quyết
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {ticketSummaryStats.resolvedCount + ticketSummaryStats.closedCount} Ticket
              </div>
              <div className="text-[10px] text-[#8f9cbd]">
                {ticketSummaryStats.resolvedCount} chờ xác nhận • {ticketSummaryStats.closedCount} đã đóng
              </div>
            </div>
          </div>
        </div>

        {/* Rented Units Section */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0b1c30]">
              Danh sách Kho đang thuê &amp; Trạng thái hợp đồng
            </div>
            <p className="text-[11px] text-[#8996a9]">
              Chọn nhanh kho đang thuê để gửi báo cáo sự cố hoặc kiểm tra mã PIN truy cập
            </p>
          </div>
          <div className="inline-flex rounded-[10px] bg-[#eef4ff] p-1">
            {unitTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveUnitTab(tab.id)}
                className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition ${
                  activeUnitTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {unitsError && (
          <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[12px] font-semibold text-[#b3261e]">
            {unitsError}
          </div>
        )}

        {unitsLoading ? (
          <div className="mt-4 rounded-[14px] border border-[#dfe7f5] bg-white p-6 text-center text-[12px] text-[#58657a]">
            Đang tải danh sách hợp đồng thuê kho...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="mt-4 rounded-[14px] border border-[#dfe7f5] bg-white p-6 text-center text-[12px] text-[#58657a]">
            Không có kho đang thuê nào trong mục này. Bạn vẫn có thể chọn cơ sở để gửi yêu cầu hỗ trợ bên dưới.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.agreementId || unit.id}
                className={`rounded-[14px] border bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)] ${
                  unit.status === "renew" ? "border-[#f3b3a3]" : "border-[#dfe7f5]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">
                      warehouse
                    </span>
                    <span className="text-[14px] font-bold text-[#0b1c30]">Kho #{unit.id}</span>
                  </div>
                  {unit.status === "renew" ? (
                    <span className="flex items-center gap-1 rounded-full bg-[#fdecec] px-2 py-0.5 text-[10px] font-bold text-[#c0362c]">
                      <span className="material-symbols-outlined text-[12px]">error</span>
                      {unit.statusLabel}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#0e7b4c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                      {unit.statusLabel}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.location}</div>

                {unit.warning && (
                  <div className="mt-2 rounded-[8px] bg-[#fdecec] p-2 text-[10px] leading-4 text-[#c0362c]">
                    ⚠ {unit.warning}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      Kích thước khoang
                    </div>
                    <div className="font-semibold text-[#0b1c30]">{unit.size}</div>
                    {unit.sizeNote && (
                      <div className="text-[9px] text-[#8996a9]">{unit.sizeNote}</div>
                    )}
                  </div>
                  <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      Khu vực / Cơ sở
                    </div>
                    <div className="font-semibold text-[#0b1c30]">{unit.zoneInfo}</div>
                  </div>
                </div>

                {unit.contractLabel && (
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                        {unit.contractLabel}
                      </div>
                      <div className="font-semibold text-[#0b1c30]">{unit.contractDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0e7b4c]">{unit.contractLeft}</div>
                      <div className="text-[9px] text-[#8996a9]">{unit.payment}</div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/access-control")}
                  className={`mt-3 w-full rounded-[10px] py-2.5 text-[12px] font-bold ${
                    unit.status === "renew"
                      ? "bg-[#1d5fe5] text-white hover:bg-[#174fc7]"
                      : "bg-[#0b1c30] text-white hover:bg-[#132741]"
                  }`}
                >
                  Xem mã PIN / Khóa điện tử
                </button>

                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#1d5fe5]">
                  <button
                    type="button"
                    onClick={() => selectUnitForSupport(unit)}
                    className="hover:underline"
                  >
                    Báo cáo sự cố kho
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="hover:underline"
                  >
                    Xem hóa đơn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Support Grid: Create Ticket Form + Ticket List */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* Left: Create Support Ticket Form (POST /api/customer/support-tickets) */}
          <div
            id="create-support-ticket-form"
            className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-[#0b1c30]">
                Gửi yêu cầu hỗ trợ / Báo cáo hư hại
              </div>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5]">
                Hỗ trợ 24/7
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8996a9]">
              Báo cáo mã PIN/khóa hỏng, ô kho hư hỏng, sự cố thanh toán và đính kèm ảnh chụp hiện trường
            </p>

            {submitTicketError && (
              <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2.5 text-[12px] font-semibold text-[#b3261e]">
                {submitTicketError}
              </div>
            )}
            {submitTicketSuccess && (
              <div className="mt-3 rounded-[10px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-2.5 text-[12px] font-semibold text-[#067647]">
                {submitTicketSuccess}
              </div>
            )}

            <form className="mt-4 space-y-3" onSubmit={handleCreateTicket}>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Khoang lưu trữ / Cơ sở gặp sự cố *
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]"
                >
                  {targetOptions.length === 0 ? (
                    <option value="">Đang tải danh sách kho / cơ sở...</option>
                  ) : (
                    targetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Danh mục sự cố / Nhu cầu hỗ trợ *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Tiêu đề yêu cầu
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nhập tiêu đề tóm tắt sự cố..."
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Mức độ ưu tiên
                </label>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "normal"}
                      onChange={() => setPriority("normal")}
                      className="h-3.5 w-3.5 accent-[#1d5fe5]"
                    />
                    <span>
                      <span className="block font-semibold text-[#0b1c30]">Bình thường</span>
                      <span className="block text-[10px] text-[#8996a9]">Normal</span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "high"}
                      onChange={() => setPriority("high")}
                      className="h-3.5 w-3.5 accent-[#d97706]"
                    />
                    <span>
                      <span className="block font-semibold text-[#b45309]">Ưu tiên cao</span>
                      <span className="block text-[10px] text-[#8996a9]">High</span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "urgent"}
                      onChange={() => setPriority("urgent")}
                      className="h-3.5 w-3.5 accent-[#c0362c]"
                    />
                    <span>
                      <span className="block font-semibold text-[#c0362c]">Khẩn cấp</span>
                      <span className="block text-[10px] text-[#8996a9]">Urgent</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Mô tả tình huống chi tiết *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả sự cố, hiện tượng gặp phải và thời điểm phát hiện..."
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">
                  Đính kèm ảnh chụp hiện trường
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    handleAddFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#c7d1e6] bg-[#f8faff] p-4 text-center transition hover:border-[#1d5fe5] hover:bg-[#eef4ff]/50"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">
                    cloud_upload
                  </span>
                  <div className="mt-1 text-[11px] font-semibold text-[#3a475a]">
                    Nhấn để chọn ảnh hiện trường hoặc tài liệu đính kèm
                  </div>
                  <div className="text-[10px] text-[#8996a9]">
                    Hỗ trợ JPG, PNG, MP4 hoặc PDF
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {attachments.map((att, idx) => (
                      <div
                        key={`${att.fileName}-${idx}`}
                        className="flex items-center justify-between rounded-[8px] border border-[#eef1f8] bg-white px-3 py-2 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate text-[#3a475a]">
                          <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">
                            attachment
                          </span>
                          <span className="truncate font-medium">{att.fileName}</span>
                          <span className="text-[#8996a9]">• {att.fileSizeFormatted}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="material-symbols-outlined text-[16px] text-[#8996a9] hover:text-[#c0362c]"
                        >
                          close
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 text-[11px] text-[#3a475a]">
                <input
                  type="checkbox"
                  checked={allowMasterKey}
                  onChange={() => setAllowMasterKey((v) => !v)}
                  className="mt-0.5 h-4 w-4 accent-[#1d5fe5]"
                />
                Cho phép kỹ thuật viên dùng chìa Master mở kho kiểm tra khi vắng mặt (có camera giám sát).
              </label>

              <button
                type="submit"
                disabled={submittingTicket || targetOptions.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[13px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] hover:bg-[#174fc7] disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {submittingTicket ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hỗ trợ ngay"}
              </button>
            </form>
          </div>

          {/* Right: Ticket History & State Chart Progress (GET /api/customer/support-tickets) */}
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[15px] font-bold text-[#0b1c30]">
                  Lịch sử &amp; Tiến độ xử lý sự cố
                </div>
                <p className="text-[11px] text-[#8996a9]">
                  Theo dõi trạng thái (Reported → Investigating → Assessed → Resolved → Closed) và trao đổi với Staff
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTickets}
                disabled={ticketsLoading}
                className="flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#eef4ff]"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Làm mới
              </button>
            </div>

            <div className="mt-3 inline-flex flex-wrap gap-1 rounded-[10px] bg-[#eef4ff] p-1">
              {ticketTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTicketTab(tab.id)}
                  className={`rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    activeTicketTab === tab.id
                      ? "bg-[#0b1c30] text-white shadow-sm"
                      : "text-[#58657a] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {ticketsError && (
              <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2.5 text-[12px] font-semibold text-[#b3261e]">
                {ticketsError}
              </div>
            )}

            <div className="mt-3 space-y-3">
              {ticketsLoading ? (
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-6 text-center text-[12px] text-[#58657a]">
                  Đang tải danh sách yêu cầu hỗ trợ...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-6 text-center">
                  <span className="material-symbols-outlined text-[28px] text-[#8996a9]">
                    inbox
                  </span>
                  <div className="mt-1 text-[13px] font-semibold text-[#0b1c30]">
                    Chưa có yêu cầu hỗ trợ nào trong mục này
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#8996a9]">
                    Nếu gặp sự cố về mã PIN, khóa điện tử, ô kho hoặc thanh toán, hãy gửi yêu cầu ở biểu mẫu bên cạnh.
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const stepIdx = statusSteps.findIndex((s) => s.key === ticket.stage);
                  return (
                    <div
                      key={ticket.id}
                      className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5 transition hover:border-[#c7d1e6]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#1d5fe5]">
                            #{ticket.ticketNo || ticket.id}
                          </span>
                          <span className="rounded-md border border-[#dfe7f5] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3a475a]">
                            {ticket.categoryLabel}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              ticket.priority === "urgent"
                                ? "bg-[#fdecec] text-[#c0362c]"
                                : ticket.priority === "high"
                                ? "bg-[#fef3c7] text-[#b45309]"
                                : "bg-white text-[#58657a]"
                            }`}
                          >
                            {ticket.priorityLabel}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ticket.statusBadgeClass}`}
                        >
                          {ticket.statusBadgeText}
                        </span>
                      </div>

                      <div className="mt-1.5 text-[13px] font-bold text-[#0b1c30]">
                        {ticket.subject}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#8996a9]">
                        <span>Cơ sở: {ticket.facilityName}</span>
                        <span>• Tạo lúc: {ticket.createdTimeFormatted}</span>
                        {ticket.resolvedTimeFormatted && (
                          <span className="text-[#0e7b4c]">
                            • Xử lý xong: {ticket.resolvedTimeFormatted}
                          </span>
                        )}
                      </div>

                      {/* Mini State Chart Progress Bar */}
                      {ticket.stage !== "Cancelled" && (
                        <div className="mt-2.5 grid grid-cols-5 gap-1">
                          {statusSteps.map((step, idx) => {
                            const reached = stepIdx >= idx;
                            return (
                              <div key={step.key} className="text-center">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    reached ? "bg-[#1d5fe5]" : "bg-[#dfe7f5]"
                                  }`}
                                />
                                <div
                                  className={`mt-1 text-[9px] font-semibold ${
                                    reached ? "text-[#0b1c30]" : "text-[#8996a9]"
                                  }`}
                                >
                                  {step.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f8] pt-2.5">
                        <div className="flex items-center gap-2">
                          {ticket.ratingScore ? (
                            <div className="flex items-center gap-1 rounded-full bg-[#fef9c3] px-2.5 py-0.5 text-[10px] font-bold text-[#a16207]">
                              <span className="material-symbols-outlined text-[13px] text-[#eab308]">
                                star
                              </span>
                              Đã đánh giá {ticket.ratingScore}/5 sao
                            </div>
                          ) : ticket.stage === "Resolved" ? (
                            <span className="text-[10px] font-semibold text-[#0e7b4c]">
                              ✓ Nhân viên đã xử lý xong – Chờ bạn xác nhận &amp; đánh giá
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#58657a]">
                              Nhấn để xem phản hồi &amp; trao đổi với Nhân viên (Staff)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {ticket.stage === "Resolved" && !ticket.ratingScore && (
                            <button
                              type="button"
                              onClick={() => openTicketDetail(ticket.id)}
                              className="flex items-center gap-1 rounded-[8px] bg-[#0e7b4c] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#0b633d]"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                rate_review
                              </span>
                              Xác nhận &amp; Đánh giá
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openTicketDetail(ticket.id)}
                            className="flex items-center gap-1 rounded-[8px] bg-[#1d5fe5] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#174fc7]"
                          >
                            <span className="material-symbols-outlined text-[14px]">forum</span>
                            Chi tiết &amp; Tin nhắn
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Detail, Staff Chat & Confirm-and-Rate Modal */}
      {selectedTicketId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[18px] border border-[#dfe7f5] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#eef1f8] bg-[#0b1c30] px-5 py-4 text-white">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold text-[#60a5fa]">
                    #{ticketDetail?.ticketNo || selectedTicketId}
                  </span>
                  {detailStatusMeta && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${detailStatusMeta.badgeClass}`}
                    >
                      {detailStatusMeta.badgeText}
                    </span>
                  )}
                  {ticketDetail?.category && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#c7d1e6]">
                      {getCategoryLabel(ticketDetail.category)}
                    </span>
                  )}
                  {ticketDetail?.priority && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#c7d1e6]">
                      {getPriorityLabel(ticketDetail.priority)}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 text-[16px] font-bold">
                  {ticketDetail?.subject || "Chi tiết yêu cầu hỗ trợ"}
                </h2>
                {ticketDetail && (
                  <div className="mt-0.5 text-[11px] text-[#c7d1e6]">
                    Cơ sở: {ticketDetail.facilityName}
                    {ticketDetail.unitName ? ` • Kho #${ticketDetail.unitName}` : ""}
                    {" • "}Tạo lúc: {formatDateTime(ticketDetail.createdAt)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={closeTicketDetail}
                className="rounded-lg p-1 text-[#c7d1e6] hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {detailLoading ? (
                <div className="py-10 text-center text-[13px] text-[#58657a]">
                  Đang tải chi tiết phản hồi và lịch sử tin nhắn...
                </div>
              ) : detailError ? (
                <div className="rounded-[10px] border border-[#fecdca] bg-[#fff1f1] p-4 text-[12px] font-semibold text-[#b3261e]">
                  {detailError}
                </div>
              ) : (
                ticketDetail && (
                  <>
                    <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#58657a]">
                        Tiến độ xử lý sự cố (Incident State Chart)
                      </div>
                      <div className="mt-2.5 grid grid-cols-5 gap-2">
                        {statusSteps.map((step, idx) => {
                          const reached = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;
                          return (
                            <div
                              key={step.key}
                              className={`rounded-[8px] border p-2 text-center ${
                                isCurrent
                                  ? "border-[#1d5fe5] bg-[#eef4ff]"
                                  : reached
                                  ? "border-[#abefc6] bg-[#ecfdf3]"
                                  : "border-[#eef1f8] bg-white"
                              }`}
                            >
                              <div
                                className={`text-[11px] font-bold ${
                                  isCurrent
                                    ? "text-[#1d5fe5]"
                                    : reached
                                    ? "text-[#0e7b4c]"
                                    : "text-[#8996a9]"
                                }`}
                              >
                                {step.label}
                              </div>
                              <div className="text-[9px] text-[#58657a]">{step.sub}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-[#eef1f8] bg-white p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                        Mô tả sự cố ban đầu
                      </div>
                      <p className="mt-1.5 whitespace-pre-line text-[12px] leading-5 text-[#0b1c30]">
                        {ticketDetail.description}
                      </p>

                      {ticketDetail.initialAttachments &&
                        ticketDetail.initialAttachments.length > 0 && (
                          <div className="mt-3 border-t border-[#eef1f8] pt-2.5">
                            <div className="text-[10px] font-bold text-[#58657a]">
                              Tệp / Ảnh hiện trường đính kèm ({ticketDetail.initialAttachments.length}):
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {ticketDetail.initialAttachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.objectUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[11px] font-semibold text-[#1d5fe5] hover:underline"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    image
                                  </span>
                                  <span>{att.fileName}</span>
                                  <span className="text-[10px] text-[#8996a9]">
                                    ({formatFileSize(att.fileSizeBytes)})
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      {ticketDetail.resolution && (
                        <div className="mt-3 rounded-[10px] border border-[#abefc6] bg-[#ecfdf3] p-3">
                          <div className="text-[11px] font-bold text-[#067647]">
                            Kết quả xử lý từ Nhân viên kỹ thuật:
                          </div>
                          <div className="mt-0.5 text-[12px] text-[#0b1c30]">
                            {ticketDetail.resolution}
                          </div>
                        </div>
                      )}
                    </div>

                    {(detailStage === "Resolved" || ticketDetail.rating) && (
                      <div className="rounded-[12px] border border-[#fde68a] bg-[#fffbeb] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[13px] font-bold text-[#92400e]">
                            {ticketDetail.rating
                              ? "Đánh giá chất lượng dịch vụ của bạn"
                              : "Xác nhận kết quả xử lý & Đánh giá dịch vụ (Confirm & Rate)"}
                          </div>
                          <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-bold text-[#b45309]">
                            {ticketDetail.rating ? "Đã hoàn tất (Closed)" : "Bước cuối"}
                          </span>
                        </div>

                        {ratingError && (
                          <div className="mt-2 rounded-[8px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2 text-[11px] font-semibold text-[#b3261e]">
                            {ratingError}
                          </div>
                        )}
                        {ratingSuccess && (
                          <div className="mt-2 rounded-[8px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-2 text-[11px] font-semibold text-[#067647]">
                            {ratingSuccess}
                          </div>
                        )}

                        {ticketDetail.rating ? (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 text-[#f59e0b]">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`material-symbols-outlined text-[18px] ${
                                    idx < ticketDetail.rating.score
                                      ? "text-[#f59e0b]"
                                      : "text-[#d1d5db]"
                                  }`}
                                >
                                  star
                                </span>
                              ))}
                              <span className="ml-1.5 text-[12px] font-bold text-[#0b1c30]">
                                {ticketDetail.rating.score}/5 sao
                              </span>
                            </div>
                            {ticketDetail.rating.comment && (
                              <p className="mt-1 text-[12px] italic text-[#3a475a]">
                                &ldquo;{ticketDetail.rating.comment}&rdquo;
                              </p>
                            )}
                            <div className="mt-1 text-[10px] text-[#8996a9]">
                              Đánh giá lúc: {formatDateTime(ticketDetail.rating.createdAt)}
                            </div>
                          </div>
                        ) : (
                          <form className="mt-3 space-y-2.5" onSubmit={(e) => handleConfirmAndRate(e)}>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#0b1c30]">
                                Chọn số sao đánh giá chất lượng xử lý (1 - 5 sao):
                              </label>
                              <div className="mt-1 flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingScore(star)}
                                    className={`flex items-center gap-1 rounded-[8px] border px-2.5 py-1 text-[12px] font-bold transition ${
                                      ratingScore >= star
                                        ? "border-[#f59e0b] bg-[#fef3c7] text-[#b45309]"
                                        : "border-[#dfe7f5] bg-white text-[#8996a9]"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[15px]">
                                      star
                                    </span>
                                    {star}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                placeholder="Nhận xét thêm về thái độ và tốc độ hỗ trợ của Nhân viên (tùy chọn)..."
                                className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#f59e0b]"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={submittingRating}
                              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0e7b4c] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#0b633d] disabled:opacity-60"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                check_circle
                              </span>
                              {submittingRating
                                ? "Đang xác nhận..."
                                : "Xác nhận kết quả & Gửi đánh giá"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-[#0b1c30]">
                          Lịch sử trao đổi tin nhắn với Nhân viên (Staff)
                        </div>
                        <span className="text-[10px] font-semibold text-[#58657a]">
                          {ticketDetail.messages?.length || 0} tin nhắn
                        </span>
                      </div>

                      <div className="mt-3 max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
                        {!ticketDetail.messages || ticketDetail.messages.length === 0 ? (
                          <div className="rounded-[8px] bg-white p-4 text-center text-[11px] text-[#8996a9]">
                            Chưa có tin nhắn phản hồi nào. Bạn có thể gửi tin nhắn trao đổi trực tiếp với Nhân viên bên dưới.
                          </div>
                        ) : (
                          ticketDetail.messages.map((msg) => {
                            const isStaff =
                              (msg.authorRole || "").toLowerCase().includes("staff") ||
                              (msg.authorRole || "").toLowerCase().includes("employee");
                            return (
                              <div
                                key={msg.id}
                                className={`rounded-[10px] border p-3 ${
                                  isStaff
                                    ? "border-[#bfdbfe] bg-[#eff6ff]"
                                    : "border-[#eef1f8] bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                                    <span>
                                      {msg.authorName || (isStaff ? "Nhân viên hỗ trợ" : "Bạn")}
                                    </span>
                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                        isStaff
                                          ? "bg-[#1d5fe5] text-white"
                                          : "bg-[#e2e8f0] text-[#334155]"
                                      }`}
                                    >
                                      {isStaff ? "Staff" : msg.authorRole || "Customer"}
                                    </span>
                                  </div>
                                  <span className="text-[#8996a9]">
                                    {formatDateTime(msg.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 whitespace-pre-line text-[12px] text-[#1e293b]">
                                  {msg.body}
                                </p>
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {msg.attachments.map((att) => (
                                      <a
                                        key={att.id}
                                        href={att.objectUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded border border-[#dfe7f5] bg-white px-2 py-1 text-[10px] font-semibold text-[#1d5fe5] hover:underline"
                                      >
                                        <span className="material-symbols-outlined text-[12px]">
                                          attachment
                                        </span>
                                        {att.fileName}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {detailStage !== "Closed" && detailStage !== "Cancelled" && (
                        <form className="mt-3 space-y-2" onSubmit={handleSendMessage}>
                          {messageError && (
                            <div className="text-[11px] font-semibold text-[#b3261e]">
                              {messageError}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={messageBody}
                              onChange={(e) => setMessageBody(e.target.value)}
                              placeholder="Nhập tin nhắn trao đổi trực tiếp với Nhân viên (Staff)..."
                              className="flex-1 rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                            />
                            <button
                              type="submit"
                              disabled={sendingMessage}
                              className="flex items-center gap-1 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7] disabled:opacity-60"
                            >
                              <span className="material-symbols-outlined text-[15px]">send</span>
                              {sendingMessage ? "Đang gửi..." : "Gửi"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Support;
