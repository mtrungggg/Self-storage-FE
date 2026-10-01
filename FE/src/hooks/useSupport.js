import { useEffect, useMemo, useState } from "react";
import {
  getUnitTabs,
  getSupportUnits,
  getTicketTabs,
  getSupportTickets,
} from "../data/supportRepository";
import { filterUnitsByStatus, filterTicketsByStatus } from "../domain/usecases/filterSupportRecords";
import rentalService from "../api/rentalService";
import { formatVnd } from "../lib/utils";

// Application layer: encapsulates Support page state, filtering and data wiring.
export function useSupport() {
  const fallbackUnits = getSupportUnits();
  const ticketTabs = getTicketTabs();
  const tickets = getSupportTickets();

  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    rentalService
      .getMyRentals()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const activeList = list.filter((r) => (r.status || "").toLowerCase() !== "ended");
        setActiveRentals(activeList);
      })
      .catch((err) => {
        console.warn("Lỗi tải rentals cho Support:", err);
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const units = useMemo(() => {
    if (activeRentals.length === 0) return fallbackUnits;

    return activeRentals.map((r, idx) => ({
      id: r.unitCode,
      location: `Tầng ${r.floorLabel || "1"} • Zone ${r.zoneLabel || "A"} • ${r.facilityName || "Thu Duc Self Storage"}`,
      status: "active",
      statusLabel: "Đang hoạt động",
      size: `${r.areaM2 || (idx === 0 ? "3.0" : "6.0")} m² (${r.dimensions || "1.5 × 2.0m"})`,
      sizeNote: r.unitTypeName || "Kho tự quản tiêu chuẩn",
      climate: "22°C / 48% RH • Khóa thông minh",
      contractLabel: "Hợp đồng",
      contractDate: `Số HĐ: ${r.agreementNo || "AGR-2026"}`,
      contractLeft: `Hạn đến: ${r.endDate ? new Date(r.endDate).toLocaleDateString("vi-VN") : "Còn hiệu lực"}`,
      payment: `${formatVnd(r.monthlyRate)}/tháng • Tự động`,
      primaryAction: "Xem mã PIN / Khóa điện tử",
      footerLinks: ["Báo sự cố", "Gia hạn thêm", "Đặt lịch trả kho"],
    }));
  }, [activeRentals, fallbackUnits]);

  const unitTabs = useMemo(() => [
    { id: "all", label: `Tất cả kho (${units.length})` },
    { id: "active", label: `Đang hoạt động (${units.length})` },
    { id: "renew", label: "Cần gia hạn (0)" },
  ], [units]);

  const [activeUnitTab, setActiveUnitTab] = useState("all");
  const [activeTicketTab, setActiveTicketTab] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [allowMasterKey, setAllowMasterKey] = useState(false);

  const filteredUnits = useMemo(() => filterUnitsByStatus(units, activeUnitTab), [units, activeUnitTab]);
  const filteredTickets = useMemo(
    () => filterTicketsByStatus(tickets, activeTicketTab),
    [tickets, activeTicketTab]
  );

  const primaryRental = activeRentals[0] || null;
  const facilityName = primaryRental?.facilityName || "Thu Duc Self Storage";

  return {
    unitTabs,
    ticketTabs,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    priority,
    setPriority,
    allowMasterKey,
    setAllowMasterKey,
    filteredUnits,
    filteredTickets,
    facilityName,
    activeRentals,
    rentalsLoading,
  };
}
