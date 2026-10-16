import { useRef, useState } from "react";
import staffReservationService from "../api/staffReservationService";
import MediaUpload from "./MediaUpload";

const CONDITION_OPTIONS = ["good", "acceptable", "damaged", "missing", "not_applicable"];
const emptyItem = () => ({
  itemName: "",
  condition: "good",
  notes: "",
  photoUrl: "",
  chargeAmount: 0,
});

export default function StaffHandoverForm({ reservationId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [overallCondition, setOverallCondition] = useState("good");
  const [inspectionSummary, setInspectionSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [customerSignatureRef, setCustomerSignatureRef] = useState("");
  const [staffSignatureRef, setStaffSignatureRef] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const lock = useRef(false);

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    if (!customerSignatureRef || !staffSignatureRef) {
      setError("Upload both customer and staff signatures before confirming the handover.");
      return;
    }
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const result = await staffReservationService.createHandover({
        reservationId,
        handoverType: "check_in",
        customerSignatureRef: customerSignatureRef.trim(),
        staffSignatureRef: staffSignatureRef.trim(),
        notes: notes.trim(),
        overallCondition,
        inspectionSummary: inspectionSummary.trim(),
        inspectionItems: items.map((item) => ({
          ...item,
          itemName: item.itemName.trim(),
          notes: item.notes.trim(),
          photoUrl: item.photoUrl.trim(),
          chargeAmount: Number(item.chargeAmount) || 0,
        })),
      });
      setCreated(result);
      await onCreated?.();
    } catch (err) {
      setError(err.message || "Unable to create the handover record.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (created) {
    return <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 font-semibold text-green-700">Handover #{created.handoverId ?? created.id} created. Agreement {created.agreementNo || created.agreementId} is {created.agreementStatus || "active"}.</p>;
  }

  return (
    <div className="mt-3 border-t border-[#dfe7f5] pt-3">
      <button type="button" onClick={() => setOpen((value) => !value)} className="font-bold text-[#1d5fe5]">
        {open ? "Close handover form" : "Create check-in handover"}
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="font-semibold text-[#58657a]">Overall condition
              <select value={overallCondition} onChange={(event) => setOverallCondition(event.target.value)} className="mt-1 block w-full rounded-lg border bg-white p-2 text-[#0b1c30]">
                {["good", "acceptable", "damaged", "unsafe"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="font-semibold text-[#58657a]">Inspection summary
              <input required value={inspectionSummary} onChange={(event) => setInspectionSummary(event.target.value)} className="mt-1 block w-full rounded-lg border bg-white p-2 text-[#0b1c30]" />
            </label>
            <div className="font-semibold text-[#58657a]"><MediaUpload label={customerSignatureRef ? "Replace customer signature" : "Upload customer signature"} onUploaded={(file) => setCustomerSignatureRef(file.url)} />{customerSignatureRef && <a href={customerSignatureRef} target="_blank" rel="noreferrer" className="mt-1 block text-[#1d5fe5] underline">View customer signature</a>}</div>
            <div className="font-semibold text-[#58657a]"><MediaUpload label={staffSignatureRef ? "Replace staff signature" : "Upload staff signature"} onUploaded={(file) => setStaffSignatureRef(file.url)} />{staffSignatureRef && <a href={staffSignatureRef} target="_blank" rel="noreferrer" className="mt-1 block text-[#1d5fe5] underline">View staff signature</a>}</div>
          </div>

          <label className="block font-semibold text-[#58657a]">Handover notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" className="mt-1 block w-full rounded-lg border bg-white p-2 text-[#0b1c30]" />
          </label>

          <div className="space-y-2">
            <p className="font-bold text-[#0b1c30]">Inspection items</p>
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-[#dfe7f5] bg-white p-3 md:grid-cols-2">
                <input required value={item.itemName} onChange={(event) => updateItem(index, "itemName", event.target.value)} placeholder="Inspection item name" className="rounded-lg border p-2 font-semibold" />
                <select value={item.condition} onChange={(event) => updateItem(index, "condition", event.target.value)} className="rounded-lg border bg-white p-2">
                  {CONDITION_OPTIONS.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                </select>
                <input value={item.notes} onChange={(event) => updateItem(index, "notes", event.target.value)} placeholder="Notes" className="rounded-lg border p-2" />
                <div><MediaUpload label={item.photoUrl ? "Replace photo" : "Upload photo"} onUploaded={(file) => updateItem(index, "photoUrl", file.url)} />{item.photoUrl && <a href={item.photoUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[#1d5fe5] underline">View photo</a>}</div>
                <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="justify-self-start text-red-600 disabled:opacity-40">Remove item</button>
              </div>
            ))}
            <button type="button" onClick={() => setItems((current) => [...current, emptyItem()])} className="rounded-lg border border-[#1d5fe5] px-3 py-2 font-semibold text-[#1d5fe5]">Add inspection item</button>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
          <button disabled={loading} className="rounded-lg bg-[#0e7b4c] px-4 py-2 font-bold text-white disabled:opacity-50">{loading ? "Creating handover..." : "Confirm Handover & Activate"}</button>
        </form>
      )}
    </div>
  );
}
