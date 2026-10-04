import { useCallback, useEffect, useMemo, useState } from "react";
import { getRelationshipOptions } from "../data/accessControlRepository";
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

function formatDateTimeDisplay(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Application layer: encapsulates AccessControl (PIN, Gate QR & Authorized Access Members) without hardcoded mock data.
export function useAccessControl() {
  const relationshipOptions = useMemo(() => getRelationshipOptions(), []);

  const [showPin, setShowPin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  // Rentals & selected agreementId
  const [rentals, setRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [agreementId, setAgreementId] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState("");

  // Handover record (GET /api/customer/rentals/{agreementId}/handover)
  const [handoverRecord, setHandoverRecord] = useState(null);

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
    setRentalsLoading(true);
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
          return;
        }
        setAgreementId(primary.agreementId);
      })
      .catch((err) => {
        if (active) {
          setCredentialsError(err?.message || "Không thể tải danh sách hợp đồng thuê kho.");
        }
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch access credentials & authorized members whenever agreementId changes
  const fetchAuthorizedMembers = useCallback(
    async (targetAgreementId) => {
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
    },
    [agreementId]
  );

  const fetchCredentials = useCallback(
    async (targetAgreementId) => {
      const id = targetAgreementId || agreementId;
      if (!id) return;
      setCredentialsLoading(true);
      setCredentialsError("");
      try {
        const data = await rentalService.getAccessCredentials(id);
        setCredentials(data);
      } catch (err) {
        setCredentials(null);
        setCredentialsError(err?.message || "Không thể tải mã truy cập.");
      } finally {
        setCredentialsLoading(false);
      }
    },
    [agreementId]
  );

  useEffect(() => {
    if (!agreementId) return;
    fetchCredentials(agreementId);
    fetchAuthorizedMembers(agreementId);
    rentalService
      .getHandoverRecord(agreementId)
      .then((rec) => setHandoverRecord(rec))
      .catch(() => setHandoverRecord(null));
  }, [agreementId, fetchCredentials, fetchAuthorizedMembers]);

  const selectedRental = useMemo(
    () => rentals.find((r) => Number(r.agreementId) === Number(agreementId)) || rentals[0] || null,
    [rentals, agreementId]
  );

  // Build real access & authorization activity logs from Backend data
  const accessLogs = useMemo(() => {
    const logs = [];
    if (credentials?.qrExpiresAt) {
      logs.push({
        id: `qr-${credentials.agreementId}`,
        title: `Cấp mã QR cổng (${credentials.facilityName || selectedRental?.facilityName || ""})`,
        time: `Hết hạn: ${formatDateTimeDisplay(credentials.qrExpiresAt)}`,
        dot: "#2dd4a0",
      });
    }
    authorizedMembers.forEach((m) => {
      logs.push({
        id: `member-${m.id}`,
        title: `Ủy quyền: ${m.fullName} (${m.relationshipToCustomer || "Khách"})`,
        time: formatDateTimeDisplay(m.createdAt || m.validFrom),
        dot: "#1d5fe5",
      });
    });
    if (handoverRecord?.handoverTime || selectedRental?.checkedInAt) {
      logs.push({
        id: `checkin-${selectedRental?.agreementId}`,
        title: `Check-in nhận kho #${selectedRental?.unitCode || credentials?.unitCode || ""}`,
        time: formatDateTimeDisplay(handoverRecord?.handoverTime || selectedRental?.checkedInAt),
        dot: "#0e7b4c",
      });
    }
    if (selectedRental?.startDate) {
      logs.push({
        id: `start-${selectedRental.agreementId}`,
        title: `Kích hoạt hợp đồng #${selectedRental.agreementNo || selectedRental.agreementId}`,
        time: `${selectedRental.startDate}`,
        dot: "#8996a9",
      });
    }
    return logs;
  }, [credentials, authorizedMembers, handoverRecord, selectedRental]);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => setUnlocking(false), 1200);
  };

  const handleChangePin = async (newPin, currentPin) => {
    if (!agreementId) return;
    setPinChanging(true);
    setPinChangeError("");
    setPinChangeSuccess("");
    try {
      const res = await rentalService.changePin(agreementId, { currentPin, newPin });
      setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));
      setPinChangeSuccess(res?.message || "Đã cập nhật mã PIN thành công.");
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
    relationshipOptions,
    accessLogs,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,

    // Rentals & Credentials
    rentals,
    rentalsLoading,
    agreementId,
    setAgreementId,
    selectedRental,
    credentials,
    credentialsLoading,
    credentialsError,
    fetchCredentials,
    pinChanging,
    pinChangeError,
    pinChangeSuccess,
    handleChangePin,
    handoverRecord,

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
    formatDateTimeDisplay,
  };
}
