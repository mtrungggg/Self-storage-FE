import { useEffect, useMemo, useState } from "react";
import { Building2, Search, RefreshCw, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
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
    title: "Quản lý cơ sở kho",
    singular: "cơ sở kho",
    allowDelete: false,
    fields: [
      ["code", "Mã kho", "text", true],
      ["name", "Tên kho", "text", true],
      ["address", "Địa chỉ", "text", true],
      ["city", "Thành phố", "text", true],
      [
        "status",
        "Trạng thái",
        "select",
        true,
        [
          ["active", "Đang hoạt động"],
          ["maintenance", "Bảo trì"],
          ["inactive", "Ngừng hoạt động"],
        ],
      ],
    ],
    api: {
      list: async () => {
        try {
          const res = await facilityService.getFacilities();
          const list = Array.isArray(res) ? res : res?.items ?? [];
          return list.map((facility) => ({
            id: facility.id,
            code: facility.code,
            name: facility.name,
            address: facility.address || facility.addressLine,
            city: facility.city,
            status: facility.status || "active",
          }));
        } catch {
          const page = await operationsService.getFacilities({ pageSize: 100 });
          const list = Array.isArray(page) ? page : page?.items ?? [];
          return list.map((facility) => ({
            id: facility.id,
            code: facility.code,
            name: facility.name,
            address: facility.addressLine || facility.address,
            city: facility.city,
            status: facility.status || "active",
          }));
        }
      },
      create: (data) => operationsService.createFacility(toFacilityPayload(data)),
      update: (id, data) => operationsService.updateFacilityById(id, toFacilityPayload(data)),
    },
  },
};

const emptyForm = (config) =>
  Object.fromEntries(config.fields.map(([name, , , , options]) => [name, options?.[0]?.[0] || ""]));
const displayValue = (field, value) =>
  field[4]?.find(([key]) => key === value)?.[1] || value || "—";

