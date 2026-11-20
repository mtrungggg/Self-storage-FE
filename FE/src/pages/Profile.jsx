import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import authApi from "../services/api/authApi";
import mediaService from "../api/mediaService";
import { DEFAULT_STAFF_AVATARS } from "../constants/assets";
import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES, hasAnyRole } from "../constants/roles";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Building2,
  BadgeCheck,
  AlertCircle,
  Phone,
  UserCheck,
  FileText,
  CheckCircle2,
  Briefcase,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const unwrap = (res) => res?.data ?? res;

export default function Profile() {
  const { user, updateAvatar, updateUser, refreshUser } = useAuth();
  const { t, lang, formatDate } = useLanguage();
  const isVi = lang === "vi";

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    identityNumber: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    companyName: "",
    taxId: "",
    invoiceAddress: "",
  });
  const [showVat, setShowVat] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Change Password State
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);

  const userRoles = (user?.roles || []).map((r) => String(r).toLowerCase());
  const isAdmin = hasAnyRole(userRoles, ADMIN_ROLES);
  const isManager = hasAnyRole(userRoles, MANAGER_ROLES);
  const isStaff = hasAnyRole(userRoles, STAFF_ROLES);
  const isEmployee = isAdmin || isManager || isStaff;

  const roleBadge = isAdmin
    ? {
        label: isVi ? "Quản trị viên hệ thống (Admin)" : "System Administrator (Admin)",
        bg: "bg-purple-100 text-purple-800 border-purple-200",
      }
    : isManager
    ? {
        label: isVi ? "Quản lý cơ sở (Manager)" : "Facility Manager",
        bg: "bg-blue-100 text-blue-800 border-blue-200",
      }
    : isStaff
    ? {
        label: isVi ? "Nhân viên cơ sở (Staff)" : "Facility Staff",
        bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      }
    : {
        label: isVi ? "Khách hàng thuê kho (Customer)" : "Storage Customer",
        bg: "bg-amber-100 text-amber-800 border-amber-200",
      };

  const backLink = isAdmin
    ? { to: "/admin-overview", label: isVi ? "← Về Bảng điều khiển Admin" : "← Back to Admin Console" }
    : isManager
    ? { to: "/manager-dashboard", label: isVi ? "← Về Trang quản lý cơ sở" : "← Back to Manager Console" }
    : isStaff
    ? { to: "/staff-dashboard", label: isVi ? "← Về Bàn làm việc nhân viên" : "← Back to Staff Dashboard" }
    : { to: "/my-units", label: isVi ? "← Về Danh sách kho của tôi" : "← Back to My Units" };

  const avatarSubtitle = isAdmin
    ? isVi
      ? "Hiển thị trên thanh điều hướng và nhật ký kiểm toán hệ thống (Audit Logs)."
      : "Displayed on navigation header and system audit logs."
    : isManager
    ? isVi
      ? "Hiển thị trên thanh điều hướng, duyệt đơn đặt chỗ và báo cáo quản lý cơ sở."
      : "Displayed on navigation header, reservation approvals and manager reports."
    : isStaff
    ? isVi
      ? "Hiển thị trên thanh điều hướng, phân công ca trực và biên bản kiểm tra bàn giao."
      : "Displayed on navigation header, shift roster and inspection handover reports."
    : isVi
    ? "Hiển thị trên thanh điều hướng và hồ sơ hợp đồng thuê kho."
    : "Displayed across navigation header and rental contract profiles.";

  const load = async () => {
    try {
      const p = unwrap(await authApi.getProfile());
      setProfile(p);
      setForm({
        fullName: p.fullName || user?.fullName || "",
        phoneNumber: p.phoneNumber || user?.phoneNumber || "",
        identityNumber: p.identityNumber || "",
        address: p.address || "",
        emergencyContactName: p.emergencyContactName || "",
        emergencyContactPhone: p.emergencyContactPhone || "",
        companyName: p.companyName || "",
        taxId: p.taxId || "",
        invoiceAddress: p.invoiceAddress || "",
      });
      if (p.companyName || p.taxId || p.invoiceAddress) {
        setShowVat(true);
      }
      const savedAvatar = user?.id ? localStorage.getItem(`storage_user_avatar_${user.id}`) : null;
      if (savedAvatar) setAvatarUrl(savedAvatar);
      else if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || (isVi ? "Không tải được hồ sơ." : "Unable to load profile.") });
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Live avatar selection from file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg({ type: "error", text: isVi ? "Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP)." : "Please select an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: "error", text: isVi ? "Dung lượng ảnh tối đa là 5MB." : "Image must be smaller than 5MB." });
      return;
    }

    setUploadingAvatar(true);
    setMsg({ type: "", text: "" });

    try {
      let finalUrl = "";
      try {
        const uploadRes = await mediaService.upload(file);
        if (uploadRes?.url) finalUrl = uploadRes.url;
      } catch {
        // Fallback to data URL for seamless local preview / offline dev
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target.result);
          reader.readAsDataURL(file);
        });
      }

      if (finalUrl) {
        setAvatarUrl(finalUrl);
        updateAvatar?.(finalUrl);
        setMsg({ type: "ok", text: isVi ? "Ảnh đại diện đã được cập nhật ngay lập tức!" : "Avatar updated successfully!" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err?.message || (isVi ? "Lỗi tải ảnh đại diện." : "Failed to upload avatar.") });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectPreset = (url) => {
    setAvatarUrl(url);
    updateAvatar?.(url);
    setShowPresets(false);
    setMsg({ type: "ok", text: isVi ? "Ảnh đại diện đã được cập nhật ngay lập tức!" : "Avatar updated successfully!" });
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    updateAvatar?.("");
    setMsg({ type: "ok", text: isVi ? "Đã gỡ ảnh đại diện, trở về chữ cái mặc định." : "Avatar removed." });
  };

  const submitProfile = async (e) => {
    e.preventDefault();

    // CCCD Validation for Customer when first-time entering
    if (!isEmployee && !profile?.identityNumberLocked && form.identityNumber) {
      const cccdRegex = /^\d{12}$/;
      if (!cccdRegex.test(form.identityNumber.trim())) {
        setMsg({
          type: "error",
          text: isVi
            ? "Số CCCD phải gồm đúng 12 chữ số theo chuẩn thẻ Căn cước công dân Việt Nam."
            : "Citizen ID must be exactly 12 digits according to Vietnam National ID standard.",
        });
        return;
      }
    }

    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const payload = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        identityNumber: form.identityNumber,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        companyName: showVat ? form.companyName : null,
        taxId: showVat ? form.taxId : null,
        invoiceAddress: showVat ? form.invoiceAddress : null,
      };

      const p = unwrap(await authApi.updateProfile(payload));
      setProfile(p);
      if (updateUser) {
        updateUser({
          fullName: isEmployee ? (profile?.fullName || form.fullName) : form.fullName,
          phoneNumber: form.phoneNumber,
          avatarUrl: avatarUrl || null,
        });
      }
      if (refreshUser) await refreshUser();
      setMsg({ type: "ok", text: isVi ? "Lưu thông tin hồ sơ thành công!" : "Profile updated successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err?.message || (isVi ? "Cập nhật thất bại." : "Failed to update profile.") });
    } finally {
      setSaving(false);
    }
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });

    if (!pwForm.currentPassword) {
      setPwMsg({ type: "error", text: isVi ? "Vui lòng nhập mật khẩu hiện tại." : "Please enter your current password." });
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: isVi ? "Mật khẩu mới phải có ít nhất 6 ký tự." : "New password must be at least 6 characters." });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwMsg({ type: "error", text: isVi ? "Mật khẩu xác nhận không khớp với mật khẩu mới." : "Password confirmation does not match." });
      return;
    }
    if (pwForm.newPassword === pwForm.currentPassword) {
      setPwMsg({ type: "error", text: isVi ? "Mật khẩu mới không được trùng với mật khẩu hiện tại." : "New password cannot be the same as current password." });
      return;
    }

    setSavingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmNewPassword: pwForm.confirmNewPassword,
      });
      setPwMsg({ type: "ok", text: isVi ? "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn." : "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err?.message || (isVi ? "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại." : "Failed to change password.") });
    } finally {
      setSavingPw(false);
    }
  };

  const outOfEdits = !isEmployee && profile && profile.remainingEditsThisMonth <= 0;
  const inputStyle =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs";

  const userInitial = (form.fullName || profile?.fullName || user?.fullName || profile?.email || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#0b1c30]">
      <Header active="profile" hideCustomerNav={isEmployee && !userRoles.includes("storage_customer")} />

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* TOP BAR / NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link
            to={backLink.to}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            {backLink.label}
          </Link>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg}`}>
            {roleBadge.label}
          </span>
        </div>

        {/* MAIN PROFILE CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">
              {isVi ? "Hồ sơ cá nhân & Thông tin tài khoản" : "Personal Profile & Account Details"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {isVi
                ? "Quản lý thông tin định danh, liên hệ và cài đặt bảo mật cho tài khoản của bạn."
                : "Manage identification, contact details and security credentials for your account."}
            </p>
          </div>

          {/* AVATAR EDITING SECTION */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="relative group shrink-0">
              <div className="h-20 w-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#0b1c30] text-white flex items-center justify-center text-2xl font-bold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                <span>{isVi ? "Ảnh đại diện (Avatar)" : "Profile Avatar"}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {avatarSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">upload</span>
                  {uploadingAvatar ? (isVi ? "Đang tải…" : "Uploading…") : (isVi ? "Tải ảnh từ máy" : "Upload Image")}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">account_box</span>
                  {showPresets ? (isVi ? "Đóng ảnh mẫu" : "Close Presets") : (isVi ? "Chọn ảnh mẫu" : "Choose Preset")}
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    {isVi ? "Gỡ ảnh" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PRESET AVATARS POPUP / PANEL */}
          {showPresets && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                {isVi ? "Chọn một trong các ảnh đại diện mẫu dưới đây:" : "Select one of the preset avatars:"}
              </div>
              <div className="flex flex-wrap gap-2.5 items-center">
                {DEFAULT_STAFF_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className="h-11 w-11 rounded-full border-2 border-white shadow-xs overflow-hidden hover:scale-110 hover:border-blue-500 transition cursor-pointer"
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: THÔNG TIN CÔNG TÁC (CHỈ DÀNH CHO STAFF & MANAGER) */}
          {(isStaff || isManager) && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-700" />
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    {isVi ? "Thông tin công tác & Phạm vi phụ trách" : "Duty & Facility Assignment"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  <Lock size={10} />
                  {isVi ? "Do HR / Admin phân công" : "HR / Admin Managed"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Mã nhân sự nội bộ" : "Employee Code"}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    {profile?.employeeCode || (isManager ? "MGR-TD-01" : "STF-TD-001")}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Cơ sở trực thuộc / phụ trách" : "Assigned Facility"}
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block truncate">
                    {profile?.assignedFacilityName || "Kho Thủ Đức - G1 Storage Hồ Chí Minh"}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Chức vụ nghiệp vụ" : "Operational Role"}
                  </span>
                  <span className="font-semibold text-blue-700 mt-0.5 block">
                    {isManager
                      ? isVi ? "Quản lý cơ sở (Facility Manager)" : "Facility Manager"
                      : isVi ? "Nhân viên cơ sở (Facility Staff)" : "Facility Staff"}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Trạng thái công tác" : "Employment Status"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {isVi ? "Đang hoạt động (Active)" : "Active on duty"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: THÔNG TIN BẢO MẬT & QUẢN TRỊ (CHỈ DÀNH CHO ADMIN) */}
          {isAdmin && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-purple-700" />
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                    {isVi ? "Thông tin Quản trị & Bảo mật hệ thống" : "System Administration & Security"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                  <Lock size={10} />
                  {isVi ? "Quyền hạn cao nhất" : "Root Privilege"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Vai trò hệ thống" : "System Role"}
                  </span>
                  <span className="font-bold text-purple-900 mt-0.5 block">
                    Super Admin / System Administrator
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Mã định danh quản trị" : "Admin ID Code"}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    {profile?.employeeCode || "ADM-SYS-001"}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Trạng thái bảo mật 2 lớp (2FA)" : "Two-Factor Auth (2FA)"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-0.5">
                    <BadgeCheck size={14} className="text-emerald-600" />
                    {isVi ? "Đang kích hoạt (Email OTP & Session Guard)" : "Enabled (Email OTP & Guard)"}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">
                    {isVi ? "Lần đăng nhập gần nhất" : "Last Login"}
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : (isVi ? "Hôm nay, 19:45" : "Today, 19:45")}
                    {" "}
                    <span className="text-[10px] text-slate-400 font-mono">({profile?.lastLoginIp || "127.0.0.1"})</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PROFILE FORM */}
          {!profile ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
              <p className="mt-2">{isVi ? "Đang tải thông tin hồ sơ..." : "Loading profile details..."}</p>
            </div>
          ) : (
            <form onSubmit={submitProfile} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-slate-700">
                  Email
                  <input className={inputStyle} value={profile.email || user?.email || ""} disabled />
                </label>

                {/* SỐ CCCD: ẨN VỚI ADMIN, READ-ONLY VỚI STAFF/MANAGER, XÁC THỰC VỚI CUSTOMER */}
                {!isAdmin && (
                  <label className="block text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>{isVi ? "Số CCCD / Định danh *" : "Citizen ID Number *"}</span>
                      {isEmployee ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                          <Lock size={10} />
                          {isVi ? "HR quản lý" : "HR Locked"}
                        </span>
                      ) : profile.identityNumberLocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                          <BadgeCheck size={11} />
                          {isVi ? "Đã xác thực KYC (Đã khóa)" : "KYC Verified (Locked)"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                          <AlertCircle size={10} />
                          {isVi ? "Chưa xác thực" : "Unverified"}
                        </span>
                      )}
                    </div>
                    <input
                      className={inputStyle}
                      required={!isEmployee && !profile.identityNumberLocked}
                      disabled={isEmployee || profile.identityNumberLocked}
                      maxLength={12}
                      value={isEmployee ? (profile.identityNumber || "079198007777") : form.identityNumber}
                      onChange={(e) => setForm({ ...form, identityNumber: e.target.value.replace(/\D/g, "") })}
                      placeholder={isVi ? "12 chữ số theo thẻ CCCD gắn chip (VD: 079198007777)" : "12-digit Vietnam Citizen ID"}
                    />
                  </label>
                )}

                {/* NẾU LÀ ADMIN: THAY THẾ BẰNG SỐ ĐIỆN THOẠI NGAY DÒNG ĐẦU */}
                {isAdmin && (
                  <label className="block text-xs font-bold text-slate-700">
                    {isVi ? "Số điện thoại liên lạc *" : "Phone Number *"}
                    <input
                      className={inputStyle}
                      required
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="VD: 0909876543"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>{isVi ? "Họ và tên *" : "Full Name *"}</span>
                    {isEmployee && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                        <Lock size={10} />
                        {isVi ? "HR quản lý" : "HR Locked"}
                      </span>
                    )}
                  </div>
                  <input
                    className={inputStyle}
                    required
                    disabled={isEmployee || outOfEdits}
                    value={isEmployee ? (profile.fullName || form.fullName) : form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </label>

                {!isAdmin && (
                  <label className="block text-xs font-bold text-slate-700">
                    {isVi ? "Số điện thoại *" : "Phone Number *"}
                    <input
                      className={inputStyle}
                      required
                      disabled={outOfEdits}
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    />
                  </label>
                )}
              </div>

              {/* ĐỊA CHỈ CƯ TRÚ (KHÔNG HIỂN THỊ VỚI ADMIN) */}
              {!isAdmin && (
                <label className="block text-xs font-bold text-slate-700">
                  {isVi ? "Địa chỉ cư trú" : "Residential Address"}
                  <input
                    className={inputStyle}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder={isVi ? "Số nhà, tên đường, phường/xã, quận/huyện..." : "Street address..."}
                  />
                </label>
              )}

              {/* LƯU Ý CHO NHÂN SỰ VỀ ĐỊNH DANH */}
              {isEmployee && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <Lock size={12} className="text-slate-400 shrink-0" />
                  <span>
                    {isVi
                      ? "Họ tên và Số CCCD của nhân sự do Admin/Phòng Nhân sự quản lý. Bạn có thể tự cập nhật Ảnh đại diện, Số điện thoại và Địa chỉ liên hệ."
                      : "Staff identity (Name & ID) is locked and managed by HR/Admin. You may update your avatar, phone and address."}
                  </span>
                </p>
              )}

              {/* GIỚI HẠN SỬA ĐỐI VỚI KHÁCH HÀNG */}
              {!isEmployee && (
                <p className={`text-[11px] font-semibold ${outOfEdits ? "text-red-600" : "text-slate-500"}`}>
                  {isVi
                    ? `Đã sửa Họ tên / SĐT ${profile.editsUsedThisMonth || 0}/${profile.maxEditsPerMonth || 2} lần trong tháng ${profile.currentEditMonth || ""}.`
                    : `Name/Phone edits used: ${profile.editsUsedThisMonth || 0}/${profile.maxEditsPerMonth || 2} for month ${profile.currentEditMonth || ""}.`}
                </p>
              )}

              {/* SECTION: NGƯỜI LIÊN HỆ KHẨN CẤP (CHỈ DÀNH CHO KHÁCH HÀNG THUÊ KHO) */}
              {!isEmployee && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3 mt-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                      <Phone size={14} className="text-amber-600" />
                      <span>{isVi ? "Người liên hệ khẩn cấp (Emergency Contact)" : "Emergency Contact"}</span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">
                      {isVi
                        ? "Bắt buộc đối với dịch vụ thuê kho tự quản để liên hệ khi xảy ra sự cố kho, mất liên lạc hoặc thanh lý tài sản."
                        : "Required for self-storage rental safety, emergencies, or unreachable scenarios."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isVi ? "Họ tên người liên hệ *" : "Contact Full Name *"}
                      <input
                        className={inputStyle}
                        value={form.emergencyContactName}
                        onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                        placeholder={isVi ? "VD: Nguyễn Thị Lan (Vợ/Chồng/Người thân)" : "e.g. John Doe (Relative)"}
                      />
                    </label>

                    <label className="block text-xs font-semibold text-slate-700">
                      {isVi ? "Số điện thoại khẩn cấp *" : "Emergency Phone *"}
                      <input
                        className={inputStyle}
                        value={form.emergencyContactPhone}
                        onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                        placeholder="VD: 0987654321"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION: XUẤT HÓA ĐƠN VAT DOANH NGHIỆP (TÙY CHỌN DÀNH CHO CUSTOMER) */}
              {!isEmployee && (
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-3">
                  <div
                    onClick={() => setShowVat(!showVat)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-slate-600" />
                      <span className="text-xs font-bold text-slate-800">
                        {isVi ? "Thông tin xuất hóa đơn VAT cho Doanh nghiệp (Tùy chọn)" : "Corporate VAT Invoice Details (Optional)"}
                      </span>
                    </div>
                    <button type="button" className="text-slate-400 hover:text-slate-600">
                      {showVat ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {showVat && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700">
                        {isVi ? "Tên công ty / Đơn vị" : "Company Legal Name"}
                        <input
                          className={inputStyle}
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder={isVi ? "Công ty TNHH..." : "Company Ltd..."}
                        />
                      </label>

                      <label className="block text-xs font-semibold text-slate-700">
                        {isVi ? "Mã số thuế (MST)" : "Tax ID / VAT Code"}
                        <input
                          className={inputStyle}
                          value={form.taxId}
                          onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                          placeholder="VD: 0312345678"
                        />
                      </label>

                      <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                        {isVi ? "Địa chỉ xuất hóa đơn" : "Invoice Billing Address"}
                        <input
                          className={inputStyle}
                          value={form.invoiceAddress}
                          onChange={(e) => setForm({ ...form, invoiceAddress: e.target.value })}
                          placeholder={isVi ? "Địa chỉ đăng ký kinh doanh theo GPKD..." : "Registered business address..."}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {msg.text && (
                <div
                  role="alert"
                  className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
                    msg.type === "ok"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {msg.type === "ok" ? "check_circle" : "error"}
                  </span>
                  <span>{msg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || outOfEdits}
                className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-extrabold text-white hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    <span>{isVi ? "Đang lưu thay đổi..." : "Saving changes..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{isVi ? "Lưu thay đổi hồ sơ" : "Save Profile Changes"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* SECTION: BẢO MẬT & ĐỔI MẬT KHẨU (ĐỒNG BỘ CẢ 4 ROLES) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound size={18} className="text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isVi ? "Bảo mật & Đổi mật khẩu" : "Security & Change Password"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isVi
                  ? "Cập nhật mật khẩu định kỳ từ 6 ký tự trở lên để bảo vệ tài khoản và tài sản lưu trữ."
                  : "Change password regularly (min 6 characters) to protect your account and storage units."}
              </p>
            </div>
          </div>

          <form onSubmit={submitChangePassword} className="space-y-3.5 pt-1">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isVi ? "Mật khẩu hiện tại *" : "Current Password *"}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder={isVi ? "Nhập mật khẩu đang dùng" : "Enter current password"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition"
                  title={showCurrentPw ? (isVi ? "Ẩn mật khẩu" : "Hide") : (isVi ? "Hiện mật khẩu" : "Show")}
                >
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isVi ? "Mật khẩu mới *" : "New Password *"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder={isVi ? "Tối thiểu 6 ký tự" : "At least 6 characters"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isVi ? "Xác nhận mật khẩu mới *" : "Confirm New Password *"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={pwForm.confirmNewPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                    placeholder={isVi ? "Nhập lại mật khẩu mới" : "Re-enter new password"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {pwMsg.text && (
              <div
                role="alert"
                className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
                  pwMsg.type === "ok"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {pwMsg.type === "ok" ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                )}
                <span>{pwMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={savingPw}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              {savingPw ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>
                  <span>{isVi ? "Đang đổi mật khẩu..." : "Changing password..."}</span>
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>{isVi ? "Cập nhật mật khẩu mới" : "Update Password"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
