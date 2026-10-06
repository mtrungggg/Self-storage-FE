import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import reservationService from "../api/reservationService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

export default function ReservationDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    reservationService.getReservationDetail(id)
      .then((data) => { if (active) setDetail(data); })
      .catch((err) => { if (active) setError(err.status === 404 ? "Reservation not found." : err.message || "Unable to load reservation."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]);
  return <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
    <PageBackground /><Header active="billing" />
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <Link to="/billing" className="text-sm text-[#1d5fe5]">Back to invoices</Link>
      <h1 className="mt-4 text-2xl font-bold">Reservation details</h1>
      {loading ? <p role="status" className="mt-4">Loading reservation...</p> : error ? <div className="mt-4"><p role="alert" className="text-red-600">{error}</p><button onClick={() => { setError(""); setLoading(true); setAttempt((n) => n + 1); }} className="mt-3 text-[#1d5fe5]">Try again</button></div> : detail && <div className="mt-5 space-y-5 rounded-2xl border border-[#dfe7f5] bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">{detail.reservationCode}</h2><span>{detail.displayStatus || detail.status}</span></div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[["Facility", detail.facilityName], ["Unit", detail.unitCode], ["Unit type", detail.unitTypeName], ["Start date", detail.startDate], ["End date", detail.endDate], ["Monthly rate", detail.monthlyRateSnapshot == null ? null : formatVnd(detail.monthlyRateSnapshot)], ["Deposit", detail.depositSnapshot == null ? null : formatVnd(detail.depositSnapshot)], ["Booking fee", detail.bookingFeeSnapshot == null ? null : formatVnd(detail.bookingFeeSnapshot)], ["Discount", detail.discountSnapshot == null ? null : formatVnd(detail.discountSnapshot)], ["Quoted total", detail.quotedTotal == null ? null : formatVnd(detail.quotedTotal)]].map(([label, value]) => <div key={label}><dt className="text-[#58657a]">{label}</dt><dd className="break-words font-semibold">{value ?? "—"}</dd></div>)}
        </dl>
        {detail.checkInInstructions && <section><h2 className="font-bold">Check-in instructions</h2><p className="mt-2 whitespace-pre-wrap text-sm">{detail.checkInInstructions}</p></section>}
        {detail.checkInQrToken && <section><h2 className="font-bold">Check-in code</h2><p className="mt-2 break-all rounded-lg bg-[#f8faff] p-3 font-mono text-xs">{detail.checkInQrToken}</p></section>}
        {!!detail.invoices?.length && <section><h2 className="font-bold">Invoices</h2><ul className="mt-2 space-y-2 text-sm">{detail.invoices.map((invoice) => <li key={invoice.id} className="flex flex-wrap justify-between gap-2 border-t pt-2"><span>{invoice.invoiceNo}</span><span>{formatVnd(invoice.totalAmount)} · {invoice.status}</span></li>)}</ul></section>}
      </div>}
    </main><Footer />
  </div>;
}
