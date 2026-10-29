import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Box,
  MapPin,
  Power,
  Eye,
  Calendar,
  Globe,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import adminFacilityService from "../api/adminFacilityService";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const FACILITY_TIMEZONE = "Asia/Ho_Chi_Minh";

const statuses = [
  ["active", "Active"],
  ["maintenance", "Maintenance"],
  ["inactive", "Inactive"],
];

const initialFilters = {
  Search: "",
  Status: "",
  City: "",
  PageSize: 10,
};

const initialFormData = {
  code: "",
  name: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "Ho Chi Minh",
  latitude: 10.7769,
  longitude: 106.7009,
  timezone: FACILITY_TIMEZONE,
  openingTime: "07:00:00",
  closingTime: "22:00:00",
  status: "active",
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "—" : dateFormat.format(d);
};

export default function AdminCrudPage() {
  const { id: paramFacilityId } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState({ ...initialFilters, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Detail modal state (GET /api/admin/facilities/{id})
  const [activeFacilityId, setActiveFacilityId] = useState(null);
  const selectedFacilityId = activeFacilityId ?? (paramFacilityId || null);
  const [facilityDetail, setFacilityDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const loadingDetail = Boolean(selectedFacilityId) && !detailError && (!facilityDetail || String(facilityDetail.id) !== String(selectedFacilityId));

  // Status change modal state (PUT /api/admin/facilities/{id}/status)
  const [statusModalFacility, setStatusModalFacility] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  function closeDetailModal() {
    setActiveFacilityId(null);
    setFacilityDetail(null);
    setDetailError("");
    if (paramFacilityId) {
      navigate("/admin-facilities", { replace: true });
    }
  }

  const loading = result?.query !== query;
  const error = actionError || (loading ? "" : result?.error);
  const data = loading || result?.error ? null : result?.data;
  const facilities = data?.items || [];

  const loadData = useCallback(() => {
    let active = true;
    adminFacilityService.getFacilities(query).then(
      (data) => {
        if (active) setResult({ query, data });
      },
      (err) => {
        if (active) setResult({ query, error: err.message || "Failed to load facilities list." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    return loadData();
  }, [loadData]);

  // Load facility details when selectedFacilityId changes
  const fetchFacilityDetail = useCallback((id) => {
    if (!id) return;
    setDetailError("");
    setFacilityDetail(null);
    adminFacilityService.getFacility(id).then(
      (res) => {
        setFacilityDetail(res);
      },
      (err) => {
        setDetailError(err.message || "Failed to load facility details.");
      }
    );
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) return;
    let active = true;
    adminFacilityService.getFacility(selectedFacilityId).then(
      (res) => {
        if (active) {
          setFacilityDetail(res);
          setDetailError("");
        }
      },
      (err) => {
        if (active) {
          setDetailError(err.message || "Failed to load facility details.");
        }
      }
    );
    return () => {
      active = false;
    };
  }, [selectedFacilityId]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setQuery({
      ...filters,
      Search: filters.Search.trim(),
      City: filters.City.trim(),
      PageNumber: 1,
    });
  }

  function handleResetFilters() {
    setFilters(initialFilters);
    setQuery({ ...initialFilters, PageNumber: 1 });
  }

  function openCreateModal() {
    setEditingFacility(null);
    setFormData(initialFormData);
    setActionError("");
    setIsFormOpen(true);
  }

  async function openEditModal(facility) {
    setActionError("");
    setIsFormOpen(true);
    setEditingFacility(facility);

    // Initial fill from available item
    setFormData({
      code: facility.code || "",
      name: facility.name || "",
      addressLine: facility.addressLine || "",
      ward: facility.ward || "",
      district: facility.district || "",
      city: facility.city || "",
      latitude: facility.latitude ?? 10.7769,
      longitude: facility.longitude ?? 106.7009,
      timezone: facility.timezone || FACILITY_TIMEZONE,
      openingTime: facility.openingTime ? facility.openingTime.slice(0, 8) : "07:00:00",
      closingTime: facility.closingTime ? facility.closingTime.slice(0, 8) : "22:00:00",
      status: String(facility.status || "active").toLowerCase(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch full facility details to ensure ward, coordinates and timezone are strictly accurate
    if (facility.id) {
      try {
        const full = await adminFacilityService.getFacility(facility.id);
        if (full) {
          setEditingFacility(full);
          setFormData({
            code: full.code || "",
            name: full.name || "",
            addressLine: full.addressLine || "",
            ward: full.ward || "",
            district: full.district || "",
            city: full.city || "",
            latitude: full.latitude ?? 10.7769,
            longitude: full.longitude ?? 106.7009,
            timezone: full.timezone || FACILITY_TIMEZONE,
            openingTime: full.openingTime ? full.openingTime.slice(0, 8) : "07:00:00",
            closingTime: full.closingTime ? full.closingTime.slice(0, 8) : "22:00:00",
            status: String(full.status || "active").toLowerCase(),
          });
        }
      } catch {
        // Fallback to initial row item
      }
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");

    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      addressLine: formData.addressLine.trim(),
      ward: formData.ward?.trim() || undefined,
      district: formData.district?.trim() || undefined,
      city: formData.city.trim(),
      latitude: Number(formData.latitude) || 0,
      longitude: Number(formData.longitude) || 0,
      timezone: formData.timezone || FACILITY_TIMEZONE,
      openingTime: formData.openingTime || undefined,
      closingTime: formData.closingTime || undefined,
      status: formData.status,
    };

    try {
      if (editingFacility) {
        const updated = await adminFacilityService.updateFacility(editingFacility.id, payload);
        setNotice(`Facility "${payload.name}" updated successfully.`);
        if (selectedFacilityId === editingFacility.id && updated) {
          setFacilityDetail(updated);
        }
      } else {
        await adminFacilityService.createFacility(payload);
        setNotice(`Facility "${payload.name}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingFacility(null);
      setFormData(initialFormData);
      loadData();
      if (selectedFacilityId) {
        fetchFacilityDetail(selectedFacilityId);
      }
      window.dispatchEvent(new Event("admin-data-changed"));
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to save facility details.");
    } finally {
      setSubmitting(false);
    }
  }

  function openStatusModal(facility) {
    setStatusModalFacility(facility);
    setTargetStatus(
      facility.status === "active"
        ? "maintenance"
        : facility.status === "maintenance"
        ? "inactive"
        : "active"
    );
    setStatusReason("");
    setActionError("");
  }

  async function handleStatusSubmit(e) {
    e.preventDefault();
    if (!statusModalFacility) return;
    setUpdatingStatus(true);
    setActionError("");

    try {
      const updated = await adminFacilityService.updateStatus(statusModalFacility.id, {
        status: targetStatus,
        reason: statusReason.trim() || undefined,
      });
      setNotice(`Status of "${statusModalFacility.name}" updated to ${targetStatus.toUpperCase()}.`);
      setStatusModalFacility(null);
      loadData();
      if (selectedFacilityId === statusModalFacility.id && updated) {
        setFacilityDetail(updated);
      }
      window.dispatchEvent(new Event("admin-data-changed"));
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update facility status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleRemoveStaffAssignment(assignmentId) {
    if (!window.confirm("Are you sure you want to remove this staff assignment?")) return;
    try {
      await adminStaffAssignmentService.remove(assignmentId);
      setNotice("Staff assignment removed successfully.");
      if (selectedFacilityId) {
        fetchFacilityDetail(selectedFacilityId);
      }
      loadData();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setDetailError(err.message || "Failed to remove staff assignment.");
    }
  }

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar matching AdminDashboard */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Facility Management</h1>
            <span className="reference-pill">
              {data ? `${data.totalCount} Facilities` : "Network Hubs"}
            </span>
          </div>
          <p className="reference-muted mt-1">
            Manage physical self-storage branches, operating hours, capacity, and active staffing.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <button
            type="button"
            onClick={openCreateModal}
            className="reference-button-primary"
          >
            <Plus size={16} /> Add Facility
          </button>
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={() => {
              setActionError("");
              loadData();
            }}
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Notice feedback */}
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]"
        >
          <CheckCircle2 size={18} className="text-[#23866a]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Error feedback */}
      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal / Card */}
      {isFormOpen && (
        <section className="reference-card mb-6 p-6">
          <div className="reference-card-heading mb-4">
            <div>
              <h2>{editingFacility ? "Edit Facility" : "Add New Facility"}</h2>
              <p className="reference-muted">
                {editingFacility
                  ? `Update configuration and operational parameters for ${editingFacility.name}.`
                  : "Register a new self-storage branch location into the network."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingFacility(null);
              }}
              className="reference-pill hover:bg-slate-100 cursor-pointer"
            >
              <X size={14} className="inline mr-1" /> Cancel
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Facility Code <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="reference-input font-mono"
                  placeholder="e.g. SGP-01"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Facility Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="reference-input"
                  placeholder="e.g. Saigon Hub 1"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Address Line <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  className="reference-input"
                  placeholder="e.g. 123 Nguyen Van Linh"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Ward
                </span>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="reference-input"
                  placeholder="e.g. Tan Phong Ward"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  District
                </span>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="reference-input"
                  placeholder="e.g. District 7"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  City <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="reference-input"
                  placeholder="e.g. Ho Chi Minh"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Latitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="reference-input font-mono"
                  placeholder="10.7769"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Longitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="reference-input font-mono"
                  placeholder="106.7009"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Opening Time
                </span>
                <input
                  type="time"
                  step="1"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  className="reference-input"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Closing Time
                </span>
                <input
                  type="time"
                  step="1"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  className="reference-input"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Timezone
                </span>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="reference-input"
                  placeholder="Asia/Ho_Chi_Minh"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Status <span className="text-red-500">*</span>
                </span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="reference-select"
                >
                  {statuses.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingFacility(null);
                }}
                className="reference-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="reference-button-primary"
              >
                {submitting ? "Saving..." : editingFacility ? "Save Changes" : "Create Facility"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter Card matching AdminUsers and AdminAuditLog */}
      <section className="reference-card mb-6 p-4">
        <form onSubmit={handleFilterSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Search</span>
            <div className="reference-search w-full">
              <Search size={16} strokeWidth={1.5} />
              <input
                type="search"
                placeholder="Search code, name, address..."
                value={filters.Search}
                onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Status</span>
            <select
              value={filters.Status}
              onChange={(e) => setFilters({ ...filters, Status: e.target.value })}
              className="reference-select w-full"
            >
              <option value="">All Statuses</option>
              {statuses.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">City</span>
            <input
              type="text"
              placeholder="e.g. Ho Chi Minh"
              value={filters.City}
              onChange={(e) => setFilters({ ...filters, City: e.target.value })}
              className="reference-input w-full"
            />
          </label>

          <div className="flex items-center gap-2">
            <button type="submit" className="reference-button-primary flex-1">
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="reference-button-secondary"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Facilities Directory Table */}
      <section className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Facilities Directory</h2>
            <p className="reference-muted">
              Live records from `/api/admin/facilities` with unit distribution and staff allocation.
            </p>
          </div>
          <span className="reference-pill">
            {data ? `${facilities.length} of ${data.totalCount} shown` : "Loading..."}
          </span>
        </div>

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Facility Name</th>
                <th scope="col">Location</th>
                <th scope="col">Hours</th>
                <th scope="col">Units</th>
                <th scope="col">Staff</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right pr-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#767679]">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-blue-600" />
                      <span>Loading facilities from server...</span>
                    </div>
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                      <strong className="block text-sm text-[#14121b]">
                        {query.Search || query.Status || query.City
                          ? "No matching facilities found"
                          : "No facilities registered"}
                      </strong>
                      <p className="text-xs text-[#767679] mt-1">
                        {query.Search || query.Status || query.City
                          ? "Try adjusting search terms or clearing status filters."
                          : "Click 'Add Facility' to register the first branch location."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => {
                  const statusKey = String(facility.status || "").toLowerCase();
                  return (
                    <tr key={facility.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {facility.code || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="reference-facility-name">
                          <span className="reference-facility-thumb">
                            <Building2 size={18} strokeWidth={1.5} />
                          </span>
                          <div>
                            <strong>{facility.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-[#25232c]">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin size={12} className="text-slate-400" />
                            {facility.addressLine || "—"}
                          </span>
                          <span className="text-[#767679] block pl-4">
                            {[facility.ward, facility.district, facility.city].filter(Boolean).join(", ") || "—"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-[#767679]">
                          <Clock size={12} />
                          {facility.openingTime && facility.closingTime
                            ? `${facility.openingTime.slice(0, 5)} - ${facility.closingTime.slice(0, 5)}`
                            : "Standard"}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Box size={12} />
                          {facility.totalUnits ?? 0}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Users size={12} />
                          {facility.activeStaffCount ?? 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`reference-status ${
                            statusKey === "active"
                              ? "active"
                              : statusKey === "maintenance"
                              ? "maintenance"
                              : "inactive"
                          }`}
                        >
                          {statusKey === "active"
                            ? "Active"
                            : statusKey === "maintenance"
                            ? "Maintenance"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right pr-6">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveFacilityId(facility.id)}
                            className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                            title="View facility details & stats"
                          >
                            <Eye size={13} /> Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(facility)}
                            className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                            title="Edit facility configuration"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(facility)}
                            className="reference-button-secondary !py-1 !px-2.5 !text-[11px] hover:!text-amber-600 hover:!border-amber-300"
                            title="Update facility operational status"
                          >
                            <Power size={13} /> Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching AdminUsers and AdminAuditLog */}
        {data && (
          <div className="reference-pagination">
            <span>
              {data.totalCount === 0
                ? "0 facilities"
                : `Showing page ${data.pageNumber} of ${Math.max(1, data.totalPages)} (Total ${data.totalCount} facilities)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!data.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={!data.hasNextPage}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Facility Details Modal (GET /api/admin/facilities/{id}) */}
      {selectedFacilityId && (
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
                onClick={closeDetailModal}
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
                  onClick={() => fetchFacilityDetail(selectedFacilityId)}
                  className="mt-3 reference-button-secondary inline-flex"
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            ) : facilityDetail ? (
              <div className="mt-6 space-y-6">
                {/* Location & Operational Parameters */}
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

                {/* Unit Statistics Section */}
                <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-[#14121b] uppercase tracking-wider">
                      Unit Statistics & Capacity
                    </h3>
                    <span className="text-xs font-semibold text-[#14121b]">
                      Occupancy: {facilityDetail.unitStats?.occupancyRate ?? 0}%
                    </span>
                  </div>

                  {/* Occupancy bar */}
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

                {/* Assigned Staff Section */}
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
                              onClick={() => handleRemoveStaffAssignment(staff.id)}
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
                    onClick={() => {
                      const fac = facilityDetail;
                      openStatusModal(fac);
                    }}
                    className="reference-button-secondary"
                  >
                    <Power size={14} /> Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fac = facilityDetail;
                      closeDetailModal();
                      openEditModal(fac);
                    }}
                    className="reference-button-secondary"
                  >
                    <Edit3 size={14} /> Edit Information
                  </button>
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="reference-button-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Status Change Modal (PUT /api/admin/facilities/{id}/status) */}
      {statusModalFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Power size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#14121b]">Update Operational Status</h3>
                  <p className="text-xs text-[#767679]">
                    {statusModalFacility.name} ({statusModalFacility.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalFacility(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Target Status <span className="text-red-500">*</span>
                </span>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="reference-select w-full"
                >
                  {statuses.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                  Reason (Optional)
                </span>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="reference-input w-full !h-auto py-2"
                  placeholder="Enter justification (e.g. Scheduled facility maintenance, renovation completed, branch closed)..."
                />
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalFacility(null)}
                  className="reference-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="reference-button-primary"
                >
                  {updatingStatus ? "Updating..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
