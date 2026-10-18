/**
 * Canonical payment constants aligned with Backend PaymentConstants and SePay checkout flows.
 */

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  PARTIALLY_REFUNDED: "partially_refunded",
  REFUNDED: "refunded",
};

export const CHECKOUT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  EXPIRED: "expired",
  FAILED: "failed",
};

export const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  CREDIT_CARD: "credit_card",
  CASH: "cash",
};
