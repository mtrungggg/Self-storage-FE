import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";

function formatVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

const AGREEMENT_STATUS_LABEL = {
  active: "Đang hiệu lực",
  pending_handover: "Chờ bàn giao",
  expired: "Đã hết hạn",
  delinquent: "Quá hạn nợ",
  terminated: "Đã thanh lý",
};

const AGREEMENT_STATUS_BADGE = {
  active: "bg-[#e7f8ee] text-[#0e7b4c]",
  pending_handover: "bg-[#eef4ff] text-[#1d5fe5]",
  expired: "bg-[#f2f4f8] text-[#8996a9]",
  delinquent: "bg-[#fdecec] text-[#c0362c]",
  terminated: "bg-[#f0f3fa] text-[#58657a]",
};

const DELINQUENCY_STATUS_LABEL = {
  grace: "Trong thời gian ân hạn",
  delinquent: "Quá hạn kéo dài",
  cured: "Đã khắc phục xong",
  waived: "Được miễn giảm",
  termination_started: "Đang niêm phong / xử lý tài sản",
};

const DELINQUENCY_STATUS_BADGE = {
  grace: "bg-[#fff2d8] text-[#a15c00]",
  delinquent: "bg-[#fdecec] text-[#c0362c]",
  cured: "bg-[#e7f8ee] text-[#0e7b4c]",
  waived: "bg-[#eef4ff] text-[#1d5fe5]",
  termination_started: "bg-[#341111] text-white",
};

