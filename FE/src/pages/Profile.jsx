import { useEffect, useState } from "react";
import authService from "../api/authService";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import STORAGE_KEYS from "../constants/storageKeys";

const INPUT_CLASS =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500";

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);
}

function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyProfile = (data) => {
    setProfile(data);
    setForm({
      fullName: data?.fullName || "",
      phoneNumber: data?.phoneNumber || "",
      address: data?.address || "",
    });
  };

  useEffect(() => {
    let active = true;
    authService
      .getProfile()
      .then((data) => {
        if (active) applyProfile(data);
      })
      .catch((err) => {
        if (active) setError(err?.message || t("profile.load_error", "Không thể tải hồ sơ."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setSuccess("");
  };

  const identityChanged =
    (form.fullName.trim() !== (profile?.fullName || "")) || (form.phoneNumber.trim() !== (profile?.phoneNumber || ""));
  const noEditsLeft = profile != null && profile.remainingEditsThisMonth <= 0 && identityChanged;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.fullName.trim() || !form.phoneNumber.trim()) {
      setError(t("profile.required", "Họ tên và số điện thoại là bắt buộc."));
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await authService.updateProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim() || null,
      });
      applyProfile(updated);
      const stored = authService.getStoredUser();
      if (stored && updated) {
        const merged = JSON.stringify({ ...stored, fullName: updated.fullName, phoneNumber: updated.phoneNumber });
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, merged);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, merged);
      }
      setSuccess(t("profile.saved", "Đã cập nhật hồ sơ."));
    } catch (err) {
      setError(err?.message || t("profile.save_error", "Không thể cập nhật hồ sơ."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="profile" />

      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8 lg:px-6">
        <div className="rounded-2xl bg-[#0b1c30] px-6 py-5 text-white shadow-sm">
          <h1 className="text-xl font-extrabold">{t("profile.title", "Hồ sơ cá nhân")}</h1>
          <p className="mt-1 text-sm text-white/70">{profile?.email || user?.email}</p>
        </div>

        {profile?.hasNegativeDepositDebt && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t("profile.debt_warning", "Bạn đang có công nợ cọc âm cần thanh toán")}: <b>{formatVnd(profile.totalNegativeDebtAmount)}</b>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p role="status" className="text-sm text-zinc-500">{t("common.loading", "Đang tải...")}</p>
          ) : (
            <>
              <Field label={t("profile.email", "Email")}>
                <input className={INPUT_CLASS} value={profile?.email || ""} disabled readOnly />
              </Field>

              <Field
                label={t("profile.identity", "CCCD / Hộ chiếu")}
                hint={profile?.identityNumberLocked ? t("profile.identity_locked", "Số CCCD đã được khóa, không thể thay đổi.") : undefined}
              >
                <input className={INPUT_CLASS} value={profile?.identityNumber || ""} disabled readOnly />
              </Field>

              <Field label={t("profile.full_name", "Họ và tên")}>
                <input className={INPUT_CLASS} value={form.fullName} onChange={handleChange("fullName")} maxLength={100} required />
              </Field>

              <Field
                label={t("profile.phone", "Số điện thoại")}
                hint={
                  profile
                    ? `${t("profile.edits_left", "Số lần sửa họ tên / SĐT còn lại trong tháng")}: ${profile.remainingEditsThisMonth}/${profile.maxEditsPerMonth}`
                    : undefined
                }
              >
                <input className={INPUT_CLASS} value={form.phoneNumber} onChange={handleChange("phoneNumber")} maxLength={20} required />
              </Field>

              <Field label={t("profile.address", "Địa chỉ")}>
                <input className={INPUT_CLASS} value={form.address} onChange={handleChange("address")} maxLength={255} />
              </Field>

              {noEditsLeft && (
                <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  {t("profile.limit_reached", "Bạn đã hết lượt chỉnh sửa họ tên / số điện thoại trong tháng này.")}
                </p>
              )}
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
              {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{success}</p>}

              <button
                type="submit"
                disabled={saving || !profile || noEditsLeft}
                className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? t("common.saving", "Đang lưu...") : t("common.save", "Lưu thay đổi")}
              </button>
            </>
          )}
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
