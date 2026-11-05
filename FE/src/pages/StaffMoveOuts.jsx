import DatePicker from "@/components/ui/date-picker";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffMoveOutService from "../api/staffMoveOutService";
import MoveOutInspection from "../components/MoveOutInspection";
import { MOVE_OUT_STATUS } from "../constants/rentalConstants";
import { useLanguage } from "../context/LanguageContext";

function today() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default function StaffMoveOuts() {
  const { t, translateStatus } = useLanguage();
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
        <Link to="/staff-dashboard" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("staff_inspections.back", "← Bảng điều khiển Nhân viên")}</Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{t("staff.moveout_tab", "Trả kho")}</h1>
          <button type="button" disabled={loading} onClick={() => load(query)} className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-50">{t("common.refresh", "Làm mới")}</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); load({ facilityId, date }); }} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[#dfe7f5] bg-white p-4 text-sm">
          <div><label htmlFor="move-out-facility" className="mb-1 block font-semibold">{t("common.facility", "Cơ sở")}</label><input id="move-out-facility" type="number" min="1" step="1" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} placeholder={t("common.all_facilities", "Tất cả cơ sở")} className="rounded-lg border p-2" /></div>
          <div className="w-48"><label htmlFor="move-out-date" className="mb-1 block font-semibold text-xs">{t("moveout.moveout_date", "Ngày trả kho")}</label><DatePicker id="move-out-date" required value={date} onChange={(event) => setDate(event.target.value)} /></div>
          <button type="submit" className="rounded-lg bg-zinc-900 text-white px-4 py-2 font-semibold text-white">{t("common.filter", "Lọc")}</button>
          <button type="button" onClick={() => { const currentDate = today(); setDate(currentDate); load({ facilityId, date: currentDate }); }} className="rounded-lg border px-4 py-2">{t("common.today", "Hôm nay")}</button>
        </form>
        <section aria-label="Move-out requests" aria-busy={loading} className="mt-5">
          {loading ? <p role="status">{t("common.loading", "Đang tải...")}</p> : error ? <div role="alert" className="rounded-xl bg-white p-4 text-red-600"><p>{error}</p><button type="button" onClick={() => load(query)} className="mt-2 underline">{t("common.refresh", "Thử lại")}</button></div> : items.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center">{t("common.no_data", "Không có dữ liệu")}</p> : <>
            <p className="mb-3 text-sm text-[#58657a]">{items.length} {t("staff.moveout_tab", "Trả kho")} · {query.date}</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => <article key={item.id} className="min-w-0 rounded-xl border border-[#dfe7f5] bg-white p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{t("common.unit", "Kho")} {item.unitCode || "—"}</h2><span className="rounded-full bg-[#eef4ff] px-2 py-1 text-xs">{translateStatus(item.status)}</span></div>
                <dl className="mt-3 space-y-2">
                  {[[t("common.customer", "Khách hàng"), item.customerName || item.customerId], [t("common.agreement", "Hợp đồng"), item.agreementNo || item.agreementId], [t("common.facility", "Cơ sở"), item.facilityId], [t("moveout.moveout_date", "Ngày trả kho"), item.requestedMoveOutDate]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>)}
                </dl>
                <p className="mt-3 whitespace-pre-wrap break-words border-t pt-3">{item.reason || t("common.no_notes", "Không có ghi chú")}</p>
                {item.status === MOVE_OUT_STATUS.COMPLETED && (
                  <div className="mt-2">
                    {item.refundMethod === "cash" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        {t("moveout.cash_paid", "Đã chi trả tiền mặt tại quầy")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {t("moveout.pending_transfer", "Đang chờ Quản lý chuyển khoản")}
                      </span>
                    )}
                  </div>
                )}
                <MoveOutInspection
                  moveOut={item}
                  onCompleted={(id, extra) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === id ? { ...entry, status: MOVE_OUT_STATUS.COMPLETED, ...extra } : entry
                      )
                    )
                  }
                />
              </article>)}
            </div>
          </>}
        </section>
      </main>
    </div>
  );
}
