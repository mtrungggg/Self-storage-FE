import { Link } from "react-router-dom";
import { BRAND_NAME } from "../constants/brand";

const NAV_ITEMS = [
  { key: "dashboard", label: "Kho của tôi", to: "/dashboard", style: "soft" },
  { key: "rent", label: "Thuê kho", to: "/home", style: "soft" },
  { key: "reservations", label: "Đặt chỗ", to: "/reservations", style: "soft" },
  { key: "billing", label: "Hóa đơn & Tự động thanh toán", to: "/billing", style: "hard" },
  { key: "access", label: "Mã PIN & Khóa điện tử", to: "/access-control", style: "hard" },
  { key: "facility", label: "Sơ đồ cơ sở", to: "/facility-map", style: "hard" },
];

const ACTIVE_CLASS = {
  soft: "bg-[#eef4ff] text-[#1d5fe5]",
  hard: "bg-[#0b1c30] text-white",
};

// Shared top navigation bar used by every authenticated portal page.
function Header({ active, subtitle = "Custom Storage Portal", showUserBadge = false, showExpandIcon = false }) {
  return (
    <header className="border-b border-[#e6ebf5] bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[#0b1c30]">{BRAND_NAME}</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8996a9]">{subtitle}</div>
            </div>
          </div>

        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.key === active ? (
              <button
                key={item.key}
                className={`rounded-md px-3 py-2 text-[13px] font-bold ${ACTIVE_CLASS[item.style]}`}
              >
                {item.label}
              </button>
            ) : (
              <Link key={item.key} to={item.to} className="rounded-md px-3 py-2 text-[13px] font-semibold text-[#58657a]">
                {item.label}
              </Link>
            )
          )}
          {active === "support" && (
            <button className="rounded-md bg-[#0b1c30] px-3 py-2 text-[13px] font-bold text-white">Hỗ trợ 24/7</button>
          )}
        </nav>

        <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
          <span className="hidden items-center gap-1 md:flex">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            VND (₫)
          </span>
          {active !== "support" && (
            <Link to="/support" className="hidden items-center gap-1 lg:flex">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              Hỗ trợ 24/7
            </Link>
          )}
          <span className="material-symbols-outlined text-[20px] text-[#58657a]">notifications</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
            <span className="material-symbols-outlined text-[16px]">person</span>
          </div>
          {showUserBadge && (
            <div className="hidden leading-tight lg:block">
              <div className="text-[12px] font-bold text-[#0b1c30]">Alex Morgan</div>
              <div className="text-[10px] text-[#8996a9]">Khách hàng thành viên</div>
            </div>
          )}
          {showExpandIcon && <span className="material-symbols-outlined text-[16px] text-[#58657a]">expand_more</span>}
        </div>
      </div>
    </header>
  );
}

export default Header;
