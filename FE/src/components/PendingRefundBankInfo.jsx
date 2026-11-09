import { useCallback, useEffect, useState } from "react";
import { Landmark, CheckCircle2, AlertTriangle } from "lucide-react";
import rentalService from "../api/rentalService";
import { useLanguage } from "../context/LanguageContext";

const BANKS = [
  "Vietcombank (VCB)",
  "Techcombank (TCB)",
  "BIDV",
  "VietinBank",
  "Agribank",
  "MB Bank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
  "SHB",
  "MSB",
  "SeABank",
  "OCB",
];

function RefundBankForm({ refund, onDone }) {
  const { t, formatCurrency } = useLanguage();
  const [bankName, setBankName] = useState(BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    if (!accountNumber.trim() || !accountHolder.trim()) {
      setError(t("common.required", "Vui lòng nhập đầy đủ thông tin ngân hàng."));
      return;
    }
    setSending(true);
    setError("");
    try {
      const bankData = {
        bankName: bankName.trim(),
        bankAccountNumber: accountNumber.trim(),
        bankAccountHolder: accountHolder.trim().toUpperCase(),
      };
      await rentalService.submitRefundBankInfo(refund.refundId, bankData);
      if (refund.agreementId) {
        localStorage.setItem(
          `refund_bank_info_${refund.agreementId}`,
          JSON.stringify({ ...bankData, accountNumber: bankData.bankAccountNumber, accountHolder: bankData.bankAccountHolder, submittedAt: new Date().toISOString() })
        );
        window.dispatchEvent(new Event("storage"));
      }
      onDone(refund.refundId);
    } catch (err) {
      setError(err?.message || t("refunds.send_failed", "Không thể gửi thông tin ngân hàng."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-amber-200 bg-white p-4 text-xs shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">
            {refund.agreementNo || `#${refund.refundId}`}
            {refund.unitCode && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">{t("refunds.unit_label", "Kho")} {refund.unitCode}</span>}
          </p>
          {refund.facilityName && <p className="text-slate-500">{refund.facilityName}</p>}
        </div>
        <span className="font-bold text-amber-700">
          {t("refunds.refund_amount_needed", "Cần hoàn cọc")}: {formatCurrency ? formatCurrency(refund.amount) : `${refund.amount} ₫`}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:border-blue-500"
        >
          {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/[^\d]/g, ""))}
          placeholder={t("refunds.account_number", "Số tài khoản")}
          inputMode="numeric"
          className="rounded-lg border border-slate-200 px-2.5 py-2 font-mono outline-none focus:border-blue-500"
        />
        <input
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
          placeholder={t("refunds.account_holder", "Tên chủ tài khoản")}
          className="rounded-lg border border-slate-200 px-2.5 py-2 uppercase outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-rose-600">
          <AlertTriangle size={13} /> {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-amber-600 px-3.5 py-1.5 font-semibold text-white hover:bg-amber-700 disabled:opacity-60 cursor-pointer"
        >
          {sending ? t("refunds.submitting", "Đang gửi...") : t("refunds.submit_bank_info", "Gửi STK nhận hoàn cọc")}
        </button>
      </div>
    </form>
  );
}

/**
 * Hiển thị các khoản hoàn cọc đang chờ khách nhập STK.
 * Không phụ thuộc vào danh sách kho đang thuê, nên vẫn hiện khi hợp đồng đã hết hạn / kết thúc.
 */
export default function PendingRefundBankInfo() {
  const { t } = useLanguage();
  const [refunds, setRefunds] = useState([]);
  const [doneIds, setDoneIds] = useState([]);

  const load = useCallback(async () => {
    try {
      setRefunds(await rentalService.getPendingBankInfoRefunds());
    } catch {
      setRefunds([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!refunds.length && !doneIds.length) return null;

  return (
    <section className="mb-5 rounded-2xl border border-amber-300 bg-amber-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-amber-900">
        <Landmark size={18} />
        <h2 className="text-sm font-bold">{t("refunds.pending_bank_title", "Hoàn cọc đang chờ bạn nhập số tài khoản")}</h2>
      </div>
      <p className="mb-3 text-xs text-amber-800">
        {t("refunds.pending_bank_desc", "Các hợp đồng dưới đây đã kết thúc/nghiệm thu. Vui lòng cung cấp số tài khoản để quản lý chuyển khoản hoàn cọc.")}
      </p>

      {doneIds.length > 0 && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800">
          <CheckCircle2 size={14} /> {t("refunds.bank_recorded_notice", "Đã ghi nhận thông tin ngân hàng. Quản lý sẽ chuyển khoản hoàn cọc cho bạn.")}
        </p>
      )}

      <div className="space-y-3">
        {refunds
          .filter((r) => !doneIds.includes(r.refundId))
          .map((r) => (
            <RefundBankForm
              key={r.refundId}
              refund={r}
              onDone={(id) => setDoneIds((prev) => [...prev, id])}
            />
          ))}
      </div>
    </section>
  );
}
