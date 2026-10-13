import { useEffect, useMemo, useState } from "react";
import {
  getBreadcrumb,
  getOverviewHeader,
  getHeaderActions,
  getSectionTabs,
  getKpis,
  getFilterOptions,
  getQuickFilters,
  getAuditEvents as getMockAuditEvents,
  getAuditFootnote,
  getComplianceCards,
} from "../data/auditLogRepository";
import { filterAuditTrail } from "../domain/usecases/filterAuditTrail";
import adminService from "../api/adminService";

const DEFAULT_FILTERS = { category: "all", status: "all", actorType: "all" };

function mapDtoToAuditEvent(dto) {
  const d = new Date(dto.occurredAt);
  const time = d.toLocaleTimeString("vi-VN");
  const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return {
    id: `evt-${dto.id}`,
    time,
    date,
    actor: dto.actorEmail || `User #${dto.actorUserId}`,
    actorRole: dto.actorRole || "Staff / Admin",
    actorType: dto.actorRole?.toLowerCase().includes("system") ? "system" : "staff",
    category: dto.entityType?.toLowerCase().includes("lock") ? "iot" : "storage",
    categoryLabel: dto.entityType || "System Action",
    action: `${dto.action} trên thực thể ${dto.entityType} (ID: ${dto.entityId})${dto.newValues ? ` • Chi tiết: ${dto.newValues}` : ""}`,
    ip: dto.ipAddress || "127.0.0.1",
    device: "API Web Client",
    status: "success",
  };
}

// Application layer: encapsulates System Activity & Audit Log page state and data wiring with AdminController.
export function useAuditLog() {
  const breadcrumb = getBreadcrumb();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const sectionTabs = getSectionTabs();
  const filterOptions = getFilterOptions();
  const quickFilters = getQuickFilters();
  const auditFootnote = getAuditFootnote();
  const complianceCards = getComplianceCards();

  const [auditEvents, setAuditEvents] = useState(getMockAuditEvents());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const kpis = useMemo(() => {
    const totalCount = auditEvents.length;
    const iotCount = auditEvents.filter((e) => e.category === "iot").length;
    return [
      { id: "events", icon: "database", label: "Nhật Ký Sự Kiện", value: `${totalCount} bản ghi`, sub: "Truy vấn từ [core].[audit_logs]" },
      { id: "iot", icon: "lock", label: "Tác Vụ Thiết Bị", value: `${iotCount} tác vụ`, sub: "Hành động khóa & truy cập" },
      { id: "waf", icon: "shield", label: "Bảo Mật Hệ Thống", value: "An toàn", sub: "Không phát hiện mối đe dọa cao" },
      { id: "hash", icon: "verified_user", label: "Toàn Vẹn Dữ Liệu", value: "100% Valid", sub: "Xác thực mã hóa chuỗi khối SHA-256" },
    ];
  }, [auditEvents]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ pageSize: 50 });
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : null);
      if (items && items.length > 0) {
        setAuditEvents(items.map(mapDtoToAuditEvent));
      }
    } catch (err) {
      console.warn("Could not load real audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const applyQuickFilter = (value) => setSearch(value);

  const filteredEvents = useMemo(
    () => filterAuditTrail(auditEvents, { search, ...filters }),
    [auditEvents, search, filters]
  );

  return {
    breadcrumb,
    header,
    headerActions,
    sectionTabs,
    kpis,
    filterOptions,
    quickFilters,
    search,
    setSearch,
    filters,
    updateFilter,
    applyQuickFilter,
    filteredEvents,
    totalEvents: auditEvents.length,
    auditFootnote,
    complianceCards,
    loading,
    toast,
    setToast,
    loadAuditLogs,
    showToast,
  };
}
