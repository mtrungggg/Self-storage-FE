import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import reservationService from "../api/reservationService";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function parseTypeAndSize(unitTypeName) {
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
  if (name.includes("mini") || name.includes("1 m2") || name.includes("1 m²")) {
    sizeLabel = "Mini (1 m²)";
  } else if (name.includes("small") || name.includes("3 m2") || name.includes("3 m²")) {
    sizeLabel = "Small (3 m²)";
  } else if (name.includes("medium") || name.includes("6 m2") || name.includes("6 m²")) {
    sizeLabel = "Medium (6 m²)";
  } else if ((name.includes("large") && !name.includes("extra")) || name.includes("10 m2") || name.includes("10 m²")) {
    sizeLabel = "Large (10 m²)";
  } else if (name.includes("extra large") || name.includes("xl") || name.includes("16 m2") || name.includes("16 m²")) {
    sizeLabel = "Extra Large (16 m²)";
  }

  return { typeLabel, sizeLabel };
}

export default function ReservationDetail() {
  const { id } = useParams();
  const { t, translateStatus, formatDate, formatCurrency } = useLanguage();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelReservation = async () => {
    const isPaid = detail.status?.toLowerCase() === "confirmed";
    const msg = isPaid
      ? t("reservation.confirm_cancel_refund", "Bạn có chắc muốn hủy đơn đặt chỗ này? Yêu cầu hoàn tiền sẽ được tự động gửi đến Quản lý cơ sở xử lý.")
      : t("reservation.confirm_cancel", "Bạn có chắc muốn hủy đơn đặt chỗ này?");
    if (!window.confirm(msg)) return;

    setCancelling(true);
    try {
      await reservationService.cancelReservation(detail.id, "Khách hàng hủy trên trang chi tiết đặt chỗ");
      setAttempt((n) => n + 1);
    } catch (err) {
      alert(err?.message || t("common.error", "Không thể hủy đơn đặt chỗ"));
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    let active = true;
    reservationService.getReservationDetail(id)
      .then((data) => { if (active) setDetail(data); })
      .catch((err) => { if (active) setError(err.status === 404 ? t("common.no_data", "Not found") : err.message || t("common.error", "Error loading")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt, t]);

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link to="/billing" className="text-sm text-zinc-900 dark:text-zinc-100">{t("common.back", "Back to invoices")}</Link>
        <h1 className="mt-4 text-2xl font-bold">{t("common.details", "Reservation Details")}</h1>
        {loading ? (
          <p role="status" className="mt-4">{t("common.loading", "Loading reservation...")}</p>
        ) : error ? (
          <div className="mt-4">
            <p role="alert" className="text-red-600">{error}</p>
            <button onClick={() => { setError(""); setLoading(true); setAttempt((n) => n + 1); }} className="mt-3 text-zinc-900 dark:text-zinc-100">
              {t("common.refresh", "Try again")}
            </button>
          </div>
        ) : detail && (
          <div className="mt-5 space-y-5 rounded-2xl border border-[#dfe7f5] bg-white p-6">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="font-bold">{detail.reservationCode}</h2>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{translateStatus(detail.displayStatus || detail.status)}</span>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              {(() => {
                const { typeLabel, sizeLabel } = parseTypeAndSize(detail.unitTypeName);
                return [
                  [t("common.facility", "Facility"), detail.facilityName],
                  [t("common.unit", "Unit"), detail.unitCode],
                  [t("home.unit_type", "Loại ô kho"), typeLabel],
                  [t("common.size", "Phân loại kích thước"), sizeLabel],
                [t("common.start_date", "Start Date"), detail.startDate ? formatDate(detail.startDate) : "—"],
                [t("common.end_date", "End Date"), detail.endDate ? formatDate(detail.endDate) : "—"],
                [t("common.price", "Monthly Rate"), detail.monthlyRateSnapshot == null ? null : formatCurrency(detail.monthlyRateSnapshot)],
                [t("common.deposit", "Deposit"), detail.depositSnapshot == null ? null : formatCurrency(detail.depositSnapshot)],
                [t("common.total", "Total"), detail.quotedTotal == null ? null : formatCurrency(detail.quotedTotal)],
                ];
              })().map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[#58657a]">{label}</dt>
                  <dd className="break-words font-semibold">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {detail.checkInInstructions && (
              <section>
                <h2 className="font-bold">{t("access.keypad_instructions", "Check-in instructions")}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm">{detail.checkInInstructions}</p>
              </section>
            )}
            {detail.checkInQrToken && (
              <section>
                <h2 className="font-bold">{t("table.code", "Check-in Code")}</h2>
                <p className="mt-2 break-all rounded-lg bg-[#f8faff] p-3 font-mono text-xs">{detail.checkInQrToken}</p>
              </section>
            )}
            {!!detail.invoices?.length && (
              <section>
                <h2 className="font-bold">{t("billing.invoices", "Invoices")}</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {detail.invoices.map((invoice) => (
                    <li key={invoice.id} className="flex flex-wrap justify-between gap-2 border-t pt-2">
                      <span>{invoice.invoiceNo}</span>
                      <span>{formatCurrency(invoice.totalAmount)} · {translateStatus(invoice.status)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {["pending", "awaiting_deposit", "confirmed"].includes(detail.status?.toLowerCase()) && (
              <div className="flex justify-end pt-4 border-t border-[#dfe7f5]">
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  {cancelling ? t("common.loading", "Đang xử lý...") : (detail.status?.toLowerCase() === "confirmed" ? t("reservation.cancel_and_refund", "Hủy đặt chỗ & Hoàn tiền") : t("common.cancel", "Hủy đặt chỗ"))}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
