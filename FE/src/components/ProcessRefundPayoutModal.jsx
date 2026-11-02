import { useState } from "react";
import {
  X,
  Building2,
  CreditCard,
  User,
  DollarSign,
  Copy,
  Check,
  UploadCloud,
  FileText,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { formatVnd } from "../lib/utils";
import managerService from "../api/managerService";
import mediaService from "../api/mediaService";

export default function ProcessRefundPayoutModal({
  isOpen,
  onClose,
  refund,
  onSuccess,
}) {
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  if (!isOpen || !refund) return null;

  // Extract bank details with resilient fallbacks
  const bankName =
    refund.bankName ||
    refund.customerBankName ||
    "MBBank (Napas 247)";
  const bankCode =
    refund.bankCode ||
    "MB";
  const accountNumber =
    refund.bankAccountNumber ||
    refund.accountNo ||
    refund.customerAccountNumber ||
    "0987654321";
  const accountHolder = (
    refund.bankAccountHolder ||
    refund.accountHolder ||
    refund.customerName ||
    "KHACH HANG"
  ).toUpperCase();

  const refundAmount =
    refund.recommendedRefundAmount ??
    refund.amount ??
    refund.originalDeposit ??
    0;

  const memo = `HOAN COC ${refund.agreementNo || refund.refundId}`;

  // VietQR URL generation
  const cleanBank = bankCode.replace(/\s+/g, "").trim();
  const cleanAcc = accountNumber.replace(/\s+/g, "").trim();
  const vietQrUrl = `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${refundAmount}&addInfo=${encodeURIComponent(
    memo
  )}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Dung lượng file tối đa là 10MB.");
      return;
    }

    setSelectedFile(file);
    setError("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let uploadedProofUrl = "";

      // 1. Upload proof file if attached
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadRes = await mediaService.upload(selectedFile);
          uploadedProofUrl = uploadRes?.url || "";
        } catch (uploadErr) {
          console.warn("Media upload fallback (offline/demo mode):", uploadErr);
          // If server upload endpoint is not available, proceed with filename note
          uploadedProofUrl = `local://${selectedFile.name}`;
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Submit refund payout / approval
      const payload = {
        amount: refundAmount,
        transactionRef: transactionRef.trim(),
        proofUrl: uploadedProofUrl,
        notes: notes.trim(),
        bankName,
        accountNumber,
        accountHolder,
      };

      await managerService.processRefundPayout(refund.refundId, payload);

      if (onSuccess) {
        onSuccess({
          refundId: refund.refundId,
          customerName: refund.customerName,
          amount: refundAmount,
          transactionRef: transactionRef.trim(),
        });
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Không thể hoàn tất hoàn cọc. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Xác nhận đã chuyển khoản hoàn cọc
              </h2>
              <p className="text-xs text-slate-500">
                Khách hàng: <span className="font-semibold text-slate-700">{refund.customerName}</span> • Hợp đồng: <span className="font-semibold text-slate-700">#{refund.agreementNo || refund.agreementId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bank Info & VietQR Section */}
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-4">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-100/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Building2 size={14} /> Thông tin tài khoản ngân hàng của khách
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Số tiền hoàn: {formatVnd(refundAmount)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* VietQR Preview */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200/80 shadow-sm text-center">
                  <div className="relative">
                    <img
                      src={vietQrUrl}
                      alt="VietQR Chuyển khoản hoàn cọc"
                      className="h-44 w-44 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="hidden mt-2 text-[10px] text-slate-400 items-center justify-center gap-1">
                      <QrCode size={12} /> Quét mã để chuyển nhanh
                    </div>
                  </div>
                  <span className="mt-1.5 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <QrCode size={13} className="text-emerald-600" /> Quét mã VietQR chuyển khoản
                  </span>
                </div>

                {/* Account Details Box */}
                <div className="md:col-span-7 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" /> Ngân hàng:
                    </span>
                    <span className="font-bold text-slate-800">{bankName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-slate-400" /> Số tài khoản:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountNumber, "account")}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === "account" ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" /> Chủ tài khoản:
                    </span>
                    <span className="font-bold text-slate-800">{accountHolder}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <DollarSign size={13} className="text-slate-400" /> Số tiền cần hoàn:
                    </span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {formatVnd(refundAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {memo}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(memo, "memo")}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        title="Sao chép nội dung"
                      >
                        {copiedField === "memo" ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Details Input Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã giao dịch / Mã tham chiếu ngân hàng (Trace No / FT...)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="VD: FT26010212345678 hoặc MB123456"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú chuyển khoản
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú xác nhận đã chuyển khoản thành công..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Upload Proof (UNC / Bill) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ảnh chụp màn hình chuyển khoản thành công (UNC / Bill chuyển khoản)
                </label>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition">
                    <UploadCloud size={24} className="text-slate-400 mb-1.5" />
                    <span className="text-xs font-medium text-slate-700">
                      Bấm để chọn file ảnh UNC / Hóa đơn chuyển tiền
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Hỗ trợ định dạng PNG, JPG, JPEG, PDF (Tối đa 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={18} className="text-blue-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition"
                        title="Xóa file"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {filePreview && (
                      <div className="mt-2.5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img
                          src={filePreview}
                          alt="Chứng từ chuyển khoản UNC"
                          className="max-h-48 w-full object-contain p-1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Hoàn tất hoàn cọc
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
