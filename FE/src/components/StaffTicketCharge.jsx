import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";

export default function StaffTicketCharge({ ticketId }) {
  const fieldId = useId();
  const lock = useRef(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    const numericAmount = Number(amount);
    if (!description.trim() || !amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a description and an amount greater than zero.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setCharge(null);
    try {
      const result = await staffSupportService.proposeCharge(ticketId, { description: description.trim(), amount: numericAmount });
      setCharge(result);
      setDescription("");
      setAmount("");
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
      <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-3">
        <fieldset disabled={submitting} className="space-y-3">
          <div>
            <label htmlFor={`${fieldId}-description`} className="mb-1 block">Description *</label>
            <textarea id={`${fieldId}-description`} rows={2} required value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3" />
          </div>
          <div>
            <label htmlFor={`${fieldId}-amount`} className="mb-1 block">Amount *</label>
            <input id={`${fieldId}-amount`} type="number" min="0" step="any" required value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2" />
          </div>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button type="submit" disabled={!description.trim() || !amount.trim()} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting..." : "Submit charge proposal"}</button>
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
    </section>
  );
}
