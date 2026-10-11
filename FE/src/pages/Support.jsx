import { useState, useMemo } from "react";
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
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

const UNIT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
];
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

  const [selectedGalleryUnitId, setSelectedGalleryUnitId] = useState(null);

  const unitSlides = useMemo(() => {
    return filteredUnits.map((u, idx) => ({
      id: String(u.id),
      title: `Unit ${u.unitCode}`,
      src: UNIT_CARD_IMAGES[idx % UNIT_CARD_IMAGES.length],
      alt: `Kho ${u.unitCode} tại ${u.facilityName || "G1 SelfStorage"}`,
      badge: u.unitTypeCode || "KHO",
      meta: [
        { label: "Cơ sở", value: u.facilityName || "G1 SelfStorage" },
        { label: "Hợp đồng", value: u.contractLeft },
      ],
      unitData: u,
    }));
  }, [filteredUnits]);

  const activeGalleryUnit = useMemo(() => {
    if (!filteredUnits || filteredUnits.length === 0) return null;
    return filteredUnits.find((u) => String(u.id) === String(selectedGalleryUnitId)) || filteredUnits[0];
  }, [filteredUnits, selectedGalleryUnitId]);

  const handleSelectGalleryUnit = (slide) => {
    setSelectedGalleryUnitId(slide.id);
    setSelectedUnitCode(slide.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    void addTicket();
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="support" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl bg-[#0b1c30] px-5 py-4 text-white shadow-xs">
          <div>
            <div className="text-[10px] font-semibold text-[#8f9cbd]">{facilityName || "Storage"}</div>
            <h1 className="text-xl font-bold">Support</h1>
          </div>
        </div>

        {/* Units section */}
        <section id="units-section" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#0b1c30]">Units</h2>

            <div className="inline-flex rounded-lg bg-[#eef4ff] p-0.5">
              {unitTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveUnitTab(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    activeUnitTab === tab.id ? "bg-[#0b1c30] text-white shadow-xs" : "text-[#58657a] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Units content */}
          {rentalsLoading ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#dfe7f5] bg-white p-6 text-xs text-[#58657a]">
              <span className="material-symbols-outlined animate-spin text-[16px] text-[#1d5fe5]">progress_activity</span>
              Loading...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dfe7f5] bg-white p-6 text-center text-xs">
              <span className="material-symbols-outlined text-[24px] text-slate-400">warehouse</span>
              <span className="mt-1 text-slate-500">No units found</span>
              <button
                onClick={() => navigate("/home")}
                className="mt-2.5 inline-flex h-7 items-center gap-1 rounded-md bg-[#1d5fe5] px-3 text-xs font-semibold text-white transition hover:bg-[#174fc7]"
              >
                Rent
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-[28px] border border-[#dfe7f5] bg-white px-2 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-5 sm:py-7">
              <div className="mx-auto max-w-5xl">
                <CoverflowCarousel
                  slides={unitSlides}
                  cardWidth="clamp(210px, 25vw, 320px)"
                  rotate={34}
                  depth={0.48}
                  gap={0.16}
                  fade={0.12}
                  showNavigation={unitSlides.length > 1}
                  showCaption
                  showPagination={unitSlides.length > 3}
                  label="Danh sách kho đang thuê"
                  onActiveSlideChange={handleSelectGalleryUnit}
                />
              </div>

              {activeGalleryUnit && (
                <div className="mt-2.5 rounded-xl border border-[#dbe6f7] bg-[#f8faff] p-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1d5fe5] text-white">
                        <span className="material-symbols-outlined text-[18px]">warehouse</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0b1c30]">Unit {activeGalleryUnit.unitCode}</span>
                          <span className="rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-bold text-[#027a48]">
                            {activeGalleryUnit.statusLabel}
                          </span>
                        </div>
                        <div className="text-xs text-[#58657a]">{activeGalleryUnit.contractLeft}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate("/access-control")}
                        className="inline-flex h-8 items-center gap-1 rounded-md bg-[#0b1c30] px-3 text-xs font-semibold text-white transition hover:bg-[#132741]"
                      >
                        <span className="material-symbols-outlined text-[15px]">key</span>
                        Access
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnitCode(String(activeGalleryUnit.id));
                          const el = document.getElementById("request-form");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 text-xs font-semibold text-[#1d5fe5] transition hover:bg-[#f0f5ff]"
                      >
                        <span className="material-symbols-outlined text-[15px]">report_problem</span>
                        Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenewalUnit(activeGalleryUnit)}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-[#f8faff]"
                      >
                        <span className="material-symbols-outlined text-[15px]">autorenew</span>
                        Renew
                      </button>
                    </div>
                  </div>

                  <details className="mt-2.5 border-t border-[#eef2f9] pt-2 text-xs">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-700 transition">
                      More options
                    </summary>
                    <div className="mt-1.5 space-y-1 rounded-lg bg-white p-2">
                      <MoveOutRequest agreementId={activeGalleryUnit.id} />
                      <UnitTransferRequest agreementId={activeGalleryUnit.id} />
                      <RefundPreview agreementId={activeGalleryUnit.id} />
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Support Request Form & Tickets Section */}
        <section id="request-form" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submit form */}
          <div className="rounded-xl border border-[#dfe7f5] bg-white p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#0b1c30]">New Request</h2>

            {submitSuccess && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-2 text-xs font-medium text-[#166534]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Request submitted successfully.
              </div>
            )}

            {submitError && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fff1f1] p-2 text-xs font-medium text-[#b3261e]">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {submitError}
              </div>
            )}

            <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
              <fieldset disabled={submitting} className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Unit</label>
                  <select
                    required
                    disabled={rentalsLoading || activeRentals.length === 0}
                    value={selectedUnitCode}
                    onChange={(e) => setSelectedUnitCode(e.target.value)}
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-xs outline-none transition focus:border-[#1d5fe5] focus:bg-white"
                  >
                    {activeRentals.length > 0 ? (
                      activeRentals.map((u) => (
                        <option key={u.agreementId} value={String(u.agreementId)}>
                          Unit {u.unitCode} ({u.facilityName})
                        </option>
                      ))
                    ) : (
                      <option value="">No active rentals</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-xs outline-none transition focus:border-[#1d5fe5] focus:bg-white"
                  >
                    {SUPPORT_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Priority</label>
                  <div className="flex gap-2 text-xs">
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 transition hover:bg-white">
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === "normal"}
                        onChange={() => setPriority("normal")}
                        className="h-3.5 w-3.5 accent-[#1d5fe5]"
                      />
                      <span className="font-semibold text-[#0b1c30]">Normal</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 transition hover:bg-white">
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
                    className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-xs outline-none transition focus:border-[#1d5fe5] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">Attachments</label>
                  <MediaUpload label="Upload" accept="image/*" multiple dropzone disabled={submitting} onUploaded={addAttachment} />
                  {attachments.length > 0 && (
                    <ul className="mt-1.5 w-full space-y-1 text-left text-xs">
                      {attachments.map((file) => (
                        <li key={file.url} className="flex items-center justify-between gap-2 rounded-lg bg-[#f8faff] border border-[#eef1f8] p-1.5">
                          <a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[#1d5fe5] underline font-medium text-xs">
                            {file.originalName || file.fileName}
                          </a>
                          <button type="button" onClick={() => removeAttachment(file.url)} className="text-red-600 font-semibold text-[11px] hover:underline">
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="flex items-center gap-1.5 text-xs text-[#3a475a] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMasterKey}
                    onChange={() => setAllowMasterKey((v) => !v)}
                    className="h-3.5 w-3.5 accent-[#1d5fe5]"
                  />
                  <span>Allow master key if away</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || rentalsLoading || ticketsLoading || activeRentals.length === 0}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#1d5fe5] text-xs font-bold text-white transition hover:bg-[#154ec1] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </fieldset>
            </form>
          </div>

          {/* Tickets progress tracking */}
          <div className="rounded-xl border border-[#dfe7f5] bg-white p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#0b1c30]">Tickets</h2>

            <div className="mt-2.5 inline-flex flex-wrap rounded-lg bg-[#eef4ff] p-0.5">
              {ticketTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTicketTab(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeTicketTab === tab.id ? "bg-[#0b1c30] text-white shadow-xs" : "text-[#58657a] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {ticketsError && (
                <p role="alert" className="text-xs text-red-600 font-semibold">{ticketsError}</p>
              )}
              {ticketsLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-[#58657a]">
                  <span className="material-symbols-outlined animate-spin text-[15px] text-[#1d5fe5]">progress_activity</span>
                  Loading...
                </div>
              ) : ticketsError && filteredTickets.length === 0 ? null : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dfe7f5] bg-[#f8faff] p-6 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#8996a9]">support_agent</span>
                  <div className="mt-1 text-xs text-slate-500">No tickets</div>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#eef1f8] bg-[#f8faff] p-2.5 text-xs transition hover:border-[#b9ccf0] hover:bg-white"
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
                      <p className="mt-0.5 truncate font-medium text-slate-800">{ticket.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailTicketId(ticket.id)}
                      className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-2.5 text-xs font-semibold text-[#1d5fe5] shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0]"
                    >
                      View
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
      {renewalUnit && (
        <RentalRenewal
          key={renewalUnit.id}
          unit={renewalUnit}
          onClose={() => setRenewalUnit(null)}
        />
      )}
    </div>
  );
}

export default Support;
