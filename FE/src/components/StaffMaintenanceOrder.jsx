import { useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";

const PRIORITIES = ["low", "normal", "high", "urgent"];

export default function StaffMaintenanceOrder({ unitId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [blocksBooking, setBlocksBooking] = useState(true);
  const [estimatedCost, setEstimatedCost] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const lock = useRef(false);

  async function submit(event) {
    event.preventDefault();
    const cost = Number(estimatedCost);
    if (!Number.isFinite(cost) || cost < 0) {
      setError("Estimated cost must be zero or greater.");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const result = await staffFacilityService.createMaintenanceOrder(unitId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        blocksBooking,
        estimatedCost: cost,
      });
      setCreated(result);
      await onCreated?.();
    } catch (err) {
      setError(err.message || "Unable to create the maintenance order.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (created) return <p role="status" className="mt-3 rounded-lg bg-green-100 p-2 text-xs font-semibold text-green-800">Maintenance order {created.workOrderNo || `#${created.id}`} created ({created.status}).</p>;

  return <div className="mt-3 border-t border-current/15 pt-3 text-xs">
    <button type="button" onClick={() => setOpen((value) => !value)} className="font-bold underline">{open ? "Close maintenance form" : "Create maintenance order"}</button>
    {open && <form onSubmit={submit} className="mt-3 space-y-2">
      <label className="block font-semibold">Title<input required maxLength="255" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-[#0b1c30]" /></label>
      <label className="block font-semibold">Description<textarea required rows="3" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-[#0b1c30]" /></label>
      <div className="grid grid-cols-2 gap-2">
        <label className="font-semibold">Priority<select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-[#0b1c30]">{PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="font-semibold">Estimated cost<input type="number" min="0" step="1000" required value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-[#0b1c30]" /></label>
      </div>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={blocksBooking} onChange={(event) => setBlocksBooking(event.target.checked)} /> Block new bookings for this unit</label>
      {error && <p role="alert" className="rounded-lg bg-red-100 p-2 text-red-700">{error}</p>}
      <button disabled={loading} className="rounded-lg bg-[#b42318] px-3 py-2 font-bold text-white disabled:opacity-50">{loading ? "Creating..." : "Create order"}</button>
    </form>}
  </div>;
}
