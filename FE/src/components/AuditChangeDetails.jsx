import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import { ArrowRight, Copy, GitCompareArrows } from "lucide-react";
import "../styles/audit-details.css";

function parsePayload(value) {
  if (value == null || value === "") return { value: undefined };
  if (typeof value !== "string") return { value };
  try { return { value: JSON.parse(value) }; }
  catch { return { value, invalid: true }; }
}

function sameValue(before, after) {
  if (Object.is(before, after)) return true;
  if (!before || !after || typeof before !== "object" || typeof after !== "object") return false;
  if (Array.isArray(before) !== Array.isArray(after)) return false;
  const keys = Object.keys(before);
  return keys.length === Object.keys(after).length && keys.every((key) => Object.hasOwn(after, key) && sameValue(before[key], after[key]));
}

const FIELD_LABELS = {
  Value: "Nội dung ghi nhận",
  Status: "Trạng thái",
  Role: "Vai trò",
  Roles: "Danh sách vai trò",
  IsActive: "Trạng thái kích hoạt",
  Email: "Địa chỉ Email",
  PhoneNumber: "Số điện thoại",
  FullName: "Họ và tên",
  Address: "Địa chỉ",
  DepositAmount: "Tiền cọc (VNĐ)",
  MonthlyPrice: "Đơn giá tháng (VNĐ)",
  MonthlyRate: "Đơn giá tháng (VNĐ)",
  Reason: "Lý do",
  FacilityName: "Cơ sở kho",
  FacilityId: "Mã cơ sở",
  UnitCode: "Mã ô kho",
  StorageUnitId: "Mã ô kho",
  AgreementId: "Mã hợp đồng",
  CustomerId: "Mã khách hàng",
};

function fieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\bId\b/g, "ID").replace(/^./, (letter) => letter.toUpperCase());
}

function formatAuditText(str) {
  if (typeof str !== "string") return str;
  // Match staff assignment: Staff: Name (EMP-123) -> Facility: Facility Name (facility_staff)
  const staffMatch = str.match(/Staff:\s*(.*?)\s*\((.*?)\)\s*->\s*Facility:\s*(.*?)\s*\((.*?)\)/i);
  if (staffMatch) {
    const [, name, empId, facility, role] = staffMatch;
    const roleVN = role === "facility_staff" ? "Nhân viên cơ sở" : role === "facility_manager" ? "Quản lý cơ sở" : role;
    return `Phân công nhân viên: ${name} (${empId}) vào cơ sở "${facility}" với vai trò ${roleVN}`;
  }
  // Match revoke: Revoke Staff: ... -> Facility: ...
  const revokeMatch = str.match(/Revoke.*?Staff:\s*(.*?)\s*\((.*?)\)\s*->\s*Facility:\s*(.*?)(?:\s*\(|$)/i);
  if (revokeMatch) {
    const [, name, empId, facility] = revokeMatch;
    return `Thu hồi phân công nhân viên: ${name} (${empId}) tại cơ sở "${facility}"`;
  }
  // Generic arrow: Old -> New
  if (str.includes(" -> ")) {
    const parts = str.split(" -> ");
    return `Chuyển từ "${parts[0].trim()}" sang "${parts[1].trim()}"`;
  }
  // Clean IPv6
  if (str === "::1" || str === "127.0.0.1") {
    return "Nội bộ (Local)";
  }
  return str;
}

function Value({ value, t }) {
  if (value === undefined || value === null || value === "") return <span className="audit-value-empty">{t("common.no_data", "—")}</span>;
  if (typeof value === "boolean") return <span className={`audit-boolean ${value ? "is-true" : ""}`}>{value ? "Có (Bật)" : "Không (Tắt)"}</span>;
  if (Array.isArray(value)) return value.length ? <ul className="audit-value-list">{value.map((item, index) => <li key={index}><Value value={item} t={t} /></li>)}</ul> : <span className="audit-value-empty">Danh sách trống</span>;
  if (typeof value === "object") return Object.keys(value).length ? <dl className="audit-value-object">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{fieldLabel(key)}</dt><dd><Value value={item} t={t} /></dd></div>)}</dl> : <span className="audit-value-empty">Không có dữ liệu</span>;
  return <span>{formatAuditText(String(value))}</span>;
}

