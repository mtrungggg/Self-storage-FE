import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import authApi from "../services/api/authApi";
import mediaService from "../api/mediaService";
import { DEFAULT_STAFF_AVATARS } from "../constants/assets";
import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES, hasAnyRole } from "../constants/roles";

const unwrap = (res) => res?.data ?? res;

export default function Profile() {
  const { user, updateAvatar, updateUser, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", identityNumber: "", address: "" });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);

  const userRoles = (user?.roles || []).map((r) => String(r).toLowerCase());
  const isAdmin = hasAnyRole(userRoles, ADMIN_ROLES);
  const isManager = hasAnyRole(userRoles, MANAGER_ROLES);
  const isStaff = hasAnyRole(userRoles, STAFF_ROLES);
  const isEmployee = isAdmin || isManager || isStaff;

  const roleBadge = isAdmin
    ? { label: isVi ? "Quản trị viên hệ thống (Admin)" : "System Administrator (Admin)", bg: "bg-purple-100 text-purple-800 border-purple-200" }
    : isManager
    ? { label: isVi ? "Quản lý cơ sở (Manager)" : "Facility Manager", bg: "bg-blue-100 text-blue-800 border-blue-200" }
    : isStaff
    ? { label: isVi ? "Nhân viên cơ sở (Staff)" : "Facility Staff", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    : { label: isVi ? "Khách hàng thuê kho (Customer)" : "Storage Customer", bg: "bg-amber-100 text-amber-800 border-amber-200" };

  const backLink = isAdmin
    ? { to: "/admin-overview", label: isVi ? "← Về Bảng điều khiển Admin" : "← Back to Admin Console" }
    : isManager
    ? { to: "/manager-dashboard", label: isVi ? "← Về Trang quản lý cơ sở" : "← Back to Manager Console" }
    : isStaff
    ? { to: "/staff-dashboard", label: isVi ? "← Về Bàn làm việc nhân viên" : "← Back to Staff Dashboard" }
    : { to: "/my-units", label: isVi ? "← Về Danh sách kho của tôi" : "← Back to My Units" };

  const load = async () => {
    try {
      const p = unwrap(await authApi.getProfile());
      setProfile(p);
      setForm({
        fullName: p.fullName || user?.fullName || "",
        phoneNumber: p.phoneNumber || user?.phoneNumber || "",
        identityNumber: p.identityNumber || "",
        address: p.address || "",
      });
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

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const p = unwrap(await authApi.updateProfile(form));
      setProfile(p);
      if (updateUser) {
        updateUser({
          fullName: form.fullName,
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

  const outOfEdits = !isEmployee && profile && profile.remainingEditsThisMonth <= 0;
  const inputStyle = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs";

  const userInitial = (form.fullName || profile?.email || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#0b1c30]">
      <Header active="profile" hideCustomerNav={isEmployee && !userRoles.includes("storage_customer")} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">
              {isVi ? "Hồ sơ cá nhân & Ảnh đại diện" : "User Profile & Avatar"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {isVi
                ? "Quản lý thông tin tài khoản, cập nhật ảnh đại diện hiển thị trên toàn hệ thống."
                : "Manage account information and update avatar displayed system-wide."}
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
              <div className="text-xs font-bold text-slate-800">
                {isVi ? "Ảnh đại diện (Avatar)" : "Profile Avatar"}
              </div>
              <p className="text-[11px] text-slate-500">
                {isVi
                  ? "Cập nhật ảnh đại diện để hiển thị trên thanh điều hướng topbar và báo cáo nghiệp vụ."
                  : "Avatar is immediately synced across header topbar and activity views."}
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

          {/* PROFILE FORM */}
          {!profile ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
              <p className="mt-2">{isVi ? "Đang tải thông tin hồ sơ..." : "Loading profile details..."}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-slate-700">
                  Email
                  <input className={inputStyle} value={profile.email || user?.email || ""} disabled />
                </label>

                <label className="block text-xs font-bold text-slate-700">
                  {isVi ? "Số CCCD / Định danh" : "Identity / Citizen ID"} {profile.identityNumberLocked ? (isVi ? "(Đã khóa)" : "(Locked)") : ""}
                  <input
                    className={inputStyle}
                    required={!profile.identityNumberLocked && !isEmployee}
                    disabled={profile.identityNumberLocked}
                    maxLength={12}
                    value={profile.identityNumberLocked ? (profile.identityNumber || "—") : form.identityNumber}
                    onChange={(e) => setForm({ ...form, identityNumber: e.target.value.replace(/\D/g, "") })}
                    placeholder="9–12 chữ số"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-slate-700">
                  {isVi ? "Họ và tên *" : "Full Name *"}
                  <input
                    className={inputStyle}
                    required
                    disabled={outOfEdits}
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </label>

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
              </div>

              <label className="block text-xs font-bold text-slate-700">
                {isVi ? "Địa chỉ cư trú" : "Residential Address"}
                <input
                  className={inputStyle}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={isVi ? "Số nhà, đường, phường/xã, quận/huyện..." : "Address..."}
                />
              </label>

              {!isEmployee && (
                <p className={`text-[11px] font-semibold ${outOfEdits ? "text-red-600" : "text-slate-500"}`}>
                  {isVi
                    ? `Đã sửa Họ tên / SĐT ${profile.editsUsedThisMonth || 0}/${profile.maxEditsPerMonth || 2} lần trong tháng ${profile.currentEditMonth || ""}.`
                    : `Name/Phone edits used: ${profile.editsUsedThisMonth || 0}/${profile.maxEditsPerMonth || 2} for month ${profile.currentEditMonth || ""}.`}
                </p>
              )}

              {msg.text && (
                <div
                  role="alert"
                  className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
                    msg.type === "ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
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
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{isVi ? "Lưu thay đổi hồ sơ" : "Save Profile Changes"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
