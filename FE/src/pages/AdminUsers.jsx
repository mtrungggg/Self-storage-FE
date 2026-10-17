import { useEffect, useState } from "react";
import adminUserService from "../api/adminUserService";
import AdminCreateUserForm from "../components/AdminCreateUserForm";

const roles = [
  ["storage_customer", "Khách hàng"],
  ["facility_staff", "Nhân viên kho"],
  ["facility_manager", "Quản lý kho"],
  ["business_operations_manager", "Quản lý vận hành"],
  ["system_administrator", "Quản trị viên"],
];
const statuses = [["active", "Hoạt động"], ["disabled", "Vô hiệu hóa"], ["locked", "Đã khóa"]];
const initialFilters = { Search: "", Role: "", Status: "", FacilityId: "", PageSize: 10 };
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
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
  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  useEffect(() => {
    let active = true;
    adminUserService.getUsers(query).then(
      (data) => { if (active) setResult({ query, data }); },
      (err) => { if (active) setResult({ query, error: err.message || "Không thể tải danh sách người dùng." }); },
    );
    return () => { active = false; };
  }, [query]);

  function applyFilters(event) {
    event.preventDefault();
    setQuery({ ...filters, Search: filters.Search.trim(), PageNumber: 1 });
  }

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
        <h1 className="mt-1 text-2xl font-bold">Quản lý người dùng</h1>
      </div>
      <button type="button" disabled={loading} onClick={() => setQuery({ ...query })} className={buttonClass}>Làm mới</button>
    </div>
    <AdminCreateUserForm roles={roles} onCreated={() => {
      setFilters(initialFilters);
      setQuery({ ...initialFilters, PageNumber: 1 });
    }} />
    <form onSubmit={applyFilters} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <label><span className="mb-1 block text-sm font-semibold">Tìm kiếm</span>
          <input type="search" value={filters.Search} onChange={(event) => setFilters({ ...filters, Search: event.target.value })} placeholder="Tìm người dùng..." className={inputClass} />
        </label>
        {[["Role", "Vai trò", roles], ["Status", "Trạng thái", statuses]].map(([key, label, options]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}</span>
          <select value={filters[key]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} className={inputClass}>
            <option value="">Tất cả</option>
            {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>)}
        <label><span className="mb-1 block text-sm font-semibold">ID cơ sở</span>
          <input type="number" min="1" step="1" value={filters.FacilityId} onChange={(event) => setFilters({ ...filters, FacilityId: event.target.value })} placeholder="Tất cả cơ sở" className={inputClass} />
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Số dòng mỗi trang</span>
          <select value={filters.PageSize} onChange={(event) => setFilters({ ...filters, PageSize: Number(event.target.value) })} className={inputClass}>
            {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className={buttonClass}>Áp dụng</button>
        <button type="button" onClick={() => { setFilters(initialFilters); setQuery({ ...initialFilters, PageNumber: 1 }); }} className="rounded-xl border border-[#dfe7f5] px-4 py-2.5 text-sm font-semibold">Xóa bộ lọc</button>
      </div>
    </form>
    <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <h2 className="font-bold">Danh sách người dùng{data ? ` (${data.totalCount})` : ""}</h2>
      {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải danh sách...</p>}
      {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
        <p>{error}</p><button type="button" onClick={() => setQuery({ ...query })} className="mt-2 font-semibold underline">Thử lại</button>
      </div>}
      {data && <>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead><tr className="border-b text-xs uppercase text-[#58657a]">
              {["ID", "Họ và tên", "Email", "Số điện thoại", "Mã nhân viên", "Vai trò", "Cơ sở phụ trách", "Trạng thái", "Đăng nhập gần nhất", "Ngày tạo", "Cập nhật"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}
            </tr></thead>
            <tbody>{data.items.map((user) => <tr key={user.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
              <td className="p-3">{user.id}</td>
              <td className="p-3 font-semibold">{user.fullName || "—"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.phoneNumber || "—"}</td>
              <td className="p-3">{user.employeeCode || "—"}</td>
              <td className="p-3">{user.roles?.map((role) => labelFor(roles, role)).join(", ") || "—"}</td>
              <td className="p-3" title={user.assignedFacilityIds?.join(", ")}>{user.assignedFacilityNames?.join(", ") || "—"}</td>
              <td className="p-3">{labelFor(statuses, user.status)}</td>
              <td className="whitespace-nowrap p-3">{formatDate(user.lastLoginAt)}</td>
              <td className="whitespace-nowrap p-3">{formatDate(user.createdAt)}</td>
              <td className="whitespace-nowrap p-3">{formatDate(user.updatedAt)}</td>
            </tr>)}</tbody>
          </table>
          {data.items.length === 0 && <p className="py-8 text-center text-sm text-[#58657a]">Không tìm thấy người dùng phù hợp.</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p>{data.totalCount === 0 ? "0 người dùng" : `Trang ${data.pageNumber} / ${data.totalPages} · Tổng ${data.totalCount} người dùng`}</p>
          <div className="flex gap-2">
            <button type="button" disabled={!data.hasPreviousPage || query.PageNumber <= 1} onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })} className={buttonClass}>Trang trước</button>
            <button type="button" disabled={!data.hasNextPage} onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })} className={buttonClass}>Trang sau</button>
          </div>
        </div>
      </>}
    </section>
  </div>;
}
