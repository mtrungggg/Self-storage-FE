import { useEffect, useMemo, useState, useCallback } from "react";
import { getInvoiceTabs } from "../data/billingRepository";
import { filterInvoices } from "../domain/usecases/filterInvoices";
import paymentService from "../api/paymentService";
import { mergeBillingRows } from "../domain/usecases/mergeBillingRows";
import { PAYMENT_STATUS } from "../constants/paymentConstants";

// Maps BE payment status strings → FE tab keys
function mapStatus(status) {
  const s = (status || "").toLowerCase();
  if (s === PAYMENT_STATUS.SUCCEEDED || s === "paid" || s === PAYMENT_STATUS.REFUNDED || s === PAYMENT_STATUS.PARTIALLY_REFUNDED || s === "approved") return "paid";
  if (s === PAYMENT_STATUS.FAILED || s === PAYMENT_STATUS.CANCELLED || s === "rejected") return "failed";

  if (s === "expired") return "expired";

  // pending, partially_refunded, open, draft, overdue → upcoming (unpaid / needs action)
  return "upcoming";
}

// Human-readable English label for each raw BE status
function statusLabel(status) {
  const s = (status || "").toLowerCase();
  if (s === PAYMENT_STATUS.SUCCEEDED || s === "paid" || s === "approved") return "Paid";
  if (s === PAYMENT_STATUS.REFUNDED) return "Refunded";
  if (s === PAYMENT_STATUS.PARTIALLY_REFUNDED) return "Partially Refunded";
  if (s === PAYMENT_STATUS.FAILED || s === "rejected") return "Failed";
  if (s === PAYMENT_STATUS.CANCELLED) return "Cancelled";
  if (s === "expired") return "Expired";
  if (s === PAYMENT_STATUS.PENDING || s === "pending_payment") {
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

  const [now, setNow] = useState(() => Date.now());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [history, unpaid] = await Promise.all([
        paymentService.getPaymentHistory(),
        paymentService.getUnpaidInvoices(),
      ]);

      setNow(Date.now());
      setPayments(mergeBillingRows(history, unpaid));
    } catch (err) {
      setError(err?.message || "Không thể tải lịch sử thanh toán.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Live timer tick every second for 15-minute hold countdown
  useEffect(() => {
    if (!payments.length || !payments.some((p) => p.status === "pending" || p.status === "pending_payment" || (p.canPay && p.holdUntil))) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [payments]);

  const invoices = useMemo(
    () =>
      payments.map((p) => {
        const isPending =
          (p.status || "").toLowerCase() === "pending" ||
          (p.status || "").toLowerCase() === "pending_payment" ||
          Boolean(p.canPay && p.holdUntil);

        const deadline = p.holdUntil ? new Date(p.holdUntil).getTime()
          : p.renewalId && isPending ? new Date(p.createdAt).getTime() + 15 * 60 * 1000
          : null;
        const isExp = p.status === "expired" || (isPending && deadline !== null && deadline <= now);
        const mappedStatus = p.requiresReconciliation ? "upcoming" : isExp ? "expired" : mapStatus(p.status);

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

        const remainingSeconds = isPending && deadline !== null
          ? Math.max(0, Math.floor((deadline - now) / 1000)) : 0;

        return {
          id: p.invoiceNo || `PAY-${p.paymentId}`,
          paymentId: p.paymentId,
          requiresReconciliation: Boolean(p.requiresReconciliation),
          canPay: p.canPay && !isExp && !p.requiresReconciliation,
          canCancel: p.canCancel && !isExp && !p.requiresReconciliation,
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
          statusLabel: isExp ? "Expired" : statusLabel(p.status),
          isExpired: isExp,
          remainingSeconds,
          reservationId: p.reservationId,
          reservationCode: p.reservationCode,
        };
      }),
    [payments, now]
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
    reloadInvoices: fetchInvoices,
  };
}

