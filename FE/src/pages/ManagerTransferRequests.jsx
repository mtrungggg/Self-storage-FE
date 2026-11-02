import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Bell, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, User, Phone, FileText, Search } from "lucide-react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { DECISION_STATUS } from "../constants/managerConstants";
import { formatStatusToEnglish } from "../lib/utils";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio permission limitations
  }
}

const STATUS_BADGE = {
  [DECISION_STATUS.PENDING]: "bg-amber-50 text-amber-700 border border-amber-200",
  pending_payment: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-blue-50 text-blue-700 border border-blue-200",
  [DECISION_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  [DECISION_STATUS.REJECTED]: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function ManagerTransferRequests() {
  const { facilityId, loading: facilityLoading, refreshTransferRequests: refreshContextTransfers } = useManagerFacility();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [decisionDrafts, setDecisionDrafts] = useState({});
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Toast notification for incoming new requests
  const [incomingAlert, setIncomingAlert] = useState(null);
  const previousPendingIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const loadRequests = useCallback(async (silent = false) => {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    if (!silent) setRefreshing(true);
    setError("");
    try {
      const data = await managerService.getTransferRequests(facilityId);
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      setLastUpdated(new Date());

      // Identify pending requests
      const currentPending = list.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "pending" || s === "pending_payment" || s === "paid";
      });

      // Detect newly arrived requests after initial mount
      if (!isInitialLoadRef.current) {
        const prevSet = previousPendingIdsRef.current;
        const brandNew = currentPending.find((r) => !prevSet.has(r.id));
        if (brandNew) {
          setIncomingAlert(brandNew);
          playNotificationChime();
          setTimeout(() => setIncomingAlert(null), 8000);
        }
      }

      previousPendingIdsRef.current = new Set(currentPending.map((r) => r.id));
      isInitialLoadRef.current = false;
    } catch (err) {
      if (!silent) setError(err?.message || "Không thể tải danh sách yêu cầu chuyển kho.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [facilityId, facilityLoading]);

  // Initial load
  useEffect(() => {
    if (!facilityLoading && !facilityId) {
      setLoading(false);
    } else if (facilityId) {
      loadRequests(false);
    }
  }, [facilityId, facilityLoading, loadRequests]);

  // Live Auto-Polling every 10 seconds for real-time manager alerts
  useEffect(() => {
    if (!facilityId) return undefined;
    const interval = setInterval(() => {
      loadRequests(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [facilityId, loadRequests]);

  function updateDraft(id, field, value) {
    setDecisionDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function decide(id, decision) {
    const draft = decisionDrafts[id] || {};
    setDecidingId(id);
    setError("");
    try {
      await managerService.decideTransferRequest(id, {
        decision,
        targetUnitId: draft.targetUnitId ? Number(draft.targetUnitId) : undefined,
        reviewNotes: draft.reviewNotes || undefined,
      });
      setNotice(
        decision === DECISION_STATUS.APPROVED
          ? "Đã phê duyệt yêu cầu chuyển kho thành công."
          : "Đã từ chối yêu cầu chuyển kho."
      );
      setTimeout(() => setNotice(""), 4500);
      await loadRequests(false);
      if (refreshContextTransfers) refreshContextTransfers();
    } catch (err) {
      setError(err?.message || "Không thể xử lý yêu cầu chuyển kho.");
    } finally {
      setDecidingId(null);
    }
  }

  // Count requests by status
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    requests.forEach((r) => {
      const s = (r.status || "").toLowerCase();
      if (s === "pending" || s === "pending_payment" || s === "paid") pending++;
      else if (s === "approved" || s === "scheduled" || s === "completed") approved++;
      else if (s === "rejected" || s === "cancelled") rejected++;
    });
    return { all: requests.length, pending, approved, rejected };
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      const isPending = s === "pending" || s === "pending_payment" || s === "paid";
      const isApproved = s === "approved" || s === "scheduled" || s === "completed";
      const isRejected = s === "rejected" || s === "cancelled";

      if (filterTab === "pending" && !isPending) return false;
      if (filterTab === "approved" && !isApproved) return false;
      if (filterTab === "rejected" && !isRejected) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (r.customerName || "").toLowerCase().includes(q) ||
          (r.customerPhone || "").toLowerCase().includes(q) ||
          (r.agreementNo || "").toLowerCase().includes(q) ||
          (r.fromUnitCode || "").toLowerCase().includes(q) ||
          (r.toUnitCode || "").toLowerCase().includes(q) ||
          (r.requestedUnitTypeName || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [requests, filterTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Floating Real-time Notification Toast */}
      {incomingAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border-2 border-amber-400 bg-white p-4 shadow-2xl animate-bounce">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Bell size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-amber-950 text-xs">🔔 YÊU CẦU CHUYỂN KHO MỚI!</span>
                <span className="text-[10px] text-amber-700 font-semibold">Vừa xong</span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {incomingAlert.customerName || `Khách hàng #${incomingAlert.customerId}`}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                HĐ <span className="font-mono font-semibold">{incomingAlert.agreementNo}</span>: Kho{" "}
                <span className="font-mono font-bold text-blue-700">{incomingAlert.fromUnitCode}</span> ➔{" "}
                {incomingAlert.requestedUnitTypeName}
              </p>
            </div>
            <button
              onClick={() => setIncomingAlert(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Unit Transfer Requests</h1>
          <p className="text-xs text-slate-500">
            Quản lý và phê duyệt hoặc từ chối các yêu cầu chuyển đổi ô kho của khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex text-[11px] text-slate-400">
            Tự động làm mới mỗi 10s · {lastUpdated.toLocaleTimeString("vi-VN")}
          </span>
          <button
            type="button"
            onClick={() => loadRequests(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-600" : ""} />
            <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {/* Prominent High-Visibility Notification Banner for Manager */}
      {counts.pending > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-100/60 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md animate-pulse">
              <Bell size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-amber-950">
                  🔔 Có {counts.pending} yêu cầu chuyển kho mới đang chờ bạn xét duyệt!
                </h2>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                  Cần xử lý
                </span>
              </div>
              <p className="mt-0.5 text-xs text-amber-800">
                Khách hàng đã gửi yêu cầu chuyển sang kho mới. Vui lòng kiểm tra và duyệt chỉ định ô kho phù hợp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTab("pending")}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
            >
              Xem {counts.pending} yêu cầu chờ duyệt &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Action feedback notices */}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-800 shadow-xs">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tất cả ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("pending")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <span>Chờ duyệt</span>
            {counts.pending > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                filterTab === "pending" ? "bg-white text-amber-700" : "bg-amber-100 text-amber-800"
              }`}>
                {counts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("approved")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            Đã duyệt ({counts.approved})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("rejected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            }`}
          >
            Đã từ chối ({counts.rejected})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, HĐ, mã kho..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-3.5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-600 opacity-60" />
            <span>Đang tải danh sách yêu cầu chuyển kho...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <FileText size={24} />
            </div>
            <p className="font-bold text-slate-700 text-sm">
              {filterTab === "pending"
                ? "Không có yêu cầu chuyển kho nào đang chờ duyệt."
                : "Không tìm thấy yêu cầu chuyển kho nào."}
            </p>
            <p className="mt-1 text-slate-500">
              Khi khách hàng gửi yêu cầu đổi/chuyển kho từ cổng khách hàng, yêu cầu sẽ lập tức hiển thị và có chuông báo tại đây.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const draft = decisionDrafts[request.id] || {};
            const statusKey = (request.status || "").toLowerCase();
            const isPending =
              statusKey === "pending" || statusKey === "pending_payment" || statusKey === "paid";

            return (
              <div
                key={request.id}
                className={`rounded-2xl border bg-white p-4 transition-all shadow-xs ${
                  isPending
                    ? "border-amber-300 ring-2 ring-amber-100/70 bg-gradient-to-b from-amber-50/20 to-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Request Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                      <User size={14} />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {request.customerName || `Khách hàng #${request.customerId}`}
                      </span>
                      {request.customerPhone && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Phone size={11} className="opacity-60" />
                          {request.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 animate-pulse">
                        <Clock size={11} />
                        Cần duyệt
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        STATUS_BADGE[request.status] || "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {formatStatusToEnglish(request.status)}
                    </span>
                  </div>
                </div>

                {/* Transfer Specifications */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Hợp đồng thuê
                    </span>
                    <span className="font-mono font-bold text-slate-900">{request.agreementNo}</span>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                      Kho hiện tại ➔ Loại muốn chuyển
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-blue-950">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700">
                        {request.fromUnitCode || `#${request.fromUnitId}`}
                      </span>
                      <ArrowRight size={13} className="text-blue-500" />
                      <span>{request.requestedUnitTypeName}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Ngày chuyển dự kiến
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(request.requestedEffectiveDate || request.moveOutDate)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Kho đích gợi ý
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {request.toUnitCode ? `Kho ${request.toUnitCode}` : "Chờ manager chỉ định"}
                    </span>
                  </div>
                </div>

                {/* Transfer Reason */}
                <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Lý do chuyển kho:</span>{" "}
                  <span>{request.reason || "Không ghi rõ"}</span>
                </div>

                {/* Manager Decision Actions (Only for pending requests) */}
                {isPending && (
                  <div className="mt-3.5 flex flex-wrap items-end gap-3 border-t border-amber-200/60 pt-3">
                    <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
                      ID ô kho chỉ định (Nếu duyệt đổi sang kho khác)
                      <input
                        type="number"
                        placeholder="VD: 105 (hoặc để trống)"
                        value={draft.targetUnitId || ""}
                        onChange={(e) => updateDraft(request.id, "targetUnitId", e.target.value)}
                        className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                      />
                    </label>

                    <label className="flex flex-1 min-w-[220px] flex-col gap-1 text-[11px] font-bold text-slate-700">
                      Ghi chú duyệt / phản hồi cho khách
                      <input
                        placeholder="VD: Đã duyệt chỉ định kho tầng 1, đồng ý chuyển ngày..."
                        value={draft.reviewNotes || ""}
                        onChange={(e) => updateDraft(request.id, "reviewNotes", e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={decidingId === request.id}
                        onClick={() => decide(request.id, DECISION_STATUS.APPROVED)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>{decidingId === request.id ? "Đang xử lý..." : "Chấp thuận (Approve)"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={decidingId === request.id}
                        onClick={() => decide(request.id, DECISION_STATUS.REJECTED)}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-700 transition disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Từ chối (Reject)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
