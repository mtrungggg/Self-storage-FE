// Data layer: thin fetch wrapper around the Self-Storage backend REST API.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:51282";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", body, token, headers } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.", 0, null);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message || payload?.errors?.[0] || payload?.title || `Yêu cầu thất bại (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
};
