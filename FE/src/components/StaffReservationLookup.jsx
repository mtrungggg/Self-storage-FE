import { useEffect, useRef, useState } from "react";
import staffReservationService from "../api/staffReservationService";
import staffFacilityService from "../api/staffFacilityService";
import StaffAssignUnit from "./StaffAssignUnit";
import StaffHandoverForm from "./StaffHandoverForm";
import QrCameraScanner from "./QrCameraScanner";

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function getStoredFacilityCheckIns() {
  try {
    const raw = localStorage.getItem("g1_facility_checkins");
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

export default function StaffReservationLookup() {
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
  const requestId = useRef(0);

  useEffect(() => {
    const onStorage = () => setCheckIns(getStoredFacilityCheckIns());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function confirmFacilityCheckIn({ unitCode, agreementNo, reservationCode, customerName, facilityCode }) {
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} hôm nay`;
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      unitCode: unitCode || "—",
      agreementNo: agreementNo || "",
      reservationCode: reservationCode || "",
      customerName: customerName || "Khách thuê kho",
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
    localStorage.setItem("g1_facility_checkins", JSON.stringify(updated));
    setCheckIns(updated);

    try {
      const channel = new BroadcastChannel("g1_facility_checkin");
      channel.postMessage(record);
      channel.close();
    } catch {
      // BroadcastChannel not supported
    }

    setToastMsg(`Đã xác nhận Check-in vào cơ sở cho khách hàng (${record.unitCode !== "—" ? `Ô kho ${record.unitCode}` : record.reservationCode || record.agreementNo}) lúc ${timeLabel}!`);
  }

  function isAlreadyCheckedIn({ unitCode, agreementNo, reservationCode }) {
    return checkIns.find(
      (c) =>
        (agreementNo && c.agreementNo === agreementNo) ||
        (unitCode && c.unitCode === unitCode) ||
        (reservationCode && c.reservationCode === reservationCode)
    );
  }

  async function search(keyword = query.trim(), clearResults = true, autoCheckInOnScan = false) {
    if (!keyword) {
      setError("Enter a reservation code, phone number, or QR value.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setToastMsg("");
    setSearched(true);
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

      // If QR payload had info but unit wasn't in facility list, still synthesize a card so Staff can confirm check-in
      const finalUnitMatches =
        unitMatches.length > 0
          ? unitMatches
          : parsed.isQrPayload
          ? [
              {
                unitId: `qr-${parsed.unitCode}`,
                unitCode: parsed.unitCode,
                currentAgreementNo: parsed.agreementNo,
                customerName: rsvList[0]?.customerName || "Khách hàng (Mã QR hợp lệ)",
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
        setError(err.message || "Unable to look up reservations.");
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
    search(scannedCode, true, true);
  }

  return (
    <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1d5fe5]">qr_code_scanner</span>
          <h2 className="text-[14px] font-bold">Check-in vào cơ sở (Quét QR / Tra cứu)</h2>
        </div>
        <button
          type="button"
          onClick={() => setCameraActive((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-xs font-bold transition ${
            cameraActive
              ? "border-[#2dd4a0] bg-[#effcf6] text-[#0e7b4c]"
              : "border-[#dfe7f5] bg-[#f8faff] text-[#3a475a] hover:border-[#1d5fe5] hover:text-[#1d5fe5]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {cameraActive ? "videocam_off" : "photo_camera"}
          </span>
          <span>{cameraActive ? "Close" : "Scan QR"}</span>
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
          Search / Paste QR Code
          <input
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Quét mã QR, dán mã CHK|..., mã đặt chỗ, SĐT hoặc mã kho..."
            className="mt-1 w-full rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
          />
        </label>
        <label className="text-xs font-semibold text-[#58657a]">
          Facility ID
          <input
            type="number"
            min="1"
            step="1"
            value={facilityId}
            onChange={(event) => setFacilityId(event.target.value)}
            className="mt-1 block w-28 rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
          />
        </label>
        <button disabled={loading} className="rounded-[9px] bg-[#1d5fe5] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1550c7] disabled:opacity-50">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {toastMsg && (
        <div role="status" className="mt-3 flex items-center gap-2 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-3 text-xs font-bold text-[#027a48]">
          <span className="material-symbols-outlined text-[18px] text-[#12b76a]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && searched && results.length === 0 && matchedUnits.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed border-[#dfe7f5] p-4 text-center text-xs text-[#8996a9]">No results.</p>
      )}

      {/* Matched Active Rental Units / QR Gate Pass Check-in Cards */}
      {matchedUnits.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d5fe5]">
            Thông tin Ô kho &amp; Check-in Cơ sở
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
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
                      <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">warehouse</span>
                      <strong className="text-sm text-[#0b1c30]">Unit {unit.unitCode}</strong>
                    </div>
                    <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 font-bold text-[#1d5fe5]">
                      {unit.currentAgreementNo || unit.status || "Active"}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="font-semibold text-slate-800 truncate">
                      Khách: {unit.customerName || "Khách thuê"}
                    </span>
                    <span className="text-right text-slate-500">
                      {unit.unitTypeName || "Storage Unit"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe7f5] pt-2.5">
                    {checkedRecord ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#027a48]">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Đã Check-in ({checkedRecord.timeLabel})
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#58657a]">Chờ xác nhận vào cơ sở</span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        confirmFacilityCheckIn({
                          unitCode: unit.unitCode,
                          agreementNo: unit.currentAgreementNo,
                          customerName: unit.customerName,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0e7b4c] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0b633d]"
                    >
                      <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                      <span>{checkedRecord ? "Check-in lại" : "Xác nhận Check-in vào cơ sở"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Matched Reservations */}
      {results.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {results.map((item) => {
            const resolvedUnitCode = item.assignedUnitCode || item.unitCode;
            const checkedRecord = isAlreadyCheckedIn({
              unitCode: resolvedUnitCode,
              reservationCode: item.reservationCode,
            });
            return (
              <article key={item.reservationId} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm text-[#0b1c30]">{item.reservationCode}</strong>
                  <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 font-semibold text-[#1d5fe5]">{item.status || "Unknown"}</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <span className="font-semibold text-slate-800 truncate">{item.customerName || "—"}</span>
                  <span className="text-right text-slate-500">{item.customerPhone || "—"}</span>
                  <span className="text-slate-500">Unit: {resolvedUnitCode || item.unitTypeName || "—"}</span>
                  <span className="text-right font-bold text-slate-900">{formatMoney(item.quotedTotal)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#dfe7f5] pt-2.5">
                  {checkedRecord ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027a48]">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Đã Check-in ({checkedRecord.timeLabel})
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#58657a]">Khách đến nhận/vào kho</span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      confirmFacilityCheckIn({
                        unitCode: resolvedUnitCode,
                        reservationCode: item.reservationCode,
                        customerName: item.customerName,
                        facilityCode: item.facilityCode,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0e7b4c] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0b633d]"
                  >
                    <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                    <span>{checkedRecord ? "Check-in lại" : "Xác nhận Check-in"}</span>
                  </button>
                </div>

                {!resolvedUnitCode && (
                  <StaffAssignUnit reservationId={item.reservationId} facilityId={item.facilityId} onAssigned={() => search(query.trim(), false)} />
                )}
                {resolvedUnitCode && !["checked_in", "completed"].includes(String(item.status).toLowerCase()) && (
                  <StaffHandoverForm reservationId={item.reservationId} onCreated={() => search(query.trim(), false)} />
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
            <span>Lịch sử khách Check-in vào cơ sở gần đây</span>
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
                    <span className="hidden sm:inline rounded bg-[#eef4ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
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
    </section>
  );
}
