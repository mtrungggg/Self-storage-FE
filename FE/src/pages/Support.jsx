import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupportTicketDetail from "../components/SupportTicketDetail";
import { useSupport } from "../hooks/useSupport";
import { useAuth } from "../hooks/useAuth";
import SupportDropdown from "../components/SupportDropdown";
import { SUPPORT_CATEGORIES } from "../data/supportCategories";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import MediaUpload from "../components/MediaUpload";

function Support() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detailTicketId, setDetailTicketId] = useState(null);

  const {
    ticketTabs,
    activeTicketTab,
    setActiveTicketTab,
    priority,
    setPriority,
    allowMasterKey,
    setAllowMasterKey,
    filteredTickets,
    facilityName,
    activeRentals,
    rentalsLoading,
    selectedUnitCode,
    setSelectedUnitCode,
    category,
    setCategory,
    description,
    setDescription,
    attachments,
    addAttachment,
    removeAttachment,
    submitSuccess,
    submitError,
    submitting,
    ticketsLoading,
    ticketsError,
    addTicket,
    updateTicket,
  } = useSupport();

  const handleSubmit = (e) => {
    e.preventDefault();
    void addTicket();
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="support" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Banner Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0b1c30] px-6 py-5 text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8f9cbd]">
              <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">support_agent</span>
              {facilityName || "Storage Support"}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Trung tâm Hỗ trợ &amp; CSKH (Support)</h1>
            <p className="mt-0.5 text-xs text-[#b8c6e0]">
              Gửi yêu cầu trợ giúp kỹ thuật, sự cố kho, đổi mã khóa hoặc theo dõi tiến trình xử lý từ nhân viên quản lý.
            </p>
          </div>
        </div>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">info</span>
              <span>Vui lòng đăng nhập để gửi ticket yêu cầu hỗ trợ và theo dõi các phản hồi từ cơ sở.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: { pathname: "/support" } } })}
              className="rounded-lg bg-[#1d5fe5] px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-[#174fc7] transition"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Support Request Form & Tickets Section */}
        <section id="request-form" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submit form */}
          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#f0f4fc] pb-3">
              <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">add_task</span>
              <h2 className="text-base font-bold text-[#0b1c30]">Tạo yêu cầu hỗ trợ mới (New Request)</h2>
            </div>

            {submitSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs font-medium text-[#166534]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Yêu cầu của bạn đã được gửi thành công. Quản lý cơ sở sẽ điều phối nhân viên kiểm tra ngay!
              </div>
            )}

            {submitError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#fecdca] bg-[#fff1f1] p-3 text-xs font-medium text-[#b3261e]">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {submitError}
              </div>
            )}

            <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
              <fieldset disabled={submitting} className="space-y-3">
                <div>
                  <SupportDropdown
                    label="Kho liên quan (Unit)"
                    icon="warehouse"
                    disabled={rentalsLoading || activeRentals.length === 0}
                    value={selectedUnitCode}
                    onChange={setSelectedUnitCode}
                    placeholder={rentalsLoading ? "Đang tải danh sách kho..." : "Không có kho nào đang thuê"}
                    options={activeRentals.map((unit) => ({
                      value: String(unit.agreementId),
                      label: `Kho ${unit.unitCode} · ${unit.facilityName}`,
                    }))}
                  />
                </div>

                <div>
                  <SupportDropdown
                    label="Phân loại vấn đề (Category)"
                    icon="category"
                    value={category}
                    onChange={setCategory}
                    options={SUPPORT_CATEGORIES.map((item) => ({ value: item.value, label: item.label }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Mức độ ưu tiên (Priority)</label>
                  <div className="flex gap-2 text-xs">
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-2.5 transition hover:bg-white">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === "normal"}
                        onChange={() => setPriority("normal")}
                        className="h-3.5 w-3.5 accent-[#1d5fe5]"
                      />
                      <span className="font-semibold text-[#0b1c30]">Bình thường (Normal)</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-2.5 transition hover:bg-white">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === "urgent"}
                        onChange={() => setPriority("urgent")}
                        className="h-3.5 w-3.5 accent-[#c0362c]"
                      />
                      <span className="font-semibold text-[#c0362c]">Khẩn cấp (Urgent)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Chi tiết sự cố (Details)</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết sự cố bạn đang gặp phải (ví dụ: ổ khóa không nhận mã PIN, rỉ nước, máy lạnh hỏng...)..."
                    className="w-full rounded-xl border border-[#dfe7f5] bg-[#f8faff] px-3 py-2 text-xs outline-none transition focus:border-[#1d5fe5] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Hình ảnh / Video đính kèm (Attachments)</label>
                  <MediaUpload label="Tải lên ảnh sự cố" accept="image/*" multiple dropzone disabled={submitting} onUploaded={addAttachment} />
                  {attachments.length > 0 && (
                    <ul className="mt-2 w-full space-y-1.5 text-left text-xs">
                      {attachments.map((file) => (
                        <li key={file.url} className="flex items-center justify-between gap-2 rounded-xl bg-[#f8faff] border border-[#eef1f8] p-2">
                          <a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[#1d5fe5] underline font-medium text-xs">
                            {file.originalName || file.fileName}
                          </a>
                          <button type="button" onClick={() => removeAttachment(file.url)} className="text-red-600 font-semibold text-[11px] hover:underline">
                            Xóa
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs text-[#3a475a] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={allowMasterKey}
                    onChange={() => setAllowMasterKey((v) => !v)}
                    className="h-4 w-4 rounded accent-[#1d5fe5]"
                  />
                  <span>Cho phép nhân viên sử dụng khóa Master để kiểm tra nếu khách vắng mặt</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || rentalsLoading || ticketsLoading || activeRentals.length === 0}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1d5fe5] text-xs font-bold text-white transition hover:bg-[#154ec1] disabled:opacity-50 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hỗ trợ"}
                </button>
              </fieldset>
            </form>
          </div>

          {/* Tickets progress tracking */}
          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f4fc] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">list_alt</span>
                <h2 className="text-base font-bold text-[#0b1c30]">Danh sách Ticket đã tạo</h2>
              </div>

              <div className="inline-flex rounded-xl bg-[#f0f4fc] p-1 border border-[#e2eaf8]">
                {ticketTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTicketTab(tab.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      activeTicketTab === tab.id ? "bg-[#0b1c30] text-white shadow-xs" : "text-[#58657a] hover:text-[#0b1c30]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {ticketsError && (
                <p role="alert" className="text-xs text-red-600 font-semibold">{ticketsError}</p>
              )}
              {ticketsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#58657a]">
                  <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
                  Đang tải danh sách ticket...
                </div>
              ) : ticketsError && filteredTickets.length === 0 ? null : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dfe7f5] bg-[#f8faff] py-12 px-6 text-center">
                  <span className="material-symbols-outlined text-[32px] text-[#8996a9]">support_agent</span>
                  <div className="mt-2 text-xs font-semibold text-slate-600">Không có ticket nào trong mục này</div>
                  <p className="mt-1 text-[11px] text-slate-400">Nếu bạn cần hỗ trợ, hãy điền vào mẫu bên cạnh để gửi yêu cầu.</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#eef1f8] bg-[#f8faff] p-3 text-xs transition hover:border-[#b9ccf0] hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1d5fe5] shrink-0">{ticket.ticketNo}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            ticket.status === "pending"
                              ? "bg-[#fffcf5] text-[#b54708] border border-[#fedf89]"
                              : ticket.status === "assigned"
                              ? "bg-[#0b1c30] text-white"
                              : "bg-[#ecfdf3] text-[#027a48] border border-[#abefc6]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              ticket.status === "pending"
                                ? "bg-[#f79009] animate-pulse"
                                : ticket.status === "assigned"
                                ? "bg-white"
                                : "bg-[#12b76a]"
                            }`}
                          />
                          {ticket.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-medium text-slate-800">{ticket.title}</p>
                      <div className="mt-0.5 text-[10px] text-[#8996a9]">{ticket.time}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailTicketId(ticket.id)}
                      className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border border-[#dfe7f5] bg-white px-3 text-xs font-semibold text-[#1d5fe5] shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0]"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      Chi tiết
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {detailTicketId != null && (
        <SupportTicketDetail
          key={detailTicketId}
          ticketId={detailTicketId}
          onClose={() => setDetailTicketId(null)}
          onTicketUpdated={updateTicket}
        />
      )}
      <Footer />
    </div>
  );
}

export default Support;
