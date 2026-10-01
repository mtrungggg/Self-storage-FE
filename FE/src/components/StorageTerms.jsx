import { getStorageTerms } from '../domain/usecases/getStorageTerms';

const money = (value) => value == null || !Number.isFinite(Number(value)) ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const labels = { Deposit: 'Tiền cọc', Service: 'Phí dịch vụ', Management: 'Phí quản lý', Cancellation: 'Hủy chỗ', Insurance: 'Bảo hiểm' };
const validity = (record) => `${record.valid_from} → ${record.valid_to || 'Không giới hạn'}`;

export default function StorageTerms({ data, unit, date }) {
  const { rate, rateConflict, fees, policies, policyConflict } = getStorageTerms(data, unit, date);
  return <div className="mt-4 border-t border-[#dfe7f5] pt-4 text-sm">
    <h4 className="font-bold">Giá thuê tham khảo</h4>
    {rate ? <>
      <p className="mt-2 text-lg font-bold text-blue-700">{money(rate.monthly_rate)} / tháng</p>
      <dl className="mt-2 grid grid-cols-2 gap-2"><dt>Cọc theo bảng giá</dt><dd className="text-right">{money(rate.deposit_amount)}</dd><dt>Phí đặt chỗ</dt><dd className="text-right">{money(rate.booking_fee)}</dd></dl>
      <p className="mt-2 text-xs text-[#58657a]">Hiệu lực: {validity(rate)}</p>
    </> : <p className="mt-2 text-amber-800">{rateConflict ? 'Có bảng giá trùng hiệu lực, cần xác nhận giá.' : 'Chưa có bảng giá có hiệu lực cho ngày đã chọn.'}</p>}
    <details className="mt-4 rounded-lg bg-[#f8faff] p-3">
      <summary className="cursor-pointer font-semibold">Quy định phí ({fees.length})</summary>
      <p className="mt-2 text-xs text-[#58657a]">Các quy định dưới đây chưa cộng vào giá hoặc cọc. Cần xác nhận điều kiện và cách tính trước khi thanh toán.</p>
      {fees.length === 0 && <p className="mt-2">Chưa có quy định phí có hiệu lực.</p>}
      {fees.map((fee) => <div key={fee.id} className="mt-3 border-t border-[#dfe7f5] pt-3">
        <p className="font-semibold">{labels[fee.fee_type] || fee.fee_type} · {fee.code}</p>
        <p>{fee.calculation_method === 'Fixed' ? money(fee.amount) : fee.calculation_method === 'Percentage' && fee.rate_percent != null ? `${fee.rate_percent}% (chưa xác định cơ sở tính)` : 'Cách tính cần xác nhận'}</p>
        <p className="mt-1 whitespace-pre-wrap">{typeof fee.conditions === 'string' ? fee.conditions : 'Điều kiện áp dụng cần xác nhận.'}</p>
        {fee.grace_days > 0 && <p>Thời gian ân hạn: {fee.grace_days} ngày</p>}
        <p className="mt-1 text-xs text-[#58657a]">Hiệu lực: {validity(fee)}</p>
      </div>)}
    </details>
    <details className="mt-2 rounded-lg bg-[#f8faff] p-3">
      <summary className="cursor-pointer font-semibold">Chính sách thuê kho ({policies.length})</summary>
      {policyConflict && <p className="mt-2 text-amber-800">Có phiên bản chính sách trùng hiệu lực; cần xác nhận phiên bản áp dụng.</p>}
      {policies.length === 0 && <p className="mt-2">Chưa có chính sách có hiệu lực.</p>}
      {policies.map((policy) => <div key={policy.id} className="mt-3 border-t border-[#dfe7f5] pt-3">
        <p className="font-semibold">{labels[policy.policy_type] || policy.policy_type} · Phiên bản {policy.version}</p>
        <p className="mt-1 whitespace-pre-wrap">{policy.content}</p>
        <p className="mt-2 text-xs text-[#58657a]">Hiệu lực: {validity(policy)}</p>
      </div>)}
    </details>
  </div>;
}
