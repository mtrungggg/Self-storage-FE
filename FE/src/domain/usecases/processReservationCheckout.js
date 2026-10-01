// Xơ đồ logic nghiệp vụ cho Flow 1: Bước 5 & Bước 6
export function processReservationCheckout(reservationData, paymentMethod) {
  if (!reservationData || !reservationData.unitId || !reservationData.totalAmount) {
    throw new Error("Thông tin đặt chỗ không hợp lệ.");
  }
  if (!paymentMethod) {
    throw new Error("Vui lòng chọn phương thức thanh toán trực tuyến.");
  }

  // Logic nghiệp vụ xử lý sau khi thanh toán thành công
  const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const reservationCode = `VS-RES-${randomCode}`;

  return {
    success: true,
    transactionId,
    reservationCode,
    paymentMethod,
    paidAmount: reservationData.totalAmount,
    status: "confirmed",
    checkinSchedule: {
      appointmentDate: reservationData.startDate || "2026-10-15",
      timeSlot: "09:00 - 11:00 (Ca Sáng)",
      hubLocation: reservationData.hubName || "Hub #04 - Quận 7"
    },
    notificationStatus: {
      emailSent: true,
      smsSent: true,
      recipient: reservationData.customerEmail || "customer@vaultspace.vn"
    }
  };
}