// Data layer: content source for the Admin Staff Scheduling (shift roster) page.
export function getStatusBanner() {
  return { label: "Vận hành trực thời thực", week: "Tuần 42 (14/10 - 20/10/2024)" };
}

export function getOverviewHeader() {
  return {
    title: "Phân công Nhân sự & Ca trực",
    subtitle: "Điều phối lịch trực, định mức giờ công chuẩn ISO 27001 và nhật ký bàn giao an ninh toàn Hub.",
  };
}

export function getWeekRangeLabel() {
  return "14 Th10 - 20 Th10, 2024";
}

export function getHeaderActions() {
  return [
    { id: "norms", icon: "rule", label: "Định mức ca" },
    { id: "export", icon: "file_download", label: "Xuất báo cáo" },
    { id: "new_shift", icon: "add", label: "Phân ca trực mới" },
  ];
}

export function getKpis() {
  return [
    { id: "staff", icon: "groups", label: "Nhân lực toàn Hub", value: "18", trend: "Sẵn sàng điều động", sub: "100% khả dụng" },
    { id: "shift_structure", icon: "schedule", label: "Cấu trúc 3 ca / ngày", value: "3 ca", trend: "Giám sát 24/7", sub: "Sáng 07-15 • Chiều 15-23 • Đêm 23-07" },
    { id: "coverage", icon: "shield", label: "Tỷ lệ phủ ca tuần", value: "100%", trend: "0 vi phạm", sub: "Chuẩn an toàn" },
  ];
}

export function getWeekDays() {
  return [
    { id: "mon", label: "Thứ 2", date: "14/10" },
    { id: "tue", label: "Thứ 3", date: "15/10" },
    { id: "wed", label: "Thứ 4", date: "16/10", isToday: true },
    { id: "thu", label: "Thứ 5", date: "17/10" },
    { id: "fri", label: "Thứ 6", date: "18/10" },
    { id: "sat", label: "Thứ 7", date: "19/10" },
    { id: "sun", label: "CN", date: "20/10" },
  ];
}

export function getDepartments() {
  return [
    {
      id: "mgmt",
      label: "Khối Quản lý & Trưởng ca vận hành",
      count: 3,
      staff: [
        {
          id: "MNG-01",
          name: "Nguyễn Quốc Thái",
          role: "Trưởng ca Vận hành",
          shifts: {
            mon: { type: "morning" },
            tue: { type: "morning" },
            wed: { type: "afternoon", note: "Đang trực" },
            thu: { type: "morning", note: "Duyệt bù" },
            fri: { type: "off", note: "Nghỉ bù" },
            sat: { type: "morning" },
            sun: { type: "off" },
          },
        },
        {
          id: "MNG-04",
          name: "Võ Bích Phượng",
          role: "Phó Giám sát Kho",
          shifts: {
            mon: { type: "afternoon" },
            tue: { type: "afternoon" },
            wed: { type: "morning", note: "Đã xong" },
            thu: { type: "morning" },
            fri: { type: "afternoon", note: "Cuối tuần" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "iot",
      label: "Khối Kỹ thuật IoT, HVAC & Bảo trì điện",
      count: 5,
      staff: [
        {
          id: "ENG-12",
          name: "Trương Hoàng Long",
          role: "KTV Vi khí hậu",
          shifts: {
            mon: { type: "morning", note: "07:01" },
            tue: { type: "morning", note: "06:52" },
            wed: { type: "afternoon", note: "Bảo trì" },
            thu: { type: "afternoon" },
            fri: { type: "morning", note: "Trực chốt" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
        {
          id: "ENG-18",
          name: "Đặng Văn Sơn",
          role: "KTV Cơ giới Dock",
          shifts: {
            mon: { type: "off", note: "Nghỉ bù" },
            tue: { type: "afternoon", note: "Trễ giờ" },
            wed: { type: "afternoon", note: "Kiểm định" },
            thu: { type: "afternoon" },
            fri: { type: "morning" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "frontoffice",
      label: "Khối Lễ tân Dịch vụ & Bàn giao mặt bằng",
      count: 4,
      staff: [
        {
          id: "FO-05",
          name: "Lê Thu Hà",
          role: "Lễ tân B2B",
          shifts: {
            mon: { type: "morning" },
            tue: { type: "morning" },
            wed: { type: "afternoon", note: "Bàn giao #B-204" },
            thu: { type: "morning" },
            fri: { type: "off" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "security",
      label: "Khối An ninh & Giám sát trung tâm SOC",
      count: 6,
      staff: [
        {
          id: "SEC-03",
          name: "Phạm Quốc An",
          role: "Trưởng An ninh SOC",
          shifts: {
            mon: { type: "night", note: "Tuần tra" },
            tue: { type: "night", note: "22:00" },
            wed: { type: "night", note: "Bắt đầu 23:00" },
            thu: { type: "off", note: "Nghỉ đôi ca" },
            fri: { type: "off" },
            sat: { type: "night" },
            sun: { type: "night" },
          },
        },
      ],
    },
  ];
}

export function getShiftLegend() {
  return [
    { id: "morning", label: "Ca Sáng (07:00-15:00)" },
    { id: "afternoon", label: "Ca Chiều (15:00-23:00)" },
    { id: "night", label: "Ca Đêm (23:00-07:00)" },
  ];
}

export function getAttendanceLegend() {
  return [
    { id: "ontime", label: "Đúng giờ", color: "#2dd4a0" },
    { id: "late", label: "Trễ ca", color: "#e5484d" },
    { id: "leave", label: "Phép năm", color: "#f5a524" },
  ];
}

export function getFieldTasks() {
  return [
    {
      id: 1,
      title: "Kiểm tra cảm biến ẩm vi khí hậu Khu B",
      note: "Kho rượu vang B10-B40",
      assignee: "KTV Long (#ENG-12)",
      detail: "Hoàn tất lúc 11:30",
      status: "done",
      statusLabel: "ĐÃ ĐẠT",
    },
    {
      id: 2,
      title: "Hỗ trợ xe nâng & tiếp nhận Pallet tại Dock #02",
      note: "Ưu tiên cao",
      assignee: "KTV Sơn (#ENG-18)",
      detail: "Đang bốc dỡ 14 kiện hàng",
      status: "doing",
      statusLabel: "ĐANG LÀM",
    },
    {
      id: 3,
      title: "Bàn giao & ký biên bản niêm phong kho #B-204",
      note: "Khách: VinLogistics JSC",
      assignee: "Lễ tân Hà (#FO-05)",
      detail: "Dự kiến khách đến: 16:30",
      status: "waiting",
      statusLabel: "CHỜ KHÁCH",
    },
  ];
}

export function getHandoverTag() {
  return "Ca Chiều → Đêm";
}

export function getHandoverChecklist() {
  return [
    { id: "keys", label: "Chùm chìa khóa Master & Thẻ NFC khẩn cấp", detail: "Đã kiểm đếm (12/12)" },
    { id: "fire", label: "Hệ thống PCCC & Báo khói lạnh kho", detail: "Áp lực ổn định 1.2 MPa" },
    { id: "cctv", label: "Hệ thống 148 Camera CCTV Hub", detail: "148/148 Online" },
  ];
}

export function getHandoverNote() {
  return "Khách VinLogistics JSC có thể lấy thêm 2 pallet lúc 23:45. Ca đêm quét QR + vân tay trước khi mở barrier Dock #02.";
}
