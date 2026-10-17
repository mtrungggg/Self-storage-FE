import { Fragment, useEffect, useState } from "react";
import adminAuditLogService from "../api/adminAuditLogService";

const defaults = { EntityType: "", EntityId: "", Action: "", ActorUserId: "", FromDate: "", ToDate: "", PageSize: 20 };
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}
function formatPayload(value) {
  if (value == null || value === "") return "Không có dữ liệu.";
  try { return JSON.stringify(typeof value === "string" ? JSON.parse(value) : value, null, 2); }
  catch { return String(value); }
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
      (data) => { if (active) setResult({ query, data }); },
      (err) => { if (active) setResult({ query, error: err.message || "Không thể tải nhật ký quản trị." }); },
    );
    return () => { active = false; };
  }, [query]);

  function apply(event) {
    event.preventDefault();
    setValidation("");
    const next = { ...filters, PageNumber: 1 };
    for (const key of ["EntityType", "EntityId", "Action"]) next[key] = next[key].trim();
    for (const key of ["FromDate", "ToDate"]) {
      if (!next[key]) continue;
      const date = new Date(next[key]);
      if (Number.isNaN(date.getTime())) { setValidation("Thời gian không hợp lệ."); return; }
      next[key] = date.toISOString();
    }
    if (next.FromDate && next.ToDate && new Date(next.FromDate) > new Date(next.ToDate)) {
      setValidation("Thời gian kết thúc phải bằng hoặc sau thời gian bắt đầu."); return;
    }
    if (next.ActorUserId && !/^[1-9]d*$/.test(next.ActorUserId)) {
      setValidation("ID người thực hiện phải là số nguyên dương."); return;
    }
    setExpanded(null);
    setQuery(next);
  }

  function changePage(page) { setExpanded(null); setQuery({ ...query, PageNumber: page }); }

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
        <h1 className="mt-1 text-2xl font-bold">Nhật ký quản trị</h1>
      </div>
      <button type="button" disabled={loading} onClick={() => { setExpanded(null); setQuery({ ...query }); }} className={buttonClass}>Làm mới</button>
    </div>
    <form onSubmit={apply} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["EntityType", "Loại đối tượng"], ["EntityId", "ID đối tượng"], ["Action", "Hành động"], ["ActorUserId", "ID người thực hiện"]].map(([key, label]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}</span>
          <input value={filters[key]} inputMode={key === "ActorUserId" ? "numeric" : undefined} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} className={inputClass} />
        </label>)}
        {[["FromDate", "Từ thời gian"], ["ToDate", "Đến thời gian"]].map(([key, label]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}</span>
          <input type="datetime-local" value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} className={inputClass} />
        </label>)}
        <label><span className="mb-1 block text-sm font-semibold">Số dòng mỗi trang</span>
          <select value={filters.PageSize} onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })} className={inputClass}>
            {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-[#58657a]">Thời gian theo múi giờ thiết bị ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
      {validation && <p role="alert" className="mt-3 text-sm text-red-700">{validation}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className={buttonClass}>Áp dụng</button>
        <button type="button" onClick={() => { setFilters(defaults); setValidation(""); setExpanded(null); setQuery({ ...defaults, PageNumber: 1 }); }} className="rounded-xl border border-[#dfe7f5] px-4 py-2 text-sm font-semibold">Xóa bộ lọc</button>
      </div>
    </form>
    <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <h2 className="font-bold">Danh sách sự kiện{data ? " (" + data.totalCount + ")" : ""}</h2>
      {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải nhật ký...</p>}
      {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
        <p>{error}</p><button type="button" onClick={() => setQuery({ ...query })} className="mt-2 font-semibold underline">Thử lại</button>
      </div>}
      {data && <>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead><tr className="border-b text-xs uppercase text-[#58657a]">
              {["ID", "Thời gian", "Người thực hiện", "Vai trò", "Schema", "Loại đối tượng", "ID đối tượng", "Hành động", "Địa chỉ IP", "Chi tiết"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}
            </tr></thead>
            <tbody>{data.items.map((entry) => <Fragment key={entry.id}>
              <tr className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                <td className="p-3">{entry.id}</td><td className="whitespace-nowrap p-3">{formatDate(entry.occurredAt)}</td>
                <td className="p-3">{entry.actorEmail || "—"}<div className="text-xs text-[#58657a]">ID: {entry.actorUserId ?? "—"}</div></td>
                {[entry.actorRole, entry.entitySchema, entry.entityType, entry.entityId, entry.action, entry.ipAddress].map((value, index) => <td key={index} className="p-3">{value ?? "—"}</td>)}
                <td className="p-3"><button type="button" aria-expanded={expanded === entry.id} aria-controls={"audit-detail-" + entry.id} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="font-semibold text-[#1d5fe5]">{expanded === entry.id ? "Thu gọn" : "Xem chi tiết"}</button></td>
              </tr>
              {expanded === entry.id && <tr id={"audit-detail-" + entry.id}><td colSpan={10} className="bg-[#f8faff] p-4">
                <p className="break-all text-sm"><strong>Request ID:</strong> {entry.requestId || "—"}</p>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  {[["Dữ liệu trước thay đổi", entry.oldValues], ["Dữ liệu sau thay đổi", entry.newValues]].map(([label, value]) => <div key={label}><h3 className="font-semibold">{label}</h3><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[#dfe7f5] bg-white p-3 text-xs">{formatPayload(value)}</pre></div>)}
                </div>
              </td></tr>}
            </Fragment>)}</tbody>
          </table>
          {!data.items.length && <p className="py-8 text-center text-sm text-[#58657a]">Không có nhật ký phù hợp.</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p>{data.totalCount === 0 ? "0 sự kiện" : "Trang " + data.pageNumber + " / " + data.totalPages + " · Tổng " + data.totalCount + " sự kiện"}</p>
          <div className="flex gap-2">
            <button type="button" disabled={!data.hasPreviousPage || query.PageNumber <= 1} onClick={() => changePage(query.PageNumber - 1)} className={buttonClass}>Trang trước</button>
            <button type="button" disabled={!data.hasNextPage} onClick={() => changePage(query.PageNumber + 1)} className={buttonClass}>Trang sau</button>
          </div>
        </div>
      </>}
    </section>
  </div>;
}
