import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

const ACTION_TYPES = [
  ["reminder_call", "Gọi nhắc nợ"],
  ["warning_letter", "Gửi thư cảnh báo"],
  ["payment_plan", "Lập kế hoạch trả nợ"],
  ["lock_access", "Khoá quyền truy cập ô kho"],
  ["escalate", "Chuyển xử lý pháp lý"],
];

const STATUS_BADGE = {
  open: "bg-[#fff2d8] text-[#a15c00]",
  resolved: "bg-[#e7f8ee] text-[#0e7b4c]",
  escalated: "bg-[#fdecec] text-[#c0362c]",
};

function ManagerDelinquentCases() {
  const { facilityId } = useManagerFacility();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      setCases(await managerService.getDelinquentCases(facilityId));
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách nợ quá hạn.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function submitAction(id) {
    const draft = drafts[id] || {};
    if (!draft.actionType) {
      setError("Vui lòng chọn loại hành động.");
      return;
    }
    setSubmittingId(id);
    setError("");
    try {
      await managerService.createDelinquentCaseAction(id, {
        actionType: draft.actionType,
        note: draft.note || undefined,
        updateCaseStatus: draft.updateCaseStatus || undefined,
      });
      setNotice("Đã ghi nhận hành động xử lý nợ.");
      setDrafts((prev) => ({ ...prev, [id]: {} }));
      await load();
    } catch (err) {
      setError(err?.message || "Không thể ghi nhận hành động.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Xử lý nợ quá hạn</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Theo dõi hồ sơ nợ quá hạn và ghi nhận các hành động xử lý.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
        ) : cases.length === 0 ? (
          <p className="text-[11px] text-[#8996a9]">Không có hồ sơ nợ quá hạn nào.</p>
        ) : (
          cases.map((item) => {
            const draft = drafts[item.id] || {};
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] font-bold">{item.customerName} <span className="font-normal text-[#8996a9]">• HĐ {item.agreementNo} • Ô {item.unitCode}</span></div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[item.status] || "bg-[#eef4ff] text-[#1d5fe5]"}`}>{item.status}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-[#8996a9]">
                  <span>Quá hạn: <strong className="text-[#c0362c]">{item.overdueDays} ngày</strong></span>
                  <span>Công nợ hiện tại: <strong>{formatVnd(item.currentDebt)}</strong></span>
                  <span>Hết hạn ân hạn: {formatDateTime(item.graceEndsAt)}</span>
                </div>

                <button type="button" onClick={() => setExpandedId(expanded ? null : item.id)} className="mt-2 text-[10px] font-semibold text-[#1d5fe5] underline">
                  {expanded ? "Ẩn lịch sử xử lý" : `Xem lịch sử xử lý (${item.actions?.length ?? 0})`}
                </button>

                {expanded && (
                  <div className="mt-2 space-y-1.5 border-t border-[#eef1f8] pt-2">
                    {(item.actions ?? []).length === 0 ? (
                      <p className="text-[10px] text-[#8996a9]">Chưa có hành động nào được ghi nhận.</p>
                    ) : (
                      item.actions.map((action) => (
                        <div key={action.id} className="rounded-[8px] bg-[#f8faff] p-2 text-[10px]">
                          <span className="font-semibold">{ACTION_TYPES.find(([value]) => value === action.actionType)?.[1] || action.actionType}</span>
                          {" "}bởi {action.performedByName || "Hệ thống"} lúc {formatDateTime(action.occurredAt)}
                          {action.details && <div className="text-[#8996a9]">{action.details}</div>}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {item.status !== "resolved" && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#eef1f8] pt-3">
                    <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Hành động *
                      <select value={draft.actionType || ""} onChange={(e) => updateDraft(item.id, "actionType", e.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]">
                        <option value="" disabled>Chọn hành động</option>
                        {ACTION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-1 min-w-[160px] flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Ghi chú
                      <input value={draft.note || ""} onChange={(e) => updateDraft(item.id, "note", e.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]" />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
                      Cập nhật trạng thái hồ sơ
                      <select value={draft.updateCaseStatus || ""} onChange={(e) => updateDraft(item.id, "updateCaseStatus", e.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]">
                        <option value="">Giữ nguyên</option>
                        <option value="open">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="escalated">Chuyển pháp lý</option>
                      </select>
                    </label>
                    <button type="button" disabled={submittingId === item.id} onClick={() => submitAction(item.id)} className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-60">
                      {submittingId === item.id ? "Đang lưu..." : "Ghi nhận hành động"}
                    </button>
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

export default ManagerDelinquentCases;
