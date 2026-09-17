import { useHome } from "../hooks/useHome";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  const {
    activeSizeTab,
    setActiveSizeTab,
    facilities,
    sizeGuideTabs,
    highlights,
    trustBadges,
    goToStorageDetail,
  } = useHome();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="rent" subtitle="Kho tự an ninh" showExpandIcon />

      <div className="border-b border-[#dfe7f5] bg-[#eef4ff]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-[#3a475a] lg:px-6">
          <span>Cổng thông tin VaultSpace / Vận hành cơ sở & Tổng quan khách hàng</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Giám sát cổng an ninh 24/7 đang hoạt động
            </span>
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Khóa điện tử an toàn 24/7 đang hoạt động
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1d5fe5]">
              Hệ thống kho tự quản tiêu chuẩn cao • Khu vực Austin Metro
            </div>
            <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.03em] text-[#0b1c30]">
              Tìm kho lưu trữ an toàn, thông minh &amp; kiểm soát nhiệt độ gần bạn
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[#58657a]">
              Khóa số di động, giám sát nhiệt độ thời gian thực, đặt chỗ không cần đặt cọc.
            </p>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-[20px] font-bold text-[#0b1c30]">91.4% <span className="text-[12px] font-semibold text-[#0e7b4c]">Ổn định</span></div>
              <div className="text-[11px] text-[#8996a9]">Tỉ lệ lấp đầy khu vực</div>
            </div>
            <div className="text-right">
              <div className="text-[20px] font-bold text-[#1d5fe5]">1,842</div>
              <div className="text-[11px] text-[#8996a9]">Kho thông minh đang hoạt động</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Vị trí cơ sở hoặc mã bưu chính</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">location_on</span>
                <input
                  defaultValue="Austin, TX (Trung tâm & Metro)"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-28 text-[13px] outline-none focus:border-[#3b82f6]"
                />
                <button type="button" className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-semibold text-[#1d5fe5]">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  Tự động định vị
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Ngày bắt đầu thuê</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">calendar_month</span>
                <input
                  defaultValue="Hôm nay, 24 Th10, 2025"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Kỳ hạn thuê</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">event_repeat</span>
                <select className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]">
                  <option>Theo từng tháng (linh hoạt)</option>
                  <option>Theo quý</option>
                  <option>Theo năm</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[10px] bg-[#0b1c30] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#132741]"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Tìm kho ngay
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef1f8] pt-4 text-[12px] font-semibold">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Kích thước kho:</span>
            <span className="rounded-full bg-[#0b1c30] px-3 py-1 text-white">Tất cả kích thước (18)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Nhỏ (5x5, 5x10)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Trung bình (10x10, 10x15)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Lớn (10x20, 10x30)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Kho xe máy &amp; Ô tô</span>

            <span className="mx-2 h-4 w-px bg-[#e6ebf5]" />

            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Kiểm soát độ ẩm &amp; nhiệt độ
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Lối xe vào tận cửa
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Khóa thông minh 24/7
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Ưu đãi giảm 50%
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[14px] text-[#3a475a]">
            Hiển thị <span className="font-bold text-[#0b1c30]">18 cơ sở an ninh</span> tại Austin, TX
            <span className="ml-1 text-[#8996a9]">(Đã lọc theo Kiểm soát khí hậu &amp; Khóa thông minh)</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <span>Sắp xếp theo:</span>
            <select className="rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 outline-none">
              <option>Đề xuất</option>
              <option>Giá thấp đến cao</option>
              <option>Đánh giá cao nhất</option>
            </select>
            <span className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white p-1">
              <span className="material-symbols-outlined rounded bg-[#eef4ff] p-1 text-[16px] text-[#1d5fe5]">grid_view</span>
              <span className="material-symbols-outlined p-1 text-[16px] text-[#8996a9]">view_list</span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-[14px] border border-[#dfe7f5] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="relative h-[140px] w-full bg-cover bg-center" style={{ backgroundImage: `url('${f.image}')` }}>
                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#0b1c30]">
                  {f.badge} • {f.distance}
                </span>
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[12px] text-[#f4b740]">star</span>
                  {f.rating} ({f.reviews})
                </span>
              </div>

              <div className="p-4">
                <div className="text-[11px] font-semibold text-[#1d5fe5]">{f.tag}</div>
                <div className="mt-1 text-[16px] font-bold text-[#0b1c30]">{f.name}</div>
                <div className="text-[12px] text-[#8996a9]">{f.address}</div>

                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[#3a475a]">
                  {f.perks.map((perk) => (
                    <span key={perk} className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#1d5fe5]">check_circle</span>
                      {perk}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                  <span>Các kích thước phổ biến:</span>
                  <span className={f.noteTone}>{f.note}</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                  {f.sizes.map((s) => (
                    <div key={s.label} className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] px-2 py-1.5">
                      <div className="font-semibold text-[#0b1c30]">{s.label}</div>
                      <div className="text-[#1d5fe5]">{s.price}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-[#8996a9]">Giá chỉ từ</div>
                    <div className="text-[16px] font-bold text-[#0b1c30]">{f.from}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">Xem tất cả</button>
                    <button
                      onClick={goToStorageDetail}
                      className="flex items-center gap-1 rounded-[8px] bg-[#0b1c30] px-3 py-2 text-[12px] font-bold text-white transition hover:bg-[#132741]"
                    >
                      Đặt chỗ ngay
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[16px] border border-[#dfe7f5] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#1d5fe5]">Hướng dẫn ước tính không gian</div>
          <h2 className="mt-1 text-[20px] font-bold text-[#0b1c30]">Chưa chắc chắn bạn cần diện tích bao nhiêu?</h2>
          <p className="mt-1 text-[13px] text-[#58657a]">Chọn quy mô căn hộ để xem thể tích và đồ đạc tương ứng.</p>

          <div className="mt-4 inline-flex rounded-[10px] bg-[#eef4ff] p-1">
            {sizeGuideTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSizeTab(tab.id)}
                className={`rounded-[8px] px-4 py-2 text-[12px] font-semibold transition ${
                  activeSizeTab === tab.id ? "bg-[#1d5fe5] text-white shadow-sm" : "text-[#58657a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-[#dfe7f5] bg-[#f8faff] p-5 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#1d5fe5]">view_in_ar</span>
              <div className="mt-2 text-[12px] font-semibold text-[#3a475a]">Rộng 5' • Sâu 10' • Cao 8'</div>
              <div className="mt-2 text-[16px] font-bold text-[#0b1c30]">50 sq ft • 400 cu ft (~4.6 m²)</div>
              <div className="mt-1 text-[11px] text-[#8996a9]">Tương đương một phòng để đồ nhỏ hoặc khoang xe tải nhỏ</div>
            </div>

            <div>
              <div className="text-[13px] font-semibold text-[#0f172a]">Sức chứa tiêu chuẩn cho Studio / Căn hộ 1 phòng:</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-[#3a475a]">
                <span className="flex items-center gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">bed</span>
                  Đệm Queen &amp; khung giường
                </span>
                <span className="flex items-center gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">weekend</span>
                  Ghế Sofa 3 chỗ
                </span>
                <span className="flex items-center gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">inventory_2</span>
                  15-20 thùng carton chuyển nhà
                </span>
                <span className="flex items-center gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">kitchen</span>
                  Thiết bị điện gia dụng gọn
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-[#eef4ff] p-3 text-[12px] text-[#3a475a]">
                <span>Có sẵn tại 3 cơ sở khu vực Austin, hợp đồng linh hoạt theo tháng.</span>
                <button className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white">Lọc kho cỡ 5' x 10'</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
              <span className="material-symbols-outlined text-[22px] text-[#1d5fe5]">{item.icon}</span>
              <div className="mt-2 text-[13px] font-bold text-[#0b1c30]">{item.title}</div>
              <div className="mt-1 text-[12px] leading-5 text-[#58657a]">{item.text}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-[14px] border border-[#dfe7f5] bg-white p-5 md:grid-cols-4">
          {trustBadges.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#0e7b4c]">{item.icon}</span>
              <div>
                <div className="text-[13px] font-bold text-[#0b1c30]">{item.title}</div>
                <div className="text-[11px] text-[#8996a9]">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer
        tagline="Được thiết kế cho các giải pháp lưu trữ cá nhân và thương mại tiêu chuẩn doanh nghiệp. Tường rào kiên cố, ủy quyền truy cập chặt chẽ, không có ngoại lệ."
        hotline={{ label: "ĐƯỜNG DÂY NÓNG KHẨN CẤP", phone: "1-800-555-VAULT (24/7)" }}
        columns={[
          {
            title: "Cổng khách hàng",
            items: ["Kho tôi đang thuê", "Mã PIN & Mã cổng", "Cài đặt thanh toán & Hóa đơn", "Trạng thái khóa điện tử", "Ủy quyền khách vào kho"],
          },
          {
            title: "Cơ sở & Kích thước",
            items: ["Hướng dẫn chọn kích thước kho", "Tiêu chuẩn kiểm soát khí hậu", "Lối xe vào & Chỗ đậu xe", "Đặt lịch khu vực bốc dỡ", "Các gói bảo hiểm & Yêu cầu bồi thường"],
          },
          {
            title: "Hỗ trợ & Tin cậy",
            items: ["Trò chuyện hỗ trợ trực tiếp", "Cửa hàng vật tư đóng gói", "Tài liệu chính sách kho", "Điều khoản quyền riêng tư & Giám sát", "Chính sách quyền riêng tư & Giám sát"],
          },
        ]}
        bottomText="© 2025 VaultSpace Logistics Technologies, Inc. Đã đăng ký bản quyền. Đơn vị cung cấp kho hoạt động theo pháp luật."
        bottomLinks={[{ label: "Điều khoản dịch vụ", to: "/login" }, { label: "Quy trình an toàn" }, { label: "Biện pháp bảo vệ" }]}
        statusText="Trạng thái: Ổn định"
      />
    </div>
  );
}

export default Home;
