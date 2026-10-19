import AdminLayouts from "./AdminLayouts";

/**
 * Re-export AdminLayouts làm Layout dùng chung cho Manager.
 * Đảm bảo tính tương thích ngược hoàn toàn nếu có file nào import ManagerLayouts.
 */
export const ManagerLayouts = AdminLayouts;
export default AdminLayouts;
