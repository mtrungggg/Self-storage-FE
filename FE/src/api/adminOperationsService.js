import apiClient from "./apiClient";

// Wraps /api/operations/* (OperationsController) for Business Operations Manager & System Administrator.
const adminOperationsService = {
  // ----- Facilities -----
  async getFacilities({ Search, Status, PageNumber = 1, PageSize = 50 } = {}) {
    const params = { PageNumber, PageSize };
    if (Search) params.Search = Search;
    if (Status) params.Status = Status;
    const response = await apiClient.get("/operations/facilities", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải danh sách kho.");
    if (!Array.isArray(response.data?.items)) throw new Error("Danh sách kho trả về không hợp lệ.");
    return response.data;
  },
  async createFacility(payload) {
    const response = await apiClient.post("/operations/facilities", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tạo kho mới.");
    return response.data;
  },
  async updateFacility(id, payload) {
    const response = await apiClient.put(`/operations/facilities/${encodeURIComponent(id)}`, { ...payload, id });
    if (response?.success !== true) throw new Error(response?.message || "Không thể cập nhật kho.");
    return response.data;
  },

  // ----- Pricing rates -----
  async getRates({ FacilityId, UnitTypeId, PageNumber = 1, PageSize = 100 } = {}) {
    const params = { PageNumber, PageSize };
    if (FacilityId) params.FacilityId = FacilityId;
    if (UnitTypeId) params.UnitTypeId = UnitTypeId;
    const response = await apiClient.get("/operations/pricing/rates", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải bảng giá.");
    if (!Array.isArray(response.data?.items)) throw new Error("Bảng giá trả về không hợp lệ.");
    return response.data;
  },
  async upsertRate(payload) {
    const response = await apiClient.put("/operations/pricing/rates", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể lưu bảng giá.");
    return response.data;
  },

  // ----- Fees -----
  async getFees({ FacilityId, GlobalOnly, Search, FeeType, IsActive, PageNumber = 1, PageSize = 100 } = {}) {
    const params = { PageNumber, PageSize };
    if (FacilityId) params.FacilityId = FacilityId;
    if (GlobalOnly) params.GlobalOnly = GlobalOnly;
    if (Search) params.Search = Search;
    if (FeeType) params.FeeType = FeeType;
    if (IsActive != null) params.IsActive = IsActive;
    const response = await apiClient.get("/operations/pricing/fees", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải phí dịch vụ.");
    if (!Array.isArray(response.data?.items)) throw new Error("Danh sách phí trả về không hợp lệ.");
    return response.data;
  },
  async upsertFee(payload) {
    const response = await apiClient.put("/operations/pricing/fees", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể lưu phí dịch vụ.");
    return response.data;
  },

  // ----- Promotions -----
  async getPromotions({ Search, DiscountType, IsActive, PageNumber = 1, PageSize = 50 } = {}) {
    const params = { PageNumber, PageSize };
    if (Search) params.Search = Search;
    if (DiscountType) params.DiscountType = DiscountType;
    if (IsActive != null) params.IsActive = IsActive;
    const response = await apiClient.get("/operations/promotions", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải danh sách khuyến mãi.");
    if (!Array.isArray(response.data?.items)) throw new Error("Danh sách khuyến mãi trả về không hợp lệ.");
    return response.data;
  },
  async createPromotion(payload) {
    const response = await apiClient.post("/operations/promotions", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tạo khuyến mãi.");
    return response.data;
  },
  async updatePromotionStatus(id, isActive) {
    const response = await apiClient.put(`/operations/promotions/${encodeURIComponent(id)}/status`, { isActive });
    if (response?.success !== true) throw new Error(response?.message || "Không thể cập nhật trạng thái khuyến mãi.");
    return response.data;
  },
};

export default adminOperationsService;
