import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffSupportService from "../api/staffSupportService";
import StaffTicketReply from "../components/StaffTicketReply";
import StaffTicketCharge from "../components/StaffTicketCharge";
import StaffTicketResolve from "../components/StaffTicketResolve";
import ManagerFacilityContext from "../context/ManagerFacilityContext";
import { useAuth } from "../context/AuthContext";
import { TICKET_STATUS_LIST } from "../constants/ticketConstants";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("en-US") : "—";
}

const CATEGORY_PILLS = [
  { key: "", label: "All" },
  { key: "cleaning", label: "Cleaning" },
  { key: "maintenance", label: "Maintenance" },
  { key: "damage", label: "Damage / Issue" },
];

const STATUS_PILLS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
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
  const [onlyAssignedToMe, setOnlyAssignedToMe] = useState(false);
  const [query, setQuery] = useState(() => ({
    facilityId: activeFacilityId || undefined,
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState(TICKET_STATUS_LIST);
  const requestId = useRef(0);
  const assignLock = useRef(false);
  const assignDialog = useRef(null);
  const [assigningId, setAssigningId] = useState(null);
  const [receivedTicketIds, setReceivedTicketIds] = useState(() => new Set());
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [resolveSuccess, setResolveSuccess] = useState("");

  function handleResolved(ticket, result) {
    const unitMsg = result?.unlockedUnitCode
      ? ` Unit ${result.unlockedUnitCode} has been automatically released back to ${result.unlockedUnitStatus || "available"}.`
      : "";
    setResolveSuccess(`Ticket ${ticket.ticketNo || ticket.id} completed successfully.${unitMsg}`);
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
      setAssignError(
        alreadyAssigned
          ? "This ticket has already been assigned. Refresh the list to view its latest status."
          : err.status >= 500
          ? "Unable to claim this ticket right now. Please try again later."
          : message || "Unable to claim this ticket. Please try again."
      );
      assignDialog.current?.showModal();
    } finally {
      assignLock.current = false;
      setAssigningId(null);
    }
  }

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;
    staffSupportService
      .getTickets(query)
      .then((data) => {
        if (!active || id !== requestId.current) return;
        setTickets(data);
        setStatuses((current) => [
          ...new Set([...current, ...data.map((ticket) => ticket.status).filter(Boolean)]),
        ]);
      })
      .catch((err) => {
        if (active && id === requestId.current)
          setError(
            err.status === 403
              ? "You do not have permission to view staff support tickets."
              : err.message || "Unable to load support tickets."
          );
      })
      .finally(() => {
        if (active && id === requestId.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  function load(filters) {
    requestId.current++;
    setLoading(true);
    setError("");
    setQuery({ ...filters });
  }

  // React to facility changes from header context
  useEffect(() => {
    if (activeFacilityId) {
      load({
        facilityId: activeFacilityId,
        category: category || undefined,
        status: status || undefined,
        onlyAssignedToMe: onlyAssignedToMe || undefined,
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
      onlyAssignedToMe: onlyAssignedToMe || undefined,
    });
  }

  function handleStatusChange(statKey) {
    setStatus(statKey);
    load({
      facilityId: activeFacilityId || undefined,
      category: category || undefined,
      status: statKey || undefined,
      onlyAssignedToMe: onlyAssignedToMe || undefined,
    });
  }

  function handleToggleOnlyAssigned() {
    const nextVal = !onlyAssignedToMe;
    setOnlyAssignedToMe(nextVal);
    load({
      facilityId: activeFacilityId || undefined,
      category: category || undefined,
      status: status || undefined,
      onlyAssignedToMe: nextVal || undefined,
    });
  }

  function handleClearFilters() {
    setCategory("");
    setStatus("");
    setOnlyAssignedToMe(false);
    load({
      facilityId: activeFacilityId || undefined,
    });
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
            ← Back to staff dashboard
          </Link>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Support &amp; Maintenance Tickets</h1>
            <p className="mt-1 text-xs text-slate-500">
              Active Facility: <span className="font-semibold text-slate-700">{activeFacility?.name ? `${activeFacility.name} (${activeFacility.code || `ID: ${activeFacilityId}`})` : activeFacilityId ? `Facility #${activeFacilityId}` : "All Facilities"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(query)}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Minimalist & Lazy-Friendly Interactive Pill Filter Bar */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-20">Category:</span>
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
                        ? "bg-[#1d5fe5] text-white shadow-sm ring-2 ring-blue-200"
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-20">Status:</span>
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
                        ? "bg-[#1d5fe5] text-white shadow-sm ring-2 ring-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Assigned to Me & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleToggleOnlyAssigned}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                onlyAssignedToMe
                  ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${onlyAssignedToMe ? "bg-blue-600" : "bg-slate-300"}`} />
              Only Assigned To Me
            </button>

            {(category || status || onlyAssignedToMe) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <section aria-label="Support ticket list" aria-busy={loading} className="mt-5">
          {assignSuccess && (
            <p role="status" className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {assignSuccess}
            </p>
          )}
          {resolveSuccess && (
            <p role="status" className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {resolveSuccess}
            </p>
          )}
          {loading ? (
            <p role="status">Loading tickets from /api/staff/tickets...</p>
          ) : error ? (
            <div role="alert" className="rounded-xl bg-white p-4 text-red-600">
              <p>{error}</p>
              <button type="button" onClick={() => load(query)} className="mt-2 underline">
                Try again
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <p className="rounded-xl border bg-white p-8 text-center text-[#58657a]">
              No tickets match these filters.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-[#58657a]">{tickets.length} tickets</p>
              <div className="grid items-start gap-4 lg:grid-cols-2">
                {tickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="min-w-0 rounded-xl border border-[#dfe7f5] bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1d5fe5]">
                          {ticket.ticketNo || `#${ticket.id}`}
                        </span>
                        {ticket.hasProposedCharges && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                            Charges Proposed
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">
                        {ticket.status || "—"}
                      </span>
                    </div>

                    <h2 className="mt-3 break-words font-bold">
                      {ticket.subject || "Untitled ticket"}
                    </h2>

                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      {[
                        ["Customer", ticket.customerName || ticket.customerId],
                        [
                          "Facility",
                          ticket.facilityName || ticket.facilityCode || ticket.facilityId,
                        ],
                        ["Agreement", ticket.agreementNo || ticket.agreementId],
                        ["Unit", ticket.unitCode || ticket.storageUnitId],
                        ["Category", ticket.category],
                        ["Priority", ticket.priority],
                        [
                          "Assigned Staff",
                          ticket.assignedEmployeeName ||
                            (ticket.assignedEmployeeId
                              ? `#${ticket.assignedEmployeeId}`
                              : "Unassigned"),
                        ],
                        ["Created", formatDate(ticket.createdAt)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-[#58657a]">{label}</dt>
                          <dd className="break-words">{value ?? "—"}</dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-4 whitespace-pre-wrap break-words border-t pt-3 text-sm text-[#58657a]">
                      {ticket.description || "No description provided."}
                    </p>

                    {ticket.resolution && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs text-[#25232c]">
                        <strong>Resolution:</strong> {ticket.resolution}
                        {ticket.resolvedAt && (
                          <span className="block text-[11px] text-[#767679] mt-0.5">
                            Resolved at {formatDate(ticket.resolvedAt)}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => assignTicket(ticket)}
                      disabled={assigningId != null || receivedTicketIds.has(String(ticket.id))}
                      aria-label={`${
                        receivedTicketIds.has(String(ticket.id)) ? "Received" : "Assign ticket"
                      } ${ticket.ticketNo || ticket.id}`}
                      className="mt-4 rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {receivedTicketIds.has(String(ticket.id))
                        ? "Received"
                        : assigningId === ticket.id
                        ? "Assigning..."
                        : "Assign ticket"}
                    </button>

                    <details className="group mt-4 overflow-hidden rounded-xl border border-[#dfe7f5] bg-[#f8faff]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eef4ff] [&::-webkit-details-marker]:hidden">
                        <span>Manage ticket</span>
                        <span className="text-xs text-[#58657a] transition-transform duration-200 group-open:rotate-180">▼</span>
                      </summary>
                      <div className="border-t border-[#dfe7f5] bg-white px-4 pb-4">
                        <StaffTicketReply ticketId={ticket.id} />
                        <StaffTicketCharge ticketId={ticket.id} />
                        <StaffTicketResolve
                          ticketId={ticket.id}
                          onResolved={(res) => handleResolved(ticket, res)}
                        />
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <dialog
        ref={assignDialog}
        aria-labelledby="assign-error-title"
        aria-describedby="assign-error-description"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-[#0b1c30] shadow-xl backdrop:bg-black/40"
      >
        <h2 id="assign-error-title" className="text-lg font-bold">
          Unable to assign ticket
        </h2>
        <p id="assign-error-description" className="mt-3 text-sm leading-6 text-[#58657a]">
          {assignError}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => assignDialog.current.close()}
            className="rounded-lg border border-[#dfe7f5] px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              assignDialog.current.close();
              load(query);
            }}
            className="rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white"
          >
            Refresh list
          </button>
        </div>
      </dialog>
    </div>
  );
}
