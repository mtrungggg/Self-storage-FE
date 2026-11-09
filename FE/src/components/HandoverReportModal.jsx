import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext";

const safeLink = (value) => typeof value === "string" && (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)) ? value : null;

export default function HandoverReportModal({ record, loading, error, onClose }) {
  const { lang, formatDate, formatCurrency, translateStatus } = useLanguage();
  const text = (vi, en) => lang === "vi" ? vi : en;
  const missing = text("Chưa ghi nhận", "Not recorded");
  const titleId = useId();
  const panel = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("button")?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const elements = [...panel.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
      previous?.focus?.();
    };
  }, []);

  const date = (value, withTime = false) => value && !Number.isNaN(new Date(value).getTime())
    ? formatDate(value, withTime ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" } : { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }) : missing;
  const measure = (value, suffix) => value === null || value === undefined ? missing
    : `${new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(value)} ${suffix}`;
  const condition = (value) => ({
    good: text("Tốt", "Good"), clean: text("Sạch sẽ", "Clean"), normal: text("Bình thường", "Normal"),
    fair: text("Trung bình", "Fair"), poor: text("Kém", "Poor"), damaged: text("Hư hỏng", "Damaged"),
    passed: text("Đạt", "Passed"), failed: text("Không đạt", "Failed"),
    completed: text("Đã hoàn tất", "Completed"), pending: text("Chờ kiểm tra", "Pending"),
  }[value] || (value ? translateStatus(value) : missing));
  const type = (value) => ({
    check_in: text("Bàn giao nhận kho", "Move-in handover"), check_out: text("Bàn giao trả kho", "Move-out handover"),
    transfer_in: text("Bàn giao kho chuyển đến", "Transfer-in handover"), transfer_out: text("Bàn giao kho chuyển đi", "Transfer-out handover"),
  }[value] || (value ? translateStatus(value) : missing));
  const inspection = record?.inspection;
  const items = inspection?.items || [];
  const sectionTitle = (number, title) => <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[11px] text-slate-500">{number}</span>{title}</h3>;
  const fields = (rows) => <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[11px] text-slate-500">{label}</dt><dd className="mt-1 break-words text-xs font-semibold leading-relaxed text-slate-800">{value || missing}</dd></div>)}</dl>;
  const signature = (name, time, reference, label) => <div className="rounded-xl border border-slate-200 p-4">
    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</h4>
    <p className="mt-3 text-sm font-bold text-slate-900">{name || missing}</p>
    <p className="mt-2 text-xs text-slate-600">{text("Thời điểm xác nhận", "Acknowledged at")}: {date(time, true)}</p>
    <p className="mt-2 text-xs text-slate-600">{reference ? text("Có tham chiếu chữ ký được lưu trong hồ sơ.", "A signature reference is stored in the record.") : text("Chưa có tệp / tham chiếu chữ ký trong hồ sơ.", "No signature file or reference is stored.")}</p>
    {reference && (safeLink(reference) ? <a href={safeLink(reference)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 underline">{text("Xem chữ ký", "View signature")}</a> : <p className="mt-2 break-all text-[11px] text-slate-500">{reference}</p>)}
  </div>;

  return createPortal(
    <div id="handover-report-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <style>{`@media print { @page { size: A4; margin: 15mm; } body > :not(#handover-report-overlay) { display:none !important; } #handover-report-overlay { display:block !important; position:static !important; padding:0 !important; background:white !important; backdrop-filter:none !important; } #handover-report-panel { max-height:none !important; max-width:none !important; overflow:visible !important; border:0 !important; box-shadow:none !important; } .handover-screen-only { display:none !important; } #handover-report-panel section, #handover-report-panel tr { break-inside:avoid; } #handover-report-panel thead { display:table-header-group; } }`}</style>
      <div ref={panel} id="handover-report-panel" className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <div className="handover-screen-only sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <span className="text-xs font-semibold text-slate-500">{text("Hồ sơ bàn giao ô kho", "Storage handover record")}</span>
          <div className="flex gap-2">
            {record && !loading && !error && <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"><span aria-hidden="true" className="material-symbols-outlined text-base">print</span>{text("In biên bản", "Print report")}</button>}
            <button type="button" id="btn-close-handover-top" aria-label={text("Đóng biên bản", "Close report")} onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><span aria-hidden="true" className="material-symbols-outlined text-xl">close</span></button>
          </div>
        </div>
        <div className="p-5 sm:p-8">
          <header className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-xs font-extrabold tracking-wider text-slate-600">G1 SELF STORAGE</p>
              <p className="text-xs text-slate-500">{text("Số biên bản", "Record No")}: <strong className="font-mono text-slate-900">{record?.handoverId ? `#${record.handoverId}` : missing}</strong></p>
            </div>
            <h2 id={titleId} className="mt-4 text-xl font-extrabold tracking-tight sm:text-2xl">{text("BIÊN BẢN BÀN GIAO Ô KHO", "STORAGE UNIT HANDOVER REPORT")}</h2>
            {record && <p className="mt-2 text-sm text-slate-600">{type(record.handoverType)} <span className="mx-2 text-slate-300">|</span>{text("Lập lúc", "Created")}: {date(record.createdAt, true)}</p>}
          </header>
          {loading ? <p role="status" className="py-12 text-center text-sm text-slate-500">{text("Đang tải hồ sơ bàn giao…", "Loading handover record…")}</p>
            : error || !record ? <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900"><p className="font-bold">{text("Chưa thể hiển thị biên bản bàn giao", "Handover report unavailable")}</p><p className="mt-2">{error || text("Chưa có biên bản được ghi nhận. Nhân viên cơ sở sẽ lập biên bản sau khi kiểm tra và bàn giao thực tế.", "No handover record is available. Facility staff will prepare it after inspection and handover.")}</p></div>
              : <div className="mt-6 space-y-6">
                <section>{sectionTitle("01", text("Thông tin các bên bàn giao", "Handover parties"))}<div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4"><p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{text("Đại diện cơ sở", "Facility representative")}</p>{fields([[text("Cơ sở", "Facility"), record.facilityName], [text("Nhân viên phụ trách", "Responsible staff"), record.handledByName], [text("Mã nhân viên", "Employee code"), record.staffEmployeeCode], [text("Địa chỉ cơ sở", "Facility address"), [record.facilityAddress, record.facilityCity].filter(Boolean).join(", ")]])}</div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{text("Khách hàng", "Customer")}</p>{fields([[text("Họ và tên", "Full name"), record.customerName], [text("Số điện thoại", "Phone"), record.customerPhone], ["Email", record.customerEmail], [text("Số hợp đồng", "Agreement No"), record.agreementNo]])}</div>
                </div></section>
                <section>{sectionTitle("02", text("Ô kho và thời hạn thuê", "Unit and rental term"))}<div className="rounded-xl bg-slate-50 p-4">{fields([[text("Mã ô kho", "Unit code"), record.unitCode], [text("Loại kho", "Unit type"), record.unitTypeName], [text("Khu vực / Tầng", "Zone / Floor"), [record.zoneLabel, record.floorLabel].filter(Boolean).join(" · ")], [text("Diện tích / Thể tích", "Area / Volume"), `${measure(record.areaM2, "m²")} / ${measure(record.volumeM3, "m³")}`], [text("Kích thước (rộng × dài × cao)", "Dimensions (W × L × H)"), record.dimensions], [text("Thời hạn hợp đồng", "Rental term"), `${date(record.rentalStartDate)} → ${date(record.rentalEndDate)}`]])}</div></section>
                <section>{sectionTitle("03", text("Kiểm tra hiện trạng và hạng mục bàn giao", "Condition inspection and checklist"))}
                  {fields([[text("Mã phiếu kiểm tra", "Inspection No"), inspection?.inspectionId ? `#${inspection.inspectionId}` : null], [text("Thời điểm kiểm tra", "Inspected at"), date(inspection?.inspectedAt, true)], [text("Trạng thái kiểm tra", "Inspection status"), condition(inspection?.status)], [text("Đánh giá tổng thể", "Overall condition"), condition(inspection?.overallCondition)]])}
                  <p className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 p-3 text-xs leading-relaxed text-slate-700">{inspection?.summary || text("Chưa ghi nhận nhận xét tổng thể.", "No inspection summary recorded.")}</p>
                  {items.length ? <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[540px] text-left text-xs"><thead className="bg-slate-50 text-[11px] text-slate-500"><tr>{["#", text("Hạng mục", "Item"), text("Hiện trạng", "Condition"), text("Ghi chú / Minh chứng", "Notes / Evidence"), text("Chi phí ghi nhận", "Recorded charge")].map(title => <th key={title} className="p-3 font-semibold">{title}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={item.itemId || index} className="border-t border-slate-100 align-top"><td className="p-3 text-slate-400">{index + 1}</td><td className="p-3 font-semibold">{item.itemName || missing}</td><td className="p-3">{condition(item.condition)}</td><td className="p-3"><p className="whitespace-pre-wrap">{item.notes || missing}</p>{safeLink(item.photoUrl) && <a href={safeLink(item.photoUrl)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-semibold text-blue-700 underline">{text("Xem ảnh minh chứng", "View evidence photo")}</a>}</td><td className="p-3 text-right tabular-nums">{item.chargeAmount == null ? missing : formatCurrency(item.chargeAmount)}</td></tr>)}</tbody></table></div>
                    : <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">{text("Hồ sơ chưa có danh sách kiểm tra chi tiết. Chưa đủ thông tin để xác nhận từng hạng mục cửa, khóa, tường, sàn, trần, vệ sinh và thiết bị.", "No detailed checklist is recorded. Doors, locks, walls, floor, ceiling, cleanliness and equipment cannot be individually confirmed.")}</p>}
                </section>
                <section>{sectionTitle("04", text("Ghi chú và nội dung bàn giao", "Handover notes"))}<p className="whitespace-pre-wrap rounded-xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-700">{record.handoverNotes || text("Chưa ghi nhận ghi chú bàn giao hoặc tồn tại cần xử lý.", "No handover notes or outstanding issues recorded.")}</p></section>
                <section>{sectionTitle("05", text("Xác nhận của các bên", "Party acknowledgements"))}<div className="grid gap-4 sm:grid-cols-2">{signature(record.handledByName, record.staffSignedAt, record.staffSignatureRef, text("Đại diện cơ sở", "Facility representative"))}{signature(record.customerName, record.customerSignedAt, record.customerSignatureRef, text("Khách hàng", "Customer"))}</div></section>
                <p className="border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-500">{text("Bản hiển thị phản ánh dữ liệu hiện có trong hồ sơ. Mục “Chưa ghi nhận” không đồng nghĩa đã kiểm tra đạt hoặc đã ký xác nhận. Thời gian hiển thị theo giờ Việt Nam (UTC+7).", "This view reflects the stored record. “Not recorded” does not mean inspected, passed or signed. Times are shown in Vietnam time (UTC+7).")}</p>
              </div>}
        </div>
        <div className="handover-screen-only flex justify-end border-t border-slate-200 px-5 py-4"><button type="button" id="close-handover-modal" onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800">{text("Đóng biên bản", "Close report")}</button></div>
      </div>
    </div>, document.body
  );
}
