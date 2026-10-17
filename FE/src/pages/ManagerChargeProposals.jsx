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

function ManagerChargeProposals() {
  const { facilityId } = useManagerFacility();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [reasonDrafts, setReasonDrafts] = useState({});

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      setProposals(await managerService.getChargeProposals(facilityId));
    } catch (err) {
      setError(err?.message || "Không thể tải đề xuất phụ phí.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId]);

  async function decide(id, decision) {
    setDecidingId(id);
    setError("");
    try {
      const result = await managerService.decideChargeProposal(id, { decision, reason: reasonDrafts[id] || undefined });
      setNotice(
        decision === "approved"
          ? `Đã duyệt phụ phí${result?.generatedInvoiceNo ? ` — đã tạo hoá đơn ${result.generatedInvoiceNo}` : ""}.`
          : "Đã từ chối đề xuất phụ phí."
      );
      await load();
    } catch (err) {
      setError(err?.message || "Không thể xử lý đề xuất.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Duyệt đề xuất phụ phí</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Xét duyệt các khoản phụ phí nhân viên đề xuất trong quá trình xử lý ticket hỗ trợ.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
        ) : proposals.length === 0 ? (
          <p className="text-[11px] text-[#8996a9]">Không có đề xuất nào.</p>
        ) : (
          proposals.map((proposal) => {
            const isPending = proposal.status === "pending";
            return (
              <div key={proposal.id} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-bold">{proposal.customerName} {proposal.agreementNo && <span className="font-normal text-[#8996a9]">• HĐ {proposal.agreementNo}</span>}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[proposal.status] || "bg-[#eef4ff] text-[#1d5fe5]"}`}>{proposal.status}</span>
                </div>
                <div className="mt-1.5 text-[11px] text-[#3a475a]">{proposal.description}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[#8996a9]">
                  <span>Ticket: {proposal.ticketTitle}</span>
                  <span>Đề xuất bởi: {proposal.proposedByStaffName}</span>
                  <span>{formatDateTime(proposal.createdAt)}</span>
                </div>
                <div className="mt-1.5 text-[14px] font-bold text-[#1d5fe5]">{formatVnd(proposal.amount)}</div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#eef1f8] pt-3">
                    <label className="flex flex-1 min-w-[160px] flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Ghi chú quyết định
                      <input
                        value={reasonDrafts[proposal.id] || ""}
                        onChange={(e) => setReasonDrafts((prev) => ({ ...prev, [proposal.id]: e.target.value }))}
                        className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]"
                      />
                    </label>
                    <button type="button" disabled={decidingId === proposal.id} onClick={() => decide(proposal.id, "approved")} className="rounded-[8px] bg-[#0e7b4c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Duyệt &amp; Xuất hoá đơn</button>
                    <button type="button" disabled={decidingId === proposal.id} onClick={() => decide(proposal.id, "rejected")} className="rounded-[8px] bg-[#c0362c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Từ chối</button>
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

export default ManagerChargeProposals;
