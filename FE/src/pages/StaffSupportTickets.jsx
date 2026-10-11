import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffSupportService from "../api/staffSupportService";
import StaffTicketReply from "../components/StaffTicketReply";
import StaffTicketCharge from "../components/StaffTicketCharge";
import StaffTicketResolve from "../components/StaffTicketResolve";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("en-US") : "—";
}

export default function StaffSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [facilityId, setFacilityId] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState(["open", "in_progress", "resolved", "closed"]);
  const requestId = useRef(0);
  const assignLock = useRef(false);
  const assignDialog = useRef(null);
  const [assigningId, setAssigningId] = useState(null);
  const [receivedTicketIds, setReceivedTicketIds] = useState(() => new Set());
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [resolveSuccess, setResolveSuccess] = useState("");

  function handleResolved(ticket) {
    setResolveSuccess(`Ticket ${ticket.ticketNo || ticket.id} resolved successfully.`);
    requestId.current++;
    setLoading(true);
    setError("");
    setQuery((current) => ({ ...current }));
  }

  async function assignTicket(ticket) {
    const ticketId = String(ticket.id);
    if (assignLock.current || receivedTicketIds.has(ticketId)) return;
    assignLock.current = true;
    setAssigningId(ticket.id);
    setAssignError("");
    setAssignSuccess("");
    try {
      await staffSupportService.assignTicket(ticket.id);
      setReceivedTicketIds((current) => {
        const next = new Set(current);
        next.add(ticketId);
        return next;
      });
      setAssignSuccess(`Ticket ${ticket.ticketNo || ticket.id} assigned successfully.`);
      // Refresh the currently applied filters, even if they changed during assignment.
      requestId.current++;
      setLoading(true);
      setError("");
      setQuery((current) => ({ ...current }));
    } catch (err) {
      const message = err.message || "";
      const alreadyAssigned = message.includes("ticket_assignments_one_active_uidx");
      setAssignError(alreadyAssigned
        ? "Ticket này đã được phân công cho nhân viên xử lý. Bạn không cần Assign lại. Hãy tải lại danh sách để xem trạng thái mới nhất."
        : err.status >= 500
          ? "Không thể nhận xử lý ticket lúc này. Vui lòng thử lại sau."
          : message || "Không thể nhận xử lý ticket. Vui lòng thử lại.");
      assignDialog.current?.showModal();
    } finally {
      assignLock.current = false;
      setAssigningId(null);
    }
  }

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;
    staffSupportService.getTickets(query)
      .then((data) => {
        if (!active || id !== requestId.current) return;
        setTickets(data);
        setStatuses((current) => [...new Set([...current, ...data.map((ticket) => ticket.status).filter(Boolean)])]);
      })
      .catch((err) => {
        if (active && id === requestId.current) setError(err.status === 403 ? "You do not have permission to view staff support tickets." : err.message || "Unable to load support tickets.");
      })
      .finally(() => { if (active && id === requestId.current) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  function load(filters) {
    requestId.current++;
    setLoading(true);
    setError("");
    setQuery({ ...filters });
  }

  return (
    <div className="relative min-h-screen text-[#0b1c30]">
      <PageBackground />
      <main className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
        <Link to="/staff-dashboard" className="text-sm font-semibold text-[#1d5fe5] hover:underline">Back to staff dashboard</Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <button type="button" onClick={() => load(query)} disabled={loading} className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-50">Refresh</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); load({ facilityId, status }); }} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[#dfe7f5] bg-white p-4">
          <div><label htmlFor="staff-ticket-facility" className="mb-1 block text-sm font-semibold">Facility ID</label><input id="staff-ticket-facility" type="number" min="1" step="1" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} placeholder="All facilities" className="rounded-lg border border-[#dfe7f5] p-2 text-sm" /></div>
          <div><label htmlFor="staff-ticket-status" className="mb-1 block text-sm font-semibold">Status</label><input id="staff-ticket-status" list="staff-ticket-statuses" value={status} onChange={(event) => setStatus(event.target.value)} placeholder="All statuses" className="rounded-lg border border-[#dfe7f5] p-2 text-sm" /><datalist id="staff-ticket-statuses">{statuses.map((value) => <option key={value} value={value} />)}</datalist></div>
          <button type="submit" className="rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white">Apply filters</button>
          <button type="button" onClick={() => { setFacilityId(""); setStatus(""); load({}); }} className="rounded-lg border px-4 py-2 text-sm">Clear filters</button>
        </form>
        <section aria-label="Support ticket list" aria-busy={loading} className="mt-5">
          {assignSuccess && <p role="status" className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{assignSuccess}</p>}
          {resolveSuccess && <p role="status" className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{resolveSuccess}</p>}
          {loading ? <p role="status">Loading tickets...</p> : error ? <div role="alert" className="rounded-xl bg-white p-4 text-red-600"><p>{error}</p><button type="button" onClick={() => load(query)} className="mt-2 underline">Try again</button></div> : tickets.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center text-[#58657a]">No tickets match these filters.</p> : <>
            <p className="mb-3 text-sm text-[#58657a]">{tickets.length} tickets</p>
            <div className="grid items-start gap-4 lg:grid-cols-2">
              {tickets.map((ticket) => <article key={ticket.id} className="min-w-0 rounded-xl border border-[#dfe7f5] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold text-[#1d5fe5]">{ticket.ticketNo || ticket.id}</span><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{ticket.status || "—"}</span></div>
                <h2 className="mt-3 break-words font-bold">{ticket.subject || "Untitled ticket"}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {[["Customer", ticket.customerName || ticket.customerId], ["Facility", ticket.facilityCode || ticket.facilityId], ["Agreement", ticket.agreementNo || ticket.agreementId], ["Unit", ticket.unitCode || ticket.storageUnitId], ["Category", ticket.category], ["Priority", ticket.priority], ["Created", formatDate(ticket.createdAt)], ["Updated", formatDate(ticket.updatedAt)]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>)}
                </dl>
                <p className="mt-4 whitespace-pre-wrap break-words border-t pt-3 text-sm text-[#58657a]">{ticket.description || "No description provided."}</p>
                <button type="button" onClick={() => assignTicket(ticket)} disabled={assigningId != null || receivedTicketIds.has(String(ticket.id))} aria-label={`${receivedTicketIds.has(String(ticket.id)) ? "Received" : "Assign ticket"} ${ticket.ticketNo || ticket.id}`} className="mt-4 rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50">
                  {receivedTicketIds.has(String(ticket.id)) ? "Received" : assigningId === ticket.id ? "Assigning..." : "Assign ticket"}
                </button>
                <details className="group mt-4 overflow-hidden rounded-xl border border-[#dfe7f5] bg-[#f8faff]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eef4ff] [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">settings</span>
                      Manage ticket
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-[#58657a] transition-transform duration-200 group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="border-t border-[#dfe7f5] bg-white px-4 pb-4">
                    <StaffTicketReply ticketId={ticket.id} />
                    <StaffTicketCharge ticketId={ticket.id} />
                    <StaffTicketResolve ticketId={ticket.id} onResolved={() => handleResolved(ticket)} />
                  </div>
                </details>
              </article>)}
            </div>
          </>}
        </section>
      </main>
      <dialog ref={assignDialog} aria-labelledby="assign-error-title" aria-describedby="assign-error-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-[#0b1c30] shadow-xl backdrop:bg-black/40">
        <h2 id="assign-error-title" className="text-lg font-bold">Không thể phân công ticket</h2>
        <p id="assign-error-description" className="mt-3 text-sm leading-6 text-[#58657a]">{assignError}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => assignDialog.current.close()} className="rounded-lg border border-[#dfe7f5] px-4 py-2 text-sm font-semibold">Đóng</button>
          <button type="button" onClick={() => { assignDialog.current.close(); load(query); }} className="rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white">Tải lại danh sách</button>
        </div>
      </dialog>
    </div>
  );
}
