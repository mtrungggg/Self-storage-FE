import { useSecurityCenter } from "../hooks/useSecurityCenter";

function AdminSecurityCenter() {
  const {
    securityBanner,
    header,
    headerActions,
    kpis,
    permissionRoles,
    permissionModules,
    otpTtlOptions,
    guestPinPolicy,
    updateGuestPinPolicy,
    intrusionPolicy,
    updateIntrusionPolicy,
  } = useSecurityCenter();

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1d5fe5]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1d5fe5]" />
        {securityBanner.label}
        <span className="font-semibold normal-case text-[#8996a9]">• {securityBanner.version}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <p className="mt-1 max-w-[540px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "new_user" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
              {kpi.label}
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">{kpi.icon}</span>
            </div>
            <div className="mt-1 text-[17px] font-bold">{kpi.value}</div>
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">1</span>
            Ma trận Phân quyền Chi tiết (Role Permission Matrix)
          </div>
          <span className="text-[10px] font-bold text-[#1d5fe5]">Chế độ Khóa chính sách RBAC</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[10px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Phân hệ chức năng</th>
                {permissionRoles.map((role) => (
                  <th key={role.id} className="py-2 px-2 text-center">
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionModules.map((module) => (
                <tr key={module.id} className="border-b border-[#f2f5fb]">
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-semibold">{module.label}</div>
                    <div className="text-[9px] text-[#8996a9]">{module.note}</div>
                  </td>
                  {permissionRoles.map((role) => (
                    <td key={role.id} className="py-2.5 px-2 text-center align-top">
                      {module.access[role.id] ? (
                        <span className="inline-block rounded-[6px] bg-[#eef4ff] px-2 py-1 text-[9px] font-semibold text-[#1d5fe5]">
                          {module.access[role.id]}
                        </span>
                      ) : (
                        <span className="text-[#c7d1e6]">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-1.5 text-[13px] font-bold">
          <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">2</span>
          Cấu hình An ninh Khóa chốt IoT & Cổng điện tử
        </div>
        <p className="mt-1 text-[10px] text-[#8996a9]">Thiết lập tham số mã OTP Kiosk, quy tắc tự động hóa và chế độ phòng chống đột nhập.</p>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-[10px] border border-[#eef1f8] p-3">
            <div className="text-[11px] font-bold">Quy định Cấp mã PIN / OTP Tạm thời cho khách</div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">Tự động sinh mã qua SMS/App khi hợp đồng bắt đầu hiệu lực</p>

            <div className="mt-2 text-[9px] font-bold uppercase text-[#8996a9]">Thời gian sống mã OTP</div>
            <div className="mt-1 inline-flex rounded-[8px] bg-[#f0f3fa] p-0.5">
              {otpTtlOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateGuestPinPolicy("otpTtl", option.id)}
                  className={`rounded-[6px] px-2.5 py-1 text-[10px] font-semibold transition ${
                    guestPinPolicy.otpTtl === option.id ? "bg-[#1d5fe5] text-white" : "text-[#58657a]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="mt-2 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={guestPinPolicy.autoRevokeOnCheckout}
                onChange={(event) => updateGuestPinPolicy("autoRevokeOnCheckout", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Tự động hủy quyền truy cập sau khi trả kho
            </label>
            <label className="mt-1.5 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={guestPinPolicy.limitUnlocksPerShift}
                onChange={(event) => updateGuestPinPolicy("limitUnlocksPerShift", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Giới hạn số lần mở cửa kho trong ca (cảnh báo nếu &gt;8 lần/2 giờ)
            </label>
          </div>

          <div className="rounded-[10px] border border-[#eef1f8] p-3">
            <div className="text-[11px] font-bold">Cảnh báo Xâm nhập Trái phép & Còi Báo động</div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">Phản ứng tự động khi phát hiện cửa/khoang bị mở sai lệch</p>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[9px] text-[#8996a9]">Khóa Kiosk sau số lần nhập sai PIN:</span>
              <input
                value={intrusionPolicy.maxFailedPinAttempts}
                onChange={(event) => updateIntrusionPolicy("maxFailedPinAttempts", event.target.value)}
                className="w-12 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-center text-[11px] font-semibold"
              />
              <span className="text-[9px] text-[#8996a9]">lần</span>
            </div>

            <label className="mt-2 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={intrusionPolicy.sirenEnabled}
                onChange={(event) => updateIntrusionPolicy("sirenEnabled", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Kích hoạt còi báo động trạm (Siren 110dB)
            </label>
            <label className="mt-1.5 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={intrusionPolicy.notifyAuthoritiesEnabled}
                onChange={(event) => updateIntrusionPolicy("notifyAuthoritiesEnabled", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Đẩy cảnh báo tới Bảo vệ trạm & cơ quan chức năng kèm ảnh camera
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSecurityCenter;
