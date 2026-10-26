import {
  Building2,
  MapPin,
  Clock,
  Box,
  Users,
  Eye,
  Edit3,
  Power,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function FacilityTable({
  facilities,
  data,
  query,
  setQuery,
  loading,
  onViewDetails,
  onEdit,
  onStatusChange,
}) {
  return (
    <section className="reference-card reference-table-card">
      <div className="reference-card-heading">
        <div>
          <h2>Facilities Directory</h2>
          <p className="reference-muted">
            Live records from `/api/admin/facilities` with unit distribution and staff allocation.
          </p>
        </div>
        <span className="reference-pill">
          {data ? `${facilities.length} of ${data.totalCount} shown` : "Loading..."}
        </span>
      </div>

      <div className="reference-table-scroll">
        <table className="reference-table">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Facility Name</th>
              <th scope="col">Location</th>
              <th scope="col">Hours</th>
              <th scope="col">Units</th>
              <th scope="col">Staff</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#767679]">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-blue-600" />
                    <span>Loading facilities from server...</span>
                  </div>
                </td>
              </tr>
            ) : facilities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="admin-empty py-4">
                    <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                    <strong className="block text-sm text-[#14121b]">
                      {query.Search || query.Status || query.City
                        ? "No matching facilities found"
                        : "No facilities registered"}
                    </strong>
                    <p className="text-xs text-[#767679] mt-1">
                      {query.Search || query.Status || query.City
                        ? "Try adjusting search terms or clearing status filters."
                        : "Click 'Add Facility' to register the first branch location."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              facilities.map((facility) => {
                const statusKey = String(facility.status || "").toLowerCase();
                return (
                  <tr key={facility.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {facility.code || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="reference-facility-name">
                        <span className="reference-facility-thumb">
                          <Building2 size={18} strokeWidth={1.5} />
                        </span>
                        <div>
                          <strong>{facility.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-[#25232c]">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={12} className="text-slate-400" />
                          {facility.addressLine || "—"}
                        </span>
                        <span className="text-[#767679] block pl-4">
                          {[facility.ward, facility.district, facility.city].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-[#767679]">
                        <Clock size={12} />
                        {facility.openingTime && facility.closingTime
                          ? `${facility.openingTime.slice(0, 5)} - ${facility.closingTime.slice(0, 5)}`
                          : "Standard"}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Box size={12} />
                        {facility.totalUnits ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Users size={12} />
                        {facility.activeStaffCount ?? 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`reference-status ${
                          statusKey === "active"
                            ? "active"
                            : statusKey === "maintenance"
                            ? "maintenance"
                            : "inactive"
                        }`}
                      >
                        {statusKey === "active"
                          ? "Active"
                          : statusKey === "maintenance"
                          ? "Maintenance"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="text-right pr-6">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewDetails(facility.id)}
                          className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                          title="View facility details & stats"
                        >
                          <Eye size={13} /> Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(facility)}
                          className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                          title="Edit facility configuration"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(facility)}
                          className="reference-button-secondary !py-1 !px-2.5 !text-[11px] hover:!text-amber-600 hover:!border-amber-300"
                          title="Update facility operational status"
                        >
                          <Power size={13} /> Status
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="reference-pagination">
          <span>
            {data.totalCount === 0
              ? "0 facilities"
              : `Showing page ${data.pageNumber} of ${Math.max(1, data.totalPages)} (Total ${data.totalCount} facilities)`}
          </span>
          <div className="reference-pagination-buttons">
            <button
              type="button"
              disabled={!data.hasPreviousPage || query.PageNumber <= 1}
              onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })}
              className="reference-button-secondary !py-1 !px-3 !text-xs"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              disabled={!data.hasNextPage}
              onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })}
              className="reference-button-secondary !py-1 !px-3 !text-xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
