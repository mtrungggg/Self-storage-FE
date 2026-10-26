import { X } from "lucide-react";

export default function FacilityFormModal({
  isOpen,
  editingFacility,
  formData,
  setFormData,
  submitting,
  onSubmit,
  onClose,
  statuses,
}) {
  if (!isOpen) return null;

  return (
    <section className="reference-card mb-6 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>{editingFacility ? "Edit Facility" : "Add New Facility"}</h2>
          <p className="reference-muted">
            {editingFacility
              ? `Update configuration and operational parameters for ${editingFacility.name}.`
              : "Register a new self-storage branch location into the network."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="reference-pill hover:bg-slate-100 cursor-pointer"
        >
          <X size={14} className="inline mr-1" /> Cancel
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Facility Code <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="reference-input font-mono"
              placeholder="e.g. SGP-01"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Facility Name <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="reference-input"
              placeholder="e.g. Saigon Hub 1"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Address Line <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className="reference-input"
              placeholder="e.g. 123 Nguyen Hue Blvd"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Ward
            </span>
            <input
              type="text"
              value={formData.ward}
              onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              className="reference-input"
              placeholder="e.g. Ben Nghe Ward"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              District
            </span>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="reference-input"
              placeholder="e.g. District 1"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              City <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="reference-input"
              placeholder="e.g. Ho Chi Minh"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Latitude
            </span>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="reference-input font-mono"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Longitude
            </span>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="reference-input font-mono"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Opening Time <span className="text-red-500">*</span>
            </span>
            <input
              type="time"
              step="1"
              required
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Closing Time <span className="text-red-500">*</span>
            </span>
            <input
              type="time"
              step="1"
              required
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Timezone
            </span>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="reference-input"
              placeholder="Asia/Ho_Chi_Minh"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Status <span className="text-red-500">*</span>
            </span>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="reference-select"
            >
              {statuses.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="reference-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="reference-button-primary"
          >
            {submitting ? "Saving..." : editingFacility ? "Save Changes" : "Create Facility"}
          </button>
        </div>
      </form>
    </section>
  );
}
