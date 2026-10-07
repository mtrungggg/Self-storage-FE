import { useRef, useState } from "react";
import staffAgreementService from "../api/staffAgreementService";

export default function StaffLockAccess({ agreementId, onLocked }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const lock = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Enter the reason for locking access.");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      await staffAgreementService.lockAccess(agreementId, reason.trim());
      setSuccess(true);
      await onLocked?.();
    } catch (err) {
      setError(err.message || "Unable to lock agreement access.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (success) return <p role="status" className="mt-3 rounded-lg bg-green-100 p-2 text-xs font-semibold text-green-800">Access locked successfully.</p>;

  return <div className="mt-3 border-t border-red-200 pt-3 text-xs">
    <button type="button" onClick={() => setOpen((value) => !value)} className="font-bold text-red-700 underline">{open ? "Cancel access lock" : "Lock access"}</button>
    {open && <form onSubmit={submit} className="mt-2 space-y-2">
      <label className="block font-semibold text-[#58657a]">Reason<textarea required rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Payment overdue or sealing inspection reason" className="mt-1 block w-full rounded-lg border border-red-200 bg-white p-2 text-[#0b1c30]" /></label>
      {error && <p role="alert" className="rounded-lg bg-red-100 p-2 text-red-700">{error}</p>}
      <button disabled={loading} className="rounded-lg bg-red-700 px-3 py-2 font-bold text-white disabled:opacity-50">{loading ? "Locking..." : "Confirm lock access"}</button>
    </form>}
  </div>;
}
