import { Link } from "react-router-dom";
import { useHome } from "../hooks/useHome";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
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

    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,

    locations,
    storageTypes,
    sizeFilters,
    rentalTerms,
    filteredUnits,
    filteredFacilities,

    loading,
    error,

    handleSelectUnit,
  } = useHome();

  const isFiltering =
    selectedLocation !== "all" ||
    selectedType !== "all" ||
    selectedSize !== "all" ||
    selectedTerm !== "month" ||
    Boolean(searchKeyword.trim());

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" subtitle="Kho tự quản thông minh" />

      {/* Hero Section & Search Header */}
      <section className="border-b border-[#e2e8f4] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
          <div className="max-w-3xl">
            <h1 className="mt-3 text-[26px] sm:text-[34px] font-extrabold leading-tight tracking-[-0.03em] text-[#0b1c30]">
              Tìm &amp; Đặt Ô Kho Tự Quản
            </h1>
          </div>

          {/* Search Box (Bước i: Tìm kiếm theo Vị trí, Loại kho, Kích thước, Thời gian thuê) */}
          <div className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-[#fafcff] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Tiêu chí 1: Vị trí */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                  <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">location_on</span>
                  Vị trí kho
                </label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 pl-3.5 pr-8 text-[13px] font-semibold text-[#0b1c30] outline-none transition focus:border-[#1d5fe5] focus:ring-1 focus:ring-[#1d5fe5]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Tiêu chí 2: Loại kho */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                  <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">warehouse</span>
                  Loại kho
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 pl-3.5 pr-8 text-[13px] font-semibold text-[#0b1c30] outline-none transition focus:border-[#1d5fe5] focus:ring-1 focus:ring-[#1d5fe5]"
                  >
                    {storageTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Tiêu chí 3: Kích thước */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                  <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">straighten</span>
                  Kích thước mong muốn
                </label>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 pl-3.5 pr-8 text-[13px] font-semibold text-[#0b1c30] outline-none transition focus:border-[#1d5fe5] focus:ring-1 focus:ring-[#1d5fe5]"
                  >
                    {sizeFilters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Tiêu chí 4: Thời gian thuê */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                  <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">calendar_month</span>
                  Thời gian thuê
                </label>
                <div className="relative">
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 pl-3.5 pr-8 text-[13px] font-semibold text-[#0b1c30] outline-none transition focus:border-[#1d5fe5] focus:ring-1 focus:ring-[#1d5fe5]"
                  >
                    {rentalTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-bar: Search keyword & Quick chips */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f8] pt-3.5">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#8996a9]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo mã kho, tên kho, địa chỉ..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full rounded-[8px] border border-[#dfe7f5] bg-white py-1.5 pl-9 pr-3 text-[12px] outline-none focus:border-[#1d5fe5]"
                  />
                </div>

                <div className="hidden items-center gap-1.5 md:flex">
                  <button
                    type="button"
                    onClick={() => setSelectedType(selectedType === "climate" ? "all" : "climate")}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      selectedType === "climate"
                        ? "bg-[#0b1c30] text-white"
                        : "border border-[#dfe7f5] bg-white text-[#58657a] hover:bg-[#f0f4fc]"
                    }`}
                  >
                    Kho máy lạnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType(selectedType === "driveup" ? "all" : "driveup")}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      selectedType === "driveup"
                        ? "bg-[#0b1c30] text-white"
                        : "border border-[#dfe7f5] bg-white text-[#58657a] hover:bg-[#f0f4fc]"
                    }`}
                  >
                    Kho Drive-up
                  </button>
                </div>
              </div>

              {isFiltering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#b45309] hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Bước ii: Hiển thị danh sách điểm kho và ô kho trống phù hợp kèm thông tin chi tiết) */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-6">
        {error && (
          <div className="mb-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center rounded-[16px] border border-[#dfe7f5] bg-white p-16">
            <span className="material-symbols-outlined animate-spin text-[28px] text-[#1d5fe5]">progress_activity</span>
            <span className="ml-3 text-[13px] font-semibold text-[#58657a]">Đang tải dữ liệu điểm kho...</span>
          </div>
        ) : (
        <>
        {/* Results Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f4] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("units")}
              className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-bold transition ${
                activeTab === "units"
                  ? "bg-[#0b1c30] text-white shadow-sm"
                  : "bg-white text-[#58657a] border border-[#dfe7f5] hover:bg-[#f8faff]"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Ô kho trống phù hợp
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  activeTab === "units" ? "bg-white/20 text-white" : "bg-[#f0f4fc] text-[#1d5fe5]"
                }`}
              >
                {filteredUnits.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("facilities")}
              className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-bold transition ${
                activeTab === "facilities"
                  ? "bg-[#0b1c30] text-white shadow-sm"
                  : "bg-white text-[#58657a] border border-[#dfe7f5] hover:bg-[#f8faff]"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              Điểm kho (Cơ sở)
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  activeTab === "facilities" ? "bg-white/20 text-white" : "bg-[#f0f4fc] text-[#1d5fe5]"
                }`}
              >
                {filteredFacilities.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-[#8996a9]">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
            >
              <option value="recommended">Đề xuất tốt nhất</option>
              <option value="price-asc">Giá thuê: Thấp đến Cao</option>
              <option value="price-desc">Giá thuê: Cao đến Thấp</option>
              <option value="size">Diện tích: Lớn nhất</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Ô kho trống phù hợp (Hiển thị chi tiết: kích thước, giá thuê, phí cọc, chính sách) */}
        {activeTab === "units" && (
          <div className="mt-6">
            {filteredUnits.length === 0 ? (
              <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-12 text-center shadow-sm">
                <span className="material-symbols-outlined text-[48px] text-[#cbd5e1]">inventory_2</span>
                <h3 className="mt-2 text-[16px] font-bold text-[#0b1c30]">Không tìm thấy ô kho phù hợp</h3>
                <p className="mt-1 text-[13px] text-[#58657a]">
                  Vui lòng thử điều chỉnh vị trí, loại kho hoặc kích thước mong muốn.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7]"
                >
                  Xem tất cả ô kho
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredUnits.map((u, index) => (
                  <div
                    key={u.id}
                    className="flex flex-col justify-between overflow-hidden rounded-[16px] border border-[#dfe7f5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.07)]"
                  >
                    <div>
                      {/* Top banner / Image */}
                      <div
                        className="relative h-[150px] w-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${u.image}')` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                        
                        <div className="absolute left-3 top-3 flex items-center gap-1.5">
                          <span className="rounded-md bg-[#0b1c30]/90 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                            {u.unitCode}
                          </span>
                          <span className="rounded-md bg-[#0e7b4c] px-2 py-1 text-[11px] font-bold text-white">
                            Sẵn sàng
                          </span>
                        </div>

                        {u.discountTag && (
                          <div className="absolute right-3 top-3 rounded-md bg-[#fff1e6] px-2 py-0.5 text-[10px] font-bold text-[#b45309] shadow-sm">
                            {u.discountTag}
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-3 text-white">
                          <div className="text-[12px] font-semibold opacity-90">{u.facilityName}</div>
                          <div className="text-[11px] text-white/80">{u.floor}</div>
                        </div>
                      </div>

                      {/* Detail Body */}
                      <div className="p-4">
                        <div className="flex items-center justify-end">
                          <span className="text-[11px] font-semibold text-[#8996a9]">
                            {u.volume} ({u.height})
                          </span>
                        </div>

                        {/* Kích thước */}
                        <div className="mt-2.5">
                          <div className="text-[17px] font-extrabold text-[#0b1c30]">
                            Kho {index + 1}
                          </div>
                        </div>

                        {/* Bảng Giá thuê & Phí cọc */}
                        <div className="mt-4 grid grid-cols-2 gap-2 rounded-[12px] border border-[#eef2f8] bg-[#f8faff] p-2.5">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                              Giá thuê
                            </span>
                            <div className="mt-0.5 flex items-baseline gap-1">
                              <span className="text-[15px] font-black text-[#0b1c30]">{formatVnd(u.rentPrice)}</span>
                              <span className="text-[11px] font-semibold text-[#8996a9]">/tháng</span>
                            </div>
                          </div>
                          <div className="border-l border-[#e2e8f4] pl-2.5">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                              Phí cọc (Hoàn trả)
                            </span>
                            <div className="mt-0.5 flex items-baseline gap-1">
                              <span className="text-[12px] font-bold text-[#0e7b4c]">Tính khi đặt chỗ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Action Button */}
                    <div className="border-t border-[#edf1f8] bg-[#fafcff] p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectUnit(u)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[13px] font-bold text-white shadow-[0_8px_16px_rgba(29,95,229,0.2)] transition hover:bg-[#174fc7]"
                        >
                          <span>Đặt chỗ ngay</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Danh sách Điểm kho (Cơ sở chi nhánh) */}
        {activeTab === "facilities" && (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {filteredFacilities.map((f) => (
              <div
                key={f.id}
                className="overflow-hidden rounded-[16px] border border-[#dfe7f5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition hover:shadow-md"
              >
                <div
                  className="relative h-[160px] w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${f.image}')` }}
                >
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0b1c30]">
                    {f.badge}
                  </span>
                  <span className={`absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold ${f.noteTone}`}>
                    {f.note}
                  </span>
                </div>

                <div className="p-4">
                  <div className="text-[16px] font-bold text-[#0b1c30]">{f.name}</div>
                  <div className="mt-1 text-[12px] text-[#64748b]">{f.address}</div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.perks.map((p, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#e2e8f4] bg-[#f8faff] px-2 py-0.5 text-[10px] font-semibold text-[#58657a]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f0f3f8] pt-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                        Giá khởi điểm
                      </div>
                      <div className="text-[16px] font-extrabold text-[#0b1c30]">
                        {f.fromValue != null ? `${formatVnd(f.fromValue)}/tháng` : "Liên hệ"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation(String(f.id));
                        setActiveTab("units");
                      }}
                      className="flex items-center gap-1.5 rounded-[9px] bg-[#0b1c30] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#132741]"
                    >
                      Xem các ô kho trống
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        </>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Home;
