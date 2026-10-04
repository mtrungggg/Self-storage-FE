import apiClient from "./apiClient";

function unwrap(response) {
  if (response?.success !== true) {
    throw new Error(response?.message || response?.errors?.join(", ") || "Unable to process support tickets.");
  }
  return response.data;
}

export default {
  async createTicket(payload) {
    const ticket = unwrap(await apiClient.post("/customer/support-tickets", payload));
    if (!ticket || ticket.id == null) throw new Error("The server did not return the created ticket.");
    return ticket;
  },
  async getTickets(status) {
    const tickets = unwrap(await apiClient.get("/customer/support-tickets", {
      params: status && status !== "all" ? { status } : {},
    }));
    if (tickets == null) return [];
    if (!Array.isArray(tickets)) throw new Error("The server returned an invalid ticket list.");
    return tickets;
  },
};
