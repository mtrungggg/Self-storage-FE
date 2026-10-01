import { checkRentalSchedule } from '../domain/usecases/checkRentalSchedule';

export default function RentalScheduleNotice({ data, unit, startDate, endDate, supplied }) {
  const schedule = checkRentalSchedule(data, unit, startDate, endDate);
  if (schedule.state === 'no-period') return null;
  return <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
    <p className="font-semibold">Cần xác nhận lịch trống</p>
    {!supplied ? <p className="mt-1">Chưa nhận đủ dữ liệu đặt chỗ và hợp đồng thuê.</p> : <>
      <p className="mt-1">Bản ghi trùng khoảng thuê: {schedule.reservations} đơn đặt chỗ cùng cơ sở/loại kho; {schedule.agreements} hợp đồng có thể liên quan.</p>
      {schedule.incompleteDates > 0 && <p>{schedule.incompleteDates} bản ghi thiếu ngày hoặc có khoảng ngày không hợp lệ.</p>}
      <p className="mt-1">Chưa xác định trạng thái giữ chỗ và ô kho của từng bản ghi. Các số lượng này không phải số ô đã thuê và chưa loại trừ đơn đã chuyển thành hợp đồng.</p>
    </>}
    <p className="mt-1 text-xs">Đối chiếu tạm theo khoảng từ ngày bắt đầu đến trước ngày kết thúc; chưa xác nhận khả năng đặt chỗ.</p>
  </div>;
}
