import { useEffect, useMemo, useState } from "react";
import rentalService from "../api/rentalService";

// Application layer: encapsulates CustomerDashboard ("Kho của tôi") page state and BE API wiring.
export function useCustomerDashboard() {

  // Real hợp đồng thuê kho của khách hàng (backend: GET /customer/rentals)
  const [rentals, setRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [rentalsError, setRentalsError] = useState("");

  // Map credentials cho từng hợp đồng: { [agreementId]: AccessCredentialDto }
  const [credentialsMap, setCredentialsMap] = useState({});
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  // Trạng thái ẩn/hiện mã PIN cho từng kho: { [agreementId]: boolean }
  const [showPinMap, setShowPinMap] = useState({});

  // Trạng thái phản hồi sao chép PIN: { [agreementId]: boolean }
  const [copyFeedbackMap, setCopyFeedbackMap] = useState({});

  // Tải danh sách hợp đồng thuê
  useEffect(() => {
    let active = true;
    setRentalsLoading(true);
    setRentalsError("");
    rentalService
      .getMyRentals()
      .then((data) => {
        if (active) setRentals(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setRentalsError(err?.message || "Không thể tải danh sách kho đang thuê từ hệ thống.");
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeRentals = useMemo(
    () => rentals.filter((r) => (r.status || "").toLowerCase() !== "ended"),
    [rentals]
  );
  const primaryRental = activeRentals[0] || null;

  // Gọi đồng thời API lấy mã PIN cho TẤT CẢ các kho mà khách hàng đang sở hữu
  useEffect(() => {
    let active = true;
    if (activeRentals.length > 0) {
      setCredentialsLoading(true);
      Promise.all(
        activeRentals.map((r) =>
          rentalService
            .getAccessCredentials(r.agreementId)
            .then((cred) => ({ agreementId: r.agreementId, cred }))
            .catch((err) => {
              console.warn(`Lỗi khi tải mã PIN cho kho #${r.unitCode}:`, err);
              return { agreementId: r.agreementId, cred: null };
            })
        )
      )
        .then((results) => {
          if (!active) return;
          const nextMap = {};
          results.forEach(({ agreementId, cred }) => {
            if (cred) nextMap[agreementId] = cred;
          });
          setCredentialsMap(nextMap);
        })
        .finally(() => {
          if (active) setCredentialsLoading(false);
        });
    } else {
      setCredentialsMap({});
    }

    return () => {
      active = false;
    };
  }, [activeRentals]);

  const toggleShowPin = (agreementId) => {
    setShowPinMap((prev) => ({
      ...prev,
      [agreementId]: !prev[agreementId],
    }));
  };

  const copyPinToClipboard = (pin, agreementId) => {
    if (!pin) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopyFeedbackMap((prev) => ({ ...prev, [agreementId]: true }));
      setTimeout(() => {
        setCopyFeedbackMap((prev) => ({ ...prev, [agreementId]: false }));
      }, 2000);
    }
  };

  // Đổi mã PIN trực tiếp qua API Backend PUT /customer/rentals/{agreementId}/change-pin
  const handleChangePin = async (agreementId, newPin) => {
    const res = await rentalService.changePin(agreementId, { newPin });
    setCredentialsMap((prev) => ({
      ...prev,
      [agreementId]: prev[agreementId]
        ? { ...prev[agreementId], keypadPin: newPin }
        : { agreementId, keypadPin: newPin },
    }));
    return res;
  };

  return {
    rentals,
    activeRentals,
    primaryRental,
    credentialsMap,
    credentialsLoading,
    rentalsLoading,
    rentalsError,
    showPinMap,
    toggleShowPin,
    copyFeedbackMap,
    copyPinToClipboard,
    handleChangePin,
  };
}
