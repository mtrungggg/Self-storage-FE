import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Formats a numeric VND amount, e.g. 900000 -> "900.000 ₫"
export function formatVnd(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Number(amount))} ₫`;
}

export default cn;