export default function AdminCrudPage({ resource = "facilities" }) {
  const config = configurations[resource] || configurations.facilities;
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(() => emptyForm(config));
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(config.api));
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () =>
      records.filter((record) =>
        Object.values(record).some((value) =>
          String(value || "").toLowerCase().includes(query.toLowerCase())
        )
      ),
    [records, query]
  );

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
      setError(err?.message || "Không thể tải dữ liệu cơ sở kho từ máy chủ.");
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
        if (config.api) await config.api.create(form);
        else createAdminRecord(resource, form);
      }
      setNotice(editingId ? `Đã cập nhật ${config.singular} thành công.` : `Đã thêm ${config.singular} mới.`);
      setTimeout(() => setNotice(""), 4000);
      setEditingId(null);
      setForm(emptyForm(config));
      setIsFormOpen(false);
      await reload();
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (err) {
      setError(err?.message || `Không thể lưu ${config.singular}.`);
    } finally {
      setSubmitting(false);
    }
  }

  function edit(record) {
    setEditingId(record.id);
    setForm(Object.fromEntries(config.fields.map(([name]) => [name, record[name] || ""])));
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(record) {
    if (!window.confirm(`Xóa ${config.singular} này?`)) return;
    try {
      if (config.api?.remove) await config.api.remove(record.id);
      else deleteAdminRecord(resource, record.id);
      await reload();
      setNotice(`Đã xóa ${config.singular}.`);
      setTimeout(() => setNotice(""), 4000);
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (err) {
      setError(err?.message || `Không thể xóa ${config.singular}.`);
    }
  }

  const allowDelete = config.allowDelete !== false;

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar matching AdminDashboard */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>{config.title}</h1>
            <span className="reference-pill">{records.length} cơ sở</span>
          </div>
          <p className="reference-muted mt-1">
            Quản lý thông tin và trạng thái vận hành của các cơ sở lưu trữ toàn hệ thống.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <label className="reference-search">
            <Search size={18} strokeWidth={1.5} />
            <input
              type="search"
              aria-label="Tìm cơ sở kho"
              placeholder="Tìm kiếm mã, tên kho, thành phố..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (isFormOpen && !editingId) {
                setIsFormOpen(false);
              } else {
                setEditingId(null);
                setForm(emptyForm(config));
                setIsFormOpen(true);
              }
            }}
            className="reference-button-primary"
          >
            {isFormOpen && !editingId ? (
              <>
                <X size={15} /> Đóng form
              </>
            ) : (
              <>
                <Plus size={15} /> Thêm cơ sở kho
              </>
            )}
          </button>
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={reload}
            aria-label="Làm mới dữ liệu"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]">
          <CheckCircle2 size={18} className="text-[#23866a]" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Thông báo lỗi</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Form collapsible for Adding/Editing Facility */}
      {isFormOpen && (
        <section className="reference-card mb-6 p-6">
          <div className="reference-card-heading mb-4">
            <div>
              <h2>{editingId ? "Chỉnh sửa cơ sở kho" : "Thêm cơ sở kho mới"}</h2>
              <p className="reference-muted">
                {editingId
                  ? "Cập nhật thông tin chi tiết cho cơ sở kho đã chọn."
                  : "Nhập thông tin cơ bản để khởi tạo một cơ sở kho mới trên hệ thống."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
                setForm(emptyForm(config));
              }}
              className="reference-pill hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {config.fields.map((field) => {
                const [name, label, type, required, options] = field;
                return (
                  <label key={name} className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                      {label}
                      {required && <span className="text-red-500"> *</span>}
                    </span>
                    {type === "select" ? (
                      <select
                        required={required}
                        value={form[name]}
                        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                        className="reference-select"
                      >
                        {options.map(([value, text]) => (
                          <option key={value} value={value}>
                            {text}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        required={required}
                        value={form[name]}
                        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                        className="reference-input"
                        placeholder={`Nhập ${label.toLowerCase()}...`}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setForm(emptyForm(config));
                }}
                className="reference-button-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="reference-button-primary"
              >
                {submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo cơ sở kho"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Facilities Table Card */}
      <section className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Danh sách cơ sở kho</h2>
            <p className="reference-muted">Danh sách tất cả cơ sở kho và trạng thái hoạt động thực tế.</p>
          </div>
          <span className="reference-pill">
            {filtered.length} / {records.length} cơ sở
          </span>
        </div>

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">Mã kho</th>
                <th scope="col">Tên cơ sở kho</th>
                <th scope="col">Địa chỉ</th>
                <th scope="col">Thành phố</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" className="text-right pr-6">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#767679]">
                    Đang tải danh sách cơ sở kho...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">
                        {query ? "Không tìm thấy cơ sở kho phù hợp" : "Chưa có cơ sở kho nào"}
                      </strong>
                      <p className="text-xs text-[#767679] mt-1">
                        {query ? "Hãy thử tìm bằng từ khóa khác." : "Bấm nút 'Thêm cơ sở kho' để tạo điểm kho đầu tiên."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {record.code || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="reference-facility-name">
                        <span className="reference-facility-thumb">
                          <Building2 size={18} strokeWidth={1.5} />
                        </span>
                        <div>
                          <strong>{record.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[280px] truncate" title={record.address}>
                      {record.address || "—"}
                    </td>
                    <td>{record.city || "—"}</td>
                    <td>
                      <span className={`reference-status ${String(record.status).toLowerCase()}`}>
                        {displayValue(config.fields[4], record.status)}
                      </span>
                    </td>
                    <td className="text-right pr-6">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => edit(record)}
                          className="reference-button-secondary !py-1 !px-3 !text-[11px]"
                          title="Chỉnh sửa cơ sở này"
                        >
                          <Edit3 size={13} /> Sửa
                        </button>
                        {allowDelete && (
                          <button
                            type="button"
                            onClick={() => remove(record)}
                            className="reference-button-danger"
                            title="Xóa cơ sở"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="reference-table-footer">
          <span>Hiển thị {filtered.length} cơ sở kho</span>
          <span className="font-medium text-[#25232c]">Hệ thống Self-Storage Operations</span>
        </div>
      </section>
    </div>
  );
}
