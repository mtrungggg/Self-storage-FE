import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupportTicketDetail from "../components/SupportTicketDetail";
import { useSupport } from "../hooks/useSupport";
import MoveOutRequest from "../components/MoveOutRequest";
import UnitTransferRequest from "../components/UnitTransferRequest";
import RefundPreview from "../components/RefundPreview";
import RentalRenewal from "../components/RentalRenewal";
import { SUPPORT_CATEGORIES } from "../data/supportCategories";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import MediaUpload from "../components/MediaUpload";

function Support() {
  const navigate = useNavigate();
  const [detailTicketId, setDetailTicketId] = useState(null);
  const [renewalUnit, setRenewalUnit] = useState(null);
  const {
    unitTabs,
    ticketTabs,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    priority,
    setPriority,
    allowMasterKey,
    setAllowMasterKey,
    filteredUnits,
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
        {/* Hero banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0b1c30] px-5 py-3.5 text-white shadow-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8f9cbd]">{facilityName}</div>
            <h1 className="text-lg font-bold">Support</h1>
          </div>
          <a
            href="#request-form"
            className="flex items-center gap-1 rounded-lg bg-[#1d5fe5] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#174fc7]"
          >
            <span className="material-symbols-outlined text-[15px]">build</span>
            Request
          </a>
        </div>

        {/* Units section header */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-[#0b1c30]">Units</div>
          <div className="inline-flex rounded-lg bg-[#eef4ff] p-0.5">
            {unitTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveUnitTab(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  activeUnitTab === tab.id ? "bg-[#0b1c30] text-white shadow-xs" : "text-[#58657a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units list */}
        {rentalsLoading ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#dfe7f5] bg-white p-4 text-xs text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[16px] text-[#1d5fe5]">progress_activity</span>
            Loading units...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-[#dfe7f5] bg-white p-6 text-center">
            <span className="material-symbols-outlined text-[28px] text-[#8996a9]">warehouse</span>
            <div className="mt-1 text-xs font-bold text-[#0b1c30]">No Active Units</div>
            <button
              onClick={() => navigate("/home")}
              className="mt-3 rounded-lg bg-[#1d5fe5] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#174fc7]"
            >
              Rent Unit
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex flex-col justify-between rounded-xl border border-[#dfe7f5] bg-white p-3.5 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0b1c30]">Unit {unit.unitCode}</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#0e7b4c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                      {unit.statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#58657a]">
                    {unit.contractDate} · {unit.contractLeft}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate("/access-control")}
                      className="flex-1 rounded-lg bg-[#0b1c30] py-1.5 text-xs font-bold text-white transition hover:bg-[#132741]"
                    >
                      Access
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUnitCode(unit.id);
                        const el = document.getElementById("request-form");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 rounded-lg border border-[#dfe7f5] bg-white py-1.5 text-xs font-semibold text-[#1d5fe5] hover:bg-blue-50 transition"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => setRenewalUnit(unit)}
                      className="rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Renew
                    </button>
                  </div>

                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer font-medium text-slate-400 hover:text-slate-600">
                      Options
                    </summary>
                    <div className="mt-1 space-y-1 border-t border-slate-100 pt-1">
                      <MoveOutRequest agreementId={unit.id} />
                      <UnitTransferRequest agreementId={unit.id} />
                      <RefundPreview agreementId={unit.id} />
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Request Form & Tickets Section */}
        <div id="request-form" className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Submit form */}
          <div className="rounded-xl border border-[#dfe7f5] bg-white p-4 shadow-xs">
            <h2 className="text-sm font-bold text-[#0b1c30]">New Request</h2>

            {submitSuccess && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-2 text-xs font-semibold text-[#166534]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Submitted.
              </div>
            )}

            {submitError && <p role="alert" className="mt-2.5 text-xs text-red-600">{submitError}</p>}
            <form className="mt-3 space-y-2.5" onSubmit={handleSubmit}>
              <fieldset disabled={submitting} className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Unit</label>
                  <select
                    required
                    disabled={rentalsLoading || activeRentals.length === 0}
                    value={selectedUnitCode}
                    onChange={(e) => setSelectedUnitCode(e.target.value)}
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-xs outline-none transition focus:border-[#3b82f6]"
                  >
                    {activeRentals.length > 0 ? (
                      activeRentals.map((u) => (
                        <option key={u.agreementId} value={String(u.agreementId)}>
                          Unit {u.unitCode} ({u.facilityName})
                        </option>
                      ))
                    ) : (
                      <option value="">No rentals available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-xs outline-none transition focus:border-[#3b82f6]"
                  >
                    {SUPPORT_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Priority</label>
                  <div className="flex gap-2 text-xs">
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === "normal"}
                        onChange={() => setPriority("normal")}
                        className="h-3.5 w-3.5 accent-[#1d5fe5]"
                      />
                      <span className="font-semibold text-[#0b1c30]">Normal</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === "urgent"}
                        onChange={() => setPriority("urgent")}
                        className="h-3.5 w-3.5 accent-[#c0362c]"
                      />
                      <span className="font-semibold text-[#c0362c]">Urgent</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Details</label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe issue..."
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-xs outline-none transition focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Attachments</label>
                  <div>
                    <MediaUpload label="Upload images" accept="image/*" multiple dropzone disabled={submitting} onUploaded={addAttachment} />
                    {attachments.length > 0 && <ul className="mt-2 w-full space-y-1 text-left text-xs">{attachments.map((file) => <li key={file.url} className="flex items-center justify-between gap-2 rounded-lg bg-white p-1.5"><a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[#1d5fe5] underline">{file.originalName || file.fileName}</a><button type="button" onClick={() => removeAttachment(file.url)} className="text-red-600">Remove</button></li>)}</ul>}
                  </div>
                </div>

                <label className="flex items-start gap-1.5 text-xs text-[#3a475a]">
                  <input
                    type="checkbox"
                    checked={allowMasterKey}
                    onChange={() => setAllowMasterKey((v) => !v)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]"
                  />
                  Allow master key if away
                </label>

                <button
                  type="submit"
                  disabled={submitting || rentalsLoading || ticketsLoading || activeRentals.length === 0}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1d5fe5] py-2.5 text-xs font-bold text-white transition hover:bg-[#174fc7] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  {submitting ? "..." : "Submit"}
                </button>
              </fieldset>
            </form>
          </div>

          {/* Tickets progress tracking */}
          <div className="rounded-xl border border-[#dfe7f5] bg-white p-4 shadow-xs">
            <h2 className="text-sm font-bold text-[#0b1c30]">Tickets</h2>

            <div className="mt-2.5 inline-flex flex-wrap rounded-lg bg-[#eef4ff] p-0.5">
              {ticketTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTicketTab(tab.id)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    activeTicketTab === tab.id ? "bg-[#0b1c30] text-white shadow-xs" : "text-[#58657a]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {ticketsError && <p role="alert" className="text-xs text-red-600">{ticketsError}</p>}
              {ticketsLoading ? <p role="status" className="text-xs text-[#58657a]">Loading...</p> : ticketsError && filteredTickets.length === 0 ? null : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#eef1f8] bg-[#f8faff] p-6 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#8996a9]">support_agent</span>
                  <div className="mt-1 text-xs text-slate-500">No tickets found.</div>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#eef1f8] bg-[#f8faff] p-2.5 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#1d5fe5] shrink-0">{ticket.ticketNo}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0 ${
                            ticket.status === "pending"
                              ? "bg-[#eef4ff] text-[#1d5fe5]"
                              : ticket.status === "assigned"
                              ? "bg-[#0b1c30] text-white"
                              : "bg-[#e7f8ee] text-[#0e7b4c]"
                          }`}
                        >
                          {ticket.statusLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-medium text-slate-800">{ticket.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailTicketId(ticket.id)}
                      className="shrink-0 text-xs font-semibold text-[#1d5fe5] hover:underline"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {detailTicketId != null && <SupportTicketDetail key={detailTicketId} ticketId={detailTicketId} onClose={() => setDetailTicketId(null)} onTicketUpdated={updateTicket} />}
      <Footer />
      {renewalUnit && <RentalRenewal key={renewalUnit.id} unit={renewalUnit} onClose={() => setRenewalUnit(null)} />}
    </div>
  );
}

export default Support;
