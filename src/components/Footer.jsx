import { Link } from "react-router-dom";

// Shared marketing footer used by every authenticated portal page; content differs per page via props.
function Footer({
  tagline,
  hotline,
  columns,
  bottomText = "© 2025 VaultSpace Logistics & Storage Systems Inc. Bảo lưu mọi quyền.",
  bottomLinks = [
    { label: "Bảo mật thông tin" },
    { label: "Điều khoản sử dụng" },
    { label: "Trợ giúp" },
  ],
  statusText,
}) {
  return (
    <footer className="border-t border-[#e6ebf5] bg-white px-4 py-8 lg:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
                <span className="material-symbols-outlined text-[16px]">lock</span>
              </div>
              <span className="text-[15px] font-bold text-[#0b1c30]">VaultSpace</span>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-[#58657a]">{tagline}</p>
            {hotline && (
              <>
                <div className="mt-4 flex items-center gap-2 text-[12px] font-bold text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[16px] text-[#e11d48]">sos</span>
                  {hotline.label}
                </div>
                <div className="text-[13px] font-bold text-[#1d5fe5]">{hotline.phone}</div>
              </>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#0b1c30]">{column.title}</div>
              <ul className="mt-3 space-y-2 text-[12px] text-[#58657a]">
                {column.items.map((item) => (
                  <li key={item} className={column.highlight === item ? "font-semibold text-[#1d5fe5]" : undefined}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f8] pt-4 text-[11px] text-[#8996a9]">
          <span>{bottomText}</span>
          <div className="flex items-center gap-3 font-semibold text-[#58657a]">
            {bottomLinks.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className="hover:underline">
                  {link.label}
                </Link>
              ) : (
                <span key={link.label}>{link.label}</span>
              )
            )}
            {statusText && (
              <span className="flex items-center gap-1 text-[#0e7b4c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                {statusText}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
