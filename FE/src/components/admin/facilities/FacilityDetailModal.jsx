import { useState } from "react";
import {
  Building2,
  Clock,
  Globe,
  Calendar,
  Users,
  Trash2,
  Power,
  Edit3,
  X,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

export default function FacilityDetailModal({
  selectedFacilityId,
  facilityDetail,
  loadingDetail,
  detailError,
  formatDate,
  onClose,
  onRetry,
  onOpenStatus,
  onOpenEdit,
  onRemoveStaff,
}) {
  const [confirmStaff, setConfirmStaff] = useState(null);
  const [removingStaff, setRemovingStaff] = useState(false);

  if (!selectedFacilityId) return null;

  async function handleConfirmRemove() {
    if (!confirmStaff) return;
    setRemovingStaff(true);
    try {
      await onRemoveStaff(confirmStaff.id);
      setConfirmStaff(null);
    } finally {
      setRemovingStaff(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#14121b]">
              <Building2 size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#14121b]">
                  {facilityDetail?.name || "Facility Details"}
                </h2>
                {facilityDetail?.code && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                    {facilityDetail.code}
                  </span>
                )}
                {facilityDetail?.status && (
                  <span
                    className={`reference-status ${
                      facilityDetail.status === "active"
                        ? "active"
                        : facilityDetail.status === "maintenance"
                        ? "maintenance"
                        : "inactive"
                    }`}
                  >
                    {facilityDetail.status.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#767679] mt-0.5">
                Branch ID: #{selectedFacilityId} • Created {formatDate(facilityDetail?.createdAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {loadingDetail ? (
          <div className="py-16 text-center text-xs text-[#767679]">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
            <span>Loading full facility operational profile...</span>
          </div>
        ) : detailError ? (
          <div className="py-12 text-center text-xs text-red-600">
            <ShieldAlert size={28} className="mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{detailError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 reference-button-secondary inline-flex"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : facilityDetail ? (
          <div className="mt-6 space-y-6">
            {/* Location & Parameters */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-[#767679] uppercase tracking-wider block mb-1">
                  Full Address
                </span>
                <p className="text-xs font-medium text-[#14121b]">
                  {[
                    facilityDetail.addressLine,
                    facilityDetail.ward,
                    facilityDetail.district,
                    facilityDetail.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-[#767679] uppercase tracking-wider block mb-1">
                  Operating Hours
                </span>
                <p className="text-xs font-medium text-[#14121b] flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" />
                  {facilityDetail.openingTime && facilityDetail.closingTime
                    ? `${facilityDetail.openingTime.slice(0, 5)} - ${facilityDetail.closingTime.slice(0, 5)}`
                    : "Standard (24/7)"}
                </p>
                <span className="text-[11px] text-[#767679] mt-0.5 block">
                  Timezone: {facilityDetail.timezone || "Asia/Ho_Chi_Minh"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-[#767679] uppercase tracking-wider block mb-1">
                  Coordinates
                </span>
                <p className="text-xs font-mono text-[#14121b] flex items-center gap-1">
                  <Globe size={13} className="text-slate-500" />
                  {facilityDetail.latitude != null ? facilityDetail.latitude.toFixed(4) : "0.0000"},{" "}
                  {facilityDetail.longitude != null ? facilityDetail.longitude.toFixed(4) : "0.0000"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-[#767679] uppercase tracking-wider block mb-1">
                  Last Updated
                </span>
                <p className="text-xs font-medium text-[#14121b] flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-500" />
                  {formatDate(facilityDetail.updatedAt)}
                </p>
              </div>
            </div>

            {/* Unit Stats */}
            <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#14121b] uppercase tracking-wider">
                  Unit Statistics & Capacity
                </h3>
                <span className="text-xs font-semibold text-[#14121b]">
                  Occupancy: {facilityDetail.unitStats?.occupancyRate ?? 0}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 mb-4 flex">
                <div
                  className="bg-[#14121b] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, facilityDetail.unitStats?.occupancyRate || 0)}%`,
                  }}
                  title={`Occupied: ${facilityDetail.unitStats?.occupancyRate || 0}%`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                  <strong className="text-base font-bold text-[#14121b]">
                    {facilityDetail.unitStats?.totalUnits ?? 0}
                  </strong>
                </div>
                <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Available</span>
                  <strong className="text-base font-bold text-emerald-800">
                    {facilityDetail.unitStats?.available ?? 0}
                  </strong>
                </div>
                <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Reserved</span>
                  <strong className="text-base font-bold text-blue-800">
                    {facilityDetail.unitStats?.reserved ?? 0}
                  </strong>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">Occupied</span>
                  <strong className="text-base font-bold text-slate-900">
                    {facilityDetail.unitStats?.occupied ?? 0}
                  </strong>
                </div>
                <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-100 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Maintenance</span>
                  <strong className="text-base font-bold text-amber-800">
                    {facilityDetail.unitStats?.maintenance ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            {/* Assigned Staff */}
            <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  <h3 className="text-xs font-bold text-[#14121b] uppercase tracking-wider">
                    Assigned Staff ({facilityDetail.assignedStaff?.length || 0})
                  </h3>
                </div>
              </div>

              {!facilityDetail.assignedStaff || facilityDetail.assignedStaff.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#767679]">
                  <p>No staff members currently assigned to this facility branch.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-white">
                  {facilityDetail.assignedStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {(staff.employeeName || "S")[0].toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-[#14121b]">
                              {staff.employeeName}
                            </strong>
                            <span className="font-mono text-[10px] text-slate-500">
                              ({staff.employeeCode})
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                staff.isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {staff.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#767679] mt-0.5">
                            Role: <span className="font-medium text-slate-700">{staff.assignmentRole}</span> • Assigned by {staff.assignedByEmail || "Admin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#767679] hidden sm:inline">
                          Since {formatDate(staff.startsAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmStaff(staff)}
                          className="reference-button-danger !p-1.5"
                          title="Remove staff assignment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenStatus(facilityDetail)}
                className="reference-button-secondary"
              >
                <Power size={14} /> Change Status
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(facilityDetail);
                }}
                className="reference-button-secondary"
              >
                <Edit3 size={14} /> Edit Information
              </button>
              <button
                type="button"
                onClick={onClose}
                className="reference-button-primary"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modern UI Confirm Modal for Staff Removal (replaces window.confirm) */}
      {confirmStaff && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#14121b]">Remove Staff Assignment</h4>
                <p className="text-xs text-[#767679]">Confirm operational detachment</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to unassign{" "}
              <strong className="text-slate-900 font-semibold">{confirmStaff.employeeName}</strong> (
              <span className="font-mono text-[11px]">{confirmStaff.employeeCode}</span>) from this facility?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={removingStaff}
                onClick={() => setConfirmStaff(null)}
                className="reference-button-secondary !py-1.5 !px-3 !text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removingStaff}
                onClick={handleConfirmRemove}
                className="reference-button-danger !py-1.5 !px-3 !text-xs"
              >
                {removingStaff ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
