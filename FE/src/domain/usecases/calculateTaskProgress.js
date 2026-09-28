// Domain layer: summarizes completion progress across a list of tasks.
export function calculateTaskProgress(tasks) {
  const completed = tasks.filter((task) => task.status === "done").length;
  return { completed, total: tasks.length };
}
