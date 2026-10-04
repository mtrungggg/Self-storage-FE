import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUnitTabs,
  getTicketTabs,
  getTicketCategories,
  getTicketStatusSteps,
  getCategoryLabel,
  getPriorityLabel,
  getStatusMeta,
} from "../data/supportRepository";
import {
  filterUnitsByStatus,
  filterTicketsByStatus,
  normalizeTicketStage,
} from "../domain/usecases/filterSupportRecords";
import supportTicketService from "../api/supportTicketService";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";

function formatDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Application layer: encapsulates Support page state, filtering and API wiring without hardcoded fallback records.
export function useSupport() {
  const categories = useMemo(() => getTicketCategories(), []);
  const statusSteps = useMemo(() => getTicketStatusSteps(), []);

  // Rentals & Facilities state
  const [rentals, setRentals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState("");

  // Support tickets list state (GET /api/customer/support-tickets)
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");

  // Filter tabs
  const [activeUnitTab, setActiveUnitTab] = useState("all");
  const [activeTicketTab, setActiveTicketTab] = useState("all");

  // Create ticket form state (POST /api/customer/support-tickets)
  const [selectedTarget, setSelectedTarget] = useState("");
  const [category, setCategory] = useState("access");
  const [priority, setPriority] = useState("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [allowMasterKey, setAllowMasterKey] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submitTicketError, setSubmitTicketError] = useState("");
  const [submitTicketSuccess, setSubmitTicketSuccess] = useState("");

  // Ticket detail & chat modal state (GET /api/customer/support-tickets/{id})
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Add message state (POST /api/customer/support-tickets/{id}/messages)
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState("");

  // Confirm & rate state (POST /api/customer/support-tickets/{id}/confirm-and-rate)
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");

  // Load rentals & facilities from Backend
  useEffect(() => {
    let active = true;
    setUnitsLoading(true);
    setUnitsError("");

    Promise.allSettled([rentalService.getMyRentals(), facilityService.getFacilities()])
      .then(([rentalsRes, facilitiesRes]) => {
        if (!active) return;
        const rentalList =
          rentalsRes.status === "fulfilled" && Array.isArray(rentalsRes.value)
            ? rentalsRes.value
            : [];
        const facilityList =
          facilitiesRes.status === "fulfilled" && Array.isArray(facilitiesRes.value)
            ? facilitiesRes.value
            : [];

        if (rentalsRes.status === "rejected" && facilitiesRes.status === "rejected") {
          setUnitsError(
            rentalsRes.reason?.message ||
              facilitiesRes.reason?.message ||
              "Không thể tải dữ liệu kho và cơ sở từ hệ thống."
          );
        }

        setRentals(rentalList);
        setFacilities(facilityList);

        if (rentalList.length > 0) {
          setSelectedTarget(`rental:${rentalList[0].agreementId}`);
        } else if (facilityList.length > 0) {
          const firstFacId = facilityList[0].id ?? facilityList[0].facilityId;
          setSelectedTarget(`facility:${firstFacId}`);
        }
      })
      .finally(() => {
        if (active) setUnitsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Load support tickets list from Backend
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError("");
    try {
      const data = await supportTicketService.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setTicketsError(err?.message || "Không thể tải danh sách yêu cầu hỗ trợ.");
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Target dropdown options built strictly from real rentals + real facilities
  const targetOptions = useMemo(() => {
    const opts = [];
    rentals.forEach((r) => {
      opts.push({
        value: `rental:${r.agreementId}`,
        label: `Kho #${r.unitCode || r.storageUnitId} (${r.facilityName}${
          r.floorLabel ? ` • ${r.floorLabel}` : ""
        }${r.dimensions ? ` • ${r.dimensions}` : ""})`,
        facilityId: Number(r.facilityId),
        agreementId: Number(r.agreementId),
        storageUnitId: r.storageUnitId ? Number(r.storageUnitId) : null,
        unitCode: r.unitCode,
        facilityName: r.facilityName,
      });
    });
    facilities.forEach((f) => {
      const fid = Number(f.id ?? f.facilityId);
      if (!fid) return;
      opts.push({
        value: `facility:${fid}`,
        label: `Hỗ trợ tại cơ sở: ${f.name || f.code}${f.city ? ` (${f.city})` : ""}`,
        facilityId: fid,
        agreementId: null,
        storageUnitId: null,
        unitCode: null,
        facilityName: f.name || f.code,
      });
    });
    return opts;
  }, [rentals, facilities]);

  // Map real rentals to unit cards (no hardcoded fallback units)
  const units = useMemo(() => {
    return rentals.map((r) => {
      const isRenew =
        (r.status || "").toLowerCase() === "expiring_soon" ||
        (r.daysUntilExpiry !== undefined && r.daysUntilExpiry <= 7);
      return {
        id: r.unitCode || `${r.agreementNo || r.agreementId}`,
        agreementId: r.agreementId,
        agreementNo: r.agreementNo,
        facilityId: r.facilityId,
        facilityName: r.facilityName,
        storageUnitId: r.storageUnitId,
        location:
          [r.floorLabel, r.zoneLabel, r.facilityName].filter(Boolean).join(" • ") ||
          r.facilityAddress ||
          r.facilityName,
        status: isRenew ? "renew" : "active",
        statusLabel: isRenew ? `Còn ${r.daysUntilExpiry ?? 0} ngày` : "Đang hoạt động",
        warning: r.hasOverdueDebt
          ? "Hợp đồng đang có khoản thanh toán quá hạn. Vui lòng kiểm tra hóa đơn."
          : isRenew
          ? `Hợp đồng sắp hết hạn vào ngày ${r.endDate}. Vui lòng gia hạn để tránh khóa mã PIN.`
          : null,
        size: r.dimensions || r.unitTypeName || (r.areaM2 ? `${r.areaM2} m²` : "-"),
        sizeNote: r.unitTypeName
          ? `${r.unitTypeName}${r.areaM2 ? ` (~${r.areaM2}m²)` : ""}`
          : "",
        zoneInfo: [r.zoneLabel, r.floorLabel].filter(Boolean).join(" • ") || r.facilityCity || "-",
        contractLabel: "Thời hạn hợp đồng",
        contractDate: r.endDate ? `Hạn đến ${r.endDate}` : "-",
        contractLeft: r.daysUntilExpiry !== undefined ? `Còn ${r.daysUntilExpiry} ngày` : "",
        payment: r.monthlyRate
          ? `${new Intl.NumberFormat("vi-VN").format(r.monthlyRate)} đ/tháng`
          : "",
      };
    });
  }, [rentals]);

  const unitTabs = useMemo(() => getUnitTabs(units), [units]);

  // Enrich tickets for UI rendering
  const enrichedTickets = useMemo(() => {
    return tickets.map((t) => {
      const meta = getStatusMeta(t.status, t.displayStatus);
      const stage = normalizeTicketStage(t);
      return {
        ...t,
        stage,
        statusBadgeText: meta.badgeText,
        statusBadgeClass: meta.badgeClass,
        categoryLabel: getCategoryLabel(t.category),
        priorityLabel: getPriorityLabel(t.priority),
        createdTimeFormatted: formatDateTime(t.createdAt),
        resolvedTimeFormatted: formatDateTime(t.resolvedAt),
      };
    });
  }, [tickets]);

  const ticketTabs = useMemo(() => getTicketTabs(enrichedTickets), [enrichedTickets]);

  const filteredUnits = useMemo(
    () => filterUnitsByStatus(units, activeUnitTab),
    [units, activeUnitTab]
  );

  const filteredTickets = useMemo(
    () => filterTicketsByStatus(enrichedTickets, activeTicketTab),
    [enrichedTickets, activeTicketTab]
  );

  // Summary metrics for top banner derived strictly from real API data
  const ticketSummaryStats = useMemo(() => {
    const activeCount = enrichedTickets.filter(
      (t) => t.stage === "Reported" || t.stage === "Investigating" || t.stage === "Assessed"
    ).length;
    const reportedCount = enrichedTickets.filter((t) => t.stage === "Reported").length;
    const inProgressCount = enrichedTickets.filter(
      (t) => t.stage === "Investigating" || t.stage === "Assessed"
    ).length;
    const resolvedCount = enrichedTickets.filter((t) => t.stage === "Resolved").length;
    const closedCount = enrichedTickets.filter((t) => t.stage === "Closed").length;
    const activeUnitsCount = units.filter((u) => u.status === "active").length;
    const renewUnits = units.filter((u) => u.status === "renew");
    const primaryFacilityName =
      rentals[0]?.facilityName ||
      facilities[0]?.name ||
      facilities[0]?.code ||
      enrichedTickets[0]?.facilityName ||
      "";

    return {
      total: enrichedTickets.length,
      activeCount,
      reportedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      totalUnits: units.length,
      activeUnitsCount,
      renewUnitsCount: renewUnits.length,
      firstRenewUnit: renewUnits[0] || null,
      primaryFacilityName,
    };
  }, [enrichedTickets, units, rentals, facilities]);

  // Pre-select a rented unit in the support form
  const selectUnitForSupport = useCallback((unit) => {
    if (unit?.agreementId) {
      setSelectedTarget(`rental:${unit.agreementId}`);
    }
    const formEl = document.getElementById("create-support-ticket-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // File attachment handlers
  const handleAddFiles = useCallback((fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newItems = Array.from(fileList).map((file) => ({
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      fileSizeBytes: file.size || 1024,
      fileSizeFormatted: formatFileSize(file.size || 1024),
      objectUrl: `https://storage.vaultspace.vn/tickets/${Date.now()}-${encodeURIComponent(file.name)}`,
      sha256: null,
    }));
    setAttachments((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemoveAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // Create support ticket (POST /api/customer/support-tickets)
  const handleCreateTicket = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setSubmitTicketError("");
      setSubmitTicketSuccess("");

      const targetObj =
        targetOptions.find((o) => o.value === selectedTarget) || targetOptions[0];

      if (!targetObj || !targetObj.facilityId) {
        setSubmitTicketError("Vui lòng chọn khoang lưu trữ hoặc cơ sở cần hỗ trợ.");
        return;
      }

      const trimmedDesc = description.trim();
      if (!trimmedDesc) {
        setSubmitTicketError("Vui lòng nhập mô tả chi tiết tình huống sự cố.");
        return;
      }

      const catLabel = getCategoryLabel(category);
      const finalSubject =
        subject.trim() ||
        `${catLabel}${targetObj.unitCode ? ` - Kho #${targetObj.unitCode}` : ` - ${targetObj.facilityName}`}`;

      const finalDescription = allowMasterKey
        ? `${trimmedDesc}\n\n[Ghi chú: Khách hàng cho phép kỹ thuật viên dùng chìa Master mở kho kiểm tra khi vắng mặt có camera giám sát]`
        : trimmedDesc;

      const payload = {
        facilityId: Number(targetObj.facilityId),
        agreementId: targetObj.agreementId ? Number(targetObj.agreementId) : null,
        storageUnitId: targetObj.storageUnitId ? Number(targetObj.storageUnitId) : null,
        category,
        priority,
        subject: finalSubject,
        description: finalDescription,
        attachments:
          attachments.length > 0
            ? attachments.map((a) => ({
                fileName: a.fileName,
                mimeType: a.mimeType,
                fileSizeBytes: a.fileSizeBytes,
                objectUrl: a.objectUrl,
                sha256: a.sha256 || null,
              }))
            : null,
      };

      setSubmittingTicket(true);
      try {
        const created = await supportTicketService.createTicket(payload);
        setSubmitTicketSuccess(
          `Đã gửi yêu cầu hỗ trợ thành công (Mã ticket: ${created?.ticketNo || "#" + created?.id}).`
        );
        setSubject("");
        setDescription("");
        setAttachments([]);
        setAllowMasterKey(false);
        await fetchTickets();
      } catch (err) {
        setSubmitTicketError(
          err?.message || "Gửi yêu cầu hỗ trợ thất bại. Vui lòng kiểm tra lại thông tin."
        );
      } finally {
        setSubmittingTicket(false);
      }
    },
    [
      targetOptions,
      selectedTarget,
      description,
      category,
      subject,
      allowMasterKey,
      priority,
      attachments,
      fetchTickets,
    ]
  );

  // Open ticket detail modal & fetch detail (GET /api/customer/support-tickets/{id})
  const openTicketDetail = useCallback(async (ticketId) => {
    if (!ticketId) return;
    setSelectedTicketId(ticketId);
    setDetailLoading(true);
    setDetailError("");
    setMessageError("");
    setRatingError("");
    setRatingSuccess("");
    try {
      const detail = await supportTicketService.getTicketDetail(ticketId);
      setTicketDetail(detail);
      if (detail?.rating?.score) {
        setRatingScore(detail.rating.score);
        setRatingComment(detail.rating.comment || "");
      } else {
        setRatingScore(5);
        setRatingComment("");
      }
    } catch (err) {
      setDetailError(err?.message || "Không thể tải chi tiết yêu cầu hỗ trợ.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeTicketDetail = useCallback(() => {
    setSelectedTicketId(null);
    setTicketDetail(null);
    setDetailError("");
    setMessageBody("");
    setMessageError("");
    setRatingError("");
    setRatingSuccess("");
  }, []);

  // Send reply message in ticket detail (POST /api/customer/support-tickets/{id}/messages)
  const handleSendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!selectedTicketId) return;
      const body = messageBody.trim();
      if (!body) {
        setMessageError("Vui lòng nhập nội dung tin nhắn.");
        return;
      }
      setSendingMessage(true);
      setMessageError("");
      try {
        await supportTicketService.addTicketMessage(selectedTicketId, {
          body,
          attachments: null,
        });
        setMessageBody("");
        const updatedDetail = await supportTicketService.getTicketDetail(selectedTicketId);
        setTicketDetail(updatedDetail);
        await fetchTickets();
      } catch (err) {
        setMessageError(err?.message || "Không thể gửi tin nhắn phản hồi.");
      } finally {
        setSendingMessage(false);
      }
    },
    [selectedTicketId, messageBody, fetchTickets]
  );

  // Confirm resolution & rate ticket (POST /api/customer/support-tickets/{id}/confirm-and-rate)
  const handleConfirmAndRate = useCallback(
    async (e, ticketIdOverride) => {
      if (e) e.preventDefault();
      const targetId = ticketIdOverride || selectedTicketId;
      if (!targetId) return;

      const score = Number(ratingScore);
      if (!score || score < 1 || score > 5) {
        setRatingError("Vui lòng chọn mức đánh giá từ 1 đến 5 sao.");
        return;
      }

      setSubmittingRating(true);
      setRatingError("");
      setRatingSuccess("");
      try {
        await supportTicketService.confirmAndRateTicket(targetId, {
          score,
          comment: ratingComment.trim() || null,
        });
        setRatingSuccess("Cảm ơn bạn đã xác nhận kết quả xử lý và đánh giá dịch vụ!");
        if (selectedTicketId === targetId) {
          const updatedDetail = await supportTicketService.getTicketDetail(targetId);
          setTicketDetail(updatedDetail);
        }
        await fetchTickets();
      } catch (err) {
        setRatingError(err?.message || "Không thể gửi xác nhận và đánh giá.");
      } finally {
        setSubmittingRating(false);
      }
    },
    [selectedTicketId, ratingScore, ratingComment, fetchTickets]
  );

  return {
    unitTabs,
    ticketTabs,
    categories,
    statusSteps,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    unitsLoading,
    unitsError,
    filteredUnits,
    ticketsLoading,
    ticketsError,
    filteredTickets,
    ticketSummaryStats,
    fetchTickets,

    // Create ticket form
    targetOptions,
    selectedTarget,
    setSelectedTarget,
    category,
    setCategory,
    priority,
    setPriority,
    subject,
    setSubject,
    description,
    setDescription,
    attachments,
    handleAddFiles,
    handleRemoveAttachment,
    allowMasterKey,
    setAllowMasterKey,
    submittingTicket,
    submitTicketError,
    submitTicketSuccess,
    handleCreateTicket,
    selectUnitForSupport,

    // Detail & Staff chat modal
    selectedTicketId,
    ticketDetail,
    detailLoading,
    detailError,
    openTicketDetail,
    closeTicketDetail,
    messageBody,
    setMessageBody,
    sendingMessage,
    messageError,
    handleSendMessage,

    // Confirm & Rate
    ratingScore,
    setRatingScore,
    ratingComment,
    setRatingComment,
    submittingRating,
    ratingError,
    ratingSuccess,
    handleConfirmAndRate,

    // Helpers
    formatDateTime,
    formatFileSize,
  };
}
