import { useLanguage } from "../context/LanguageContext";

function getCategoryName(unitTypeName) {
  if (!unitTypeName) return "Kho tiêu chuẩn";
  const name = String(unitTypeName).trim();
  return name.replace(/\s*-\s*(Mini|Small|Medium|Large|Extra Large|XL|\d+(\.\d+)?\s*m²).*/i, "").trim() || name;
}

export default function UnitInformation({ rental, className = "" }) {
  const { t, lang, formatDate, formatCurrency, translateStatus } = useLanguage();
  if (!rental) return null;

  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);
  const missing = "—";
  const amount = (value) =>
    value !== null && value !== undefined && Number.isFinite(Number(value))
      ? formatCurrency(value)
      : missing;
  const measurement = (value, suffix) =>
    value !== null && value !== undefined && Number.isFinite(Number(value))
      ? `${new Intl.NumberFormat(isVi ? "vi-VN" : "en-US").format(Number(value))} ${suffix}`
      : missing;

  const location = [rental.floorLabel, rental.zoneLabel].filter(Boolean).join(" · ");
  const address = [rental.facilityAddress, rental.facilityCity].filter(Boolean).join(", ");
  const category = getCategoryName(rental.categoryName || rental.storageCategory || rental.unitTypeName);
  const dimensions = rental.dimensions
    ? rental.dimensions.replace(/\s*x\s*/gi, " × ")
    : rental.lengthM && rental.widthM
    ? `${rental.lengthM}m × ${rental.widthM}m × ${rental.heightM || 2.5}m`
    : missing;

  const duration =
    rental.startDate && rental.endDate
      ? `${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}`
      : missing;

  const items = [
    [label("Mã ô kho", "Unit Code"), rental.unitCode || missing],
    [label("Số hợp đồng", "Agreement No"), rental.agreementNo || missing],
    [label("Loại kho", "Storage Category"), category],
    [label("Kích thước (Dài × Rộng × Cao)", "Dimensions (L × W × H)"), dimensions],
    [label("Diện tích mặt sàn", "Floor Area"), measurement(rental.areaM2, "m²")],
    [label("Thể tích lưu trữ", "Storage Volume"), measurement(rental.volumeM3 || (rental.areaM2 ? Number(rental.areaM2) * 2.5 : null), "m³")],
    [label("Khu vực / Tầng", "Zone / Floor"), location || missing],
    [label("Thời hạn hợp đồng", "Contract Duration"), duration],
    [label("Giá thuê / tháng", "Monthly Rate"), amount(rental.monthlyRate)],
    [label("Số dư tiền cọc", "Deposit Balance"), amount(rental.depositBalance)],
    [label("Trạng thái hợp đồng", "Contract Status"), rental.status ? translateStatus(rental.status) : missing],
  ];

  return (
    <section
      aria-label={label("Thông tin chi tiết ô kho", "Unit Details")}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
          <span aria-hidden="true" className="material-symbols-outlined text-lg text-blue-600">
            warehouse
          </span>
          {label("Thông tin chi tiết ô kho", "Unit Details")}
        </h2>
        {rental.unitCode && (
          <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
            {rental.unitCode}
          </span>
        )}
      </div>

      <div className="mt-3.5 rounded-xl bg-slate-50 p-3.5 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <span className="material-symbols-outlined text-[16px] text-slate-500">location_on</span>
          <span>{rental.facilityName || missing}</span>
        </div>
        <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
          {address || label("Chưa có địa chỉ cơ sở", "Facility address unavailable")}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, value]) => (
          <div key={title} className="min-w-0">
            <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{title}</dt>
            <dd className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-zinc-100" title={typeof value === "string" ? value : undefined}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {rental.hasOverdueDebt && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200">
          {label(
            "Hợp đồng có khoản nợ quá hạn cần thanh toán. Xem chi tiết tại Hóa đơn & Thanh toán.",
            "This agreement has overdue charges. View Invoices & Payments for details."
          )}
        </p>
      )}
    </section>
  );
}
