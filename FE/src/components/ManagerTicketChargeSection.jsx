import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import managerTicketService from "../api/managerTicketService";
import managerService from "../api/managerService";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("vi-VN")} ₫`;
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

export default function ManagerTicketChargeSection({
 ticketId, isClosedOrResolved = false }) {
  const { t } = useLanguage();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadProposals = async () => {
    if (!ticketId) return;
    try {
      const list = await managerTicketService.getTicketChargeProposals(ticketId);
      setProposals(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Failed to load charge proposals for ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [ticketId]);

  async function handleDecide(proposalId, decision) {
    setError("");
    setNotice("");
    setDecidingId(proposalId);
    try {
      await managerService.decideChargeProposal(proposalId, {
        decision,
        reason: decision === "approved" ? "Manager phê duyệt thu phụ phí theo đề xuất của Staff" : "Manager từ chối đề xuất phụ phí",
      });
      setNotice(decision === "approved" ? "Đã duyệt đề xuất phụ phí thành công." : "Đã từ chối đề xuất phụ phí.");
      setTimeout(() => setNotice(""), 4000);
      await loadProposals();
    } catch (err) {
      setError(err?.message || "Không thể thực hiện phê duyệt phụ phí. Vui lòng thử lại.");
    } finally {
      setDecidingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-2 text-slate-400 text-xs italic text-center">
        {t("common.loading", "Đang tải thông tin phụ phí đề xuất...")}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-slate-400">payments</span>
          <span>Phụ phí phát sinh: <strong>{t("tickets.no_charge_proposals", "Không có đề xuất phụ phí")}</strong> </span>
        </div>
        <Link
          to="/manager-charge-proposals"
          className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
        >
          Trang duyệt phụ phí cơ sở →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-amber-600">receipt_long</span>
          <span>Đề xuất thu phụ phí hư hại / bồi thường ({proposals.length})</span>
        </span>
        <Link
          to="/manager-charge-proposals"
          className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
        >
          Mở trang quản lý phụ phí →
        </Link>
      </div>

      {notice && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-[11px] font-bold text-emerald-800">
          ✓ {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-[11px] font-bold text-rose-800">
          ✕ {error}
        </div>
      )}

      <div className="space-y-2">
        {proposals.map((item) => {
          const status = (item.status || "pending").toLowerCase();
          const isPending = status === "pending";
          const isApproved = status === "approved";
          const isRejected = status === "rejected";

          return (
            <div
              key={item.id}
              className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3 text-xs space-y-2 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-amber-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isRejected
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {isApproved ? "Đã duyệt" : isRejected ? "Từ chối" : "Chờ Manager duyệt"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              <div className="text-slate-800 leading-relaxed bg-white/70 p-2 rounded-lg border border-amber-100">
                <p className="font-semibold text-slate-900">
                  {item.description || item.reason || "Đề xuất thu phụ phí hư hại"}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                  <span>Đề xuất bởi: <strong>{item.proposedByStaffName || item.proposedBy || "Nhân viên vận hành"}</strong></span>
                  {item.decision && (
                    <span className="italic">
                      Quyết định: {item.decision === "approved" ? "Đã duyệt" : "Đã từ chối"} ({formatDate(item.decidedAt)})
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Pending Proposals */}
              {isPending && !isClosedOrResolved && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={decidingId === item.id}
                    onClick={() => handleDecide(item.id, "approved")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>{decidingId === item.id ? "Đang xử lý..." : "Duyệt phụ phí"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={decidingId === item.id}
                    onClick={() => handleDecide(item.id, "rejected")}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    <span>Từ chối</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
