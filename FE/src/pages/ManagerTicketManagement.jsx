import { useEffect, useState } from "react";
import managerService from "../api/managerService";

const STATUS_BADGE = {
  open: "bg-[#eef4ff] text-[#1d5fe5]",
  in_progress: "bg-[#fff2d8] text-[#a15c00]",
  waiting_customer: "bg-[#f3e8ff] text-[#7c3aed]",
  resolved: "bg-[#e7f8ee] text-[#0e7b4c]",
  closed: "bg-[#eef1f8] text-[#58657a]",
};

const STATUS_LABEL = {
  open: "Mới mở",
  in_progress: "Đang xử lý",
  waiting_customer: "Chờ khách",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};

const PRIORITY_BADGE = {
  urgent: "bg-[#fde8e8] text-[#c81e1e] border border-[#f8b4b4]",
  high: "bg-[#fff2d8] text-[#a15c00]",
  normal: "bg-[#eef4ff] text-[#1d5fe5]",
  low: "bg-[#eef1f8] text-[#58657a]",
};

function ManagerTicketManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Modal state for Create / Edit Ticket
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [form, setForm] = useState({
    customerId: "",
    facilityId: "",
    storageUnitId: "",
    category: "maintenance",
    priority: "normal",
    status: "open",
    subject: "",
    description: "",
    resolution: "",
    assignedEmployeeId: "",
  });

  const [activeTab, setActiveTab] = useState("tickets"); // tickets | charge_proposals
  const [facilityId, setFacilityId] = useState(1);
  const [chargeProposals, setChargeProposals] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await managerService.getTicketsOverview(facilityId);
      const payload = res?.data || res;
      setData(payload);
      if (payload?.tickets?.length > 0 && !selectedTicketId) {
        setSelectedTicketId(payload.tickets[0].id);
      }

      // Fetch Swagger API #13: GET /manager/facilities/{facilityId}/charge-proposals
      try {
        const cpRes = await managerService.getChargeProposals(facilityId);
        if (cpRes?.data) {
          setChargeProposals(cpRes.data);
        }
      } catch (cpErr) {
        console.warn("Could not load charge proposals:", cpErr);
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách Ticket từ SQL Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initFacilities() {
      try {
        const facRes = await managerService.getFacilities();
        if (Array.isArray(facRes?.data) && facRes.data.length > 0) {
          setFacilityId((prev) => (prev ? prev : facRes.data[0].id));
        }
      } catch (err) {
        console.warn("Could not load facilities:", err);
      }
    }
    initFacilities();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [facilityId]);

  const kpis = data?.kpis || {};
  const tickets = data?.tickets || [];
  const customers = data?.customerOptions || [];
  const facilities = data?.facilityOptions || [];
  const units = data?.unitOptions || [];
  const staffMembers = data?.staffOptions || [];

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.ticketNo?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.unitCode?.toLowerCase().includes(q) ||
      t.assignedEmployeeName?.toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  const openCreateModal = () => {
    setEditingTicket(null);
    const defaultCust = customers[0];
    setForm({
      customerId: defaultCust?.customerId || "",
      facilityId: defaultCust?.facilityId || facilities[0]?.id || "",
      storageUnitId: "",
      category: "maintenance",
      priority: "normal",
      status: "open",
      subject: "",
      description: "",
      resolution: "",
      assignedEmployeeId: staffMembers[0]?.employeeId || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTicket(t);
    setForm({
      customerId: t.customerId,
      facilityId: t.facilityId,
      storageUnitId: t.storageUnitId || "",
      category: t.category || "maintenance",
      priority: t.priority || "normal",
      status: t.status || "open",
      subject: t.subject || "",
      description: t.description || "",
      resolution: t.resolution || "",
      assignedEmployeeId: t.assignedEmployeeId || "",
    });
    setModalOpen(true);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!editingTicket && (!form.customerId || !form.facilityId)) {
      alert("Vui lòng chọn khách hàng và cơ sở trước khi tạo Ticket.");
      return;
    }
    try {
      if (editingTicket) {
        await managerService.updateTicket(editingTicket.id, {
          category: form.category,
          priority: form.priority,
          subject: form.subject,
          description: form.description,
          status: form.status,
          resolution: form.resolution || null,
          assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null,
        });
        showToast(`Đã cập nhật Ticket ${editingTicket.ticketNo} vào Database!`);
      } else {
        const res = await managerService.createTicket({
          customerId: Number(form.customerId),
          facilityId: Number(form.facilityId),
          storageUnitId: form.storageUnitId ? Number(form.storageUnitId) : null,
          agreementId: null,
          category: form.category,
          priority: form.priority,
          subject: form.subject,
          description: form.description,
          status: form.status,
          assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null,
          resolution: form.resolution || null,
        });
        const created = res?.data || res;
        if (created?.id) setSelectedTicketId(created.id);
        showToast(`Đã tạo mới Ticket ${created?.ticketNo || ""} vào Database!`);
      }
      setModalOpen(false);
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Lỗi khi lưu Ticket");
    }
  };

  const handleDeleteTicket = async (ticket) => {
    if (!window.confirm(`Xác nhận xóa Ticket ${ticket.ticketNo} (${ticket.subject}) khỏi Database?`)) return;
    try {
      await managerService.deleteTicket(ticket.id);
      showToast(`Đã xóa Ticket ${ticket.ticketNo} khỏi Database!`);
      if (selectedTicketId === ticket.id) {
        setSelectedTicketId(null);
      }
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Lỗi khi xóa Ticket");
    }
  };

  const handleQuickAssignOrStatus = async (ticket, newStatus, newEmployeeId) => {
    try {
      const targetStatus = newStatus ?? ticket.status;
      await managerService.updateTicket(ticket.id, {
        category: ticket.category,
        priority: ticket.priority,
        subject: ticket.subject,
        description: ticket.description,
        status: targetStatus,
        resolution:
          targetStatus === "resolved" || targetStatus === "closed"
            ? ticket.resolution || "Đã được Manager xác nhận hoàn tất xử lý."
            : ticket.resolution,
        assignedEmployeeId:
          newEmployeeId !== undefined ? (newEmployeeId ? Number(newEmployeeId) : null) : ticket.assignedEmployeeId,
      });
      showToast(`Đã cập nhật Ticket ${ticket.ticketNo}!`);
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Lỗi cập nhật nhanh Ticket");
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await managerService.addTicketMessage(selectedTicket.id, {
        body: replyText.trim(),
        isInternal: isInternalNote,
      });
      setReplyText("");
      showToast("Đã gửi phản hồi và lưu vào Database!");
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Không thể gửi tin nhắn");
    }
  };

  const handleDecideProposal = async (proposalId, approve) => {
    try {
      await managerService.decideChargeProposal(proposalId, {
        decision: approve ? "approved" : "rejected",
        reason: approve ? "Manager phê duyệt phụ phí sửa chữa" : "Manager từ chối đề xuất phụ phí",
      });
      showToast(approve ? "Đã phê duyệt đề xuất thu phí!" : "Đã từ chối đề xuất thu phí!");
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Không thể xử lý đề xuất phí");
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-[10px] bg-[#0b1c30] px-4 py-2.5 text-[12px] font-bold text-white shadow-lg">
          <span className="material-symbols-outlined text-[16px] text-[#35d288]">check_circle</span>
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold">Ticket & Phụ Phí Hư Hại</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4a0]" />
            Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#58657a]">
            <span>Cơ sở:</span>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
              className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0b1c30] outline-none"
            >
              {facilities.length > 0 ? (
                facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))
              ) : (
                <option value={facilityId}>Cơ sở #{facilityId}</option>
              )}
            </select>
          </div>

          <button
            onClick={fetchTickets}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f8faff]"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            Làm mới
          </button>
          {activeTab === "tickets" && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(29,95,229,0.22)] hover:bg-[#164dc0]"
            >
              <span className="material-symbols-outlined text-[15px]">add_circle</span>
              Tạo ticket
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mt-4 flex items-center gap-2 border-b border-[#dfe7f5] pb-2">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 rounded-t-[8px] px-4 py-2 text-[12px] font-bold transition ${
            activeTab === "tickets"
              ? "border-b-2 border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
              : "text-[#58657a] hover:bg-[#f8faff]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          Phiếu Hỗ Trợ Kỹ Thuật (Tickets)
          <span className="rounded-full bg-[#1d5fe5] px-2 py-0.5 text-[9px] font-bold text-white">
            {tickets.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("charge_proposals")}
          className={`flex items-center gap-2 rounded-t-[8px] px-4 py-2 text-[12px] font-bold transition ${
            activeTab === "charge_proposals"
              ? "border-b-2 border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
              : "text-[#58657a] hover:bg-[#f8faff]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          Đề Xuất Phụ Phí Hư Hại (Charge Proposals)
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              chargeProposals.filter((c) => c.status === "pending").length > 0
                ? "animate-pulse bg-[#e5484d] text-white"
                : "bg-[#8996a9] text-white"
            }`}
          >
            {chargeProposals.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-[10px] border border-[#f8b4b4] bg-[#fde8e8] p-3 text-[11px] font-semibold text-[#c81e1e]">
          {error}
        </div>
      )}

      {activeTab === "tickets" ? (
        <>
          {/* KPI Cards */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#8996a9]">Tổng Ticket</div>
              <div className="mt-1 text-[20px] font-bold text-[#0b1c30]">{kpis.totalTickets ?? 0}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#1d5fe5]">Mới mở</div>
              <div className="mt-1 text-[20px] font-bold text-[#1d5fe5]">{kpis.openTickets ?? 0}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#a15c00]">Đang xử lý</div>
              <div className="mt-1 text-[20px] font-bold text-[#a15c00]">{kpis.inProgressTickets ?? 0}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#0e7b4c]">Đã giải quyết</div>
              <div className="mt-1 text-[20px] font-bold text-[#0e7b4c]">{kpis.resolvedTickets ?? 0}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#c81e1e]">Khẩn cấp / Cao</div>
              <div className="mt-1 text-[20px] font-bold text-[#c81e1e]">{kpis.urgentTickets ?? 0}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#dfe7f5] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute top-2 left-2.5 text-[15px] text-[#8996a9]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã ticket, chủ đề, khách hàng, kho..."
                  className="w-[260px] rounded-[8px] border border-[#dfe7f5] py-1.5 pr-3 pl-8 text-[11px] outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a] outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="open">Mới mở</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="waiting_customer">Chờ khách</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a] outline-none"
              >
                <option value="all">Mọi mức ưu tiên</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="normal">Bình thường</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="text-[11px] font-semibold text-[#8996a9]">
              Hiển thị {filteredTickets.length} / {tickets.length} ticket
            </div>
          </div>

          {/* Main Content: Table + Detail Panel */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: Ticket List */}
            <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 lg:col-span-7">
              <div className="text-[13px] font-bold">Danh Sách Ticket</div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase text-[#8996a9]">
                      <th className="py-2 pr-2">Mã / Chủ đề</th>
                      <th className="py-2 px-2">Khách hàng / Kho</th>
                      <th className="py-2 px-2">Nhân viên phụ trách</th>
                      <th className="py-2 px-2">Ưu tiên / Trạng thái</th>
                      <th className="py-2 pl-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#8996a9]">
                          Đang tải dữ liệu Ticket từ SQL Server...
                        </td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#8996a9]">
                          Không tìm thấy Ticket nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => {
                        const isSelected = selectedTicket?.id === t.id;
                        return (
                          <tr
                            key={t.id}
                            onClick={() => setSelectedTicketId(t.id)}
                            className={`cursor-pointer border-b border-[#f2f5fb] transition ${
                              isSelected ? "bg-[#eef4ff]/70" : "hover:bg-[#f8faff]"
                            }`}
                          >
                            <td className="py-2.5 pr-2">
                              <div className="font-bold text-[#1d5fe5]">{t.ticketNo}</div>
                              <div className="mt-0.5 font-semibold text-[#0b1c30]">{t.subject}</div>
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="font-semibold">{t.customerName}</div>
                            </td>
                            <td className="py-2.5 px-2" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={t.assignedEmployeeId || ""}
                                onChange={(e) => handleQuickAssignOrStatus(t, t.status, e.target.value)}
                                className="rounded-[6px] border border-[#dfe7f5] bg-white px-2 py-1 text-[10px] font-semibold text-[#3a475a]"
                              >
                                <option value="">-- Chưa phân công --</option>
                                {staffMembers.map((s) => (
                                  <option key={s.employeeId} value={s.employeeId}>
                                    {s.fullName}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_BADGE[t.priority] || PRIORITY_BADGE.normal}`}>
                                  {t.priority}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[t.status] || STATUS_BADGE.open}`}>
                                  {STATUS_LABEL[t.status] || t.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(t)}
                                  title="Chỉnh sửa Ticket"
                                  className="rounded-[6px] border border-[#dfe7f5] p-1 text-[#1d5fe5] hover:bg-[#eef4ff]"
                                >
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(t)}
                                  title="Xóa Ticket"
                                  className="rounded-[6px] border border-[#f8b4b4] p-1 text-[#c81e1e] hover:bg-[#fde8e8]"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Ticket Inspector & Conversation */}
            <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 lg:col-span-5">
              {selectedTicket ? (
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-[#eef1f8] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#1d5fe5]">{selectedTicket.ticketNo}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[selectedTicket.status]}`}>
                          {STATUS_LABEL[selectedTicket.status] || selectedTicket.status}
                        </span>
                      </div>
                      <h2 className="mt-1 text-[14px] font-bold text-[#0b1c30]">{selectedTicket.subject}</h2>
                    </div>
                    <button
                      onClick={() => openEditModal(selectedTicket)}
                      className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                    >
                      Sửa chi tiết
                    </button>
                  </div>

                  <div className="mt-3 rounded-[10px] bg-[#f8faff] p-3 text-[11px] text-[#3a475a]">
                    <div className="text-[9px] font-bold uppercase text-[#8996a9]">Mô tả sự cố / Yêu cầu</div>
                    <p className="mt-1 whitespace-pre-line">{selectedTicket.description}</p>
                    {selectedTicket.resolution && (
                      <div className="mt-2 border-t border-[#dfe7f5] pt-2 text-[#0e7b4c]">
                        <strong>Kết quả xử lý:</strong> {selectedTicket.resolution}
                      </div>
                    )}
                  </div>

                  {/* Quick Status Switcher */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#8996a9]">Đổi trạng thái nhanh:</span>
                    {["open", "in_progress", "waiting_customer", "resolved", "closed"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleQuickAssignOrStatus(selectedTicket, st, selectedTicket.assignedEmployeeId)}
                        className={`rounded-[6px] px-2 py-1 text-[9px] font-bold ${
                          selectedTicket.status === st
                            ? "bg-[#1d5fe5] text-white"
                            : "border border-[#dfe7f5] text-[#58657a] hover:bg-[#f8faff]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Charge Proposals inside ticket */}
                  {selectedTicket.chargeProposals?.length > 0 && (
                    <div className="mt-3 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-3">
                      <div className="text-[10px] font-bold uppercase text-[#a15c00]">Đề xuất phụ phí sửa chữa / dịch vụ</div>
                      <div className="mt-2 space-y-2">
                        {selectedTicket.chargeProposals.map((cp) => (
                          <div key={cp.id} className="flex items-center justify-between gap-2 rounded-[8px] bg-white p-2 text-[10px] shadow-xs">
                            <div>
                              <div className="font-bold text-[#0b1c30]">
                                {Number(cp.amount).toLocaleString("vi-VN")} ₫ — <span className="uppercase">{cp.status}</span>
                              </div>
                              <div className="text-[#58657a]">{cp.description}</div>
                            </div>
                            {cp.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDecideProposal(cp.id, true)}
                                  className="rounded-[6px] bg-[#0e7b4c] px-2 py-1 text-[9px] font-bold text-white"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleDecideProposal(cp.id, false)}
                                  className="rounded-[6px] bg-[#c81e1e] px-2 py-1 text-[9px] font-bold text-white"
                                >
                                  Từ chối
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages / Conversation */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold text-[#0b1c30]">
                      Lịch sử trao đổi ({selectedTicket.messages?.length || 0})
                    </div>
                    <div className="mt-2 max-h-[220px] space-y-2 overflow-y-auto pr-1">
                      {selectedTicket.messages?.length === 0 ? (
                        <div className="text-[10px] text-[#8996a9]">Chưa có phản hồi nào.</div>
                      ) : (
                        selectedTicket.messages?.map((m) => (
                          <div
                            key={m.id}
                            className={`rounded-[8px] p-2.5 text-[10px] ${
                              m.isInternal
                                ? "border border-dashed border-[#f59e0b] bg-[#fffbeb]"
                                : "border border-[#eef1f8] bg-[#f8faff]"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[#3a475a]">
                              <span>
                                {m.authorName} {m.isInternal && <span className="text-[#a15c00]">(Ghi chú nội bộ)</span>}
                              </span>
                              <span className="text-[9px] font-normal text-[#8996a9]">
                                {new Date(m.createdAt).toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <div className="mt-1 text-[#0b1c30]">{m.body}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSendReply} className="mt-3 space-y-2 border-t border-[#eef1f8] pt-3">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập nội dung phản hồi hoặc chỉ đạo kỹ thuật..."
                        className="w-full rounded-[8px] border border-[#dfe7f5] p-2 text-[11px] outline-none focus:border-[#1d5fe5]"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#58657a]">
                          <input
                            type="checkbox"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="accent-[#1d5fe5]"
                          />
                          Ghi chú nội bộ (Khách không thấy)
                        </label>
                        <button
                          type="submit"
                          className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#164dc0]"
                        >
                          Gửi tin nhắn
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[11px] text-[#8996a9]">
                  Chọn một Ticket bên trái để xem chi tiết và phản hồi.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Charge Proposals Tab (Swagger API #13 & #14) */
        <div className="mt-4 space-y-4">
          {/* KPI Cards for Charge Proposals */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#8996a9]">Tổng đề xuất phụ phí</div>
              <div className="mt-1 text-[20px] font-bold text-[#0b1c30]">{chargeProposals.length}</div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#a15c00]">Chờ duyệt</div>
              <div className="mt-1 text-[20px] font-bold text-[#a15c00]">
                {chargeProposals.filter((c) => c.status === "pending").length}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#0e7b4c]">Đã duyệt thu phí</div>
              <div className="mt-1 text-[20px] font-bold text-[#0e7b4c]">
                {chargeProposals.filter((c) => c.status === "approved").length}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#c81e1e]">Từ chối đề xuất</div>
              <div className="mt-1 text-[20px] font-bold text-[#c81e1e]">
                {chargeProposals.filter((c) => c.status === "rejected").length}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
              <div className="text-[9px] font-bold uppercase text-[#1d5fe5]">Tổng giá trị phụ phí</div>
              <div className="mt-1 text-[17px] font-bold text-[#1d5fe5]">
                {chargeProposals
                  .reduce((sum, c) => sum + Number(c.amount || 0), 0)
                  .toLocaleString("vi-VN")}{" "}
                ₫
              </div>
            </div>
          </div>

          {/* Proposals List Table */}
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eef1f8]">
              <div>
                <h3 className="text-[13px] font-bold text-[#0b1c30]">
                  Danh Sách Đề Xuất Phụ Phí Sửa Chữa & Hư Hại
                </h3>
                <p className="text-[11px] text-[#8996a9]">
                  Swagger API #13 &amp; #14: Manager kiểm tra hư hại do nhân viên kỹ thuật lập và phê duyệt xuất hóa đơn
                </p>
              </div>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5]">
                {chargeProposals.length} đề xuất
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase text-[#8996a9]">
                    <th className="py-2.5 pr-2">Mã / Tiêu đề Sự Cố</th>
                    <th className="py-2.5 px-2">Khách hàng &amp; Hợp đồng</th>
                    <th className="py-2.5 px-2">Kỹ thuật viên lập</th>
                    <th className="py-2.5 px-2 text-right">Số tiền đề xuất</th>
                    <th className="py-2.5 px-2">Mô tả hư hại</th>
                    <th className="py-2.5 px-2 text-center">Trạng thái</th>
                    <th className="py-2.5 pl-2 text-right">Quyết định của Quản lý</th>
                  </tr>
                </thead>
                <tbody>
                  {chargeProposals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#8996a9]">
                        Hiện không có đề xuất phụ phí nào tại cơ sở này.
                      </td>
                    </tr>
                  ) : (
                    chargeProposals.map((cp) => (
                      <tr key={cp.id} className="border-b border-[#f2f5fb] hover:bg-[#f8faff]">
                        <td className="py-3 pr-2">
                          <span className="font-bold text-[#1d5fe5]">CP-#{cp.id}</span>
                          <div className="font-semibold text-[#0b1c30]">{cp.ticketTitle || `Ticket #${cp.ticketId}`}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-semibold">{cp.customerName}</div>
                          <div className="text-[10px] text-[#8996a9]">{cp.agreementNo || `HĐ #${cp.agreementId}`}</div>
                        </td>
                        <td className="py-3 px-2 font-medium text-[#3a475a]">
                          {cp.proposedByStaffName || `NV #${cp.proposedBy}`}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-[#e5484d]">
                          {Number(cp.amount || 0).toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="py-3 px-2 max-w-[280px]">
                          <div className="line-clamp-2 text-[#3a475a]">{cp.description}</div>
                          {cp.decisionReason && (
                            <div className="mt-1 text-[10px] text-[#0e7b4c]">
                              <strong>Ghi chú:</strong> {cp.decisionReason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              cp.status === "approved"
                                ? "bg-[#e7f8ee] text-[#0e7b4c]"
                                : cp.status === "rejected"
                                ? "bg-[#fde8e8] text-[#c81e1e]"
                                : "bg-[#fff2d8] text-[#a15c00]"
                            }`}
                          >
                            {cp.status === "approved"
                              ? "Đã duyệt"
                              : cp.status === "rejected"
                              ? "Từ chối"
                              : "Chờ duyệt"}
                          </span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          {cp.status === "pending" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleDecideProposal(cp.id, true)}
                                className="flex items-center gap-1 rounded-[6px] bg-[#0e7b4c] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-[#0c6b41]"
                              >
                                <span className="material-symbols-outlined text-[13px]">check</span>
                                Duyệt thu phí
                              </button>
                              <button
                                onClick={() => handleDecideProposal(cp.id, false)}
                                className="flex items-center gap-1 rounded-[6px] border border-[#f8b4b4] bg-[#fde8e8] px-2.5 py-1 text-[10px] font-bold text-[#c81e1e] hover:bg-[#fbd5d5]"
                              >
                                <span className="material-symbols-outlined text-[13px]">close</span>
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#8996a9]">
                              {cp.decidedAt ? new Date(cp.decidedAt).toLocaleString("vi-VN") : "Đã xử lý"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Edit Ticket */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[560px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h3 className="text-[15px] font-bold">
                {editingTicket ? `Cập nhật Ticket ${editingTicket.ticketNo}` : "Tạo Ticket Hỗ Trợ Mới"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Khách hàng *</label>
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    disabled={Boolean(editingTicket)}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Cơ sở kho *</label>
                  <select
                    value={form.facilityId}
                    onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
                    disabled={Boolean(editingTicket)}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Danh mục *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="maintenance">Maintenance (Bảo trì)</option>
                    <option value="access_issue">Access Issue (Lỗi ra vào)</option>
                    <option value="billing">Billing (Hóa đơn)</option>
                    <option value="climate_control">Climate Control (Nhiệt độ/Ẩm)</option>
                    <option value="security">Security (An ninh)</option>
                    <option value="other">Other (Khác)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Mức ưu tiên *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="low">Low (Thấp)</option>
                    <option value="normal">Normal (Bình thường)</option>
                    <option value="high">High (Cao)</option>
                    <option value="urgent">Urgent (Khẩn cấp)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Trạng thái *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="open">Open (Mới mở)</option>
                    <option value="in_progress">In Progress (Đang xử lý)</option>
                    <option value="waiting_customer">Waiting Customer (Chờ khách)</option>
                    <option value="resolved">Resolved (Đã giải quyết)</option>
                    <option value="closed">Closed (Đã đóng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Phân công Nhân viên phụ trách</label>
                  <select
                    value={form.assignedEmployeeId}
                    onChange={(e) => setForm({ ...form, assignedEmployeeId: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {staffMembers.map((s) => (
                      <option key={s.employeeId} value={s.employeeId}>
                        {s.fullName} ({s.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Ô kho liên quan (Tùy chọn)</label>
                  <select
                    value={form.storageUnitId}
                    onChange={(e) => setForm({ ...form, storageUnitId: e.target.value })}
                    disabled={Boolean(editingTicket)}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Không chọn ô kho --</option>
                    {units
                      .filter((u) => !form.facilityId || Number(u.facilityId) === Number(form.facilityId))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          Kho {u.unitCode} ({u.unitTypeName})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Tiêu đề Ticket *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="VD: Cửa cuốn Kho A-101 bị kẹt cảm biến từ..."
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Mô tả chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả cụ thể tình trạng sự cố hoặc yêu cầu hỗ trợ của khách..."
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none focus:border-[#1d5fe5]"
                />
              </div>

              {(form.status === "resolved" || form.status === "closed" || editingTicket) && (
                <div>
                  <label className="font-bold text-[#3a475a]">Kết quả xử lý / Nghiệm thu (Resolution)</label>
                  <input
                    type="text"
                    value={form.resolution}
                    onChange={(e) => setForm({ ...form, resolution: e.target.value })}
                    placeholder="Ghi chú biên bản hoàn tất..."
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none focus:border-[#1d5fe5]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#164dc0]"
                >
                  {editingTicket ? "Lưu cập nhật" : "Tạo Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerTicketManagement;
