// The unpaid-invoice endpoint owns the current balance. Payment history is a receipt,
// and an old checkout attempt must never make a settled invoice payable again.
export function mergeBillingRows(history, unpaid, now = Date.now()) {
  const rows = new Map();
  const key = (row) => row.invoiceId > 0 ? `invoice-${row.invoiceId}` : row.invoiceNo || `payment-${row.paymentId}`;
  const isPaid = (row) => ["succeeded", "paid", "approved", "refunded", "partially_refunded"].includes(row.status);
  const canCancelReservation = (row) => ["pending", "awaiting_deposit", "confirmed"].includes(row.reservationStatus);
  for (const payment of Array.isArray(history) ? history : []) {
    const row = { ...payment, canPay: false, canCancel: false };
    const expired = row.holdUntil && new Date(row.holdUntil).getTime() <= now;
    if (!isPaid(row) && row.reservationStatus === "cancelled") row.status = "cancelled";
    else if (!isPaid(row) && (row.reservationStatus === "expired" || expired)) row.status = "expired";
    row.canCancel = Boolean(row.reservationId && row.canCancelReservation && canCancelReservation(row) && (isPaid(row) || !expired));
    if (row.renewalId && ["pending", "pending_payment"].includes(row.status)) {
      row.canPay = new Date(row.createdAt).getTime() + 15 * 60 * 1000 > now;
      row.canCancel = row.canPay;
    }
    const existing = rows.get(key(row));
    if (!existing || (isPaid(row) && !isPaid(existing)) ||
        (isPaid(row) === isPaid(existing) && new Date(row.createdAt) > new Date(existing.createdAt))) {
      rows.set(key(row), row);
    }
  }
  for (const invoice of Array.isArray(unpaid) ? unpaid : []) {
    const expired = invoice.holdUntil && new Date(invoice.holdUntil).getTime() <= now;
    if (invoice.reservationId && (!canCancelReservation(invoice) || invoice.reservationStatus === "confirmed" || expired)) continue;
    rows.set(key(invoice), {
      ...rows.get(key(invoice)), ...invoice, paymentId: 0,
      amount: invoice.amountDue, method: "bank_transfer", provider: "SePay",
      canPay: true,
      canCancel: Boolean(
        (invoice.reservationId && canCancelReservation(invoice)) ||
        invoice.renewalId ||
        invoice.transferRequestId ||
        invoice.invoiceId ||
        invoice.id
      ),
    });
  }
  return [...rows.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
