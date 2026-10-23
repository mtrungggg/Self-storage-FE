import { useEffect, useState } from "react";
import adminOperationsService from "../api/adminOperationsService";

const statusOptions = [
  ["active", "Đang hoạt động"],
  ["maintenance", "Bảo trì"],
  ["inactive", "Ngừng hoạt động"],
];

const emptyForm = {
  code: "",
  name: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  timezone: "Asia/Ho_Chi_Minh",
  openingTime: "07:00",
  closingTime: "21:00",
  status: "active",
};

const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const labelFor = (value) => statusOptions.find(([key]) => key === value)?.[1] || value || "—";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

function toRequestPayload(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    addressLine: form.addressLine.trim(),
    ward: form.ward.trim() || null,
    district: form.district.trim() || null,
    city: form.city.trim(),
    latitude: null,
    longitude: null,
    timezone: form.timezone.trim() || "Asia/Ho_Chi_Minh",
    openingTime: form.openingTime || null,
    closingTime: form.closingTime || null,
    status: form.status,
  };
}

export default function AdminFacilities() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  function reload() {
    setLoading(true);
    setError("");
    adminOperationsService.getFacilities({ PageSize: 100 }).then(
      (data) => { setItems(data.items); setLoading(false); },
      (err) => { setError(err.message || "Không thể tải danh sách kho."); setLoading(false); },
    );
  }

  useEffect(reload, []);

  function startEdit(facility) {
    setEditingId(facility.id);
    setForm({
      code: facility.code || "",
      name: facility.name || "",
      addressLine: facility.addressLine || "",
      ward: facility.ward || "",
      district: facility.district || "",
      city: facility.city || "",
      timezone: facility.timezone || "Asia/Ho_Chi_Minh",
      openingTime: facility.openingTime?.slice(0, 5) || "",
      closingTime: facility.closingTime?.slice(0, 5) || "",
      status: facility.status || "active",
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = toRequestPayload(form);
      if (editingId) {
        await adminOperationsService.updateFacility(editingId, payload);
        setNotice("Đã cập nhật thông tin kho.");
      } else {
        await adminOperationsService.createFacility(payload);
        setNotice("Đã thêm kho mới.");
      }
      cancelEdit();
      reload();
    } catch (err) {
      setFormError(err.message || "Không thể lưu thông tin kho.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = (items || []).filter((facility) =>
    [facility.code, facility.name, facility.city, facility.addressLine]
      .some((value) => value?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">warehouse</span>
            Quản lý kho
          </h1>
        </div>
        <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d5fe5]">
          {items ? `${items.length} kho` : "—"}
        </div>
      </div>

      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}

      <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">{editingId ? "Chỉnh sửa kho" : "Thêm kho mới"}</h2>
          {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-[#58657a] underline">Hủy chỉnh sửa</button>}
        </div>
        {formError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label><span className="mb-1 block text-sm font-semibold">Mã kho *</span>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} />
          </label>
          <label className="md:col-span-2"><span className="mb-1 block text-sm font-semibold">Tên kho *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </label>
          <label className="md:col-span-2"><span className="mb-1 block text-sm font-semibold">Địa chỉ *</span>
            <input required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Thành phố *</span>
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Quận/Huyện</span>
            <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Phường/Xã</span>
            <input value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giờ mở cửa</span>
            <input type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giờ đóng cửa</span>
            <input type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Trạng thái *</span>
            <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {statusOptions.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        </div>
        <button disabled={saving} className={`mt-4 ${buttonClass}`}>
          {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm kho"}
        </button>
      </form>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Danh sách kho</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2 text-sm sm:w-72" />
        </div>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải danh sách...</p>}
        {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p><button type="button" onClick={reload} className="mt-2 font-semibold underline">Thử lại</button>
        </div>}
        {items && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Mã kho", "Tên kho", "Địa chỉ", "Thành phố", "Giờ hoạt động", "Trạng thái", "Cập nhật", "Thao tác"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((facility) => (
                  <tr key={facility.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{facility.code}</td>
                    <td className="p-3">{facility.name}</td>
                    <td className="max-w-56 truncate p-3">{facility.addressLine}</td>
                    <td className="p-3">{facility.city}</td>
                    <td className="p-3">{facility.openingTime?.slice(0, 5) || "—"} - {facility.closingTime?.slice(0, 5) || "—"}</td>
                    <td className="p-3">{labelFor(facility.status)}</td>
                    <td className="whitespace-nowrap p-3">{formatDate(facility.updatedAt)}</td>
                    <td className="p-3 text-right">
                      <button type="button" onClick={() => startEdit(facility)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5]">Sửa</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-[#58657a]">Không có dữ liệu.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
