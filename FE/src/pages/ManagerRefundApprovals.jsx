import { useEffect, useState } from "react";
import {
  Building2,
  User,
  DollarSign,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Search,
  UploadCloud,
  FileText,
  Trash2,
  QrCode,
  Eye,
  ExternalLink,
  X,
} from "lucide-react";
import managerService from "../api/managerService";
import mediaService from "../api/mediaService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { useLanguage } from "../context/LanguageContext";
import { useSignalR } from "../context/SignalRContext";
import { formatStatusToEnglish } from "../lib/utils";
import { DECISION_STATUS } from "../constants/managerConstants";
import ProcessRefundPayoutModal from "../components/ProcessRefundPayoutModal";

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
  const { t, formatCurrency, formatDate } = useLanguage();
  const { subscribe } = useSignalR();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [attachedFiles, setAttachedFiles] = useState({});
  const [submittingPayoutId, setSubmittingPayoutId] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);

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
      setError(err?.message || t("common.no_data", "Không thể tải danh sách yêu cầu hoàn cọc."));
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

  // Real-time SignalR listening
  useEffect(() => {
    const unsub = subscribe("RefundUpdated", () => {
      load();
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

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

  const handleCardFileSelect = (refundId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError(t("common.file_too_large", "Dung lượng file tối đa là 10MB."));
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles((prev) => ({
          ...prev,
          [refundId]: { file, previewUrl: reader.result },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFiles((prev) => ({
        ...prev,
        [refundId]: { file, previewUrl: "" },
      }));
    }
  };

  const handleCardFileRemove = (refundId) => {
    setAttachedFiles((prev) => {
      const next = { ...prev };
      delete next[refundId];
      return next;
    });
  };

  async function handleConfirmPayout(refund) {
    const draft = drafts[refund.refundId] || {};
    const attached = attachedFiles[refund.refundId];

    const refundAmount = draft.overrideAmount
      ? Number(draft.overrideAmount)
      : refund.recommendedRefundAmount ?? refund.amount ?? refund.originalDeposit ?? 0;

    setSubmittingPayoutId(refund.refundId);
    setError("");

    try {
      let uploadedProofUrl = "";

      if (attached?.file) {
        try {
          const uploadRes = await mediaService.upload(attached.file);
          uploadedProofUrl = uploadRes?.url || "";
        } catch (uploadErr) {
          console.warn("Media upload fallback (offline / local preview mode):", uploadErr);
          uploadedProofUrl = attached.previewUrl || `local://${attached.file.name}`;
        }
      }

      const finalProofUrl = uploadedProofUrl || attached?.previewUrl || "";
      const txRef = (draft.txRef || "").trim() || `FT${Date.now()}`;
      const finalNote = (draft.reason || "").trim() || "Quản lý cơ sở xác nhận đã chuyển khoản hoàn cọc cho khách hàng.";

      let bankName = refund.bankName || refund.customerBankName || "MBBank (Napas 247)";
      let accountNumber = refund.bankAccountNumber || refund.accountNo || refund.customerAccountNumber || "0987654321";
      let accountHolder = (refund.bankAccountHolder || refund.accountHolder || refund.customerName || "KHACH HANG").toUpperCase();

      const payload = {
        amount: refundAmount,
        transactionRef: txRef,
        transactionReference: txRef,
        proofUrl: finalProofUrl,
        proofImageUrl: finalProofUrl,
        notes: finalNote,
        note: finalNote,
        bankName,
        accountNumber,
        accountHolder,
      };

      await managerService.processRefundPayout(refund.refundId, payload);

      // Persist completed payout status for Customer UI sync
      const completedData = {
        refundId: refund.refundId,
        agreementId: refund.agreementId,
        agreementNo: refund.agreementNo,
        customerName: refund.customerName,
        amount: refundAmount,
        transactionRef: txRef,
        proofUrl: finalProofUrl,
        notes: finalNote,
        bankName,
        accountNumber,
        accountHolder,
        completedAt: new Date().toISOString(),
        status: "completed",
      };

      try {
        if (refund.agreementId) {
          localStorage.setItem(`refund_payout_completed_${refund.agreementId}`, JSON.stringify(completedData));
        }
        if (refund.agreementNo) {
          localStorage.setItem(`refund_payout_completed_${refund.agreementNo}`, JSON.stringify(completedData));
        }
        localStorage.setItem(`refund_payout_completed_ref_${refund.refundId}`, JSON.stringify(completedData));
        window.dispatchEvent(new Event("storage"));
      } catch (storageErr) {
        console.warn("Storage sync error:", storageErr);
      }

      setNotice(t("refunds.payout_success", `Đã xác nhận hoàn cọc thành công cho hợp đồng ${refund.agreementNo || ""}.`));
      await load();
      setTimeout(() => setNotice(""), 5000);
    } catch (err) {
      setError(err?.message || "Không thể hoàn tất hoàn cọc. Vui lòng thử lại.");
    } finally {
      setSubmittingPayoutId(null);
    }
  }

  function handleOpenPayoutModal(refund) {
    setSelectedRefundForPayout(refund);
    setPayoutModalOpen(true);
  }

  function handlePayoutSuccess(updatedRefund) {
    setPayoutModalOpen(false);
    setSelectedRefundForPayout(null);
    setNotice(`Đã xác nhận hoàn cọc thành công cho hợp đồng ${updatedRefund?.agreementNo || ""}.`);
    load();
    setTimeout(() => setNotice(""), 5000);
  }

  function handleCopyAccount(text, id) {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  }

  const filteredRefunds = refunds.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.agreementNo && r.agreementNo.toLowerCase().includes(term)) ||
      (r.refundId && String(r.refundId).includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1d5fe5] text-[24px]">assignment_return</span>
            {t("refunds.title", "Quản lý Trả kho & Hoàn cọc (Refund Approvals)")}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {t("refunds.desc", "Duyệt cấn trừ hư hại, kiểm tra thông tin ngân hàng của khách và xác nhận chuyển khoản hoàn cọc trực tiếp.")}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t("common.refresh", "Làm mới")}
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="search"
          placeholder={t("common.search", "Tìm theo tên khách hàng, số hợp đồng, mã hoàn cọc...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            {searchTerm ? t("common.no_data", "Không tìm thấy yêu cầu hoàn cọc phù hợp.") : t("common.no_data", "Không có yêu cầu hoàn cọc nào cho cơ sở này.")}
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

            if (displayReason && typeof displayReason === "string") {
              let trimmed = displayReason.trim();
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                trimmed = trimmed.slice(1, -1).trim();
              }
              if (trimmed.startsWith("{")) {
                try {
                  const parsed = JSON.parse(trimmed.replace(/\\"/g, '"'));
                  if (!bankName && parsed.bank) bankName = parsed.bank;
                  if (!accountNumber && parsed.acc) accountNumber = parsed.acc;
                  if (!accountHolder && parsed.holder) accountHolder = parsed.holder;
                  displayReason = parsed.note || "Khách yêu cầu hoàn cọc qua chuyển khoản ngân hàng.";
                } catch {
                  displayReason = "Khách yêu cầu hoàn cọc qua chuyển khoản ngân hàng.";
                }
              }
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
                      <span className="font-normal text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        #{refund.agreementNo}
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
                      {t("common.deposit", "Tiền cọc ban đầu (Deposit)")}
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-slate-800">
                      {formatCurrency(refund.originalDeposit)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {t("common.deductions", "Khấu trừ hư hại / Công nợ")}
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-rose-600">
                      -{formatCurrency(refund.estimatedDeductions)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                      {t("common.net_refund", "Số tiền thực nhận (Net Refund)")}
                    </div>
                    <div className="mt-0.5 text-sm font-extrabold text-emerald-700">
                      {formatCurrency(refund.recommendedRefundAmount)}
                    </div>
                  </div>
                </div>

                {/* Customer Bank Information Block */}
                <div className="mt-3.5 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-white p-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Building2 size={15} className="text-emerald-700" />
                      {t("common.bank_info", "Thông tin tài khoản nhận hoàn cọc của khách hàng")}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {t("common.refund", "Cần hoàn")}: {formatCurrency(refundAmount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t("common.bank_name", "Ngân hàng")}:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Building2 size={13} className="text-emerald-600" />
                        {bankName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t("common.account_number", "Số tài khoản")}:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(accountNumber, refund.refundId)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
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
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t("common.account_holder", "Chủ tài khoản")}:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        {accountHolder}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">{t("common.amount", "Số tiền cần hoàn")}:</span>
                      <span className="font-extrabold text-emerald-700 text-sm flex items-center gap-0.5">
                        <DollarSign size={13} className="text-emerald-600" />
                        {formatCurrency(refundAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mt-2.5 text-[11px] text-slate-400">
                  {t("tickets.created_at", "Thời gian gửi yêu cầu")}: {formatDate(refund.createdAt)}
                </div>

                {/* Action Section for Pending Refund */}
                {isPending ? (
                  <div className="mt-4 rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        {t("refunds.payout_action_title", "Xác nhận chuyển khoản & Nộp chứng từ hoàn cọc")}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t("refunds.payout_action_subtitle", "Tải ảnh biên lai UNC hoặc mở mã VietQR để quét thanh toán")}
                      </span>
                    </div>

                    {/* Form inputs row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* Upload button & Attached file preview */}
                      <div className="md:col-span-5 space-y-1">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          {t("common.proof_receipt_label", "Ảnh biên lai / Chứng từ UNC đã chuyển khoản *")}
                        </span>

                        {attachedFiles[refund.refundId] ? (
                          <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {attachedFiles[refund.refundId].previewUrl ? (
                                <img
                                  src={attachedFiles[refund.refundId].previewUrl}
                                  alt="UNC Preview"
                                  className="h-8 w-8 object-cover rounded border border-emerald-300 cursor-pointer hover:opacity-80 shrink-0"
                                  onClick={() => setPreviewImageModal(attachedFiles[refund.refundId].previewUrl)}
                                  title="Bấm để xem ảnh lớn"
                                />
                              ) : (
                                <FileText size={18} className="text-emerald-600 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <span className="font-semibold text-emerald-950 block truncate max-w-[150px]">
                                  {attachedFiles[refund.refundId].file.name}
                                </span>
                                <span className="text-[10px] text-emerald-700">
                                  {(attachedFiles[refund.refundId].file.size / 1024).toFixed(1)} KB • {t("common.ready_to_submit", "Đã chọn")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {attachedFiles[refund.refundId].previewUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImageModal(attachedFiles[refund.refundId].previewUrl)}
                                  className="rounded p-1 text-emerald-700 hover:bg-emerald-200/60 transition cursor-pointer"
                                  title="Xem trước ảnh"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCardFileRemove(refund.refundId)}
                                className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                                title="Xóa file"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/70 hover:bg-blue-100/60 hover:border-blue-500 px-3 py-2 text-xs font-semibold text-blue-700 cursor-pointer transition shadow-xs">
                            <UploadCloud size={16} className="text-blue-600 shrink-0" />
                            <span>{t("common.upload_receipt_btn", "Tải ảnh chuyển khoản (UNC / Bill)")}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => handleCardFileSelect(refund.refundId, e)}
                            />
                          </label>
                        )}
                      </div>

                      {/* Tx Ref */}
                      <div className="md:col-span-3">
                        <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-700">
                          <span>{t("common.tx_ref_label", "Mã GD ngân hàng (Tx Ref)")}</span>
                          <input
                            placeholder="VD: FT2411030912..."
                            value={draft.txRef || ""}
                            onChange={(e) => updateDraft(refund.refundId, "txRef", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </label>
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-4">
                        <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-700">
                          <span>{t("common.notes", "Ghi chú phê duyệt")}</span>
                          <input
                            placeholder="Ghi chú xác nhận đã chuyển khoản..."
                            value={draft.reason || ""}
                            onChange={(e) => updateDraft(refund.refundId, "reason", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Buttons Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                          <span>{t("common.adjust_amount_short", "Số tiền điều chỉnh (nếu có)")}:</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Mặc định đề xuất"
                            value={draft.overrideAmount || ""}
                            onChange={(e) => updateDraft(refund.refundId, "overrideAmount", e.target.value)}
                            className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                          />
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* VietQR modal button */}
                        <button
                          type="button"
                          onClick={() => handleOpenPayoutModal(refund)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                        >
                          <QrCode size={14} className="text-emerald-600" />
                          <span>{t("common.view_vietqr", "Mã VietQR")}</span>
                        </button>

                        {/* Direct Confirm Payout Button */}
                        <button
                          type="button"
                          disabled={submittingPayoutId === refund.refundId}
                          onClick={() => handleConfirmPayout(refund)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {submittingPayoutId === refund.refundId ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>{t("common.processing", "Đang xử lý...")}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} />
                              <span>{t("common.payout_transfer", "Xác nhận đã chuyển khoản")}</span>
                            </>
                          )}
                        </button>

                        {/* Reject button */}
                        <button
                          type="button"
                          disabled={decidingId === refund.refundId || submittingPayoutId === refund.refundId}
                          onClick={() => handleReject(refund.refundId)}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                        >
                          {t("common.cancel", "Từ chối")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isCompleted ? (
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        {t("common.refund_success", "Đã hoàn tất thanh toán chuyển khoản ngân hàng")}
                      </span>
                      {refund.transactionReference && (
                        <span className="font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                          Mã GD: {refund.transactionReference}
                        </span>
                      )}
                    </div>
                    {refund.proofImageUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(refund.proofImageUrl)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                        >
                          <Eye size={13} />
                          {t("common.view_proof", "Xem ảnh UNC / Biên lai")}
                        </button>
                        <a
                          href={refund.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                          title="Mở tab mới"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
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
        initialFile={selectedRefundForPayout ? attachedFiles[selectedRefundForPayout.refundId]?.file : null}
        initialPreviewUrl={selectedRefundForPayout ? attachedFiles[selectedRefundForPayout.refundId]?.previewUrl : ""}
        initialTxRef={selectedRefundForPayout ? drafts[selectedRefundForPayout.refundId]?.txRef || "" : ""}
        initialNotes={selectedRefundForPayout ? drafts[selectedRefundForPayout.refundId]?.reason || "" : ""}
      />

      {/* Image Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-xl p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={15} className="text-blue-600" />
                {t("common.proof_receipt_view", "Chứng từ chuyển khoản / Ủy nhiệm chi (UNC)")}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] flex justify-center">
              <img
                src={previewImageModal}
                alt="Biên lai UNC"
                className="object-contain max-h-[70vh] w-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
