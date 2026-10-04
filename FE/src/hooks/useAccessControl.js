import { useCallback, useEffect, useState } from "react";
import {
  getWallets,
  getGuestPins,
  getAccessControlLogs,
} from "../data/accessControlRepository";
import rentalService from "../api/rentalService";

function formatDateDisplay(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Application layer: encapsulates AccessControl (PIN, smart lock & authorized access members) page state and data wiring.
export function useAccessControl() {
  const wallets = getWallets();
  const guestPins = getGuestPins();
  const accessLogs = getAccessControlLogs();

  const [activeUnit, setActiveUnit] = useState("main");
  const [showPin, setShowPin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  // Rentals & selected agreementId
  const [rentals, setRentals] = useState([]);
  const [agreementId, setAgreementId] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState("");
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");

  // Authorized Access Members state (GET / POST / DELETE /api/customer/rentals/{agreementId}/authorized-members)
  const [authorizedMembers, setAuthorizedMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  // Add Authorized Member form state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberFullName, setMemberFullName] = useState("");
  const [memberIdentity, setMemberIdentity] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRelationship, setMemberRelationship] = useState("Người thân");
  const [memberValidTo, setMemberValidTo] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [addMemberSuccess, setAddMemberSuccess] = useState("");

  // Revoke Authorized Member state
  const [revokingMemberId, setRevokingMemberId] = useState(null);

  // 1. Load customer's active rentals on mount
  useEffect(() => {
    let active = true;
    setCredentialsLoading(true);
    setCredentialsError("");

    rentalService
      .getMyRentals()
      .then((rentalList) => {
        if (!active) return;
        const validList = Array.isArray(rentalList) ? rentalList : [];
        setRentals(validList);
        const primary =
          validList.find((r) => (r.status || "").toLowerCase() !== "ended") || validList[0];
        if (!primary) {
          setCredentialsError("Bạn chưa có hợp đồng thuê kho nào đang hoạt động.");
          setCredentialsLoading(false);
          return;
        }
        setAgreementId(primary.agreementId);
      })
      .catch((err) => {
        if (active) {
          setCredentialsError(err?.message || "Không thể tải danh sách hợp đồng thuê kho.");
          setCredentialsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch access credentials & authorized members whenever agreementId changes
  const fetchAuthorizedMembers = useCallback(async (targetAgreementId) => {
    const id = targetAgreementId || agreementId;
    if (!id) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const list = await rentalService.getAuthorizedMembers(id);
      setAuthorizedMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      setMembersError(err?.message || "Không thể tải danh sách người được ủy quyền.");
    } finally {
      setMembersLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    if (!agreementId) return;
    let active = true;

    setCredentialsLoading(true);
    setCredentialsError("");
    rentalService
      .getAccessCredentials(agreementId)
      .then((data) => {
        if (active) setCredentials(data);
      })
      .catch((err) => {
        if (active) setCredentialsError(err?.message || "Không thể tải mã truy cập.");
      })
      .finally(() => {
        if (active) setCredentialsLoading(false);
      });

    fetchAuthorizedMembers(agreementId);

    return () => {
      active = false;
    };
  }, [agreementId, fetchAuthorizedMembers]);

  const selectedRental =
    rentals.find((r) => Number(r.agreementId) === Number(agreementId)) || rentals[0] || null;

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => setUnlocking(false), 1200);
  };

  const handleChangePin = async (newPin, currentPin) => {
    if (!agreementId) return;
    setPinChanging(true);
    setPinChangeError("");
    try {
      const res = await rentalService.changePin(agreementId, { currentPin, newPin });
      setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));
      return res;
    } catch (err) {
      setPinChangeError(err?.message || "Đổi mã PIN thất bại. Vui lòng thử lại.");
      throw err;
    } finally {
      setPinChanging(false);
    }
  };

  // Add Authorized Member (POST /api/customer/rentals/{agreementId}/authorized-members)
  const handleAddMember = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setAddMemberError("");
      setAddMemberSuccess("");

      if (!agreementId) {
        setAddMemberError("Bạn cần có hợp đồng thuê kho đang hoạt động để cấp quyền ủy quyền.");
        return;
      }

      const trimmedName = memberFullName.trim();
      if (!trimmedName) {
        setAddMemberError("Vui lòng nhập họ và tên người được ủy quyền.");
        return;
      }

      const trimmedId = memberIdentity.trim();
      const trimmedPhone = memberPhone.trim();
      if (!trimmedId && !trimmedPhone) {
        setAddMemberError("Vui lòng nhập số CCCD/CMND hoặc số điện thoại định danh.");
        return;
      }

      const identityParts = [];
      if (trimmedId) identityParts.push(`CCCD: ${trimmedId}`);
      if (trimmedPhone) identityParts.push(`SĐT: ${trimmedPhone}`);

      const payload = {
        fullName: trimmedName,
        identityFingerprint: identityParts.join(" • ") || null,
        relationshipToCustomer: memberRelationship.trim() || "Người được ủy quyền",
        validTo: memberValidTo ? new Date(memberValidTo).toISOString() : null,
      };

      setAddingMember(true);
      try {
        await rentalService.addAuthorizedMember(agreementId, payload);
        setAddMemberSuccess(`Đã thêm ủy quyền cho "${trimmedName}" thành công.`);
        setMemberFullName("");
        setMemberIdentity("");
        setMemberPhone("");
        setMemberValidTo("");
        setShowAddMemberForm(false);
        await fetchAuthorizedMembers(agreementId);
      } catch (err) {
        setAddMemberError(err?.message || "Không thể thêm người được ủy quyền.");
      } finally {
        setAddingMember(false);
      }
    },
    [
      agreementId,
      memberFullName,
      memberIdentity,
      memberPhone,
      memberRelationship,
      memberValidTo,
      fetchAuthorizedMembers,
    ]
  );

  // Revoke Authorized Member (DELETE /api/customer/rentals/{agreementId}/authorized-members/{memberId})
  const handleRevokeMember = useCallback(
    async (memberId) => {
      if (!agreementId || !memberId) return;
      setRevokingMemberId(memberId);
      setMembersError("");
      setAddMemberSuccess("");
      try {
        await rentalService.revokeAuthorizedMember(agreementId, memberId);
        await fetchAuthorizedMembers(agreementId);
      } catch (err) {
        setMembersError(err?.message || "Không thể thu hồi quyền ủy quyền.");
      } finally {
        setRevokingMemberId(null);
      }
    },
    [agreementId, fetchAuthorizedMembers]
  );

  const toggleAlert = (key) => setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    wallets,
    guestPins,
    accessLogs,
    activeUnit,
    setActiveUnit,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,

    // Rentals & Credentials
    rentals,
    agreementId,
    setAgreementId,
    selectedRental,
    credentials,
    credentialsLoading,
    credentialsError,
    pinChanging,
    pinChangeError,
    handleChangePin,

    // Authorized Access Members
    authorizedMembers,
    membersLoading,
    membersError,
    fetchAuthorizedMembers,
    showAddMemberForm,
    setShowAddMemberForm,
    memberFullName,
    setMemberFullName,
    memberIdentity,
    setMemberIdentity,
    memberPhone,
    setMemberPhone,
    memberRelationship,
    setMemberRelationship,
    memberValidTo,
    setMemberValidTo,
    addingMember,
    addMemberError,
    addMemberSuccess,
    handleAddMember,
    revokingMemberId,
    handleRevokeMember,
    formatDateDisplay,
  };
}
