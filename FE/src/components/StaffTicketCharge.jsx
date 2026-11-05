import { useLanguage } from "../context/LanguageContext";
import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";
import mediaService from "../api/mediaService";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("vi-VN")} ₫`;
}

export default function StaffTicketCharge({ ticketId, onChargeProposed }) {
  const { t } = useLanguage();
  const fieldId = useId();
  const lock = useRef(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState(null);

  async function handlePhotoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const res = await mediaService.upload(file);
      if (res?.url) {
        setPhotoUrl(res.url);
      }
    } catch (err) {
      setError(err.message || "Tải ảnh bằng chứng thất bại.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    const numericAmount = Number(amount);
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Vui lòng nhập số tiền phụ phí hợp lệ lớn hơn 0 đ.");
      return;
    }
    if (!reason.trim() && !description.trim()) {
      setError("Vui lòng nhập lý do hoặc mô tả chi tiết cho khoản phụ phí đề xuất.");
      return;
    }

    lock.current = true;
    setSubmitting(true);
    setCharge(null);
    try {
      const result = await staffSupportService.proposeCharge(ticketId, {
        amount: numericAmount,
        reason: reason.trim() || description.trim(),
        description: description.trim() || reason.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });
      const createdProposal = result || {
        amount: numericAmount,
        description: description.trim() || reason.trim(),
        status: "pending",
      };
      setCharge(createdProposal);
      setReason("");
      setDescription("");
      setAmount("");
      setPhotoUrl("");
      onChargeProposed?.(createdProposal);
    } catch (err) {
      setError(err.message || "Không thể gửi đề xuất phụ phí. Vui lòng thử lại.");
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
        <span className="material-symbols-outlined text-amber-700 text-[18px]">receipt_long</span>
        <span>Đề xuất thu phụ phí / Bồi thường (Staff Proposal)</span>
      </div>
      <p className="text-[11px] text-amber-800 mb-3">
        Gửi đề xuất thu phụ phí phát sinh (khách làm hỏng ổ khóa, trầy xước, xả rác...) để Quản lý cơ sở (Facility Manager) xem xét phê duyệt.
      </p>

      <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-3">
        <fieldset disabled={submitting} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${fieldId}-amount`} className="mb-1 block text-xs font-semibold text-slate-700">
                Số tiền phụ phí đề xuất (₫) *
              </label>
              <input
                id={`${fieldId}-amount`}
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="Ví dụ: 200000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={`${fieldId}-reason`} className="mb-1 block text-xs font-semibold text-slate-700">
                Lý do / Phân loại hư hại *
              </label>
              <input
                id={`${fieldId}-reason`}
                type="text"
                required
                placeholder="Ví dụ: Hỏng ổ khóa cửa cuốn, xả rác tồn..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-desc`} className="mb-1 block text-xs font-semibold text-slate-700">
              Mô tả chi tiết nguyên nhân &amp; hiện trạng *
            </label>
            <textarea
              id={`${fieldId}-desc`}
              rows={2}
              required
              placeholder="Ghi rõ chi tiết hư hại do khách hàng gây ra và căn cứ tính phí..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none resize-none"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-700">Ảnh bằng chứng hiện trường (tùy chọn)</span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-blue-600">upload_file</span>
                <span>{uploadingPhoto ? "Đang tải ảnh..." : "Chọn ảnh chụp hiện trường"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <div className="flex items-center gap-2">
                  <img src={photoUrl} alt="Bằng chứng" className="h-8 w-8 rounded object-cover border border-slate-300" />
                  <span className="text-[11px] text-emerald-700 font-medium">✓ Đã tải ảnh lên</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    {t("common.delete", "Xóa")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-rose-600 text-[11px] font-semibold">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !amount.trim() || !reason.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{submitting ? "Đang gửi đề xuất..." : "Nộp đề xuất phụ phí cho Manager duyệt"}</span>
            </button>
          </div>
        </fieldset>
      </form>

      {charge && (
        <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span>{t("tickets.charge_sent", "Đã gửi đề xuất thu phụ phí thành công!")}</span>
          </div>
          <p className="text-[11px] text-emerald-900">
            Số tiền đề xuất: <strong>{formatCurrency(charge.amount)}</strong>. Trạng thái: <em>{t("tickets.pending_manager_approval", "Chờ Quản lý phê duyệt")}</em>.
          </p>
        </div>
      )}
    </section>
  );
}
