import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupport } from "../hooks/useSupport";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function Support() {
  const navigate = useNavigate();
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
    addTicket,
    tickets,
  } = useSupport();

  const rentalCount = activeRentals.length;
  const primaryUnitCode = activeRentals[0]?.unitCode || (rentalCount > 0 ? "A-101" : "None");
  const inProgressTicketsCount = tickets.filter((t) => t.status === "pending" || t.status === "assigned").length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUnitCode && activeRentals.length > 0) {
      return;
    }
    addTicket({
      unitCode: selectedUnitCode || (activeRentals[0]?.unitCode ?? "Unit A-101"),
      requestType: category,
      priorityLevel: priority,
      issueDesc: description.trim(),
    });
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
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                Facility {facilityName}
                <span className="ml-2 text-[#c7d1e6]">Updated: Today</span>
              </div>
              <h1 className="mt-1 text-[22px] sm:text-[24px] font-bold tracking-[-0.02em]">Technical Support Center</h1>
              <p className="mt-1 text-[13px] text-[#c7d1e6]">
                Maintenance requests and 24/7 dedicated facility technical support.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#request-form"
                className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[16px]">build</span>
                Request Repair
              </a>
              <a
                href="tel:18005558285"
                className="flex items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-white/15"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                1800-555-VAULT
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Managed Units
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {rentalCount} {rentalCount === 1 ? "Unit" : "Units"} Rented
              </div>
              <div className="text-[10px] text-[#8f9cbd]">{rentalCount} operational</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Primary Unit
                <span className="material-symbols-outlined text-[14px]">schedule</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {rentalCount > 0 ? `Unit ${primaryUnitCode}` : "No Unit Active"}
              </div>
              <div className="text-[10px] text-[#7fd8b1]">
                {rentalCount > 0 ? "✓ Secure Status" : "Standby"}
              </div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                In Progress
                <span className="material-symbols-outlined text-[14px]">support_agent</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">
                {inProgressTicketsCount} {inProgressTicketsCount === 1 ? "Ticket" : "Tickets"}
              </div>
              <div className="text-[10px] text-[#8f9cbd]">
                {tickets.filter((t) => t.status === "pending").length} pending • {tickets.filter((t) => t.status === "assigned").length} in progress
              </div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                On-Duty Response
                <span className="material-symbols-outlined text-[14px]">emergency</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">SLA ≤ 15 mins</div>
              <div className="text-[10px] text-[#8f9cbd]">24/7 On-site</div>
            </div>
          </div>
        </div>

        {/* Units section header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0b1c30]">Active Units &amp; Contract Status</div>
            <p className="text-[11px] text-[#8996a9]">View access codes, real-time climate monitoring, and renewals</p>
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
            <p className="mt-1 text-[12px] text-[#58657a]">You do not have any active units rented under this account.</p>
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
                    <span className="text-[14px] font-bold text-[#0b1c30]">Unit {unit.id}</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    {unit.statusLabel}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.location}</div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      Standard Size
                    </div>
                    <div className="font-semibold text-[#0b1c30]">{unit.size}</div>
                    <div className="truncate text-[9px] text-[#8996a9]">{unit.sizeNote}</div>
                  </div>
                  <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      Climate Control
                    </div>
                    <div className="font-semibold text-[#0b1c30]">{unit.climate}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">{unit.contractLabel}</div>
                    <div className="font-semibold text-[#0b1c30]">{unit.contractDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#0e7b4c]">{unit.contractLeft}</div>
                    <div className="text-[9px] text-[#8996a9]">{unit.payment}</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/access-control")}
                  className="mt-3 w-full rounded-[10px] bg-[#0b1c30] py-2.5 text-[12px] font-bold text-white transition hover:bg-[#132741]"
                >
                  {unit.primaryAction}
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
                    Report Issue
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="hover:underline"
                  >
                    Renew Lease
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Request Form & Tickets Section */}
        <div id="request-form" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Submit form */}
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-[#0b1c30]">Submit New Support Request</div>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5]">24/7 SLA</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8996a9]">On-site technicians respond within 15-30 minutes</p>

            {submitSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-[12px] font-semibold text-[#166534]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Support request submitted successfully! Our on-site technician will inspect shortly.
              </div>
            )}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Impacted Storage Unit *</label>
                <select
                  value={selectedUnitCode}
                  onChange={(e) => setSelectedUnitCode(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                >
                  {filteredUnits.length > 0 ? (
                    filteredUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit #{u.id} ({u.size})
                      </option>
                    ))
                  ) : (
                    <option value="General Facility">General Facility / Entrance Access</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Issue Category / Request Type *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                >
                  <option>PIN Code error / Digital Keypad not responding</option>
                  <option>Rolling door or unit shutter jammed / noisy</option>
                  <option>Climate &amp; Temperature regulation check</option>
                  <option>VAT Invoice &amp; Payment Receipts request</option>
                  <option>Other technical issue</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Priority Level</label>
                <div className="flex gap-3 text-[11px]">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "normal"}
                      onChange={() => setPriority("normal")}
                      className="h-3.5 w-3.5 accent-[#1d5fe5]"
                    />
                    <span>
                      <span className="block font-semibold text-[#0b1c30]">Normal</span>
                      <span className="block text-[10px] text-[#8996a9]">Response within 4 hours</span>
                    </span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === "urgent"}
                      onChange={() => setPriority("urgent")}
                      className="h-3.5 w-3.5 accent-[#c0362c]"
                    />
                    <span>
                      <span className="block font-semibold text-[#c0362c]">Urgent (Priority)</span>
                      <span className="block text-[10px] text-[#8996a9]">Response within 15 mins</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, symptoms observed, and when it occurred..."
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none transition focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Attach Photos / Video</label>
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#c7d1e6] bg-[#f8faff] p-4 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">cloud_upload</span>
                  <div className="mt-1 text-[11px] font-semibold text-[#3a475a]">Drag &amp; drop files or click to upload</div>
                  <div className="text-[10px] text-[#8996a9]">Supports JPG, PNG, or MP4 up to 15MB</div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-[#3a475a]">
                <input
                  type="checkbox"
                  checked={allowMasterKey}
                  onChange={() => setAllowMasterKey((v) => !v)}
                  className="mt-0.5 h-4 w-4 accent-[#1d5fe5]"
                />
                Authorize facility technician to use Master Key for inspection during absence (under CCTV surveillance).
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[13px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Submit Support Request
              </button>
            </form>
          </div>

          {/* Tickets progress tracking */}
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[15px] font-bold text-[#0b1c30]">Support Tickets &amp; Progress</div>
                <p className="text-[11px] text-[#8996a9]">Real-time tracking of submitted inquiries</p>
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
              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-8 text-center">
                  <span className="material-symbols-outlined text-[32px] text-[#8996a9]">support_agent</span>
                  <div className="mt-2 text-[13px] font-bold text-[#0b1c30]">No Tickets Found</div>
                  <p className="mt-1 text-[11px] text-[#8996a9]">
                    You haven't submitted any support requests in this category yet.
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#1d5fe5]">{ticket.id}</span>
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
                      {ticket.eta && <span className="font-semibold text-[#0e7b4c]">{ticket.eta}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SLA Banner */}
        <div className="mt-6 rounded-[14px] border border-[#dfe7f5] bg-[#eef4ff] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
              <div>
                <div className="text-[13px] font-bold text-[#0b1c30]">VaultSpace Service Level Agreement (SLA)</div>
                <div className="text-[11px] text-[#4d5d76]">
                  Digital locks, keycards, and facility access issues are addressed on-site within ≤ 15 minutes.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#request-form"
                className="flex items-center gap-1 rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
              >
                <span className="material-symbols-outlined text-[14px]">chat</span>
                Chat with Facility Manager
              </a>
              <a
                href="tel:18005558285"
                className="flex items-center gap-1 rounded-[10px] bg-[#0b1c30] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#132741]"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                Call 1800-555-VAULT
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Support;
