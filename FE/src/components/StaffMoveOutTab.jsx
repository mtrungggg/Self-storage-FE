import { useEffect, useRef, useState } from "react";
import staffMoveOutService from "../api/staffMoveOutService";
import MoveOutInspection from "./MoveOutInspection";

function today() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default function StaffMoveOutTab({ facilityId = "1" }) {
  const [date, setDate] = useState(() => today());
  const [filterAll, setFilterAll] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadMoveOuts = async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const query = {
        facilityId: facilityId ? Number(facilityId) : undefined,
      };
      if (!filterAll && date) {
        query.date = date;
      }
      const data = await staffMoveOutService.getMoveOuts(query);
      if (currentRequest === requestId.current) {
        setItems(data);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(
          err.status === 403
            ? "You do not have permission to view move-out requests."
            : err.message || "Unable to load move-out requests."
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMoveOuts();
    return () => {
      requestId.current++;
    };
  }, [facilityId, date, filterAll]);

  return (
    <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Move-out</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={date}
            disabled={filterAll}
            onChange={(e) => {
              setFilterAll(false);
              setDate(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#1d5fe5] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => {
              setFilterAll(false);
              setDate(today());
            }}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              !filterAll && date === today()
                ? "bg-[#1d5fe5] text-white border-[#1d5fe5]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setFilterAll((v) => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              filterAll
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {filterAll ? "By date" : "All"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={loadMoveOuts}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-6 text-center text-xs text-slate-400">
          Loading...
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-xs text-slate-400">
            No requests.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-xs transition hover:border-[#b5cdfc]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Unit {item.unitCode || `#${item.storageUnitId}`}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                    item.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Customer:</dt>
                  <dd className="font-semibold text-slate-800">
                    {item.customerName || `ID ${item.customerId}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Agreement:</dt>
                  <dd className="font-medium text-slate-700">
                    {item.agreementNo || `#${item.agreementId}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Scheduled Date:</dt>
                  <dd className="font-semibold text-slate-800">
                    {item.requestedMoveOutDate || "—"}
                  </dd>
                </div>
              </dl>

              {item.reason && (
                <p className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500 italic">
                  &ldquo;{item.reason}&rdquo;
                </p>
              )}

              <MoveOutInspection
                moveOut={item}
                onCompleted={(id) =>
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === id ? { ...entry, status: "completed" } : entry
                    )
                  )
                }
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
