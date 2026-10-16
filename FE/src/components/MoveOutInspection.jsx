import { useRef, useState } from "react";
import staffMoveOutService from "../api/staffMoveOutService";
import MediaUpload from "./MediaUpload";

const blankItem = () => ({ itemName: "", condition: "good", notes: "", photoUrl: "", chargeAmount: "0" });
export default function MoveOutInspection({ moveOut, onCompleted }) {
  const lock = useRef(false);
  const [overallCondition, setOverall] = useState("good");
  const [summary, setSummary] = useState("");
  const [nextUnitStatus, setNextStatus] = useState("available");
  const [items, setItems] = useState([{ ...blankItem(), itemName: "Cleaning" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  function update(index, key, value) {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }
  async function submit(event) {
    event.preventDefault();
    if (lock.current || result) return;
    setError("");
    if (items.some((item) => !item.itemName.trim() || !item.chargeAmount.trim() || !Number.isFinite(Number(item.chargeAmount)) || Number(item.chargeAmount) < 0)) {
      setError("Enter an item name and a non-negative charge.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const data = await staffMoveOutService.inspect(moveOut.id, {
        overallCondition, summary: summary.trim(), nextUnitStatus,
        inspectionItems: items.map((item) => ({ ...item, itemName: item.itemName.trim(), notes: item.notes.trim(), photoUrl: item.photoUrl.trim() || null, chargeAmount: Number(item.chargeAmount) })),
      });
      setResult(data);
      onCompleted(moveOut.id);
    } catch (err) {
      setError(err.message || "Unable to save inspection. Please try again.");
    } finally { lock.current = false; setBusy(false); }
  }
  const inputClass = "mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white p-2";
  if (result) return <div role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm"><p className="font-semibold">Inspection saved #{result.inspectionId}</p><p>Total charges: {result.totalDamageCharges}</p><p>Agreement: {result.agreementStatus}</p><p>Unit: {result.unitStatus}</p></div>;
  if (moveOut.status === "completed" || moveOut.status === "cancelled") return null;
  return <details className="mt-4 border-t pt-3">
    <summary className="cursor-pointer font-semibold text-[#1d5fe5]">Inspect move-out</summary>
    <form onSubmit={submit} aria-busy={busy} className="mt-3 text-sm">
      <fieldset disabled={busy} className="space-y-3">
        <label className="block">Overall condition<select className={inputClass} value={overallCondition} onChange={(e) => setOverall(e.target.value)}>{["good", "acceptable", "damaged", "unsafe"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="block">Summary<textarea maxLength={255} className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
        <p className="text-xs text-[#58657a]">Record cleaning and damage below. Enter a cleaning charge if cleaning is required.</p>
        {items.map((item, index) => <fieldset key={index} className="space-y-2 rounded-lg border bg-[#f8faff] p-3">
          <legend className="font-semibold">Item {index + 1}</legend>
          <label className="block">Item name<input required maxLength={255} className={inputClass} value={item.itemName} onChange={(e) => update(index, "itemName", e.target.value)} /></label>
          <label className="block">Condition<select className={inputClass} value={item.condition} onChange={(e) => update(index, "condition", e.target.value)}>{["good", "acceptable", "damaged", "missing", "not_applicable"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="block">Notes<textarea maxLength={255} className={inputClass} value={item.notes} onChange={(e) => update(index, "notes", e.target.value)} /></label>
          <div><MediaUpload label={item.photoUrl ? "Replace photo" : "Upload photo"} onUploaded={(file) => update(index, "photoUrl", file.url)} />{item.photoUrl && <div className="mt-1 flex items-center gap-2"><a href={item.photoUrl} target="_blank" rel="noreferrer" className="text-[#1d5fe5] underline">View photo</a><button type="button" onClick={() => update(index, "photoUrl", "")} className="text-red-600">Remove</button></div>}</div>
          <label className="block">Charge amount<input type="number" required min="0" max="999999999999.99" step="0.01" className={inputClass} value={item.chargeAmount} onChange={(e) => update(index, "chargeAmount", e.target.value)} /></label>
          <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="text-red-600">Remove item</button>
        </fieldset>)}
        <button type="button" onClick={() => setItems((current) => [...current, blankItem()])} className="font-semibold text-[#1d5fe5]">Add item</button>
        <label className="block">Unit status after inspection<select className={inputClass} value={nextUnitStatus} onChange={(e) => setNextStatus(e.target.value)}><option value="available">Available</option><option value="under_maintenance">Requires cleaning / maintenance</option></select></label>
        <p className="text-xs text-[#58657a]">Submitting completes the move-out and applies inspection charges to the deposit.</p>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button type="submit" className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white">{busy ? "Saving..." : "Complete inspection"}</button>
      </fieldset>
    </form>
  </details>;
}
