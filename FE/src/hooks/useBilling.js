import { useEffect, useMemo, useState } from "react";
import { getInvoiceTabs } from "../data/billingRepository";
import { filterInvoices } from "../domain/usecases/filterInvoices";
import paymentService from "../api/paymentService";

// Maps BE payment status strings → FE tab keys
// BE PaymentConstants: pending | succeeded | failed | cancelled | partially_refunded | refunded
function mapStatus(status, createdAt) {
  const s = (status || "").toLowerCase();
  if (s === "succeeded" || s === "paid" || s === "refunded" || s === "approved") return "paid";
  if (s === "failed" || s === "cancelled" || s === "rejected") return "failed";

  // Check if pending payment has exceeded 15 minutes (900 seconds) hold time
  if ((s === "pending" || s === "pending_payment") && createdAt) {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if (ageMs > 15 * 60 * 1000) {
      return "expired";
    }
  }

  if (s === "expired") return "expired";

  // pending, partially_refunded, open, draft, overdue → upcoming (unpaid / needs action)
  return "upcoming";
}

// Human-readable English label for each raw BE status
function statusLabel(status, createdAt) {
  const s = (status || "").toLowerCase();
  if (s === "succeeded" || s === "paid" || s === "approved") return "Paid";
  if (s === "refunded") return "Refunded";
  if (s === "partially_refunded") return "Partially Refunded";
  if (s === "failed" || s === "rejected") return "Failed";
  if (s === "cancelled") return "Cancelled";
  if (s === "expired") return "Expired";
  if (s === "pending" || s === "pending_payment") {
    if (createdAt && (Date.now() - new Date(createdAt).getTime() > 15 * 60 * 1000)) {
      return "Expired";
    }
    return "Awaiting Payment";
  }
  return "Pending";
}

function formatMethod(method, provider) {
  const m = (method || "").toLowerCase();
  const p = (provider || "").toLowerCase();
  if (p === "sepay" || m.includes("vietqr") || m.includes("sepay")) return "VietQR (SePay)";
  if (m === "bank_transfer") return "Bank Transfer";
  if (m === "cash") return "Cash";
  if (m === "card") return "Card";
  return method || "VietQR (SePay)";
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

  const [tick, setTick] = useState(0);

  // Live timer tick every second for 15-minute hold countdown
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const invoices = useMemo(
    () =>
      payments.map((p) => {
        const isPending =
          (p.status || "").toLowerCase() === "pending" ||
          (p.status || "").toLowerCase() === "pending_payment";

        const ageMs = p.createdAt ? Date.now() - new Date(p.createdAt).getTime() : 0;
        const isExp =
          (p.status || "").toLowerCase() === "expired" ||
          (isPending && p.createdAt && ageMs > 15 * 60 * 1000);

        const mappedStatus = isExp ? "expired" : mapStatus(p.status, p.createdAt);

        const isRenewal = Boolean(
          p.renewalId ||
            (p.invoiceNo && p.invoiceNo.startsWith("RNW-")) ||
            (p.reservationCode && p.reservationCode.startsWith("RNW-"))
        );

        const desc = isRenewal
          ? `Gia hạn hợp đồng ${p.agreementNo || (p.reservationCode || "").replace("RNW-", "") || p.invoiceNo}`
          : p.reservationCode
          ? `Đơn đặt chỗ ${p.reservationCode}`
          : `Hóa đơn ${p.invoiceNo || p.invoiceId}`;

        const remainingSeconds =
          isPending && p.createdAt
            ? Math.max(0, Math.floor((15 * 60 * 1000 - ageMs) / 1000))
            : 0;

        return {
          id: p.invoiceNo || `PAY-${p.paymentId}`,
          paymentId: p.paymentId,
          invoiceId: p.invoiceId,
          renewalId: p.renewalId,
          agreementNo: p.agreementNo,
          isRenewal,
          date: p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleDateString("vi-VN") : "-",
          createdAt: p.createdAt,
          desc,
          amount: `${new Intl.NumberFormat("vi-VN").format(p.amount)} ${p.currency || "VND"}`,
          rawAmount: p.amount,
          method: formatMethod(p.method, p.provider),
          rawStatus: p.status,
          status: mappedStatus,
          statusLabel: isExp ? "Expired" : statusLabel(p.status, p.createdAt),
          isExpired: isExp,
          remainingSeconds,
          reservationId: p.reservationId,
          reservationCode: p.reservationCode,
        };
      }),
    [payments, tick]
  );

  const tabCounts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.status === "paid").length,
      upcoming: invoices.filter((i) => i.status === "upcoming").length,
      expired: invoices.filter((i) => i.status === "expired" || i.status === "failed").length,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, { tab: activeTab, search }),
    [invoices, activeTab, search]
  );

  return {
    invoiceTabs,
    activeTab,
    setActiveTab,
    tabCounts,
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
  };
}

