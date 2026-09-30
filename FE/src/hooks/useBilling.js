import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getInvoiceTabs } from "../data/billingRepository";
import { filterInvoices } from "../domain/usecases/filterInvoices";
import paymentService from "../api/paymentService";

function mapStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("paid") || s.includes("success") || s.includes("completed")) return "paid";
  if (s.includes("fail") || s.includes("cancel")) return "failed";
  return "upcoming";
}

// Application layer: encapsulates Billing page state, filtering and data wiring.
export function useBilling() {
  const location = useLocation();
  // Populated when arriving right after a reservation checkout (see useStorageDetail.submitBooking)
  const checkout = location.state?.checkout || null;
  const reservation = location.state?.reservation || null;

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
        if (active) setPayments(data);
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
      payments.map((p) => ({
        id: p.invoiceNo || `#PAY-${p.paymentId}`,
        date: new Date(p.paidAt || p.createdAt).toLocaleDateString("vi-VN"),
        desc: p.reservationCode ? `Đơn đặt chỗ ${p.reservationCode}` : `Hóa đơn ${p.invoiceNo || p.invoiceId}`,
        note: p.provider || p.method || "",
        amount: `${new Intl.NumberFormat("vi-VN").format(p.amount)} ${p.currency || "đ"}`,
        method: p.method || "-",
        status: mapStatus(p.status),
      })),
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
    checkout,
    reservation,
  };
}
