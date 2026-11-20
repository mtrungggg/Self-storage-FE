import { useLanguage } from "../context/LanguageContext";
import { ArrowRight, CheckCircle2, ShieldAlert, UserCheck, RefreshCw, Layers } from "lucide-react";
import "../styles/audit-details.css";

const ENTITY_NAMES = {
  Facility: "Cơ sở kho",
  StorageUnit: "Ô kho lưu trữ",
  User: "Tài khoản người dùng",
  RentalAgreement: "Hợp đồng thuê kho",
  rental_agreement: "Hợp đồng thuê kho",
  Reservation: "Đơn đặt chỗ",
  SupportTicket: "Yêu cầu hỗ trợ",
  StaffFacilityAssignment: "Phân công nhân sự",
  Invoice: "Hóa đơn thanh toán",
  Payment: "Giao dịch thanh toán",
};

const FIELD_LABELS = {
  Value: "Nội dung ghi nhận",
  Status: "Trạng thái",
  status: "Trạng thái",
  Role: "Vai trò",
  Roles: "Danh sách vai trò",
  IsActive: "Kích hoạt",
  Email: "Địa chỉ Email",
  PhoneNumber: "Số điện thoại",
  FullName: "Họ và tên",
  Address: "Địa chỉ",
  DepositAmount: "Tiền cọc",
  deductedDeposit: "Tiền cọc khấu trừ",
  MonthlyPrice: "Đơn giá tháng",
  MonthlyRate: "Đơn giá tháng",
  unitStatus: "Trạng thái ô kho",
  auctionProceeds: "Số tiền thanh lý",
  settledAmount: "Số tiền đã tất toán",
  remainingDebt: "Nợ tồn đọng",
  reason: "Lý do thực hiện",
  Reason: "Lý do thực hiện",
  FacilityName: "Cơ sở kho",
  FacilityId: "Mã cơ sở",
  UnitCode: "Mã ô kho",
  StorageUnitId: "Mã ô kho",
  AgreementId: "Mã hợp đồng",
  CustomerId: "Mã khách hàng",
};

function fieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\bId\b/g, "ID")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function translateRole(r) {
  if (!r) return "—";
  const s = String(r).toLowerCase().trim();
  if (s === "storage_customer" || s === "customer") return "Khách hàng (Customer)";
  if (s === "facility_staff" || s === "staff") return "Nhân viên cơ sở (Staff)";
  if (s === "facility_manager" || s === "manager") return "Quản lý cơ sở (Manager)";
  if (s === "system_administrator" || s === "admin") return "Quản trị hệ thống (Admin)";
  return r;
}

function translateStatus(st) {
  if (!st) return "—";
  const s = String(st).toLowerCase().trim();
  if (s.startsWith("active")) return "Đang hoạt động (Active)";
  if (s.startsWith("disabled")) return "Đã vô hiệu hóa / Khóa (Disabled)";
  if (s.startsWith("pending")) return "Chờ xử lý (Pending)";
  if (s.startsWith("terminated")) return "Đã chấm dứt (Terminated)";
  if (s.startsWith("overdue")) return "Quá hạn thanh toán (Overdue)";
  return st;
}

function parsePayload(value) {
  if (value == null || value === "") return { value: undefined };
  if (typeof value !== "string") return { value };
  try {
    return { value: JSON.parse(value) };
  } catch {
    return { value, invalid: true };
  }
}

