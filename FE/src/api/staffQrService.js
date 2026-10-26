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
   * @param {object} payload
   */
  async confirmAction(payload) {
    const response = await apiClient.post("/staff/qr/confirm-action", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to confirm QR action.");
    }
    return response.data;
  },
};

export default staffQrService;
