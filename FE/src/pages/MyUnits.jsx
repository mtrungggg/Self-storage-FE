import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import rentalService from "../api/rentalService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { BRAND_NAME } from "../constants/brand";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import RentalRenewal from "../components/RentalRenewal";
import MoveOutRequest from "../components/MoveOutRequest";
import UnitTransferRequest from "../components/UnitTransferRequest";

const UNIT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
];

export default function MyUnits() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [facilityNameState, setFacilityNameState] = useState("");

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'renew'
  const [selectedGalleryUnitId, setSelectedGalleryUnitId] = useState(null);
  const [renewalUnit, setRenewalUnit] = useState(null);

  useEffect(() => {
    if (!user) {
      setActiveRentals([]);
      setRentalsLoading(false);
      return;
    }

    let active = true;
    setRentalsLoading(true);
    setErrorMessage("");

    rentalService
      .getMyRentals()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const activeList = list.filter((r) => (r.status || "").toLowerCase() !== "ended");
        setActiveRentals(activeList);
        if (activeList.length > 0 && activeList[0].facilityName) {
          setFacilityNameState(activeList[0].facilityName);
        }
      })
      .catch((err) => {
        if (active) setErrorMessage(err.message || "Không thể tải danh sách kho đang thuê.");
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  // Map rental data to Unit view models
  const units = useMemo(() => {
    return activeRentals.map((r) => {
      const isExpiringSoon = r.endDate
        ? Math.ceil((new Date(r.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
        : false;

      return {
        id: String(r.agreementId),
        agreementId: r.agreementId,
        facilityId: r.facilityId,
        unitCode: r.unitCode,
        unitTypeCode: r.unitTypeCode || "STANDARD",
        facilityName: r.facilityName || BRAND_NAME,
        status: isExpiringSoon ? "renew" : "active",
        statusLabel: isExpiringSoon ? "Sắp hết hạn" : "Đang thuê",
        contractDate: `#${r.agreementNo || "AGR-2026"}`,
        contractLeft: r.endDate
          ? `Thời hạn: ${new Date(r.endDate).toLocaleDateString("vi-VN")}`
          : "Đang hiệu lực",
        endDate: r.endDate,
        rawRental: r,
      };
    });
  }, [activeRentals]);

  const tabs = useMemo(() => {
    const renewCount = units.filter((u) => u.status === "renew").length;
    return [
      { id: "all", label: `Tất cả (${units.length})` },
      { id: "active", label: `Đang hoạt động (${units.length})` },
      { id: "renew", label: `Cần gia hạn (${renewCount})` },
    ];
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (activeTab === "all") return units;
    if (activeTab === "renew") return units.filter((u) => u.status === "renew");
    return units.filter((u) => u.status === "active");
  }, [units, activeTab]);

  const unitSlides = useMemo(() => {
    return filteredUnits.map((u, idx) => ({
      id: String(u.id),
      title: `Kho ${u.unitCode}`,
      src: UNIT_CARD_IMAGES[idx % UNIT_CARD_IMAGES.length],
      alt: `Kho ${u.unitCode} tại ${u.facilityName}`,
      badge: u.unitTypeCode || "KHO",
      meta: [
        { label: "Cơ sở", value: u.facilityName },
        { label: "Hợp đồng", value: u.contractLeft },
      ],
      unitData: u,
    }));
  }, [filteredUnits]);

  const activeGalleryUnit = useMemo(() => {
    if (!filteredUnits || filteredUnits.length === 0) return null;
    return filteredUnits.find((u) => String(u.id) === String(selectedGalleryUnitId)) || filteredUnits[0];
  }, [filteredUnits, selectedGalleryUnitId]);

  const handleSelectGalleryUnit = (slide) => {
    setSelectedGalleryUnitId(slide.id);
  };

  const facilityTitle = facilityNameState || activeRentals[0]?.facilityName || "Hệ thống Self-Storage";

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="my-units" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Banner header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0b1c30] px-6 py-5 text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8f9cbd]">
              <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">warehouse</span>
              {facilityTitle}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Kho của tôi (My Units)</h1>
            <p className="mt-0.5 text-xs text-[#b8c6e0]">
              Quản lý danh sách kho đang thuê, lấy mã PIN &amp; QR mở kho, gia hạn hợp đồng hoặc gửi yêu cầu chuyển đổi kho.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Thuê thêm kho
          </button>
        </div>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">info</span>
              <span>Vui lòng đăng nhập để xem các kho bạn đã thuê và sử dụng tiện ích ra vào kho.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: { pathname: "/my-units" } } })}
              className="rounded-lg bg-[#1d5fe5] px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-[#174fc7] transition"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMessage}
          </div>
        )}

        {/* Units Navigation Tabs */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">inventory_2</span>
              <h2 className="text-base font-bold text-[#0b1c30]">Danh sách kho thuê</h2>
            </div>

            <div className="inline-flex rounded-xl bg-[#f0f4fc] p-1 border border-[#e2eaf8]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-[#0b1c30] text-white shadow-sm"
                      : "text-[#58657a] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit content display */}
          {rentalsLoading ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#dfe7f5] bg-white p-12 text-center text-xs text-[#58657a] shadow-xs">
              <span className="material-symbols-outlined animate-spin text-[32px] text-[#1d5fe5]">progress_activity</span>
              <span>Đang tải thông tin các kho của bạn...</span>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dfe7f5] bg-white p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[32px]">warehouse</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30]">Chưa có kho nào được thuê</h3>
              <p className="mt-1 max-w-[400px] text-xs text-slate-500">
                Bạn hiện chưa có kho lưu trữ nào đang hoạt động. Khám phá các kích thước kho phù hợp với nhu cầu của bạn ngay hôm nay!
              </p>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1d5fe5] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                Tìm &amp; Đặt kho ngay
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Coverflow Gallery */}
              <div className="overflow-hidden rounded-[24px] border border-[#dfe7f5] bg-white px-2 py-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:px-6">
                <div className="mx-auto max-w-5xl">
                  <CoverflowCarousel
                    slides={unitSlides}
                    cardWidth="clamp(220px, 26vw, 320px)"
                    rotate={32}
                    depth={0.46}
                    gap={0.16}
                    fade={0.12}
                    showNavigation={unitSlides.length > 1}
                    showCaption
                    showPagination={unitSlides.length > 3}
                    label="Danh sách kho của bạn"
                    onActiveSlideChange={handleSelectGalleryUnit}
                  />
                </div>
              </div>

              {/* Active Unit Action Console */}
              {activeGalleryUnit && (
                <div className="rounded-2xl border border-[#dbe6f7] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f0f4fc] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1d5fe5] text-white shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">warehouse</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-black text-[#0b1c30]">
                            Kho {activeGalleryUnit.unitCode}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              activeGalleryUnit.status === "renew"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {activeGalleryUnit.statusLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#58657a]">
                          <span>{activeGalleryUnit.facilityName}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1d5fe5]">{activeGalleryUnit.contractDate}</span>
                          <span>•</span>
                          <span>{activeGalleryUnit.contractLeft}</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Fast Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/storage-pass?agreementId=${activeGalleryUnit.agreementId}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1c30] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1a2f4d]"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        Mã mở kho (QR / PIN)
                      </button>

                      <button
                        type="button"
                        onClick={() => setRenewalUnit(activeGalleryUnit)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 py-2 text-xs font-bold text-[#1d5fe5] shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0]"
                      >
                        <span className="material-symbols-outlined text-[16px]">autorenew</span>
                        Gia hạn hợp đồng
                      </button>
                    </div>
                  </div>

                  {/* Secondary Management Options */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8996a9] mb-2">
                      Tùy chọn quản lý hợp đồng
                    </div>
                    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f8faff] border border-[#eef2f9] p-3">
                      <div className="flex-1 min-w-[240px]">
                        <MoveOutRequest agreementId={activeGalleryUnit.agreementId} />
                      </div>
                      <div className="flex-1 min-w-[240px]">
                        <UnitTransferRequest
                          agreementId={activeGalleryUnit.agreementId}
                          facilityId={activeGalleryUnit.facilityId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Renewal Modal */}
      {renewalUnit && (
        <RentalRenewal
          key={renewalUnit.id}
          unit={renewalUnit}
          onClose={() => setRenewalUnit(null)}
        />
      )}

      <Footer />
    </div>
  );
}
