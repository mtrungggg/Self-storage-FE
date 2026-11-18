import { useCallback, useEffect, useRef, useState } from "react";
import staffRentalApi from "../services/api/staffRentalApi";
import { useLanguage } from "../context/LanguageContext";

const PAGE_SIZE = 20;
const RESULT_OPTIONS = ["", "success", "denied", "failed"];

const RESULT_STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  denied: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN");
}

export default function StaffAccessEventsPanel({ facilityId = "" }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (facilityId) params.facilityId = Number(facilityId);
      if (result) params.result = result;
      const data = await staffRentalApi.getAccessEvents(params);
      if (currentRequest !== requestId.current) return;
      setEvents(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      setTotalPages(Number(data?.totalPages) || 0);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setEvents([]);
      setTotalPages(0);
      setError(err?.message || "Unable to load access events.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [facilityId, page, result]);

  useEffect(() => {
    load();
    return () => {
      requestId.current++;
    };
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [facilityId, result]);

  return (
    <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900">{t("staff.access_events", "Nhật ký ra vào")}</h2>
        <div className="flex items-center gap-2">
          <select
            value={result}
            onChange={(event) => setResult(event.target.value)}
            aria-label={t("staff.access_result", "Kết quả")}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            {RESULT_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option ? option : t("common.all", "Tất cả")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && <p role="status" className="mt-3 text-xs text-slate-400">{t("common.loading", "Đang tải...")}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-xs text-[#8996a9]">
          {t("common.no_data", "Không có dữ liệu")}
        </p>
      )}

      {!error && events.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-3 font-bold">{t("table.time", "Thời gian")}</th>
                <th className="py-2 pr-3 font-bold">{t("table.unit", "Ô kho")}</th>
                <th className="py-2 pr-3 font-bold">{t("table.access_point", "Điểm truy cập")}</th>
                <th className="py-2 pr-3 font-bold">{t("table.actor", "Người thực hiện")}</th>
                <th className="py-2 pr-3 font-bold">{t("table.result", "Kết quả")}</th>
                <th className="py-2 font-bold">{t("table.reason", "Lý do")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const key = String(event.result || "").toLowerCase();
                return (
                  <tr key={event.id} className="border-b border-slate-50 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-600">{formatDateTime(event.occurredAt)}</td>
                    <td className="py-2 pr-3 font-semibold text-slate-800">
                      {event.unitCode || "—"}
                      {event.agreementNo && <span className="block text-[11px] font-normal text-slate-500">{event.agreementNo}</span>}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">{event.accessPointName || "—"}</td>
                    <td className="py-2 pr-3 text-slate-700">{event.actorName || "—"}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${RESULT_STYLES[key] || "bg-slate-100 text-slate-600"}`}>
                        {event.result || "—"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{event.reason || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={loading || page <= 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ‹
          </button>
          <span className="text-slate-500">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={loading || page >= totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
