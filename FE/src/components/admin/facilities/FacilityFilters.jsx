import { Search } from "lucide-react";

export default function FacilityFilters({ filters, setFilters, onSubmit, onReset, statuses }) {
  return (
    <section className="reference-card mb-6 p-4">
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#25232c]">Search</span>
          <div className="reference-search w-full">
            <Search size={16} strokeWidth={1.5} />
            <input
              type="search"
              placeholder="Search code, name, address..."
              value={filters.Search}
              onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#25232c]">Status</span>
          <select
            value={filters.Status}
            onChange={(e) => setFilters({ ...filters, Status: e.target.value })}
            className="reference-select w-full"
          >
            <option value="">All Statuses</option>
            {statuses.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#25232c]">City</span>
          <input
            type="text"
            placeholder="e.g. Ho Chi Minh"
            value={filters.City}
            onChange={(e) => setFilters({ ...filters, City: e.target.value })}
            className="reference-input w-full"
          />
        </label>

        <div className="flex items-center gap-2">
          <button type="submit" className="reference-button-primary flex-1">
            Apply Filters
          </button>
          <button
            type="button"
            onClick={onReset}
            className="reference-button-secondary"
            title="Reset Filters"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
