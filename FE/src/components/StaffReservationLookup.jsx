import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import staffCheckInApi from "../services/api/staffCheckInApi";
import StaffAssignUnit from "./StaffAssignUnit";
import QrCameraScanner from "./QrCameraScanner";
import ReportCheckInIssueModal from "./ReportCheckInIssueModal";

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

const DEFAULT_CHECKLIST = [
  { itemName: "Door & Electronic Lock", condition: "good", notes: "" },
  { itemName: "Interior Cleanliness & Dryness", condition: "good", notes: "" },
];

export default function StaffReservationLookup({ facilityId: propFacilityId = null, onCheckInComplete }) {
  const { t } = useLanguage();
  const [resolvedFacilityId, setResolvedFacilityId] = useState(propFacilityId);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const [reassignReservationId, setReassignReservationId] = useState(null);
  const [qrReassignOpen, setQrReassignOpen] = useState(false);
  const [issueModalTarget, setIssueModalTarget] = useState(null);

  // Active Counter Check-in Modal / Panel state
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [kycMethod, setKycMethod] = useState("government_id");
  const [documentNumber, setDocumentNumber] = useState("");
  const [fullNameMatched, setFullNameMatched] = useState(true);
  const [kycNotes, setKycNotes] = useState("");
  const [overallCondition, setOverallCondition] = useState("good");
  const [checklistItems, setChecklistItems] = useState(DEFAULT_CHECKLIST);
  const [handoverNotes, setHandoverNotes] = useState("");
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [completedCheckIn, setCompletedCheckIn] = useState(null);

  const requestId = useRef(0);

  useEffect(() => {
    if (propFacilityId) {
      setResolvedFacilityId(Number(propFacilityId));
      return;
    }
    let active = true;
    staffCheckInApi
      .getMyFacility()
      .then((info) => {
        if (active && info?.facilityId) setResolvedFacilityId(Number(info.facilityId));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propFacilityId]);

  function openCheckInForm(target) {
    setCheckInTarget(target);
    setDocumentNumber("");
    setFullNameMatched(true);
    setKycNotes("");
    setOverallCondition("good");
    setChecklistItems(DEFAULT_CHECKLIST.map((x) => ({ ...x })));
    setHandoverNotes("");
    setError("");
  }

  async function verifyQrCode(rawCode) {
    const code = String(rawCode || query || "").trim();
    if (!code) {
      setError("Vui lòng nhập hoặc quét mã QR check-in (định dạng v1...).");
      return;
    }
    if (!resolvedFacilityId) {
      setError("Không xác định được cơ sở được phân công.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setToastMsg("");
    setQrData(null);
    setSearched(true);

    try {
      const verified = await staffCheckInApi.verifyQr({
        qrToken: code,
        facilityId: Number(resolvedFacilityId),
      });
      if (currentRequest !== requestId.current) return;
      setQrData(verified);
      setResults([]);
      setToastMsg(`Mã QR hợp lệ cho đơn ${verified?.reservation?.reservationCode || ""}`);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err?.message || "Mã QR không hợp lệ hoặc không thuộc cơ sở của bạn.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  async function search(keyword = query.trim()) {
    const trimmed = String(keyword || "").trim();
    if (!trimmed) {
      setError("Nhập mã đặt chỗ (RSV-...), tên, hoặc số điện thoại khách hàng.");
      return;
    }
    if (trimmed.startsWith("v1.")) {
      return verifyQrCode(trimmed);
    }
    if (!resolvedFacilityId) {
      setError("Không xác định được cơ sở được phân công.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setToastMsg("");
    setQrData(null);
    setSearched(true);

    try {
      const list = await staffCheckInApi.lookupReservations({
        facilityId: Number(resolvedFacilityId),
        query: trimmed,
        status: "confirmed",
      });
      if (currentRequest !== requestId.current) return;
      setResults(list);
      if (list.length === 0) {
        setToastMsg("Không tìm thấy đơn đặt chỗ đã xác nhận (confirmed) khớp từ khóa.");
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err?.message || "Không thể tra cứu đơn đặt chỗ.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  async function submitCheckInConfirm(event) {
    event.preventDefault();
    if (!checkInTarget) return;
    if (!documentNumber.trim()) {
      setError("Vui lòng nhập số CCCD / Hộ chiếu của khách hàng.");
      return;
    }
    if (!fullNameMatched) {
      setError("Cần xác nhận họ tên giấy tờ khớp với khách hàng đặt chỗ.");
      return;
    }

    setSubmittingCheckIn(true);
    setError("");
    try {
      const res = await staffCheckInApi.confirmCheckIn({
        reservationId: Number(checkInTarget.reservationId),
        overrideUnitId: null,
        identityVerification: {
          method: kycMethod,
          documentNumber: documentNumber.trim(),
          fullNameMatched: Boolean(fullNameMatched),
          notes: kycNotes.trim() || undefined,
        },
        inspection: {
          overallCondition,
          summary: handoverNotes.trim() || "Counter check-in inspection completed.",
          items: checklistItems,
        },
        notes: handoverNotes.trim() || undefined,
      });

      setCompletedCheckIn(res);
      setCheckInTarget(null);
      setQrData(null);
      setResults((prev) => prev.filter((r) => r.reservationId !== checkInTarget.reservationId));
      setToastMsg(`Check-in hoàn tất! Hợp đồng ${res.agreementNo} đang hoạt động tại kho ${res.unitCode}.`);
      if (onCheckInComplete) await onCheckInComplete(res);
    } catch (err) {
      setError(err?.message || "Không thể hoàn tất bàn giao check-in.");
    } finally {
      setSubmittingCheckIn(false);
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    search(query.trim());
  }

  function handleQrScan(scannedCode) {
    setCameraActive(false);
    setQuery(scannedCode);
    if (String(scannedCode).startsWith("v1.")) {
      verifyQrCode(scannedCode);
    } else {
      search(scannedCode);
    }
  }

  return (
    <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-zinc-900">qr_code_scanner</span>
          <h2 className="text-[14px] font-bold text-slate-900">
            {t("staff.checkin_handover", "Check-in & Bàn giao tại quầy")}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setCameraActive((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
            cameraActive
              ? "border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {cameraActive ? "videocam_off" : "qr_code_scanner"}
          </span>
          <span>{cameraActive ? t("staff_lookup.close_camera_btn", "Đóng Camera") : t("staff_lookup.scan_qr_btn", "Quét mã QR")}</span>
        </button>
      </div>

      {cameraActive && (
        <div className="mt-4 max-w-md mx-auto">
          <QrCameraScanner onScan={handleQrScan} onClose={() => setCameraActive(false)} />
        </div>
      )}

      <form onSubmit={submitSearch} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-[260px] flex-1 text-xs font-semibold text-[#58657a]">
          {t("staff_lookup.enter_code", "Mã đặt chỗ (RSV-...) / Tên / SĐT hoặc Token QR (v1...)")}
          <input
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: RSV-20261117-00001, SĐT khách, hoặc dán token QR..."
            className="mt-1 w-full rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-zinc-900"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-[9px] bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? t("staff_lookup.searching", "Đang tìm...") : t("staff_lookup.search_action", "Tra cứu")}
          </button>

          <button
            type="button"
            disabled={loading || !query.trim()}
            onClick={() => verifyQrCode(query.trim())}
            className="rounded-[9px] border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
          >
            {t("staff_lookup.verify_qr", "Xác minh QR")}
          </button>
        </div>
      </form>

      {toastMsg && (
        <div role="status" className="mt-3 flex items-center gap-2 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-3 text-xs font-bold text-[#027a48]">
          <span className="material-symbols-outlined text-[18px] text-[#12b76a]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* 1-Time Issued PIN Display Banner after Atomic Check-in */}
      {completedCheckIn && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Check-in & Bàn giao thành công</div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                Hợp đồng {completedCheckIn.agreementNo} · Ô kho {completedCheckIn.unitCode} ({completedCheckIn.unitStatus})
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Mã PIN 6 số dùng 1 lần để mở khóa thông minh (vui lòng cấp trực tiếp cho khách):
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white px-4 py-2 font-mono text-2xl font-black tracking-[0.25em] text-emerald-700 border border-emerald-300">
                {completedCheckIn.issuedPin}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(completedCheckIn.issuedPin);
                  setToastMsg("Đã sao chép mã PIN.");
                }}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                Copy PIN
              </button>
              <button
                type="button"
                onClick={() => setCompletedCheckIn(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Check-in QR Card */}
      {qrData && (
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50/70 via-white to-blue-50/60 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">verified_user</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  QR Hợp lệ · Đơn {qrData.reservation?.reservationCode}
                </h3>
                <p className="text-xs text-slate-600">Khách hàng: {qrData.customer?.fullName} ({qrData.customer?.phoneNumber || "—"})</p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 uppercase">
              {qrData.reservation?.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
              <div className="font-bold text-slate-800">Thông tin khách hàng</div>
              <div className="font-semibold text-slate-900">{qrData.customer?.fullName}</div>
              <div className="text-slate-600">SĐT: {qrData.customer?.phoneNumber || "—"}</div>
              <div className="text-slate-600">CCCD đăng ký: <strong>{qrData.customer?.identityNumberMasked || "—"}</strong></div>
              <div className="text-slate-600 truncate">Email: {qrData.customer?.email || "—"}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
              <div className="font-bold text-slate-800">Ô kho & Hợp đồng</div>
              <div>Ô kho: <strong>{qrData.unit?.unitCode || "Chưa gán"}</strong> ({qrData.unit?.unitTypeName || "—"})</div>
              <div>Hợp đồng: <strong>{qrData.agreement?.agreementNo || "Draft"}</strong></div>
              <div>Thời hạn: {qrData.reservation?.startDate} → {qrData.reservation?.endDate}</div>
            </div>
          </div>

          {Array.isArray(qrData.availableBackupUnits) && qrData.availableBackupUnits.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
              <div className="font-bold text-amber-900 mb-1.5">
                Ô kho dự phòng cùng loại & kích thước ({qrData.availableBackupUnits.length} ô sẵn sàng):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {qrData.availableBackupUnits.slice(0, 8).map((bu) => (
                  <button
                    key={bu.unitId}
                    type="button"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await staffCheckInApi.assignUnit(qrData.reservation.reservationId, {
                          storageUnitId: bu.unitId,
                          reason: "Đổi sang ô kho dự phòng tại quầy",
                        });
                        setToastMsg(`Đã đổi sang ô kho dự phòng ${bu.unitCode}.`);
                        await verifyQrCode(query);
                      } catch (err) {
                        setError(err?.message || "Không thể đổi ô kho dự phòng.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Đổi sang {bu.unitCode}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-indigo-100 pt-3">
            <button
              type="button"
              onClick={() =>
                setIssueModalTarget({
                  facilityId: qrData.unit?.facilityId || resolvedFacilityId,
                  reservationId: qrData.reservation?.reservationId,
                  agreementId: qrData.agreement?.agreementId,
                  storageUnitId: qrData.unit?.unitId,
                  unitCode: qrData.unit?.unitCode,
                  agreementNo: qrData.agreement?.agreementNo,
                  customerName: qrData.customer?.fullName,
                })
              }
              className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              Báo sự cố
            </button>

            <button
              type="button"
              onClick={() => setQrReassignOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>{qrReassignOpen ? "Đóng đổi kho" : "Đổi ô kho"}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                openCheckInForm({
                  reservationId: qrData.reservation?.reservationId,
                  reservationCode: qrData.reservation?.reservationCode,
                  customerName: qrData.customer?.fullName,
                  unitCode: qrData.unit?.unitCode,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e7b4c] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0b633d]"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Tiến hành KYC & Bàn giao</span>
            </button>
          </div>

          {qrReassignOpen && qrData.reservation?.reservationId && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">
              <StaffAssignUnit
                reservationId={qrData.reservation.reservationId}
                facilityId={qrData.unit?.facilityId || resolvedFacilityId}
                unitTypeId={qrData.availableBackupUnits?.[0]?.unitTypeId}
                currentUnitCode={qrData.unit?.unitCode}
                onAssigned={async () => {
                  setQrReassignOpen(false);
                  await verifyQrCode(query);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Counter KYC + Inspection Check-in Panel */}
      {checkInTarget && (
        <form onSubmit={submitCheckInConfirm} className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Xác thực KYC & Bàn giao kho · {checkInTarget.reservationCode}
              </h3>
              <p className="text-xs text-slate-600">
                Khách hàng: {checkInTarget.customerName} · Ô kho: {checkInTarget.unitCode || "Chưa gán"}
              </p>
            </div>
            <button type="button" onClick={() => setCheckInTarget(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Hủy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <label className="font-semibold text-slate-700">
              Loại giấy tờ (KYC)
              <select
                value={kycMethod}
                onChange={(e) => setKycMethod(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-2 text-xs"
              >
                <option value="government_id">CCCD / CMND</option>
                <option value="passport">Hộ chiếu (Passport)</option>
                <option value="digital_identity">VNeID / Định danh số</option>
                <option value="manual">Xác minh trực tiếp</option>
              </select>
            </label>

            <label className="font-semibold text-slate-700">
              Số giấy tờ (CCCD / Passport)
              <input
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="VD: 079200008901"
                className="mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-2 text-xs"
              />
            </label>

            <label className="font-semibold text-slate-700">
              Tình trạng kho bàn giao
              <select
                value={overallCondition}
                onChange={(e) => setOverallCondition(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-2 text-xs"
              >
                <option value="good">Tốt (Good)</option>
                <option value="acceptable">Đạt yêu cầu (Acceptable)</option>
                <option value="damaged">Có hư hỏng nhẹ (Damaged)</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={fullNameMatched}
              onChange={(e) => setFullNameMatched(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            <span>Xác nhận ảnh & họ tên trên giấy tờ khớp với tài khoản đặt chỗ</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {checklistItems.map((item, idx) => (
              <div key={item.itemName} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="font-medium text-slate-800">{item.itemName}</span>
                <select
                  value={item.condition}
                  onChange={(e) =>
                    setChecklistItems((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, condition: e.target.value } : p))
                    )
                  }
                  className="rounded border border-slate-200 px-2 py-1 text-xs"
                >
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              value={kycNotes}
              onChange={(e) => setKycNotes(e.target.value)}
              placeholder="Ghi chú xác minh CCCD (tùy chọn)"
              className="rounded-lg border border-[#dfe7f5] bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="Ghi chú biên bản bàn giao (tùy chọn)"
              className="rounded-lg border border-[#dfe7f5] bg-white px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={submittingCheckIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e7b4c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b633d] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{submittingCheckIn ? "Đang kích hoạt..." : "Hoàn tất bàn giao & Cấp mã PIN"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Lookup Reservation List */}
      {searched && results.length > 0 && (
        <div className="mt-4 grid gap-3">
          {results.map((item) => {
            const isReassignOpen = reassignReservationId === item.reservationId;
            return (
              <article key={item.reservationId} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3.5 text-xs shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-[#0b1c30]">{item.reservationCode}</strong>
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-semibold text-zinc-900">
                      {item.status}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(item.quotedTotal)}</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <span className="font-semibold text-slate-800">{item.customerName}</span>
                  <span className="text-right text-slate-500">{item.customerPhone || "—"}</span>
                  <span className="text-slate-600">
                    Ô kho: <strong>{item.assignedUnitCode || "Chưa gán"}</strong> ({item.unitTypeName})
                  </span>
                  <span className="text-right text-slate-500">
                    {item.startDate} → {item.endDate}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-[#dfe7f5] pt-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setIssueModalTarget({
                        facilityId: item.facilityId || resolvedFacilityId,
                        reservationId: item.reservationId,
                        storageUnitId: item.assignedUnitId,
                        unitCode: item.assignedUnitCode,
                        customerName: item.customerName,
                      })
                    }
                    className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Báo sự cố
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassignReservationId(isReassignOpen ? null : item.reservationId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>{isReassignOpen ? "Đóng đổi kho" : "Đổi ô kho"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCheckInForm({
                        reservationId: item.reservationId,
                        reservationCode: item.reservationCode,
                        customerName: item.customerName,
                        unitCode: item.assignedUnitCode,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e7b4c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0b633d]"
                  >
                    <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                    <span>KYC & Bàn giao</span>
                  </button>
                </div>

                {(isReassignOpen || !item.assignedUnitCode) && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">
                    <StaffAssignUnit
                      reservationId={item.reservationId}
                      facilityId={item.facilityId}
                      unitTypeId={item.unitTypeId}
                      currentUnitCode={item.assignedUnitCode}
                      onAssigned={async () => {
                        setReassignReservationId(null);
                        await search(query.trim() || item.reservationCode);
                      }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ReportCheckInIssueModal
        target={issueModalTarget}
        isOpen={Boolean(issueModalTarget)}
        onClose={() => setIssueModalTarget(null)}
        onSuccess={() => {
          setToastMsg("Đã tạo ticket báo sự cố check-in thành công.");
        }}
        isStaff
      />
    </section>
  );
}
