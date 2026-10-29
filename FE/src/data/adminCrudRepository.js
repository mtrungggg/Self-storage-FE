/**
 * Admin CRUD repository - Local storage fallback without mock seed data.
 */
import STORAGE_KEYS from "../constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.ADMIN_CRUD_CACHE;

const seed = {
  facilities: [],
  users: [],
  tickets: [],
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
