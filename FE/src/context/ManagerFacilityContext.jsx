import { createContext, useCallback, useContext, useEffect, useState } from "react";
import managerService from "../api/managerService";
import operationsService from "../api/operationsService";
import { useAuth } from "./AuthContext";
import { ADMIN_ROLES, hasAnyRole } from "../constants/roles";

const STORAGE_KEY = "managerActiveFacilityId";
const ManagerFacilityContext = createContext(null);

/**
 * Context quản lý cơ sở kho (facility) dùng chung cho Manager và Admin.
 * - Manager: Lấy danh sách kho được phân công từ /api/manager/my-facilities.
 * - Admin: Nếu chưa được phân công kho cụ thể, tự động lấy toàn bộ kho từ /api/operations/facilities
 *   để Admin có thể quản trị và kiểm tra bất kỳ cơ sở kho nào.
 */
export function ManagerFacilityProvider({ children }) {
  const { user } = useAuth();
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
        let list = [];
        try {
          list = await managerService.getMyFacilities();
        } catch {
          // If manager endpoint fails or user is admin without assignment, fallback to operations
        }

        const roles = (user?.roles || []).map((r) => r.toLowerCase());
        const isAdmin = hasAnyRole(roles, ADMIN_ROLES);

        // Nếu list rỗng và tài khoản là Admin, tự động tải tất cả các kho qua operationsService
        if ((!list || list.length === 0) && isAdmin) {
          try {
            const opsRes = await operationsService.getFacilities({ pageSize: 100 });
            const items = opsRes?.items || opsRes?.data || (Array.isArray(opsRes) ? opsRes : []);
            if (Array.isArray(items) && items.length > 0) {
              list = items.map((f) => ({
                id: f.id,
                code: f.code || f.facilityCode,
                name: f.name || f.facilityName,
                addressLine: f.addressLine,
                city: f.city,
                status: f.status,
              }));
            }
          } catch {
            // Ignore fallback failure
          }
        }

        if (cancelled) return;
        const validList = Array.isArray(list) ? list : [];
        setFacilities(validList);

        if (validList.length === 0) {
          setError("Tài khoản chưa được phân công quản lý cơ sở kho nào. Vui lòng liên hệ Quản trị viên.");
          setFacilityIdState(null);
          return;
        }

        setFacilityIdState((current) => {
          if (current && validList.some((facility) => facility.id === current)) return current;
          const fallback = validList[0]?.id ?? null;
          if (fallback) localStorage.setItem(STORAGE_KEY, String(fallback));
          return fallback;
        });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải danh sách kho.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFacilities();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
