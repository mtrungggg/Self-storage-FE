import apiClient from "./apiClient";

export default {
  async updateStatus(id, { status, progressPercent }) {
    const res = await apiClient.put(`/staff/tasks/${encodeURIComponent(id)}/status`, { status, progressPercent });
    if (res?.success !== true) throw new Error(res?.message || "Unable to update task.");
    if (!res.data || res.data.id == null) throw new Error("The server did not return the updated task.");
    return res.data;
  },
  async getTasks(facilityId) {
    const res = await apiClient.get("/staff/tasks", { params: facilityId ? { facilityId } : {} });
    if (res?.success !== true) throw new Error(res?.message || "Unable to load tasks.");
    if (res.data == null) return [];
    if (!Array.isArray(res.data)) throw new Error("The server returned an invalid task list.");
    return res.data;
  },
};
