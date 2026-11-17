import { useState } from "react";
import { UserPlus, Trash2, KeyRound, ShieldCheck, Check, Copy } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import CustomSelect from "./ui/CustomSelect";

const RELATIONSHIP_OPTIONS = [
  { value: "Family", vi: "Gia đình", en: "Family" },
  { value: "Friend", vi: "Bạn bè", en: "Friend" },
  { value: "Partner", vi: "Đối tác / Đồng nghiệp", en: "Partner / Colleague" },
  { value: "Staff", vi: "Nhân viên", en: "Employee / Staff" },
  { value: "Other", vi: "Khác", en: "Other" },
];

export default function AuthorizedMembersPanel({
  members = [],
  loading = false,
  error = "",
  agreementStatus = "active",
  onAddMember,
  onRevokeMember,
}) {
  const { lang } = useLanguage();
  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);

  const [fullName, setFullName] = useState("");
  const [identityFingerprint, setIdentityFingerprint] = useState("");
  const [relationshipToCustomer, setRelationshipToCustomer] = useState("Family");
  const [issuePin, setIssuePin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [issuedPinInfo, setIssuedPinInfo] = useState(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const canModify = ["active", "expiring_soon", "extended"].includes(
    String(agreementStatus || "").toLowerCase()
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !onAddMember) return;
    setSubmitting(true);
    setActionError("");
    setIssuedPinInfo(null);
    try {
      const created = await onAddMember({
        fullName: fullName.trim(),
        identityFingerprint: identityFingerprint.trim() || undefined,
        relationshipToCustomer: relationshipToCustomer.trim() || undefined,
        issuePin,
      });
      if (created?.issuedMemberPin) {
        setIssuedPinInfo({
          fullName: created.fullName,
          pin: created.issuedMemberPin,
        });
      }
      setFullName("");
      setIdentityFingerprint("");
    } catch (err) {
      setActionError(err?.message || label("Không thể thêm thành viên được ủy quyền.", "Failed to add authorized member."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(memberId) {
    if (!onRevokeMember) return;
    setRevokingId(memberId);
    setActionError("");
    try {
      await onRevokeMember(memberId);
    } catch (err) {
      setActionError(err?.message || label("Không thể thu hồi quyền thành viên.", "Failed to revoke member."));
    } finally {
      setRevokingId(null);
    }
  }

  const handleCopyPin = (pin) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const translateRelation = (rel) => {
    const match = RELATIONSHIP_OPTIONS.find((r) => r.value.toLowerCase() === String(rel || "").toLowerCase());
    return match ? (isVi ? match.vi : match.en) : rel || label("Thành viên ủy quyền", "Authorized Member");
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {label("Chia sẻ quyền truy cập kho", "Shared Unit Access")}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {label("Quản lý người thân, đối tác hoặc nhân viên được phép mở ô kho", "Manage authorized members who can unlock this unit")}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            {members.length} {label("thành viên", "members")}
          </span>
        </div>

        {/* Issued PIN Alert */}
        {issuedPinInfo && (
          <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {label("Mã PIN cấp cho", "PIN issued for")} <strong>{issuedPinInfo.fullName}</strong>:
                </span>
                <code className="rounded-lg bg-white px-2.5 py-0.5 font-mono text-sm font-black tracking-widest text-emerald-700 border border-emerald-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-emerald-400">
                  {issuedPinInfo.pin}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopyPin(issuedPinInfo.pin)}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition dark:bg-zinc-800 dark:text-emerald-300 dark:border-emerald-700"
              >
                {copiedPin ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedPin ? label("Đã sao chép", "Copied") : label("Sao chép", "Copy")}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
              {label(
                "Vui lòng lưu lại và gửi cho người được ủy quyền. Khi thu hồi quyền thành viên, mã PIN này sẽ tự động vô hiệu hóa.",
                "Please save and share this PIN securely. Revoking member access automatically revokes their PIN code."
              )}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {(error || actionError) && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {actionError || error}
          </div>
        )}

        {/* Add Member Form */}
        {canModify && (
          <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label className="mb-1 block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  {label("Họ và tên", "Full Name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={label("VD: Nguyễn Văn A", "e.g. John Doe")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1 block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  {label("Số CCCD / CMND", "CCCD / ID Number")}
                </label>
                <input
                  type="text"
                  value={identityFingerprint}
                  onChange={(e) => setIdentityFingerprint(e.target.value)}
                  placeholder={label("Tùy chọn", "Optional")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="mb-1 block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  {label("Mối quan hệ", "Relationship")}
                </label>
                <CustomSelect
                  value={relationshipToCustomer}
                  onChange={(e) => setRelationshipToCustomer(e.target.value)}
                  className="w-full text-xs"
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isVi ? opt.vi : opt.en}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={issuePin}
                  onChange={(e) => setIssuePin(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <span className="flex items-center gap-1 font-semibold">
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  {label("Cấp mã PIN mở khóa riêng", "Issue Dedicated PIN")}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !fullName.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {submitting
                  ? label("Đang thêm...", "Adding...")
                  : label("Thêm thành viên", "Add Member")}
              </button>
            </div>
          </form>
        )}

        {/* Member List */}
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
            {label("Danh sách được cấp quyền", "Authorized Members List")}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              <span>{label("Đang tải danh sách thành viên...", "Loading authorized members...")}</span>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
              <ShieldCheck className="mx-auto h-7 w-7 text-slate-300 dark:text-zinc-600 mb-1" />
              <p className="font-semibold text-slate-700 dark:text-zinc-300">
                {label("Chưa có thành viên nào", "No authorized members yet")}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {label("Thêm người thân hoặc nhân viên vào form phía trên để cấp quyền mở kho.", "Use the form above to grant access to family or staff.")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {members.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-zinc-100">{m.fullName}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                        {translateRelation(m.relationshipToCustomer)}
                      </span>
                      {m.identityFingerprint && (
                        <span>• CCCD/ID: {m.identityFingerprint}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {label("Đang hoạt động", "Active")}
                    </span>

                    {canModify && (
                      <button
                        type="button"
                        disabled={revokingId === m.id}
                        onClick={() => handleRevoke(m.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3 w-3" />
                        {revokingId === m.id
                          ? label("Đang thu hồi...", "Revoking...")
                          : label("Thu hồi", "Revoke")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
