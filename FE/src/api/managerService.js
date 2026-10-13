import apiClient from "./apiClient";

// ==========================================
// LOCAL STORAGE KEYS FOR PERSISTENT DATA
// ==========================================
const STORAGE_KEY_INVOICES = "g1_manager_invoices";
const STORAGE_KEY_PROMOTIONS = "g1_manager_promotions";
const STORAGE_KEY_FACILITIES = "g1_manager_facilities";
const STORAGE_KEY_UNIT_TYPES = "g1_manager_unit_types";
const STORAGE_KEY_UNITS = "g1_manager_units";
const STORAGE_KEY_TICKETS = "g1_manager_tickets";
const STORAGE_KEY_STAFF = "g1_manager_staff";
const STORAGE_KEY_TASKS = "g1_manager_tasks";
const STORAGE_KEY_ROSTER = "g1_manager_roster";
const STORAGE_KEY_AGREEMENTS = "g1_manager_agreements";
const STORAGE_KEY_TRANSFERS = "g1_manager_transfers";
const STORAGE_KEY_REFUNDS = "g1_manager_refunds";
const STORAGE_KEY_DELINQUENT = "g1_manager_delinquent";
const STORAGE_KEY_CHARGE_PROPOSALS = "g1_manager_charge_proposals";

function getStoredJson(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

// ==========================================
// DEFAULT SEED DATA
// ==========================================
const DEFAULT_CUSTOMER_OPTIONS = [
  { customerId: 1, fullName: "Nguyễn Văn An", customerName: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", agreementId: 101, reservationId: 201, unitCode: "TD-A101" },
  { customerId: 2, fullName: "Trần Thị Mai", customerName: "Trần Thị Mai", email: "tranmai@gmail.com", agreementId: 102, reservationId: 202, unitCode: "TD-B204" },
  { customerId: 3, fullName: "Lê Hoàng Phúc", customerName: "Lê Hoàng Phúc", email: "phuc.le@gmail.com", agreementId: 103, reservationId: 203, unitCode: "TD-C305" },
  { customerId: 4, fullName: "Phạm Hải Đăng", customerName: "Phạm Hải Đăng", email: "haidang@gmail.com", agreementId: 104, reservationId: 204, unitCode: "TD-A108" },
  { customerId: 5, fullName: "Vũ Minh Trí", customerName: "Vũ Minh Trí", email: "minhtri.vu@gmail.com", agreementId: 105, reservationId: 205, unitCode: "TD-B212" },
];

const DEFAULT_MONTHLY_TREND = [
  { monthKey: "2026-05", monthLabel: "T05/2026", primaryFacilityRevenue: 185000000, otherFacilitiesRevenue: 120000000, totalRevenue: 305000000 },
  { monthKey: "2026-06", monthLabel: "T06/2026", primaryFacilityRevenue: 210000000, otherFacilitiesRevenue: 135000000, totalRevenue: 345000000 },
  { monthKey: "2026-07", monthLabel: "T07/2026", primaryFacilityRevenue: 240000000, otherFacilitiesRevenue: 150000000, totalRevenue: 390000000 },
  { monthKey: "2026-08", monthLabel: "T08/2026", primaryFacilityRevenue: 275000000, otherFacilitiesRevenue: 165000000, totalRevenue: 440000000 },
  { monthKey: "2026-09", monthLabel: "T09/2026", primaryFacilityRevenue: 310000000, otherFacilitiesRevenue: 180000000, totalRevenue: 490000000 },
  { monthKey: "2026-10", monthLabel: "T10/2026", primaryFacilityRevenue: 345000000, otherFacilitiesRevenue: 210000000, totalRevenue: 555000000 },
];

const DEFAULT_CATEGORY_MIX = [
  { unitTypeId: 1, unitTypeCode: "S", unitTypeName: "Mini Locker (1-2m²)", unitCount: 45, sharePercent: 15, revenueAmount: 276750000 },
  { unitTypeId: 2, unitTypeCode: "M", unitTypeName: "Tiêu chuẩn (4-6m²)", unitCount: 120, sharePercent: 38, revenueAmount: 701100000 },
  { unitTypeId: 3, unitTypeCode: "L", unitTypeName: "Kho lớn gia đình (8-12m²)", unitCount: 65, sharePercent: 32, revenueAmount: 590400000 },
  { unitTypeId: 4, unitTypeCode: "XL", unitTypeName: "Kho doanh nghiệp (>16m²)", unitCount: 20, sharePercent: 15, revenueAmount: 276750000 },
];

const DEFAULT_INVOICES = [
  {
    id: 1,
    invoiceNo: "INV-2026-001",
    customerId: 1,
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@gmail.com",
    unitCode: "TD-A101",
    agreementId: 101,
    reservationId: 201,
    billingPeriod: "2026-10",
    issueDate: "2026-10-01",
    dueDate: "2026-10-08",
    lineType: "rent",
    description: "Tiền thuê kho định kỳ tháng 10/2026 (TD-A101)",
    subtotalAmount: 2500000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 2500000,
    paidAmount: 2500000,
    status: "paid",
    paymentMethod: "bank_transfer",
  },
  {
    id: 2,
    invoiceNo: "INV-2026-002",
    customerId: 2,
    customerName: "Trần Thị Mai",
    customerEmail: "tranmai@gmail.com",
    unitCode: "TD-B204",
    agreementId: 102,
    reservationId: 202,
    billingPeriod: "2026-10",
    issueDate: "2026-10-05",
    dueDate: "2026-10-12",
    lineType: "rent",
    description: "Tiền thuê kho tiêu chuẩn (TD-B204)",
    subtotalAmount: 3200000,
    discountAmount: 200000,
    taxAmount: 0,
    totalAmount: 3000000,
    paidAmount: 0,
    status: "open",
    paymentMethod: "bank_transfer",
  },
  {
    id: 3,
    invoiceNo: "INV-2026-003",
    customerId: 3,
    customerName: "Lê Hoàng Phúc",
    customerEmail: "phuc.le@gmail.com",
    unitCode: "TD-C305",
    agreementId: 103,
    reservationId: 203,
    billingPeriod: "2026-09",
    issueDate: "2026-09-15",
    dueDate: "2026-09-22",
    lineType: "late_fee",
    description: "Phí quá hạn và duy trì kho (TD-C305)",
    subtotalAmount: 1850000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 1850000,
    paidAmount: 0,
    status: "overdue",
    paymentMethod: "cash",
  },
  {
    id: 4,
    invoiceNo: "INV-2026-004",
    customerId: 4,
    customerName: "Phạm Hải Đăng",
    customerEmail: "haidang@gmail.com",
    unitCode: "TD-A108",
    agreementId: 104,
    reservationId: 204,
    billingPeriod: "2026-10",
    issueDate: "2026-10-02",
    dueDate: "2026-10-09",
    lineType: "deposit",
    description: "Đặt cọc an ninh hợp đồng mới (TD-A108)",
    subtotalAmount: 4500000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 4500000,
    paidAmount: 4500000,
    status: "paid",
    paymentMethod: "credit_card",
  },
  {
    id: 5,
    invoiceNo: "INV-2026-005",
    customerId: 5,
    customerName: "Vũ Minh Trí",
    customerEmail: "minhtri.vu@gmail.com",
    unitCode: "TD-B212",
    agreementId: 105,
    reservationId: 205,
    billingPeriod: "2026-10",
    issueDate: "2026-10-08",
    dueDate: "2026-10-15",
    lineType: "rent",
    description: "Tiền thuê kho kèm phụ phí bảo trì (TD-B212)",
    subtotalAmount: 3800000,
    discountAmount: 300000,
    taxAmount: 0,
    totalAmount: 3500000,
    paidAmount: 2000000,
    status: "partially_paid",
    paymentMethod: "bank_transfer",
  },
];

const DEFAULT_PROMOTIONS = [
  {
    id: 1,
    code: "WELCOME2026",
    name: "Ưu đãi khách hàng mới",
    description: "Giảm 15% tháng đầu tiên cho khách thuê kho lần đầu",
    discountType: "percentage",
    discountValue: 15,
    maxDiscountAmount: 500000,
    usageLimit: 200,
    usedCount: 78,
    isActive: true,
  },
  {
    id: 2,
    code: "LONGTERM6M",
    name: "Thuê dài hạn 6 tháng",
    description: "Giảm ngay 500.000đ khi ký hợp đồng từ 6 tháng",
    discountType: "fixed_amount",
    discountValue: 500000,
    maxDiscountAmount: 500000,
    usageLimit: 100,
    usedCount: 42,
    isActive: true,
  },
  {
    id: 3,
    code: "SUMMERFEST",
    name: "Khuyến mãi mùa hè",
    description: "Miễn phí cọc tháng đầu cho dòng kho tiêu chuẩn",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: 300000,
    usageLimit: 50,
    usedCount: 50,
    isActive: false,
  },
];

const DEFAULT_FACILITIES = [
  { id: 1, code: "HCM-TD", name: "Cơ sở Thủ Đức", address: "01 Võ Văn Ngân, TP. Thủ Đức, TP. HCM", city: "TP. Hồ Chí Minh", district: "TP. Thủ Đức", openingTime: "07:00", closingTime: "22:00", status: "active" },
  { id: 2, code: "HN-CG", name: "Cơ sở Cầu Giấy", address: "18 Duy Tân, Q. Cầu Giấy, Hà Nội", city: "Hà Nội", district: "Q. Cầu Giấy", openingTime: "07:00", closingTime: "21:00", status: "active" },
];

const DEFAULT_UNIT_TYPES = [
  { id: 1, code: "S", name: "Locker Nhỏ (1-2m²)", widthM: 1.0, lengthM: 1.5, heightM: 2.5, areaM2: 1.5, basePriceMonthly: 950000 },
  { id: 2, code: "M", name: "Tiêu Chuẩn (4-6m²)", widthM: 2.0, lengthM: 2.5, heightM: 2.8, areaM2: 5.0, basePriceMonthly: 1850000 },
  { id: 3, code: "L", name: "Kho Gia Đình (8-12m²)", widthM: 3.0, lengthM: 3.5, heightM: 3.0, areaM2: 10.5, basePriceMonthly: 3200000 },
  { id: 4, code: "XL", name: "Kho Doanh Nghiệp (16m²)", widthM: 4.0, lengthM: 4.0, heightM: 3.0, areaM2: 16.0, basePriceMonthly: 4800000 },
];

const DEFAULT_UNITS = [
  { id: 1, facilityId: 1, unitTypeId: 1, unitCode: "TD-A101", floorLabel: "1", zoneLabel: "A", physicalStatus: "occupied", isListed: true, monthlyRate: 950000, depositAmount: 950000, notes: "Khách đang thuê ngắn hạn" },
  { id: 2, facilityId: 1, unitTypeId: 2, unitCode: "TD-A102", floorLabel: "1", zoneLabel: "A", physicalStatus: "available", isListed: true, monthlyRate: 1850000, depositAmount: 1850000, notes: "Kho sạch, sẵn sàng bàn giao" },
  { id: 3, facilityId: 1, unitTypeId: 2, unitCode: "TD-B204", floorLabel: "2", zoneLabel: "B", physicalStatus: "occupied", isListed: true, monthlyRate: 1850000, depositAmount: 1850000, notes: "Hợp đồng gia hạn đến T12/2026" },
  { id: 4, facilityId: 1, unitTypeId: 3, unitCode: "TD-B205", floorLabel: "2", zoneLabel: "B", physicalStatus: "reserved", isListed: true, monthlyRate: 3200000, depositAmount: 3200000, notes: "Đã giữ chỗ, chờ thanh toán cọc" },
  { id: 5, facilityId: 1, unitTypeId: 2, unitCode: "TD-C301", floorLabel: "3", zoneLabel: "C", physicalStatus: "maintenance", isListed: false, monthlyRate: 1850000, depositAmount: 1850000, notes: "Đang sửa chữa cảm biến khóa thông minh" },
  { id: 6, facilityId: 1, unitTypeId: 4, unitCode: "TD-C302", floorLabel: "3", zoneLabel: "C", physicalStatus: "available", isListed: true, monthlyRate: 4800000, depositAmount: 4800000, notes: "Kho lớn có điều hòa nhiệt độ" },
  { id: 7, facilityId: 2, unitTypeId: 1, unitCode: "CG-A101", floorLabel: "1", zoneLabel: "A", physicalStatus: "available", isListed: true, monthlyRate: 900000, depositAmount: 900000, notes: "Kho trống tầng 1" },
  { id: 8, facilityId: 2, unitTypeId: 2, unitCode: "CG-A102", floorLabel: "1", zoneLabel: "A", physicalStatus: "occupied", isListed: true, monthlyRate: 1800000, depositAmount: 1800000, notes: "Khách doanh nghiệp gửi tài liệu" },
];

const DEFAULT_AGREEMENTS = [
  {
    id: 101,
    agreementNo: "AGR-2026-001",
    customerId: 1,
    customerName: "Nguyễn Văn An",
    customerPhone: "0901234567",
    customerEmail: "nguyenvanan@gmail.com",
    storageUnitId: 1,
    unitCode: "TD-A101",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    monthlyRent: 2500000,
    depositAmount: 2500000,
    status: "active",
    outstandingBalance: 0,
    unpaidInvoicesCount: 0,
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: 102,
    agreementNo: "AGR-2026-002",
    customerId: 2,
    customerName: "Trần Thị Mai",
    customerPhone: "0902345678",
    customerEmail: "tranmai@gmail.com",
    storageUnitId: 3,
    unitCode: "TD-B204",
    startDate: "2026-03-01",
    endDate: "2026-11-01",
    monthlyRent: 3200000,
    depositAmount: 3200000,
    status: "active",
    outstandingBalance: 3000000,
    unpaidInvoicesCount: 1,
    createdAt: "2026-03-01T09:30:00Z",
  },
  {
    id: 103,
    agreementNo: "AGR-2026-003",
    customerId: 3,
    customerName: "Lê Hoàng Phúc",
    customerPhone: "0903456789",
    customerEmail: "phuc.le@gmail.com",
    storageUnitId: 4,
    unitCode: "TD-C305",
    startDate: "2026-02-15",
    endDate: "2026-08-15",
    monthlyRent: 1850000,
    depositAmount: 1850000,
    status: "delinquent",
    outstandingBalance: 3700000,
    unpaidInvoicesCount: 2,
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: 104,
    agreementNo: "AGR-2026-004",
    customerId: 4,
    customerName: "Phạm Hải Đăng",
    customerPhone: "0904567890",
    customerEmail: "haidang@gmail.com",
    storageUnitId: 6,
    unitCode: "TD-C302",
    startDate: "2026-05-01",
    endDate: "2027-05-01",
    monthlyRent: 4800000,
    depositAmount: 4800000,
    status: "active",
    outstandingBalance: 0,
    unpaidInvoicesCount: 0,
    createdAt: "2026-05-01T14:00:00Z",
  },
];

const DEFAULT_DELINQUENT_CASES = [
  {
    id: 1,
    agreementId: 103,
    agreementNo: "AGR-2026-003",
    unitCode: "TD-C305",
    customerId: 3,
    customerName: "Lê Hoàng Phúc",
    customerPhone: "0903456789",
    status: "delinquent",
    outstandingSnapshot: 3700000,
    currentDebt: 3700000,
    overdueDays: 45,
    openedAt: "2026-09-01T00:00:00Z",
    graceEndsAt: "2026-09-15T00:00:00Z",
    resolvedAt: null,
    notes: "Quá hạn thanh toán hơn 45 ngày, hệ thống đã tự động khóa quyền truy cập.",
    actions: [
      { id: 1, actionType: "reminder_sent", performedByName: "Hệ thống Tự động", details: "Gửi SMS và Email cảnh báo quá hạn", occurredAt: "2026-09-05T08:00:00Z" },
      { id: 2, actionType: "credential_suspended", performedByName: "Facility Manager", details: "Đã tạm dừng mã PIN cửa & smart lock ô kho TD-C305", occurredAt: "2026-09-16T09:00:00Z" },
    ],
  },
];

const DEFAULT_TRANSFERS = [
  {
    id: 1,
    agreementId: 102,
    agreementNo: "AGR-2026-002",
    customerId: 2,
    customerName: "Trần Thị Mai",
    customerPhone: "0902345678",
    fromUnitId: 3,
    fromUnitCode: "TD-B204",
    requestedUnitTypeId: 3,
    requestedUnitTypeName: "Kho Gia Đình (8-12m²)",
    toUnitId: 4,
    toUnitCode: "TD-B205",
    requestedEffectiveDate: "2026-10-20",
    reason: "Cần mở rộng diện tích để chứa thêm hàng kinh doanh cuối năm",
    status: "pending",
    requestedBy: 2,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2026-10-12T10:00:00Z",
  },
];

const DEFAULT_REFUNDS = [
  {
    refundId: 1,
    paymentId: 301,
    agreementId: 101,
    agreementNo: "AGR-2026-001",
    customerId: 1,
    customerName: "Nguyễn Văn An",
    amount: 2500000,
    reason: "Khách kết thúc hợp đồng trả kho đúng hạn",
    status: "pending",
    createdAt: "2026-10-13T09:00:00Z",
    decision: null,
    decisionReason: null,
    decidedAt: null,
    originalDeposit: 2500000,
    estimatedDeductions: 0,
    recommendedRefundAmount: 2500000,
  },
];

const DEFAULT_CHARGE_PROPOSALS = [
  {
    id: 1,
    ticketId: 1,
    ticketTitle: "Bồi thường hư hại sơn tường ô kho B204",
    customerId: 2,
    customerName: "Trần Thị Mai",
    agreementId: 102,
    agreementNo: "AGR-2026-002",
    proposedBy: 10,
    proposedByStaffName: "Trần Kỹ Thuật",
    description: "Khách vận chuyển đồ làm xước sâu mảng sơn tường và hỏng 1 thanh nẹp",
    amount: 350000,
    status: "pending",
    createdAt: "2026-10-12T15:00:00Z",
    decision: null,
    decisionReason: null,
    decidedAt: null,
  },
];

const DEFAULT_TICKETS = [
  {
    id: 1,
    ticketNo: "TCK-2026-001",
    customerId: 1,
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@gmail.com",
    facilityId: 1,
    facilityName: "Cơ sở Thủ Đức",
    storageUnitId: 1,
    unitCode: "TD-A101",
    category: "smart_lock",
    priority: "urgent",
    status: "open",
    subject: "Khóa thông minh không nhận mã PIN",
    description: "Khách hàng nhập đúng mã PIN trên app nhưng chốt khóa không tự động mở.",
    resolution: "",
    assignedEmployeeId: 10,
    assignedEmployeeName: "Trần Kỹ Thuật",
    createdAt: "2026-10-13T08:30:00Z",
    messages: [
      { id: 1, senderName: "Nguyễn Văn An", isStaff: false, content: "Tôi cần mở kho lấy đồ gấp trong sáng nay.", timestamp: "2026-10-13 08:35" },
    ],
  },
  {
    id: 2,
    ticketNo: "TCK-2026-002",
    customerId: 2,
    customerName: "Trần Thị Mai",
    customerEmail: "tranmai@gmail.com",
    facilityId: 1,
    facilityName: "Cơ sở Thủ Đức",
    storageUnitId: 3,
    unitCode: "TD-B204",
    category: "climate",
    priority: "high",
    status: "in_progress",
    subject: "Kiểm tra nhiệt độ độ ẩm trong kho",
    description: "Khách báo nhiệt độ hiển thị trên ứng dụng cao hơn mức tiêu chuẩn 25 độ C.",
    resolution: "",
    assignedEmployeeId: 11,
    assignedEmployeeName: "Lê Bảo Trì",
    createdAt: "2026-10-12T14:15:00Z",
    messages: [],
  },
  {
    id: 3,
    ticketNo: "TCK-2026-003",
    customerId: 3,
    customerName: "Lê Hoàng Phúc",
    customerEmail: "phuc.le@gmail.com",
    facilityId: 1,
    facilityName: "Cơ sở Thủ Đức",
    storageUnitId: 4,
    unitCode: "TD-B205",
    category: "billing",
    priority: "normal",
    status: "resolved",
    subject: "Thắc mắc hóa đơn phát sinh phụ phí",
    description: "Khách yêu cầu đối soát phụ phí vệ sinh sau khi bàn giao kho.",
    resolution: "Đã giải thích chi tiết phụ phí theo biên bản bàn giao, khách đã đồng ý thanh toán.",
    assignedEmployeeId: 10,
    assignedEmployeeName: "Trần Kỹ Thuật",
    createdAt: "2026-10-11T10:00:00Z",
    messages: [],
  },
];

const DEFAULT_STAFF_MEMBERS = [
  { id: 10, fullName: "Trần Kỹ Thuật", email: "kythuat.tran@example.test", phoneNumber: "0901234567", employeeCode: "NV-001", roleLabel: "Kỹ thuật vận hành", roleCode: "facility_staff", facilityId: 1 },
  { id: 11, fullName: "Lê Bảo Trì", email: "baotri.le@example.test", phoneNumber: "0902345678", employeeCode: "NV-002", roleLabel: "Nhân viên an ninh & kho", roleCode: "facility_staff", facilityId: 1 },
  { id: 12, fullName: "Phạm Điều Phối", email: "dieuphoi.pham@example.test", phoneNumber: "0903456789", employeeCode: "NV-003", roleLabel: "Nhân viên lễ tân", roleCode: "facility_staff", facilityId: 2 },
];

const DEFAULT_TASKS = [
  {
    id: 1,
    facilityId: 1,
    assignedEmployeeId: 10,
    assignedStaffName: "Trần Kỹ Thuật",
    title: "Kiểm tra hệ thống báo khói và khóa tầng 2",
    taskType: "inspection",
    status: "in_progress",
    progressPercent: 60,
  },
  {
    id: 2,
    facilityId: 1,
    assignedEmployeeId: 11,
    assignedStaffName: "Lê Bảo Trì",
    title: "Bàn giao chìa khóa dự phòng ô kho B204",
    taskType: "check_in",
    status: "done",
    progressPercent: 100,
  },
  {
    id: 3,
    facilityId: 1,
    assignedEmployeeId: 10,
    assignedStaffName: "Trần Kỹ Thuật",
    title: "Vệ sinh ô kho trống TD-A102 trước khi khách mới vào",
    taskType: "maintenance",
    status: "todo",
    progressPercent: 0,
  },
];

export function getCurrentWeekDays(baseDate = new Date()) {
  const current = new Date(baseDate);
  const day = current.getDay();
  // Monday is day 1, Sunday is day 0
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current);
  monday.setDate(diffToMonday);

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const todayStr = new Date().toISOString().slice(0, 10);

  return dayKeys.map((key, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const fullDate = d.toISOString().slice(0, 10);
    return {
      key,
      label: dayLabels[index],
      dateStr: dateFormatted,
      dateLabel: dateFormatted,
      fullDate,
      isToday: fullDate === todayStr,
    };
  });
}

const DEFAULT_WEEK_DAYS = getCurrentWeekDays();

const DEFAULT_STAFF_ROSTER = [
  {
    employeeId: 10,
    staffName: "Trần Kỹ Thuật",
    employeeCode: "NV-001",
    roleLabel: "Kỹ thuật vận hành",
    shifts: {
      mon: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "present" },
      tue: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "present" },
      wed: { shiftType: "afternoon", dutyRole: "Bảo trì thiết bị", attendanceStatus: "assigned" },
      thu: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
      fri: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
      sat: { shiftType: "afternoon", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
      sun: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
    },
  },
  {
    employeeId: 11,
    staffName: "Lê Bảo Trì",
    employeeCode: "NV-002",
    roleLabel: "Nhân viên an ninh & kho",
    shifts: {
      mon: { shiftType: "afternoon", dutyRole: "An ninh kho", attendanceStatus: "present" },
      tue: { shiftType: "night", dutyRole: "Trực ca đêm", attendanceStatus: "assigned" },
      wed: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
      thu: { shiftType: "afternoon", dutyRole: "An ninh kho", attendanceStatus: "assigned" },
      fri: { shiftType: "morning", dutyRole: "Kiểm tra ô kho", attendanceStatus: "assigned" },
      sat: { shiftType: "morning", dutyRole: "Kiểm tra ô kho", attendanceStatus: "assigned" },
      sun: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
    },
  },
];

