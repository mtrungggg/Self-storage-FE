// Pure filtering rule for the billing invoice list (domain layer).
export function filterInvoices(invoices, { tab, search }) {
  return invoices.filter((invoice) => {
    let matchesTab = tab === "all";
    if (tab === "paid") {
      matchesTab = invoice.status === "paid";
    } else if (tab === "upcoming") {
      matchesTab = invoice.status === "upcoming";
    } else if (tab === "expired") {
      matchesTab = invoice.status === "expired" || invoice.status === "failed";
    } else if (tab !== "all") {
      matchesTab = invoice.status === tab;
    }

    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (invoice.id && invoice.id.toLowerCase().includes(query)) ||
      (invoice.desc && invoice.desc.toLowerCase().includes(query)) ||
      (invoice.statusLabel && invoice.statusLabel.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });
}

