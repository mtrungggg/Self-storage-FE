import apiClient from "./apiClient";

export default {
  async inspect(id, payload) {
    const res = await apiClient.post(`/staff/move-outs/${encodeURIComponent(id)}/inspect`, payload);
    if (res?.success !== true) throw new Error(res?.message || "Unable to save inspection.");
    if (!res.data || res.data.inspectionId == null) throw new Error("The server did not return inspection results.");
    return res.data;
  },
  async getMoveOuts({ facilityId, date } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (date) params.date = date;
    const res = await apiClient.get("/staff/move-outs", { params });
    if (res?.success !== true) throw new Error(res?.message || res?.errors?.join(", ") || "Unable to load move-out requests.");
    if (res.data == null) return [];
    if (!Array.isArray(res.data)) throw new Error("The server returned an invalid move-out list.");
    return res.data;
  },
};
