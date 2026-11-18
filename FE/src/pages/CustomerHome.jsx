import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHome } from "../hooks/useHome";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { CoverflowCarousel } from "../components/ui/coverflow-carousel";
import CustomSelect from "../components/ui/CustomSelect";

export default function CustomerHome() {
  const { lang, formatCurrency } = useLanguage();
  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);

  const {
    selectedLocation,
    setSelectedLocation,
    selectedType,
    setSelectedType,
    searchKeyword,
    setSearchKeyword,
    resetFilters,
    sortBy,
    setSortBy,
    locations,
    storageTypes,
    filteredUnits,
    loading,
    error,
    handleSelectUnit,
  } = useHome();

  const isFiltering =
    selectedLocation !== "all" ||
    selectedType !== "all" ||
    Boolean(searchKeyword.trim());

  // Convert filteredUnits into CoverflowSlides with clean Category & Area badges (no old MINI-DRY/S-DRY)
  const slides = useMemo(() => {
    return filteredUnits.slice(0, 36).map((u) => {
      const rawCategory = u.categoryName || u.typeName || "Kho hàng khô";
      // Strip redundant area suffix like " 3 m2", " 3m2", " 3 m²", " 1m²" from category name
      const cleanCategoryName = rawCategory.replace(/\s*\d+(\.\d+)?\s*(m2|m²)/gi, "").trim() || rawCategory;
      const areaText = `${u.areaM2 || u.area || 3} m²`;
      const cleanDimension = (u.dimension || `${u.length || 2}m × ${u.width || 1.5}m`).replace(/\s*\([^)]*m[2²][^)]*\)/gi, "").trim();

      return {
        src: u.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=640&h=640&fit=crop&q=70&auto=format",
        alt: `Unit ${u.unitCode} - ${u.facilityName}`,
        title: `${label("Ô kho", "Unit")} ${u.unitCode}`,
        subtitle: `${u.facilityName} • ${u.floor || label("Tầng 1", "Floor 1")}`,
        badge: (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-lg border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
              {cleanCategoryName}
            </span>
            <span className="rounded-lg border border-blue-400/40 bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs shadow-xs">
              {areaText}
            </span>
          </div>
        ),
        meta: [
          {
            label: label("Giá thuê/tháng", "Rate / Month"),
            value: `${formatCurrency(u.rentPrice)}/${label("th", "mo")}`,
          },
          {
            label: label("Kích thước", "Specifications"),
            value: cleanDimension,
          },
          {
            label: label("Loại kho", "Category"),
            value: cleanCategoryName,
          },
        ],
        unitData: u,
      };
    });
  }, [filteredUnits, isVi, formatCurrency]);

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" subtitle="Smart Self Storage" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* Hero Title & Subtitle */}
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            {label("Tìm & Đặt thuê ô kho thông minh", "Find & Book Your Storage Unit")}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            {label(
              "Hệ thống kho bảo quản an toàn, kiểm soát nhiệt độ thông minh và mở khóa bằng mã PIN cá nhân 24/7.",
              "Secure self storage with smart preservation control and 24/7 keyless personal PIN access."
            )}
          </p>
        </div>

        {/* Unified Search + Filter Bar (Zero Gap to Carousel) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* 1. Search Box (lg:col-span-4) */}
            <div className="lg:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                search
              </span>
              <input
                id="search-units-input"
                name="searchUnits"
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={label("Tìm theo mã kho (A-101), cơ sở...", "Search units (A-101), facility...")}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-zinc-900 focus:bg-white transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* 2. Facility Location (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full text-xs"
              >
                <option value="all">{label("Tất cả cơ sở kho", "All Facilities")}</option>
                {locations
                  .filter((l) => l.id !== "all")
                  .map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name || loc.label}
                    </option>
                  ))}
              </CustomSelect>
            </div>

            {/* 3. Category / Storage Type (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs"
              >
                <option value="all">{label("Tất cả loại kho", "All Categories")}</option>
                {storageTypes
                  .filter((st) => st.id !== "all")
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {isVi ? st.desc || st.label : st.label}
                    </option>
                  ))}
              </CustomSelect>
            </div>

            {/* 4. Sort By (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <CustomSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs"
              >
                <option value="recommended">{label("Đề xuất tốt nhất", "Recommended")}</option>
                <option value="price-asc">{label("Giá: Thấp đến cao", "Price: Low to High")}</option>
                <option value="price-desc">{label("Giá: Cao đến thấp", "Price: High to Low")}</option>
                <option value="size">{label("Diện tích: Lớn nhất", "Size: Largest")}</option>
              </CustomSelect>
            </div>
          </div>

          {/* Active Filters row */}
          {isFiltering && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
              <span className="text-slate-500">
                {label("Đang áp dụng bộ lọc tùy chỉnh", "Custom filters active")}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>{label("Đặt lại bộ lọc", "Reset Filters")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Carousel & Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-14 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="material-symbols-outlined animate-spin text-[32px] text-zinc-900 dark:text-zinc-100">
              progress_activity
            </span>
            <span className="mt-3 text-xs font-bold text-slate-800 dark:text-zinc-200">
              {label("Đang tải danh sách kho khả dụng...", "Loading available storage units...")}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Pill Count */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900">
                <span className="material-symbols-outlined text-[16px]">view_carousel</span>
                <span>{label("Kho khả dụng", "Available Units")}</span>
                <span className="rounded-full bg-white/20 dark:bg-zinc-800 px-2 py-0.5 text-[11px]">
                  {slides.length}
                </span>
              </div>
            </div>

            {/* 3D Coverflow Carousel Section */}
            {slides.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <span className="material-symbols-outlined text-[44px] text-slate-300 dark:text-zinc-600">
                  inventory_2
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {label("Không tìm thấy ô kho phù hợp", "No matching units found")}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  {label(
                    "Vui lòng thử chọn cơ sở khác hoặc điều chỉnh từ khóa tìm kiếm.",
                    "Please try adjusting your facility, category, or search keywords."
                  )}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {label("Xem tất cả ô kho", "View All Units")}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-2 sm:p-6 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                <CoverflowCarousel
                  slides={slides}
                  bookNowText={label("Đặt thuê ô kho này", "Book this unit now")}
                  showCaption
                  showCaptionDetails={false}
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
        )}
      </main>

      <Footer />
    </div>
  );
}
