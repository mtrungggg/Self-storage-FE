import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffSupportService from "../api/staffSupportService";
import StaffTicketReply from "../components/StaffTicketReply";
import StaffTicketCharge from "../components/StaffTicketCharge";

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
  const [statuses, setStatuses] = useState([]);
  const requestId = useRef(0);
  const assignLock = useRef(false);
  const [assigningId, setAssigningId] = useState(null);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  async function assignTicket(ticket) {
    if (assignLock.current) return;
    assignLock.current = true;
    setAssigningId(ticket.id);
    setAssignError("");
    setAssignSuccess("");
    try {
      await staffSupportService.assignTicket(ticket.id);
      setAssignSuccess(`Ticket ${ticket.ticketNo || ticket.id} assigned successfully.`);
      // Refresh the currently applied filters, even if they changed during assignment.
      requestId.current++;
      setLoading(true);
      setError("");
      setQuery((current) => ({ ...current }));
    } catch (err) {
      setAssignError(err.message || "Unable to assign this ticket. Please try again.");
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
          {assignError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{assignError}</p>}
          {loading ? <p role="status">Loading tickets...</p> : error ? <div role="alert" className="rounded-xl bg-white p-4 text-red-600"><p>{error}</p><button type="button" onClick={() => load(query)} className="mt-2 underline">Try again</button></div> : tickets.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center text-[#58657a]">No tickets match these filters.</p> : <>
            <p className="mb-3 text-sm text-[#58657a]">{tickets.length} tickets</p>
            <div className="grid gap-4 lg:grid-cols-2">
              {tickets.map((ticket) => <article key={ticket.id} className="min-w-0 rounded-xl border border-[#dfe7f5] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold text-[#1d5fe5]">{ticket.ticketNo || ticket.id}</span><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{ticket.status || "—"}</span></div>
                <h2 className="mt-3 break-words font-bold">{ticket.subject || "Untitled ticket"}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {[["Customer", ticket.customerName || ticket.customerId], ["Facility", ticket.facilityCode || ticket.facilityId], ["Agreement", ticket.agreementNo || ticket.agreementId], ["Unit", ticket.unitCode || ticket.storageUnitId], ["Category", ticket.category], ["Priority", ticket.priority], ["Created", formatDate(ticket.createdAt)], ["Updated", formatDate(ticket.updatedAt)]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>)}
                </dl>
                <p className="mt-4 whitespace-pre-wrap break-words border-t pt-3 text-sm text-[#58657a]">{ticket.description || "No description provided."}</p>
                <button type="button" onClick={() => assignTicket(ticket)} disabled={assigningId != null} aria-label={`Assign ticket ${ticket.ticketNo || ticket.id}`} className="mt-4 rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50">
                  {assigningId === ticket.id ? "Assigning..." : "Assign ticket"}
                </button>
                <StaffTicketReply ticketId={ticket.id} />
                <StaffTicketCharge ticketId={ticket.id} />
              </article>)}
            </div>
          </>}
        </section>
      </main>
    </div>
  );
}
