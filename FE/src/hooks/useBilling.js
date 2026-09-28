import { useMemo, useState } from "react";
import { getInvoices, getInvoiceTabs, getBillingTrustBadges } from "../data/billingRepository";
import { filterInvoices } from "../domain/usecases/filterInvoices";

// Application layer: encapsulates Billing page state, filtering and data wiring.
export function useBilling() {
  const invoices = getInvoices();
  const invoiceTabs = getInvoiceTabs();
  const trustBadges = getBillingTrustBadges();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(true);

  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, { tab: activeTab, search }),
    [invoices, activeTab, search]
  );

  return {
    invoiceTabs,
    trustBadges,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    autoInvoice,
    setAutoInvoice,
    filteredInvoices,
  };
}
