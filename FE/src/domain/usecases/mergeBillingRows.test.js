import test from "node:test";
import assert from "node:assert/strict";
import { mergeBillingRows } from "./mergeBillingRows.js";

const now = Date.parse("2026-11-09T00:00:00Z");
const past = "2026-11-08T00:00:00Z";
const future = "2026-11-09T00:05:00Z";
const receipt = { invoiceId: 1, paymentId: 1, status: "succeeded", amount: 1000, createdAt: past };

test("a newer pending attempt cannot override a settled receipt", () => {
  const [row] = mergeBillingRows([receipt, { ...receipt, paymentId: 2, status: "pending", createdAt: future }], [], now);
  assert.equal(row.status, "succeeded");
  assert.equal(row.canPay, false);
});

test("current invoice balance wins over a previous partial payment", () => {
  const [row] = mergeBillingRows([receipt], [{ invoiceId: 1, status: "partially_paid", amountDue: 500, createdAt: past }], now);
  assert.equal(row.amount, 500);
  assert.equal(row.canPay, true);
});

test("cancelled and expired bookings cannot be paid", () => {
  for (const reservationStatus of ["cancelled", "expired", "converted"]) {
    const rows = mergeBillingRows([], [{ invoiceId: 1, reservationId: 1, reservationStatus, holdUntil: future }], now);
    assert.equal(rows.length, 0);
  }
  const [expired] = mergeBillingRows([{ ...receipt, status: "pending", holdUntil: past }], [], now);
  assert.equal(expired.status, "expired");
  assert.equal(expired.canPay, false);
});

test("hold expiry uses reservation deadline rather than old payment attempt time", () => {
  const [row] = mergeBillingRows([], [{ invoiceId: 1, reservationId: 1, reservationStatus: "pending", status: "open", createdAt: past, holdUntil: future }], now);
  assert.equal(row.canPay, true);
  assert.equal(row.canCancel, true);
});

test("paid history remains visible but cancellation requires current server eligibility", () => {
  const [converted] = mergeBillingRows([{ ...receipt, reservationId: 1, reservationStatus: "converted" }], [], now);
  assert.equal(converted.canCancel, false);
  const [confirmed] = mergeBillingRows([{ ...receipt, reservationId: 1, reservationStatus: "confirmed", canCancelReservation: true, holdUntil: past }], [], now);
  assert.equal(confirmed.status, "succeeded");
  assert.equal(confirmed.canCancel, true);
  assert.equal(mergeBillingRows([{ ...receipt, reservationId: 1, reservationStatus: "confirmed", canCancelReservation: false }], [], now)[0].canCancel, false);
});