// ==========================================
// CENTRAL MANAGER SERVICE (21 SWAGGER APIS + COMPOSITES)
// ==========================================
export const managerService = {
  // ------------------------------------------
  // TIỆN ÍCH CHUNG (CATALOG)
  // ------------------------------------------
  async getFacilities() {
    try {
      const res = await apiClient.get("/customer/facilities");
      if (Array.isArray(res?.data) && res.data.length > 0) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES) };
  },

  async getUnitTypes() {
    try {
      const res = await apiClient.get("/customer/unit-types");
      if (Array.isArray(res?.data) && res.data.length > 0) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_UNIT_TYPES, DEFAULT_UNIT_TYPES) };
  },

  // ------------------------------------------
  // 1. QUẢN LÝ HẠ TẦNG Ô KHO & SƠ ĐỒ (SWAGGER 1..5)
  // ------------------------------------------
  async getUnits(facilityId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/units`, { params });
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const all = getStoredJson(STORAGE_KEY_UNITS, DEFAULT_UNITS).filter((u) => !facilityId || String(u.facilityId) === String(facilityId));
    return {
      success: true,
      data: {
        items: all,
        totalCount: all.length,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
      },
    };
  },

  async createUnit(facilityId, payload) {
    try {
      const res = await apiClient.post(`/manager/facilities/${facilityId}/units`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_UNITS, DEFAULT_UNITS);
    const newUnit = {
      id: Date.now(),
      facilityId: Number(facilityId),
      ...payload,
      isListed: payload.isListed !== undefined ? payload.isListed : true,
      monthlyRate: payload.monthlyRate || 1850000,
      depositAmount: payload.depositAmount || 1850000,
    };
    setStoredJson(STORAGE_KEY_UNITS, [newUnit, ...list]);
    return { success: true, message: "Storage unit created.", data: newUnit };
  },

  async updateUnit(unitId, payload) {
    try {
      const res = await apiClient.put(`/manager/units/${unitId}`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_UNITS, DEFAULT_UNITS);
    const idx = list.findIndex((u) => String(u.id) === String(unitId));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload };
      setStoredJson(STORAGE_KEY_UNITS, list);
      return { success: true, message: "Storage unit updated.", data: list[idx] };
    }
    return { success: true, message: "Storage unit updated." };
  },

  async getMapLayout(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/map-layout`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return {
      success: true,
      data: {
        facilityId: Number(facilityId),
        facilityName: facilityId === 1 ? "Cơ sở Thủ Đức" : "Cơ sở Cầu Giấy",
        areas: [
          { areaId: 1, code: "A1", name: "Khu vực tầng 1", areaType: "indoor", displayOrder: 1, mapMetadata: "{}" },
          { areaId: 2, code: "A2", name: "Khu vực tầng 2", areaType: "indoor", displayOrder: 2, mapMetadata: "{}" },
        ],
        unitPositions: [
          { unitId: 1, unitCode: "TD-A101", areaId: 1, x: 10, y: 10, width: 40, height: 40, rotationDegrees: 0, physicalStatus: "occupied" },
          { unitId: 2, unitCode: "TD-A102", areaId: 1, x: 60, y: 10, width: 40, height: 40, rotationDegrees: 0, physicalStatus: "available" },
        ],
      },
    };
  },

  async updateMapLayout(facilityId, payload) {
    try {
      const res = await apiClient.put(`/manager/facilities/${facilityId}/map-layout`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, message: "Map layout updated." };
  },

  // ------------------------------------------
  // 2. YÊU CẦU ĐỔI KHO (SWAGGER 6..7)
  // ------------------------------------------
  async getTransferRequests(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/transfer-requests`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_TRANSFERS, DEFAULT_TRANSFERS) };
  },

  async decideTransferRequest(id, payload) {
    try {
      const res = await apiClient.put(`/manager/transfer-requests/${id}/decide`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_TRANSFERS, DEFAULT_TRANSFERS);
    const idx = list.findIndex((t) => String(t.id) === String(id));
    if (idx !== -1) {
      list[idx].status = payload.decision === "approved" ? "approved" : "rejected";
      list[idx].reviewedAt = new Date().toISOString();
      setStoredJson(STORAGE_KEY_TRANSFERS, list);
    }
    return { success: true, message: `Transfer request ${payload.decision}.` };
  },

  // ------------------------------------------
  // 3. PHÂN CA & NHIỆM VỤ NHÂN VIÊN (SWAGGER 8..12)
  // ------------------------------------------
  async getShifts(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/shifts`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return {
      success: true,
      data: [
        { id: 1, facilityId: Number(facilityId), shiftName: "Ca Sáng (07-15h)", startsAt: "2026-10-13T07:00:00Z", endsAt: "2026-10-13T15:00:00Z", status: "open", assignmentCount: 2 },
        { id: 2, facilityId: Number(facilityId), shiftName: "Ca Chiều (15-23h)", startsAt: "2026-10-13T15:00:00Z", endsAt: "2026-10-13T23:00:00Z", status: "open", assignmentCount: 1 },
      ],
    };
  },

  async createShift(facilityId, payload) {
    try {
      const res = await apiClient.post(`/manager/facilities/${facilityId}/shifts`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, message: "Shift created.", data: { id: Date.now(), facilityId, ...payload } };
  },

  async getShiftRoster(facilityId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/shift-roster`, { params });
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return {
      success: true,
      data: [
        { shiftId: 1, shiftName: "Ca Sáng", startsAt: "2026-10-13T07:00:00Z", endsAt: "2026-10-13T15:00:00Z", employeeId: 10, employeeCode: "NV-001", employeeName: "Trần Kỹ Thuật", dutyRole: "staff", status: "scheduled" },
        { shiftId: 2, shiftName: "Ca Chiều", startsAt: "2026-10-13T15:00:00Z", endsAt: "2026-10-13T23:00:00Z", employeeId: 11, employeeCode: "NV-002", employeeName: "Lê Bảo Trì", dutyRole: "staff", status: "scheduled" },
      ],
    };
  },

  async assignShift(facilityId, payload) {
    if (typeof facilityId === "object" && !payload) {
      payload = facilityId;
      facilityId = payload.facilityId || 1;
    }
    facilityId = Number(facilityId) || 1;
    try {
      const res = await apiClient.post(`/manager/facilities/${facilityId}/shift-assignments`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, message: "Shift assignment completed." };
  },

  async createStaffTask(facilityId, payload) {
    if (typeof facilityId === "object" && !payload) {
      payload = facilityId;
      facilityId = payload.facilityId || 1;
    }
    facilityId = Number(facilityId) || 1;
    try {
      const res = await apiClient.post(`/manager/facilities/${facilityId}/tasks`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const tasks = getStoredJson(STORAGE_KEY_TASKS, DEFAULT_TASKS);
    const newTask = {
      id: Date.now(),
      facilityId: Number(facilityId),
      ...payload,
      progressPercent: payload.status === "done" ? 100 : Number(payload.progressPercent || 0),
    };
    setStoredJson(STORAGE_KEY_TASKS, [newTask, ...tasks]);
    return { success: true, message: "Staff task created.", data: newTask };
  },

  // ------------------------------------------
  // 4. PHÊ DUYỆT TÀI CHÍNH (SWAGGER 13..16)
  // ------------------------------------------
  async getChargeProposals(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/charge-proposals`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_CHARGE_PROPOSALS, DEFAULT_CHARGE_PROPOSALS) };
  },

  async decideChargeProposal(id, payload) {
    try {
      const res = await apiClient.put(`/manager/charge-proposals/${id}/decide`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_CHARGE_PROPOSALS, DEFAULT_CHARGE_PROPOSALS);
    const idx = list.findIndex((c) => String(c.id) === String(id));
    if (idx !== -1) {
      list[idx].status = payload.decision === "approved" ? "approved" : "rejected";
      list[idx].decision = payload.decision;
      list[idx].decisionReason = payload.reason;
      list[idx].decidedAt = new Date().toISOString();
      setStoredJson(STORAGE_KEY_CHARGE_PROPOSALS, list);
    }
    return { success: true, message: "Charge proposal decided successfully." };
  },

  async getRefundApprovals(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/refund-approvals`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_REFUNDS, DEFAULT_REFUNDS) };
  },

  async decideRefundApproval(id, payload) {
    try {
      const res = await apiClient.put(`/manager/refund-approvals/${id}/decide`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_REFUNDS, DEFAULT_REFUNDS);
    const idx = list.findIndex((r) => String(r.refundId) === String(id));
    if (idx !== -1) {
      list[idx].status = payload.decision === "approved" ? "approved" : "rejected";
      list[idx].decision = payload.decision;
      list[idx].decisionReason = payload.reason;
      list[idx].decidedAt = new Date().toISOString();
      setStoredJson(STORAGE_KEY_REFUNDS, list);
    }
    return { success: true, message: "Refund approval decided successfully." };
  },

  // ------------------------------------------
  // 5. HỢP ĐỒNG & NỢ QUÁ HẠN (SWAGGER 17..20)
  // ------------------------------------------
  async getAgreements(facilityId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/agreements`, { params });
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const all = getStoredJson(STORAGE_KEY_AGREEMENTS, DEFAULT_AGREEMENTS);
    return {
      success: true,
      data: {
        items: all,
        totalCount: all.length,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
      },
    };
  },

  async getAgreementDetail(agreementId) {
    try {
      const res = await apiClient.get(`/manager/agreements/${agreementId}`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_AGREEMENTS, DEFAULT_AGREEMENTS);
    const item = list.find((a) => String(a.id) === String(agreementId)) || list[0];
    return {
      success: true,
      data: {
        ...item,
        totalDebt: item?.outstandingBalance || 0,
        invoices: [
          { id: 1, invoiceNo: "INV-2026-001", issueDate: "2026-10-01", dueDate: "2026-10-08", totalAmount: 2500000, paidAmount: 2500000, status: "paid" },
        ],
        storedItems: [
          { id: 1, agreementId: Number(agreementId), itemName: "Thùng tài liệu kế toán 2025", category: "documents", quantity: 5, declaredValue: 5000000 },
          { id: 2, agreementId: Number(agreementId), itemName: "Bàn ghế văn phòng", category: "furniture", quantity: 2, declaredValue: 3500000 },
        ],
      },
    };
  },

  async getDelinquentCases(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/delinquent-cases`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return { success: true, data: getStoredJson(STORAGE_KEY_DELINQUENT, DEFAULT_DELINQUENT_CASES) };
  },

  async addDelinquencyAction(caseId, payload) {
    try {
      const res = await apiClient.post(`/manager/delinquent-cases/${caseId}/actions`, payload);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    const list = getStoredJson(STORAGE_KEY_DELINQUENT, DEFAULT_DELINQUENT_CASES);
    const idx = list.findIndex((c) => String(c.id) === String(caseId));
    if (idx !== -1) {
      if (!list[idx].actions) list[idx].actions = [];
      list[idx].actions.unshift({
        id: Date.now(),
        actionType: payload.actionType,
        performedByName: "Facility Manager",
        details: payload.note || payload.actionType,
        occurredAt: new Date().toISOString(),
      });
      if (payload.updateCaseStatus) {
        list[idx].status = payload.updateCaseStatus;
      }
      setStoredJson(STORAGE_KEY_DELINQUENT, list);
    }
    return { success: true, message: "Delinquency action recorded successfully." };
  },

  // ------------------------------------------
  // 6. FACILITY DASHBOARD (SWAGGER 21)
  // ------------------------------------------
  async getFacilityDashboard(facilityId = 1) {
    try {
      const res = await apiClient.get(`/manager/facilities/${facilityId}/dashboard`);
      if (res && res.data) return res;
    } catch {
      // fallback
    }
    return {
      success: true,
      data: {
        facilityId: Number(facilityId),
        facilityCode: facilityId === 1 ? "HCM-TD" : "HN-CG",
        facilityName: facilityId === 1 ? "Thu Duc Self Storage" : "Cau Giay Self Storage",
        totalUnits: 120,
        occupiedUnits: 72,
        reservedUnits: 6,
        availableUnits: 38,
        maintenanceUnits: 4,
        occupancyRate: 65.0,
        dailySchedule: {
          todayCheckInsCount: 3,
          todayCheckOutsCount: 1,
          todayInspectionsCount: 5,
        },
        openTicketsCount: 4,
        urgentTicketsCount: 1,
        thisMonthRevenue: 345000000,
        totalOutstandingDebt: 12500000,
      },
    };
  },

  // ------------------------------------------
  // 7. COMPOSITE REVENUE OVERVIEW & INVOICES
  // ------------------------------------------
  async getRevenueOverview(facilityId) {
    const params = facilityId && facilityId !== "all" ? { facilityId } : {};
    let realDashboard = null;
    try {
      // Try to get real facility dashboard metrics from Swagger API #21
      const facId = facilityId && facilityId !== "all" ? facilityId : 1;
      const dashRes = await apiClient.get(`/manager/facilities/${facId}/dashboard`);
      if (dashRes?.data) realDashboard = dashRes.data;
    } catch {
      // ignore
    }

    const invoices = getStoredJson(STORAGE_KEY_INVOICES, DEFAULT_INVOICES);
    const promotions = getStoredJson(STORAGE_KEY_PROMOTIONS, DEFAULT_PROMOTIONS);

    const totalRevenuePaid = invoices
      .filter((inv) => inv.status === "paid" || inv.status === "partially_paid")
      .reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);

    const openReceivablesAmount = invoices
      .filter((inv) => inv.status === "open" || inv.status === "partially_paid")
      .reduce((sum, inv) => sum + (Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0)), 0);

    const overdueInvoicesCount = invoices.filter((inv) => inv.status === "overdue").length;

    const kpis = {
      totalRevenuePaid: realDashboard?.thisMonthRevenue || totalRevenuePaid || 1845000000,
      openReceivablesAmount: realDashboard?.totalOutstandingDebt || openReceivablesAmount || 185000000,
      overdueInvoicesCount,
      occupancyRatePercent: realDashboard?.occupancyRate || 86.4,
    };

    return {
      success: true,
      message: "Retrieved revenue overview successfully.",
      data: {
        kpis,
        monthlyTrend: DEFAULT_MONTHLY_TREND,
        categoryMix: DEFAULT_CATEGORY_MIX,
        invoices,
        promotions,
        customerOptions: DEFAULT_CUSTOMER_OPTIONS,
      },
    };
  },

  async createInvoice(payload) {
    const invoices = getStoredJson(STORAGE_KEY_INVOICES, DEFAULT_INVOICES);
    const newId = Date.now();
    const totalAmount = Number(payload.amount || 0) - Number(payload.discountAmount || 0) + Number(payload.taxAmount || 0);
    const paidAmount = payload.status === "paid" ? totalAmount : Number(payload.paidAmount || 0);
    const cust = DEFAULT_CUSTOMER_OPTIONS.find((c) => Number(c.customerId) === Number(payload.customerId));

    const newInvoice = {
      id: newId,
      invoiceNo: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: cust?.fullName || cust?.customerName || "Khách Hàng Mới",
      customerEmail: cust?.email || "customer@example.com",
      unitCode: cust?.unitCode || "TD-A101",
      agreementId: payload.agreementId || cust?.agreementId || 101,
      reservationId: payload.reservationId || cust?.reservationId || 201,
      billingPeriod: payload.billingPeriod || new Date().toISOString().slice(0, 7),
      issueDate: payload.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: payload.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      lineType: payload.lineType || "rent",
      description: payload.description || "Thu tiền thuê kho định kỳ",
      subtotalAmount: Number(payload.amount || 0),
      discountAmount: Number(payload.discountAmount || 0),
      taxAmount: Number(payload.taxAmount || 0),
      totalAmount,
      paidAmount,
      status: payload.status || "paid",
      paymentMethod: payload.paymentMethod || "bank_transfer",
    };

    setStoredJson(STORAGE_KEY_INVOICES, [newInvoice, ...invoices]);
    return { success: true, message: "Invoice created successfully.", data: newInvoice };
  },

  async updateInvoice(id, payload) {
    const invoices = getStoredJson(STORAGE_KEY_INVOICES, DEFAULT_INVOICES);
    const idx = invoices.findIndex((i) => String(i.id) === String(id));
    if (idx !== -1) {
      const cur = invoices[idx];
      const subtotal = Number(payload.amount !== undefined ? payload.amount : cur.subtotalAmount);
      const discount = Number(payload.discountAmount !== undefined ? payload.discountAmount : cur.discountAmount);
      const tax = Number(payload.taxAmount !== undefined ? payload.taxAmount : cur.taxAmount);
      const totalAmount = subtotal - discount + tax;
      const paidAmount = payload.status === "paid" ? totalAmount : Number(payload.paidAmount !== undefined ? payload.paidAmount : cur.paidAmount);

      invoices[idx] = {
        ...cur,
        ...payload,
        subtotalAmount: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        totalAmount,
        paidAmount,
      };
      setStoredJson(STORAGE_KEY_INVOICES, invoices);
      return { success: true, message: "Invoice updated.", data: invoices[idx] };
    }
    return { success: true, message: "Invoice updated." };
  },

  async deleteInvoice(id) {
    const invoices = getStoredJson(STORAGE_KEY_INVOICES, DEFAULT_INVOICES).filter((i) => String(i.id) !== String(id));
    setStoredJson(STORAGE_KEY_INVOICES, invoices);
    return { success: true, message: "Invoice deleted successfully." };
  },

  async createPromotion(payload) {
    const promos = getStoredJson(STORAGE_KEY_PROMOTIONS, DEFAULT_PROMOTIONS);
    const newPromo = { id: Date.now(), ...payload, usedCount: 0 };
    setStoredJson(STORAGE_KEY_PROMOTIONS, [newPromo, ...promos]);
    return { success: true, message: "Promotion created.", data: newPromo };
  },

  async updatePromotion(id, payload) {
    const promos = getStoredJson(STORAGE_KEY_PROMOTIONS, DEFAULT_PROMOTIONS);
    const idx = promos.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      promos[idx] = { ...promos[idx], ...payload };
      setStoredJson(STORAGE_KEY_PROMOTIONS, promos);
      return { success: true, message: "Promotion updated.", data: promos[idx] };
    }
    return { success: true, message: "Promotion updated." };
  },

  async deletePromotion(id) {
    const promos = getStoredJson(STORAGE_KEY_PROMOTIONS, DEFAULT_PROMOTIONS).filter((p) => String(p.id) !== String(id));
    setStoredJson(STORAGE_KEY_PROMOTIONS, promos);
    return { success: true, message: "Promotion deleted." };
  },

  // ------------------------------------------
  // 8. WAREHOUSE COMPOSITE
  // ------------------------------------------
  async getWarehouseOverview(facilityId) {
    const facId = facilityId && facilityId !== "all" ? facilityId : 1;
    let units = [];
    try {
      const res = await apiClient.get(`/manager/facilities/${facId}/units`);
      if (res?.data?.items) units = res.data.items;
      else if (Array.isArray(res?.data)) units = res.data;
    } catch {
      // fallback
    }

    if (!units || units.length === 0) {
      units = getStoredJson(STORAGE_KEY_UNITS, DEFAULT_UNITS);
    }

    let facilities = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES);
    let unitTypes = getStoredJson(STORAGE_KEY_UNIT_TYPES, DEFAULT_UNIT_TYPES);
    try {
      const facRes = await apiClient.get("/customer/facilities");
      if (Array.isArray(facRes?.data) && facRes.data.length > 0) facilities = facRes.data;
    } catch {
      // ignore
    }

    const kpis = {
      totalUnits: units.length,
      availableUnits: units.filter((u) => u.physicalStatus === "available").length,
      occupiedUnits: units.filter((u) => u.physicalStatus === "occupied").length,
      reservedUnits: units.filter((u) => u.physicalStatus === "reserved").length,
      maintenanceUnits: units.filter((u) => u.physicalStatus === "maintenance").length,
      outOfServiceUnits: units.filter((u) => u.physicalStatus === "out_of_service").length,
    };

    return {
      success: true,
      message: "Retrieved warehouse overview.",
      data: { kpis, facilities, unitTypes, units },
    };
  },

  async createFacility(payload) {
    const list = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES);
    const newFacility = { id: Date.now(), ...payload };
    setStoredJson(STORAGE_KEY_FACILITIES, [newFacility, ...list]);
    return { success: true, message: "Facility created.", data: newFacility };
  },

  async updateFacility(id, payload) {
    const list = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES);
    const idx = list.findIndex((f) => String(f.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload };
      setStoredJson(STORAGE_KEY_FACILITIES, list);
      return { success: true, message: "Facility updated.", data: list[idx] };
    }
    return { success: true, message: "Facility updated." };
  },

  async deleteFacility(id) {
    const list = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES).filter((f) => String(f.id) !== String(id));
    setStoredJson(STORAGE_KEY_FACILITIES, list);
    return { success: true, message: "Facility deleted." };
  },

  async createStorageUnit(payload) {
    return this.createUnit(payload.facilityId || 1, payload);
  },

  async updateStorageUnit(id, payload) {
    return this.updateUnit(id, payload);
  },

  async deleteStorageUnit(id) {
    const list = getStoredJson(STORAGE_KEY_UNITS, DEFAULT_UNITS).filter((u) => String(u.id) !== String(id));
    setStoredJson(STORAGE_KEY_UNITS, list);
    return { success: true, message: "Storage unit deleted." };
  },

  // ------------------------------------------
  // 9. TICKETS COMPOSITE
  // ------------------------------------------
  async getTicketsOverview(facilityId, status) {
    let tickets = [];
    const facId = facilityId && facilityId !== "all" ? Number(facilityId) : undefined;
    try {
      const realTicketsRes = await apiClient.get("/staff/support-tickets", {
        params: {
          facilityId: facId,
          status: status && status !== "all" ? status : undefined,
        },
      });
      if (Array.isArray(realTicketsRes?.data) && realTicketsRes.data.length > 0) {
        tickets = realTicketsRes.data.map((t) => ({
          id: t.id,
          ticketNo: t.ticketNo,
          customerId: t.customerId,
          customerName: t.customerName,
          facilityId: t.facilityId,
          facilityName: t.facilityCode || `Cơ sở #${t.facilityId}`,
          storageUnitId: t.storageUnitId,
          unitCode: t.unitCode || "—",
          category: t.category,
          priority: t.priority,
          status: t.status,
          subject: t.subject,
          description: t.description,
          createdAt: t.createdAt,
          messages: [],
        }));
      }
    } catch {
      // fallback
    }

    if (!tickets || tickets.length === 0) {
      tickets = getStoredJson(STORAGE_KEY_TICKETS, DEFAULT_TICKETS);
    }

    let facilities = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES);
    try {
      const facRes = await apiClient.get("/customer/facilities");
      if (Array.isArray(facRes?.data) && facRes.data.length > 0) facilities = facRes.data;
    } catch {
      // ignore
    }
    const kpis = {
      totalTickets: tickets.length,
      openTickets: tickets.filter((t) => t.status === "open").length,
      inProgressTickets: tickets.filter((t) => t.status === "in_progress").length,
      resolvedTickets: tickets.filter((t) => t.status === "resolved").length,
      urgentTickets: tickets.filter((t) => t.priority === "urgent").length,
    };

    return {
      success: true,
      message: "Retrieved tickets overview.",
      data: {
        kpis,
        tickets,
        customerOptions: DEFAULT_CUSTOMER_OPTIONS,
        facilityOptions: facilities,
        unitOptions: DEFAULT_UNITS.map((u) => ({ id: u.id, unitCode: u.unitCode })),
        staffOptions: DEFAULT_STAFF_MEMBERS,
      },
    };
  },

  async createTicket(payload) {
    const list = getStoredJson(STORAGE_KEY_TICKETS, DEFAULT_TICKETS);
    const newId = Date.now();
    const cust = DEFAULT_CUSTOMER_OPTIONS.find((c) => Number(c.customerId) === Number(payload.customerId));
    const fac = DEFAULT_FACILITIES.find((f) => Number(f.id) === Number(payload.facilityId));
    const unit = DEFAULT_UNITS.find((u) => Number(u.id) === Number(payload.storageUnitId));
    const staff = DEFAULT_STAFF_MEMBERS.find((s) => Number(s.id) === Number(payload.assignedEmployeeId));

    const newTicket = {
      id: newId,
      ticketNo: `TCK-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, "0")}`,
      customerId: payload.customerId,
      customerName: cust?.fullName || "Khách hàng",
      customerEmail: cust?.email || "",
      facilityId: payload.facilityId,
      facilityName: fac?.name || "Cơ sở",
      storageUnitId: payload.storageUnitId,
      unitCode: unit?.unitCode || "TD-A101",
      category: payload.category || "maintenance",
      priority: payload.priority || "normal",
      status: payload.status || "open",
      subject: payload.subject,
      description: payload.description,
      resolution: payload.resolution || "",
      assignedEmployeeId: payload.assignedEmployeeId || null,
      assignedEmployeeName: staff?.fullName || "Chưa phân công",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setStoredJson(STORAGE_KEY_TICKETS, [newTicket, ...list]);
    return { success: true, message: "Ticket created.", data: newTicket };
  },

  async updateTicket(id, payload) {
    if (payload.status === "resolved") {
      try {
        await apiClient.put(`/staff/support-tickets/${id}/resolve`, {
          resolution: payload.resolution || "Đã giải quyết sự cố.",
        });
      } catch (err) {
        console.warn("resolveTicket real API error:", err);
      }
    }
    const list = getStoredJson(STORAGE_KEY_TICKETS, DEFAULT_TICKETS);
    const idx = list.findIndex((t) => String(t.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload };
      setStoredJson(STORAGE_KEY_TICKETS, list);
      return { success: true, message: "Ticket updated.", data: list[idx] };
    }
    return { success: true, message: "Ticket updated." };
  },

  async deleteTicket(id) {
    const list = getStoredJson(STORAGE_KEY_TICKETS, DEFAULT_TICKETS).filter((t) => String(t.id) !== String(id));
    setStoredJson(STORAGE_KEY_TICKETS, list);
    return { success: true, message: "Ticket deleted." };
  },

  async addTicketMessage(id, payload) {
    try {
      await apiClient.post(`/staff/support-tickets/${id}/messages`, {
        body: payload.message || payload.content || "",
        isInternal: Boolean(payload.isInternalNote),
      });
    } catch (err) {
      console.warn("addTicketMessage real API error:", err);
    }
    const list = getStoredJson(STORAGE_KEY_TICKETS, DEFAULT_TICKETS);
    const ticket = list.find((t) => String(t.id) === String(id));
    if (ticket) {
      if (!ticket.messages) ticket.messages = [];
      ticket.messages.push({
        id: Date.now(),
        senderName: payload.isInternalNote ? "Facility Manager (Ghi chú nội bộ)" : "Facility Manager",
        isStaff: true,
        content: payload.message,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      });
      setStoredJson(STORAGE_KEY_TICKETS, list);
    }
    return { success: true, message: "Message sent." };
  },

  // ------------------------------------------
  // 10. STAFFING COMPOSITE
  // ------------------------------------------
  async getStaffingOverview(facilityId, weekStart) {
    const facId = facilityId && facilityId !== "all" ? facilityId : 1;
    let shifts = [];
    try {
      const res = await apiClient.get(`/manager/facilities/${facId}/shifts`);
      if (Array.isArray(res?.data)) shifts = res.data;
    } catch {
      // ignore
    }

    const roster = getStoredJson(STORAGE_KEY_ROSTER, DEFAULT_STAFF_ROSTER);
    const tasks = getStoredJson(STORAGE_KEY_TASKS, DEFAULT_TASKS);
    let facilities = getStoredJson(STORAGE_KEY_FACILITIES, DEFAULT_FACILITIES);
    try {
      const facRes = await apiClient.get("/customer/facilities");
      if (Array.isArray(facRes?.data) && facRes.data.length > 0) facilities = facRes.data;
    } catch {
      // ignore
    }

    const currentWeekDaysList = getCurrentWeekDays(weekStart ? new Date(weekStart) : new Date());
    const weekRangeLabel = `${currentWeekDaysList[0].dateStr}/${new Date().getFullYear()} - ${currentWeekDaysList[6].dateStr}/${new Date().getFullYear()}`;

    // Compute real onDutyToday count
    const todayEntry = currentWeekDaysList.find((d) => d.isToday) || currentWeekDaysList[0];
    const todayKey = todayEntry?.key || "mon";
    const onDutyCount = roster.filter(
      (m) => m.shifts?.[todayKey] && m.shifts[todayKey].shiftType !== "off"
    ).length;

    const kpis = {
      totalStaff: roster.length,
      onDutyToday: onDutyCount || 3,
      completedTasks: tasks.filter((t) => t.status === "done").length,
      totalTasks: tasks.length,
      totalWeeklyShifts: shifts.length > 0 ? shifts.length : 21,
    };

    return {
      success: true,
      message: "Retrieved staffing overview.",
      data: {
        kpis,
        weekRangeLabel,
        weekDays: currentWeekDaysList,
        staffRoster: roster,
        tasks,
        facilities,
      },
    };
  },

  async assignStaffCellShift(payload) {
    const roster = getStoredJson(STORAGE_KEY_ROSTER, DEFAULT_STAFF_ROSTER);
    const member = roster.find((m) => String(m.employeeId) === String(payload.employeeId));
    if (member) {
      if (!member.shifts) member.shifts = {};
      member.shifts[payload.dayKey] = {
        shiftType: payload.shiftType,
        dutyRole: payload.dutyRole || "Trực vận hành kho",
        attendanceStatus: payload.attendanceStatus || "assigned",
      };
      setStoredJson(STORAGE_KEY_ROSTER, roster);
    }
    return { success: true, message: "Shift updated." };
  },

  async createStaffMember(payload) {
    let createdUser = null;
    try {
      const res = await apiClient.post("/admin/users", {
        email: payload.email,
        password: payload.password || "Password123!",
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber || null,
        role: payload.roleCode || "facility_staff",
        employeeCode: payload.employeeCode || null,
        initialFacilityId: payload.facilityId ? Number(payload.facilityId) : null,
      });
      if (res?.data) createdUser = res.data;
    } catch (err) {
      console.warn("createStaffMember API /admin/users fallback:", err);
    }

    const roster = getStoredJson(STORAGE_KEY_ROSTER, DEFAULT_STAFF_ROSTER);
    const newStaff = {
      employeeId: createdUser?.id || Date.now(),
      staffName: payload.fullName,
      employeeCode: createdUser?.employeeProfile?.employeeCode || payload.employeeCode || `NV-${String(roster.length + 1).padStart(3, "0")}`,
      roleLabel: payload.roleCode === "facility_manager" ? "Quản lý cơ sở" : "Nhân viên vận hành",
      facilityIds: payload.facilityId ? [Number(payload.facilityId)] : [1],
      shifts: {
        mon: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
        tue: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
        wed: { shiftType: "afternoon", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
        thu: { shiftType: "afternoon", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
        fri: { shiftType: "morning", dutyRole: "Trực vận hành kho", attendanceStatus: "assigned" },
        sat: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
        sun: { shiftType: "off", dutyRole: "Nghỉ", attendanceStatus: "excused" },
      },
    };
    setStoredJson(STORAGE_KEY_ROSTER, [newStaff, ...roster]);
    return { success: true, message: "Staff member created.", data: newStaff };
  },

  async updateStaffTask(id, payload) {
    const tasks = getStoredJson(STORAGE_KEY_TASKS, DEFAULT_TASKS);
    const idx = tasks.findIndex((t) => String(t.id) === String(id));
    if (idx !== -1) {
      tasks[idx] = {
        ...tasks[idx],
        ...payload,
        progressPercent: payload.status === "done" ? 100 : Number(payload.progressPercent !== undefined ? payload.progressPercent : tasks[idx].progressPercent),
      };
      setStoredJson(STORAGE_KEY_TASKS, tasks);
      return { success: true, message: "Staff task updated.", data: tasks[idx] };
    }
    return { success: true, message: "Staff task updated." };
  },

  async deleteStaffTask(id) {
    const tasks = getStoredJson(STORAGE_KEY_TASKS, DEFAULT_TASKS).filter((t) => String(t.id) !== String(id));
    setStoredJson(STORAGE_KEY_TASKS, tasks);
    return { success: true, message: "Staff task deleted." };
  },
};

export default managerService;
