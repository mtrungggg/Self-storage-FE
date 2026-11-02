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

  // Refund preference at counter: "cash" (Khách có mặt trực tiếp & muốn lấy tiền mặt ngay) vs "bank" (Khách chọn nhận qua ngân hàng)
  const [refundPreference, setRefundPreference] = useState(
    moveOut?.refundMethod === "cash" ? "cash" : "bank"
  );

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
        overallCondition,
        summary: summary.trim(),
        nextUnitStatus,
        refundMethod: refundPreference === "cash" ? "cash" : "bank_transfer",
        isCashPayout: refundPreference === "cash",
        inspectionItems: items.map((item) => ({
          ...item,
          itemName: item.itemName.trim(),
          notes: item.notes.trim(),
          photoUrl: item.photoUrl.trim() || null,
          chargeAmount: Number(item.chargeAmount),
        })),
      });
      setResult(data);
      if (onCompleted) {
        onCompleted(moveOut.id, {
          refundMethod: refundPreference === "cash" ? "cash" : "bank_transfer",
          payoutStatus: refundPreference === "cash" ? "paid_cash" : "pending_manager_transfer",
        });
      }
    } catch (err) {
      setError(err.message || "Unable to save inspection. Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white p-2";

  if (result) {
    return (
      <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>Nghiệm thu đã lưu #{result.inspectionId}</span>
        </div>
        <p className="text-slate-700">
          Tổng phí khấu trừ: <strong>{result.totalDamageCharges} VNĐ</strong> · Ô kho: {result.unitStatus}
        </p>
        {refundPreference === "cash" ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 font-bold text-emerald-900">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">payments</span>
            <span>Đã chi trả tiền mặt tại quầy</span>
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 font-bold text-amber-900">
            <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
            <span>Đang chờ Quản lý (Manager) chuyển khoản</span>
          </div>
        )}
      </div>
    );
  }

  if (moveOut.status === "completed") {
    if (moveOut.refundMethod === "cash") {
      return (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">payments</span>
          <span>Đã chi trả tiền mặt tại quầy</span>
        </div>
      );
    }
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
        <span className="material-symbols-outlined text-[15px] text-amber-600">schedule</span>
        <span>Đang chờ Quản lý (Manager) chuyển khoản</span>
      </div>
    );
  }

  if (moveOut.status === "cancelled") return null;

  return (
    <details className="mt-4 border-t pt-3">
      <summary className="cursor-pointer font-semibold text-[#1d5fe5]">Inspect move-out</summary>
      <form onSubmit={submit} aria-busy={busy} className="mt-3 text-sm">
        <fieldset disabled={busy} className="space-y-3">
          <label className="block font-semibold">
            Overall condition
            <select className={inputClass} value={overallCondition} onChange={(e) => setOverall(e.target.value)}>
              {["good", "acceptable", "damaged", "unsafe"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block font-semibold">
            Summary
            <textarea maxLength={255} className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </label>
          <p className="text-xs text-[#58657a]">Record cleaning and damage below. Enter a cleaning charge if cleaning is required.</p>
          {items.map((item, index) => (
            <fieldset key={index} className="space-y-2 rounded-lg border bg-[#f8faff] p-3">
              <legend className="font-semibold">Item {index + 1}</legend>
              <label className="block">Item name<input required maxLength={255} className={inputClass} value={item.itemName} onChange={(e) => update(index, "itemName", e.target.value)} /></label>
              <label className="block">Condition<select className={inputClass} value={item.condition} onChange={(e) => update(index, "condition", e.target.value)}>{["good", "acceptable", "damaged", "missing", "not_applicable"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="block">Notes<textarea maxLength={255} className={inputClass} value={item.notes} onChange={(e) => update(index, "notes", e.target.value)} /></label>
              <div><MediaUpload label={item.photoUrl ? "Replace photo" : "Upload photo"} onUploaded={(file) => update(index, "photoUrl", file.url)} />{item.photoUrl && <div className="mt-1 flex items-center gap-2"><a href={item.photoUrl} target="_blank" rel="noreferrer" className="text-[#1d5fe5] underline">View photo</a><button type="button" onClick={() => update(index, "photoUrl", "")} className="text-red-600">Remove</button></div>}</div>
              <label className="block">Charge amount<input type="number" required min="0" max="999999999999.99" step="0.01" className={inputClass} value={item.chargeAmount} onChange={(e) => update(index, "chargeAmount", e.target.value)} /></label>
              <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="text-red-600 text-xs">Remove item</button>
            </fieldset>
          ))}
          <button type="button" onClick={() => setItems((current) => [...current, blankItem()])} className="font-semibold text-[#1d5fe5] text-xs">Add item</button>
          
          <label className="block font-semibold">
            Unit status after inspection
            <select className={inputClass} value={nextUnitStatus} onChange={(e) => setNextStatus(e.target.value)}>
              <option value="available">Available</option>
              <option value="under_maintenance">Requires cleaning / maintenance</option>
            </select>
          </label>

          {/* Refund method at counter */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2 text-xs">
            <span className="block font-bold text-slate-800">
              Phương thức nhận tiền hoàn cọc của khách tại quầy:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  refundPreference === "cash"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`payout-method-${moveOut.id}`}
                  value="cash"
                  checked={refundPreference === "cash"}
                  onChange={() => setRefundPreference("cash")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Khách có mặt trực tiếp và muốn lấy tiền mặt ngay</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                  refundPreference === "bank"
                    ? "bg-blue-50 border-blue-400 text-blue-950 font-bold"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`payout-method-${moveOut.id}`}
                  value="bank"
                  checked={refundPreference === "bank"}
                  onChange={() => setRefundPreference("bank")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Khách chọn nhận qua ngân hàng</span>
              </label>
            </div>
          </div>

          {/* Status display when bank transfer is chosen */}
          {refundPreference === "bank" && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
              <div>
                <p className="font-bold text-amber-950">
                  Trạng thái: <span className="underline italic">Đang chờ Quản lý (Manager) chuyển khoản</span>
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Nhân viên chỉ nghiệm thu hiện trạng. Khoản hoàn cọc sẽ do Quản lý cơ sở thực hiện chuyển khoản cho khách.
                </p>
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-red-600 text-xs">{error}</p>}

          {/* Action button:
              If cash: ONLY show "Chi trả tiền mặt tại quầy"
              If bank: Show "Hoàn tất nghiệm thu" (status "Đang chờ Quản lý (Manager) chuyển khoản" is shown above) */}
          <div className="pt-2">
            {refundPreference === "cash" ? (
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>{busy ? "Đang xử lý..." : "Chi trả tiền mặt tại quầy"}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#1d5fe5] hover:bg-blue-700 px-4 py-2 font-semibold text-white shadow-xs transition disabled:opacity-50 text-xs"
              >
                {busy ? "Đang lưu..." : "Hoàn tất nghiệm thu"}
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </details>
  );
}
