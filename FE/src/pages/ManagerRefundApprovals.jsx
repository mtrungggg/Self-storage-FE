import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

const STATUS_BADGE = {
  pending: "bg-[#fff2d8] text-[#a15c00]",
  approved: "bg-[#e7f8ee] text-[#0e7b4c]",
  rejected: "bg-[#fdecec] text-[#c0362c]",
};

function ManagerRefundApprovals() {
  const { facilityId } = useManagerFacility();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      setRefunds(await managerService.getRefundApprovals(facilityId));
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hoàn tiền.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function decide(id, decision) {
    const draft = drafts[id] || {};
    setDecidingId(id);
    setError("");
    try {
      const result = await managerService.decideRefundApproval(id, {
        decision,
        reason: draft.reason || undefined,
        overrideAmount: draft.overrideAmount ? Number(draft.overrideAmount) : undefined,
      });
      setNotice(decision === "approved" ? `Đã duyệt hoàn ${formatVnd(result?.approvedAmount)}.` : "Đã từ chối yêu cầu hoàn tiền.");
      await load();
    } catch (err) {
      setError(err?.message || "Không thể xử lý yêu cầu hoàn tiền.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Duyệt hoàn tiền đặt cọc</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Xét duyệt hoàn cọc khi khách thuê kết thúc hợp đồng, có thể điều chỉnh số tiền thực tế.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
        ) : refunds.length === 0 ? (
          <p className="text-[11px] text-[#8996a9]">Không có yêu cầu hoàn tiền nào.</p>
        ) : (
          refunds.map((refund) => {
            const draft = drafts[refund.refundId] || {};
            const isPending = refund.status === "pending";
            return (
              <div key={refund.refundId} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-bold">{refund.customerName} {refund.agreementNo && <span className="font-normal text-[#8996a9]">• HĐ {refund.agreementNo}</span>}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[refund.status] || "bg-[#eef4ff] text-[#1d5fe5]"}`}>{refund.status}</span>
                </div>
                <div className="mt-1.5 text-[11px] text-[#3a475a]">{refund.reason}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[8px] border border-[#eef1f8] p-2">
                    <div className="text-[9px] text-[#8996a9]">Cọc gốc</div>
                    <div className="text-[11px] font-bold">{formatVnd(refund.originalDeposit)}</div>
                  </div>
                  <div className="rounded-[8px] border border-[#eef1f8] p-2">
                    <div className="text-[9px] text-[#8996a9]">Khấu trừ ước tính</div>
                    <div className="text-[11px] font-bold text-[#c0362c]">{formatVnd(refund.estimatedDeductions)}</div>
                  </div>
                  <div className="rounded-[8px] border border-[#eef1f8] p-2">
                    <div className="text-[9px] text-[#8996a9]">Đề xuất hoàn</div>
                    <div className="text-[11px] font-bold text-[#0e7b4c]">{formatVnd(refund.recommendedRefundAmount)}</div>
                  </div>
                </div>
                <div className="mt-1 text-[9px] text-[#8996a9]">{formatDateTime(refund.createdAt)}</div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#eef1f8] pt-3">
                    <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Số tiền duyệt khác (nếu có)
                      <input
                        type="number"
                        min="0"
                        value={draft.overrideAmount || ""}
                        onChange={(e) => updateDraft(refund.refundId, "overrideAmount", e.target.value)}
                        className="w-32 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]"
                      />
                    </label>
                    <label className="flex flex-1 min-w-[160px] flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Ghi chú
                      <input
                        value={draft.reason || ""}
                        onChange={(e) => updateDraft(refund.refundId, "reason", e.target.value)}
                        className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]"
                      />
                    </label>
                    <button type="button" disabled={decidingId === refund.refundId} onClick={() => decide(refund.refundId, "approved")} className="rounded-[8px] bg-[#0e7b4c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Duyệt hoàn tiền</button>
                    <button type="button" disabled={decidingId === refund.refundId} onClick={() => decide(refund.refundId, "rejected")} className="rounded-[8px] bg-[#c0362c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Từ chối</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default ManagerRefundApprovals;
