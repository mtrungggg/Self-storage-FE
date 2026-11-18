// apiClient resolves with the backend ApiResponse envelope ({ success, message, data, errors }).
// These helpers turn it into plain data and raise an Error when the backend reports a failure.

export function unwrap(res, fallbackMessage = "Request failed.") {
  if (res?.success === false) {
    const detail = Array.isArray(res.errors) ? res.errors.join(", ") : "";
    throw new Error(res.message || detail || fallbackMessage);
  }
  return res?.data ?? null;
}

export function unwrapRequired(res, fallbackMessage = "The server returned an empty response.") {
  const data = unwrap(res, fallbackMessage);
  if (data == null) throw new Error(res?.message || fallbackMessage);
  return data;
}

// Paged endpoints answer with { items, totalCount, ... } while others answer with a bare array.
export function toList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export function enc(value) {
  return encodeURIComponent(value);
}
