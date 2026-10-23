import { useState } from "react";
import staffQrService from "../api/staffQrService";
import QrCameraScanner from "./QrCameraScanner";

export default function StaffQrOperations() {
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const processVerify = async (code) => {
    if (!code || !code.trim()) {
      setError("Please enter or scan a valid QR code.");
      return;
    }

    setVerifying(true);
    setError("");
    setVerifyResult(null);
    setConfirmResult(null);

    try {
      const res = await staffQrService.verifyQr(code.trim());
      setVerifyResult(res);
      setShowCamera(false);
    } catch (err) {
      setError(err?.message || "Invalid QR code or request not found in system.");
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    processVerify(qrCodeInput);
  };

  const handleCameraScan = (decodedText) => {
    setQrCodeInput(decodedText);
    processVerify(decodedText);
  };

  const handleConfirmAction = async (actionType) => {
    if (!verifyResult) return;
    setConfirming(true);
    setError("");

    try {
      const payload = {
        actionType: actionType || verifyResult.actionType,
        reservationId: verifyResult.reservation?.reservationId,
        agreementId: verifyResult.agreement?.agreementId || verifyResult.transferRequest?.agreementId,
        transferRequestId: verifyResult.transferRequest?.transferRequestId,
        unitId: verifyResult.unit?.unitId,
      };

      const res = await staffQrService.confirmQrAction(payload);
      setConfirmResult(res);
    } catch (err) {
      setError(err?.message || "Failed to confirm action. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const getActionBadgeColor = (type) => {
    if (type === "check_in") return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === "transfer_move_out") return "bg-amber-50 text-amber-700 border-amber-200";
    if (type === "transfer_move_in") return "bg-purple-50 text-purple-700 border-purple-200";
    if (type === "move_out") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const formatActionName = (type) => {
    if (type === "check_in") return "Check-in Handover";
    if (type === "transfer_move_out") return "Transfer Move-out";
    if (type === "transfer_move_in") return "Transfer Move-in";
    if (type === "move_out") return "Move-out Return";
    return "Gate Access";
  };

  return (
    <div className="space-y-5">
      {/* QR Input & Scanner Control */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">QR Code Scanner</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan customer QR code or enter code manually to verify and complete handovers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCamera((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition shadow-xs ${
              showCamera
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showCamera ? "Close Camera" : "Scan with Camera"}
          </button>
        </div>

        {/* Live Camera Scanner Viewport */}
        {showCamera && (
          <div className="py-2">
            <QrCameraScanner
              onScan={handleCameraScan}
              onClose={() => setShowCamera(false)}
            />
          </div>
        )}

        {/* Manual Code Input Form */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={qrCodeInput}
            onChange={(e) => setQrCodeInput(e.target.value)}
            placeholder="Enter or scan QR code"
            className="flex-1 px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition shadow-xs"
          >
            {verifying ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Verified Details Card */}
      {verifyResult && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md border uppercase ${getActionBadgeColor(verifyResult.actionType)}`}>
                {formatActionName(verifyResult.actionType)}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{verifyResult.title || "Verification Details"}</h3>
            </div>
            {verifyResult.actionType && (
              <span className="text-xs text-slate-400 font-mono">
                {verifyResult.actionType}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Customer Details */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Customer
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{verifyResult.customer?.fullName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800">{verifyResult.customer?.phoneNumber || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700">{verifyResult.customer?.email || "—"}</span>
              </div>
            </div>

            {/* Unit / Facility Details */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Unit & Facility
              </span>
              {verifyResult.unit ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Code:</span>
                    <span className="font-bold text-blue-700">{verifyResult.unit.unitCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Type:</span>
                    <span className="text-slate-800">{verifyResult.unit.unitTypeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility:</span>
                    <span className="text-slate-800">{verifyResult.unit.facilityName}</span>
                  </div>
                </>
              ) : verifyResult.transferRequest ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source:</span>
                    <span className="font-medium text-slate-800">
                      {verifyResult.transferRequest.fromFacilityName} ({verifyResult.transferRequest.fromUnitCode})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-semibold text-purple-700">
                      {verifyResult.transferRequest.toFacilityName} ({verifyResult.transferRequest.toUnitCode || "Pending"})
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 italic">No specific unit associated.</div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between gap-3">
            <span className="text-xs text-blue-900 font-medium">
              Physical inspection complete. Confirm to update status:
            </span>

            <div className="flex items-center gap-2">
              {verifyResult.actionType === "check_in" && (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={() => handleConfirmAction("check_in")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  {confirming ? "Processing..." : "Confirm Check-in"}
                </button>
              )}

              {verifyResult.actionType === "transfer_move_out" && (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={() => handleConfirmAction("transfer_move_out")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  {confirming ? "Processing..." : "Confirm Move-out"}
                </button>
              )}

              {verifyResult.actionType === "transfer_move_in" && (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={() => handleConfirmAction("transfer_move_in")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  {confirming ? "Processing..." : "Confirm Move-in"}
                </button>
              )}

              {verifyResult.actionType === "move_out" && (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={() => handleConfirmAction("move_out")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  {confirming ? "Processing..." : "Confirm Return"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Success Alert */}
      {confirmResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-900">{confirmResult.message}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Agreement: {confirmResult.agreementStatus || "—"} • Unit: {confirmResult.unitStatus || "—"}
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmResult(null);
              setVerifyResult(null);
              setQrCodeInput("");
            }}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-100 transition"
          >
            Next Scan
          </button>
        </div>
      )}
    </div>
  );
}
