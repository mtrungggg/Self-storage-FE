import DatePicker from "@/components/ui/date-picker";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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

// Hàm làm sạch mã kho (cắt bỏ tiền tố rác và hậu tố trạng thái như -PENDING-INSPECT, -OCCUPIED, v.v.)
function cleanUnitCode(code) {
  if (!code || code === "N/A") return "—";
  let s = String(code).trim();
  s = s.replace(/^(Unit|Ô kho|Kho)\s*/i, "");
  s = s.replace(/[-_](PENDING|INSPECT|INSPECTION|OCCUPIED|AVAILABLE|CLEANING|MAINTENANCE|RESERVED|RENTED|VACANT).*$/i, "");
  return s.trim() || "—";
}

export default function StaffMoveOutTab({ facilityId = "1" }) {
  const { t } = useLanguage();
  const [date, setDate] = useState(() => today());
  // Mặc định hiển thị Tất cả đơn cần xử lý (không lọc cứng theo ngày hôm nay)
  const [filterAll, setFilterAll] = useState(true);
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
        setItems(data || []);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(
          err.status === 403
            ? "Bạn không có quyền xem danh sách đơn trả kho."
            : err.message || "Không thể tải danh sách đơn trả kho."
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const req = requestId;
    loadMoveOuts();
    return () => {
      req.current++;
    };
  }, [facilityId, date, filterAll]);

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">{t("staff.moveout_tab", "Trả kho")}</h2>
          <Link
            to="/staff-inspections"
            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Mở trang kiểm tra đầy đủ →
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterAll(true)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              filterAll
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("staff.all_pending_moveouts", "Tất cả đơn cần xử lý")}
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterAll(false);
              setDate(today());
            }}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              !filterAll && date === today()
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("common.today", "Hôm nay")}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {t("common.by_date", "Theo ngày")}:
            </span>
            <div className="w-36">
              <DatePicker
                value={date}
                disabled={false}
                onChange={(e) => {
                  setFilterAll(false);
                  setDate(e.target.value);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={loadMoveOuts}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            title="Làm mới"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>refresh</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-xs text-slate-400">
          {t("common.loading", "Đang tải...")}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <p className="text-xs text-slate-400">
            Không có yêu cầu trả kho nào cần xử lý.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {items.map((item) => {
            const rawCode = item.unitCode && item.unitCode !== "N/A" ? item.unitCode : item.storageUnitCode;
            const unitLabel = cleanUnitCode(rawCode);
            const isCompleted = item.status === "completed";

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 text-xs transition hover:border-slate-300 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-zinc-900">
                        inventory_2
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {unitLabel === "—" ? "—" : `${t("common.unit", "Ô kho")} ${unitLabel}`}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {isCompleted ? t("common.completed", "Đã nghiệm thu") : t("staff_inspections.pending_inspection", "Chờ kiểm tra")}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    <div>
                      <dt className="text-[11px] text-slate-400">{t("common.customer", "Khách hàng")}:</dt>
                      <dd className="font-semibold text-slate-800 truncate mt-0.5">
                        {item.customerName || `ID ${item.customerId}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400">{t("common.agreement", "Hợp đồng")}:</dt>
                      <dd className="font-medium text-slate-700 font-mono mt-0.5">
                        {item.agreementNo || `#${item.agreementId}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400">{t("moveout.scheduled_date", "Ngày hẹn trả")}:</dt>
                      <dd className="font-semibold text-slate-800 mt-0.5">
                        {item.requestedMoveOutDate || "—"}
                      </dd>
                    </div>
                  </dl>

                  {item.reason && (
                    <p className="mt-2.5 border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 italic">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  )}
                </div>

                {/* Khối hành động hoặc trạng thái hoàn cọc duy nhất */}
                <div className="pt-2 border-t border-slate-100">
                  <MoveOutInspection
                    moveOut={item}
                    onCompleted={(id, extra) =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === id ? { ...entry, status: "completed", ...extra } : entry
                        )
                      )
                    }
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
