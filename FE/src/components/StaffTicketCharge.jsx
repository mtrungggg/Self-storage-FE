import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";
import mediaService from "../api/mediaService";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("en-US")} ₫`;
}

export default function StaffTicketCharge({ ticketId }) {
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
      const res = await mediaService.uploadImage(file);
      if (res?.url) {
        setPhotoUrl(res.url);
      }
    } catch (err) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    const numericAmount = Number(amount);
    if (!description.trim() || !amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a description and an amount greater than zero.");
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!reason.trim() && !description.trim()) {
      setError("Please enter a reason or description for the proposed charge.");
      return;
    }

    lock.current = true;
    setSubmitting(true);
    setCharge(null);
    try {
      const result = await staffSupportService.proposeCharge(ticketId, { description: description.trim(), amount: numericAmount });
      const result = await staffSupportService.proposeCharge(ticketId, {
        amount: numericAmount,
        reason: reason.trim() || description.trim(),
        description: description.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });
      setCharge(result);
      setReason("");
      setDescription("");
      setAmount("");
      setPhotoUrl("");
    } catch (err) {
      setError(err.message || "Unable to propose this charge. Please try again.");
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-4 border-t border-[#dfe7f5] pt-4 text-sm">
      <h3 className="font-semibold">Propose charge</h3>
      <h3 className="font-semibold text-slate-900">Propose Incident / Damage Surcharge</h3>
      <p className="text-xs text-[#767679] mt-0.5">
        Submit a charge proposal for customer damages, key loss, or special cleaning.
      </p>

      <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-3">
        <fieldset disabled={submitting} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${fieldId}-amount`} className="mb-1 block text-xs font-semibold">
                Amount (₫) *
              </label>
              <input
                id={`${fieldId}-amount`}
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="e.g. 150000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-sm font-bold"
              />
            </div>

            <div>
              <label htmlFor={`${fieldId}-reason`} className="mb-1 block text-xs font-semibold">
                Reason / Cause *
              </label>
              <input
                id={`${fieldId}-reason`}
                type="text"
                required
                placeholder="e.g. Broken padlock, heavy trash left"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-description`} className="mb-1 block">Description *</label>
            <textarea id={`${fieldId}-description`} rows={2} required value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3" />
            <label htmlFor={`${fieldId}-description`} className="mb-1 block text-xs font-semibold">
              Detailed Description
            </label>
            <textarea
              id={`${fieldId}-description`}
              rows={2}
              placeholder="Describe the condition, location of damage, or specific cleanup needed..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2.5 text-xs"
            />
          </div>

          <div>
            <label htmlFor={`${fieldId}-amount`} className="mb-1 block">Amount *</label>
            <input id={`${fieldId}-amount`} type="number" min="0" step="any" required value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2" />
            <label htmlFor={`${fieldId}-photo`} className="mb-1 block text-xs font-semibold">
              Evidence Photo (Photo URL or Upload)
            </label>
            <div className="flex gap-2">
              <input
                id={`${fieldId}-photo`}
                type="url"
                placeholder="https://... or choose file below"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                className="flex-1 rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-xs"
              />
              <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
                {uploadingPhoto ? "Uploading..." : "Upload File"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            {photoUrl && (
              <div className="mt-2">
                <img
                  src={photoUrl}
                  alt="Evidence preview"
                  className="h-20 w-auto rounded border border-slate-200 object-cover"
                />
              </div>
            )}
          </div>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button type="submit" disabled={!description.trim() || !amount.trim()} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting..." : "Submit charge proposal"}</button>

          {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!amount.trim() || (!reason.trim() && !description.trim()) || submitting}
            className="rounded-lg bg-[#1d5fe5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting Proposal..." : "Submit Charge Proposal"}
          </button>
        </fieldset>
      </form>
      {charge && <div className="mt-3 rounded-lg bg-green-50 p-3">
        <p role="status" className="font-semibold text-green-800">Charge proposal submitted.</p>
        <p className="mt-1 whitespace-pre-wrap break-words">{charge.description}</p>
        <dl className="mt-2 space-y-1">
          <div><dt className="inline font-semibold">Amount: </dt><dd className="inline">{charge.amount}</dd></div>
          <div><dt className="inline font-semibold">Status: </dt><dd className="inline">{charge.status || "—"}</dd></div>
          <div><dt className="inline font-semibold">Proposed by: </dt><dd className="inline">{charge.proposedByName || charge.proposedBy || "—"}</dd></div>
        </dl>
      </div>}

      {charge && (
        <div className="mt-3 rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-900">
          <p role="status" className="font-bold text-green-800 flex items-center gap-1.5">
            ✓ Charge proposal #{charge.id || ""} submitted for manager approval.
          </p>
          <div className="mt-2 space-y-1">
            <div>
              <span className="font-semibold">Amount: </span>
              <strong>{formatCurrency(charge.amount)}</strong>
            </div>
            <div>
              <span className="font-semibold">Reason / Description: </span>
              <span>{charge.description || charge.reason || "—"}</span>
            </div>
            <div>
              <span className="font-semibold">Status: </span>
              <span className="font-mono uppercase font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {charge.status || "pending"}
              </span>
            </div>
            {charge.proposedByName && (
              <div>
                <span className="font-semibold">Proposed by: </span>
                <span>{charge.proposedByName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}