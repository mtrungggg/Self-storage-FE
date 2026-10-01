// Demonstration only: VND, inclusive validity dates, null end = open-ended.
// Fee percentages are displayed as rules, not calculated without a confirmed base.
export function getStorageTermsData() {
  return {
    facility_rates: [
      { id: 'r1', facility_id: 'f1', unit_type_id: 't1', monthly_rate: 800000, deposit_amount: 800000, booking_fee: 100000, valid_from: '2026-01-01', valid_to: null },
      { id: 'r2', facility_id: 'f1', unit_type_id: 't2', monthly_rate: 1800000, deposit_amount: 1800000, booking_fee: 150000, valid_from: '2026-01-01', valid_to: null },
      { id: 'r3', facility_id: 'f2', unit_type_id: 't2', monthly_rate: 1600000, deposit_amount: 1600000, booking_fee: 100000, valid_from: '2026-01-01', valid_to: null },
      { id: 'r4', facility_id: 'f2', unit_type_id: 't3', monthly_rate: 2500000, deposit_amount: 2500000, booking_fee: 200000, valid_from: '2026-01-01', valid_to: null },
    ],
    fee_rules: [
      { id: 'fee1', facility_id: 'f1', code: 'DEPOSIT', fee_type: 'Deposit', calculation_method: 'Percentage', amount: null, rate_percent: 100, grace_days: 0, conditions: 'Mẫu: cần xác nhận cơ sở tính phần trăm và quan hệ với tiền cọc trong bảng giá.', valid_from: '2026-01-01', valid_to: null, is_active: true },
      { id: 'fee2', facility_id: 'f1', code: 'SERVICE', fee_type: 'Service', calculation_method: 'Fixed', amount: 50000, rate_percent: null, grace_days: 0, conditions: 'Mẫu: chỉ áp dụng khi khách đăng ký dịch vụ hỗ trợ; chu kỳ thu cần xác nhận.', valid_from: '2026-01-01', valid_to: null, is_active: true },
      { id: 'fee3', facility_id: 'f2', code: 'MANAGEMENT', fee_type: 'Management', calculation_method: 'Fixed', amount: 80000, rate_percent: null, grace_days: 3, conditions: 'Mẫu: cần xác nhận điều kiện, chu kỳ thu và cách áp dụng thời gian ân hạn.', valid_from: '2026-01-01', valid_to: null, is_active: true },
    ],
    policy_versions: [
      { id: 'p1', policy_type: 'Cancellation', version: '1.0', content: 'Chính sách hủy chỗ minh họa. Điều kiện hủy và hoàn phí sẽ được cung cấp trước khi xác nhận đặt chỗ.', valid_from: '2026-01-01', valid_to: null },
      { id: 'p2', policy_type: 'Insurance', version: '1.0', content: 'Chính sách bảo hiểm minh họa. Phạm vi bảo hiểm, giới hạn bồi thường và phí bảo hiểm cần được xác nhận trong hợp đồng.', valid_from: '2026-01-01', valid_to: null },
      { id: 'p3', policy_type: 'Deposit', version: '1.0', content: 'Chính sách cọc minh họa. Điều kiện hoàn cọc và các khoản khấu trừ cần được xác nhận trước khi thuê.', valid_from: '2026-01-01', valid_to: null },
    ],
  };
}
