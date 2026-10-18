import { useEffect, useState } from "react";
import adminLoginHistoryService from "../api/adminLoginHistoryService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";

const defaults = { UserId: "", AttemptedEmail: "", Result: "", IsSuspiciousOnly: false, FromDate: "", ToDate: "", PageSize: 20 };
const results = [["succeeded", "Thành công"], ["failed", "Thất bại"], ["locked", "Bị khóa"], ["blocked", "Bị chặn"]];
const metrics = [["totalAttempts", "Tổng lượt đăng nhập"], ["succeededAttempts", "Thành công"], ["failedAttempts", "Thất bại"], ["lockedAttempts", "Bị khóa"], ["blockedAttempts", "Bị chặn"], ["suspiciousAttemptsCount", "Đáng ngờ"]];
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const dates = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dates.format(date);
}

export default function AdminLoginHistories() {
  const [filters, setFilters] = useState(defaults);
  const [query, setQuery] = useState({ ...defaults, PageNumber: 1 });
  const [response, setResponse] = useState(null);
  const [validation, setValidation] = useState("");
  const loading = response?.query !== query;
  const error = loading ? "" : response?.error;
  const data = loading || error ? null : response?.data;
  const histories = data?.histories;

  useEffect(() => {
    let active = true;
    adminLoginHistoryService.getHistories(query).then(
      (data) => { if (active) setResponse({ query, data }); },
      (err) => { if (active) setResponse({ query, error: err.message || "Không thể tải lịch sử đăng nhập." }); },
    );
    return () => { active = false; };
  }, [query]);

  function apply(event) {
    event.preventDefault();
    setValidation("");
    const next = { ...filters, AttemptedEmail: filters.AttemptedEmail.trim(), UserId: filters.UserId.trim(), PageNumber: 1 };
    if (next.UserId && !isValidPositiveInteger(next.UserId)) { setValidation("ID người dùng phải là số nguyên dương."); return; }
    for (const key of ["FromDate", "ToDate"]) {
      if (!next[key]) continue;
      const date = new Date(next[key]);
      if (Number.isNaN(date.getTime())) { setValidation("Thời gian không hợp lệ."); return; }
      next[key] = date.toISOString();
    }
    if (!isValidDateRange(next.FromDate, next.ToDate)) {
      setValidation("Thời gian kết thúc phải bằng hoặc sau thời gian bắt đầu."); return;
    }
    setQuery(next);
  }

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p><h1 className="mt-1 text-2xl font-bold">Lịch sử đăng nhập</h1></div>
      <button type="button" disabled={loading} onClick={() => setQuery({ ...query })} className={buttonClass}>Làm mới</button>
    </div>
    <form onSubmit={apply} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["UserId", "ID người dùng"], ["AttemptedEmail", "Email đăng nhập"]].map(([key, label]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}</span>
          <input value={filters[key]} inputMode={key === "UserId" ? "numeric" : undefined} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} className={inputClass} />
        </label>)}
        <label><span className="mb-1 block text-sm font-semibold">Kết quả</span>
          <select value={filters.Result} onChange={(e) => setFilters({ ...filters, Result: e.target.value })} className={inputClass}>
            <option value="">Tất cả</option>{results.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Số dòng mỗi trang</span>
          <select value={filters.PageSize} onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })} className={inputClass}>
            {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        {[["FromDate", "Từ thời gian"], ["ToDate", "Đến thời gian"]].map(([key, label]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}</span>
          <input type="datetime-local" value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} className={inputClass} />
        </label>)}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.IsSuspiciousOnly} onChange={(e) => setFilters({ ...filters, IsSuspiciousOnly: e.target.checked })} />Chỉ hiển thị lượt đáng ngờ</label>
      </div>
      <p className="mt-3 text-xs text-[#58657a]">Thời gian theo múi giờ thiết bị ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
      {validation && <p role="alert" className="mt-3 text-sm text-red-700">{validation}</p>}
      <div className="mt-4 flex gap-3"><button type="submit" className={buttonClass}>Áp dụng</button>
        <button type="button" onClick={() => { setFilters(defaults); setValidation(""); setQuery({ ...defaults, PageNumber: 1 }); }} className="rounded-xl border border-[#dfe7f5] px-4 py-2 text-sm">Xóa bộ lọc</button>
      </div>
    </form>
    {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải lịch sử đăng nhập...</p>}
    {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setQuery({ ...query })} className="mt-2 font-semibold underline">Thử lại</button></div>}
    {data && <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{metrics.map(([key, label]) => <div key={key} className="rounded-2xl border border-[#dfe7f5] bg-white p-4">
        <p className="text-sm text-[#58657a]">{label}</p><strong className="mt-2 block text-2xl">{data.summary[key] == null ? "—" : new Intl.NumberFormat("vi-VN").format(data.summary[key])}</strong>
      </div>)}</div>
      <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách lượt đăng nhập ({histories.totalCount})</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm">
          <thead><tr className="border-b text-xs uppercase text-[#58657a]">{["ID", "Thời gian", "ID người dùng", "Email đăng nhập", "Kết quả", "Địa chỉ IP", "Trình duyệt / thiết bị", "Đáng ngờ", "Lý do"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
          <tbody>{histories.items.map((item) => <tr key={item.id} className={"border-b border-[#eef1f8] " + (item.isSuspicious ? "bg-red-50" : "")}>
            <td className="p-3">{item.id}</td><td className="whitespace-nowrap p-3">{formatDate(item.occurredAt)}</td><td className="p-3">{item.userId ?? "—"}</td>
            <td className="p-3">{item.attemptedEmail || "—"}</td><td className="p-3">{results.find(([key]) => key === item.result)?.[1] || item.result || "—"}</td>
            <td className="p-3">{item.ipAddress || "—"}</td><td className="max-w-80 break-words p-3 [overflow-wrap:anywhere]">{item.userAgent || "—"}</td>
            <td className="p-3">{item.isSuspicious ? "Có" : "Không"}</td><td className="p-3">{item.suspiciousReason || "—"}</td>
          </tr>)}</tbody>
        </table>{!histories.items.length && <p className="py-8 text-center text-sm text-[#58657a]">Không có lịch sử đăng nhập phù hợp.</p>}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p>{histories.totalCount === 0 ? "0 lượt đăng nhập" : "Trang " + histories.pageNumber + " / " + histories.totalPages + " · Tổng " + histories.totalCount + " lượt"}</p>
          <div className="flex gap-2"><button type="button" disabled={!histories.hasPreviousPage || query.PageNumber <= 1} onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })} className={buttonClass}>Trang trước</button><button type="button" disabled={!histories.hasNextPage} onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })} className={buttonClass}>Trang sau</button></div>
        </div>
      </section>
    </>}
  </div>;
}
