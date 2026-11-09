import test from "node:test";
import assert from "node:assert/strict";
import { transferQrUrl } from "./transferPayment.js";

test("bank QR contains amount and memo through SePay des parameter", () => {
  const url = new URL(transferQrUrl({ status: "pending_payment", totalPaidAmount: 8067, paymentContent: "DH49333", paymentQrUrl: "https://vietqr.app/img?bank=MB&acc=123&memo=old" }));
  assert.equal(url.searchParams.get("des"), "DH49333");
  assert.equal(url.searchParams.get("amount"), "8067");
  assert.equal(url.searchParams.get("memo"), null);
  assert.equal(url.searchParams.get("bank"), "MB");
  assert.equal(url.searchParams.get("acc"), "123");
});

test("partial invoice QR only requests the remaining balance", () => {
  const url = new URL(transferQrUrl({ status: "pending_payment", totalPaidAmount: 8067, amountDue: 7067, paymentContent: "DH49333", paymentQrUrl: "https://vietqr.app/img?bank=MB&acc=123" }));
  assert.equal(url.searchParams.get("amount"), "7067");
});

test("paid, cancelled and incomplete requests do not display a payable QR", () => {
  for (const status of ["paid", "cancelled", "completed"]) {
    assert.equal(transferQrUrl({ status, paymentContent: "DH49333", paymentQrUrl: "https://vietqr.app/img" }), null);
  }
  assert.equal(transferQrUrl({ status: "pending_payment", paymentQrUrl: "https://vietqr.app/img" }), null);
});
