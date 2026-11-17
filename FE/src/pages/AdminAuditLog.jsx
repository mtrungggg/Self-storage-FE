import DatePicker from "@/components/ui/date-picker";
import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { Fragment, useEffect, useState } from "react";
import { History, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import AuditChangeDetails from "../components/AuditChangeDetails";
import adminAuditLogService from "../api/adminAuditLogService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";
import PAGINATION from "../constants/pagination";

const ENTITY_OPTIONS = [
  { value: "", label: "Tất cả đối tượng" },
  { value: "Facility", label: "Cơ sở kho" },
  { value: "StorageUnit", label: "Ô kho lưu trữ" },
  { value: "User", label: "Tài khoản người dùng" },
  { value: "RentalAgreement", label: "Hợp đồng thuê" },
  { value: "Reservation", label: "Đơn đặt chỗ" },
  { value: "SupportTicket", label: "Yêu cầu hỗ trợ" },
  { value: "StaffFacilityAssignment", label: "Phân công nhân sự" },
  { value: "Invoice", label: "Hóa đơn" },
  { value: "Payment", label: "Giao dịch thanh toán" },
];

const ACTION_OPTIONS = [
  { value: "", label: "Tất cả hành động" },
  { value: "Create", label: "Tạo mới (Create)" },
  { value: "Update", label: "Cập nhật (Update)" },
  { value: "Update_Status", label: "Đổi trạng thái (Status)" },
  { value: "Update_Roles", label: "Phân quyền / Đổi vai trò (Roles)" },
  { value: "Assign_Staff", label: "Phân công nhân viên (Assign)" },
  { value: "Revoke_Staff_Assignment", label: "Thu hồi phân công (Revoke)" },
  { value: "Delete", label: "Xóa (Delete)" },
];

const defaults = {
  EntityType: "",
  EntityId: "",
  Action: "",
  ActorUserId: "",
  SearchKeyword: "",
  FromDate: "",
  ToDate: "",
  PageSize: PAGINATION.TABLE_PAGE_SIZE,
};

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

export default function AdminAuditLog() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(defaults);
  const [query, setQuery] = useState({ ...defaults, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [validation, setValidation] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showDates, setShowDates] = useState(false);

  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  useEffect(() => {
    let active = true;
    adminAuditLogService.getLogs(query).then(
      (data) => {
        if (active) setResult({ query, data });
      },
      (err) => {
        if (active) setResult({ query, error: err.message || "Failed to load audit logs." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function apply(event) {
    if (event) event.preventDefault();
    setValidation("");
    const next = { ...filters, PageNumber: 1 };

    // Intelligent unified search field handling:
    const kw = (next.SearchKeyword || "").trim();
    if (kw) {
      next.SearchKeyword = kw;
      if (/^\d+$/.test(kw)) {
        next.EntityId = kw;
        next.ActorUserId = kw;
      } else {
        next.EntityId = kw;
        next.ActorUserId = "";
      }
    } else {
      next.SearchKeyword = "";
      next.EntityId = "";
      next.ActorUserId = "";
    }

    for (const key of ["FromDate", "ToDate"]) {
      if (!next[key]) continue;
      const date = new Date(next[key]);
      if (Number.isNaN(date.getTime())) {
        setValidation("Invalid date and time entered.");
        return;
      }
      next[key] = date.toISOString();
    }
    if (!isValidDateRange(next.FromDate, next.ToDate)) {
      setValidation("End date must be later than or equal to start date.");
      return;
    }

    setExpanded(null);
    setQuery(next);
  }

  function changePage(page) {
    setExpanded(null);
    setQuery({ ...query, PageNumber: page });
  }

  return (
    <div className="reference-dashboard max-w-7xl mx-auto">
      {/* Top Toolbar */}
      <div className="reference-toolbar mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1>{t("admin.audit_logs_title", "Audit Logs")}</h1>
            {data && <span className="reference-pill">{data.totalCount} events recorded</span>}
          </div>
          <p className="reference-muted mt-0.5">
            System-wide audit trail for data mutations, security events, and administrative changes.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={() => {
              setExpanded(null);
              setQuery({ ...query });
            }}
            aria-label="Refresh audit logs"
            title="Refresh audit logs"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Streamlined 1-Row Horizontal Filter Bar */}
      <form onSubmit={apply} className="reference-card mb-5 p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Smart Search ID / Actor */}
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.SearchKeyword}
              onChange={(e) => setFilters({ ...filters, SearchKeyword: e.target.value })}
              placeholder="Search ID, Actor, or keyword..."
              className="reference-input !pl-9 text-xs"
            />
          </div>

          {/* Entity Type Dropdown */}
          <div className="w-44">
            <SelectDropdown
              value={filters.EntityType}
              onChange={(e) => setFilters({ ...filters, EntityType: e.target.value })}
              className="reference-select text-xs"
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectDropdown>
          </div>

          {/* Action Dropdown */}
          <div className="w-36">
            <SelectDropdown
              value={filters.Action}
              onChange={(e) => setFilters({ ...filters, Action: e.target.value })}
              className="reference-select text-xs"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectDropdown>
          </div>

          {/* Rows per page */}
          <div className="w-32">
            <SelectDropdown
              value={filters.PageSize}
              onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })}
              className="reference-select text-xs"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} dòng / trang
                </option>
              ))}
            </SelectDropdown>
          </div>

          {/* Date Toggle */}
          <button
            type="button"
            onClick={() => setShowDates((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              showDates || filters.FromDate || filters.ToDate
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={13} />
            <span>{t("common.date", "Thời gian")}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => {
                setFilters(defaults);
                setValidation("");
                setExpanded(null);
                setQuery({ ...defaults, PageNumber: 1 });
              }}
              className="reference-button-secondary !py-1.5 !px-3 !text-xs"
            >
              Reset
            </button>
            <button type="submit" className="reference-button-primary !py-1.5 !px-3.5 !text-xs">
              Apply
            </button>
          </div>
        </div>

        {/* Expandable Date Filters */}
        {showDates && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 border-t border-slate-100 pt-3">
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-600">{t("common.date", "Từ ngày")}</span>
              <DatePicker
                value={filters.FromDate}
                onChange={(e) => setFilters({ ...filters, FromDate: e.target.value })}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-600">Đến ngày</span>
              <DatePicker
                value={filters.ToDate}
                onChange={(e) => setFilters({ ...filters, ToDate: e.target.value })}
              />
            </div>
          </div>
        )}

        {validation && (
          <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
            {validation}
          </p>
        )}
      </form>

      {/* Audit Log Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Nhật ký hoạt động hệ thống</h2>
            <p className="reference-muted">
              {data ? `Hiển thị trang ${data.pageNumber} / ${data.totalPages} (Tổng số ${data.totalCount} sự kiện)` : "Đang tải dữ liệu nhật ký..."}
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="reference-error mx-5 my-4">
            <AlertTriangle size={20} />
            <div>
              <strong>Error Loading Audit Events</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">Mã sự kiện</th>
                <th scope="col">Thời gian</th>
                <th scope="col">Người thực hiện</th>
                <th scope="col">Vai trò</th>
                <th scope="col">Đối tượng</th>
                <th scope="col">Mã ĐT</th>
                <th scope="col">Hành động</th>
                <th scope="col">Địa chỉ IP</th>
                <th scope="col" className="text-right pr-6">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Đang tải danh sách nhật ký...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <History size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-slate-900">Không tìm thấy sự kiện nhật ký nào</strong>
                      <p className="text-xs text-slate-500 mt-1">Không có hoạt động nào phù hợp với điều kiện lọc đã chọn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((entry) => {
                  const actLower = String(entry.action || "").toLowerCase();
                  const actionStyle = actLower.includes("create")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : actLower.includes("delete")
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <Fragment key={entry.id}>
                      <tr>
                        <td>
                          <span className="font-mono text-xs text-slate-500">#{entry.id}</span>
                        </td>
                        <td className="text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(entry.occurredAt)}
                        </td>
                        <td>
                          <div className="font-semibold text-slate-900">{entry.actorEmail || "System"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {entry.actorUserId ?? "—"}</div>
                        </td>
                        <td>
                          <span className="reference-pill !py-0.5 !px-2 !text-[10px]">
                            {entry.actorRole || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-800">{entry.entityType || "—"}</span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-600">{entry.entityId || "—"}</span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${actionStyle}`}>
                            {entry.action === "ASSIGN_STAFF" ? "Phân công NV" :
                             entry.action === "REVOKE_STAFF_ASSIGNMENT" ? "Thu hồi phân công" :
                             entry.action === "UPDATE_ROLES" ? "Đổi vai trò" :
                             entry.action === "UPDATE_STATUS" ? "Đổi trạng thái" :
                             entry.action === "CREATE" ? "Tạo mới" :
                             entry.action === "UPDATE" ? "Cập nhật" :
                             entry.action === "DELETE" ? "Xóa" :
                             (entry.action ?? "—")}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-500">{entry.ipAddress === "::1" || entry.ipAddress === "127.0.0.1" ? "Nội bộ (Local)" : (entry.ipAddress || "—")}</span>
                        </td>
                        <td className="text-right pr-6">
                          <button
                            type="button"
                            aria-expanded={expanded === entry.id}
                            aria-controls={`audit-detail-${entry.id}`}
                            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                            className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                          >
                            {expanded === entry.id ? (
                              <>
                                Thu gọn <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                Chi tiết <ChevronDown size={12} />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expanded === entry.id && (
                        <tr id={`audit-detail-${entry.id}`}>
                          <td colSpan={9} className="!p-0 border-b border-slate-200 bg-slate-50/70">
                            <AuditChangeDetails entry={entry} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="reference-pagination">
            <span>
              Trang <strong>{data.pageNumber}</strong> / <strong>{data.totalPages}</strong> ({data.totalCount} sự kiện)
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={data.pageNumber <= 1 || loading}
                onClick={() => changePage(data.pageNumber - 1)}
                className="reference-button-secondary !py-1 !px-2 text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                type="button"
                disabled={data.pageNumber >= data.totalPages || loading}
                onClick={() => changePage(data.pageNumber + 1)}
                className="reference-button-secondary !py-1 !px-2 text-xs"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
