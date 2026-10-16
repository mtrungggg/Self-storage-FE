import { useRef, useState } from "react";
import rentalService from "../api/rentalService";

export default function AddAuthorizedMember({ agreementId, disabled, onAdded }) {
  const empty = { fullName: "", identityFingerprint: "", relationshipToCustomer: "", validTo: "" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (lock.current || disabled) return;
    setError(""); setSaved(false);
    if (!form.fullName.trim()) { setError("Please enter a full name."); return; }
    const expiry = form.validTo ? new Date(form.validTo) : null;
    if (expiry && (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now())) { setError("Choose a future expiry date and time."); return; }
    lock.current = true; setBusy(true);
    try {
      const member = await rentalService.addAuthorizedMember(agreementId, { fullName: form.fullName.trim(), identityFingerprint: form.identityFingerprint.trim() || null, relationshipToCustomer: form.relationshipToCustomer.trim() || null, validTo: expiry ? expiry.toISOString() : null });
      onAdded(member); setForm(empty); setSaved(true);
    } catch (err) { setError(err.message || "Unable to add authorized member."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <details className="mt-4 border-t pt-4 text-sm"><summary className="cursor-pointer font-semibold text-[#1d5fe5]">Add authorized member</summary>
    <form onSubmit={submit} aria-busy={busy} className="mt-3"><fieldset disabled={disabled || busy} className="space-y-3">
      {[["fullName", "Full name *"], ["identityFingerprint", "Identity reference (CCCD / CMND)"], ["relationshipToCustomer", "Relationship"], ["validTo", "Valid until (optional, local time)"]].map(([key, label]) => <label key={key} className="block">{label}<input type={key === "validTo" ? "datetime-local" : "text"} required={key === "fullName"} maxLength={255} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#dfe7f5] p-2" /></label>)}
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button type="submit" className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white">{busy ? "Saving..." : "Add member"}</button>
    </fieldset></form>{saved && <p role="status" className="mt-3 text-green-700">Authorized member added.</p>}
  </details>;
}
