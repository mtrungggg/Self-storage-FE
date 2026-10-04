// Domain layer: pure filtering logic for daily staff tasks (check-in, check-out/inspection, support ticket, maintenance).
export function normalizeTaskCategory(taskType) {
  const t = (taskType || "").toLowerCase();
  if (t === "check_in" || t === "checkin") return "checkin";
  if (t === "check_out" || t === "checkout" || t === "inspection") return "checkout";
  if (t === "support" || t === "ticket") return "support";
  if (t === "maintenance" || t === "other") return "maintenance";
  return t || "other";
}

export function filterScheduleByType(items, typeId) {
  if (!typeId || typeId === "all") return items;
  return items.filter((item) => {
    const cat = normalizeTaskCategory(item.taskType || item.type);
    return cat === typeId;
  });
}
