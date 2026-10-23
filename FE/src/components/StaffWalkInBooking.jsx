import { useEffect, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";
import staffBookingService from "../api/staffBookingService";

export default function StaffWalkInBooking({ facilityId }) {
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    customerEmail: "",
    customerIdentityNumber: "",
    unitId: "",
    startDate: new Date().toISOString().split("T")[0],
    durationMonths: "1",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  const loadAvailableUnits = async () => {
    setLoadingUnits(true);
    try {
      const data = await staffFacilityService.getUnits(facilityId, { status: "available" });
      setAvailableUnits(data || []);
      if (data && data.length > 0 && !formData.unitId) {
        setFormData((prev) => ({ ...prev, unitId: String(data[0].unitId) }));
      }
    } catch (err) {
      console.error("Failed to load units:", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    loadAvailableUnits();
  }, [facilityId]);

  const selectedUnit = availableUnits.find((u) => String(u.unitId) === String(formData.unitId));
  const rent = Number(selectedUnit?.currentRate || selectedUnit?.monthlyRate || 0);
  const deposit = Number(selectedUnit?.depositAmount ?? rent);
  const totalDue = rent + deposit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerPhone || !formData.customerName || !formData.unitId) {
      setError("Please fill in Phone, Customer Name, and select a Unit.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        customerPhone: formData.customerPhone.trim(),
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail?.trim() || null,
        customerIdentityNumber: formData.customerIdentityNumber?.trim() || null,
        unitId: Number(formData.unitId),
        startDate: formData.startDate,
        durationMonths: Number(formData.durationMonths) || 1,
        notes: formData.notes?.trim() || null,
      };

      const result = await staffBookingService.createWalkInBooking(payload);
      setBookingResult(result);
      loadAvailableUnits();
    } catch (err) {
      setError(err?.message || "Failed to create rental. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Walk-in Rental</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register a walk-in customer, assign a vacant unit, and generate VietQR for immediate payment.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="Email address"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                National ID (Optional)
              </label>
              <input
                type="text"
                value={formData.customerIdentityNumber}
                onChange={(e) => setFormData({ ...formData, customerIdentityNumber: e.target.value })}
                placeholder="National ID / Passport"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Storage Unit <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                {loadingUnits ? (
                  <option value="">Loading units...</option>
                ) : availableUnits.length === 0 ? (
                  <option value="">No vacant units available</option>
                ) : (
                  availableUnits.map((u) => (
                    <option key={u.unitId} value={u.unitId}>
                      {u.unitCode} ({u.unitTypeName || "Unit"} • {u.areaM2 || `${u.widthM}x${u.lengthM}`}m² • {Number(u.currentRate || u.monthlyRate || 0).toLocaleString("en-US")} ₫)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 block">Initial Counter Payment:</span>
              <span className="text-xs text-slate-700 font-medium">
                1st Month Rent ({Number(rent).toLocaleString("en-US")} ₫) + Deposit ({Number(deposit).toLocaleString("en-US")} ₫)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Total Due</span>
              <span className="text-base font-bold text-emerald-600">
                {Number(totalDue).toLocaleString("en-US")} ₫
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || availableUnits.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition"
            >
              {submitting ? "Processing..." : "Generate Booking & VietQR"}
            </button>
          </div>
        </form>
      </div>

      {/* Payment QR Modal */}
      {bookingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-5 space-y-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-1">
                Completed
              </span>
              <h3 className="text-sm font-bold text-slate-900">Rental Created</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Code: <span className="font-semibold text-slate-700">{bookingResult.reservationCode}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <img
                src={bookingResult.qrImageUrl}
                alt="VietQR Payment"
                className="w-44 h-44 mx-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xs"
              />
              <div className="space-y-0.5 text-xs">
                <div className="text-base font-bold text-emerald-600">
                  {Number(bookingResult.totalAmount || 0).toLocaleString("en-US")} ₫
                </div>
                <div className="text-slate-600 text-[11px]">
                  Ref: <strong className="font-mono text-blue-700">{bookingResult.transferContent}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  {bookingResult.bankCode} • {bookingResult.accountNo}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600">
              {bookingResult.customerName} • Unit {bookingResult.unitCode} ({bookingResult.facilityName})
            </div>

            <div className="pt-1">
              <button
                onClick={() => setBookingResult(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
