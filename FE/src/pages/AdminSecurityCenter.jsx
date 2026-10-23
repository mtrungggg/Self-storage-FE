import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminDashboardService from "../api/adminDashboardService";
import adminLoginHistoryService from "../api/adminLoginHistoryService";
import adminAuditLogService from "../api/adminAuditLogService";
import adminUserService from "../api/adminUserService";

const roleLabels = {
  storage_customer: "Khách hàng",
  facility_staff: "Nhân viên kho",
  facility_manager: "Quản lý kho",
  business_operations_manager: "Quản lý vận hành",
  system_administrator: "Quản trị viên",
};
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

function KpiCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#1d5fe5]"><span className="material-symbols-outlined text-[22px]">{icon}</span><span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#58657a]">{label}</span></div>
      <div className="mt-2 text-[22px] font-bold">{value}</div>
      {sub && <p className="mt-0.5 text-[11px] text-[#8996a9]">{sub}</p>}
    </div>
  );
}

export default function AdminSecurityCenter() {
  const [overview, setOverview] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [auditLogs, setAuditLogs] = useState(null);
  const [roleCounts, setRoleCounts] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.allSettled([
      adminDashboardService.getOverview(),
      adminLoginHistoryService.getHistories({ PageNumber: 1, PageSize: 10 }),
      adminAuditLogService.getLogs({ PageNumber: 1, PageSize: 10 }),
      adminUserService.getUsers({ PageNumber: 1, PageSize: 200 }),
    ]).then(([overviewRes, loginRes, auditRes, usersRes]) => {
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
      if (loginRes.status === "fulfilled") setLoginData(loginRes.value);
      if (auditRes.status === "fulfilled") setAuditLogs(auditRes.value);
      if (usersRes.status === "fulfilled") {
        const counts = {};
        for (const user of usersRes.value.items) {
          for (const role of user.roles || []) counts[role] = (counts[role] || 0) + 1;
        }
        setRoleCounts(counts);
      }
      const failures = [overviewRes, loginRes, auditRes, usersRes].filter((r) => r.status === "rejected");
      if (failures.length > 0) setError(failures.map((f) => f.reason?.message).filter(Boolean).join(" · "));
      setLoading(false);
    });
  }, []);

  const suspiciousAttempts = (loginData?.histories?.items || []).filter(
    (h) => h.isSuspicious || h.result !== "succeeded"
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">shield_lock</span>
            Trung tâm bảo mật &amp; phân quyền
          </h1>
          <p className="mt-1 max-w-[640px] text-[13px] text-[#8996a9]">
            Tổng quan tài khoản, phân quyền theo vai trò, và các lượt đăng nhập đáng chú ý — dữ liệu lấy trực tiếp từ hệ thống.
          </p>
        </div>
      </div>

      {loading && <p role="status" className="mt-6 text-center text-sm text-[#58657a]">Đang tải dữ liệu...</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon="badge" label="Tổng tài khoản" value={overview?.userKpi?.totalUsers ?? "—"} sub={`${overview?.userKpi?.totalCustomers ?? 0} khách hàng · ${overview?.userKpi?.totalStaff ?? 0} nhân sự`} />
            <KpiCard icon="login" label="Lượt đăng nhập gần đây" value={loginData?.summary?.totalAttempts ?? "—"} sub={`${loginData?.summary?.succeededAttempts ?? 0} thành công`} />
            <KpiCard icon="gpp_maybe" label="Lượt đáng ngờ / thất bại" value={(loginData?.summary?.suspiciousAttemptsCount ?? 0) + (loginData?.summary?.failedAttempts ?? 0)} sub={`${loginData?.summary?.lockedAttempts ?? 0} bị khóa · ${loginData?.summary?.blockedAttempts ?? 0} bị chặn`} />
            <KpiCard icon="history" label="Nhật ký quản trị" value={auditLogs?.totalCount ?? "—"} sub="Xem toàn bộ tại Audit Log" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="font-bold">Phân bổ vai trò (RBAC)</h2>
              <div className="mt-3 space-y-2">
                {Object.entries(roleLabels).map(([role, label]) => {
                  const count = roleCounts?.[role] || 0;
                  const total = overview?.userKpi?.totalUsers || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={role}>
                      <div className="flex justify-between text-[12px]"><span className="font-semibold">{label}</span><span>{count} tài khoản ({pct}%)</span></div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#eef1f8]"><div className="h-full rounded-full bg-[#1d5fe5]" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <Link to="/admin-users" className="mt-4 inline-block text-[12px] font-bold text-[#1d5fe5] hover:underline">Quản lý người dùng & vai trò →</Link>
            </section>

            <section className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="font-bold">Lượt đăng nhập đáng chú ý</h2>
              <div className="mt-3 space-y-2">
                {suspiciousAttempts.length === 0 && <p className="text-[12px] text-[#8996a9]">Không có lượt đăng nhập bất thường gần đây.</p>}
                {suspiciousAttempts.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg border border-[#fecdca] bg-[#fffbfa] p-2.5 text-[12px]">
                    <div>
                      <div className="font-semibold">{h.attemptedEmail}</div>
                      <div className="text-[#8996a9]">{h.ipAddress} · {formatDate(h.occurredAt)}</div>
                    </div>
                    <span className="rounded-full bg-[#fee4e2] px-2 py-0.5 font-bold text-[#d92d20]">{h.result}</span>
                  </div>
                ))}
              </div>
              <Link to="/admin-login-histories" className="mt-4 inline-block text-[12px] font-bold text-[#1d5fe5] hover:underline">Xem toàn bộ lịch sử đăng nhập →</Link>
            </section>
          </div>

          <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-sm">
            <h2 className="font-bold">Nhật ký hoạt động quản trị gần đây</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                  {["Thời gian", "Hành động", "Đối tượng", "Người thực hiện"].map((label) => <th key={label} className="p-3">{label}</th>)}
                </tr></thead>
                <tbody>
                  {(auditLogs?.items || []).map((log) => (
                    <tr key={log.id} className="border-b border-[#eef1f8]">
                      <td className="whitespace-nowrap p-3">{formatDate(log.occurredAt)}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">{log.entityType} #{log.entityId}</td>
                      <td className="p-3">{log.actorEmail || log.actorUserId || "—"}</td>
                    </tr>
                  ))}
                  {(!auditLogs?.items || auditLogs.items.length === 0) && <tr><td colSpan={4} className="p-8 text-center text-[#58657a]">Chưa có nhật ký nào.</td></tr>}
                </tbody>
              </table>
            </div>
            <Link to="/admin-audit-log" className="mt-4 inline-block text-[12px] font-bold text-[#1d5fe5] hover:underline">Xem toàn bộ nhật ký quản trị →</Link>
          </section>
        </>
      )}
    </div>
  );
}
