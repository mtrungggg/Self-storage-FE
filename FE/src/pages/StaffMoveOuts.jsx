import { Link } from "react-router-dom";
import PageBackground from "../components/PageBackground";
import StaffQrOperations from "../components/StaffQrOperations";

export default function StaffMoveOuts() {
  return (
    <div className="relative min-h-screen text-[#0b1c30] flex flex-col font-sans bg-slate-50/50">
      <PageBackground />
      <main className="flex-1 mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Link
              to="/staff-dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition mb-1 inline-block"
            >
              Back to Staff Workspace
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Move-out & Transfers
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan customer QR codes for move-out returns and inter-facility transfers.
            </p>
          </div>
        </div>

        <StaffQrOperations />
      </main>
    </div>
  );
}
