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
  approved: "bg-[#e7f8ee] text-[#0e7b4c]",
  rejected: "bg-[#fdecec] text-[#c0362c]",
};

function ManagerTransferRequests() {
  const { facilityId } = useManagerFacility();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [decisionDrafts, setDecisionDrafts] = useState({});

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

  function updateDraft(id, field, value) {
    setDecisionDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function decide(id, decision) {
    const draft = decisionDrafts[id] || {};
    setDecidingId(id);
    setError("");
    try {
      await managerService.decideTransferRequest(id, {
        decision,
        targetUnitId: draft.targetUnitId ? Number(draft.targetUnitId) : undefined,
        reviewNotes: draft.reviewNotes || undefined,
      });
      setNotice(decision === "approved" ? "Đã duyệt yêu cầu chuyển ô." : "Đã từ chối yêu cầu chuyển ô.");
      await load();
    } catch (err) {
      setError(err?.message || "Không thể xử lý yêu cầu.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Yêu cầu chuyển ô kho</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Duyệt hoặc từ chối yêu cầu chuyển sang ô kho khác của khách thuê.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
        ) : requests.length === 0 ? (
          <p className="text-[11px] text-[#8996a9]">Không có yêu cầu nào.</p>
        ) : (
          requests.map((request) => {
            const draft = decisionDrafts[request.id] || {};
            const isPending = request.status === "pending";
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
                <div className="mt-1 text-[10px] text-[#8996a9]">Lý do: {request.reason || "—"} • Ngày mong muốn: {formatDate(request.requestedEffectiveDate)}</div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#eef1f8] pt-3">
                    <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Ô kho mục tiêu (nếu duyệt)
                      <input
                        type="number"
                        value={draft.targetUnitId || ""}
                        onChange={(e) => updateDraft(request.id, "targetUnitId", e.target.value)}
                        className="w-28 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]"
                      />
                    </label>
                    <label className="flex flex-1 min-w-[160px] flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Ghi chú
                      <input
                        value={draft.reviewNotes || ""}
                        onChange={(e) => updateDraft(request.id, "reviewNotes", e.target.value)}
                        className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]"
                      />
                    </label>
                    <button type="button" disabled={decidingId === request.id} onClick={() => decide(request.id, "approved")} className="rounded-[8px] bg-[#0e7b4c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Duyệt</button>
                    <button type="button" disabled={decidingId === request.id} onClick={() => decide(request.id, "rejected")} className="rounded-[8px] bg-[#c0362c] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">Từ chối</button>
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

export default ManagerTransferRequests;
