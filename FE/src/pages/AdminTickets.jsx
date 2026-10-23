import { useEffect, useState } from "react";
import staffSupportService from "../api/staffSupportService";
import facilityService from "../api/facilityService";

const statusOptions = [
  ["open", "Mới mở"],
  ["in_progress", "Đang xử lý"],
  ["waiting_for_customer", "Chờ khách hàng"],
  ["resolved", "Đã giải quyết"],
  ["closed", "Đã đóng"],
];
const priorityLabels = { low: "Thấp", normal: "Bình thường", high: "Cao", urgent: "Khẩn cấp" };
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const labelFor = (value) => statusOptions.find(([key]) => key === value)?.[1] || value || "—";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

export default function AdminTickets() {
  const [facilities, setFacilities] = useState([]);
  const [filters, setFilters] = useState({ facilityId: "", status: "" });
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    facilityService.getFacilities().then(setFacilities).catch(() => setFacilities([]));
  }, []);

  function reload() {
    setLoading(true);
    setError("");
    staffSupportService.getTickets(filters).then(
      (data) => { setTickets(data); setLoading(false); },
      (err) => { setError(err.message || "Không thể tải danh sách ticket."); setLoading(false); },
    );
  }

  useEffect(reload, [filters.facilityId, filters.status]);

  async function handleAssign(ticket) {
    setBusyId(ticket.id);
    setNotice("");
    try {
      await staffSupportService.assignTicket(ticket.id);
      setNotice(`Đã nhận xử lý ticket ${ticket.ticketNo}.`);
      reload();
    } catch (err) {
      setError(err.message || "Không thể nhận xử lý ticket.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleResolve(ticket) {
    const resolution = window.prompt(`Nhập nội dung giải quyết cho ticket ${ticket.ticketNo}:`);
    if (!resolution?.trim()) return;
    setBusyId(ticket.id);
    setNotice("");
    try {
      await staffSupportService.resolveTicket(ticket.id, { resolution: resolution.trim() });
      setNotice(`Đã đánh dấu ticket ${ticket.ticketNo} là đã giải quyết.`);
      reload();
    } catch (err) {
      setError(err.message || "Không thể giải quyết ticket.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">support_agent</span>
            Quản lý ticket hỗ trợ
          </h1>
        </div>
        <button type="button" disabled={loading} onClick={reload} className={buttonClass}>Làm mới</button>
      </div>

      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}

      <div className="mt-5 flex flex-wrap gap-4 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <label className="min-w-48"><span className="mb-1 block text-sm font-semibold">Kho</span>
          <select value={filters.facilityId} onChange={(e) => setFilters({ ...filters, facilityId: e.target.value })} className={inputClass}>
            <option value="">Tất cả các kho</option>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
          </select>
        </label>
        <label className="min-w-48"><span className="mb-1 block text-sm font-semibold">Trạng thái</span>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}>
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>
      </div>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách ticket{tickets ? ` (${tickets.length})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải danh sách...</p>}
        {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p><button type="button" onClick={reload} className="mt-2 font-semibold underline">Thử lại</button>
        </div>}
        {tickets && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Mã ticket", "Kho", "Khách hàng", "Danh mục", "Ưu tiên", "Tiêu đề", "Trạng thái", "Cập nhật", "Thao tác"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{ticket.ticketNo}</td>
                    <td className="p-3">{ticket.facilityCode}</td>
                    <td className="p-3">{ticket.customerName}</td>
                    <td className="p-3">{ticket.category}</td>
                    <td className="p-3">{priorityLabels[ticket.priority] || ticket.priority}</td>
                    <td className="max-w-64 truncate p-3" title={ticket.description}>{ticket.subject}</td>
                    <td className="p-3">{labelFor(ticket.status)}</td>
                    <td className="whitespace-nowrap p-3">{formatDate(ticket.updatedAt)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={busyId === ticket.id} onClick={() => handleAssign(ticket)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5] disabled:opacity-50">Nhận xử lý</button>
                        {ticket.status !== "resolved" && ticket.status !== "closed" && (
                          <button type="button" disabled={busyId === ticket.id} onClick={() => handleResolve(ticket)} className="rounded-lg bg-green-50 px-3 py-1.5 font-semibold text-green-700 disabled:opacity-50">Giải quyết</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-[#58657a]">Không có ticket phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
