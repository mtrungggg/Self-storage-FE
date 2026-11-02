import { useState, useMemo, useEffect } from "react";
import { usePaymentCheckout } from "../hooks/usePaymentCheckout";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";
import { CHECKOUT_STATUS } from "../constants/paymentConstants";

function PaymentCheckout() {
  const {
    checkout,
    reservation,
    loading,
    error,
    status,
    formattedCountdown,
    progressPercent,
    cancelModalOpen,
    cancelling,
    cancelError,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    navigate,
  } = usePaymentCheckout();

  // Resolve payable amount: checkout amount, or reservation snapshot, or invoice total
  const displayAmount =
    checkout?.amount ||
    checkout?.vietQr?.amount ||
    reservation?.quotedTotal ||
    reservation?.amount ||
    0;

  // Extract banking and VietQR details
  const bankCode = checkout?.vietQr?.bankCode || "MBBank";
  const accountNo = checkout?.vietQr?.accountNo || "0817495759";
  const accountName = checkout?.vietQr?.accountName || "VO THAI HOANG KHOI";
  const memo = checkout?.vietQr?.transferContent || checkout?.invoiceNo || (reservation?.reservationCode ? `DH${reservation.reservationCode.slice(-4)}` : "DH5010");

  // Construct prioritized reliable QR candidate URLs
  const qrCandidateUrls = useMemo(() => {
    const list = [];
    const roundedAmount = Math.round(Number(displayAmount) || 0);

    // 1. SePay official CDN (most stable in Vietnam)
    list.push(
      `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankCode)}&acc=${encodeURIComponent(accountNo)}&template=compact&amount=${roundedAmount}&des=${encodeURIComponent(memo)}`
    );

    // 2. VietQR.io official direct CDN
    list.push(
      `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(accountNo)}-compact.png?amount=${roundedAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`
    );

    // 3. Backend-provided URL if available (normalized)
    if (checkout?.vietQr?.qrImageUrl) {
      const normalized = checkout.vietQr.qrImageUrl.replace("https://vietqr.app/img", "https://qr.sepay.vn/img");
      if (!list.includes(normalized)) list.push(normalized);
      if (!list.includes(checkout.vietQr.qrImageUrl)) list.push(checkout.vietQr.qrImageUrl);
    }

    // 4. Universal SVG/PNG fallback QR generator
    const emvcoPayload = `2|99|${bankCode}|${accountNo}|${accountName}|0|0|${roundedAmount}|${memo}`;
    list.push(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(emvcoPayload)}`);

    return list;
  }, [bankCode, accountNo, accountName, memo, displayAmount, checkout?.vietQr?.qrImageUrl]);

  const [qrIndex, setQrIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // Reset QR fallback index when candidates change
  useEffect(() => {
    setQrIndex(0);
  }, [qrCandidateUrls]);

  const handleQrImgError = () => {
    if (qrIndex < qrCandidateUrls.length - 1) {
      setQrIndex((prev) => prev + 1);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const currentQrSrc = qrCandidateUrls[qrIndex] || qrCandidateUrls[0];

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-6">
        {loading ? (
          <div className="mx-auto mt-16 flex max-w-[480px] flex-col items-center justify-center rounded-[20px] border border-[#dfe7f5] bg-white/80 p-12 text-center shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <span className="material-symbols-outlined animate-spin text-[36px] text-[#1d5fe5]">
              progress_activity
            </span>
            <div className="mt-4 text-[16px] font-bold text-[#0b1c30]">
              Initializing VietQR payment session...
            </div>
            <div className="mt-1 text-[13px] text-[#8996a9]">
              Connecting to secure banking gateway via SePay
            </div>
          </div>
        ) : error && !checkout ? (
          <div className="mx-auto mt-12 max-w-[500px] rounded-[20px] border border-[#fecdca] bg-white p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-[#d92d20]">
              error_outline
            </span>
            <h2 className="mt-3 text-[18px] font-bold text-[#b42318]">
              Payment Session Not Found
            </h2>
            <p className="mt-2 text-[13px] text-[#58657a]">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Explore Available Units
              </button>
              <button
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
              >
                My Invoices
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.SUCCESS ? (
          /* STATUS: PAYMENT SUCCESS */
          <div className="mx-auto mt-8 max-w-[540px] rounded-[22px] border border-[#a6f4c5] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf3] text-[#12b76a]">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h1 className="mt-5 text-[24px] font-extrabold text-[#027a48]">
              Thanh toán thành công!
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              Hệ thống đã ghi nhận thanh toán. Bạn có thể xem ngay mã PIN và QR ra vào kho trong mục <strong>My Units</strong> hoặc <strong>PIN Code</strong>.
            </p>

            <div className="mt-6 rounded-[14px] border border-[#e4e7ec] bg-[#f8f9fc] p-4 text-left text-[13px]">
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">Mã đơn / Reservation:</span>
                <span className="font-bold text-[#0b1c30]">
                  {reservation?.reservationCode || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">Số tiền đã thanh toán:</span>
                <span className="font-bold text-[#1d5fe5]">
                  {formatVnd(displayAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#667085]">Phương thức:</span>
                <span className="font-medium text-[#0b1c30]">VietQR / Chuyển khoản ngân hàng (SePay)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/my-units")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#0b1c30] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#182d49]"
              >
                <span className="material-symbols-outlined text-[18px]">warehouse</span>
                Xem kho của tôi (My Units)
              </button>
              <button
                onClick={() => navigate("/access-control")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                Lấy mã mở cửa PIN Code
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.EXPIRED ? (
          /* STATUS: EXPIRED */
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fecdca] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffbfa] text-[#d92d20]">
              <span className="material-symbols-outlined text-[48px]">timer_off</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b42318]">
              Thời gian giữ kho đã hết hạn (15 Phút)
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              Kho đã được tự động mở lại cho các khách hàng khác theo chính sách BR-RSV-01. Bạn có thể chọn và đặt lại kho mới.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                Tìm &amp; Đặt kho mới
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.FAILED ? (
          /* STATUS: CANCELLED */
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fecdca] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffbfa] text-[#d92d20]">
              <span className="material-symbols-outlined text-[48px]">cancel</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b42318]">
              Đơn đặt chỗ đã được hủy
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              Bạn đã hủy phiên thanh toán này. Kho đã được giải phóng trên hệ thống.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Tìm kho khác
              </button>
            </div>
          </div>
        ) : (
          /* STATUS: AWAITING PAYMENT - SHOW QR & 15-MIN COUNTDOWN */
          <div className="mx-auto max-w-[490px]">
            {/* 15-Minute Countdown Bar */}
            <div className="overflow-hidden rounded-[20px] border border-[#fedf89] bg-[#fffcf5] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#b54708]">
                  <span className="material-symbols-outlined animate-pulse text-[20px] text-[#f79009]">
                    timer
                  </span>
                  Thời gian giữ chỗ còn lại:
                </div>
                <div className="font-mono text-[20px] font-black tracking-wider text-[#b54708]">
                  {formattedCountdown}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#fef0c7]">
                <div
                  className="h-full bg-gradient-to-r from-[#f79009] to-[#d92d20] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* VietQR Box */}
            <div className="mt-5 rounded-[24px] border border-[#dfe7f5] bg-white p-6 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="text-[19px] font-black text-[#0b1c30]">
                Quét mã VietQR để thanh toán
              </div>
              {reservation?.reservationCode && (
                <div className="mt-1 text-[13px] text-[#58657a]">
                  {reservation.reservationCode.startsWith("RNW-") ? "Mã gia hạn: " : "Mã đặt chỗ: "}
                  <span className="font-bold text-[#0b1c30]">{reservation.reservationCode}</span>
                </div>
              )}

              {/* QR Image Box with multi-source fallback */}
              <div className="mt-4 flex flex-col items-center">
                <div className="relative h-[290px] w-[290px] overflow-hidden rounded-[18px] border-2 border-[#dfe7f5] bg-white p-2.5 shadow-sm transition hover:shadow-md">
                  <img
                    key={currentQrSrc}
                    src={currentQrSrc}
                    alt="VietQR Payment Code"
                    onError={handleQrImgError}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-2 text-[11px] text-[#8996a9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  Quét bằng App Ngân hàng hoặc Ví điện tử (MoMo, ZaloPay, ViettelMoney)
                </div>

                <div className="mt-3 text-[14px] font-bold text-[#0b1c30]">
                  G1SelfStorageSystem
                </div>
                <div className="text-[26px] font-black text-[#1d5fe5]">
                  {formatVnd(displayAmount)}
                </div>

                {/* Transfer Details Card with 1-click Copy */}
                <div className="mt-4 w-full rounded-[16px] bg-[#f8faff] border border-[#e8effd] p-4 text-left text-[12px] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Ngân hàng:</span>
                    <span className="font-bold text-[#0b1c30]">{bankCode} (Ngân hàng Quân Đội)</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[13px] text-[#0b1c30]">{accountNo}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(accountNo, "acc")}
                        className="rounded-md bg-white border border-[#dfe7f5] px-2 py-0.5 text-[11px] font-semibold text-[#1d5fe5] hover:bg-[#edf3ff] transition"
                      >
                        {copiedField === "acc" ? "Đã chép!" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">Chủ tài khoản:</span>
                    <span className="font-bold text-[#0b1c30]">{accountName}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[13px] text-[#1d5fe5]">{memo}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(memo, "memo")}
                        className="rounded-md bg-white border border-[#dfe7f5] px-2 py-0.5 text-[11px] font-semibold text-[#1d5fe5] hover:bg-[#edf3ff] transition"
                      >
                        {copiedField === "memo" ? "Đã chép!" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live sync pulse */}
                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#58657a]">
                  <span className="material-symbols-outlined animate-spin text-[16px] text-[#1d5fe5]">
                    sync
                  </span>
                  Hệ thống đang tự động lắng nghe giao dịch từ SePay...
                </div>
              </div>

              {/* Cancel Button */}
              <div className="mt-6 border-t border-[#f2f4fa] pt-4">
                <button
                  type="button"
                  onClick={handleOpenCancelModal}
                  className="rounded-[10px] border border-[#fecdca] bg-white px-4 py-2 text-[12px] font-bold text-[#b42318] hover:bg-[#fffbfa] transition"
                >
                  Hủy đơn đặt chỗ này
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* CONFIRM CANCEL MODAL */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseCancelModal()}
        >
          <div className="w-full max-w-[400px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fee4e2] text-[#d92d20]">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Xác nhận hủy đặt chỗ</h3>
                <p className="text-[12px] text-[#64748b]">Kho sẽ được giải phóng ngay lập tức</p>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-[#58657a]">
              Bạn có chắc chắn muốn hủy đơn đặt chỗ này không? Sau khi hủy, kho sẽ được đưa lại về trạng thái sẵn sàng cho khách hàng khác.
            </p>

            {cancelError && (
              <div className="mt-3 rounded-[10px] bg-[#fff1f1] border border-[#fecdca] p-2.5 text-[12px] font-semibold text-[#b3261e]">
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff] transition disabled:opacity-50"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="rounded-[10px] bg-[#d92d20] px-4 py-2 text-[13px] font-bold text-white shadow transition hover:bg-[#b42318] disabled:opacity-50"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentCheckout;
