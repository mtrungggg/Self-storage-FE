import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

const STATUS_BADGE = {
  pending: "bg-[#fff2d8] text-[#a15c00]",
  pending_payment: "bg-[#fff2d8] text-[#a15c00]",
  paid: "bg-[#eef4ff] text-[#1d5fe5]",
  moved_out_in_transit: "bg-[#f3e8ff] text-[#7e22ce]",
  cancelled_overdue_move_out: "bg-[#fdecec] text-[#c0362c]",
  approved: "bg-[#e7f8ee] text-[#0e7b4c]",
  rejected: "bg-[#fdecec] text-[#c0362c]",
};

function ManagerTransferRequests() {
  const { facilityId } = useManagerFacility();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      setRequests(await managerService.getTransferRequests(facilityId));
    } catch (err) {
      setError(err?.message || "Không thể tải yêu cầu chuyển ô.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId]);

  return (
    <>
      <h1 className="text-[20px] font-bold">Yêu cầu chuyển ô kho</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Theo dõi yêu cầu chuyển kho tại cơ sở nguồn hoặc cơ sở đích.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
        ) : requests.length === 0 ? (
          <p className="text-[11px] text-[#8996a9]">Không có yêu cầu nào.</p>
        ) : (
          requests.map((request) => {
            return (
              <div key={request.id} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-bold">{request.customerName} <span className="font-normal text-[#8996a9]">• {request.customerPhone}</span></div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[request.status] || "bg-[#eef4ff] text-[#1d5fe5]"}`}>{request.status}</span>
                </div>
                <div className="mt-1.5 text-[11px] text-[#3a475a]">
                  Hợp đồng <strong>{request.agreementNo}</strong> — từ ô <strong>{request.fromUnitCode}</strong> sang loại <strong>{request.requestedUnitTypeName}</strong>
                  {request.toUnitCode ? <> (ô đề xuất: <strong>{request.toUnitCode}</strong>)</> : null}
                </div>
                <div className="mt-2 grid gap-1 rounded-lg bg-[#f8faff] p-2 text-[10px] text-[#58657a] sm:grid-cols-2">
                  <span>Cơ sở đích: <strong className="text-[#0b1c30]">#{request.requestedFacilityId}</strong></span>
                  <span>Đổi lịch: <strong className="text-[#0b1c30]">{request.rescheduleCount || 0}/2</strong></span>
                  <span>Dọn kho nguồn: <strong className="text-[#0b1c30]">{formatDate(request.moveOutDate || request.requestedEffectiveDate)}</strong></span>
                  <span>Nhận kho đích: <strong className="text-[#0b1c30]">{formatDate(request.moveInDate || request.requestedEffectiveDate)}</strong></span>
                  <span>Chênh thuê: <strong className="text-[#0b1c30]">{Number(request.diffRentAmount || 0).toLocaleString("vi-VN")} ₫</strong></span>
                  <span>Chênh cọc: <strong className="text-[#0b1c30]">{Number(request.diffDepositAmount || 0).toLocaleString("vi-VN")} ₫</strong></span>
                  <span className="sm:col-span-2">Cần thanh toán: <strong className="text-[#1d5fe5]">{Number(request.totalPaidAmount || 0).toLocaleString("vi-VN")} ₫</strong></span>
                </div>
                <div className="mt-1 text-[10px] text-[#8996a9]">Lý do: {request.reason || "—"}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default ManagerTransferRequests;
