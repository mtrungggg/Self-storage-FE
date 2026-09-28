// Pure filtering rule for the billing invoice list (domain layer).
export function filterInvoices(invoices, { tab, search }) {
  return invoices.filter((invoice) => {
    const matchesTab = tab === "all" || invoice.status === tab;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      invoice.id.toLowerCase().includes(query) ||
      invoice.desc.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });
}
