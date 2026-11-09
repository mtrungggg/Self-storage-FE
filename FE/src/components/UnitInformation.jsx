import { useLanguage } from "../context/LanguageContext";

function parseTypeAndSize(unitTypeName, areaM2) {
  const name = String(unitTypeName || "").toLowerCase();
  let typeLabel = "Kho hàng khô";
  if (name.includes("seafood") || name.includes("freeze") || name.includes("đông lạnh") || name.includes("hải sản")) {
    typeLabel = "Kho đông lạnh / Hải sản";
  } else if (name.includes("warm") || name.includes("heated") || name.includes("sưởi")) {
    typeLabel = "Kho sưởi ấm";
  } else if (name.includes("climate") || name.includes("nhiệt độ")) {
    typeLabel = "Kho kiểm soát nhiệt độ";
  } else if (name.includes("locker") || name.includes("tủ khóa")) {
    typeLabel = "Tủ khóa thông minh";
  }

  let sizeLabel = "Small (3 m²)";
  if (name.includes("mini") || (areaM2 && areaM2 <= 1.5)) {
    sizeLabel = "Mini (1 m²)";
  } else if (name.includes("small") || (areaM2 && areaM2 <= 3.5)) {
    sizeLabel = "Small (3 m²)";
  } else if (name.includes("medium") || (areaM2 && areaM2 <= 6.5)) {
    sizeLabel = "Medium (6 m²)";
  } else if ((name.includes("large") && !name.includes("extra")) || (areaM2 && areaM2 <= 12)) {
    sizeLabel = "Large (10 m²)";
  } else if (name.includes("extra large") || name.includes("xl") || (areaM2 && areaM2 > 12)) {
    sizeLabel = "Extra Large (16 m²)";
  }

  return { typeLabel, sizeLabel };
}

export default function UnitInformation({ rental, className = "" }) {
  const { t, lang, formatDate, formatCurrency, translateStatus } = useLanguage();
  if (!rental) return null;
  const label = (vi, en) => lang === "vi" ? vi : en;
  const missing = "—";
  const amount = (value) => value !== null && value !== undefined && Number.isFinite(Number(value))
    ? formatCurrency(value) : missing;
  const measurement = (value, suffix) => value !== null && value !== undefined && Number.isFinite(Number(value))
    ? `${new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(Number(value))} ${suffix}` : missing;
  const location = [rental.floorLabel, rental.zoneLabel].filter(Boolean).join(" · ");
  const address = [rental.facilityAddress, rental.facilityCity].filter(Boolean).join(", ");
  const { typeLabel, sizeLabel } = parseTypeAndSize(rental.unitTypeName, rental.areaM2);
  const items = [
    [label("Mã kho", "Unit code"), rental.unitCode || missing],
    [t("manager_agreements.agreement_no", "Agreement No"), rental.agreementNo || missing],
    [label("Loại ô kho", "Storage Type"), typeLabel],
    [label("Phân loại kích thước", "Size Tier"), sizeLabel],
    [label("Khu vực / Tầng", "Zone / Floor"), location || missing],
    [label("Diện tích", "Area"), measurement(rental.areaM2, "m²")],
    [label("Thể tích", "Volume"), measurement(rental.volumeM3, "m³")],
    [label("Kích thước (rộng × dài × cao)", "Dimensions (W × L × H)"), rental.dimensions || missing],
    [label("Trạng thái hợp đồng", "Agreement status"), rental.status ? translateStatus(rental.status) : missing],
    [t("my_units.start_date", "Start Date"), rental.startDate ? formatDate(rental.startDate) : missing],
    [t("my_units.end_date", "End Date"), rental.endDate ? formatDate(rental.endDate) : missing],
    [t("my_units.monthly_fee", "Monthly Fee"), amount(rental.monthlyRate)],
    [label("Số dư tiền cọc", "Deposit balance"), amount(rental.depositBalance)],
  ];

  return (
    <section aria-label={t("my_units.unit_details", "Unit Details")} className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
        <span aria-hidden="true" className="material-symbols-outlined text-xl text-blue-600">info</span>
        {t("my_units.unit_details", "Unit Details")}
      </h2>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/60">
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{rental.facilityName || missing}</p>
        <p className="mt-1 break-words text-xs leading-relaxed text-slate-600 dark:text-zinc-400">{address || label("Chưa có địa chỉ cơ sở", "Facility address unavailable")}</p>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, value]) => (
          <div key={title} className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-zinc-400">{title}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-zinc-100">{value}</dd>
          </div>
        ))}
      </dl>
      {rental.hasOverdueDebt && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {label("Hợp đồng có khoản nợ quá hạn cần thanh toán. Xem chi tiết tại Hóa đơn & Thanh toán.", "This agreement has overdue charges. View Invoices & Payments for details.")}
        </p>
      )}
    </section>
  );
}
