import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHome } from "../hooks/useHome";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { CoverflowCarousel } from "../components/ui/coverflow-carousel";
import { formatVnd } from "../lib/utils";

function Home() {
  const {
    selectedLocation,
    setSelectedLocation,
    selectedType,
    setSelectedType,
    selectedSize,
    setSelectedSize,
    selectedTerm,
    setSelectedTerm,
    searchKeyword,
    setSearchKeyword,
    resetFilters,

    sortBy,
    setSortBy,

    locations,
    storageTypes,
    sizeFilters,
    rentalTerms,
    filteredUnits,

    loading,
    error,

    handleSelectUnit,
  } = useHome();

  const isFiltering =
    selectedLocation !== "all" ||
    selectedType !== "all" ||
    selectedSize !== "all" ||
    Boolean(searchKeyword.trim());

  // Filter out any false-alarm rate limit warnings for users
  const displayError =
    error && !error.toLowerCase().includes("too many requests") && !error.toLowerCase().includes("short period")
      ? error
      : "";

  // Custom dropdown state: 'location' | 'type' | 'size' | null
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".custom-dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const selectedLocationObj = locations.find((l) => l.id === selectedLocation) || locations[0];
  const selectedTypeObj = storageTypes.find((t) => t.id === selectedType) || storageTypes[0];
  const selectedSizeObj = sizeFilters.find((s) => s.id === selectedSize) || sizeFilters[0];

  // Convert filteredUnits into CoverflowSlides
  const slides = useMemo(() => {
    return filteredUnits.map((u) => {
      return {
        src: u.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=640&h=640&fit=crop&q=70&auto=format",
        alt: `Unit ${u.unitCode} - ${u.facilityName}`,
        title: `Unit ${u.unitCode}`,
        subtitle: `${u.facilityName} • ${u.floor || "Floor 1"}`,
        badge: u.typeCode || "",
        meta: [
          { label: "Monthly Rate", value: `${formatVnd(u.rentPrice)}/mo` },
          { label: "Specs", value: `${u.dimension || ""} (${u.areaM2} m²)` },
          { label: "Unit Type", value: u.typeName },
          { label: "Climate", value: u.climateNote || (u.climateControlled ? "Climate Controlled" : "Ambient Dry") },
        ],
        unitData: u,
      };
    });
  }, [filteredUnits]);

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" subtitle="Smart Self Storage" />

      {/* Hero Section & Search Header - Transparent and cohesive */}
      <section className="relative z-30">
        <div className="mx-auto max-w-[1280px] px-4 pt-8 pb-4 lg:px-6">
          <div className="max-w-3xl">
            <h1 className="text-[26px] sm:text-[34px] font-black leading-tight tracking-[-0.03em] text-[#0b1c30]">
              Find &amp; Book Your Storage Unit
            </h1>
          </div>

          {/* Search Box - Modern glassmorphic custom dropdowns */}
          <div className="mt-5 rounded-[22px] border border-[#d8e3f5]/80 bg-white/40 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.03)] backdrop-blur-md sm:p-5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {/* Filter 1: Facility Location */}
              <div className="custom-dropdown-container relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => (prev === "location" ? null : "location"))}
                  className={`group relative flex w-full flex-col items-start rounded-[14px] border p-3 text-left transition ${
                    openDropdown === "location"
                      ? "border-[#1d5fe5] bg-white ring-2 ring-[#1d5fe5]/15 shadow-sm"
                      : "border-[#d8e3f5] bg-white/70 hover:border-[#1d5fe5] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <label className="pointer-events-none mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718299]">
                    <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">location_on</span>
                    Facility Location
                  </label>
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate text-[13px] font-bold text-[#0b1c30]">
                      {selectedLocationObj?.label || "All Locations"}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[18px] text-[#8996a9] transition-transform duration-200 ${
                        openDropdown === "location" ? "rotate-180 text-[#1d5fe5]" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {openDropdown === "location" && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[260px] rounded-[16px] border border-[#d8e3f5] bg-white/95 p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="max-h-[260px] overflow-y-auto space-y-0.5">
                      {locations.map((loc) => {
                        const isSelected = selectedLocation === loc.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(loc.id);
                              setOpenDropdown(null);
                            }}
                            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[12px] font-semibold transition ${
                              isSelected
                                ? "bg-[#1d5fe5] text-white font-bold"
                                : "text-[#0b1c30] hover:bg-[#f0f4fc] hover:text-[#1d5fe5]"
                            }`}
                          >
                            <span className="truncate">{loc.label}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-white">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter 2: Unit Type */}
              <div className="custom-dropdown-container relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => (prev === "type" ? null : "type"))}
                  className={`group relative flex w-full flex-col items-start rounded-[14px] border p-3 text-left transition ${
                    openDropdown === "type"
                      ? "border-[#1d5fe5] bg-white ring-2 ring-[#1d5fe5]/15 shadow-sm"
                      : "border-[#d8e3f5] bg-white/70 hover:border-[#1d5fe5] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <label className="pointer-events-none mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718299]">
                    <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">warehouse</span>
                    Unit Type
                  </label>
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate text-[13px] font-bold text-[#0b1c30]">
                      {selectedTypeObj?.label || "All Unit Types"}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[18px] text-[#8996a9] transition-transform duration-200 ${
                        openDropdown === "type" ? "rotate-180 text-[#1d5fe5]" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {openDropdown === "type" && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[280px] sm:min-w-[360px] rounded-[16px] border border-[#d8e3f5] bg-white/95 p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                      {storageTypes.map((t) => {
                        const isSelected = selectedType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedType(t.id);
                              setOpenDropdown(null);
                            }}
                            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[12px] font-semibold transition ${
                              isSelected
                                ? "bg-[#1d5fe5] text-white font-bold"
                                : "text-[#0b1c30] hover:bg-[#f0f4fc] hover:text-[#1d5fe5]"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`material-symbols-outlined text-[17px] ${
                                  isSelected ? "text-white" : "text-[#1d5fe5]"
                                }`}
                              >
                                {t.icon || "warehouse"}
                              </span>
                              {t.code && t.code !== "ALL" && (
                                <span
                                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {t.code}
                                </span>
                              )}
                              <span className="truncate">{t.label}</span>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-white shrink-0 ml-1">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter 3: Desired Size */}
              <div className="custom-dropdown-container relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => (prev === "size" ? null : "size"))}
                  className={`group relative flex w-full flex-col items-start rounded-[14px] border p-3 text-left transition ${
                    openDropdown === "size"
                      ? "border-[#1d5fe5] bg-white ring-2 ring-[#1d5fe5]/15 shadow-sm"
                      : "border-[#d8e3f5] bg-white/70 hover:border-[#1d5fe5] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <label className="pointer-events-none mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718299]">
                    <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">straighten</span>
                    Desired Size
                  </label>
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate text-[13px] font-bold text-[#0b1c30]">
                      {selectedSizeObj?.label || "All Sizes"}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[18px] text-[#8996a9] transition-transform duration-200 ${
                        openDropdown === "size" ? "rotate-180 text-[#1d5fe5]" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {openDropdown === "size" && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[260px] sm:min-w-[320px] rounded-[16px] border border-[#d8e3f5] bg-white/95 p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                      {sizeFilters.map((s) => {
                        const isSelected = selectedSize === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSize(s.id);
                              setOpenDropdown(null);
                            }}
                            className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[12px] font-semibold transition ${
                              isSelected
                                ? "bg-[#1d5fe5] text-white font-bold"
                                : "text-[#0b1c30] hover:bg-[#f0f4fc] hover:text-[#1d5fe5]"
                            }`}
                          >
                            <div className="flex flex-col truncate">
                              <span className="truncate">{s.label}</span>
                              {s.subtext && (
                                <span
                                  className={`text-[10px] truncate ${
                                    isSelected ? "text-white/80" : "text-[#718299]"
                                  }`}
                                >
                                  {s.subtext}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-white shrink-0 ml-1">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-bar: Search keyword bar & Quick actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8e3f5]/60 pt-3.5">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#1d5fe5]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by unit code, facility name, address..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full rounded-[12px] border border-[#d8e3f5] bg-white/80 py-2 pl-10 pr-4 text-[12px] font-semibold text-[#0b1c30] placeholder-[#8996a9] outline-none transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#1d5fe5]/10"
                  />
                </div>
              </div>

              {isFiltering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 rounded-[10px] border border-[#d8e3f5] bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#b45309] hover:bg-white transition"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Hiển thị 3D Coverflow Carousel thay cho danh sách kho thông thường */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-6">
        {displayError && (
          <div className="mb-6 flex items-center gap-3 rounded-[14px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{displayError}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#dfe7f5] bg-white p-16 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-[36px] text-[#1d5fe5]">progress_activity</span>
            <span className="mt-3 text-[14px] font-bold text-[#0b1c30]">Loading available storage units...</span>
            <span className="mt-1 text-[12px] text-[#8996a9]">Please wait a moment</span>
          </div>
        ) : (
          <>
            {/* Results Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f4] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-[12px] bg-[#0b1c30] px-4 py-2 text-[13px] font-bold text-white shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">view_carousel</span>
                  Available Units
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] text-white">
                    {slides.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-semibold text-[#718299]">Sort by:</span>
                <div className="custom-dropdown-container relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((prev) => (prev === "sort" ? null : "sort"))}
                    className={`group flex items-center justify-between gap-2.5 rounded-[12px] border px-3 py-1.5 text-left transition ${
                      openDropdown === "sort"
                        ? "border-[#1d5fe5] bg-white ring-2 ring-[#1d5fe5]/15 shadow-sm"
                        : "border-[#d8e3f5] bg-white/80 hover:border-[#1d5fe5] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span className="text-[12px] font-bold text-[#0b1c30]">
                      {sortBy === "recommended" && "Best Recommended"}
                      {sortBy === "price-asc" && "Price: Low to High"}
                      {sortBy === "price-desc" && "Price: High to Low"}
                      {sortBy === "size" && "Size: Largest First"}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] text-[#8996a9] transition-transform duration-200 ${
                        openDropdown === "sort" ? "rotate-180 text-[#1d5fe5]" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {openDropdown === "sort" && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-[14px] border border-[#d8e3f5] bg-white/95 p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                      <div className="space-y-0.5">
                        {[
                          { id: "recommended", label: "Best Recommended" },
                          { id: "price-asc", label: "Price: Low to High" },
                          { id: "price-desc", label: "Price: High to Low" },
                          { id: "size", label: "Size: Largest First" },
                        ].map((opt) => {
                          const isSelected = sortBy === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.id);
                                setOpenDropdown(null);
                              }}
                              className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[12px] font-semibold transition ${
                                isSelected
                                  ? "bg-[#1d5fe5] text-white font-bold"
                                  : "text-[#0b1c30] hover:bg-[#f0f4fc] hover:text-[#1d5fe5]"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[14px] text-white">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3D Coverflow Carousel Section */}
            <div className="mt-6">
              {slides.length === 0 ? (
                <div className="rounded-[20px] border border-[#dfe7f5] bg-white p-12 text-center shadow-sm">
                  <span className="material-symbols-outlined text-[48px] text-[#cbd5e1]">inventory_2</span>
                  <h3 className="mt-2 text-[16px] font-bold text-[#0b1c30]">No matching units found</h3>
                  <p className="mt-1 text-[13px] text-[#58657a]">
                    Please try adjusting your location, unit type, or size criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow hover:bg-[#174fc7] transition"
                  >
                    View All Units
                  </button>
                </div>
              ) : (
                <div className="rounded-[24px] border border-[#dfe7f5] bg-gradient-to-b from-white to-[#f8faff] p-2 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">

                  <CoverflowCarousel
                    slides={slides}
                    showCaption={true}
                    showNavigation={true}
                    showPagination={true}
                    cardWidth="clamp(220px, 26vw, 320px)"
                    onSelectSlide={(slide) => {
                      if (slide.unitData) {
                        handleSelectUnit(slide.unitData);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Home;
