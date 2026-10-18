import { createContext, useCallback, useContext, useEffect, useState } from "react";
import managerService from "../api/managerService";

const STORAGE_KEY = "managerActiveFacilityId";
const ManagerFacilityContext = createContext(null);

// Manager lấy danh sách kho được phân công quản lý từ API /api/manager/my-facilities.
// Đảm bảo không truy cập nhầm kho không có quyền và không bị lỗi NotAssignedToFacility.
export function ManagerFacilityProvider({ children }) {
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityIdState] = useState(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setFacilityId = useCallback((id) => {
    setFacilityIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadFacilities() {
      setLoading(true);
      setError("");
      try {
        const list = await managerService.getMyFacilities();
        if (cancelled) return;
        setFacilities(list);
        if (!list || list.length === 0) {
          setError("Tài khoản của bạn chưa được phân công quản lý cơ sở kho nào. Vui lòng liên hệ Quản trị viên.");
          setFacilityIdState(null);
          return;
        }
        setFacilityIdState((current) => {
          if (current && list.some((facility) => facility.id === current)) return current;
          const fallback = list[0]?.id ?? null;
          if (fallback) localStorage.setItem(STORAGE_KEY, String(fallback));
          return fallback;
        });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải danh sách kho được phân công.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFacilities();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFacility = facilities.find((facility) => facility.id === facilityId) || null;

  const value = { facilities, facilityId, setFacilityId, activeFacility, loading, error };

  return <ManagerFacilityContext.Provider value={value}>{children}</ManagerFacilityContext.Provider>;
}

export function useManagerFacility() {
  const context = useContext(ManagerFacilityContext);
  if (!context) {
    throw new Error("useManagerFacility must be used within a ManagerFacilityProvider");
  }
  return context;
}

export default ManagerFacilityContext;
