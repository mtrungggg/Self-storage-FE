import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import rentalService from "../api/customerRentalService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { BRAND_NAME } from "../constants/brand";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import RentalRenewal from "../components/RentalRenewal";
import MoveOutRequest from "../components/MoveOutRequest";
import PendingRefundBankInfo from "../components/PendingRefundBankInfo";
import UnitTransferRequest from "../components/UnitTransferRequest";
import UnitInformation from "../components/UnitInformation";
import { CardSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import HandoverReportModal from "../components/HandoverReportModal";

const UNIT_CARD_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6vQvGRB6gtHfaCHV6HGkSMY2MX6yms6f0fIWviNxwV-VPGg3qifeMjHvx&s=10",
  "https://hips.hearstapps.com/hmg-prod/images/self-storage-facility-interior-with-tools-royalty-free-image-1727987323.jpg?crop=0.671xw:1.00xh;0.325xw,0&resize=1200:*",
  "https://cdn-zero-one.storagekingusa.com/media/44f1a0b5-ad57-4a4c-b8af-06ebd9c6d8c9.webp",
  "https://spacevalet.in/wp-content/uploads/2024/07/SpaceValet_Sewri_0042-6-scaled.webp",
  "https://spacehubstore.com/assets/static/articles/v4/head/background-desktop.png",
  "https://www.aa-ministorage.com/wp-content/uploads/2019/09/AA-139.jpg",
];

