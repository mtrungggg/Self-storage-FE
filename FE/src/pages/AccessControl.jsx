import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function AccessControl() {
  const {
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

    // Authorized Access Members (Flow 3)
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
  } = useAccessControl();

  const onChangePin = () => {
    const newPin = window.prompt("Nhập mã PIN mới (6 chữ số):");
    if (!newPin) return;
    handleChangePin(newPin).catch(() => {});
  };

  const openAddMemberSection = () => {
    setShowAddMemberForm(true);
    const el = document.getElementById("authorized-members-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const isCredentialSuspended =
    (credentials?.status || "").toLowerCase() === "suspended" || selectedRental?.hasOverdueDebt;

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Mã PIN &amp; Khóa điện tử
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onChangePin}
              disabled={pinChanging || !credentials || isCredentialSuspended}
              className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              {pinChanging ? "Đang đổi..." : "Đổi mã PIN"}
            </button>
            <button
              type="button"
              onClick={openAddMemberSection}
              disabled={!agreementId}
              className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Ủy quyền ra vào
            </button>
          </div>
        </div>

        {(credentialsError || pinChangeError) && (
          <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {pinChangeError || credentialsError}
          </div>
        )}

        {pinChangeSuccess && (
          <div className="mt-4 rounded-[12px] border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-[13px] font-semibold text-[#067647]">
            {pinChangeSuccess}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#dfe7f5] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            {rentalsLoading ? (
              <span className="px-3 py-1.5 text-[12px] text-[#58657a]">
                Đang tải danh sách hợp đồng thuê kho...
              </span>
            ) : rentals.length === 0 ? (
              <span className="px-3 py-1.5 text-[12px] text-[#58657a]">
                Chưa có hợp đồng thuê kho đang hoạt động.
              </span>
            ) : (
              rentals.map((rental) => {
                const isSelected = Number(rental.agreementId) === Number(agreementId);
                return (
                  <button
                    key={rental.agreementId}
                    type="button"
                    onClick={() => setAgreementId(rental.agreementId)}
                    className={`rounded-[10px] px-3.5 py-2 text-left text-[12px] font-semibold transition ${
                      isSelected
                        ? "bg-[#0b1c30] text-white shadow-sm"
                        : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
                    }`}
                  >
                    <div>Kho #{rental.unitCode || rental.storageUnitId}</div>
                    <div
                      className={`text-[10px] font-normal ${
                        isSelected ? "text-[#c7d1e6]" : "text-[#8996a9]"
                      }`}
                    >
                      {rental.dimensions || rental.unitTypeName || "-"}
                      {rental.floorLabel ? ` • ${rental.floorLabel}` : ""}
                      {rental.facilityName ? ` • ${rental.facilityName}` : ""}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <span>Trạng thái truy cập</span>
            {isCredentialSuspended ? (
              <span className="flex items-center gap-1 rounded-full bg-[#fdecec] px-2.5 py-0.5 text-[11px] font-bold text-[#c0362c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c0362c]" />
                Tạm khóa ({credentials?.suspendedReason || "Công nợ quá hạn"})
              </span>
            ) : credentials ? (
              <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2.5 py-0.5 text-[11px] font-bold text-[#0e7b4c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                Đang hoạt động
              </span>
            ) : (
              <span className="rounded-full bg-[#eef1f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#58657a]">
                Chưa kích hoạt
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[15px] font-bold text-[#0b1c30]">
                  Bàn phím số &amp; Mã QR Cổng ra vào
                </div>
                {(selectedRental?.unitCode || credentials?.unitCode) && (
                  <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                    Kho #{selectedRental?.unitCode || credentials?.unitCode}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-[#8996a9]">
                {selectedRental?.facilityName || credentials?.facilityName || "Dữ liệu xác thực trực tiếp từ hợp đồng thuê"}
              </p>

              <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                  Mã PIN bàn phím ô kho
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30]">
                    {credentialsLoading
                      ? "..."
                      : showPin
                      ? credentials?.keypadPin || "—"
                      : credentials?.keypadPin
                      ? credentials.keypadPin.replace(/./g, "•")
                      : "——————"}
                    {credentials?.keypadPin && (
                      <button
                        type="button"
                        onClick={() => setShowPin((v) => !v)}
                        className="material-symbols-outlined text-[18px] text-[#8996a9] hover:text-[#0b1c30]"
                      >
                        {showPin ? "visibility_off" : "visibility"}
                      </button>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!credentials?.keypadPin}
                      onClick={() =>
                        credentials?.keypadPin &&
                        navigator.clipboard.writeText(credentials.keypadPin)
                      }
                      className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Sao chép
                    </button>
                    <button
                      type="button"
                      disabled={!credentials || pinChanging || isCredentialSuspended}
                      onClick={onChangePin}
                      className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">autorenew</span>
                      Đổi mã PIN
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#8996a9]">
                  Nhập trực tiếp trên bàn phím tại cửa khoang lưu trữ.
                </div>
              </div>

              {/* Short-lived Gate QR Token from GET /api/customer/rentals/{agreementId}/access-credentials */}
              <div className="mt-4 rounded-[12px] bg-[#0b1c30] p-4 text-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    Gate QR Token &amp; Mở khóa thông minh
                  </div>
                  {credentials?.qrExpiresAt && (
                    <span className="text-[10px] text-[#c7d1e6]">
                      Hiệu lực đến: {formatDateTimeDisplay(credentials.qrExpiresAt)} (
                      {credentials.qrExpiresInSeconds}s)
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold">
                      {credentials?.gateQrToken
                        ? "Mã thông báo QR cổng tự động (JWT Token)"
                        : "Chưa có mã QR cổng khả dụng"}
                    </div>
                    {credentials?.gateQrToken ? (
                      <div className="mt-1 truncate rounded bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-[#c7d1e6]">
                        {credentials.gateQrToken}
                      </div>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#c7d1e6]">
                        {credentialsError ||
                          "Mã QR cổng sẽ được cấp khi hợp đồng đã check-in và trong giờ hoạt động của cơ sở."}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {agreementId && (
                      <button
                        type="button"
                        onClick={() => fetchCredentials(agreementId)}
                        disabled={credentialsLoading}
                        className="flex items-center gap-1 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white hover:bg-white/20 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[15px]">refresh</span>
                        Làm mới QR
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!credentials || isCredentialSuspended}
                      onClick={handleUnlock}
                      className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {unlocking ? "lock_open" : "lock"}
                      </span>
                      {unlocking ? "Đang mở..." : "Mở khóa kho"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Ủy quyền người ra vào kho (Authorized Access Members - Flow 3) */}
            <div
              id="authorized-members-section"
              className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">
                    Ủy quyền người ra vào kho (Authorized Access Members)
                  </div>
                  <p className="mt-0.5 max-w-[520px] text-[11px] text-[#8996a9]">
                    Quản lý danh sách người thân, đối tác hoặc nhân viên được phép ra vào ô kho kèm định danh CCCD/CMND và số điện thoại.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {agreementId && (
                    <button
                      type="button"
                      onClick={() => fetchAuthorizedMembers(agreementId)}
                      disabled={membersLoading}
                      className="flex items-center gap-1 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#eef4ff]"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      Làm mới
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!agreementId}
                    onClick={() => setShowAddMemberForm((v) => !v)}
                    className="flex items-center gap-1 rounded-[10px] bg-[#1d5fe5] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#174fc7] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showAddMemberForm ? "close" : "person_add"}
                    </span>
                    {showAddMemberForm ? "Đóng biểu mẫu" : "Thêm người ủy quyền"}
                  </button>
                </div>
              </div>

              {addMemberError && (
                <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2 text-[12px] font-semibold text-[#b3261e]">
                  {addMemberError}
                </div>
              )}
              {addMemberSuccess && (
                <div className="mt-3 rounded-[10px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-2 text-[12px] font-semibold text-[#067647]">
                  {addMemberSuccess}
                </div>
              )}
              {membersError && (
                <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2 text-[12px] font-semibold text-[#b3261e]">
                  {membersError}
                </div>
              )}

              {/* Add Authorized Member Form (POST /api/customer/rentals/{agreementId}/authorized-members) */}
              {showAddMemberForm && (
                <form
                  onSubmit={handleAddMember}
                  className="mt-4 space-y-3 rounded-[12px] border border-[#c7d1e6] bg-[#f8faff] p-4"
                >
                  <div className="text-[13px] font-bold text-[#0b1c30]">
                    Thêm người được ủy quyền ra vào kho
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#0f172a]">
                        Họ và tên người được ủy quyền *
                      </label>
                      <input
                        type="text"
                        value={memberFullName}
                        onChange={(e) => setMemberFullName(e.target.value)}
                        placeholder="Nhập họ và tên..."
                        className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#0f172a]">
                        Mối quan hệ / Vai trò
                      </label>
                      <select
                        value={memberRelationship}
                        onChange={(e) => setMemberRelationship(e.target.value)}
                        className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                      >
                        {relationshipOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#0f172a]">
                        Số CCCD / CMND định danh *
                      </label>
                      <input
                        type="text"
                        value={memberIdentity}
                        onChange={(e) => setMemberIdentity(e.target.value)}
                        placeholder="Nhập số CCCD / CMND..."
                        className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#0f172a]">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        type="tel"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value)}
                        placeholder="Nhập số điện thoại..."
                        className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-[#0f172a]">
                        Hiệu lực ủy quyền đến ngày (Để trống nếu có hiệu lực suốt hợp đồng)
                      </label>
                      <input
                        type="date"
                        value={memberValidTo}
                        onChange={(e) => setMemberValidTo(e.target.value)}
                        className="w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#1d5fe5]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberForm(false)}
                      className="rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f1f5f9]"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={addingMember}
                      className="flex items-center gap-1 rounded-[8px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7] disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span>
                      {addingMember ? "Đang lưu..." : "Xác nhận thêm ủy quyền"}
                    </button>
                  </div>
                </form>
              )}

              {/* Authorized Members List (GET & DELETE /api/customer/rentals/{agreementId}/authorized-members) */}
              <div className="mt-4 space-y-3">
                {membersLoading ? (
                  <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-5 text-center text-[12px] text-[#58657a]">
                    Đang tải danh sách người được ủy quyền...
                  </div>
                ) : authorizedMembers.length === 0 ? (
                  <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-5 text-center">
                    <span className="material-symbols-outlined text-[26px] text-[#8996a9]">
                      group
                    </span>
                    <div className="mt-1 text-[13px] font-semibold text-[#0b1c30]">
                      Chưa có người được ủy quyền nào cho hợp đồng này
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8996a9]">
                      Nhấn nút &ldquo;Thêm người ủy quyền&rdquo; để cấp quyền ra vào kho cho người thân hoặc đối tác.
                    </p>
                  </div>
                ) : (
                  authorizedMembers.map((member) => {
                    const isActive = (member.status || "active").toLowerCase() === "active";
                    return (
                      <div
                        key={member.id}
                        className={`rounded-[12px] border p-3.5 ${
                          !isActive
                            ? "border-[#eef1f8] bg-[#f8faff] opacity-80"
                            : "border-[#eef1f8] bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold text-[#0b1c30]">
                              {member.fullName}
                            </span>
                            {member.relationshipToCustomer && (
                              <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
                                {member.relationshipToCustomer}
                              </span>
                            )}
                          </div>
                          {isActive ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0e7b4c]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                              Đang ủy quyền
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#eef1f8] px-2 py-0.5 text-[10px] font-semibold text-[#8996a9]">
                              Đã thu hồi
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-[11px] text-[#58657a]">
                          Định danh:{" "}
                          <span className="font-semibold text-[#0b1c30]">
                            {member.identityFingerprint || "Đã xác thực"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#f1f5f9] pt-2">
                          <span className="text-[11px] text-[#8996a9]">
                            Từ: {formatDateDisplay(member.validFrom)}
                            {" • "}
                            {member.validTo
                              ? `Đến: ${formatDateDisplay(member.validTo)}`
                              : "Hiệu lực theo hợp đồng"}
                          </span>

                          {isActive && (
                            <button
                              type="button"
                              disabled={revokingMemberId === member.id}
                              onClick={() => handleRevokeMember(member.id)}
                              className="flex items-center gap-1 rounded-md bg-[#fdecec] px-3 py-1 text-[11px] font-semibold text-[#c0362c] hover:bg-[#fad7d7] disabled:opacity-60"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                person_remove
                              </span>
                              {revokingMemberId === member.id
                                ? "Đang thu hồi..."
                                : "Thu hồi quyền"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Thông tin điểm truy cập
                {selectedRental?.agreementNo && (
                  <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
                    {selectedRental.agreementNo}
                  </span>
                )}
              </div>

              {selectedRental ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#3a475a]">
                        location_on
                      </span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">
                          {selectedRental.facilityName}
                        </div>
                        <div className="text-[10px] text-[#8996a9]">
                          {selectedRental.facilityAddress || selectedRental.facilityCity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#3a475a]">
                        door_sliding
                      </span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">
                          Kho #{selectedRental.unitCode}
                        </div>
                        <div className="text-[10px] text-[#8996a9]">
                          {[selectedRental.floorLabel, selectedRental.zoneLabel]
                            .filter(Boolean)
                            .join(" • ") || selectedRental.unitTypeName}
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">
                      check_circle
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-4 text-center text-[11px] text-[#8996a9]">
                  Chưa có thông tin điểm truy cập.
                </div>
              )}
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Hoạt động truy cập &amp; Ủy quyền
                <span className="text-[10px] font-semibold text-[#8996a9]">
                  {accessLogs.length} sự kiện
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {accessLogs.length === 0 ? (
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-4 text-center text-[11px] text-[#8996a9]">
                    Chưa có hoạt động nào được ghi nhận.
                  </div>
                ) : (
                  accessLogs.map((log) => (
                    <div key={log.id} className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: log.dot }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-[#0b1c30]">{log.title}</div>
                        <div className="text-[10px] text-[#8996a9]">{log.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Cảnh báo an ninh</div>

              <div className="mt-3 space-y-2.5">
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">
                      Cửa mở quá 15 phút
                    </div>
                    <div className="text-[10px] text-[#8996a9]">
                      Phát còi và gửi thông báo điện thoại
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alerts.doorOpen}
                    onChange={() => toggleAlert("doorOpen")}
                    className="h-4 w-4 accent-[#1d5fe5]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Sai mã PIN 5 lần</div>
                    <div className="text-[10px] text-[#8996a9]">
                      Khóa 15 phút theo chính sách bảo mật
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alerts.wrongPin}
                    onChange={() => toggleAlert("wrongPin")}
                    className="h-4 w-4 accent-[#1d5fe5]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">
                      Mở ngoài giờ hoạt động cơ sở
                    </div>
                    <div className="text-[10px] text-[#8996a9]">
                      Cảnh báo trung tâm an ninh
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alerts.afterHours}
                    onChange={() => toggleAlert("afterHours")}
                    className="h-4 w-4 accent-[#1d5fe5]"
                  />
                </label>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AccessControl;
