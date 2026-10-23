import apiClient from "./apiClient";

const staffQrService = {
  async verifyQr(qrCode) {
    const response = await apiClient.post("/staff/qr/verify", { qrCode });
    if (response?.success !== true) {
      throw new Error(response?.message || "Invalid or unrecognized QR code.");
    }
    return response.data;
  },

  async confirmQrAction(payload) {
    const response = await apiClient.post("/staff/qr/confirm-action", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to confirm action.");
    }
    return response.data;
  },
};

export default staffQrService;
