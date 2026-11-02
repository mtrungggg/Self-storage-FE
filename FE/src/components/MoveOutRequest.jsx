import { useEffect, useId, useRef, useState } from "react";
import RefundPreview from "./RefundPreview";
import rentalService from "../api/rentalService";

const POPULAR_BANKS = [
  "Vietcombank (VCB)",
  "Techcombank (TCB)",
  "MBBank (MB)",
  "VietinBank (CTG)",
  "BIDV",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "Agribank",
  "HDBank",
  "VIB",
];

function formatVnd(amount) {
  if (amount == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function MoveOutRequest({ agreementId }) {
  const id = useId();
  const lock = useRef(false);

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [bankName, setBankName] = useState("Vietcombank (VCB)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Bank submission and payout completion states
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [payoutCompleted, setPayoutCompleted] = useState(null);

  // Sync state from localStorage and listen to real-time events
  const syncStateFromStorage = () => {
    try {
      if (!agreementId) return;

      // 1. Check if Manager has completed the refund payout
      const payoutRaw = localStorage.getItem(`refund_payout_completed_${agreementId}`);
      if (payoutRaw) {
        setPayoutCompleted(JSON.parse(payoutRaw));
      }

      // 2. Check if customer already submitted bank details
      const bankRaw = localStorage.getItem(`refund_bank_info_${agreementId}`);
      if (bankRaw) {
        const parsed = JSON.parse(bankRaw);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
        if (parsed.accountHolder) setAccountHolder(parsed.accountHolder);
        setBankSubmitted(true);
      }
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  };

  useEffect(() => {
    syncStateFromStorage();

    const handleStorageChange = (e) => {
      if (!e.key || e.key.includes(String(agreementId))) {
        syncStateFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [agreementId]);

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");

    if (!date) {
      setError("Vui lòng chọn ngày dự kiến trả kho.");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng nhận hoàn cọc.");
      return;
    }

    lock.current = true;
    setSending(true);

    try {
      const bankData = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
        submittedAt: new Date().toISOString(),
      };

      // 1. Persist bank information for this agreement
      localStorage.setItem(`refund_bank_info_${agreementId}`, JSON.stringify(bankData));
      window.dispatchEvent(new Event("storage"));

      // 2. Submit move-out request with bank info
      await rentalService.requestMoveOut(agreementId, {
        requestedMoveOutDate: date,
        reason: reason.trim(),
        ...bankData,
      });

      setBankSubmitted(true);
    } catch (err) {
      if (err.message && (err.message.includes("already requested") || err.message.includes("409"))) {
        // If request is already open on backend, still mark bank info submitted
        setBankSubmitted(true);
      } else {
        setError(err.message || "Không thể gửi yêu cầu trả kho. Vui lòng thử lại.");
      }
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <details className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-[#1d5fe5] hover:underline">
        Move-out & Refund Preview
      </summary>
      <RefundPreview agreementId={agreementId} />

      {/* Case 1: Khi Manager bấm hoàn tất -> Hiển thị trạng thái "Đã hoàn cọc thành công" kèm ảnh biên lai chuyển khoản của Manager */}
      {payoutCompleted ? (
        <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">Đã hoàn cọc thành công</h4>
              <p className="text-[11px] text-emerald-700">
                Quản lý cơ sở đã hoàn tất chuyển khoản tiền hoàn cọc cho bạn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/90 p-2.5 border border-emerald-200">
            <div>
              <span className="text-[10px] text-slate-500 block">Số tiền đã hoàn:</span>
              <span className="font-bold text-emerald-700 text-xs">
                {formatVnd(payoutCompleted.amount)}
              </span>
            </div>
            {payoutCompleted.transactionRef && (
              <div>
                <span className="text-[10px] text-slate-500 block">Mã giao dịch:</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{payoutCompleted.transactionRef}</span>
              </div>
            )}
            {payoutCompleted.bankName && (
              <div>
                <span className="text-[10px] text-slate-500 block">Tài khoản nhận:</span>
                <span className="font-semibold text-slate-700 text-xs">{payoutCompleted.bankName} - {payoutCompleted.accountNumber}</span>
              </div>
            )}
            {payoutCompleted.completedAt && (
              <div>
                <span className="text-[10px] text-slate-500 block">Thời gian xử lý:</span>
                <span className="text-slate-600 text-xs">{new Date(payoutCompleted.completedAt).toLocaleString("vi-VN")}</span>
              </div>
            )}
          </div>

          {/* Ảnh biên lai chuyển khoản của Manager */}
          {payoutCompleted.proofUrl && (
            <div className="space-y-1.5 border-t border-emerald-200 pt-2.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Ảnh biên lai chuyển khoản của Manager:
              </span>
              <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white p-1 max-w-sm">
                <img
                  src={payoutCompleted.proofUrl}
                  alt="Biên lai chuyển khoản của Manager"
                  className="max-h-56 w-full object-contain rounded-md"
                />
                <div className="mt-1 flex items-center justify-between px-1">
                  <span className="text-[10px] text-slate-500 italic">Chứng từ UNC / Bill chuyển khoản</span>
                  <a
                    href={payoutCompleted.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1d5fe5] hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Xem ảnh gốc
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : bankSubmitted ? (
        /* Case 2: Khi khách nhập xong thông tin tài khoản ngân hàng -> Hiển thị trạng thái "Đã gửi thông tin tài khoản cho Quản lý cơ sở. Quản lý sẽ thực hiện chuyển khoản hoàn cọc cho bạn." */
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-950 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">mark_email_read</span>
            <div>
              <p className="font-bold text-blue-950 text-xs leading-snug">
                Đã gửi thông tin tài khoản cho Quản lý cơ sở. Quản lý sẽ thực hiện chuyển khoản hoàn cọc cho bạn.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/90 p-2.5 border border-blue-100 space-y-1.5 text-slate-700">
            <p className="font-semibold text-slate-800 text-[11px]">Thông tin tài khoản thụ hưởng đã gửi:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Ngân hàng:</span>
                <strong className="text-slate-800">{bankName || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Số tài khoản:</span>
                <strong className="text-slate-800 font-mono">{accountNumber || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Chủ tài khoản:</span>
                <strong className="text-slate-800 uppercase">{accountHolder || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 text-[11px]">
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Trạng thái: Đang chờ Quản lý cơ sở kiểm tra và chuyển khoản
            </span>
            <button
              type="button"
              onClick={() => setBankSubmitted(false)}
              className="text-[#1d5fe5] font-semibold underline hover:text-blue-800 cursor-pointer"
            >
              Chỉnh sửa STK
            </button>
          </div>
        </div>
      ) : (
        /* Case 3: Form nhập thông tin trả kho và tài khoản ngân hàng nhận tiền */
        <form onSubmit={submit} aria-busy={sending} className="mt-3 space-y-3">
          <fieldset disabled={sending} className="space-y-3 text-xs">
            <div>
              <label htmlFor={`${id}-date`} className="mb-1 block font-semibold text-slate-700">
                Ngày dự kiến trả kho *
              </label>
              <input
                id={`${id}-date`}
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-xs outline-none focus:border-[#1d5fe5]"
              />
            </div>

            <div>
              <label htmlFor={`${id}-reason`} className="mb-1 block font-semibold text-slate-700">
                Lý do trả kho (tùy chọn)
              </label>
              <textarea
                id={`${id}-reason`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Lý do kết thúc thuê kho..."
                className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-xs outline-none focus:border-[#1d5fe5]"
              />
            </div>

            {/* Thông tin tài khoản ngân hàng nhận hoàn cọc */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <span className="material-symbols-outlined text-[#1d5fe5] text-[18px]">account_balance</span>
                <span>Thông tin tài khoản ngân hàng nhận hoàn cọc *</span>
              </div>
              <p className="text-[11px] text-[#58657a]">
                Quản lý cơ sở sẽ căn cứ thông tin này để chuyển khoản tiền hoàn cọc sau khi kiểm tra kho.
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <label htmlFor={`${id}-bank`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Ngân hàng thụ hưởng *
                  </label>
                  <input
                    id={`${id}-bank`}
                    type="text"
                    required
                    list={`${id}-bank-list`}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Chọn hoặc nhập tên ngân hàng (VD: Vietcombank)"
                    className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-[#1d5fe5]"
                  />
                  <datalist id={`${id}-bank-list`}>
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`${id}-acc`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                      Số tài khoản *
                    </label>
                    <input
                      id={`${id}-acc`}
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="VD: 0071001234567"
                      className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-[#1d5fe5] font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${id}-holder`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                      Tên chủ tài khoản *
                    </label>
                    <input
                      id={`${id}-holder`}
                      type="text"
                      required
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-[#1d5fe5] uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p role="alert" className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={sending || !date || !bankName || !accountNumber || !accountHolder}
              className="w-full rounded-lg bg-[#1d5fe5] hover:bg-blue-700 p-2.5 font-bold text-white transition disabled:opacity-50 text-xs shadow-xs"
            >
              {sending ? "Đang gửi thông tin..." : "Gửi thông tin tài khoản nhận hoàn cọc"}
            </button>
          </fieldset>
        </form>
      )}
    </details>
  );
}
