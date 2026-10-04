// Domain layer: summarizes completion progress across a list of tasks.
export function calculateTaskProgress(tasks) {
  const completed = tasks.filter((task) => {
    const s = (task.status || "").toLowerCase();
    return s === "done" || s === "completed";
  }).length;
  return { completed, total: tasks.length };
}
