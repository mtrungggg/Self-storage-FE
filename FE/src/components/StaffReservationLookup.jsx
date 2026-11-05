import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";

import staffReservationService from "../api/staffReservationService";

import staffFacilityService from "../api/staffFacilityService";

import staffQrService from "../api/staffQrService";

import StaffAssignUnit from "./StaffAssignUnit";

import QrCameraScanner from "./QrCameraScanner";

import ReportCheckInIssueModal from "./ReportCheckInIssueModal";

import STORAGE_KEYS from "../constants/storageKeys";



function formatMoney(value) {

  if (value == null) return "—";

  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

}



function getStoredFacilityCheckIns() {

  try {

    const raw = localStorage.getItem(STORAGE_KEYS.FACILITY_CHECKINS);

    return raw ? JSON.parse(raw) : [];

  } catch {

    return [];

  }

}



function parseCheckInQr(raw) {

  const text = String(raw || "").trim();

  if (text.startsWith("CHK|")) {

    const [, unitCode = "", agreementNo = "", reservationCode = "", facilityId = ""] = text.split("|");

    return {

      isQrPayload: true,

      unitCode: unitCode.trim(),

      agreementNo: agreementNo.trim(),

      reservationCode: reservationCode.trim(),

      facilityId: facilityId.trim(),

    };

  }

  return {

    isQrPayload: false,

    unitCode: "",

    agreementNo: "",

    reservationCode: "",

    facilityId: "",

  };

}



function shortTime(timeLabel) {

  return String(timeLabel || "").split(" ")[0] || "just now";

}



function compactUnitType(unitTypeName) {

  const name = String(unitTypeName || "").toLowerCase();

  const area = String(unitTypeName || "").match(/\d+(?:[.,]\d+)?\s*m[²2]?/i)?.[0]?.replace("m2", "m²") || "";

  const size = name.includes("extra large") ? "XL" : name.includes("large") ? "Large" : name.includes("medium") ? "Medium" : name.includes("small") ? "Small" : name.includes("mini") ? "Mini" : "Storage";

  const condition = name.includes("seafood") || name.includes("freeze") || name.includes("cold") ? "Cold" : name.includes("warm") || name.includes("heat") ? "Warm" : name.includes("climate") ? "Climate" : "Dry";

  return [size, condition, area].filter(Boolean).join(" · ");

}