function ManagerContractsCustomers() {
  const [activeTab, setActiveTab] = useState("agreements"); // agreements | delinquent | transfers | refunds
  const [facilityId, setFacilityId] = useState(1);
  const [facilities, setFacilities] = useState([]);

  // Agreements state
  const [agreements, setAgreements] = useState([]);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreementDetailModal, setAgreementDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Delinquent cases state
  const [delinquentCases, setDelinquentCases] = useState([]);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedDelinquentCase, setSelectedDelinquentCase] = useState(null);
  const [actionForm, setActionForm] = useState({
    actionType: "reminder_sent",
    note: "",
    updateCaseStatus: "",
  });

  // Transfer requests state
  const [transferRequests, setTransferRequests] = useState([]);

  // Refund approvals state
  const [refundApprovals, setRefundApprovals] = useState([]);

  // General state
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Load facilities list
  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await managerService.getFacilities();
        if (res?.data && res.data.length > 0) {
          setFacilities(res.data);
          setFacilityId(res.data[0].id);
        }
      } catch (err) {
        console.warn("Could not load facilities:", err);
      }
    }
    loadFacilities();
  }, []);

  // Load data for active tab
  const loadTabData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (activeTab === "agreements") {
        const res = await managerService.getAgreements(facilityId, {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search.trim() || undefined,
        });
        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        setAgreements(items);
      } else if (activeTab === "delinquent") {
        const res = await managerService.getDelinquentCases(facilityId);
        setDelinquentCases(res?.data || []);
      } else if (activeTab === "transfers") {
        const res = await managerService.getTransferRequests(facilityId);
        setTransferRequests(res?.data || []);
      } else if (activeTab === "refunds") {
        const res = await managerService.getRefundApprovals(facilityId);
        setRefundApprovals(res?.data || []);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab, facilityId, statusFilter]);

  // Open agreement detail modal
  const handleViewAgreementDetail = async (agrId) => {
    try {
      const res = await managerService.getAgreementDetail(agrId);
      if (res?.data) {
        setSelectedAgreement(res.data);
        setAgreementDetailModal(true);
      }
    } catch (err) {
      showToast(err?.message || "Không thể tải chi tiết hợp đồng.");
    }
  };

  // Handle Delinquency Action Submit
  const handleRecordAction = async (e) => {
    e.preventDefault();
    if (!selectedDelinquentCase) return;
    try {
      await managerService.addDelinquencyAction(selectedDelinquentCase.id, actionForm);
      showToast("Đã ghi nhận hành động xử lý quá hạn thành công!");
      setActionModalOpen(false);
      loadTabData();
    } catch (err) {
      showToast(err?.message || "Lỗi khi ghi nhận hành động.");
    }
  };

  // Handle Transfer Request Decision
  const handleDecideTransfer = async (id, decision) => {
    const promptNotes = decision === "rejected" ? window.prompt("Nhập lý do từ chối (tùy chọn):", "") : "";
    try {
      await managerService.decideTransferRequest(id, {
        decision,
        reviewNotes: promptNotes || undefined,
      });
      showToast(decision === "approved" ? "Đã phê duyệt đổi ô kho cho khách!" : "Đã từ chối yêu cầu đổi kho.");
      loadTabData();
    } catch (err) {
      showToast(err?.message || "Lỗi khi xử lý yêu cầu đổi kho.");
    }
  };

  // Handle Refund Approval Decision
  const handleDecideRefund = async (refundId, decision) => {
    const promptReason = decision === "rejected" ? window.prompt("Nhập lý do từ chối hoàn cọc:", "") : "";
    try {
      await managerService.decideRefundApproval(refundId, {
        decision,
        reason: promptReason || undefined,
      });
      showToast(decision === "approved" ? "Đã phê duyệt hoàn cọc cho khách!" : "Đã từ chối hoàn cọc.");
      loadTabData();
    } catch (err) {
      showToast(err?.message || "Lỗi khi xử lý hoàn cọc.");
    }
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match =
          (a.agreementNo || "").toLowerCase().includes(q) ||
          (a.customerName || "").toLowerCase().includes(q) ||
          (a.customerEmail || "").toLowerCase().includes(q) ||
          (a.unitCode || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [agreements, statusFilter, search]);

  return (
    <>
      {/* Top Banner / Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-[10px] border border-[#2dd4a0] bg-[#effcf6] px-4 py-3 text-[12px] font-semibold text-[#0e7b4c] shadow-lg">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center justify-between rounded-[10px] border border-[#e5484d] bg-[#fdecec] px-4 py-2.5 text-[12px] font-semibold text-[#c0362c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-[11px] font-bold underline">
            Đóng
          </button>
        </div>
      )}

      {/* Header & Facility Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#0b1c30]">Contracts &amp; Customers</h1>
          <p className="text-[11px] text-[#8996a9]">
            Quản lý hợp đồng thuê, duyệt đổi kho, xử lý nợ quá hạn và hoàn tiền cọc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]">
            <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">domain</span>
            <span>Cơ sở:</span>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
              className="bg-transparent font-bold text-[#1d5fe5] outline-none"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadTabData}
            className="flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-bold text-[#3a475a] hover:bg-[#f5f7fd]"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            Tải lại
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-[#eef1f8] pb-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab("agreements")}
          className={`flex items-center gap-1.5 rounded-t-[8px] px-3.5 py-2 transition ${
            activeTab === "agreements"
              ? "border-b-2 border-[#1d5fe5] bg-white text-[#1d5fe5]"
              : "text-[#58657a] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          Hợp đồng thuê ({agreements.length})
        </button>

        <button
          onClick={() => setActiveTab("transfers")}
          className={`flex items-center gap-1.5 rounded-t-[8px] px-3.5 py-2 transition ${
            activeTab === "transfers"
              ? "border-b-2 border-[#1d5fe5] bg-white text-[#1d5fe5]"
              : "text-[#58657a] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">sync_alt</span>
          Yêu cầu đổi kho ({transferRequests.length})
        </button>

        <button
          onClick={() => setActiveTab("delinquent")}
          className={`flex items-center gap-1.5 rounded-t-[8px] px-3.5 py-2 transition ${
            activeTab === "delinquent"
              ? "border-b-2 border-[#e5484d] bg-white text-[#c0362c]"
              : "text-[#58657a] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">lock_clock</span>
          Quá hạn &gt; 30 ngày ({delinquentCases.length})
        </button>

        <button
          onClick={() => setActiveTab("refunds")}
          className={`flex items-center gap-1.5 rounded-t-[8px] px-3.5 py-2 transition ${
            activeTab === "refunds"
              ? "border-b-2 border-[#0e7b4c] bg-white text-[#0e7b4c]"
              : "text-[#58657a] hover:text-[#0b1c30]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">assignment_return</span>
          Duyệt hoàn cọc ({refundApprovals.length})
        </button>
      </div>

      {/* TAB 1: RENTAL AGREEMENTS */}
      {activeTab === "agreements" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold">Danh Sách Hợp Đồng Thuê Kho</span>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                {filteredAgreements.length} hợp đồng
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#8996a9]">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã HĐ, tên KH, kho..."
                  className="w-48 bg-transparent text-[11px] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hiệu lực</option>
                <option value="pending_handover">Chờ bàn giao</option>
                <option value="expired">Đã hết hạn</option>
                <option value="delinquent">Quá hạn nợ</option>
              </select>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                  <th className="py-2.5 pr-2">Mã Hợp Đồng</th>
                  <th className="py-2.5 pr-2">Khách Hàng</th>
                  <th className="py-2.5 pr-2">Ô Kho</th>
                  <th className="py-2.5 pr-2">Thời Hạn Thuê</th>
                  <th className="py-2.5 pr-2 text-right">Tiền Thuê / Cọc</th>
                  <th className="py-2.5 pr-2 text-right">Nợ Tồn Đọng</th>
                  <th className="py-2.5 pr-2 text-center">Trạng Thái</th>
                  <th className="py-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#8996a9]">
                      Đang tải danh sách hợp đồng...
                    </td>
                  </tr>
                ) : filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#8996a9]">
                      Không có hợp đồng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((agr) => (
                    <tr key={agr.id} className="border-b border-[#f2f5fb] hover:bg-[#f8faff]">
                      <td className="py-2.5 pr-2 font-bold text-[#1d5fe5]">{agr.agreementNo}</td>
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-[#0b1c30]">{agr.customerName}</div>
                        <div className="text-[10px] text-[#8996a9]">{agr.customerPhone || agr.customerEmail}</div>
                      </td>
                      <td className="py-2.5 pr-2 font-bold text-[#3a475a]">{agr.unitCode}</td>
                      <td className="py-2.5 pr-2 text-[#3a475a]">
                        <div>{agr.startDate} → {agr.endDate}</div>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <div className="font-bold text-[#0b1c30]">{formatVnd(agr.monthlyRent)}/th</div>
                        <div className="text-[9px] text-[#8996a9]">Cọc: {formatVnd(agr.depositAmount)}</div>
                      </td>
                      <td className="py-2.5 pr-2 text-right font-bold text-[#c0362c]">
                        {formatVnd(agr.outstandingBalance)}
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                            AGREEMENT_STATUS_BADGE[agr.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {AGREEMENT_STATUS_LABEL[agr.status] || agr.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleViewAgreementDetail(agr.id)}
                          className="rounded-[6px] border border-[#dfe7f5] bg-white px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DELINQUENT CASES */}
      {activeTab === "delinquent" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[14px] font-bold text-[#c0362c]">
                Hồ Sơ Nợ Quá Hạn &gt; 30 Ngày (Delinquency Cases)
              </span>
              <p className="text-[10px] text-[#8996a9]">
                Quy trình xử lý quá hạn kéo dài, niêm phong kho &amp; xử lý tài sản lưu trữ (BR-REN-04)
              </p>
            </div>
            <span className="rounded-full bg-[#fdecec] px-3 py-1 text-[11px] font-bold text-[#c0362c]">
              {delinquentCases.length} trường hợp
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {delinquentCases.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-[#8996a9]">
                Không có hợp đồng nào quá hạn trên 30 ngày tại cơ sở này.
              </div>
            ) : (
              delinquentCases.map((cs) => (
                <div key={cs.id} className="rounded-[12px] border border-[#f5c2c2] bg-[#fdf8f8] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f2dede] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#c0362c]">{cs.agreementNo}</span>
                      <span className="rounded-[4px] bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                        Kho {cs.unitCode}
                      </span>
                      <span className="font-semibold text-[#0b1c30]">{cs.customerName} ({cs.customerPhone})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          DELINQUENCY_STATUS_BADGE[cs.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {DELINQUENCY_STATUS_LABEL[cs.status] || cs.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDelinquentCase(cs);
                          setActionForm({ actionType: "reminder_sent", note: "", updateCaseStatus: cs.status });
                          setActionModalOpen(true);
                        }}
                        className="flex items-center gap-1 rounded-[6px] bg-[#c0362c] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#a5281f]"
                      >
                        <span className="material-symbols-outlined text-[13px]">gavel</span>
                        Ghi nhận xử lý
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-[10px]">
                    <div>
                      <div className="text-[#8996a9]">Nợ hiện tại:</div>
                      <div className="text-[13px] font-bold text-[#c0362c]">{formatVnd(cs.currentDebt)}</div>
                    </div>
                    <div>
                      <div className="text-[#8996a9]">Số ngày quá hạn:</div>
                      <div className="text-[13px] font-bold text-[#e5484d]">{cs.overdueDays} ngày</div>
                    </div>
                    <div>
                      <div className="text-[#8996a9]">Hạn ân hạn:</div>
                      <div className="font-semibold">{cs.graceEndsAt?.slice(0, 10)}</div>
                    </div>
                    <div>
                      <div className="text-[#8996a9]">Ghi chú:</div>
                      <div className="truncate text-[#58657a]">{cs.notes || "Không có"}</div>
                    </div>
                  </div>

                  {/* Action history */}
                  {cs.actions && cs.actions.length > 0 && (
                    <div className="mt-3 border-t border-[#f2dede] pt-2">
                      <div className="text-[10px] font-bold text-[#3a475a]">Lịch sử xử lý:</div>
                      <div className="mt-1 space-y-1">
                        {cs.actions.map((act) => (
                          <div key={act.id} className="flex items-center justify-between text-[9px] text-[#58657a]">
                            <span>
                              • <b className="text-[#0b1c30]">{act.actionType}</b>: {act.details} (Bởi: {act.performedByName})
                            </span>
                            <span>{act.occurredAt?.slice(0, 16).replace("T", " ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER REQUESTS */}
      {activeTab === "transfers" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#0b1c30]">Yêu Cầu Chuyển Đổi Ô Kho</span>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
              {transferRequests.length} yêu cầu
            </span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                  <th className="py-2.5 pr-2">Mã Hợp Đồng</th>
                  <th className="py-2.5 pr-2">Khách Hàng</th>
                  <th className="py-2.5 pr-2">Kho Hiện Tại</th>
                  <th className="py-2.5 pr-2">Kho Muốn Chuyển</th>
                  <th className="py-2.5 pr-2">Lý Do Đổi Kho</th>
                  <th className="py-2.5 pr-2 text-center">Trạng Thái</th>
                  <th className="py-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {transferRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8996a9]">
                      Chưa có yêu cầu chuyển đổi kho nào.
                    </td>
                  </tr>
                ) : (
                  transferRequests.map((tr) => (
                    <tr key={tr.id} className="border-b border-[#f2f5fb] hover:bg-[#f8faff]">
                      <td className="py-2.5 pr-2 font-bold text-[#1d5fe5]">{tr.agreementNo}</td>
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-[#0b1c30]">{tr.customerName}</div>
                        <div className="text-[10px] text-[#8996a9]">{tr.customerPhone}</div>
                      </td>
                      <td className="py-2.5 pr-2 font-bold text-[#e02424]">{tr.fromUnitCode}</td>
                      <td className="py-2.5 pr-2 font-bold text-[#0e7b4c]">
                        {tr.toUnitCode || tr.requestedUnitTypeName}
                      </td>
                      <td className="py-2.5 pr-2 text-[#58657a]">{tr.reason}</td>
                      <td className="py-2.5 pr-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            tr.status === "approved"
                              ? "bg-[#e7f8ee] text-[#0e7b4c]"
                              : tr.status === "rejected"
                              ? "bg-[#fdecec] text-[#c0362c]"
                              : "bg-[#fff2d8] text-[#a15c00]"
                          }`}
                        >
                          {tr.status === "approved" ? "Đã duyệt" : tr.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {tr.status === "pending" && (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleDecideTransfer(tr.id, "approved")}
                              className="rounded-[6px] bg-[#e7f8ee] px-2.5 py-1 text-[10px] font-bold text-[#0e7b4c] hover:bg-[#c9f1dc]"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleDecideTransfer(tr.id, "rejected")}
                              className="rounded-[6px] border border-[#f5c2c2] bg-[#fdf8f8] px-2.5 py-1 text-[10px] font-bold text-[#c0362c] hover:bg-[#fae6e6]"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REFUND APPROVALS */}
      {activeTab === "refunds" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#0b1c30]">Phê Duyệt Hoàn Tiền Cọc Trả Kho</span>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
              {refundApprovals.length} yêu cầu
            </span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                  <th className="py-2.5 pr-2">Mã Hợp Đồng</th>
                  <th className="py-2.5 pr-2">Khách Hàng</th>
                  <th className="py-2.5 pr-2 text-right">Tiền Cọc Ban Đầu</th>
                  <th className="py-2.5 pr-2 text-right">Khấu Trừ Hư Hại</th>
                  <th className="py-2.5 pr-2 text-right">Đề Xuất Hoàn</th>
                  <th className="py-2.5 pr-2 text-center">Trạng Thái</th>
                  <th className="py-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {refundApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8996a9]">
                      Không có yêu cầu hoàn cọc nào cần duyệt.
                    </td>
                  </tr>
                ) : (
                  refundApprovals.map((rf) => (
                    <tr key={rf.refundId} className="border-b border-[#f2f5fb] hover:bg-[#f8faff]">
                      <td className="py-2.5 pr-2 font-bold text-[#1d5fe5]">{rf.agreementNo}</td>
                      <td className="py-2.5 pr-2 font-semibold text-[#0b1c30]">{rf.customerName}</td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-[#3a475a]">{formatVnd(rf.originalDeposit)}</td>
                      <td className="py-2.5 pr-2 text-right font-bold text-[#c0362c]">
                        -{formatVnd(rf.estimatedDeductions)}
                      </td>
                      <td className="py-2.5 pr-2 text-right font-bold text-[#0e7b4c]">
                        {formatVnd(rf.recommendedRefundAmount)}
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            rf.status === "approved"
                              ? "bg-[#e7f8ee] text-[#0e7b4c]"
                              : rf.status === "rejected"
                              ? "bg-[#fdecec] text-[#c0362c]"
                              : "bg-[#fff2d8] text-[#a15c00]"
                          }`}
                        >
                          {rf.status === "approved" ? "Đã duyệt hoàn" : rf.status === "rejected" ? "Đã từ chối" : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {rf.status === "pending" && (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleDecideRefund(rf.refundId, "approved")}
                              className="rounded-[6px] bg-[#e7f8ee] px-2.5 py-1 text-[10px] font-bold text-[#0e7b4c] hover:bg-[#c9f1dc]"
                            >
                              Duyệt hoàn tiền
                            </button>
                            <button
                              onClick={() => handleDecideRefund(rf.refundId, "rejected")}
                              className="rounded-[6px] border border-[#f5c2c2] bg-[#fdf8f8] px-2.5 py-1 text-[10px] font-bold text-[#c0362c] hover:bg-[#fae6e6]"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AGREEMENT DETAIL MODAL */}
      {agreementDetailModal && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[620px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                Chi tiết Hợp đồng {selectedAgreement.agreementNo}
              </h2>
              <button onClick={() => setAgreementDetailModal(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-[11px]">
              <div className="grid grid-cols-2 gap-3 rounded-[10px] bg-[#f8faff] p-3 sm:grid-cols-4">
                <div>
                  <div className="text-[#8996a9]">Khách hàng:</div>
                  <div className="font-bold text-[#0b1c30]">{selectedAgreement.customerName}</div>
                </div>
                <div>
                  <div className="text-[#8996a9]">Ô kho:</div>
                  <div className="font-bold text-[#1d5fe5]">{selectedAgreement.unitCode}</div>
                </div>
                <div>
                  <div className="text-[#8996a9]">Giá thuê:</div>
                  <div className="font-bold text-[#0e7b4c]">{formatVnd(selectedAgreement.monthlyRent)}/th</div>
                </div>
                <div>
                  <div className="text-[#8996a9]">Nợ hiện tại:</div>
                  <div className="font-bold text-[#c0362c]">{formatVnd(selectedAgreement.totalDebt)}</div>
                </div>
              </div>

              {/* Stored Items */}
              <div>
                <h3 className="font-bold text-[#3a475a]">Danh Mục Đồ Lưu Trữ Khai Báo (Stored Items):</h3>
                <div className="mt-1.5 space-y-1 rounded-[8px] border border-[#eef1f8] p-2">
                  {selectedAgreement.storedItems && selectedAgreement.storedItems.length > 0 ? (
                    selectedAgreement.storedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[10px] text-[#58657a]">
                        <span>• {item.itemName} ({item.quantity} món) - {item.category}</span>
                        <span className="font-semibold text-[#0b1c30]">Khai báo: {formatVnd(item.declaredValue)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#8996a9]">Khách hàng chưa khai báo danh mục đồ.</div>
                  )}
                </div>
              </div>

              {/* Invoices list */}
              <div>
                <h3 className="font-bold text-[#3a475a]">Lịch Sử Hóa Đơn Thuê:</h3>
                <div className="mt-1.5 space-y-1.5">
                  {selectedAgreement.invoices && selectedAgreement.invoices.length > 0 ? (
                    selectedAgreement.invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between rounded-[6px] border border-[#f0f3fa] px-3 py-2 text-[10px]">
                        <div>
                          <span className="font-bold text-[#1d5fe5]">{inv.invoiceNo}</span> • Hạn: {inv.dueDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0b1c30]">{formatVnd(inv.totalAmount)}</span>
                          <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[8px] font-bold text-[#0e7b4c]">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#8996a9]">Chưa có hóa đơn phát sinh.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setAgreementDetailModal(false)}
                className="rounded-[8px] bg-[#0b1c30] px-4 py-2 text-[11px] font-bold text-white hover:bg-black"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELINQUENCY ACTION MODAL */}
      {actionModalOpen && selectedDelinquentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[500px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[15px] font-bold text-[#c0362c]">
                Xử Lý Vi Phạm Quá Hạn {selectedDelinquentCase.unitCode}
              </h2>
              <button onClick={() => setActionModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordAction} className="mt-4 space-y-3 text-[11px]">
              <div>
                <label className="font-bold text-[#3a475a]">Hành động xử lý *</label>
                <select
                  value={actionForm.actionType}
                  onChange={(e) => setActionForm({ ...actionForm, actionType: e.target.value })}
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 font-semibold"
                >
                  <option value="reminder_sent">Gửi cảnh báo / Nhắc nợ (SMS &amp; Email)</option>
                  <option value="late_fee_added">Cộng phụ phí phạt trễ hạn</option>
                  <option value="credential_suspended">Khóa mã PIN &amp; Tạm dừng quyền truy cập</option>
                  <option value="customer_contacted">Đã liên hệ trực tiếp khách hàng</option>
                  <option value="payment_plan">Thiết lập kế hoạch giãn nợ</option>
                  <option value="termination_started">Bắt đầu niêm phong &amp; xử lý tài sản (BR-REN-04)</option>
                  <option value="waived">Miễn giảm phí phạt</option>
                  <option value="note">Ghi chú nghiệp vụ khác</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Cập nhật trạng thái hồ sơ:</label>
                <select
                  value={actionForm.updateCaseStatus}
                  onChange={(e) => setActionForm({ ...actionForm, updateCaseStatus: e.target.value })}
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 font-semibold"
                >
                  <option value="">-- Giữ nguyên trạng thái --</option>
                  <option value="grace">Thời gian ân hạn (grace)</option>
                  <option value="delinquent">Quá hạn kéo dài (delinquent)</option>
                  <option value="termination_started">Đang xử lý tài sản (termination_started)</option>
                  <option value="cured">Đã khắc phục xong (cured)</option>
                  <option value="waived">Miễn giảm (waived)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Ghi chú chi tiết biên bản:</label>
                <textarea
                  rows={3}
                  value={actionForm.note}
                  onChange={(e) => setActionForm({ ...actionForm, note: e.target.value })}
                  placeholder="Ghi nhận thông tin cụ thể (mã biên bản, thỏa thuận, chốt niêm phong...)"
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] p-2.5 outline-none"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#3a475a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#c0362c] px-4 py-2 font-bold text-white hover:bg-[#a5281f]"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerContractsCustomers;
