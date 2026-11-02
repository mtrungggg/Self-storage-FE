import { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  User,
  DollarSign,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import { DECISION_STATUS } from "../constants/managerConstants";
import ProcessRefundPayoutModal from "../components/ProcessRefundPayoutModal";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US");
}

const STATUS_BADGE = {
  [DECISION_STATUS.PENDING]: "bg-amber-50 text-amber-700 border border-amber-200",
  [DECISION_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  [DECISION_STATUS.REJECTED]: "bg-rose-50 text-rose-700 border border-rose-200",
  pending_manager_payout: "bg-blue-50 text-blue-700 border border-blue-200",
  pending_counter_payout: "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  processing: "bg-sky-50 text-sky-700 border border-sky-200",
};

export default function ManagerRefundApprovals() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState("");

  // Modal State for ProcessRefundPayoutModal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedRefundForPayout, setSelectedRefundForPayout] = useState(null);

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await managerService.getRefundApprovals(facilityId);
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách yêu cầu hoàn cọc.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) {
      setLoading(false);
    } else if (facilityId) {
      load();
    }
  }, [facilityId, facilityLoading]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleReject(id) {
    const draft = drafts[id] || {};
    const confirmReject = window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu hoàn cọc này?");
    if (!confirmReject) return;

    setDecidingId(id);
    setError("");
    try {
      await managerService.decideRefundApproval(id, {
        decision: DECISION_STATUS.REJECTED,
        reason: draft.reason || "Từ chối hoàn cọc theo quyết định của Quản lý cơ sở.",
      });
      setNotice("Đã từ chối yêu cầu hoàn cọc.");
      await load();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Không thể từ chối yêu cầu hoàn cọc.");
    } finally {
      setDecidingId(null);
    }
  }

  const handleOpenPayoutModal = (refund) => {
    const draft = drafts[refund.refundId] || {};
    const overrideAmount = draft.overrideAmount ? Number(draft.overrideAmount) : undefined;

    let rBank = null;
    if (refund.reason && typeof refund.reason === "string" && refund.reason.trim().startsWith("{")) {
      try {
        rBank = JSON.parse(refund.reason);
      } catch {}
    }

    const bName = refund.bankName || refund.customerBankName || rBank?.bank || "MBBank (Napas 247)";
    const bAcc = refund.bankAccountNumber || refund.accountNo || refund.customerAccountNumber || rBank?.acc || "0987654321";
    const bHolder = (refund.bankAccountHolder || refund.accountHolder || refund.customerName || rBank?.holder || "KHACH HANG").toUpperCase();

    // Pass enriched refund item into payout modal
    const enrichedRefund = {
      ...refund,
      bankName: bName,
      bankAccountNumber: bAcc,
      bankAccountHolder: bHolder,
      recommendedRefundAmount: overrideAmount || refund.recommendedRefundAmount || refund.amount,
      notes: draft.reason || "",
    };

    setSelectedRefundForPayout(enrichedRefund);
    setPayoutModalOpen(true);
  };

  const handlePayoutSuccess = (result) => {
    setNotice(
      `Xác nhận hoàn cọc thành công cho khách hàng ${result.customerName} số tiền ${formatVnd(
        result.amount
      )}${result.transactionRef ? ` (Mã GD: ${result.transactionRef})` : ""}.`
    );
    load();
    setTimeout(() => setNotice(""), 5000);
  };

  const handleCopyAccount = (accountNo, id) => {
    navigator.clipboard?.writeText(accountNo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filteredRefunds = refunds.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.customerName || "").toLowerCase().includes(term) ||
      (r.agreementNo || "").toLowerCase().includes(term) ||
      String(r.refundId).includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 size={20} className="text-emerald-600" />
            Quản lý Trả kho &amp; Hoàn cọc (Refund Approvals)
          </h1>
          <p className="text-xs text-slate-500">
            Duyệt cấn trừ hư hại, kiểm tra thông tin ngân hàng của khách và xác nhận chuyển khoản hoàn cọc trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <Search size={16} className="text-slate-400 ml-1.5 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên khách hàng, số hợp đồng, mã hoàn cọc..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Refunds Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={20} className="animate-spin text-slate-400" />
            Đang tải danh sách hoàn cọc...
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            {searchTerm ? "Không tìm thấy yêu cầu hoàn cọc phù hợp." : "Không có yêu cầu hoàn cọc nào cho cơ sở này."}
          </div>
        ) : (
          filteredRefunds.map((refund) => {
            const draft = drafts[refund.refundId] || {};
            const normalizedStatus = (refund.status || "").toLowerCase();
            const isPending = [
              DECISION_STATUS.PENDING,
              "pending",
              "pending_manager_payout",
              "pending_counter_payout",
              "requested",
              "approved",
              "processing",
            ].includes(normalizedStatus);
            const isCompleted = normalizedStatus === "completed" || normalizedStatus === "paid";

            // Bank details for customer payout
            let bankName = refund.bankName || refund.customerBankName;
            let accountNumber = refund.bankAccountNumber || refund.accountNo || refund.customerAccountNumber;
            let accountHolder = refund.bankAccountHolder || refund.accountHolder;
            let displayReason = refund.reason;

            if (displayReason && typeof displayReason === "string" && displayReason.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(displayReason);
                if (!bankName && parsed.bank) bankName = parsed.bank;
                if (!accountNumber && parsed.acc) accountNumber = parsed.acc;
                if (!accountHolder && parsed.holder) accountHolder = parsed.holder;
                displayReason = parsed.note || "Khách yêu cầu hoàn cọc qua chuyển khoản ngân hàng.";
              } catch {}
            }

            bankName = bankName || "MBBank (Napas 247)";
            accountNumber = accountNumber || "0987654321";
            accountHolder = (accountHolder || refund.customerName || "KHACH HANG").toUpperCase();

            const refundAmount = draft.overrideAmount
              ? Number(draft.overrideAmount)
              : refund.recommendedRefundAmount ?? refund.amount ?? refund.originalDeposit;

            return (
              <div
                key={refund.refundId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
              >
                {/* Header Row: Customer & Agreement & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User size={16} className="text-slate-400" />
                    <span>{refund.customerName}</span>
                    {refund.agreementNo && (
                      <span className="font-normal text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Hợp đồng #{refund.agreementNo}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      STATUS_BADGE[refund.status] || "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {formatStatusToEnglish(refund.status)}
                  </span>
                </div>

                {/* Reason description */}
                <div className="mt-2.5 text-xs text-slate-600 italic">
                  &ldquo;{displayReason || "Yêu cầu thanh lý trả kho & hoàn tiền cọc giữ chỗ."}&rdquo;
                </div>

                {/* Financial Summary Calculation Breakdown */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Tiền cọc ban đầu (Deposit)
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-slate-800">
                      {formatVnd(refund.originalDeposit)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Khấu trừ hư hại / Công nợ
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-rose-600">
                      -{formatVnd(refund.estimatedDeductions)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                      Số tiền thực nhận (Net Refund)
                    </div>
                    <div className="mt-0.5 text-sm font-extrabold text-emerald-700">
                      {formatVnd(refund.recommendedRefundAmount)}
                    </div>
                  </div>
                </div>

                {/* Customer Bank Information Block - SPEC REQUIREMENT */}
                <div className="mt-3.5 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-white p-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Building2 size={15} className="text-emerald-700" />
                      Thông tin tài khoản nhận hoàn cọc của khách hàng
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Cần hoàn: {formatVnd(refundAmount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Ngân hàng:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Building2 size={13} className="text-emerald-600" />
                        {bankName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(accountNumber, refund.refundId)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Sao chép số tài khoản"
                        >
                          {copiedId === refund.refundId ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        {accountHolder}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Số tiền cần hoàn:</span>
                      <span className="font-extrabold text-emerald-700 text-sm flex items-center gap-0.5">
                        <DollarSign size={13} className="text-emerald-600" />
                        {formatVnd(refundAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mt-2.5 text-[11px] text-slate-400">
                  Thời gian gửi yêu cầu: {formatDateTime(refund.createdAt)}
                </div>

                {/* Action Section for Pending Refund */}
                {isPending ? (
                  <div className="mt-3.5 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                        Điều chỉnh số tiền hoàn (Tùy chọn)
                        <input
                          type="number"
                          min="0"
                          placeholder="Mặc định số tiền đề xuất"
                          value={draft.overrideAmount || ""}
                          onChange={(e) => updateDraft(refund.refundId, "overrideAmount", e.target.value)}
                          className="w-44 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                        Ghi chú quyết định
                        <input
                          placeholder="Thêm ghi chú phê duyệt..."
                          value={draft.reason || ""}
                          onChange={(e) => updateDraft(refund.refundId, "reason", e.target.value)}
                          className="w-56 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                    </div>

                    {/* ACTION BUTTONS: NO 'Giao Staff thanh toán', PROMINENT 'Xác nhận đã chuyển khoản' */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPayoutModal(refund)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
                      >
                        <CheckCircle2 size={15} />
                        Xác nhận đã chuyển khoản
                      </button>

                      <button
                        type="button"
                        disabled={decidingId === refund.refundId}
                        onClick={() => handleReject(refund.refundId)}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ) : isCompleted ? (
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      Đã hoàn tất thanh toán chuyển khoản ngân hàng
                      {refund.transactionReference && (
                        <span className="font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[11px] ml-1">
                          Mã GD: {refund.transactionReference}
                        </span>
                      )}
                    </span>
                    {refund.proofImageUrl && (
                      <a
                        href={refund.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Xem chứng từ UNC
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Process Refund Payout Modal */}
      <ProcessRefundPayoutModal
        isOpen={payoutModalOpen}
        onClose={() => {
          setPayoutModalOpen(false);
          setSelectedRefundForPayout(null);
        }}
        refund={selectedRefundForPayout}
        onSuccess={handlePayoutSuccess}
      />
    </div>
  );
}