export default function StaffReservationLookup() {
  const { t, formatCurrency, translateStatus } = useLanguage();

  const [query, setQuery] = useState("");

  const [facilityId, setFacilityId] = useState("");

  const [results, setResults] = useState([]);

  const [matchedUnits, setMatchedUnits] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searched, setSearched] = useState(false);

  const [error, setError] = useState("");

  const [cameraActive, setCameraActive] = useState(false);

  const [checkIns, setCheckIns] = useState(() => getStoredFacilityCheckIns());

  const [toastMsg, setToastMsg] = useState("");



  // Reassign & Handover states (Module 1.3: Đổi ô kho tương đương & Xác nhận bàn giao)

  const [reassignReservationId, setReassignReservationId] = useState(null);

  const [handoverLoadingId, setHandoverLoadingId] = useState(null);

  const [completedHandovers, setCompletedHandovers] = useState({});

  const [qrReassignOpen, setQrReassignOpen] = useState(false);



  // QR Verify & Action state (STT 7 & STT 8)

  const [qrData, setQrData] = useState(null);

  const [qrNotes, setQrNotes] = useState("");

  const [qrActionLoading, setQrActionLoading] = useState(false);

  const [qrActionSuccess, setQrActionSuccess] = useState("");

  const [qrActionResult, setQrActionResult] = useState(null);

  const [issueModalTarget, setIssueModalTarget] = useState(null);



  const requestId = useRef(0);



  useEffect(() => {

    const onStorage = () => setCheckIns(getStoredFacilityCheckIns());

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);

  }, []);



  function confirmFacilityCheckIn({ unitCode, agreementNo, reservationCode, customerName, facilityCode }) {

    const now = new Date();

    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} today`;

    const record = {

      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

      unitCode: unitCode || "—",

      agreementNo: agreementNo || "",

      reservationCode: reservationCode || "",

      customerName: customerName || "Storage customer",

      facilityCode: facilityCode || "HCM-TD",

      checkedInAt: now.toISOString(),

      timeLabel,

    };



    const existing = getStoredFacilityCheckIns().filter(

      (c) =>

        !(

          (record.agreementNo && c.agreementNo === record.agreementNo) ||

          (record.unitCode && record.unitCode !== "—" && c.unitCode === record.unitCode)

        )

    );

    const updated = [record, ...existing].slice(0, 30);

    localStorage.setItem(STORAGE_KEYS.FACILITY_CHECKINS, JSON.stringify(updated));

    setCheckIns(updated);

    setQuery("");



    try {

      const channel = new BroadcastChannel("g1_facility_checkin");

      channel.postMessage(record);

      channel.close();

    } catch {

      // BroadcastChannel not supported

    }



    setToastMsg(`Đã bàn giao kho · ${record.unitCode !== "—" ? `Kho ${record.unitCode}` : record.reservationCode || record.agreementNo} · ${shortTime(timeLabel)}`);

  }



  function isAlreadyCheckedIn({ unitCode, agreementNo, reservationCode }) {

    return checkIns.find(

      (c) =>

        (agreementNo && c.agreementNo === agreementNo) ||

        (unitCode && c.unitCode === unitCode) ||

        (reservationCode && c.reservationCode === reservationCode)

    );

  }



  /**

   * Xác nhận bàn giao kho (POST /api/staff/handovers)

   */

  async function handleConfirmHandover(item) {

    const reservationId = item.reservationId;

    const resolvedUnitCode = item.assignedUnitCode || item.unitCode;

    setHandoverLoadingId(reservationId);

    setError("");

    setToastMsg("");



    try {

      // Gọi API POST /api/staff/handovers (Chuẩn hóa handoverType: check_in)

      const payload = {

        reservationId: Number(reservationId),

        handoverType: "check_in",

        overallCondition: "good",

        unitCode: resolvedUnitCode || undefined,

        notes: "Xác nhận bàn giao kho cho khách hàng tại quầy.",

      };



      await staffReservationService.createHandover(payload);



      confirmFacilityCheckIn({

        unitCode: resolvedUnitCode,

        reservationCode: item.reservationCode,

        customerName: item.customerName,

        facilityCode: item.facilityCode,

      });



      setCompletedHandovers((prev) => ({ ...prev, [reservationId]: true }));

      setToastMsg(`Bàn giao kho thành công · ${resolvedUnitCode ? `Kho ${resolvedUnitCode}` : item.reservationCode}`);

    } catch (err) {

      setError(err.message || "Không thể hoàn tất bàn giao.");

    } finally {

      setHandoverLoadingId(null);

    }

  }



  /**

   * STT 7: Quét / Xác minh mã QR

   * {t("staff_lookup.verify_qr", "Xác minh QR")}

   */

  async function verifyQrCode(rawCode) {

    const code = String(rawCode || query || "").trim();

    if (!code) {

      setError("Vui lòng nhập hoặc quét mã QR.");

      return;

    }



    const currentRequest = ++requestId.current;

    setLoading(true);

    setError("");

    setToastMsg("");

    setQrActionSuccess("");

    setQrData(null);

    setSearched(true);



    try {

      const verified = await staffQrService.verify({ qrCode: code });

      if (currentRequest !== requestId.current) return;

      if (verified) {

        setQrData(verified);

        setToastMsg(`Mã QR hợp lệ: ${verified.title || verified.actionType || "Xác minh thành công"}`);

        setResults([]);

        setMatchedUnits([]);

        return;

      }

    } catch (err) {

      if (currentRequest !== requestId.current) return;

      console.warn("QR verify endpoint failed, falling back to lookup:", err.message);

    }



    // Fallback to standard reservation & unit search

    await search(code, true, true);

  }



  /**

   * STT 8: Xác nhận hành động từ mã QR

   * POST /api/staff/qr/confirm-action & POST /api/staff/handovers nếu là check-in

   */

  async function handleConfirmQrAction(actionName) {

    if (!qrData || qrActionLoading) return;

    setQrActionLoading(true);

    setQrActionSuccess("");

    setQrActionResult(null);

    setError("");



    try {

      const payload = {

        actionType: actionName || qrData.actionType || "",

        reservationId: qrData.reservation?.reservationId || null,

        agreementId: qrData.agreement?.agreementId || null,

        transferRequestId: qrData.transferRequest?.transferRequestId || null,

        moveOutId: qrData.moveOutId || qrData.agreement?.moveOutId || null,

        unitId: qrData.unit?.unitId || qrData.agreement?.unitId || null,

        notes: qrNotes.trim(),

      };



      const result = await staffQrService.confirmAction(payload);

      setQrActionResult(result);

      setQrActionSuccess(result?.message || `Xử lý hành động "${payload.actionType}" thành công!`);



      // Nếu hành động là nhận kho/check-in, gọi đồng thời handover API

      if (payload.reservationId) {

        await staffReservationService.createHandover({

          reservationId: Number(payload.reservationId),

          handoverType: "check_in",

          overallCondition: "good",

          notes: "Xác nhận bàn giao từ mã QR.",

        });

      }



      const unitCode = qrData.unit?.unitCode || qrData.agreement?.unitCode;

      if (unitCode) {

        confirmFacilityCheckIn({

          unitCode,

          agreementNo: qrData.agreement?.agreementNo,

          reservationCode: qrData.reservation?.reservationCode,

          customerName: qrData.customer?.fullName,

          facilityCode: qrData.unit?.facilityName || qrData.agreement?.facilityName,

        });

      }

    } catch (err) {

      setError(err.message || "Không thể xác nhận hành động QR.");

    } finally {

      setQrActionLoading(false);

    }

  }



  async function search(keyword = query.trim(), clearResults = true, autoCheckInOnScan = false) {

    if (!keyword) {

      setError("Nhập mã đặt chỗ, số điện thoại hoặc chuỗi QR để tra cứu.");

      return;

    }



    const currentRequest = ++requestId.current;

    setLoading(true);

    setError("");

    setToastMsg("");

    setSearched(true);

    setQrData(null);

    if (clearResults) {

      setResults([]);

      setMatchedUnits([]);

    }



    const parsed = parseCheckInQr(keyword);

    const targetFacilityId = facilityId || parsed.facilityId || "";

    const lookupKeyword = parsed.isQrPayload

      ? parsed.reservationCode || parsed.unitCode || parsed.agreementNo

      : keyword;



    try {

      const [rsvRes, units1Res, units2Res] = await Promise.allSettled([

        lookupKeyword ? staffReservationService.lookup(lookupKeyword, targetFacilityId) : Promise.resolve([]),

        staffFacilityService.getUnits(Number(targetFacilityId || 1)),

        !targetFacilityId ? staffFacilityService.getUnits(2) : Promise.resolve([]),

      ]);



      if (currentRequest !== requestId.current) return;



      const rsvList = rsvRes.status === "fulfilled" && Array.isArray(rsvRes.value) ? rsvRes.value : [];

      const allUnits = [

        ...(units1Res.status === "fulfilled" && Array.isArray(units1Res.value) ? units1Res.value : []),

        ...(units2Res.status === "fulfilled" && Array.isArray(units2Res.value) ? units2Res.value : []),

      ];



      const lowerKey = keyword.toLowerCase();

      const unitMatches = allUnits.filter((u) => {

        if (parsed.isQrPayload) {

          return (

            (parsed.unitCode && String(u.unitCode || "").toLowerCase() === parsed.unitCode.toLowerCase()) ||

            (parsed.agreementNo && String(u.currentAgreementNo || "").toLowerCase() === parsed.agreementNo.toLowerCase())

          );

        }

        return (

          String(u.unitCode || "").toLowerCase().includes(lowerKey) ||

          String(u.currentAgreementNo || "").toLowerCase().includes(lowerKey) ||

          String(u.customerName || "").toLowerCase().includes(lowerKey)

        );

      });



      const finalUnitMatches =

        unitMatches.length > 0

          ? unitMatches

          : parsed.isQrPayload

          ? [

              {

                unitId: `qr-${parsed.unitCode}`,

                unitCode: parsed.unitCode,

                currentAgreementNo: parsed.agreementNo,

                customerName: rsvList[0]?.customerName || "Customer (valid QR code)",

                unitTypeName: rsvList[0]?.unitTypeName || "Active Rental Unit",

                status: "occupied",

                currentRate: rsvList[0]?.quotedTotal || null,

              },

            ]

          : [];



      setResults(rsvList);

      setMatchedUnits(finalUnitMatches);



      if (autoCheckInOnScan) {

        if (finalUnitMatches.length > 0) {

          const u = finalUnitMatches[0];

          confirmFacilityCheckIn({

            unitCode: u.unitCode,

            agreementNo: u.currentAgreementNo || parsed.agreementNo,

            reservationCode: parsed.reservationCode || rsvList[0]?.reservationCode,

            customerName: u.customerName || rsvList[0]?.customerName,

          });

        } else if (rsvList.length > 0) {

          const r = rsvList[0];

          confirmFacilityCheckIn({

            unitCode: r.assignedUnitCode || r.unitCode,

            agreementNo: parsed.agreementNo,

            reservationCode: r.reservationCode,

            customerName: r.customerName,

            facilityCode: r.facilityCode,

          });

        }

      }

    } catch (err) {

      if (currentRequest === requestId.current) {

        setError(err.message || "Không thể tra cứu đơn đặt chỗ.");

      }

    } finally {

      if (currentRequest === requestId.current) setLoading(false);

    }

  }



  function submit(event) {

    event.preventDefault();

    search(query.trim(), true, false);

  }



  function handleQrScan(scannedCode) {

    setCameraActive(false);

    setQuery(scannedCode);

    verifyQrCode(scannedCode);

  }



  return (

    <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="material-symbols-outlined text-zinc-900 dark:text-zinc-100">qr_code_scanner</span>

          <div>

            <h2 className="text-[14px] font-bold text-slate-900">{t("staff.checkin_handover", "Check-in & Bàn giao")}</h2>

            

          </div>

        </div>

        <button

          type="button"

          onClick={() => setCameraActive((v) => !v)}

          className={`inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${

            cameraActive

              ? "border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"

              : "bg-zinc-900 text-white text-white hover:bg-zinc-800 shadow-sm hover:shadow"

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

          <QrCameraScanner

            onScan={handleQrScan}

            onClose={() => setCameraActive(false)}

          />

        </div>

      )}



      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-3">

        <label className="min-w-[260px] flex-1 text-xs font-semibold text-[#58657a]">

          {t("staff_lookup.enter_code", "Mã đặt chỗ / Số điện thoại / Chuỗi QR")}

          <input

            autoComplete="off"

            value={query}

            onChange={(event) => setQuery(event.target.value)}

            placeholder={t("staff_lookup.lookup_input_placeholder", "VD: RSV-1002, số ĐT khách, hoặc dán chuỗi QR...")}

            className="mt-1 w-full rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100"

          />

        </label>

        <label className="text-xs font-semibold text-[#58657a]">

          {t("common.facility", "Cơ sở")} (ID)

          <input

            type="number"

            min="1"

            step="1"

            value={facilityId}

            onChange={(event) => setFacilityId(event.target.value)}

            className="mt-1 block w-24 rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100"

          />

        </label>

        <div className="flex gap-2">

          <button

            type="submit"

            disabled={loading}

            className="rounded-[9px] bg-zinc-900 text-white px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"

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



      {/* STT 7 & STT 8: Verified QR Action Card */}

      {qrData && (

        <div className="mt-4 rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50/70 via-white to-blue-50/60 p-4 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">

            <div className="flex items-center gap-2">

              <span className="material-symbols-outlined text-indigo-600 text-[22px]">verified_user</span>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="font-bold text-slate-900 text-sm">{qrData.title || t("staff_lookup.qr_result_title", "Kết quả xác minh QR")}</h3>

                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">

                    {qrData.actionType || "Check-in / Handover"}

                  </span>

                </div>

                {qrData.description && (

                  <p className="text-xs text-slate-600 mt-0.5">{qrData.description}</p>

                )}

              </div>

            </div>

            <span className="text-[11px] font-mono text-slate-500">

              {t("staff_lookup.verify_qr", "Xác minh QR")}

            </span>

          </div>



          {/* Details grid: Customer, Unit/Agreement, Transfer */}

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">

            {/* Customer Info */}

            {qrData.customer && (

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">

                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">

                  <span className="material-symbols-outlined text-[16px] text-slate-500">person</span>

                  Thông tin khách hàng

                </div>

                <div className="text-slate-900 font-semibold">{qrData.customer.fullName || "—"}</div>

                <div className="text-slate-600">📞 {qrData.customer.phoneNumber || "—"}</div>

                <div className="text-slate-600 truncate">✉️ {qrData.customer.email || "—"}</div>

              </div>

            )}



            {/* Unit & Agreement Info */}

            {(qrData.unit || qrData.agreement) && (

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">

                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">

                  <span className="material-symbols-outlined text-[16px] text-slate-500">warehouse</span>

                  Ô kho & Hợp đồng

                </div>

                <div className="text-slate-900">

                  Ô kho: <strong>{qrData.unit?.unitCode || qrData.agreement?.unitCode || "—"}</strong>

                  {qrData.unit?.unitTypeName && <span className="text-slate-500"> ({qrData.unit.unitTypeName})</span>}

                </div>

                {qrData.agreement?.agreementNo && (

                  <div className="text-slate-600">Hợp đồng: <span className="font-mono font-semibold">{qrData.agreement.agreementNo}</span></div>

                )}

                {qrData.unit?.physicalStatus && (

                  <div className="text-slate-600">Trạng thái kho: <span className="font-semibold text-emerald-700">{qrData.unit.physicalStatus}</span></div>

                )}

                {qrData.agreement?.facilityName && (

                  <div className="text-slate-500 truncate">Cơ sở: {qrData.agreement.facilityName}</div>

                )}

              </div>

            )}



            {/* Transfer Request Info (if applicable) */}

            {qrData.transferRequest && (

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">

                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">

                  <span className="material-symbols-outlined text-[16px] text-slate-500">sync_alt</span>

                  Yêu cầu chuyển kho

                </div>

                <div className="text-slate-900">

                  Từ: <strong>{qrData.transferRequest.fromUnitCode}</strong> ({qrData.transferRequest.fromFacilityName})

                </div>

                <div className="text-slate-900">

                  Sang: <strong>{qrData.transferRequest.toUnitCode}</strong> ({qrData.transferRequest.toFacilityName})

                </div>

                <div className="text-slate-600">Trạng thái: <span className="font-semibold text-blue-700">{qrData.transferRequest.status}</span></div>

              </div>

            )}

          </div>



          {/* Nút Đổi ô kho tương đương trên QR Card nếu có Reservation */}

          {qrData.reservation?.reservationId && (

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100 pt-2.5">

              <div className="text-xs text-slate-700">

                {t("staff_lookup.reservation_order", "Đơn đặt")}: <strong className="font-mono">{qrData.reservation.reservationCode || `#${qrData.reservation.reservationId}`}</strong>

                {(qrData.unit?.unitCode || qrData.reservation.unitCode) && (

                  <span> · Ô kho: <strong>{qrData.unit?.unitCode || qrData.reservation.unitCode}</strong></span>

                )}

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button

                  type="button"

                  onClick={() =>

                    setIssueModalTarget({

                      unitCode: qrData.unit?.unitCode || qrData.reservation?.unitCode,

                      agreementNo: qrData.agreement?.agreementNo,

                      customerName: qrData.customer?.fullName,

                      storageUnitId: qrData.unit?.storageUnitId || qrData.unit?.unitId,

                      agreementId: qrData.agreement?.id || qrData.agreement?.agreementId,

                      facilityId: qrData.agreement?.facilityId || qrData.unit?.facilityId || facilityId,

                    })

                  }

                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 shadow-xs cursor-pointer"

                  title="Báo cáo sự cố kho cho Facility Manager khi kho bẩn hoặc hỏng"

                >

                  <span className="material-symbols-outlined text-[15px]">report_problem</span>

                  <span>Báo sự cố kho</span>

                </button>

                <button

                  type="button"

                  onClick={() => setQrReassignOpen((v) => !v)}

                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 shadow-xs"

                  title="Xử lý trường hợp kho bẩn hoặc kẹt cửa khi khách đến"

                >

                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>

                  <span>{qrReassignOpen ? "Đóng đổi kho" : "Đổi ô kho tương đương"}</span>

                </button>

              </div>

            </div>

          )}



          {/* Form đổi kho trên QR card */}

          {qrReassignOpen && qrData.reservation?.reservationId && (

            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">

              <div className="mb-1 text-[11px] font-semibold text-amber-900 flex items-center gap-1">

                <span className="material-symbols-outlined text-[15px]">build_circle</span>

                Đổi sang ô kho tương đương khi kho hiện tại bị bẩn hoặc kẹt cửa:

              </div>

              <StaffAssignUnit

                reservationId={qrData.reservation.reservationId}

                facilityId={qrData.reservation.facilityId || qrData.agreement?.facilityId || facilityId}

                currentUnitCode={qrData.unit?.unitCode || qrData.reservation.unitCode}

                onAssigned={async () => {

                  setQrReassignOpen(false);

                  setToastMsg("Đã đổi ô kho tương đương thành công.");

                }}

              />

            </div>

          )}



          {/* Notes input for confirm-action */}

          <div className="mt-3 border-t border-indigo-100 pt-3">

            <label className="block text-xs font-semibold text-slate-700">

              Ghi chú bàn giao / kiểm tra:

              <input

                type="text"

                value={qrNotes}

                onChange={(e) => setQrNotes(e.target.value)}

                placeholder="VD: Đã đối chiếu CCCD, chìa khóa/khoá mã số hoạt động tốt..."

                className="mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"

              />

            </label>

          </div>



          {/* Allowed Actions */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

            <div className="text-xs text-slate-600">

              Xác nhận thao tác bàn giao / nhận kho:

            </div>

            <div className="flex flex-wrap gap-2">

              {Array.isArray(qrData.allowedActions) && qrData.allowedActions.length > 0 ? (

                qrData.allowedActions.map((actionName) => (

                  <button

                    key={actionName}

                    type="button"

                    disabled={qrActionLoading}

                    onClick={() => handleConfirmQrAction(actionName)}

                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition disabled:opacity-50"

                  >

                    <span className="material-symbols-outlined text-[16px]">how_to_reg</span>

                    <span>Xác nhận: {actionName}</span>

                  </button>

                ))

              ) : (

                <button

                  type="button"

                  disabled={qrActionLoading}

                  onClick={() => handleConfirmQrAction(qrData.actionType || "confirm")}

                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition disabled:opacity-50"

                >

                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>

                  <span>Xác nhận bàn giao</span>

                </button>

              )}

            </div>

          </div>



          {qrActionResult && (

            <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 space-y-1">

              <div className="font-bold text-emerald-800 flex items-center gap-1.5">

                <span className="material-symbols-outlined text-emerald-600 text-[18px]">done_all</span>

                <span>{qrActionResult.message || qrActionSuccess || "Đã bàn giao kho thành công."}</span>

              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-slate-700">

                {qrActionResult.actionType && (

                  <span>Hành động: <strong>{qrActionResult.actionType}</strong></span>

                )}

                {qrActionResult.agreementId > 0 && (

                  <span>Hợp đồng #{qrActionResult.agreementId}: <strong className="text-emerald-700">{qrActionResult.agreementStatus || "Đang hoạt động"}</strong></span>

                )}

                {qrActionResult.unitId > 0 && (

                  <span>Kho #{qrActionResult.unitId}: <strong className="text-emerald-700">{qrActionResult.unitStatus || "Đã bàn giao"}</strong></span>

                )}

              </div>

            </div>

          )}



          {!qrActionResult && qrActionSuccess && (

            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2">

              <span className="material-symbols-outlined text-emerald-600 text-[18px]">done_all</span>

              {qrActionSuccess}

            </div>

          )}

        </div>

      )}



      {!loading && !error && searched && !qrData && results.length === 0 && matchedUnits.length === 0 && (

        <p className="mt-3 rounded-lg border border-dashed border-[#dfe7f5] p-4 text-center text-xs text-[#8996a9]">Không tìm thấy đơn đặt chỗ hoặc ô kho phù hợp.</p>

      )}



      {/* Matched Active Rental Units / QR Gate Pass Check-in Cards */}

      {matchedUnits.length > 0 && (

        <div className="mt-4 space-y-2.5">

          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">

            Ô kho đang thuê

          </h3>

          <div className="mx-auto grid w-full max-w-3xl gap-3">

            {matchedUnits.map((unit) => {

              const checkedRecord = isAlreadyCheckedIn({

                unitCode: unit.unitCode,

                agreementNo: unit.currentAgreementNo,

              });

              return (

                <article

                  key={unit.unitId || unit.unitCode}

                  className="rounded-xl border border-[#b9ccf0] bg-[#f5f9ff] p-3.5 text-xs shadow-xs"

                >

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <div className="flex items-center gap-1.5">

                      <span className="material-symbols-outlined text-[18px] text-zinc-900 dark:text-zinc-100">warehouse</span>

                      <strong className="text-sm text-[#0b1c30]">Kho {unit.unitCode}</strong>

                    </div>

                    <span className="rounded-full bg-[#ecfdf3] px-2.5 py-0.5 font-bold text-[#027a48]">

                      {checkedRecord ? "Đã check-in" : "Sẵn sàng"}

                    </span>

                  </div>



                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">

                    <span className="font-semibold text-slate-800 truncate">{unit.customerName || "Khách hàng"}</span>

                    <span className="text-slate-500">{compactUnitType(unit.unitTypeName)}</span>

                  </div>



                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe7f5] pt-2.5">

                    {checkedRecord ? (

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#027a48]">

                        <span className="material-symbols-outlined text-[16px]">check_circle</span>

                        Đã check-in · {shortTime(checkedRecord.timeLabel)}

                      </span>

                    ) : (

                      <span className="text-[11px] text-[#58657a]">Chờ xác nhận bàn giao</span>

                    )}

                    <div className="flex flex-wrap items-center gap-2">

                      <button

                        type="button"

                        onClick={() =>

                          setIssueModalTarget({

                            unitCode: unit.unitCode,

                            agreementNo: unit.currentAgreementNo,

                            customerName: unit.customerName,

                            storageUnitId: unit.unitId,

                            facilityId: facilityId || 1,

                          })

                        }

                        className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 shadow-xs cursor-pointer"

                        title="Báo sự cố kho cho Facility Manager khi kho bẩn hoặc hỏng"

                      >

                        <span className="material-symbols-outlined text-[15px]">report_problem</span>

                        <span>Báo sự cố</span>

                      </button>

                      <button

                        type="button"

                        onClick={() =>

                          confirmFacilityCheckIn({

                            unitCode: unit.unitCode,

                            agreementNo: unit.currentAgreementNo,

                            customerName: unit.customerName,

                          })

                        }

                        className="inline-flex items-center gap-1 rounded-lg bg-[#0e7b4c] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0b633d] cursor-pointer"

                      >

                        <span className="material-symbols-outlined text-[15px]">how_to_reg</span>

                        <span>{checkedRecord ? "Bàn giao lại" : "Xác nhận bàn giao"}</span>

                      </button>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        </div>

      )}



      {/* Matched Reservations */}

      {results.length > 0 && (

        <div className="mx-auto mt-4 grid w-full max-w-3xl gap-3">

          <div className="flex items-center justify-between">

            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">

              Danh sách đơn đặt chỗ ({results.length})

            </h3>

            <span className="text-[11px] text-slate-500">Bàn giao ô kho cho khách hàng</span>

          </div>



          {results.map((item) => {

            const resolvedUnitCode = item.assignedUnitCode || item.unitCode;

            const checkedRecord = isAlreadyCheckedIn({

              unitCode: resolvedUnitCode,

              reservationCode: item.reservationCode,

            });

            const isHandedOver = Boolean(completedHandovers[item.reservationId] || checkedRecord);

            const isReassignOpen = reassignReservationId === item.reservationId;



            return (

              <article key={item.reservationId} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3.5 text-xs shadow-xs">

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    <strong className="text-sm font-bold text-[#0b1c30]">{item.reservationCode}</strong>

                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">{item.status || "Confirmed"}</span>

                  </div>

                  {isHandedOver && (

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-[11px] font-bold text-[#027a48]">

                      <span className="material-symbols-outlined text-[14px]">verified</span>

                      Đã bàn giao kho

                    </span>

                  )}

                </div>



                <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">

                  <span className="font-semibold text-slate-800 truncate">{item.customerName || "—"}</span>

                  <span className="text-right text-slate-500">{item.customerPhone || "—"}</span>

                  <span className="text-slate-600">

                    Ô kho chỉ định: <strong className="text-slate-900">{resolvedUnitCode || item.unitTypeName || "Chưa gán"}</strong>

                  </span>

                  <span className="text-right font-bold text-slate-900">{formatMoney(item.quotedTotal)}</span>

                </div>



                {/* Nút Đổi ô kho tương đương trước bước Xác nhận bàn giao */}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe7f5] pt-2.5">

                  {checkedRecord ? (

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027a48]">

                      <span className="material-symbols-outlined text-[15px]">check_circle</span>

                      Đã check-in lúc {shortTime(checkedRecord.timeLabel)}

                    </span>

                  ) : (

                    <span className="text-[11px] text-[#58657a]">Khách đã đến quầy nhận kho</span>

                  )}



                  <div className="flex flex-wrap items-center gap-2">

                    {/* Nút Báo sự cố kho */}

                    <button

                      type="button"

                      onClick={() =>

                        setIssueModalTarget({

                          unitCode: resolvedUnitCode,

                          reservationCode: item.reservationCode,

                          agreementNo: item.agreementNo,

                          customerName: item.customerName,

                          storageUnitId: item.storageUnitId,

                          facilityId: item.facilityId || facilityId,

                        })

                      }

                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 shadow-xs cursor-pointer"

                      title="Báo cáo sự cố kho cho Facility Manager khi kho bẩn hoặc hỏng"

                    >

                      <span className="material-symbols-outlined text-[15px]">report_problem</span>

                      <span>Báo sự cố kho</span>

                    </button>



                    {/* Nút Đổi ô kho tương đương */}

                    <button

                      type="button"

                      onClick={() => setReassignReservationId(isReassignOpen ? null : item.reservationId)}

                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition shadow-xs ${

                        isReassignOpen

                          ? "border-amber-400 bg-amber-100 text-amber-900"

                          : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"

                      }`}

                      title="Xử lý trường hợp kho bẩn hoặc kẹt cửa khi khách đến"

                    >

                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>

                      <span>{isReassignOpen ? "Đóng đổi kho" : "Đổi ô kho tương đương"}</span>

                    </button>



                    {/* Nút Xác nhận bàn giao */}

                    <button

                      type="button"

                      disabled={handoverLoadingId === item.reservationId}

                      onClick={() => handleConfirmHandover(item)}

                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e7b4c] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0b633d] disabled:opacity-50"

                    >

                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>

                      <span>

                        {handoverLoadingId === item.reservationId

                          ? "Đang bàn giao..."

                          : isHandedOver

                          ? "Bàn giao lại"

                          : "Xác nhận bàn giao"}

                      </span>

                    </button>

                  </div>

                </div>



                {/* Form Đổi ô kho khi được mở hoặc khi chưa gán kho */}

                {(isReassignOpen || !resolvedUnitCode) && (

                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">

                    <div className="mb-1 text-[11px] font-semibold text-amber-900 flex items-center gap-1">

                      <span className="material-symbols-outlined text-[15px]">build_circle</span>

                      Xử lý kho bẩn, kẹt cửa hoặc đổi sang ô kho tương đương (POST /api/staff/reservations/{item.reservationId}/assign-unit):

                    </div>

                    <StaffAssignUnit

                      reservationId={item.reservationId}

                      facilityId={item.facilityId}

                      currentUnitCode={resolvedUnitCode}

                      onAssigned={async () => {

                        setReassignReservationId(null);

                        await search(query.trim() || item.reservationCode, false);

                        setToastMsg(`Đã đổi ô kho thành công cho đơn ${item.reservationCode}.`);

                      }}

                    />

                  </div>

                )}

              </article>

            );

          })}

        </div>

      )}



      {/* Recent Facility Check-in History */}

      {checkIns.length > 0 && (

        <div className="mt-4 border-t border-[#eef1f8] pt-3">

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8996a9]">

            <span>Lịch sử bàn giao / check-in gần đây</span>

            <span>{checkIns.length} lượt</span>

          </div>

          <div className="mt-2 space-y-1.5">

            {checkIns.slice(0, 4).map((c) => (

              <div

                key={c.id}

                className="flex items-center justify-between rounded-lg border border-[#eef1f8] bg-[#f8faff] px-3 py-1.5 text-xs"

              >

                <div className="flex items-center gap-2 truncate">

                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#12b76a]" />

                  <span className="font-bold text-[#0b1c30]">Kho {c.unitCode}</span>

                  <span className="truncate text-[#58657a]">• {c.customerName}</span>

                  {c.agreementNo && (

                    <span className="hidden sm:inline rounded bg-[#eef4ff] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-900 dark:text-zinc-100">

                      {c.agreementNo}

                    </span>

                  )}

                </div>

                <span className="shrink-0 text-[11px] font-semibold text-[#027a48]">{c.timeLabel}</span>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Modal Báo sự cố kho lúc Check-in */}

      <ReportCheckInIssueModal

        target={issueModalTarget}

        isOpen={Boolean(issueModalTarget)}

        onClose={() => setIssueModalTarget(null)}

        onSuccess={(tgt) => {

          setToastMsg(`Đã tạo Ticket sự cố kho ${tgt.unitCode || ""} và gửi khẩn cấp lên Quản lý cơ sở.`);

        }}

        isStaff={true}

      />

    </section>

  );

}

