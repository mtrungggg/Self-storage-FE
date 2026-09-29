import { useHome } from "../hooks/useHome";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  const { facilities, goToStorageDetail } = useHome();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="rent" subtitle="Kho tự an ninh" showExpandIcon />

      <main className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.03em] text-[#0b1c30]">
            Find Secure &amp; Smart Storage Near You
          </h1>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Location or Zip Code</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">location_on</span>
                <input
                  defaultValue="Austin, TX (Metro Area)"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-28 text-[13px] outline-none focus:border-[#3b82f6]"
                />
                <button type="button" className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-semibold text-[#1d5fe5]">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  Auto-locate
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Move-in Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">calendar_month</span>
                <input
                  defaultValue="Today, Oct 24, 2025"
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Rental Term</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">event_repeat</span>
                <select className="w-full appearance-none rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none focus:border-[#3b82f6]">
                  <option>Month-to-month (flexible)</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[10px] bg-[#0b1c30] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-[#132741]"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Find Storage
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef1f8] pt-4 text-[12px] font-semibold">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8996a9]">Unit Size:</span>
            <span className="rounded-full bg-[#0b1c30] px-3 py-1 text-white">All Sizes (18)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Small (5x5, 5x10)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Medium (10x10, 10x15)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Large (10x20, 10x30)</span>
            <span className="rounded-full border border-[#dfe7f5] px-3 py-1 text-[#3a475a]">Vehicle &amp; Auto</span>

            <span className="mx-2 h-4 w-px bg-[#e6ebf5]" />

            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Climate Controlled
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Drive-up Access
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              24/7 Smart Lock
            </label>
            <label className="flex items-center gap-1.5 text-[#3a475a]">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              50% Off Promo
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <span>Sort by:</span>
            <select className="rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 outline-none">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Highest Rated</option>
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
                  <span>Popular Sizes:</span>
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
                    <div className="text-[10px] uppercase text-[#8996a9]">From</div>
                    <div className="text-[16px] font-bold text-[#0b1c30]">{f.from}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">View all</button>
                    <button
                      onClick={goToStorageDetail}
                      className="flex items-center gap-1 rounded-[8px] bg-[#0b1c30] px-3 py-2 text-[12px] font-bold text-white transition hover:bg-[#132741]"
                    >
                      Reserve Now
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
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
