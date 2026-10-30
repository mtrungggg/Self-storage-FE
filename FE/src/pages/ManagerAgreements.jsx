import { useEffect, useState } from "react";
import { X } from "lucide-react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import PAGINATION from "../constants/pagination";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US");
}

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "overdue" || s === "delinquent") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (s === "terminated" || s === "cancelled") return "bg-slate-100 text-slate-700 border border-slate-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function ManagerAgreements() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const page = await managerService.getAgreements(facilityId, {
        status: status || undefined,
        search: search || undefined,
        pageSize: PAGINATION.MAX_PAGE_SIZE,
      });
      setAgreements(page?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load agreements list.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoading(false); } else if (facilityId) { load(); }
  }, [facilityId, status, facilityLoading]);

  async function openDetail(id) {
    setDetailId(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await managerService.getAgreementDetail(id));
    } catch (err) {
      setError(err?.message || "Failed to load agreement details.");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Rental Agreements</h1>
        <p className="text-xs text-slate-500">Monitor active lease agreements, outstanding balances, and customer stored inventory.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-none">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") load(); }}
            onBlur={load}
            placeholder="Search agreement # / customer..."
            className="w-64 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 w-[15%]">Agreement #</th>
                <th className="px-4 py-3 w-[18%]">Customer</th>
                <th className="px-4 py-3 w-[10%]">Unit</th>
                <th className="px-4 py-3 w-[18%]">Term</th>
                <th className="px-4 py-3 w-[13%] text-right">Rent / Mo</th>
                <th className="px-4 py-3 w-[13%] text-right">Balance</th>
                <th className="px-4 py-3 w-[8%] text-center">Status</th>
                <th className="px-4 py-3 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400">Loading agreements...</td>
                </tr>
              ) : agreements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400">No rental agreements found.</td>
                </tr>
              ) : (
                agreements.map((agreement) => (
                  <tr key={agreement.id} className="text-slate-700 transition hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">{agreement.agreementNo}</td>
                    <td className="px-4 py-3">{agreement.customerName}</td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{agreement.unitCode}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatVnd(agreement.monthlyRent)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${agreement.outstandingBalance > 0 ? "text-red-600 font-bold" : "text-slate-500 font-normal"}`}>
                      {formatVnd(agreement.outstandingBalance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${getStatusBadgeClass(agreement.status)}`}>
                        {formatStatusToEnglish(agreement.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(agreement.id)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Agreement Details: {detail?.agreementNo || ""}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Lease term, payment schedule, and customer item inventory.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailId(null);
                  setDetail(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

          {loadingDetail ? (
            <p className="mt-4 text-xs text-slate-400">Loading details...</p>
          ) : detail ? (
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Customer</div>
                  <div className="mt-0.5 font-semibold text-slate-800">{detail.customerName}</div>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Contact</div>
                  <div className="mt-0.5 font-medium text-slate-700">{detail.customerPhone || "—"} / {detail.customerEmail || "—"}</div>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Unit</div>
                  <div className="mt-0.5 font-mono font-bold text-slate-800">{detail.unitCode}</div>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Term</div>
                  <div className="mt-0.5 font-medium text-slate-700">{formatDate(detail.startDate)} → {formatDate(detail.endDate)}</div>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Monthly Rent</div>
                  <div className="mt-0.5 font-semibold text-slate-800">{formatVnd(detail.monthlyRent)}</div>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Outstanding Balance</div>
                  <div className={`mt-0.5 font-bold ${detail.totalDebt > 0 ? "text-red-600 font-bold" : "text-slate-600 font-medium"}`}>
                    {formatVnd(detail.totalDebt)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Invoices & Billing</div>
                <div className="mt-2 space-y-1.5">
                  {(detail.invoices ?? []).length === 0 ? (
                    <p className="text-xs text-slate-400">No invoices recorded.</p>
                  ) : (
                    detail.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                        <span className="font-medium text-slate-700">{invoice.invoiceNo} • Due {formatDate(invoice.dueDate)}</span>
                        <span className="font-semibold text-slate-900">{formatVnd(invoice.paidAmount)} / {formatVnd(invoice.totalAmount)} • <span className="capitalize">{formatStatusToEnglish(invoice.status)}</span></span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Stored Inventory Items</div>
                <div className="mt-2 space-y-1.5">
                  {(detail.storedItems ?? []).length === 0 ? (
                    <p className="text-xs text-slate-400">No stored items declared.</p>
                  ) : (
                    detail.storedItems.map((item) => (
                      <div key={item.id} className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                        <div className="font-semibold text-slate-800">{item.itemName} <span className="font-normal text-slate-500">×{item.quantity}</span></div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{item.category} • Risk Classification: {item.riskClassification || "None"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No data available.</p>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerAgreements;
