import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, RefreshCw, UserPlus, ChevronLeft, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";
import adminUserService from "../api/adminUserService";
import AdminCreateUserForm from "../components/AdminCreateUserForm";

const roles = [
  ["storage_customer", "Khách hàng"],
  ["facility_staff", "Nhân viên kho"],
  ["facility_manager", "Quản lý kho"],
  ["business_operations_manager", "Quản lý vận hành"],
  ["system_administrator", "Quản trị viên"],
];
const statuses = [
  ["active", "Hoạt động"],
  ["disabled", "Vô hiệu hóa"],
  ["locked", "Đã khóa"],
];
const initialFilters = { Search: "", Role: "", Status: "", FacilityId: "", PageSize: 10 };
const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value || "—";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

export default function AdminUsers() {
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState({ ...initialFilters, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  useEffect(() => {
    let active = true;
    adminUserService.getUsers(query).then(
      (data) => {
        if (active) setResult({ query, data });
      },
      (err) => {
        if (active) setResult({ query, error: err.message || "Không thể tải danh sách người dùng." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function applyFilters(event) {
    event.preventDefault();
    setQuery({ ...filters, Search: filters.Search.trim(), PageNumber: 1 });
  }

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Tài khoản &amp; Phân quyền</h1>
            {data && <span className="reference-pill">{data.totalCount} tài khoản</span>}
          </div>
          <p className="reference-muted mt-1">
            Quản trị toàn bộ tài khoản người dùng, phân quyền vai trò (Admin, Manager, Staff, Customer) và cơ sở phụ trách.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <label className="reference-search">
            <Search size={18} strokeWidth={1.5} />
            <input
              type="search"
              aria-label="Tìm kiếm người dùng"
              value={filters.Search}
              onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setQuery({ ...filters, Search: filters.Search.trim(), PageNumber: 1 });
                }
              }}
              placeholder="Tìm kiếm họ tên, email, SĐT..."
            />
          </label>
          <button
            type="button"
            onClick={() => setCreateOpen(!createOpen)}
            className="reference-button-primary"
          >
            <UserPlus size={15} /> Thêm tài khoản
          </button>
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={() => setQuery({ ...query })}
            aria-label="Làm mới dữ liệu"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Form Tạo Người Dùng */}
      <AdminCreateUserForm
        roles={roles}
        open={createOpen}
        setOpen={setCreateOpen}
        onCreated={() => {
          setFilters(initialFilters);
          setQuery({ ...initialFilters, PageNumber: 1 });
        }}
      />

      {/* Filter Card */}
      <form onSubmit={applyFilters} className="reference-card mb-6 p-5">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Từ khóa</span>
            <input
              type="search"
              value={filters.Search}
              onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
              placeholder="Họ tên, email, SĐT..."
              className="reference-input"
            />
          </label>

          {[
            ["Role", "Vai trò", roles],
            ["Status", "Trạng thái", statuses],
          ].map(([key, label, options]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="reference-select"
              >
                <option value="">Tất cả</option>
                {options.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Mã cơ sở phụ trách</span>
            <input
              type="number"
              min="1"
              step="1"
              value={filters.FacilityId}
              onChange={(e) => setFilters({ ...filters, FacilityId: e.target.value })}
              placeholder="ID cơ sở kho"
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Số dòng / trang</span>
            <select
              value={filters.PageSize}
              onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })}
              className="reference-select"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} dòng
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              setQuery({ ...initialFilters, PageNumber: 1 });
            }}
            className="reference-button-secondary"
          >
            Đặt lại
          </button>
          <button type="submit" className="reference-button-primary">
            Áp dụng bộ lọc
          </button>
        </div>
      </form>

      {/* Users Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Danh sách người dùng</h2>
            <p className="reference-muted">
              {data ? `Tổng số ${data.totalCount} tài khoản được ghi nhận trên hệ thống.` : "Đang tải dữ liệu..."}
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
              <strong>Lỗi tải danh sách người dùng</strong>
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
                <th scope="col">Họ và tên</th>
                <th scope="col">Email</th>
                <th scope="col">Số điện thoại</th>
                <th scope="col">Mã NV</th>
                <th scope="col">Vai trò</th>
                <th scope="col">Cơ sở kho phụ trách</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Đăng nhập gần nhất</th>
                <th scope="col" className="text-right pr-6">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-[#767679]">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <Users size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">Không tìm thấy người dùng phù hợp</strong>
                      <p className="text-xs text-[#767679] mt-1">Hãy thử tìm với từ khóa hoặc bộ lọc khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-500">#{user.id}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                          {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                        </span>
                        <Link
                          to={`/admin-users/${encodeURIComponent(user.id)}`}
                          className="font-semibold text-[#14121b] hover:underline"
                        >
                          {user.fullName || "—"}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{user.email}</span>
                    </td>
                    <td>{user.phoneNumber || "—"}</td>
                    <td>
                      {user.employeeCode ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">
                          {user.employeeCode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className="reference-pill !py-0.5 !px-2.5 !text-[10px]">
                        {user.roles?.map((r) => labelFor(roles, r)).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate" title={user.assignedFacilityNames?.join(", ")}>
                      {user.assignedFacilityNames?.join(", ") || "—"}
                    </td>
                    <td>
                      <span
                        className={`reference-status ${
                          user.status === "active"
                            ? "active"
                            : user.status === "locked"
                            ? "maintenance"
                            : "inactive"
                        }`}
                      >
                        {labelFor(statuses, user.status)}
                      </span>
                    </td>
                    <td className="text-xs text-[#767679]">{formatDate(user.lastLoginAt)}</td>
                    <td className="text-right pr-6">
                      <Link
                        to={`/admin-users/${encodeURIComponent(user.id)}`}
                        className="reference-button-secondary !py-1 !px-3 !text-[11px]"
                      >
                        Chi tiết <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
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
                ? "0 người dùng"
                : `Hiển thị trang ${data.pageNumber} / ${Math.max(1, data.totalPages)} (Tổng ${data.totalCount} tài khoản)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!data.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                type="button"
                disabled={!data.hasNextPage}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })}
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
