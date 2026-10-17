import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function ManagerAgreements() {
  const { facilityId } = useManagerFacility();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      const page = await managerService.getAgreements(facilityId, {
        status: status || undefined,
        search: search || undefined,
        pageSize: 100,
      });
      setAgreements(page?.items ?? []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId, status]);

  async function openDetail(id) {
    setDetailId(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await managerService.getAgreementDetail(id));
    } catch (err) {
      setError(err?.message || "Không thể tải chi tiết hợp đồng.");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Hợp đồng thuê kho</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Theo dõi hợp đồng, công nợ và chi tiết tài sản gửi kho của khách thuê.</p>

      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onBlur={load} placeholder="Tìm mã HĐ / khách hàng..." className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="overdue">Quá hạn</option>
            <option value="terminated">Đã kết thúc</option>
          </select>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Mã HĐ</th>
                <th className="py-2 pr-2">Khách hàng</th>
                <th className="py-2 pr-2">Ô kho</th>
                <th className="py-2 pr-2">Thời hạn</th>
                <th className="py-2 pr-2 text-right">Tiền thuê/tháng</th>
                <th className="py-2 pr-2 text-right">Công nợ</th>
                <th className="py-2 pr-2">Trạng thái</th>
                <th className="py-2 pr-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-4 text-center text-[#8996a9]">Đang tải...</td></tr>
              ) : agreements.length === 0 ? (
                <tr><td colSpan={8} className="py-4 text-center text-[#8996a9]">Không có hợp đồng nào.</td></tr>
              ) : (
                agreements.map((agreement) => (
                  <tr key={agreement.id} className="border-b border-[#f2f5fb]">
                    <td className="py-2.5 pr-2 font-semibold">{agreement.agreementNo}</td>
                    <td className="py-2.5 pr-2">{agreement.customerName}</td>
                    <td className="py-2.5 pr-2 text-[#58657a]">{agreement.unitCode}</td>
                    <td className="py-2.5 pr-2 text-[#58657a]">{formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}</td>
                    <td className="py-2.5 pr-2 text-right">{formatVnd(agreement.monthlyRent)}</td>
                    <td className={`py-2.5 pr-2 text-right font-semibold ${agreement.outstandingBalance > 0 ? "text-[#c0362c]" : "text-[#0e7b4c]"}`}>{formatVnd(agreement.outstandingBalance)}</td>
                    <td className="py-2.5 pr-2">{agreement.status}</td>
                    <td className="py-2.5 pr-2 text-right">
                      <button type="button" onClick={() => openDetail(agreement.id)} className="rounded-[6px] bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold text-[#1d5fe5]">Xem chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailId && (
        <dialog open className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-xl backdrop:bg-black/40">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold">Chi tiết hợp đồng {detail?.agreementNo || ""}</h2>
            <button type="button" onClick={() => setDetailId(null)} className="text-[11px] font-semibold text-[#58657a] underline">Đóng</button>
          </div>

          {loadingDetail ? (
            <p className="mt-4 text-[11px] text-[#8996a9]">Đang tải...</p>
          ) : detail ? (
            <div className="mt-4 space-y-4 text-[11px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div><div className="text-[9px] text-[#8996a9]">Khách hàng</div><div className="font-semibold">{detail.customerName}</div></div>
                <div><div className="text-[9px] text-[#8996a9]">Liên hệ</div><div className="font-semibold">{detail.customerPhone} / {detail.customerEmail}</div></div>
                <div><div className="text-[9px] text-[#8996a9]">Ô kho</div><div className="font-semibold">{detail.unitCode}</div></div>
                <div><div className="text-[9px] text-[#8996a9]">Thời hạn</div><div className="font-semibold">{formatDate(detail.startDate)} → {formatDate(detail.endDate)}</div></div>
                <div><div className="text-[9px] text-[#8996a9]">Tiền thuê/tháng</div><div className="font-semibold">{formatVnd(detail.monthlyRent)}</div></div>
                <div><div className="text-[9px] text-[#8996a9]">Tổng công nợ</div><div className="font-bold text-[#c0362c]">{formatVnd(detail.totalDebt)}</div></div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Hoá đơn</div>
                <div className="mt-1.5 space-y-1.5">
                  {(detail.invoices ?? []).length === 0 ? (
                    <p className="text-[#8996a9]">Không có hoá đơn.</p>
                  ) : (
                    detail.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between rounded-[8px] border border-[#eef1f8] p-2">
                        <span>{invoice.invoiceNo} • hạn {formatDate(invoice.dueDate)}</span>
                        <span className="font-semibold">{formatVnd(invoice.paidAmount)} / {formatVnd(invoice.totalAmount)} • {invoice.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Tài sản gửi kho</div>
                <div className="mt-1.5 space-y-1.5">
                  {(detail.storedItems ?? []).length === 0 ? (
                    <p className="text-[#8996a9]">Chưa khai báo tài sản.</p>
                  ) : (
                    detail.storedItems.map((item) => (
                      <div key={item.id} className="rounded-[8px] border border-[#eef1f8] p-2">
                        <div className="font-semibold">{item.itemName} <span className="font-normal text-[#8996a9]">x{item.quantity}</span></div>
                        <div className="text-[9px] text-[#8996a9]">{item.category} • Rủi ro: {item.riskClassification || "—"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[11px] text-[#8996a9]">Không có dữ liệu.</p>
          )}
        </dialog>
      )}
    </>
  );
}

export default ManagerAgreements;
