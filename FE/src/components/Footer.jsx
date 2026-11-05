import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

// Shared minimalist footer matching design specifications.
function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[#e6ebf5] bg-white px-4 py-4 text-[12px] text-[#64748b] lg:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 sm:flex-row">
        <div>
          © 2025 <span className="font-bold text-[#0a3d91]">G1</span><span className="font-bold text-[#0b1c30]">SelfStorage</span>. {t("auth.all_rights_reserved", "Bảo lưu mọi quyền.")}
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[#64748b]">
          <Link to="/support" className="transition hover:text-zinc-900 dark:text-zinc-100 hover:underline">
            {t("auth.help_center", "Trung tâm trợ giúp")}
          </Link>
          <span>•</span>
          <Link to="/login" className="transition hover:text-zinc-900 dark:text-zinc-100 hover:underline">
            {t("auth.terms_service", "Điều khoản dịch vụ")}
          </Link>
          <span>•</span>
          <Link to="/login" className="transition hover:text-zinc-900 dark:text-zinc-100 hover:underline">
            {t("auth.privacy_policy", "Chính sách bảo mật")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
