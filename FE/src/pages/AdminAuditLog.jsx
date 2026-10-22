import { Fragment, useEffect, useState } from "react";
import { History, Search, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import adminAuditLogService from "../api/adminAuditLogService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";

const defaults = {
  EntityType: "",
  EntityId: "",
  Action: "",
  ActorUserId: "",
  FromDate: "",
  ToDate: "",
  PageSize: 20,
};

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function formatPayload(value) {
  if (value == null || value === "") return "Không có dữ liệu thay đổi.";
  try {
    return JSON.stringify(typeof value === "string" ? JSON.parse(value) : value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AdminAuditLog() {
  const [filters, setFilters] = useState(defaults);
  const [query, setQuery] = useState({ ...defaults, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [validation, setValidation] = useState("");
  const [expanded, setExpanded] = useState(null);
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
        if (active) setResult({ query, error: err.message || "Không thể tải nhật ký quản trị." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function apply(event) {
    event.preventDefault();
    setValidation("");
    const next = { ...filters, PageNumber: 1 };
    for (const key of ["EntityType", "EntityId", "Action"]) next[key] = next[key].trim();
    for (const key of ["FromDate", "ToDate"]) {
      if (!next[key]) continue;
      const date = new Date(next[key]);
      if (Number.isNaN(date.getTime())) {
        setValidation("Thời gian nhập vào không hợp lệ.");
        return;
      }
      next[key] = date.toISOString();
    }
    if (!isValidDateRange(next.FromDate, next.ToDate)) {
      setValidation("Thời gian kết thúc phải bằng hoặc sau thời gian bắt đầu.");
      return;
    }
    if (next.ActorUserId && !isValidPositiveInteger(next.ActorUserId)) {
      setValidation("ID người thực hiện phải là số nguyên dương.");
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
    <div className="reference-dashboard">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Nhật ký kiểm toán (Audit Log)</h1>
            {data && <span className="reference-pill">{data.totalCount} bản ghi</span>}
          </div>
          <p className="reference-muted mt-1">
            Ghi vết toàn bộ hành vi CRUD và biến động dữ liệu hệ thống đảm bảo tính minh bạch và an toàn bảo mật.
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
            aria-label="Làm mới nhật ký"
            title="Làm mới nhật ký"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <form onSubmit={apply} className="reference-card mb-6 p-5">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["EntityType", "Loại đối tượng (Entity)"],
            ["EntityId", "Mã đối tượng (ID)"],
            ["Action", "Hành động (Create/Update/Delete)"],
            ["ActorUserId", "ID người thực hiện"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <input
                value={filters[key]}
                inputMode={key === "ActorUserId" ? "numeric" : undefined}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                placeholder={`Nhập ${label.toLowerCase()}...`}
                className="reference-input"
              />
            </label>
          ))}

          {[
            ["FromDate", "Từ ngày / giờ"],
            ["ToDate", "Đến ngày / giờ"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <input
                type="datetime-local"
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="reference-input"
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Số dòng mỗi trang</span>
            <select
              value={filters.PageSize}
              onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })}
              className="reference-select"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} dòng / trang
                </option>
              ))}
            </select>
          </label>
        </div>

        {validation && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {validation}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#ededed] pt-3.5">
          <span className="text-xs text-[#767679]">
            Múi giờ hệ thống: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilters(defaults);
                setValidation("");
                setExpanded(null);
                setQuery({ ...defaults, PageNumber: 1 });
              }}
              className="reference-button-secondary"
            >
              Đặt lại
            </button>
            <button type="submit" className="reference-button-primary">
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </form>

      {/* Audit Log Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Danh sách sự kiện kiểm toán</h2>
            <p className="reference-muted">
              {data ? `Tìm thấy tổng cộng ${data.totalCount} hành động đã thực hiện.` : "Đang truy vấn nhật ký..."}
            </p>
          </div>
          {data && (
            <span className="reference-pill">
              Trang {data.pageNumber} / {Math.max(1, data.totalPages)}
            </span>
          )}
        </div>

        {error && (
          <div role="alert" className="reference-error mx-5 my-4">
            <AlertTriangle size={20} />
            <div>
              <strong>Lỗi tải nhật ký kiểm toán</strong>
              <p>{error}</p>
              <button type="button" onClick={() => setQuery({ ...query })}>
                Thử lại
              </button>
            </div>
          </div>
        )}

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Thời gian</th>
                <th scope="col">Người thực hiện</th>
                <th scope="col">Vai trò</th>
                <th scope="col">Đối tượng</th>
                <th scope="col">ID đối tượng</th>
                <th scope="col">Hành động</th>
                <th scope="col">Địa chỉ IP</th>
                <th scope="col" className="text-right pr-6">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#767679]">
                    Đang tải nhật ký kiểm toán...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <History size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">Không tìm thấy sự kiện nào</strong>
                      <p className="text-xs text-[#767679] mt-1">Chưa có thay đổi nào khớp với bộ lọc đã chọn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((entry) => (
                  <Fragment key={entry.id}>
                    <tr>
                      <td>
                        <span className="font-mono text-xs text-slate-500">#{entry.id}</span>
                      </td>
                      <td className="text-xs text-[#767679] whitespace-nowrap">
                        {formatDate(entry.occurredAt)}
                      </td>
                      <td>
                        <div className="font-semibold text-[#14121b]">{entry.actorEmail || "Hệ thống"}</div>
                        <div className="text-[10px] text-[#767679]">ID: {entry.actorUserId ?? "—"}</div>
                      </td>
                      <td>
                        <span className="reference-pill !py-0.5 !px-2.5 !text-[10px]">
                          {entry.actorRole || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-[#14121b]">{entry.entityType || "—"}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-600">{entry.entityId || "—"}</span>
                      </td>
                      <td>
                        <span
                          className={`reference-status ${
                            String(entry.action).toLowerCase().includes("delete")
                              ? "maintenance"
                              : String(entry.action).toLowerCase().includes("create")
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {entry.action ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-500">{entry.ipAddress || "—"}</span>
                      </td>
                      <td className="text-right pr-6">
                        <button
                          type="button"
                          aria-expanded={expanded === entry.id}
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
                        <td colSpan={9} className="bg-[#f2f4f6] p-4 border-b border-[#e5e5e5]">
                          <div className="rounded-2xl bg-white p-4 border border-[#e5e5e5]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-xs text-slate-600">
                                <strong>Request ID:</strong> {entry.requestId || "—"}
                              </span>
                              <span className="reference-pill text-[10px]">JSON Payload Diff</span>
                            </div>
                            <div className="grid gap-3 lg:grid-cols-2">
                              <div>
                                <h3 className="text-xs font-bold text-[#767679] mb-1.5 flex items-center gap-1.5">
                                  <FileCode size={13} /> Dữ liệu trước thay đổi (Old Values)
                                </h3>
                                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[#ededed] bg-[#fafafa] p-3 font-mono text-[11px] text-slate-700">
                                  {formatPayload(entry.oldValues)}
                                </pre>
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-[#767679] mb-1.5 flex items-center gap-1.5">
                                  <FileCode size={13} /> Dữ liệu sau thay đổi (New Values)
                                </h3>
                                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[#ededed] bg-[#fafafa] p-3 font-mono text-[11px] text-slate-700">
                                  {formatPayload(entry.newValues)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Dashboard */}
        {data && (
          <div className="reference-pagination">
            <span>
              {data.totalCount === 0
                ? "0 sự kiện"
                : `Hiển thị trang ${data.pageNumber} / ${Math.max(1, data.totalPages)} (Tổng ${data.totalCount} sự kiện)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!data.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => changePage(query.PageNumber - 1)}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                type="button"
                disabled={!data.hasNextPage}
                onClick={() => changePage(query.PageNumber + 1)}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
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
