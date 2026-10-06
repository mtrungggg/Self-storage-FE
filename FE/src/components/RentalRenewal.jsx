import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import { formatVnd } from "../lib/utils";

export default function RentalRenewal({ unit, onClose }) {
  const dialog = useRef(null);
  const lock = useRef(false);
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (lock.current || result) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try { setResult(await rentalService.renewAgreement(unit.id, months)); }
    catch (err) { setError(err.status === 404 ? "Rental agreement not found." : err.message || "Unable to request renewal."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={(event) => { if (lock.current) event.preventDefault(); else onClose(); }} aria-labelledby="renewal-title" className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#0b1c30] shadow-xl backdrop:bg-black/40">
    <div className="flex items-center justify-between gap-3"><h2 id="renewal-title" className="text-lg font-bold">Renew Unit {unit.unitCode}</h2><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">Close</button></div>
    {result ? <div className="mt-4 space-y-3 text-sm">
      <p role="status" className="font-semibold text-green-700">Renewal request submitted.</p>
      <dl className="space-y-2">{[["Request", result.renewalId], ["Current end date", result.oldEndDate], ["Requested end date", result.newEndDate], ["Monthly rate", formatVnd(result.monthlyRate)], ["Total renewal amount", formatVnd(result.totalRenewalAmount)], ["Status", result.status]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
      <p className="text-[#58657a]">Your request is pending processing. The contract end date has not yet changed.</p>
    </div> : <form onSubmit={submit} aria-busy={busy} className="mt-4 space-y-4 text-sm">
      <label className="block font-semibold">Renewal months<select disabled={busy} value={months} onChange={(event) => setMonths(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[#dfe7f5] p-2">{Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value} {value === 1 ? "month" : "months"}</option>)}</select></label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-[#1d5fe5] p-3 font-semibold text-white disabled:opacity-50">{busy ? "Submitting..." : "Request renewal"}</button>
    </form>}
  </dialog>;
}
