import { useEffect, useMemo, useState } from "react";
import { createAdminRecord, deleteAdminRecord, listAdminRecords, updateAdminRecord } from "../data/adminCrudRepository";
import facilityService from "../api/facilityService";
import operationsService from "../api/operationsService";

// Backend yêu cầu timezone khi tạo/cập nhật kho nhưng UI quản lý kho không cần hiển thị field này.
const FACILITY_TIMEZONE = "Asia/Ho_Chi_Minh";

function toFacilityPayload(form) {
  return {
    code: form.code,
    name: form.name,
    addressLine: form.address,
    city: form.city,
    status: form.status,
    timezone: FACILITY_TIMEZONE,
  };
}

const configurations = {
  facilities: {
    title: "Quản lý cơ sở kho", singular: "kho", icon: "warehouse", allowDelete: false,
    fields: [
      ["code", "Mã kho", "text", true], ["name", "Tên kho", "text", true], ["address", "Địa chỉ", "text", true],
      ["city", "Thành phố", "text", true],
      ["status", "Trạng thái", "select", true, [["active", "Đang hoạt động"], ["maintenance", "Bảo trì"], ["inactive", "Ngừng hoạt động"]]],
    ],
    api: {
      list: async () => {
        const page = await operationsService.getFacilities({ pageSize: 100 });
        const list = page?.items ?? [];
        return list.map((facility) => ({
          id: facility.id,
          code: facility.code,
          name: facility.name,
          address: facility.addressLine || facility.address,
          city: facility.city,
          status: facility.status || "active",
        }));
      },
      create: (data) => operationsService.createFacility(toFacilityPayload(data)),
      update: (id, data) => operationsService.updateFacilityById(id, toFacilityPayload(data)),
    },
  },
};

const emptyForm = (config) => Object.fromEntries(config.fields.map(([name,,, , options]) => [name, options?.[0]?.[0] || ""]));
const displayValue = (field, value) => field[4]?.find(([key]) => key === value)?.[1] || value || "—";

export default function AdminCrudPage({ resource }) {
  const config = configurations[resource];
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(() => emptyForm(config));
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(config.api));
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => records.filter((record) => Object.values(record).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))), [records, query]);

  async function reload() {
    if (!config.api) {
      setRecords(listAdminRecords(resource));
      return;
    }
    setLoading(true);
    setError("");
    try {
      setRecords(await config.api.list());
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        if (config.api) await config.api.update(editingId, form);
        else updateAdminRecord(resource, editingId, form);
      } else {
        const payload = resource === "notifications" ? { ...form, status: "sent", sentAt: new Date().toISOString() } : form;
        if (config.api) await config.api.create(payload);
        else createAdminRecord(resource, payload);
      }
      setNotice(editingId ? `Đã cập nhật ${config.singular}.` : resource === "notifications" ? "Đã gửi thông báo." : `Đã thêm ${config.singular}.`);
      setEditingId(null); setForm(emptyForm(config));
      await reload();
    } catch (err) {
      setError(err?.message || `Không thể lưu ${config.singular}.`);
    } finally {
      setSubmitting(false);
    }
  }

  function edit(record) {
    setEditingId(record.id);
    setForm(Object.fromEntries(config.fields.map(([name]) => [name, record[name] || ""])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(record) {
    if (!window.confirm(`Xóa ${config.singular} này?`)) return;
    try {
      if (config.api?.remove) await config.api.remove(record.id);
      else deleteAdminRecord(resource, record.id);
      await reload();
      setNotice(`Đã xóa ${config.singular}.`);
    } catch (err) {
      setError(err?.message || `Không thể xóa ${config.singular}.`);
    }
  }

  const allowDelete = config.allowDelete !== false;

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold"><span className="material-symbols-outlined text-[#1d5fe5]">{config.icon}</span>{config.title}</h1></div>
      <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d5fe5]">{records.length} bản ghi</div>
    </div>
    {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{editingId ? `Chỉnh sửa ${config.singular}` : resource === "notifications" ? "Soạn thông báo" : `Thêm ${config.singular}`}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm(config)); }} className="text-sm text-[#58657a] underline">Hủy chỉnh sửa</button>}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.fields.map((field) => { const [name, label, type, required, options] = field; return <label key={name} className={type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}><span className="mb-1 block text-sm font-semibold">{label}{required ? " *" : ""}</span>{type === "select" ? <select required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : type === "textarea" ? <textarea rows={3} required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2.5" /> : <input type={type} required={required} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2.5" />}</label>; })}
      </div>
      <button disabled={submitting} className="mt-4 rounded-xl bg-[#1d5fe5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#174fc7] disabled:opacity-60">{submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : config.submitLabel || `Thêm ${config.singular}`}</button>
    </form>
    <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Danh sách {config.singular}</h2><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2 text-sm sm:w-72" /></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-[#58657a]">{config.fields.slice(0, 6).map(([, label]) => <th key={label} className="p-3">{label}</th>)}<th className="p-3 text-right">Thao tác</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="p-8 text-center text-[#58657a]">Đang tải dữ liệu...</td></tr> : <>{filtered.map((record) => <tr key={record.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">{config.fields.slice(0, 6).map((field) => <td key={field[0]} className="max-w-56 truncate p-3">{displayValue(field, record[field[0]])}</td>)}<td className="p-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => edit(record)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5]">Sửa</button>{allowDelete && <button type="button" onClick={() => remove(record)} className="rounded-lg bg-red-50 px-3 py-1.5 font-semibold text-red-600">Xóa</button>}</div></td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#58657a]">Không có dữ liệu.</td></tr>}</>}</tbody></table></div>
    </section>
  </div>;
}
