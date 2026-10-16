const STORAGE_KEY = "g1_admin_crud_v1";

const seed = {
  facilities: [
    { id: "f1", code: "HCM-TD", name: "Kho Thủ Đức", address: "TP. Thủ Đức, TP.HCM", status: "active" },
    { id: "f2", code: "HCM-D7", name: "Kho Quận 7", address: "Quận 7, TP.HCM", status: "active" },
  ],
  users: [
    { id: "u1", fullName: "Nguyễn Minh Anh", email: "manager@g1.vn", phone: "0901234567", role: "manager", facility: "HCM-TD", status: "active" },
    { id: "u2", fullName: "Trần Hoàng Nam", email: "staff@g1.vn", phone: "0907654321", role: "staff", facility: "HCM-D7", status: "active" },
  ],
  tickets: [
    { id: "t1", code: "TCK-20261001", subject: "Khóa thông minh báo pin yếu", customer: "Khôi Võ", facility: "HCM-TD", priority: "high", status: "in_progress", description: "Kiểm tra và thay pin khóa A-101." },
    { id: "t2", code: "TCK-20261002", subject: "Không mở được cổng chính", customer: "Thu Hà", facility: "HCM-D7", priority: "normal", status: "open", description: "Mã PIN không được hệ thống chấp nhận." },
  ],
  notifications: [],
};

function read() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === "object" ? { ...seed, ...stored } : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("admin-data-changed"));
}

export function listAdminRecords(resource) {
  return read()[resource] || [];
}

export function createAdminRecord(resource, record) {
  const data = read();
  const created = { ...record, id: `${resource[0]}${Date.now()}`, createdAt: new Date().toISOString() };
  data[resource] = [created, ...(data[resource] || [])];
  write(data);
  return created;
}

export function updateAdminRecord(resource, id, changes) {
  const data = read();
  data[resource] = (data[resource] || []).map((item) => item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item);
  write(data);
}

export function deleteAdminRecord(resource, id) {
  const data = read();
  data[resource] = (data[resource] || []).filter((item) => item.id !== id);
  write(data);
}

export function getAdminDashboardStats() {
  const data = read();
  return {
    facilities: data.facilities.length,
    users: data.users.length,
    managers: data.users.filter((item) => item.role === "manager").length,
    staff: data.users.filter((item) => item.role === "staff").length,
    openTickets: data.tickets.filter((item) => !["resolved", "closed"].includes(item.status)).length,
    notifications: data.notifications.length,
    recentTickets: data.tickets.slice(0, 5),
    recentNotifications: data.notifications.slice(0, 5),
  };
}
