import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import staffTaskService from "../api/staffTaskService";

export function useStaffDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskFacilityId, setTaskFacilityId] = useState("");
  const [activeTaskType, setActiveTaskType] = useState("all");
  const requestId = useRef(0);

  async function loadTasks(facilityId = taskFacilityId) {
    const currentRequest = ++requestId.current;
    setTasksLoading(true);
    setTasksError("");
    try {
      const data = await staffTaskService.getTasks(facilityId);
      if (currentRequest === requestId.current) setTasks(data);
    } catch (err) {
      if (currentRequest === requestId.current) setTasksError(err.message || "Unable to load tasks.");
    } finally {
      if (currentRequest === requestId.current) setTasksLoading(false);
    }
  }

  useEffect(() => {
    loadTasks("");
    return () => { requestId.current++; };
  }, []);

  const taskTabs = useMemo(() => [
    { id: "all", label: "All", count: tasks.length },
    ...[...new Set(tasks.map((task) => task.taskType).filter(Boolean))].map((type) => ({
      id: type,
      label: type.replaceAll("_", " "),
      count: tasks.filter((task) => task.taskType === type).length,
    })),
  ], [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => activeTaskType === "all" || task.taskType === activeTaskType),
    [tasks, activeTaskType],
  );

  return {
    user, taskTabs, activeTaskType, setActiveTaskType, filteredTasks,
    updateTask: (updated) => setTasks((current) => current.map((task) => task.id === updated.id ? updated : task)),
    tasksLoading, tasksError, taskFacilityId, setTaskFacilityId, loadTasks,
  };
}