export default function AuditChangeDetails({ entry }) {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const before = parsePayload(entry.oldValues);
  const after = parsePayload(entry.newValues);
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const asFields = (value) => value === undefined ? {} : isRecord(value) ? value : { Value: value };
  const oldFields = asFields(before.value);
  const newFields = asFields(after.value);
  const fields = [...new Set([...Object.keys(oldFields), ...Object.keys(newFields)])].map((key) => ({
    key, before: oldFields[key], after: newFields[key],
    changed: !sameValue(oldFields[key], newFields[key]),
    kind: !Object.hasOwn(oldFields, key) ? "Thêm mới" : !Object.hasOwn(newFields, key) ? "Đã xóa" : "Cập nhật",
  }));
  const changed = fields.filter((field) => field.changed);
  const visible = showAll ? fields : changed;
  const requestId = entry.requestId == null ? "" : String(entry.requestId).trim();

  async function copyId() {
    try { await navigator.clipboard.writeText(requestId); setCopyStatus("Đã sao chép mã truy vấn."); }
    catch { setCopyStatus("Không thể sao chép tự động."); }
  }

  const entityNameVN = {
    Facility: "Cơ sở kho",
    StorageUnit: "Ô kho",
    User: "Người dùng",
    RentalAgreement: "Hợp đồng thuê",
    Reservation: "Đơn đặt chỗ",
    SupportTicket: "Yêu cầu hỗ trợ",
    StaffFacilityAssignment: "Phân công nhân sự",
    Invoice: "Hóa đơn",
    Payment: "Thanh toán",
  }[entry.entityType] || entry.entityType || "Bản ghi";

  return <section className="audit-detail" aria-label={`Chi tiết thay đổi sự kiện ${entry.id}`}>
    <header className="audit-detail-header">
      <div className="audit-detail-title">
        <span className="audit-detail-icon"><GitCompareArrows size={20} /></span>
        <div>
          <h3>{t("admin.audit_change_summary", "Tóm tắt thay đổi")}</h3>
          <p className="text-slate-600 font-medium">
            {entityNameVN} · #{entry.entityId ?? "—"} · {changed.length > 0 ? `${changed.length} trường thông tin được điều chỉnh` : "Hoạt động thực thi hệ thống"}
          </p>
        </div>
      </div>
      <div className="audit-request">
        <span>{t("admin.audit_request_id", "Mã truy vấn")}</span>
        <div>{requestId ? <><code>{requestId}</code><button type="button" onClick={copyId} aria-label="Sao chép mã truy vấn"><Copy size={14} /></button></> : <span className="audit-value-empty">{t("common.no_data", "—")}</span>}</div>
        {copyStatus && <small role="status">{copyStatus}</small>}
      </div>
    </header>
    <div className="audit-detail-toolbar">
      <span>So sánh giá trị ghi nhận <ArrowRight size={14} /></span>
      <label>
        <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />
        Hiện các trường không đổi ({fields.length - changed.length})
      </label>
    </div>
    {(before.invalid || after.invalid) && <p className="audit-detail-notice">Dữ liệu ghi nhận dạng mô tả hoạt động chi tiết.</p>}
    <div className="audit-change-head" aria-hidden="true">
      <span>{t("admin.audit_field", "Trường dữ liệu")}</span>
      <span>{t("admin.audit_before", "Trước thay đổi")}</span>
      <span>{t("admin.audit_after", "Sau thay đổi")}</span>
    </div>
    {visible.map((field) => <div className={`audit-change-row ${field.changed ? "is-changed" : ""}`} key={field.key}>
      <div className="audit-field-name"><strong>{fieldLabel(field.key)}</strong><small>{field.changed ? field.kind : "Không đổi"}</small></div>
      <div className="audit-before"><span className="audit-mobile-label">Trước: </span><Value value={field.before} t={t} /></div>
      <div className="audit-after"><span className="audit-mobile-label">Sau: </span><Value value={field.after} t={t} /></div>
    </div>)}
    {!visible.length && <div className="audit-no-changes">{fields.length ? "Không có thay đổi dữ liệu nào trong các trường được ghi nhận. Bật “Hiện các trường không đổi” để xem toàn bộ." : "Không có dữ liệu trước/sau nào được ghi nhận cho sự kiện này."}</div>}
  </section>;
}
