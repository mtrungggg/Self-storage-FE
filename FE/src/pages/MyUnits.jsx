import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import rentalService from "../api/rentalService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { BRAND_NAME } from "../constants/brand";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import RentalRenewal from "../components/RentalRenewal";
import MoveOutRequest from "../components/MoveOutRequest";
import UnitTransferRequest from "../components/UnitTransferRequest";
import { CardSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";

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
  const { t, translateStatus, formatDate } = useLanguage();

  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [facilityNameState, setFacilityNameState] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [selectedGalleryUnitId, setSelectedGalleryUnitId] = useState(null);
  const [renewalUnit, setRenewalUnit] = useState(null);
  
  const [handoverData, setHandoverData] = useState(null);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [handoverError, setHandoverError] = useState("");
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const handleOpenHandover = async (unit) => {
    setIsHandoverModalOpen(true);
    setHandoverLoading(true);
    setHandoverError("");
    setHandoverData(null);
    try {
      const data = await rentalService.getHandoverRecord(unit.agreementId);
      setHandoverData(data);
    } catch (err) {
      setHandoverError(err.message || t("common.error", "Error loading record"));
    } finally {
      setHandoverLoading(false);
    }
  };

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
        if (active) setErrorMessage(err.message || t("common.error", "Failed to load rentals"));
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, t]);

  const units = useMemo(() => {
    return activeRentals.map((r) => {
      const isExpiringSoon = r.endDate
        ? Math.ceil((new Date(r.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
        : false;

      return {
        id: String(r.agreementId),
        agreementId: r.agreementId,
        agreementNo: r.agreementNo,
        storageUnitId: r.storageUnitId,
        facilityId: r.facilityId,
        unitCode: r.unitCode,
        unitTypeCode: r.unitTypeCode || "STANDARD",
        facilityName: r.facilityName || BRAND_NAME,
        status: isExpiringSoon ? "renew" : "active",
        statusLabel: isExpiringSoon ? t("status.overdue", "Expiring") : t("status.occupied", "Active"),
        contractDate: `#${r.agreementNo || "AGR-2026"}`,
        contractLeft: r.endDate
          ? `${t("common.due_date", "Expires")}: ${formatDate(r.endDate)}`
          : t("status.active", "Active"),
        endDate: r.endDate,
        rawRental: r,
      };
    });
  }, [activeRentals, t, formatDate]);

  const tabs = useMemo(() => {
    const renewCount = units.filter((u) => u.status === "renew").length;
    return [
      { id: "all", label: `${t("common.all", "All")} (${units.length})` },
      { id: "active", label: `${t("common.active", "Active")} (${units.length})` },
      { id: "renew", label: `${t("my_units.renew", "Renew")} (${renewCount})` },
    ];
  }, [units, t]);

  const filteredUnits = useMemo(() => {
    if (activeTab === "all") return units;
    if (activeTab === "renew") return units.filter((u) => u.status === "renew");
    return units.filter((u) => u.status === "active");
  }, [units, activeTab]);

  const unitSlides = useMemo(() => {
    return filteredUnits.map((u, idx) => ({
      id: String(u.id),
      title: `${t("common.unit", "Unit")} ${u.unitCode}`,
      src: UNIT_CARD_IMAGES[idx % UNIT_CARD_IMAGES.length],
      alt: `${u.unitCode} - ${u.facilityName}`,
      badge: u.unitTypeCode || "UNIT",
      meta: [
        { label: t("common.facility", "Facility"), value: u.facilityName },
        { label: t("common.agreement", "Agreement"), value: u.contractLeft },
      ],
      unitData: u,
    }));
  }, [filteredUnits, t]);

  const activeGalleryUnit = useMemo(() => {
    if (!filteredUnits || filteredUnits.length === 0) return null;
    return filteredUnits.find((u) => String(u.id) === String(selectedGalleryUnitId)) || filteredUnits[0];
  }, [filteredUnits, selectedGalleryUnitId]);

  const handleSelectGalleryUnit = (slide) => {
    setSelectedGalleryUnitId(slide.id);
  };

  const facilityTitle = facilityNameState || activeRentals[0]?.facilityName || BRAND_NAME;

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="my-units" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0b1c30] px-6 py-5 text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8f9cbd]">
              <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">warehouse</span>
              {facilityTitle}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">{t("my_units.title", "My Units")}</h1>
            <p className="mt-0.5 text-xs text-[#b8c6e0]">{t("my_units.subtitle", "Manage active rental contracts and unit access")}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            {t("my_units.rent_btn", "Rent Unit")}
          </button>
        </div>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-zinc-900 dark:text-zinc-100">info</span>
              <span>{t("auth.sign_in", "Sign In")}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: { pathname: "/my-units" } } })}
              className="rounded-lg bg-zinc-900 text-white px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-zinc-800 transition"
            >
              {t("auth.sign_in", "Sign In")}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMessage}
          </div>
        )}

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-zinc-900 dark:text-zinc-100">inventory_2</span>
              <h2 className="text-base font-bold text-[#0b1c30]">{t("my_units.active_contracts", "Active Rentals")}</h2>
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

          {rentalsLoading ? (
            <div className="mt-6">
              <CardSkeleton count={3} />
            </div>
          ) : filteredUnits.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon="warehouse"
              title={t("my_units.empty_contracts", "No active units")}
              description={t("my_units.empty_reservations", "No units found")}
              actionText={t("my_units.rent_btn", "Rent Unit")}
              onAction={() => navigate("/home")}
            />
          ) : (
            <div className="mt-6 space-y-6">
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
                    label={t("my_units.title", "My Units")}
                    onActiveSlideChange={handleSelectGalleryUnit}
                  />
                </div>
              </div>

              {activeGalleryUnit && (
                <div className="rounded-2xl border border-[#dbe6f7] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f0f4fc] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white text-white shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">warehouse</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-black text-[#0b1c30]">
                            {t("common.unit", "Unit")} {activeGalleryUnit.unitCode}
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
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{activeGalleryUnit.contractDate}</span>
                          <span>•</span>
                          <span>{activeGalleryUnit.contractLeft}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/storage-pass?agreementId=${activeGalleryUnit.agreementId}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1c30] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1a2f4d]"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        {t("my_units.storage_pass", "Storage Pass")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setRenewalUnit(activeGalleryUnit)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0]"
                      >
                        <span className="material-symbols-outlined text-[16px]">autorenew</span>
                        {t("my_units.renew", "Renew")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenHandover(activeGalleryUnit)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-100 cursor-pointer"
                        title={t("customer.view_handover", "Biên bản bàn giao")}
                        data-testid="btn-view-handover"
                      >
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        {t("customer.view_handover", "Biên bản bàn giao")}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/support", { state: { agreementId: activeGalleryUnit.agreementId, unitCode: activeGalleryUnit.unitCode } })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-xs transition hover:bg-rose-100 cursor-pointer"
                        title={t("my_units.report_issue", "Report Issue")}
                      >
                        <span className="material-symbols-outlined text-[16px]">report_problem</span>
                        {t("my_units.report_issue", "Report Issue")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8996a9] mb-2">
                      {t("common.actions", "Actions")}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f8faff] border border-[#eef2f9] p-3">
                      <div className="flex-1 min-w-[240px]">
                        <MoveOutRequest agreementId={activeGalleryUnit.agreementId || activeGalleryUnit.id} />
                      </div>
                      <div className="flex-1 min-w-[240px]">
                        <UnitTransferRequest
                          agreementId={activeGalleryUnit.agreementId || activeGalleryUnit.id}
                          facilityId={activeGalleryUnit.facilityId}
                          currentFacilityName={activeGalleryUnit.facilityName}
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

      {renewalUnit && (
        <RentalRenewal
          key={renewalUnit.id}
          unit={renewalUnit}
          onClose={() => setRenewalUnit(null)}
        />
      )}

      
      {isHandoverModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t("customer.handover_modal_title", "Biên bản bàn giao ô kho")}</h3>
                  <p className="text-xs text-slate-500">{t("common.details", "Details")}</p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-handover-top"
                onClick={() => setIsHandoverModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mt-4">
              {handoverLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[28px] text-indigo-600">progress_activity</span>
                  <span>{t("common.loading", "Loading...")}</span>
                </div>
              ) : handoverError ? (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1.5 text-amber-900 dark:text-amber-200">
                    <span className="material-symbols-outlined text-[17px]">info</span>
                    <span>{t("common.notice", "Thông báo")}</span>
                  </div>
                  <p className="leading-relaxed">
                    {t("customer.handover_pending_notice", "Chưa có biên bản bàn giao. Nhân viên tại chi nhánh sẽ kiểm tra hiện trạng và lập biên bản cùng bạn khi bạn đến nhận kho.")}
                  </p>
                </div>
              ) : handoverData ? (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("table.code", "Code")}</span>
                      <span className="font-bold text-slate-800">{handoverData.handoverCode || `#HO-${handoverData.id || "REC"}`}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("common.type", "Type")}</span>
                      <span className="font-semibold text-indigo-600 capitalize">{translateStatus(handoverData.handoverType || "Move-in")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("common.agreement", "Agreement")}</span>
                      <span className="font-semibold text-slate-700">{handoverData.agreementNo || `#AGR-${handoverData.agreementId}`}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("common.unit", "Unit")}</span>
                      <span className="font-bold text-slate-800">{handoverData.unitCode || t("status.assigned", "Assigned")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("common.date", "Date")}</span>
                      <span className="text-slate-700">{handoverData.handoverDate ? formatDate(handoverData.handoverDate) : t("status.completed", "Done")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{t("table.staff", "Staff")}</span>
                      <span className="font-semibold text-slate-700">{handoverData.handledByName || t("table.staff", "Staff")}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-emerald-800">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>{t("common.status", "Status")}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-900">
                      {handoverData.conditionNotes || t("status.passed", "Passed")}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      id="close-handover-modal"
                      onClick={() => setIsHandoverModalOpen(false)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      {t("common.close", "Close")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
