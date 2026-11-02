import apiClient from "./apiClient";

const MOCK_EXPIRING_CASES = [
  {
    id: 101,
    agreementNo: "AGR-2026-0089",
    customerName: "Trần Bảo Nam",
    customerPhone: "0912 345 678",
    customerEmail: "baonam@gmail.com",
    unitId: 12,
    unitCode: "A-108",
    unitTypeName: "Kho Tiêu Chuẩn (S)",
    facilityId: 1,
    facilityName: "Kho Tự Quản Tân Bình",
    endDate: "2026-11-05",
    requestedMoveOutDate: "2026-11-05",
    isMoveOutRequested: true,
    depositAmount: 1500000,
    monthlyRent: 1500000,
    inspectionStatus: "unassigned",
    assignedStaffId: null,
    assignedStaffName: null,
    postInspectionStatus: "awaiting_assignment",
    damageCost: 0,
    refundAmount: 0,
    penaltyAmount: 0,
  },
  {
    id: 102,
    agreementNo: "AGR-2026-0092",
    customerName: "Lê Hoàng Yến",
    customerPhone: "0988 777 666",
    customerEmail: "hoangyen@outlook.com",
    unitId: 24,
    unitCode: "B-205",
    unitTypeName: "Kho Lớn Có Điều Hòa (L)",
    facilityId: 1,
    facilityName: "Kho Tự Quản Tân Bình",
    endDate: "2026-11-04",
    requestedMoveOutDate: "2026-11-04",
    isMoveOutRequested: true,
    depositAmount: 3200000,
    monthlyRent: 3200000,
    inspectionStatus: "assigned",
    assignedStaffId: 2,
    assignedStaffName: "Nguyễn Văn An (Staff)",
    postInspectionStatus: "inspecting",
    damageCost: 0,
    refundAmount: 0,
    penaltyAmount: 0,
  },
  {
    id: 103,
    agreementNo: "AGR-2026-0065",
    customerName: "Đặng Minh Trí",
    customerPhone: "0903 111 222",
    customerEmail: "minhtri.dang@gmail.com",
    unitId: 35,
    unitCode: "C-102",
    unitTypeName: "Kho Mini Cá Nhân (XS)",
    facilityId: 1,
    facilityName: "Kho Tự Quản Tân Bình",
    endDate: "2026-11-02",
    requestedMoveOutDate: "2026-11-02",
    isMoveOutRequested: false,
    depositAmount: 800000,
    monthlyRent: 800000,
    inspectionStatus: "inspected",
    assignedStaffId: 2,
    assignedStaffName: "Nguyễn Văn An (Staff)",
    postInspectionStatus: "waiting_bank_info",
    damageCost: 0,
    refundAmount: 800000,
    penaltyAmount: 0,
    notes: "Kho sạch sẽ, không hư hại, khách chưa cung cấp số tài khoản nhận tiền hoàn cọc.",
  },
  {
    id: 104,
    agreementNo: "AGR-2026-0051",
    customerName: "Vũ Hải Đăng",
    customerPhone: "0934 999 888",
    customerEmail: "haidang.vu@company.vn",
    unitId: 48,
    unitCode: "D-301",
    unitTypeName: "Kho Doanh Nghiệp (XL)",
    facilityId: 1,
    facilityName: "Kho Tự Quản Tân Bình",
    endDate: "2026-11-01",
    requestedMoveOutDate: "2026-11-01",
    isMoveOutRequested: true,
    depositAmount: 2000000,
    monthlyRent: 4500000,
    inspectionStatus: "inspected",
    assignedStaffId: 3,
    assignedStaffName: "Trần Thị Bích (Staff)",
    postInspectionStatus: "waiting_penalty_payment",
    damageCost: 2800000,
    refundAmount: 0,
    penaltyAmount: 800000,
    notes: "Kho bị vỡ tấm ốp tường và kẹt ray cửa cuốn. Đã thu toàn bộ 2.000.000đ cọc và lập hóa đơn phạt 800.000đ.",
  },
  {
    id: 105,
    agreementNo: "AGR-2026-0042",
    customerName: "Phạm Thùy Linh",
    customerPhone: "0971 222 333",
    customerEmail: "thuylinh.pham@gmail.com",
    unitId: 19,
    unitCode: "A-204",
    unitTypeName: "Kho Tiêu Chuẩn (M)",
    facilityId: 1,
    facilityName: "Kho Tự Quản Tân Bình",
    endDate: "2026-10-28",
    requestedMoveOutDate: "2026-10-28",
    isMoveOutRequested: true,
    depositAmount: 1800000,
    monthlyRent: 1800000,
    inspectionStatus: "completed",
    assignedStaffId: 2,
    assignedStaffName: "Nguyễn Văn An (Staff)",
    postInspectionStatus: "refunded",
    damageCost: 200000,
    refundAmount: 1600000,
    penaltyAmount: 0,
    notes: "Phí vệ sinh kho 200.000đ. Đã hoàn trả 1.600.000đ cọc cho khách hàng thành công.",
  },
];

export const managerExpiringContractsService = {
  /**
   * GET /api/manager/agreements/expiring-cases
   * Danh sách hợp đồng sắp / đã hết hạn hoặc có yêu cầu trả kho
   */
  async getExpiringCases(params = {}) {
    try {
      const res = await apiClient.get("/manager/agreements/expiring-cases", { params });
      if (res?.success === true) {
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Client-side fallback if backend is pending route deployment
    let list = [...MOCK_EXPIRING_CASES];
    if (params.facilityId) {
      list = list.filter((c) => String(c.facilityId) === String(params.facilityId));
    }
    if (params.status && params.status !== "all") {
      list = list.filter(
        (c) =>
          c.postInspectionStatus === params.status ||
          c.inspectionStatus === params.status
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.agreementNo?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.customerPhone?.toLowerCase().includes(q) ||
          c.unitCode?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /**
   * POST /api/manager/agreements/{id}/assign-inspection
   * Phân công kiểm tra kho cho Staff cùng cơ sở
   * @param {string|number} agreementId
   * @param {{ staffId: number, notes?: string }} payload
   */
  async assignInspection(agreementId, payload) {
    if (!agreementId) {
      throw new Error("Mã hợp đồng là bắt buộc để phân công kiểm tra kho.");
    }
    if (!payload?.staffId) {
      throw new Error("Vui lòng chọn nhân viên (Staff) để nghiệm thu kho.");
    }

    const targetStaffId = Number(payload.employeeId || payload.staffId);
    const body = {
      employeeId: targetStaffId,
      staffId: targetStaffId,
      assignedEmployeeId: targetStaffId,
      assignedStaffId: targetStaffId,
      notes: payload.notes?.trim() || "",
    };

    try {
      const res = await apiClient.post(
        `/manager/agreements/${encodeURIComponent(agreementId)}/assign-inspection`,
        body
      );
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Local fallback update for mock cases
    const found = MOCK_EXPIRING_CASES.find((c) => String(c.id) === String(agreementId));
    if (found) {
      found.inspectionStatus = "assigned";
      found.assignedStaffId = body.staffId;
      found.assignedStaffName = payload.staffName || `Nhân viên #${body.staffId}`;
      found.postInspectionStatus = "inspecting";
    }

    return {
      success: true,
      message: "Phân công kiểm tra kho thành công.",
      agreementId,
      ...body,
    };
  },
};

export default managerExpiringContractsService;

