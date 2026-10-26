import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import adminFacilityService from "../api/adminFacilityService";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

import FacilityFilters from "../components/admin/facilities/FacilityFilters";
import FacilityTable from "../components/admin/facilities/FacilityTable";
import FacilityFormModal from "../components/admin/facilities/FacilityFormModal";
import FacilityDetailModal from "../components/admin/facilities/FacilityDetailModal";
import FacilityStatusModal from "../components/admin/facilities/FacilityStatusModal";

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

  // Detail modal state
  const [selectedFacilityId, setSelectedFacilityId] = useState(paramFacilityId || null);
  const [facilityDetail, setFacilityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Status modal state
  const [statusModalFacility, setStatusModalFacility] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (paramFacilityId) {
      setSelectedFacilityId(paramFacilityId);
    }
  }, [paramFacilityId]);

  function closeDetailModal() {
    setSelectedFacilityId(null);
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

  const fetchFacilityDetail = useCallback(async (id) => {
    if (!id) {
      setFacilityDetail(null);
      return;
    }
    setLoadingDetail(true);
    setDetailError("");
    try {
      const res = await adminFacilityService.getFacility(id);
      setFacilityDetail(res);
    } catch (err) {
      setDetailError(err.message || "Failed to load facility details.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      fetchFacilityDetail(selectedFacilityId);
    }
  }, [selectedFacilityId, fetchFacilityDetail]);

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
    try {
      const detailed = await adminFacilityService.getFacility(facility.id);
      setFormData({
        code: detailed.code || "",
        name: detailed.name || "",
        addressLine: detailed.addressLine || "",
        ward: detailed.ward || "",
        district: detailed.district || "",
        city: detailed.city || "Ho Chi Minh",
        latitude: detailed.latitude ?? 10.7769,
        longitude: detailed.longitude ?? 106.7009,
        timezone: detailed.timezone || FACILITY_TIMEZONE,
        openingTime: detailed.openingTime || "07:00:00",
        closingTime: detailed.closingTime || "22:00:00",
        status: detailed.status || "active",
      });
    } catch {
      setFormData({
        code: facility.code || "",
        name: facility.name || "",
        addressLine: facility.addressLine || "",
        ward: facility.ward || "",
        district: facility.district || "",
        city: facility.city || "Ho Chi Minh",
        latitude: facility.latitude ?? 10.7769,
        longitude: facility.longitude ?? 106.7009,
        timezone: facility.timezone || FACILITY_TIMEZONE,
        openingTime: facility.openingTime || "07:00:00",
        closingTime: facility.closingTime || "22:00:00",
        status: facility.status || "active",
      });
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");
    try {
      if (editingFacility) {
        await adminFacilityService.updateFacility(editingFacility.id, formData);
        setNotice(`Facility "${formData.name}" updated successfully.`);
      } else {
        await adminFacilityService.createFacility(formData);
        setNotice(`Facility "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingFacility(null);
      loadData();
      if (selectedFacilityId) {
        fetchFacilityDetail(selectedFacilityId);
      }
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setActionError(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function openStatusModal(facility) {
    setStatusModalFacility(facility);
    setTargetStatus(facility.status || "active");
    setStatusReason("");
  }

  async function handleStatusSubmit(e) {
    e.preventDefault();
    if (!statusModalFacility) return;
    setUpdatingStatus(true);
    setActionError("");
    try {
      const updated = await adminFacilityService.updateStatus(statusModalFacility.id, {
        status: targetStatus,
        reason: statusReason,
      });
      setNotice(`Facility "${statusModalFacility.name}" status changed to ${targetStatus.toUpperCase()}.`);
      setStatusModalFacility(null);
      loadData();
      if (selectedFacilityId === statusModalFacility.id) {
        setFacilityDetail(updated);
      }
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update facility status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleRemoveStaffAssignment(assignmentId) {
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

      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]"
        >
          <CheckCircle2 size={18} className="text-[#23866a]" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <FacilityFormModal
        isOpen={isFormOpen}
        editingFacility={editingFacility}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFacility(null);
        }}
        statuses={statuses}
      />

      <FacilityFilters
        filters={filters}
        setFilters={setFilters}
        onSubmit={handleFilterSubmit}
        onReset={handleResetFilters}
        statuses={statuses}
      />

      <FacilityTable
        facilities={facilities}
        data={data}
        query={query}
        setQuery={setQuery}
        loading={loading}
        onViewDetails={(id) => setSelectedFacilityId(id)}
        onEdit={openEditModal}
        onStatusChange={openStatusModal}
      />

      <FacilityDetailModal
        selectedFacilityId={selectedFacilityId}
        facilityDetail={facilityDetail}
        loadingDetail={loadingDetail}
        detailError={detailError}
        formatDate={formatDate}
        onClose={closeDetailModal}
        onRetry={() => fetchFacilityDetail(selectedFacilityId)}
        onOpenStatus={(fac) => openStatusModal(fac)}
        onOpenEdit={(fac) => {
          closeDetailModal();
          openEditModal(fac);
        }}
        onRemoveStaff={handleRemoveStaffAssignment}
      />

      <FacilityStatusModal
        facility={statusModalFacility}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        statusReason={statusReason}
        setStatusReason={setStatusReason}
        updatingStatus={updatingStatus}
        onSubmit={handleStatusSubmit}
        onClose={() => setStatusModalFacility(null)}
        statuses={statuses}
      />
    </div>
  );
}
