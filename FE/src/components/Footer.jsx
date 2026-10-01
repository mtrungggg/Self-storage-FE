import { Link } from "react-router-dom";

// Shared minimalist footer matching design specifications.
function Footer() {
  return (
    <footer className="border-t border-[#e6ebf5] bg-white px-4 py-4 text-[12px] text-[#64748b] lg:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 sm:flex-row">
        <div>
          © 2025 <span className="font-bold text-[#0a3d91]">G1</span><span className="font-bold text-[#0b1c30]">SelfStorage</span>. All rights reserved.
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[#64748b]">
          <Link to="/support" className="transition hover:text-[#1d5fe5] hover:underline">
            Help Center
          </Link>
          <span>•</span>
          <Link to="/login" className="transition hover:text-[#1d5fe5] hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/login" className="transition hover:text-[#1d5fe5] hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
