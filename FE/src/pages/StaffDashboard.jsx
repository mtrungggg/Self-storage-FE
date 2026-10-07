import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import StaffReservationLookup from "../components/StaffReservationLookup";
import StaffTaskStatus from "../components/StaffTaskStatus";
import StaffFacilityUnits from "../components/StaffFacilityUnits";
import StaffOverdueAgreements from "../components/StaffOverdueAgreements";
import { useStaffDashboard } from "../hooks/useStaffDashboard";

function StaffDashboard() {
  const { user, taskTabs, activeTaskType, setActiveTaskType, filteredTasks, updateTask, tasksLoading, tasksError, taskFacilityId, setTaskFacilityId, loadTasks } = useStaffDashboard();
  const displayName = user?.fullName || user?.name || user?.email || "Staff";
  const roles = Array.isArray(user?.roles) ? user.roles.join(", ") : user?.role || "Staff";

  return <div className="relative min-h-screen text-[#0b1c30]">
    <PageBackground />
    <header className="border-b border-[#e6ebf5] bg-white">
      <div className="mx-auto flex min-h-16 max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d5fe5] text-white"><span className="material-symbols-outlined">warehouse</span></div><div><strong>Staff Operations</strong><p className="text-xs text-[#8996a9]">{displayName} · {roles}</p></div></div>
        <nav className="flex flex-wrap gap-2"><Link to="/staff-move-outs" className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-[#1d5fe5]">Move-out requests</Link><Link to="/staff-support-tickets" className="rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white">Support Tickets</Link></nav>
      </div>
    </header>
    <main className="mx-auto max-w-[1320px] px-4 pb-8 lg:px-6">
      <StaffReservationLookup />
      <StaffFacilityUnits />
      <StaffOverdueAgreements />
      <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-lg font-bold">Shift Tasks</h1><div className="flex flex-wrap gap-1 rounded-lg bg-[#eef4ff] p-1">{taskTabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTaskType(tab.id)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTaskType === tab.id ? "bg-[#0b1c30] text-white" : "text-[#58657a]"}`}>{tab.label} ({tab.count})</button>)}</div></div>
        <form onSubmit={(event) => { event.preventDefault(); setActiveTaskType("all"); loadTasks(); }} className="mt-4 flex flex-wrap items-end gap-2 text-sm"><label className="font-semibold text-[#58657a]">Facility ID (optional)<input type="number" min="1" step="1" value={taskFacilityId} onChange={(event) => setTaskFacilityId(event.target.value)} className="mt-1 block rounded-lg border p-2 text-[#0b1c30]" /></label><button disabled={tasksLoading} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:opacity-50">Load tasks</button></form>
        <div className="mt-4 space-y-3" aria-busy={tasksLoading}>
          {tasksLoading && <p role="status">Loading tasks...</p>}
          {tasksError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{tasksError}</p>}
          {!tasksLoading && !tasksError && filteredTasks.map((task) => <article key={task.id} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{task.title || `Task #${task.id}`}</h2><p className="mt-1 text-xs text-[#58657a]">{task.facilityCode || task.facilityId || "No facility"} · {task.assignedEmployeeName || "Unassigned"} · {task.status || "Unknown"}</p></div><div className="text-right text-xs text-[#58657a]"><p>{task.dueAt ? new Date(task.dueAt).toLocaleString("vi-VN") : "No due date"}</p><strong>{task.progressPercent ?? 0}%</strong></div></div><StaffTaskStatus task={task} onUpdated={updateTask} /></article>)}
          {!tasksLoading && !tasksError && filteredTasks.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-[#8996a9]">No tasks returned by the server.</p>}
        </div>
      </section>
    </main>
  </div>;
}

export default StaffDashboard;
