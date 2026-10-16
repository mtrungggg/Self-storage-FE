import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffMoveOutService from "../api/staffMoveOutService";
import MoveOutInspection from "../components/MoveOutInspection";

function today() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default function StaffMoveOuts() {
  const [query, setQuery] = useState(() => ({ date: today() }));
  const [date, setDate] = useState(query.date);
  const [facilityId, setFacilityId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);

  useEffect(() => {
    const request = ++generation.current;
    let active = true;
    staffMoveOutService.getMoveOuts(query)
      .then((data) => { if (active && request === generation.current) setItems(data); })
      .catch((err) => { if (active && request === generation.current) setError(err.status === 403 ? "You do not have permission to view these move-out requests." : err.message || "Unable to load move-out requests."); })
      .finally(() => { if (active && request === generation.current) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  function load(filters) {
    generation.current++;
    setLoading(true);
    setError("");
    setQuery({ ...filters });
  }

  return (
    <div className="relative min-h-screen text-[#0b1c30]">
      <PageBackground />
      <main className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
        <Link to="/staff-dashboard" className="text-sm font-semibold text-[#1d5fe5]">Back to staff dashboard</Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Move-out requests</h1>
          <button type="button" disabled={loading} onClick={() => load(query)} className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-50">Refresh</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); load({ facilityId, date }); }} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[#dfe7f5] bg-white p-4 text-sm">
          <div><label htmlFor="move-out-facility" className="mb-1 block font-semibold">Facility ID</label><input id="move-out-facility" type="number" min="1" step="1" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} placeholder="All permitted facilities" className="rounded-lg border p-2" /></div>
          <div><label htmlFor="move-out-date" className="mb-1 block font-semibold">Move-out date</label><input id="move-out-date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border p-2" /></div>
          <button type="submit" className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white">Apply filters</button>
          <button type="button" onClick={() => { const currentDate = today(); setDate(currentDate); load({ facilityId, date: currentDate }); }} className="rounded-lg border px-4 py-2">Today</button>
        </form>
        <section aria-label="Move-out requests" aria-busy={loading} className="mt-5">
          {loading ? <p role="status">Loading move-out requests...</p> : error ? <div role="alert" className="rounded-xl bg-white p-4 text-red-600"><p>{error}</p><button type="button" onClick={() => load(query)} className="mt-2 underline">Try again</button></div> : items.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center">No move-out requests for the selected date and facility.</p> : <>
            <p className="mb-3 text-sm text-[#58657a]">{items.length} requests · {query.date}</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => <article key={item.id} className="min-w-0 rounded-xl border border-[#dfe7f5] bg-white p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">Unit {item.unitCode || "—"}</h2><span className="rounded-full bg-[#eef4ff] px-2 py-1 text-xs">{item.status}</span></div>
                <dl className="mt-3 space-y-2">
                  {[["Customer", item.customerName || item.customerId], ["Agreement", item.agreementNo || item.agreementId], ["Facility ID", item.facilityId], ["Requested move-out", item.requestedMoveOutDate]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>)}
                </dl>
                <p className="mt-3 whitespace-pre-wrap break-words border-t pt-3">{item.reason || "No reason provided."}</p>
                <MoveOutInspection moveOut={item} onCompleted={(id) => setItems((current) => current.map((entry) => entry.id === id ? { ...entry, status: "completed" } : entry))} />
              </article>)}
            </div>
          </>}
        </section>
      </main>
    </div>
  );
}
