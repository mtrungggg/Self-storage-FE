import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats } from "../data/adminCrudRepository";

export default function AdminDashboard() {
  const [stats, setStats] = useState(getAdminDashboardStats);
  useEffect(() => { const reload = () => setStats(getAdminDashboardStats()); window.addEventListener("admin-data-changed", reload); return () => window.removeEventListener("admin-data-changed", reload); }, []);
  const cards = [
    ["Kho đang quản lý", stats.facilities, "warehouse", "/admin-facilities"], ["Tổng nhân sự", stats.users, "groups", "/admin-users"],
    ["Manager", stats.managers, "supervisor_account", "/admin-users"], ["Staff", stats.staff, "badge", "/admin-users"],
    ["Ticket chưa đóng", stats.openTickets, "support_agent", "/admin-tickets"], ["Thông báo đã gửi", stats.notifications, "notifications", "/admin-notifications"],
  ];
  return <div className="mx-auto max-w-[1400px]"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p><h1 className="mt-1 text-2xl font-bold">Dashboard quản trị</h1><p className="mt-1 text-sm text-[#58657a]">Theo dõi và quản lý hoạt động hệ thống G1 SelfStorage.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, icon, to]) => <Link to={to} key={label} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#58657a]">{label}</span><span className="material-symbols-outlined rounded-xl bg-[#eef4ff] p-2 text-[#1d5fe5]">{icon}</span></div><strong className="mt-3 block text-3xl">{value}</strong></Link>)}</div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-[#dfe7f5] bg-white p-5"><h2 className="font-bold">Ticket gần đây</h2><div className="mt-3 space-y-3">{stats.recentTickets.map((ticket) => <div key={ticket.id} className="flex items-center justify-between rounded-xl bg-[#f8faff] p-3"><div><div className="text-xs font-bold text-[#1d5fe5]">{ticket.code}</div><div className="text-sm font-semibold">{ticket.subject}</div></div><span className="rounded-full bg-white px-2 py-1 text-xs">{ticket.status}</span></div>)}{!stats.recentTickets.length && <p className="text-sm text-[#58657a]">Chưa có ticket.</p>}</div></section>
    <section className="rounded-2xl border border-[#dfe7f5] bg-white p-5"><h2 className="font-bold">Thông báo gần đây</h2><div className="mt-3 space-y-3">{stats.recentNotifications.map((item) => <div key={item.id} className="rounded-xl bg-[#f8faff] p-3"><div className="flex justify-between gap-3"><span className="text-sm font-semibold">{item.title}</span><span className="text-xs text-green-700">Đã gửi</span></div><p className="mt-1 line-clamp-2 text-xs text-[#58657a]">{item.message}</p></div>)}{!stats.recentNotifications.length && <p className="text-sm text-[#58657a]">Chưa gửi thông báo nào.</p>}</div></section></div>
  </div>;
}
