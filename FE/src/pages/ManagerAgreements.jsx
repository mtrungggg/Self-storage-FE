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
  const { facilityId, activeFacility } = useManagerFacility();
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
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await managerService.getAgreements(facilityId, {
        status: status || undefined,
        search: search ? search.trim() : undefined,
        pageSize: 100,
      });
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setAgreements(items);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [facilityId, status]);

  async function openDetail(id) {
    setDetailId(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const res = await managerService.getAgreementDetail(id);
      const data = res?.data ?? res ?? null;
      setDetail(data);
    } catch (err) {
      setError(err?.message || "Không thể tải chi tiết hợp đồng.");
    } finally {
      setLoadingDetail(false);
    }
  }

  const totalAgreements = agreements.length;
  const activeAgreements = agreements.filter((a) => (a.status || "").toLowerCase() === "active").length;
  const totalMonthlyRevenue = agreements
    .filter((a) => (a.status || "").toLowerCase() === "active")
    .reduce((sum, a) => sum + (Number(a.monthlyRent) || 0), 0);
  const totalOutstandingDebt = agreements.reduce(
    (sum, a) => sum + (Number(a.outstandingBalance) || 0),
    0
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">Hợp đồng thuê &amp; Doanh thu</h1>
          <p className="mt-1 text-[11px] text-[#8996a9]">
            Quản lý toàn bộ hợp đồng thuê kho, dòng tiền định kỳ và công nợ {activeFacility ? `— ${activeFacility.name}` : ""}.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">
          {error}
        </p>
      )}

      {/* KPI Cards: Revenue & Contract Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Doanh thu tháng (MRR)</div>
          <div className="mt-1 text-[18px] font-bold text-[#0e7b4c]">{formatVnd(totalMonthlyRevenue)}</div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">Từ hợp đồng đang thuê</div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Tổng số hợp đồng</div>
          <div className="mt-1 text-[18px] font-bold text-[#1d5fe5]">{totalAgreements}</div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">{activeAgreements} đang có hiệu lực</div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Hợp đồng hiệu lực</div>
          <div className="mt-1 text-[18px] font-bold text-[#0e7b4c]">{activeAgreements}</div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">Đang sử dụng kho</div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Công nợ chưa thu</div>
          <div className={`mt-1 text-[18px] font-bold ${totalOutstandingDebt > 0 ? "text-[#c0362c]" : "text-[#58657a]"}`}>
            {formatVnd(totalOutstandingDebt)}
          </div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">Cần theo dõi thu tiền</div>
        </div>
      </div>

      <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã HĐ / khách hàng / số điện thoại..."
            className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px] focus:border-[#1d5fe5] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-[8px] bg-[#eef4ff] px-3 py-1.5 text-[11px] font-bold text-[#1d5fe5] hover:bg-[#dfeafc]"
          >
            Tìm kiếm
          </button>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực (active)</option>
            <option value="overdue">Quá hạn (overdue)</option>
            <option value="terminated">Đã kết thúc (terminated)</option>
          </select>
          {(search || status) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
              }}
              className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[10px] text-[#58657a] hover:bg-[#f8fafd]"
            >
              Đặt lại
            </button>
          )}
        </form>

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
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#8996a9]">
                    Đang tải danh sách hợp đồng...
                  </td>
                </tr>
              ) : agreements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#8996a9]">
                    Không có hợp đồng nào phù hợp tại cơ sở kho đang chọn.
                  </td>
                </tr>
              ) : (
                agreements.map((agreement) => (
                  <tr key={agreement.id} className="border-b border-[#f2f5fb] transition hover:bg-[#fafcff]">
                    <td className="py-2.5 pr-2 font-semibold text-[#1d5fe5]">{agreement.agreementNo}</td>
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold">{agreement.customerName}</div>
                      <div className="text-[10px] text-[#8996a9]">
                        {agreement.customerPhone || agreement.customerEmail || "—"}
                      </div>
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className="rounded bg-[#f2f5fb] px-1.5 py-0.5 font-bold text-[#3a475a]">
                        {agreement.unitCode || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-[#58657a]">
                      {formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}
                    </td>
                    <td className="py-2.5 pr-2 text-right font-semibold">{formatVnd(agreement.monthlyRent)}</td>
                    <td
                      className={`py-2.5 pr-2 text-right font-semibold ${
                        agreement.outstandingBalance > 0 ? "text-[#c0362c]" : "text-[#0e7b4c]"
                      }`}
                    >
                      {formatVnd(agreement.outstandingBalance)}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          (agreement.status || "").toLowerCase() === "active"
                            ? "bg-[#e7f8ee] text-[#0e7b4c]"
                            : (agreement.status || "").toLowerCase() === "overdue"
                            ? "bg-[#fdecec] text-[#c0362c]"
                            : "bg-[#f0f3f8] text-[#58657a]"
                        }`}
                      >
                        {agreement.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(agreement.id)}
                        className="rounded-[6px] bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold text-[#1d5fe5] hover:bg-[#dfeafc]"
                      >
                        Xem chi tiết
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
        <dialog
          open
          className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-xl backdrop:bg-black/40"
        >
          <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
            <div>
              <h2 className="text-[14px] font-bold">Chi tiết hợp đồng {detail?.agreementNo || ""}</h2>
              <span className="text-[10px] text-[#8996a9]">ID: {detailId}</span>
            </div>
            <button
              type="button"
              onClick={() => setDetailId(null)}
              className="rounded-[6px] bg-[#f0f3f8] px-2.5 py-1 text-[11px] font-semibold text-[#58657a] hover:bg-[#e2e7f0]"
            >
              Đóng
            </button>
          </div>

          {loadingDetail ? (
            <p className="mt-4 text-[11px] text-[#8996a9]">Đang tải chi tiết...</p>
          ) : detail ? (
            <div className="mt-4 space-y-4 text-[11px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Khách hàng</div>
                  <div className="font-semibold">{detail.customerName}</div>
                </div>
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Liên hệ</div>
                  <div className="font-semibold">{detail.customerPhone || detail.customerEmail || "—"}</div>
                </div>
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Ô kho</div>
                  <div className="font-semibold">{detail.unitCode}</div>
                </div>
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Thời hạn</div>
                  <div className="font-semibold">
                    {formatDate(detail.startDate)} → {formatDate(detail.endDate)}
                  </div>
                </div>
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Tiền thuê/tháng</div>
                  <div className="font-semibold text-[#0e7b4c]">{formatVnd(detail.monthlyRent)}</div>
                </div>
                <div className="rounded-[8px] bg-[#f8fafd] p-2.5">
                  <div className="text-[9px] text-[#8996a9]">Tổng công nợ</div>
                  <div className={`font-bold ${detail.totalDebt > 0 ? "text-[#c0362c]" : "text-[#0e7b4c]"}`}>
                    {formatVnd(detail.totalDebt)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Lịch sử Hoá đơn</div>
                <div className="mt-1.5 space-y-1.5">
                  {(detail.invoices ?? []).length === 0 ? (
                    <p className="text-[#8996a9]">Không có hoá đơn nào.</p>
                  ) : (
                    detail.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between rounded-[8px] border border-[#eef1f8] p-2"
                      >
                        <span>
                          <strong>{invoice.invoiceNo}</strong> • Hạn: {formatDate(invoice.dueDate)}
                        </span>
                        <span className="font-semibold">
                          Đã trả: {formatVnd(invoice.paidAmount)} / Tổng: {formatVnd(invoice.totalAmount)} •{" "}
                          <span className="uppercase text-[#1d5fe5]">{invoice.status}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Tài sản gửi kho</div>
                <div className="mt-1.5 space-y-1.5">
                  {(detail.storedItems ?? []).length === 0 ? (
                    <p className="text-[#8996a9]">Chưa khai báo tài sản gửi kho.</p>
                  ) : (
                    detail.storedItems.map((item) => (
                      <div key={item.id} className="rounded-[8px] border border-[#eef1f8] p-2">
                        <div className="font-semibold">
                          {item.itemName} <span className="font-normal text-[#8996a9]">x{item.quantity}</span>
                        </div>
                        <div className="text-[9px] text-[#8996a9]">
                          {item.category} • Rủi ro: {item.riskClassification || "Không có"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[11px] text-[#8996a9]">Không có dữ liệu chi tiết.</p>
          )}
        </dialog>
      )}
    </>
  );
}

export default ManagerAgreements;
