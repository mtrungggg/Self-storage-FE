import { useMemo, useState } from "react";
import { createAdminRecord, deleteAdminRecord, listAdminRecords, updateAdminRecord } from "../data/adminCrudRepository";

const configurations = {
  facilities: {
    title: "Quản lý kho", singular: "kho", icon: "warehouse",
    fields: [
      ["code", "Mã kho", "text", true], ["name", "Tên kho", "text", true], ["address", "Địa chỉ", "text", true],
      ["status", "Trạng thái", "select", true, [["active", "Đang hoạt động"], ["maintenance", "Bảo trì"], ["inactive", "Ngừng hoạt động"]]],
    ],
  },
  users: {
    title: "Quản lý manager & staff", singular: "người dùng", icon: "manage_accounts",
    fields: [
      ["fullName", "Họ và tên", "text", true], ["email", "Email", "email", true], ["phone", "Số điện thoại", "tel", false],
      ["role", "Vai trò", "select", true, [["manager", "Manager"], ["staff", "Staff"]]],
      ["facility", "Mã kho phụ trách", "text", true], ["status", "Trạng thái", "select", true, [["active", "Hoạt động"], ["locked", "Đã khóa"]]],
    ],
  },
  tickets: {
    title: "Quản lý ticket", singular: "ticket", icon: "support_agent",
    fields: [
      ["code", "Mã ticket", "text", true], ["subject", "Tiêu đề", "text", true], ["customer", "Khách hàng", "text", true],
      ["facility", "Mã kho", "text", true], ["priority", "Ưu tiên", "select", true, [["low", "Thấp"], ["normal", "Bình thường"], ["high", "Cao"], ["urgent", "Khẩn cấp"]]],
      ["status", "Trạng thái", "select", true, [["open", "Mới mở"], ["in_progress", "Đang xử lý"], ["resolved", "Đã giải quyết"], ["closed", "Đã đóng"]]],
      ["description", "Mô tả", "textarea", false],
    ],
  },
  notifications: {
    title: "Gửi thông báo", singular: "thông báo", icon: "notifications_active", submitLabel: "Gửi thông báo",
    fields: [
      ["title", "Tiêu đề", "text", true], ["message", "Nội dung", "textarea", true],
      ["audience", "Người nhận", "select", true, [["all", "Tất cả"], ["manager", "Manager"], ["staff", "Staff"], ["customer", "Khách hàng"]]],
      ["channel", "Kênh gửi", "select", true, [["in_app", "Trong ứng dụng"], ["email", "Email"], ["both", "Ứng dụng + Email"]]],
    ],
  },
};

const emptyForm = (config) => Object.fromEntries(config.fields.map(([name,,, , options]) => [name, options?.[0]?.[0] || ""]));
const displayValue = (field, value) => field[4]?.find(([key]) => key === value)?.[1] || value || "—";

export default function AdminCrudPage({ resource }) {
  const config = configurations[resource];
  const [records, setRecords] = useState(() => listAdminRecords(resource));
  const [form, setForm] = useState(() => emptyForm(config));
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => records.filter((record) => Object.values(record).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))), [records, query]);
  const reload = () => setRecords(listAdminRecords(resource));

  function submit(event) {
    event.preventDefault();
    if (editingId) updateAdminRecord(resource, editingId, form);
    else createAdminRecord(resource, resource === "notifications" ? { ...form, status: "sent", sentAt: new Date().toISOString() } : form);
    setNotice(editingId ? `Đã cập nhật ${config.singular}.` : resource === "notifications" ? "Đã gửi thông báo." : `Đã thêm ${config.singular}.`);
    setEditingId(null); setForm(emptyForm(config)); reload();
  }

  function edit(record) {
    setEditingId(record.id);
    setForm(Object.fromEntries(config.fields.map(([name]) => [name, record[name] || ""])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(record) {
    if (!window.confirm(`Xóa ${config.singular} này?`)) return;
    deleteAdminRecord(resource, record.id); reload(); setNotice(`Đã xóa ${config.singular}.`);
  }

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold"><span className="material-symbols-outlined text-[#1d5fe5]">{config.icon}</span>{config.title}</h1></div>
      <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d5fe5]">{records.length} bản ghi</div>
    </div>
    {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{editingId ? `Chỉnh sửa ${config.singular}` : resource === "notifications" ? "Soạn thông báo" : `Thêm ${config.singular}`}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm(config)); }} className="text-sm text-[#58657a] underline">Hủy chỉnh sửa</button>}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.fields.map((field) => { const [name, label, type, required, options] = field; return <label key={name} className={type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}><span className="mb-1 block text-sm font-semibold">{label}{required ? " *" : ""}</span>{type === "select" ? <select required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : type === "textarea" ? <textarea rows={3} required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2.5" /> : <input type={type} required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2.5" />}</label>; })}
      </div>
      <button className="mt-4 rounded-xl bg-[#1d5fe5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#174fc7]">{editingId ? "Lưu thay đổi" : config.submitLabel || `Thêm ${config.singular}`}</button>
    </form>
    <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Danh sách {config.singular}</h2><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2 text-sm sm:w-72" /></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-[#58657a]">{config.fields.slice(0, 6).map(([, label]) => <th key={label} className="p-3">{label}</th>)}<th className="p-3 text-right">Thao tác</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">{config.fields.slice(0, 6).map((field) => <td key={field[0]} className="max-w-56 truncate p-3">{displayValue(field, record[field[0]])}</td>)}<td className="p-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => edit(record)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5]">Sửa</button><button type="button" onClick={() => remove(record)} className="rounded-lg bg-red-50 px-3 py-1.5 font-semibold text-red-600">Xóa</button></div></td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#58657a]">Không có dữ liệu.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}
