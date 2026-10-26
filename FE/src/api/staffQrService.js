import apiClient from "./apiClient";

const staffQrService = {
  /**
   * STT 7: Quét QR nhận diện: Check-in, Transfer Out/In, Move Out, Ra vào
   * POST /api/staff/qr/verify
   * @param {{ qrCode: string }} payload
   */
  async verify(payload) {
    const body = typeof payload === "string" ? { qrCode: payload } : payload;
    const response = await apiClient.post("/staff/qr/verify", body);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to verify QR code.");
    }
    return response.data;
  },

  /**
   * STT 8: Xác nhận hành động QR (kích hoạt kho, dọn kho, nhận kho chuyển, trả kho)
   * POST /api/staff/qr/confirm-action
   * @param {{ actionType: string, reservationId?: number, agreementId?: number, transferRequestId?: number, moveOutId?: number, unitId?: number, notes?: string }} payload
   */
  async confirmAction({ actionType, reservationId, agreementId, transferRequestId, moveOutId, unitId, notes }) {
    const body = {
      actionType: actionType || "",
      reservationId: reservationId ? Number(reservationId) : 0,
      agreementId: agreementId ? Number(agreementId) : 0,
      transferRequestId: transferRequestId ? Number(transferRequestId) : 0,
      moveOutId: moveOutId ? Number(moveOutId) : 0,
      unitId: unitId ? Number(unitId) : 0,
      notes: notes?.trim() || "",
    };
    const response = await apiClient.post("/staff/qr/confirm-action", body);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to confirm QR action.");
    }
    return response.data;
  },
};

export default staffQrService;
