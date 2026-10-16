// Data layer: content source for the Billing page.
export function getInvoiceTabs() {
  return [
    { id: "all", label: "All" },
    { id: "paid", label: "Paid" },
    { id: "upcoming", label: "Pending" },
    { id: "expired", label: "Expired & Cancelled" },
  ];
}
