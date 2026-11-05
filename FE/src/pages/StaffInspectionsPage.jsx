import DatePicker from "@/components/ui/date-picker";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import staffInspectionService from "../api/staffInspectionService";
import InspectionFormModal from "../components/InspectionFormModal";
import { useLanguage } from "../context/LanguageContext";

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

export default function StaffInspectionsPage() {
  const { t, formatCurrency } = useLanguage();
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(() => today());
  const [filterAll, setFilterAll] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);

  const requestId = useRef(0);

  const loadData = async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const params = {
        facilityId: facilityId ? Number(facilityId) : undefined,
      };
      if (!filterAll && date) {
        params.date = date;
      }

      const data = await staffInspectionService.getAssignedInspections(params);
      if (currentRequest === requestId.current) {
        setInspections(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err.message || "Không thể tải danh sách kho cần kiểm tra.");
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, date, filterAll]);

  function handleInspectionSuccess(result) {
    const unitCode = selectedInspection?.unitCode || "—";
    const isOver = result.penaltyAmount > 0;
    setToastMsg(
      isOver
        ? `${t("staff_inspections.over_deposit", "Hư hỏng vượt cọc: Phạt thêm")} ${formatCurrency(result.penaltyAmount)} (${t("common.unit", "Kho")} ${unitCode})`
        : `${t("staff_inspections.deduct_damage", "Khấu trừ hư hại: Hoàn lại")} ${formatCurrency(result.refundAmount)} (${t("common.unit", "Kho")} ${unitCode})`
    );

    // Cập nhật trạng thái item tại local
    setInspections((prev) =>
      prev.map((item) =>
        item.id === selectedInspection.id
          ? {
              ...item,
              status: "completed",
              inspectionResult: result,
              refundAmount: result.refundAmount,
              penaltyAmount: result.penaltyAmount,
              hasDamage: result.hasDamage,
            }
          : item
      )
    );
  }

  return (
    <div className="relative min-h-screen text-[#0b1c30]">
      <PageBackground />
      <main className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
        <Link
          to="/staff-dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
        >
          {t("staff_inspections.back", "← Bảng điều khiển Nhân viên")}
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("staff_inspections.title", "Kiểm tra trả kho & Nghiệm thu cọc")}</h1>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={loadData}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            {loading ? t("common.loading", "Đang tải...") : t("common.refresh", "Làm mới")}
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
          <label className="font-semibold text-slate-600 flex items-center gap-2">
            {t("common.facility", "Cơ sở")}:
            <input
              type="number"
              min="1"
              step="1"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              placeholder={t("common.all_facilities", "Tất cả cơ sở")}
              className="w-28 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-100"
            />
          </label>

          <label className="font-semibold text-slate-600 flex items-center gap-2">
            {t("moveout.moveout_date", "Ngày trả kho")}:
            <div className="w-44">
              <DatePicker
                value={date}
                disabled={filterAll}
                onChange={(e) => {
                  setFilterAll(false);
                  setDate(e.target.value);
                }}
              />
            </div>
          </label>

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                setFilterAll(false);
                setDate(today());
              }}
              className={`rounded-lg border px-3 py-1.5 font-bold transition ${
                !filterAll && date === today()
                  ? "bg-zinc-900 text-white text-white border-zinc-900 dark:border-zinc-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t("common.today", "Hôm nay")}
            </button>
            <button
              type="button"
              onClick={() => setFilterAll((v) => !v)}
              className={`rounded-lg border px-3 py-1.5 font-bold transition ${
                filterAll
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t("common.all_dates", "Tất cả ngày")}
            </button>
          </div>
        </div>

        {toastMsg && (
          <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-xs">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* List of Expiring Units Assigned for Inspection */}
        <section aria-label="Inspection list" aria-busy={loading} className="mt-5">
          {loading ? (
            <p role="status" className="p-8 text-center text-sm text-slate-500">
              {t("common.loading", "Đang tải...")}
            </p>
          ) : error ? (
            <div role="alert" className="rounded-xl bg-white p-6 text-red-600 border border-red-100">
              <p className="font-semibold">{error}</p>
              <button type="button" onClick={loadData} className="mt-2 text-sm text-zinc-900 dark:text-zinc-100 underline">
                {t("common.refresh", "Thử lại")}
              </button>
            </div>
          ) : inspections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-300">fact_check</span>
              <p className="font-semibold text-slate-700">
                {t("common.no_data", "Không có dữ liệu")}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-slate-500">
                {inspections.length} {t("staff_inspections.inspected_units_count", "kho cần nghiệm thu trả kho")}
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inspections.map((item) => {
                  const deposit = Number(item.depositAmount ?? item.deposit ?? 2000000);
                  const isCompleted = item.status === "completed" || item.inspectionResult != null;
                  const hasDamage = item.hasDamage || item.inspectionResult?.hasDamage;
                  const isOver = (item.penaltyAmount ?? item.inspectionResult?.penaltyAmount) > 0;

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#dfe7f5] bg-white p-4 text-xs shadow-xs transition hover:shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Unit & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-zinc-900 dark:text-zinc-100">warehouse</span>
                            <strong className="text-sm font-bold text-slate-900">
                              {t("common.unit", "Kho")} {item.unitCode || "—"}
                            </strong>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isCompleted ? t("staff_inspections.inspected", "Đã nghiệm thu") : t("staff_inspections.pending_inspection", "Chờ kiểm tra")}
                          </span>
                        </div>

                        {/* Details */}
                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <dt className="text-[11px] text-slate-500">{t("common.customer", "Khách hàng")}</dt>
                            <dd className="font-semibold text-slate-800 truncate">{item.customerName || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] text-slate-500">{t("common.phone", "Điện thoại")}</dt>
                            <dd className="font-semibold text-slate-800 truncate">{item.customerPhone || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] text-slate-500">{t("common.agreement", "Hợp đồng")}</dt>
                            <dd className="font-mono text-slate-700 truncate">{item.agreementNo || `#${item.id}`}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] text-slate-500">{t("moveout.end_date", "Ngày hết hạn / Trả")}</dt>
                            <dd className="font-semibold text-slate-800 truncate">
                              {item.expirationDate || item.requestedMoveOutDate || today()}
                            </dd>
                          </div>
                        </dl>

                        {/* Tiền cọc */}
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-600">{t("moveout.initial_deposit", "Tiền cọc ban đầu")}:</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(deposit)}</span>
                        </div>

                        {/* Kết quả kiểm tra nếu đã thực hiện */}
                        {isCompleted && (
                          <div className="mt-3 space-y-1 rounded-xl p-2.5 border text-[11px]">
                            {isOver ? (
                              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-900">
                                <span className="font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
                                  {t("staff_inspections.over_deposit", "Hư hỏng vượt cọc: Phạt thêm")} {formatCurrency(item.penaltyAmount ?? item.inspectionResult?.penaltyAmount)}
                                </span>
                              </div>
                            ) : hasDamage ? (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-amber-900">
                                <span className="font-bold">
                                  {t("staff_inspections.deduct_damage", "Khấu trừ hư hại: Hoàn lại")} {formatCurrency(item.refundAmount ?? item.inspectionResult?.refundAmount)}
                                </span>
                              </div>
                            ) : (
                              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-emerald-900">
                                <span className="font-bold">{t("staff_inspections.intact_refund", "Kho nguyên vẹn: Hoàn trả 100% cọc")}</span>
                              </div>
                            )}

                            {/* Trạng thái chi trả theo Module 2 */}
                            <div className="pt-1">
                              {item.refundMethod === "cash" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[10px]">
                                  <span className="material-symbols-outlined text-[12px]">payments</span>
                                  {t("moveout.cash_paid", "Đã chi trả tiền mặt tại quầy")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800 text-[10px]">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  {t("moveout.pending_transfer", "Đang chờ Quản lý chuyển khoản")}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedInspection(item)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">fact_check</span>
                          <span>{isCompleted ? t("staff_inspections.recheck", "Kiểm tra lại / Cập nhật") : t("staff_inspections.do_inspection", "Tiến hành kiểm tra trả kho")}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal kiểm tra trả kho & nghiệm thu */}
      {selectedInspection && (
        <InspectionFormModal
          inspection={selectedInspection}
          isOpen={Boolean(selectedInspection)}
          onClose={() => setSelectedInspection(null)}
          onSuccess={handleInspectionSuccess}
        />
      )}
    </div>
  );
}
