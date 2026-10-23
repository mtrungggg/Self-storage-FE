import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import facilityService from "../api/facilityService";

const statusOptions = [
  ["active", "Đang hiệu lực"],
  ["overdue", "Quá hạn"],
  ["defaulted", "Vỡ nợ"],
  ["terminated", "Đã chấm dứt"],
  ["completed", "Đã hoàn tất"],
];
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const labelFor = (value) => statusOptions.find(([key]) => key === value)?.[1] || value || "—";
const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

export default function AdminContractsCustomers() {
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState("");
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    facilityService.getFacilities().then((list) => {
      setFacilities(list);
      if (list.length > 0) setFacilityId(String(list[0].id));
    }).catch(() => setFacilities([]));
  }, []);

  function reload() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    managerService.getAgreements(facilityId, { ...filters, pageSize: 50 }).then(
      (data) => { setResult(data); setLoading(false); },
      (err) => { setError(err.message || "Không thể tải danh sách hợp đồng."); setLoading(false); },
    );
  }

  useEffect(reload, [facilityId]);

  function applyFilters(event) {
    event.preventDefault();
    reload();
  }

  async function viewDetail(agreementId) {
    setDetail({ id: agreementId });
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await managerService.getAgreementDetail(agreementId);
      setDetail(data);
    } catch (err) {
      setDetailError(err.message || "Không thể tải chi tiết hợp đồng.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">description</span>
            Hợp đồng &amp; Khách hàng
          </h1>
        </div>
        <button type="button" disabled={loading || !facilityId} onClick={reload} className={buttonClass}>Làm mới</button>
      </div>

      <form onSubmit={applyFilters} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label><span className="mb-1 block text-sm font-semibold">Kho *</span>
            <select required value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={inputClass}>
              {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Trạng thái</span>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}>
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold">Tìm kiếm</span>
            <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Mã hợp đồng, tên khách hàng, mã ô kho..." className={inputClass} />
          </label>
        </div>
        <button type="submit" className={`mt-4 ${buttonClass}`}>Áp dụng</button>
      </form>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách hợp đồng{result ? ` (${result.totalCount})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải danh sách...</p>}
        {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p><button type="button" onClick={reload} className="mt-2 font-semibold underline">Thử lại</button>
        </div>}
        {result && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Mã hợp đồng", "Khách hàng", "Ô kho", "Bắt đầu", "Kết thúc", "Giá thuê/tháng", "Công nợ", "Trạng thái", "Thao tác"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {result.items.map((agreement) => (
                  <tr key={agreement.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{agreement.agreementNo}</td>
                    <td className="p-3">{agreement.customerName}<div className="text-xs text-[#8996a9]">{agreement.customerEmail}</div></td>
                    <td className="p-3">{agreement.unitCode}</td>
                    <td className="p-3">{agreement.startDate}</td>
                    <td className="p-3">{agreement.endDate}</td>
                    <td className="p-3">{formatVnd(agreement.monthlyRent)}</td>
                    <td className="p-3">{agreement.outstandingBalance > 0 ? <span className="font-semibold text-red-600">{formatVnd(agreement.outstandingBalance)}</span> : "—"}</td>
                    <td className="p-3">{labelFor(agreement.status)}</td>
                    <td className="p-3 text-right"><button type="button" onClick={() => viewDetail(agreement.id)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5]">Chi tiết</button></td>
                  </tr>
                ))}
                {result.items.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-[#58657a]">Không có hợp đồng phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Chi tiết hợp đồng {detail.agreementNo || ""}</h3>
              <button type="button" onClick={() => setDetail(null)} className="text-[#58657a]">✕</button>
            </div>
            {detailLoading && <p className="mt-4 text-sm text-[#58657a]">Đang tải...</p>}
            {detailError && <p role="alert" className="mt-4 text-sm text-red-600">{detailError}</p>}
            {!detailLoading && !detailError && detail.customerName && (
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text-xs text-[#8996a9]">Khách hàng</div><div className="font-semibold">{detail.customerName}</div></div>
                  <div><div className="text-xs text-[#8996a9]">Email / SĐT</div><div className="font-semibold">{detail.customerEmail} {detail.customerPhone ? `· ${detail.customerPhone}` : ""}</div></div>
                  <div><div className="text-xs text-[#8996a9]">Ô kho</div><div className="font-semibold">{detail.unitCode}</div></div>
                  <div><div className="text-xs text-[#8996a9]">Trạng thái</div><div className="font-semibold">{labelFor(detail.status)}</div></div>
                  <div><div className="text-xs text-[#8996a9]">Giá thuê/tháng</div><div className="font-semibold">{formatVnd(detail.monthlyRent)}</div></div>
                  <div><div className="text-xs text-[#8996a9]">Tổng công nợ</div><div className="font-semibold text-red-600">{formatVnd(detail.totalDebt)}</div></div>
                </div>
                <div>
                  <h4 className="font-bold">Hóa đơn ({detail.invoices?.length || 0})</h4>
                  <ul className="mt-2 space-y-1.5">
                    {(detail.invoices || []).map((inv) => (
                      <li key={inv.id} className="flex justify-between rounded-lg border border-[#eef1f8] p-2">
                        <span>{inv.invoiceNo} · hạn {inv.dueDate}</span>
                        <span className="font-semibold">{formatVnd(inv.paidAmount)}/{formatVnd(inv.totalAmount)} · {inv.status}</span>
                      </li>
                    ))}
                    {(!detail.invoices || detail.invoices.length === 0) && <li className="text-[#8996a9]">Không có hóa đơn.</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold">Đồ lưu trữ ({detail.storedItems?.length || 0})</h4>
                  <ul className="mt-2 space-y-1.5">
                    {(detail.storedItems || []).map((item) => (
                      <li key={item.id} className="rounded-lg border border-[#eef1f8] p-2">{item.description || item.name || "Mục đồ"}</li>
                    ))}
                    {(!detail.storedItems || detail.storedItems.length === 0) && <li className="text-[#8996a9]">Chưa khai báo đồ lưu trữ.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
