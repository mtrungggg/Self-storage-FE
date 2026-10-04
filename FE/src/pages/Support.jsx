import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupportTicketDetail from "../components/SupportTicketDetail";
import { useSupport } from "../hooks/useSupport";
import MoveOutRequest from "../components/MoveOutRequest";
import RefundPreview from "../components/RefundPreview";
import { SUPPORT_CATEGORIES } from "../data/supportCategories";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function Support() {
  const navigate = useNavigate();
  const [detailTicketId, setDetailTicketId] = useState(null);
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
        <div className="rounded-[16px] bg-[#0b1c30] p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">{facilityName}</div>
              <h1 className="mt-1 text-[22px] sm:text-[24px] font-bold tracking-[-0.02em]">Support</h1>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#request-form"
                className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[16px]">build</span>
                Request
              </a>
            </div>
          </div>
        </div>

        {/* Units section header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0b1c30]">Units</div>
          </div>
          <div className="inline-flex rounded-[10px] bg-[#eef4ff] p-1">
            {unitTabs.map((tab) => (
              <button
                key={tab.id}
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

        {/* Units list */}
        {rentalsLoading ? (
          <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white p-6 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
            Loading your active units...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-[14px] border border-[#dfe7f5] bg-white p-8 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#8996a9]">warehouse</span>
            <div className="mt-2 text-[14px] font-bold text-[#0b1c30]">No Active Storage Units</div>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#174fc7]"
            >
              Browse Available Units
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">warehouse</span>
                    <span className="text-[14px] font-bold text-[#0b1c30]">Unit {unit.unitCode}</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    {unit.statusLabel}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#58657a]">
                  {unit.contractDate} · {unit.contractLeft}
                </div>

                <button
                  onClick={() => navigate("/access-control")}
                  className="mt-3 w-full rounded-[10px] bg-[#0b1c30] py-2.5 text-[12px] font-bold text-white transition hover:bg-[#132741]"
                >
                  Access
                </button>

                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#1d5fe5]">
                  <button
                    onClick={() => {
                      setSelectedUnitCode(unit.id);
                      const el = document.getElementById("request-form");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:underline"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => navigate("/billing")}
                    className="hover:underline"
                  >
                    Renew
                  </button>
                </div>
                <MoveOutRequest agreementId={unit.id} />
                <RefundPreview agreementId={unit.id} />
              </div>
            ))}
          </div>
        )}

        {/* Support Request Form & Tickets Section */}
        <div id="request-form" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Submit form */}
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-[#0b1c30]">New Request</div>
            </div>

            {submitSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[12px] font-semibold text-[#166534]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Request submitted.
              </div>
            )}

            {submitError && <p role="alert" className="mt-3 text-sm text-red-600">{submitError}</p>}
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <fieldset disabled={submitting} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Unit *</label>
                <select
                  required
                  disabled={rentalsLoading || activeRentals.length === 0}
                  value={selectedUnitCode}
                  onChange={(e) => setSelectedUnitCode(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                >
                  {activeRentals.length > 0 ? (
                    activeRentals.map((u) => (
                      <option key={u.agreementId} value={String(u.agreementId)}>
                        Unit {u.unitCode} / {u.facilityName}
                      </option>
                    ))
                  ) : (
                    <option value="">No active rentals available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Issue *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                >
                  {SUPPORT_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Priority</label>
                <div className="flex gap-3 text-[11px]">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "normal"}
                      onChange={() => setPriority("normal")}
                      className="h-3.5 w-3.5 accent-[#1d5fe5]"
                    />
                    <span className="font-semibold text-[#0b1c30]">Normal</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
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
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Details</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Attachments</label>
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#c7d1e6] bg-[#f8faff] p-4 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">cloud_upload</span>
                  <div className="mt-1 text-[11px] font-semibold text-[#3a475a]">Attachments are not available yet</div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-[#3a475a]">
                <input
                  type="checkbox"
                  checked={allowMasterKey}
                  onChange={() => setAllowMasterKey((v) => !v)}
                  className="mt-0.5 h-4 w-4 accent-[#1d5fe5]"
                />
                Allow master key access if I’m away.
              </label>

              <button
                type="submit"
                disabled={submitting || rentalsLoading || ticketsLoading || activeRentals.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[13px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {submitting ? "Submitting..." : "Submit"}
              </button>
              </fieldset>
            </form>
          </div>

          {/* Tickets progress tracking */}
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[15px] font-bold text-[#0b1c30]">Tickets</div>
              </div>
            </div>

            <div className="mt-3 inline-flex flex-wrap rounded-[10px] bg-[#eef4ff] p-1">
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

            <div className="mt-3 space-y-3">
              {ticketsError && <p role="alert" className="text-sm text-red-600">{ticketsError}</p>}
              {ticketsLoading ? <p role="status" className="text-sm text-[#58657a]">Loading tickets...</p> : ticketsError && filteredTickets.length === 0 ? null : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-8 text-center">
                  <span className="material-symbols-outlined text-[32px] text-[#8996a9]">support_agent</span>
                  <div className="mt-2 text-[13px] font-bold text-[#0b1c30]">No Tickets Found</div>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#1d5fe5]">{ticket.ticketNo}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                    <div className="mt-1 text-[13px] font-semibold text-[#0b1c30]">{ticket.title}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-[#8996a9]">
                      <span>{ticket.unit}</span>
                      <span>{ticket.time}</span>
                    </div>

                    {ticket.quote && (
                      <p className="mt-2 rounded-[8px] bg-white p-2 text-[11px] italic leading-5 text-[#58657a]">
                        "{ticket.quote}"
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
                      <span>{ticket.footer}</span>
                      <button type="button" onClick={() => setDetailTicketId(ticket.id)} className="text-xs font-semibold text-[#1d5fe5] hover:underline">View details</button>
                      {ticket.eta && <span className="font-semibold text-[#0e7b4c]">{ticket.eta}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {detailTicketId != null && <SupportTicketDetail key={detailTicketId} ticketId={detailTicketId} onClose={() => setDetailTicketId(null)} onTicketUpdated={updateTicket} />}
      <Footer />
    </div>
  );
}

export default Support;