export default function AuditChangeDetails({ entry }) {
  const { t } = useLanguage();
  const before = parsePayload(entry.oldValues);
  const after = parsePayload(entry.newValues);

  const entityNameVN = ENTITY_NAMES[entry.entityType] || entry.entityType || "Bản ghi";
  const act = String(entry.action || "").toUpperCase();

  // 1. Phân công nhân sự: ASSIGN_STAFF
  const staffMatch = typeof entry.newValues === "string" && entry.newValues.match(/Staff:\s*(.*?)\s*\((.*?)\)\s*->\s*Facility:\s*(.*?)\s*\((.*?)\)/i);
  if (act.includes("ASSIGN_STAFF") || staffMatch) {
    const [, name, empId, facility, role] = staffMatch || ["", "Nhân viên", entry.entityId, "Cơ sở kho", "facility_staff"];
    const roleVN = role === "facility_staff" ? "Nhân viên cơ sở" : role === "facility_manager" ? "Quản lý cơ sở" : role;

    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck size={18} className="text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Chi tiết phân công nhân sự vào cơ sở
          </h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Nhân viên được giao việc</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{name}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Mã NV: {empId}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Cơ sở tiếp nhận</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{facility}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Vai trò tại cơ sở</div>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {roleVN}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Thu hồi phân công: REVOKE_STAFF_ASSIGNMENT
  if (act.includes("REVOKE")) {
    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={18} className="text-amber-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Thu hồi phân công nhân sự
          </h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-700">
            Hệ thống đã thu hồi phân công làm việc và chấm dứt nhiệm vụ của nhân sự tại điểm kho tương ứng.
          </p>
          {entry.oldValues && (
            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
              Thông tin phân công trước đó: {entry.oldValues}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Đổi vai trò / phân quyền: UPDATE_ROLES
  if (act.includes("ROLE")) {
    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={17} className="text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Thay đổi vai trò người dùng (User ID: #{entry.entityId})
          </h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
            {translateRole(entry.oldValues)}
          </span>
          <ArrowRight size={16} className="text-blue-500 shrink-0" />
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            {translateRole(entry.newValues)}
          </span>
        </div>
      </div>
    );
  }

  // 4. Đổi trạng thái: UPDATE_STATUS
  if (act.includes("STATUS")) {
    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={17} className="text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Thay đổi trạng thái hoạt động (ID: #{entry.entityId})
          </h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
            {translateStatus(entry.oldValues)}
          </span>
          <ArrowRight size={16} className="text-blue-500 shrink-0" />
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            {translateStatus(entry.newValues)}
          </span>
        </div>
      </div>
    );
  }

  // 5. Thanh lý hợp đồng: agreement_liquidated
  if (act.includes("LIQUIDAT")) {
    const details = after.value && typeof after.value === "object" ? after.value : {};
    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={18} className="text-rose-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Chi tiết thanh lý hợp đồng thuê (#{entry.entityId})
          </h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          {details.reason && (
            <div className="sm:col-span-2 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-800 uppercase">Lý do cưỡng chế thanh lý</div>
              <div className="text-xs font-medium text-amber-950 mt-0.5">{details.reason}</div>
            </div>
          )}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Trạng thái hợp đồng</div>
            <div className="text-xs font-bold text-rose-600 mt-0.5">
              {entry.oldValues || "overdue"} ➔ Đã chấm dứt (terminated)
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Trạng thái ô kho</div>
            <div className="text-xs font-bold text-amber-700 mt-0.5">
              Chờ nghiệm thu ({details.unitStatus || "pending_inspection"})
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Tiền cọc khấu trừ vi phạm</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {details.deductedDeposit ? Number(details.deductedDeposit).toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Xử lý tài sản tồn lưu</div>
            <div className="text-xs font-medium text-slate-700 mt-0.5">Niêm phong & tiến hành nghiệm thu kho</div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Generic Object / Trường dữ liệu thay đổi
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (isObj(before.value) || isObj(after.value)) {
    const oldObj = before.value || {};
    const newObj = after.value || {};
    const allKeys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])];
    const changedKeys = allKeys.filter((k) => oldObj[k] !== newObj[k]);

    return (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={17} className="text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Chi tiết các trường thông tin thay đổi ({entityNameVN} #{entry.entityId})
          </h4>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 w-1/3">Trường thông tin</th>
                <th className="py-2.5 px-4 w-1/3">Trước thay đổi</th>
                <th className="py-2.5 px-4 w-1/3">Sau thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {changedKeys.map((k) => (
                <tr key={k}>
                  <td className="py-2 px-4 font-semibold text-slate-800">{fieldLabel(k)}</td>
                  <td className="py-2 px-4 text-slate-500">{String(oldObj[k] ?? "—")}</td>
                  <td className="py-2 px-4 font-bold text-slate-900">{String(newObj[k] ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 7. Generic Fallback: Text rõ ràng
  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={17} className="text-slate-600" />
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Nội dung ghi nhận ({entityNameVN} #{entry.entityId})
        </h4>
      </div>
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-800">
        {entry.newValues ? (
          <div>{entry.newValues}</div>
        ) : (
          <div className="text-slate-400 italic">Không có thêm dữ liệu chi tiết cho sự kiện này.</div>
        )}
      </div>
    </div>
  );
}