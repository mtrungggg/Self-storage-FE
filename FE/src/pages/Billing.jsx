import { useState } from "react";
import { useNavigate } from "react-router-dom";
import rentalService from "../api/rentalService";
import reservationService from "../api/reservationService";
import { useBilling } from "../hooks/useBilling";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function Billing() {
  const navigate = useNavigate();
  const { t, translateStatus } = useLanguage();
  const {
    invoiceTabs,
    activeTab,
    setActiveTab,
    tabCounts,
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
    reloadInvoices,
  } = useBilling();

  const [actionLoading, setActionLoading] = useState(null);

  const handleCancelInvoice = async (inv) => {
    if (actionLoading || !inv.canCancel) return;
    const isPaidRsv = inv.reservationId && inv.status === "paid";
    const confirmMsg = isPaidRsv
      ? "Bạn có chắc chắn muốn hủy đơn đặt chỗ đã thanh toán này? Yêu cầu hoàn tiền sẽ được tự động gửi đến Quản lý cơ sở để xử lý hoàn tiền cho bạn."
      : "Bạn có chắc chắn muốn hủy giao dịch chờ thanh toán này?";
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(inv.id);
    try {
      if (inv.renewalId) {
        await rentalService.cancelRenewal(inv.renewalId);
      } else if (inv.reservationId) {
        await reservationService.cancelReservation(inv.reservationId, isPaidRsv ? "Khách hàng hủy đơn đặt chỗ đã thanh toán trên trang Billing" : "Khách hàng hủy trên trang Billing");
      } else if (inv.invoiceId) {
        await rentalService.cancelInvoice(inv.invoiceId);
      }
      if (reloadInvoices) {
        await reloadInvoices();
      }
    } catch (err) {
      await reloadInvoices();
      alert(err?.message || "Không thể hủy giao dịch. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e] shadow-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">
              {t("billing.title", "Invoices & Payments")}
            </h1>
            <p className="mt-1 text-[13px] text-[#58657a]">
              {t("billing.subtitle", "Track recurring payments and transaction history")}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[15px] font-bold text-[#0b1c30]">
              {t("billing.payment_history", "Transaction History")}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#8996a9]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search", "Search...")}
                className="h-9 w-64 rounded-[8px] border border-[#dfe7f5] bg-white py-1.5 pl-8 pr-3 text-[12px] outline-none transition focus:border-zinc-900 dark:border-zinc-100 focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#8996a9] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-[10px] bg-[#eef4ff] p-1 w-fit">
            {invoiceTabs.map((tab) => {
              const count = tabCounts?.[tab.id] ?? 0;
              const isActive = activeTab === tab.id;
              const label =
                tab.id === "all"
                  ? t("common.all", "All")
                  : tab.id === "paid"
                  ? t("status.paid", "Paid")
                  : tab.id === "upcoming"
                  ? t("common.pending_action", "Pending")
                  : translateStatus(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition ${
                    isActive
                      ? "bg-[#0b1c30] text-white shadow-sm"
                      : "text-[#58657a] hover:text-[#0b1c30]"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#dfe7f5] text-[#58657a]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-4 flex items-center justify-center gap-2.5 py-12 text-[13px] text-[#58657a]">
              <span className="material-symbols-outlined animate-spin text-[20px] text-zinc-900 dark:text-zinc-100">
                progress_activity
              </span>
              <span>{t("common.loading", "Loading...")}</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#dfe7f5] p-10 text-center">
              <span className="material-symbols-outlined text-[36px] text-[#a0aec0]">
                receipt_long
              </span>
              <p className="mt-2 text-[13px] font-semibold text-[#58657a]">
                {t("common.no_data", "No transactions found")}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#eef1f8] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    <th className="py-3 pr-3">{t("billing.invoice_no", "Invoice #")}</th>
                    <th className="py-3 pr-3">{t("common.date", "Date")}</th>
                    <th className="py-3 pr-3">{t("common.type", "Service")}</th>
                    <th className="py-3 pr-3">{t("common.amount", "Amount")}</th>
                    <th className="py-3 pr-3">{t("billing.payment_method", "Method")}</th>
                    <th className="py-3 pr-3 whitespace-nowrap">{t("common.status", "Status")}</th>
                    <th className="py-3 pr-3 text-right">{t("common.actions", "Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.paymentId ? `pay-${inv.paymentId}` : (inv.renewalId ? `rnw-${inv.renewalId}` : inv.id)}
                      className="border-b border-[#f2f4fa] transition hover:bg-[#f8faff]"
                    >
                      <td className="py-3.5 pr-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {inv.id}
                      </td>
                      <td className="py-3.5 pr-3 text-[#58657a]">{inv.date}</td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        <div className="font-semibold text-[#0b1c30]">
                          {inv.desc}
                        </div>
                        {inv.status === "upcoming" && inv.remainingSeconds > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-[6px] border border-[#fedf89] bg-[#fffcf5] px-2 py-0.5 text-[11px] font-semibold text-[#b54708]">
                            <span className="material-symbols-outlined text-[13px] text-[#f79009] animate-pulse">
                              timer
                            </span>
                            <span>
                              {Math.floor(inv.remainingSeconds / 60)}:
                              {(inv.remainingSeconds % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 font-bold text-[#0b1c30]">
                        {inv.amount}
                      </td>
                      <td className="py-3.5 pr-3 text-[#58657a]">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#8996a9]">
                            account_balance_wallet
                          </span>
                          {inv.method}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        {inv.status === "paid" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap border border-[#abefc6] bg-[#ecfdf3] px-2.5 py-0.5 text-[11px] font-bold text-[#027a48]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]"></span>
                            {translateStatus(inv.status)}
                          </span>
                        ) : inv.status === "failed" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap border border-[#fecdca] bg-[#fff1f1] px-2.5 py-0.5 text-[11px] font-bold text-[#b3261e]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d92d20]"></span>
                            {translateStatus(inv.status)}
                          </span>
                        ) : inv.status === "expired" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap border border-[#fecdca] bg-[#fff5f5] px-2.5 py-0.5 text-[11px] font-bold text-[#b42318]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d92d20]"></span>
                            {translateStatus(inv.status)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap border border-[#fedf89] bg-[#fffcf5] px-2.5 py-0.5 text-[11px] font-bold text-[#b54708]">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f79009] animate-pulse"></span>
                            {inv.requiresReconciliation ? t("billing.awaiting_reconciliation", "Đã nhận được thanh toán · Đang chờ đối chiếu") : translateStatus(inv.status)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {(inv.canPay || inv.status === "upcoming" || inv.status === "pending") && (
                            <>
                              <button
                                onClick={() =>
                                  navigate("/checkout", {
                                    state: {
                                      reservationId: inv.reservationId,
                                      invoiceId: inv.invoiceId || inv.id || null,
                                      reservationCode: inv.reservationCode,
                                      renewalId: inv.renewalId,
                                      agreementNo: inv.agreementNo,
                                      amount: inv.rawAmount || inv.amount,
                                    },
                                  })
                                }
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] bg-zinc-900 text-white px-3 text-[12px] font-semibold shadow-xs transition hover:bg-[#154ec1] active:scale-[0.98]"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  credit_card
                                </span>
                                {t("billing.pay_now", "Pay Now")}
                              </button>
                              {inv.canCancel && <button
                                type="button"
                                onClick={() => handleCancelInvoice(inv)}
                                disabled={actionLoading === inv.id}
                                className="inline-flex h-8 items-center justify-center gap-1 rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 text-[12px] font-semibold shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                title="Hủy giao dịch chờ thanh toán"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  close
                                </span>
                                {actionLoading === inv.id ? t("common.loading", "...") : t("common.cancel", "Hủy")}
                              </button>}
                            </>
                          )}
                          {inv.reservationId && (
                            <button
                              onClick={() => navigate(`/reservations/${inv.reservationId}`)}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0] active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                visibility
                              </span>
                              {t("common.view_details", "Details")}
                            </button>
                          )}
                          {inv.canCancel && inv.reservationId && inv.status === "paid" && (
                            <button
                              type="button"
                              onClick={() => handleCancelInvoice(inv)}
                              disabled={actionLoading === inv.id}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 text-[12px] font-semibold shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                              title="Hủy đặt chỗ & Yêu cầu hoàn tiền"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                cancel
                              </span>
                              {actionLoading === inv.id ? t("common.loading", "...") : t("common.cancel", "Hủy đặt chỗ")}
                            </button>
                          )}
                          {inv.isRenewal && (inv.status === "expired" || inv.status === "failed") && (
                            <button
                              onClick={() => navigate("/support")}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[12px] font-semibold text-[#3a475a] shadow-xs transition hover:bg-[#f8faff] hover:text-zinc-900 dark:text-zinc-100 hover:border-[#b9ccf0] active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                autorenew
                              </span>
                              {t("my_units.renew", "Renew")}
                            </button>
                          )}
                          {inv.isRenewal && inv.status === "paid" && (
                            <button
                              onClick={() => navigate("/access-control")}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[12px] font-semibold text-[#3a475a] shadow-xs transition hover:bg-[#f8faff] hover:text-zinc-900 dark:text-zinc-100 hover:border-[#b9ccf0] active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                inventory_2
                              </span>
                              {t("nav.my_units", "My Units")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Billing;
