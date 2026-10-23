import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import reservationService from "../api/reservationService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  // Cancel reservation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let active = true;
    reservationService
      .getReservationDetail(id)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err.status === 404
              ? "Reservation not found."
              : err.message || "Unable to load reservation."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  const rawStatus = (detail?.status || "").toLowerCase();
  const isPending =
    rawStatus === "pending" ||
    rawStatus === "awaiting_deposit" ||
    rawStatus === "held";
  const isCancelled = rawStatus === "cancelled";

  const handleOpenCancelModal = () => {
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (cancelling) return;
    setCancelModalOpen(false);
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await reservationService.cancelReservation(
        id,
        "Khách hàng hủy từ trang chi tiết đặt chỗ"
      );
      setCancelModalOpen(false);
      setAttempt((n) => n + 1);
    } catch (err) {
      setCancelError(
        err?.message || "Hủy đơn đặt chỗ thất bại. Vui lòng thử lại."
      );
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = () => {
    navigate("/checkout", {
      state: {
        reservationId: detail.id || id,
        reservationCode: detail.reservationCode,
        amount: detail.quotedTotal || detail.firstPaymentTotal,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          to="/billing"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1d5fe5] hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Back to invoices
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Reservation details</h1>

        {loading ? (
          <p role="status" className="mt-4 text-[#58657a]">
            Loading reservation...
          </p>
        ) : error ? (
          <div className="mt-4">
            <p role="alert" className="text-red-600">
              {error}
            </p>
            <button
              onClick={() => {
                setError("");
                setLoading(true);
                setAttempt((n) => n + 1);
              }}
              className="mt-3 font-semibold text-[#1d5fe5]"
            >
              Try again
            </button>
          </div>
        ) : (
          detail && (
            <div className="mt-5 space-y-6">
              {/* Status Alert for Pending / Held */}
              {isPending && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#fedf89] bg-[#fffcf5] p-4 text-[#b54708]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined animate-pulse text-[22px] text-[#f79009]">
                      schedule
                    </span>
                    <div>
                      <div className="text-sm font-bold">
                        Đơn đặt chỗ đang chờ thanh toán
                      </div>
                      <div className="text-xs text-[#8c510a]">
                        Vui lòng thanh toán để xác nhận giữ chỗ hoặc hủy đơn nếu đổi ý.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePayNow}
                      className="rounded-xl bg-[#1d5fe5] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#154ec1]"
                    >
                      Thanh toán ngay
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCancelModal}
                      className="rounded-xl border border-[#fecdca] bg-white px-3 py-2 text-xs font-bold text-[#b42318] hover:bg-[#fff5f5] transition"
                    >
                      Hủy đơn đặt chỗ
                    </button>
                  </div>
                </div>
              )}

              {/* Status Alert for Cancelled */}
              {isCancelled && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#fecdca] bg-[#fffbfa] p-4 text-[#b42318]">
                  <span className="material-symbols-outlined text-[24px] text-[#d92d20]">
                    cancel
                  </span>
                  <div>
                    <div className="text-sm font-bold">Đơn đặt chỗ đã được hủy</div>
                    <div className="text-xs text-[#7a271a]">
                      {detail.cancellationReason || "Đơn đặt chỗ đã hủy và ô kho đã được giải phóng."}
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Card */}
              <div className="space-y-5 rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f8] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#0b1c30]">
                      {detail.reservationCode}
                    </h2>
                    <div className="text-xs text-[#64748b]">
                      Facility: {detail.facilityName}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      isCancelled
                        ? "bg-[#fee4e2] text-[#b42318]"
                        : isPending
                        ? "bg-[#fef0c7] text-[#b54708]"
                        : "bg-[#ecfdf3] text-[#027a48]"
                    }`}
                  >
                    {detail.displayStatus || detail.status}
                  </span>
                </div>

                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Facility", detail.facilityName],
                    ["Unit", detail.unitCode],
                    ["Unit type", detail.unitTypeName],
                    ["Start date", detail.startDate],
                    ["End date", detail.endDate],
                    [
                      "Monthly rate",
                      detail.monthlyRateSnapshot == null
                        ? null
                        : formatVnd(detail.monthlyRateSnapshot),
                    ],
                    [
                      "Deposit",
                      detail.depositSnapshot == null
                        ? null
                        : formatVnd(detail.depositSnapshot),
                    ],
                    [
                      "Booking fee",
                      detail.bookingFeeSnapshot == null
                        ? null
                        : formatVnd(detail.bookingFeeSnapshot),
                    ],
                    [
                      "Discount",
                      detail.discountSnapshot == null
                        ? null
                        : formatVnd(detail.discountSnapshot),
                    ],
                    [
                      "Quoted total",
                      detail.quotedTotal == null
                        ? null
                        : formatVnd(detail.quotedTotal),
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-[#58657a]">{label}</dt>
                      <dd className="mt-0.5 break-words font-semibold text-[#0b1c30]">
                        {value ?? "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                {detail.checkInInstructions && (
                  <section className="border-t border-[#eef1f8] pt-4">
                    <h3 className="font-bold text-[#0b1c30]">
                      Check-in instructions
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#58657a]">
                      {detail.checkInInstructions}
                    </p>
                  </section>
                )}

                {detail.checkInQrToken && (
                  <section className="border-t border-[#eef1f8] pt-4">
                    <h3 className="font-bold text-[#0b1c30]">Check-in code</h3>
                    <p className="mt-2 break-all rounded-lg bg-[#f8faff] p-3 font-mono text-xs">
                      {detail.checkInQrToken}
                    </p>
                  </section>
                )}

                {!!detail.invoices?.length && (
                  <section className="border-t border-[#eef1f8] pt-4">
                    <h3 className="font-bold text-[#0b1c30]">Invoices</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {detail.invoices.map((invoice) => (
                        <li
                          key={invoice.id}
                          className="flex flex-wrap justify-between gap-2 border-t border-[#f2f4fa] pt-2"
                        >
                          <span className="font-semibold text-[#1d5fe5]">
                            {invoice.invoiceNo}
                          </span>
                          <span className="text-[#58657a]">
                            {formatVnd(invoice.totalAmount)} · {invoice.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          )
        )}
      </main>
      <Footer />

      {/* CONFIRM CANCEL MODAL */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseCancelModal()}
        >
          <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fee4e2] text-[#d92d20]">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">
                  Xác nhận hủy đơn đặt chỗ
                </h3>
                <p className="text-[12px] text-[#64748b]">
                  {detail?.reservationCode}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-[#58657a]">
              Bạn có chắc chắn muốn hủy đơn đặt chỗ này không? Ô kho lưu trữ sẽ được giải phóng ngay lập tức trên hệ thống cho khách hàng khác.
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
                Không, giữ đơn
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="rounded-[10px] bg-[#d92d20] px-4 py-2 text-[13px] font-bold text-white shadow transition hover:bg-[#b42318] disabled:opacity-50"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
