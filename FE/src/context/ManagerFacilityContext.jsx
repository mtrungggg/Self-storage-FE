import { createContext, useCallback, useContext, useEffect, useState } from "react";
import managerService from "../api/managerService";
import adminFacilityService from "../api/adminFacilityService";
import { useAuth } from "./AuthContext";
import { ADMIN_ROLES, MANAGER_ROLES, hasAnyRole } from "../constants/roles";
import STORAGE_KEYS from "../constants/storageKeys";
import PAGINATION from "../constants/pagination";

const ManagerFacilityContext = createContext(null);

/**
 * Context quản lý cơ sở kho (facility) & thông báo vận hành (notifications) dùng chung cho Manager và Admin.
 * - Manager: Lấy danh sách kho được phân công từ /api/manager/my-facilities.
 * - Theo dõi tự động các yêu cầu chuyển kho (Unit Transfer Requests) đang chờ duyệt để thông báo tức thời.
 */
export function ManagerFacilityProvider({ children }) {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityIdState] = useState(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEYS.MANAGER_ACTIVE_FACILITY_ID));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notification state: pending transfer requests
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [latestNewTransfer, setLatestNewTransfer] = useState(null);

  const setFacilityId = useCallback((id) => {
    setFacilityIdState(id);
    if (id) localStorage.setItem(STORAGE_KEYS.MANAGER_ACTIVE_FACILITY_ID, String(id));
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
          // If manager endpoint fails or user is admin without assignment, fallback to admin facility service
        }

        const roles = (user?.roles || []).map((r) => r.toLowerCase());
        const isAdmin = hasAnyRole(roles, ADMIN_ROLES);

        if ((!list || list.length === 0) && isAdmin) {
          try {
            const adminRes = await adminFacilityService.getFacilities({ PageSize: PAGINATION.MAX_PAGE_SIZE });
            const items = adminRes?.items || [];
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
          setError("No active storage facilities available for your account. Please contact an Administrator.");
          setFacilityIdState(null);
          return;
        }

        setFacilityIdState((current) => {
          if (current && validList.some((facility) => facility.id === current)) return current;
          const fallback = validList[0]?.id ?? null;
          if (fallback) localStorage.setItem(STORAGE_KEYS.MANAGER_ACTIVE_FACILITY_ID, String(fallback));
          return fallback;
        });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load facilities list.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFacilities();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Polling transfer requests to keep notification count & alerts up-to-date
  const refreshTransferRequests = useCallback(async () => {
    if (!facilityId) {
      setPendingTransfers([]);
      return [];
    }
    try {
      const res = await managerService.getTransferRequests(facilityId);
      const list = Array.isArray(res) ? res : [];
      const pending = list.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "pending" || s === "pending_payment" || s === "paid";
      });

      setPendingTransfers((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const newlyAdded = pending.find((p) => !prevIds.has(p.id));
        if (newlyAdded && prev.length > 0) {
          setLatestNewTransfer(newlyAdded);
        }
        return pending;
      });
      return list;
    } catch {
      return [];
    }
  }, [facilityId]);

  useEffect(() => {
    if (!facilityId) return undefined;
    refreshTransferRequests();
    const interval = setInterval(refreshTransferRequests, 12000);
    return () => clearInterval(interval);
  }, [facilityId, refreshTransferRequests]);

  const activeFacility = facilities.find((facility) => facility.id === facilityId) || null;
  const pendingTransferCount = pendingTransfers.length;

  const value = {
    facilities,
    facilityId,
    setFacilityId,
    activeFacility,
    loading,
    error,
    pendingTransfers,
    pendingTransferCount,
    latestNewTransfer,
    clearLatestNewTransfer: () => setLatestNewTransfer(null),
    refreshTransferRequests,
  };

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