export default function CustomerMyUnits() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, translateStatus, formatDate, formatCurrency } = useLanguage();

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
  const handoverRequest = useRef(0);

  const handleCloseHandover = () => {
    handoverRequest.current += 1;
    setIsHandoverModalOpen(false);
  };

  const handleOpenHandover = async (unit) => {
    const requestId = ++handoverRequest.current;
    setIsHandoverModalOpen(true);
    setHandoverLoading(true);
    setHandoverError("");
    setHandoverData(null);
    try {
      const data = await rentalService.getHandoverRecord(unit.agreementId);
      if (requestId === handoverRequest.current) setHandoverData(data);
    } catch (err) {
      if (requestId === handoverRequest.current) {
        setHandoverError(err.status === 404
          ? t("customer.handover_pending_notice", "Chưa có biên bản được ghi nhận. Nhân viên tại cơ sở sẽ lập biên bản sau khi kiểm tra và bàn giao thực tế.")
          : err.message || t("common.error", "Error loading record"));
      }
    } finally {
      if (requestId === handoverRequest.current) setHandoverLoading(false);
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
      const rawStatus = (r.status || "").toLowerCase();
      const isTerminated = rawStatus === "terminated" || rawStatus === "completed" || rawStatus === "ended";
      const isMoveOut = rawStatus === "move_out_scheduled" || rawStatus === "checkout_pending";
      const isOverdue = !isTerminated && !isMoveOut && (rawStatus === "overdue" || rawStatus === "defaulted" || Boolean(r.hasOverdueDebt));
      const isExpiringSoon = !isTerminated && !isMoveOut && !isOverdue && r.endDate
        ? Math.ceil((new Date(r.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
        : false;

      let status = "active";
      let statusLabel = t("status.occupied", "Đang thuê");

      if (isTerminated) {
        status = "terminated";
        statusLabel = t("status.terminated", "Đã trả kho");
      } else if (isMoveOut) {
        status = "move_out";
        statusLabel = t("status.move_out", "Đang trả kho");
      } else if (isOverdue) {
        status = "overdue";
        statusLabel = t("status.overdue_locked", "Quá hạn / Đã khóa PIN");
      } else if (isExpiringSoon) {
        status = "renew";
        statusLabel = t("my_units.expiring_soon", "Sắp hết hạn");
      }

      const displayUnitCode = r.unitCode || (r.agreementNo ? `#${r.agreementNo}` : "");

      return {
        id: String(r.agreementId),
        agreementId: r.agreementId,
        agreementNo: r.agreementNo,
        storageUnitId: r.storageUnitId,
        facilityId: r.facilityId,
        unitCode: displayUnitCode,
        unitTypeCode: r.unitTypeCode || "STANDARD",
        facilityName: r.facilityName || BRAND_NAME,
        status,
        statusLabel,
        contractDate: `#${r.agreementNo || "AGR-2026"}`,
        contractLeft: isTerminated
          ? t("status.terminated", "Đã thanh lý & trả kho")
          : r.endDate
          ? `${t("common.due_date", "Hạn thanh toán")}: ${formatDate(r.endDate)}`
          : t("status.active", "Hoạt động"),
        endDate: r.endDate,
        rawRental: r,
        penaltyInvoiceId: r.penaltyInvoiceId,
        penaltyInvoiceNo: r.penaltyInvoiceNo,
        penaltyAmount: Number(r.penaltyAmount || 0),
        latestInspectionSummary: r.latestInspectionSummary,
        rawStatus,
      };
    });
  }, [activeRentals, t, formatDate]);

  const tabs = useMemo(() => {
    const activeCount = units.filter((u) => u.status === "active" || u.status === "renew" || u.status === "overdue").length;
    const renewCount = units.filter((u) => u.status === "renew" || u.status === "overdue").length;
    const endedCount = units.filter((u) => u.status === "terminated" || u.status === "move_out").length;

    const list = [
      { id: "all", label: `${t("common.all", "Tất cả")} (${units.length})` },
      { id: "active", label: `${t("common.active", "Đang thuê")} (${activeCount})` },
    ];

    if (renewCount > 0) {
      list.push({ id: "renew", label: `${t("my_units.renew", "Gia hạn hợp đồng")} (${renewCount})` });
    }

    if (endedCount > 0) {
      list.push({ id: "ended", label: `${t("status.terminated", "Đã trả kho")} (${endedCount})` });
    }

    return list;
  }, [units, t]);

  const filteredUnits = useMemo(() => {
    if (activeTab === "all") return units;
    if (activeTab === "renew") return units.filter((u) => u.status === "renew" || u.status === "overdue");
    if (activeTab === "ended") return units.filter((u) => u.status === "terminated" || u.status === "move_out");
    return units.filter((u) => u.status === "active" || u.status === "renew" || u.status === "overdue");
  }, [units, activeTab]);

  const unitSlides = useMemo(() => {
    return filteredUnits.map((u, idx) => {
      let statusBg = "bg-emerald-600/90 border-emerald-400/40 text-white";
      let statusDot = "bg-emerald-300";
      if (u.status === "renew") {
        statusBg = "bg-amber-600/90 border-amber-400/40 text-white";
        statusDot = "bg-amber-300 animate-pulse";
      } else if (u.status === "move_out") {
        statusBg = "bg-blue-600/90 border-blue-400/40 text-white";
        statusDot = "bg-blue-300";
      } else if (u.status === "terminated") {
        statusBg = "bg-slate-700/90 border-slate-500/40 text-white";
        statusDot = "bg-slate-400";
      }

      const statusBadge = (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md border ${statusBg}`}>
          <span className={`h-2 w-2 rounded-full ${statusDot}`} />
          {u.statusLabel}
        </span>
      );

      return {
        id: String(u.id),
        title: u.unitCode?.startsWith("#") ? u.unitCode : `${t("common.unit", "Ô kho")} ${u.unitCode}`,
        src: u.imageUrl || u.image || UNIT_CARD_IMAGES[idx % UNIT_CARD_IMAGES.length],
        alt: `${u.unitCode} - ${u.facilityName}`,
        badge: u.unitTypeCode || "STANDARD",
        statusBadge,
        meta: [
          { label: t("common.facility", "Facility"), value: u.facilityName },
          { label: t("common.agreement", "Agreement"), value: u.contractLeft },
        ],
        unitData: u,
      };
    });
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

        {user && (
          <div className="mt-4">
            <PendingRefundBankInfo />
          </div>
        )}

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
                    showCaption={unitSlides.length > 1}
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
                              activeGalleryUnit.status === "overdue"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : activeGalleryUnit.status === "renew"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : activeGalleryUnit.status === "terminated"
                                ? "bg-slate-100 text-slate-700 border border-slate-300"
                                : activeGalleryUnit.status === "move_out"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
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

                      {activeGalleryUnit.status !== "terminated" &&
                        activeGalleryUnit.status !== "move_out" &&
                        activeGalleryUnit.endDate &&
                        Math.ceil((new Date(activeGalleryUnit.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 && (
                        <button
                          type="button"
                          onClick={() => setRenewalUnit(activeGalleryUnit)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-xs transition hover:bg-[#f0f5ff] hover:border-[#b9ccf0]"
                        >
                          <span className="material-symbols-outlined text-[16px]">autorenew</span>
                          {t("my_units.renew", "Renew")}
                        </button>
                      )}

                      {activeGalleryUnit.status === "overdue" &&
                        activeGalleryUnit.endDate &&
                        Math.ceil((new Date(activeGalleryUnit.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) > 7 && (
                        <button
                          type="button"
                          onClick={() => navigate("/billing")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                        >
                          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                          {t("billing.pay_monthly_invoice", "Thanh toán hóa đơn tháng")}
                        </button>
                      )}

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

                  <UnitInformation rental={activeGalleryUnit.rawRental} className="mt-4" />

                  {activeGalleryUnit.penaltyAmount > 0 ? (
                    <div className="mt-4 rounded-2xl border-2 border-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-5 text-xs text-rose-950 dark:text-rose-100 shadow-sm space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[24px] text-rose-600">error</span>
                          <div>
                            <h4 className="text-sm font-black text-rose-900 dark:text-rose-200">
                              {t("my_units.damage_penalty_title", "Cần thanh toán phí bù đắp thiệt hại sau nghiệm thu trả kho")}
                            </h4>
                            <p className="text-[11px] text-rose-700 dark:text-rose-300">
                              {t("my_units.damage_penalty_subtitle", "Chi phí hư hại vượt quá tiền cọc. Đã khấu trừ 100% tiền cọc.")}
                            </p>
                          </div>
                        </div>
                        {activeGalleryUnit.penaltyInvoiceNo && (
                          <span className="rounded-md bg-rose-200/80 dark:bg-rose-900/60 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-900 dark:text-rose-200">
                            #{activeGalleryUnit.penaltyInvoiceNo}
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 border border-rose-200/70 dark:border-rose-900/40 space-y-2">
                        {activeGalleryUnit.latestInspectionSummary && (
                          <div className="text-xs text-slate-700 dark:text-zinc-300">
                            <span className="font-bold text-slate-900 dark:text-zinc-100">{t("my_units.inspection_note", "Ghi chú nghiệm thu:")} </span>
                            {activeGalleryUnit.latestInspectionSummary}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between pt-1 text-xs">
                          <span className="font-semibold text-slate-600 dark:text-zinc-400">
                            {t("my_units.deficit_amount", "Số tiền bồi thường cần thanh toán:")}
                          </span>
                          <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency ? formatCurrency(activeGalleryUnit.penaltyAmount) : `${activeGalleryUnit.penaltyAmount.toLocaleString("vi-VN")} VND`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="text-[11px] text-rose-800 dark:text-rose-300 max-w-lg">
                          {t("my_units.penalty_settle_notice", "Vui lòng quét mã VietQR để thanh toán hóa đơn phạt này. Hợp đồng sẽ tự động chuyển sang trạng thái Hoàn tất thanh lý ngay khi nhận được thanh toán.")}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/checkout", { state: { invoiceId: activeGalleryUnit.penaltyInvoiceId } })}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                          {t("my_units.pay_penalty_vietqr", "Thanh toán ngay bằng VietQR")}
                        </button>
                      </div>
                    </div>
                  ) : activeGalleryUnit.rawStatus === "checkout_pending" ? (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 p-4 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
                      <span className="material-symbols-outlined text-[24px] text-amber-600">hourglass_top</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-amber-950 dark:text-amber-100">
                          {t("my_units.checkout_pending_title", "Đang xử lý thủ tục hoàn trả kho & đối soát cọc")}
                        </div>
                        <div className="text-[11px] text-amber-800/90 dark:text-amber-300 mt-1">
                          {t("my_units.checkout_pending_desc", "Nhân viên cơ sở đã hoàn tất biên bản nghiệm thu trả kho. Lệnh hoàn cọc đang được xử lý chuyển khoản hoặc nhận tiền mặt tại quầy lễ tân theo thông tin quý khách đã đăng ký.")}
                        </div>
                      </div>
                    </div>
                  ) : activeGalleryUnit.status === "terminated" || activeGalleryUnit.rawStatus === "completed" ? (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 p-4 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
                      <span className="material-symbols-outlined text-[24px] text-emerald-600">verified</span>
                      <div>
                        <div className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                          {t("my_units.completed_title", "Hợp đồng đã hoàn tất thủ tục bàn giao & thanh lý")}
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {t("my_units.completed_desc", "Kho đã được bàn giao lại cho cơ sở thành công và mọi nghĩa vụ tài chính đã được quyết toán đầy đủ.")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8996a9] mb-2.5">
                        {t("common.actions", "Thao tác")}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-4 shadow-2xs">
                          <MoveOutRequest agreementId={activeGalleryUnit.agreementId || activeGalleryUnit.id} />
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-4 shadow-2xs">
                          <UnitTransferRequest
                            key={activeGalleryUnit.agreementId}
                            agreementId={activeGalleryUnit.agreementId || activeGalleryUnit.id}
                            facilityId={activeGalleryUnit.facilityId}
                            currentFacilityName={activeGalleryUnit.facilityName}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
        <HandoverReportModal
          record={handoverData}
          loading={handoverLoading}
          error={handoverError}
          onClose={handleCloseHandover}
        />
      )}

      <Footer />
    </div>
  );
}
