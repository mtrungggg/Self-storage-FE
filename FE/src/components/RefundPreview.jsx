import { useId, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import { useLanguage } from "../context/LanguageContext";

export default function RefundPreview({ agreementId }) {
  const panelId = useId();
  const lock = useRef(false);
  const { t, formatCurrency } = useLanguage();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);

  const fieldDefs = [
    { label: t("common.deposit", "Deposit"), key: "depositBalance" },
    { label: t("common.deductions", "Cleaning Fee"), key: "estimatedCleaningFee" },
    { label: t("common.deductions", "Repair Fee"), key: "estimatedRepairFee" },
    { label: t("moveout.unpaid_charges", "Công nợ / Hóa đơn chưa thanh toán"), key: "estimatedOverdueCharges" },
    { label: t("common.net_refund", "Net Refund"), key: "estimatedNetRefund", isBold: true },
  ];

  async function load() {
    if (lock.current) return;
    lock.current = true;
    setOpened(true);
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      setPreview(await rentalService.getRefundPreview(agreementId));
    } catch (err) {
      setError(err.status === 404 ? t("common.no_data", "Not found.") : err.message || t("common.error", "Failed to load."));
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <button
        type="button"
        onClick={load}
        disabled={loading}
        aria-expanded={opened}
        aria-controls={panelId}
        className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline disabled:opacity-50 cursor-pointer"
      >
        {loading ? t("common.loading", "...") : t("moveout.estimate", "Ước tính tiền cọc hoàn lại")}
      </button>
      <div id={panelId} hidden={!opened} aria-busy={loading}>
        {loading && <p role="status" className="mt-1 text-slate-400">{t("common.loading", "Đang tải...")}</p>}
        {error && <p role="alert" className="mt-1 text-red-600">{error}</p>}
        {preview && (
          <div className="mt-2 rounded-lg bg-[#f8faff] p-2.5">
            <dl className="space-y-1 text-xs">
              {fieldDefs.map(({ label, key, isBold }) => (
                <div
                  key={key}
                  className={`flex justify-between gap-2 ${
                    isBold
                      ? "border-t border-[#dfe7f5] pt-1 font-bold text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  <dt>{label}</dt>
                  <dd>
                    {typeof preview[key] === "number" && Number.isFinite(preview[key])
                      ? formatCurrency(preview[key])
                      : "—"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-1.5 text-[10px] text-slate-400">
              *{t("moveout.estimate_note", "Chỉ mang tính chất ước tính dựa trên biên bản kiểm tra kho.")}
            </p>
            {preview.note && (
              <p className="mt-1 text-[10px] text-slate-500 italic">
                {preview.note}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
