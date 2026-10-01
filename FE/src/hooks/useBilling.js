import { useEffect, useMemo, useState } from "react";
import { getInvoiceTabs } from "../data/billingRepository";
import { filterInvoices } from "../domain/usecases/filterInvoices";
import paymentService from "../api/paymentService";
import reservationService from "../api/reservationService";

// Maps BE payment status strings → FE tab keys
// BE PaymentConstants: pending | succeeded | failed | cancelled | partially_refunded | refunded
function mapStatus(status, createdAt) {
  const s = (status || "").toLowerCase();
  if (s === "succeeded" || s === "paid" || s === "refunded") return "paid";
  if (s === "failed" || s === "cancelled") return "failed";

  // Check if pending payment has exceeded 15 minutes (900 seconds) hold time
  if (s === "pending" && createdAt) {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if (ageMs > 15 * 60 * 1000) {
      return "expired";
    }
  }

  // pending, partially_refunded, open, draft, overdue → upcoming (unpaid / needs action)
  return "upcoming";
}

// Human-readable English label for each raw BE status
function statusLabel(status, createdAt) {
  const s = (status || "").toLowerCase();
  if (s === "succeeded") return "Paid";
  if (s === "paid") return "Paid";
  if (s === "refunded") return "Refunded";
  if (s === "partially_refunded") return "Partially Refunded";
  if (s === "failed") return "Failed";
  if (s === "cancelled") return "Cancelled";
  if (s === "pending") {
    if (createdAt && (Date.now() - new Date(createdAt).getTime() > 15 * 60 * 1000)) {
      return "Expired";
    }
    return "Awaiting Payment";
  }
  return "Pending";
}

// Application layer: encapsulates Billing page state, filtering and data wiring.
export function useBilling() {
  const invoiceTabs = getInvoiceTabs();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    paymentService
      .getPaymentHistory()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setPayments(list);

        // Auto-release expired reservations (>15 mins) that are still marked pending
        list.forEach((p) => {
          const s = (p.status || "").toLowerCase();
          if (s === "pending" && p.createdAt && p.reservationId) {
            const ageMs = Date.now() - new Date(p.createdAt).getTime();
            if (ageMs > 15 * 60 * 1000) {
              // Silently call cancel reservation on BE to release unit to inventory
              reservationService
                .cancelReservation(p.reservationId, "Expired 15-minute payment hold window")
                .catch(() => {});
            }
          }
        });
      })
      .catch((err) => {
        if (active) setError(err?.message || "Không thể tải lịch sử thanh toán.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const invoices = useMemo(
    () =>
      payments.map((p) => {
        const isExp =
          (p.status || "").toLowerCase() === "pending" &&
          p.createdAt &&
          Date.now() - new Date(p.createdAt).getTime() > 15 * 60 * 1000;
        const mappedStatus = isExp ? "expired" : mapStatus(p.status, p.createdAt);

        return {
          id: p.invoiceNo || `PAY-${p.paymentId}`,
          paymentId: p.paymentId,
          invoiceId: p.invoiceId,
          date: new Date(p.paidAt || p.createdAt).toLocaleDateString("vi-VN"),
          desc: p.reservationCode
            ? `Đơn đặt chỗ ${p.reservationCode}`
            : `Hóa đơn ${p.invoiceNo || p.invoiceId}`,
          amount: `${new Intl.NumberFormat("vi-VN").format(p.amount)} ${p.currency || "VND"}`,
          rawAmount: p.amount,
          method: p.method || "-",
          rawStatus: p.status,
          status: mappedStatus,
          statusLabel: statusLabel(p.status, p.createdAt),
          isExpired: isExp,
          reservationId: p.reservationId,
          reservationCode: p.reservationCode,
        };
      }),
    [payments]
  );

  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, { tab: activeTab, search }),
    [invoices, activeTab, search]
  );

  return {
    invoiceTabs,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
  };
}
