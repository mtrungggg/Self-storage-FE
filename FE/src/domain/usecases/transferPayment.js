export const TRANSFER_PAID_STATUSES = ["paid", "approved", "scheduled", "moved_out_in_transit", "completed"];
export const TRANSFER_CLOSED_STATUSES = ["cancelled", "rejected", "cancelled_overdue_move_out"];

export function transferQrUrl(result) {
  if (!result?.paymentQrUrl || !result.paymentContent || result.status !== "pending_payment") return null;
  try {
    const url = new URL(result.paymentQrUrl);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    // Also correct QR URLs returned by an older API while it is being restarted.
    url.searchParams.delete("memo");
    url.searchParams.set("des", result.paymentContent);
    url.searchParams.set("amount", String(result.amountDue ?? result.totalPaidAmount));
    return url.toString();
  } catch {
    return null;
  }
}
