import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw, Filter, CheckCircle2, AlertCircle, Clock, CreditCard, ShieldAlert } from "lucide-react";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import managerExpiringContractsService from "../api/managerExpiringContractsService";
import AssignInspectionModal from "../components/AssignInspectionModal";
import { formatVnd } from "../lib/utils";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("vi-VN");
}

export default function ManagerExpiringContractsPage() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  const loadData = async () => {
    if (!facilityId && facilityLoading) return;
    setLoading(true);
    setError("");

    try {
      const data = await managerExpiringContractsService.getExpiringCases({
        facilityId: facilityId || 1,
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hợp đồng hết hạn & trả kho.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, statusFilter]);

  // Client-side quick filter
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all") {
        if (statusFilter === "unassigned" && item.inspectionStatus !== "unassigned") return false;
        if (statusFilter === "inspecting" && item.postInspectionStatus !== "inspecting") return false;
        if (statusFilter === "waiting_bank_info" && item.postInspectionStatus !== "waiting_bank_info") return false;
        if (statusFilter === "waiting_penalty_payment" && item.postInspectionStatus !== "waiting_penalty_payment") return false;
        if (statusFilter === "refunded" && item.postInspectionStatus !== "refunded") return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.agreementNo?.toLowerCase().includes(q) ||
        item.customerName?.toLowerCase().includes(q) ||
        item.customerPhone?.toLowerCase().includes(q) ||
        item.unitCode?.toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  // Counters
  const counts = useMemo(() => {
    return {
      all: items.length,
      unassigned: items.filter((i) => i.inspectionStatus === "unassigned").length,
      waiting_bank_info: items.filter((i) => i.postInspectionStatus === "waiting_bank_info").length,
      waiting_penalty_payment: items.filter((i) => i.postInspectionStatus === "waiting_penalty_payment").length,
      refunded: items.filter((i) => i.postInspectionStatus === "refunded").length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-[#1d5fe5]">
              assignment_returned
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Hợp đồng hết hạn &amp; Trả kho
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi các hợp đồng sắp/đã hết hạn, phân công nhân viên kiểm tra kho và cập nhật tiến trình sau nghiệm thu.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setStatusFilter("all")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            statusFilter === "all"
              ? "border-[#1d5fe5] bg-blue-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tất cả ca trả kho</span>
            <span className="material-symbols-outlined text-[18px] text-slate-400">inventory_2</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{counts.all}</div>
        </div>

        <div
          onClick={() => setStatusFilter("waiting_bank_info")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            statusFilter === "waiting_bank_info"
              ? "border-amber-400 bg-amber-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Chờ khách nhập STK</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{counts.waiting_bank_info}</div>
        </div>

        <div
          onClick={() => setStatusFilter("waiting_penalty_payment")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            statusFilter === "waiting_penalty_payment"
              ? "border-rose-400 bg-rose-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Chờ khách đóng phạt</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">{counts.waiting_penalty_payment}</div>
        </div>

        <div
          onClick={() => setStatusFilter("refunded")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            statusFilter === "refunded"
              ? "border-emerald-400 bg-emerald-50/50 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Đã hoàn cọc</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900">{counts.refunded}</div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã hợp đồng, khách hàng, số điện thoại, kho..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unassigned")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === "unassigned" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chờ phân công ({counts.unassigned})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("waiting_bank_info")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === "waiting_bank_info" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chờ khách nhập STK ({counts.waiting_bank_info})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("waiting_penalty_payment")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === "waiting_penalty_payment" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chờ khách đóng phạt ({counts.waiting_penalty_payment})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("refunded")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === "refunded" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Đã hoàn cọc ({counts.refunded})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Hợp đồng &amp; Khách hàng</th>
                <th className="px-4 py-3.5">Ô kho</th>
                <th className="px-4 py-3.5">Hạn / Yêu cầu trả</th>
                <th className="px-4 py-3.5 text-right">Tiền cọc</th>
                <th className="px-4 py-3.5">Nhân viên nghiệm thu</th>
                <th className="px-4 py-3.5 text-center">Tiến trình sau nghiệm thu</th>
                <th className="px-4 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-[28px] text-[#1d5fe5] block mb-2">
                      progress_activity
                    </span>
                    Đang tải danh sách hợp đồng hết hạn &amp; yêu cầu trả kho...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-1">
                      inbox
                    </span>
                    Không tìm thấy hợp đồng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/70">
                    {/* Hợp đồng & Khách hàng */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.agreementNo}</div>
                      <div className="font-semibold text-slate-700 mt-0.5">{item.customerName}</div>
                      <div className="text-[11px] text-slate-400">{item.customerPhone || "—"}</div>
                    </td>

                    {/* Ô kho */}
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#1d5fe5] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Kho {item.unitCode}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{item.unitTypeName || "Tiêu chuẩn"}</div>
                    </td>

                    {/* Hạn hợp đồng / Ngày trả */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        Hạn: {formatDate(item.endDate)}
                      </div>
                      {item.isMoveOutRequested ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          Khách xin trả: {formatDate(item.requestedMoveOutDate)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-0.5">Đến kỳ hết hạn</span>
                      )}
                    </td>

                    {/* Tiền cọc */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-900">{formatVnd(item.depositAmount || 0)}</span>
                    </td>

                    {/* Nhân viên nghiệm thu */}
                    <td className="px-4 py-3">
                      {item.assignedStaffName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">
                            assignment_ind
                          </span>
                          <span className="font-medium text-slate-800">{item.assignedStaffName}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <span className="material-symbols-outlined text-[12px]">person_off</span>
                          Chưa phân công
                        </span>
                      )}
                    </td>

                    {/* Tiến trình sau nghiệm thu: Đã hoàn cọc / Đang chờ khách nhập STK / Đang chờ khách đóng phạt */}
                    <td className="px-4 py-3 text-center">
                      {item.postInspectionStatus === "refunded" ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-300">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                            Đã hoàn cọc
                          </span>
                          {item.refundAmount > 0 && (
                            <span className="text-[11px] font-bold text-emerald-800 mt-0.5">
                              {formatVnd(item.refundAmount)}
                            </span>
                          )}
                        </div>
                      ) : item.postInspectionStatus === "waiting_bank_info" ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">account_balance</span>
                            Đang chờ khách nhập STK
                          </span>
                          <span className="text-[10px] text-amber-700 mt-0.5">
                            Cần hoàn cọc: {formatVnd(item.refundAmount || item.depositAmount)}
                          </span>
                        </div>
                      ) : item.postInspectionStatus === "waiting_penalty_payment" ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-300">
                            <span className="material-symbols-outlined text-[16px] text-rose-600">gavel</span>
                            Đang chờ khách đóng phạt
                          </span>
                          {item.penaltyAmount > 0 && (
                            <span className="text-[11px] font-bold text-rose-800 mt-0.5">
                              Thu thêm: {formatVnd(item.penaltyAmount)}
                            </span>
                          )}
                        </div>
                      ) : item.postInspectionStatus === "inspecting" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                          <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                          Đang kiểm tra kho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                          Chờ nghiệm thu
                        </span>
                      )}
                    </td>

                    {/* Hành động: Nút “Phân công kiểm tra kho” */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAgreement(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">fact_check</span>
                          <span>Phân công kiểm tra kho</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phân công kiểm tra kho */}
      {selectedAgreement && (
        <AssignInspectionModal
          isOpen={Boolean(selectedAgreement)}
          agreement={selectedAgreement}
          facilityId={facilityId || selectedAgreement.facilityId || 1}
          onClose={() => setSelectedAgreement(null)}
          onSuccess={() => {
            setSelectedAgreement(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
