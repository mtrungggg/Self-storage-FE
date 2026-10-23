import { useEffect, useState } from "react";
import adminOperationsService from "../api/adminOperationsService";
import facilityService from "../api/facilityService";

const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const tabClass = (active) => `rounded-xl px-4 py-2 text-sm font-bold ${active ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"}`;
const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
const today = () => new Date().toISOString().slice(0, 10);

const feeTypes = [
  ["late_fee", "Phí trễ hạn"],
  ["damage_fee", "Phí hư hỏng"],
  ["lost_key_fee", "Phí mất khóa"],
  ["maintenance_fee", "Phí bảo trì"],
  ["other", "Khác"],
];
const calcMethods = [["flat", "Cố định"], ["percentage", "Phần trăm"], ["per_day", "Theo ngày"]];
const discountTypes = [["percentage", "Phần trăm"], ["fixed", "Số tiền cố định"]];

function RatesTab({ facilities, unitTypes }) {
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || "");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ unitTypeId: "", monthlyRate: "", depositAmount: "", bookingFee: "", validFrom: today() });
  const [saving, setSaving] = useState(false);

  function reload() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    adminOperationsService.getRates({ FacilityId: facilityId }).then(
      (data) => { setRates(data.items); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); },
    );
  }

  useEffect(reload, [facilityId]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await adminOperationsService.upsertRate({
        facilityId: Number(facilityId),
        unitTypeId: Number(form.unitTypeId),
        monthlyRate: Number(form.monthlyRate),
        depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
        bookingFee: Number(form.bookingFee) || 0,
        validFrom: form.validFrom,
        validTo: null,
      });
      setNotice("Đã lưu bảng giá.");
      setForm({ unitTypeId: "", monthlyRate: "", depositAmount: "", bookingFee: "", validFrom: today() });
      reload();
    } catch (err) {
      setError(err.message || "Không thể lưu bảng giá.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <label className="max-w-sm"><span className="mb-1 block text-sm font-semibold">Kho *</span>
          <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={inputClass}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
          </select>
        </label>
      </div>

      <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Thêm / cập nhật giá cho một loại ô kho</h2>
        {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label><span className="mb-1 block text-sm font-semibold">Loại ô kho *</span>
            <select required value={form.unitTypeId} onChange={(e) => setForm({ ...form, unitTypeId: e.target.value })} className={inputClass}>
              <option value="">Chọn loại</option>
              {unitTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giá thuê/tháng (VND) *</span>
            <input required type="number" min="0" step="1000" value={form.monthlyRate} onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Tiền cọc (VND)</span>
            <input type="number" min="0" step="1000" value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} placeholder="Mặc định = giá thuê" className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Phí đặt chỗ (VND) *</span>
            <input required type="number" min="0" step="1000" value={form.bookingFee} onChange={(e) => setForm({ ...form, bookingFee: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Hiệu lực từ *</span>
            <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className={inputClass} />
          </label>
        </div>
        <button disabled={saving} className={`mt-4 ${buttonClass}`}>{saving ? "Đang lưu..." : "Lưu bảng giá"}</button>
      </form>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Bảng giá hiện tại{rates ? ` (${rates.length})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải...</p>}
        {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p><button type="button" onClick={reload} className="mt-2 font-semibold underline">Thử lại</button>
        </div>}
        {rates && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Loại ô kho", "Giá thuê/tháng", "Tiền cọc", "Phí đặt chỗ", "Hiệu lực từ", "Hiệu lực đến"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{rate.unitTypeName}</td>
                    <td className="p-3">{formatVnd(rate.monthlyRate)}</td>
                    <td className="p-3">{formatVnd(rate.depositAmount)}</td>
                    <td className="p-3">{formatVnd(rate.bookingFee)}</td>
                    <td className="p-3">{rate.validFrom}</td>
                    <td className="p-3">{rate.validTo || "Không giới hạn"}</td>
                  </tr>
                ))}
                {rates.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#58657a]">Chưa có bảng giá cho kho này.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FeesTab({ facilities }) {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    facilityId: "", code: "", feeType: "late_fee", calculationMethod: "flat",
    amount: "", ratePercent: "", graceDays: "0", validFrom: today(), isActive: true,
  });
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    setError("");
    adminOperationsService.getFees({ PageSize: 100 }).then(
      (data) => { setFees(data.items); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); },
    );
  }

  useEffect(reload, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await adminOperationsService.upsertFee({
        facilityId: form.facilityId ? Number(form.facilityId) : null,
        code: form.code.trim(),
        feeType: form.feeType,
        calculationMethod: form.calculationMethod,
        amount: form.calculationMethod === "percentage" ? null : Number(form.amount),
        ratePercent: form.calculationMethod === "percentage" ? Number(form.ratePercent) : null,
        graceDays: Number(form.graceDays) || 0,
        conditions: "{}",
        validFrom: form.validFrom,
        validTo: null,
        isActive: form.isActive,
      });
      setNotice("Đã lưu quy tắc phí.");
      setForm({ facilityId: "", code: "", feeType: "late_fee", calculationMethod: "flat", amount: "", ratePercent: "", graceDays: "0", validFrom: today(), isActive: true });
      reload();
    } catch (err) {
      setError(err.message || "Không thể lưu quy tắc phí.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Thêm / cập nhật quy tắc phí</h2>
        {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label><span className="mb-1 block text-sm font-semibold">Phạm vi</span>
            <select value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })} className={inputClass}>
              <option value="">Áp dụng toàn hệ thống</option>
              {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Mã quy tắc *</span>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: LATE-5PCT" className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Loại phí *</span>
            <select required value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })} className={inputClass}>
              {feeTypes.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Cách tính *</span>
            <select required value={form.calculationMethod} onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })} className={inputClass}>
              {calcMethods.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          {form.calculationMethod === "percentage" ? (
            <label><span className="mb-1 block text-sm font-semibold">Tỷ lệ (%) *</span>
              <input required type="number" min="0.0001" step="0.0001" value={form.ratePercent} onChange={(e) => setForm({ ...form, ratePercent: e.target.value })} className={inputClass} />
            </label>
          ) : (
            <label><span className="mb-1 block text-sm font-semibold">Số tiền (VND) *</span>
              <input required type="number" min="0" step="1000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
            </label>
          )}
          <label><span className="mb-1 block text-sm font-semibold">Số ngày ân hạn</span>
            <input type="number" min="0" value={form.graceDays} onChange={(e) => setForm({ ...form, graceDays: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Hiệu lực từ *</span>
            <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className={inputClass} />
          </label>
          <label className="flex items-end gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><span className="text-sm font-semibold">Đang áp dụng</span></label>
        </div>
        <button disabled={saving} className={`mt-4 ${buttonClass}`}>{saving ? "Đang lưu..." : "Lưu quy tắc phí"}</button>
      </form>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách quy tắc phí{fees ? ` (${fees.length})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải...</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {fees && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Mã", "Phạm vi", "Loại phí", "Giá trị", "Ân hạn", "Hiệu lực từ", "Trạng thái"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{fee.code}</td>
                    <td className="p-3">{fee.facilityName || "Toàn hệ thống"}</td>
                    <td className="p-3">{feeTypes.find(([v]) => v === fee.feeType)?.[1] || fee.feeType}</td>
                    <td className="p-3">{fee.calculationMethod === "percentage" ? `${fee.ratePercent}%` : formatVnd(fee.amount)}</td>
                    <td className="p-3">{fee.graceDays} ngày</td>
                    <td className="p-3">{fee.validFrom}</td>
                    <td className="p-3">{fee.isActive ? "Đang áp dụng" : "Tạm ngừng"}</td>
                  </tr>
                ))}
                {fees.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#58657a]">Chưa có quy tắc phí.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PromotionsTab() {
  const [promotions, setPromotions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    code: "", name: "", description: "", discountType: "percentage",
    discountValue: "", maxDiscountAmount: "", usageLimit: "", perCustomerLimit: "",
    validFrom: today(), validTo: "",
  });
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    setError("");
    adminOperationsService.getPromotions({ PageSize: 100 }).then(
      (data) => { setPromotions(data.items); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); },
    );
  }

  useEffect(reload, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await adminOperationsService.createPromotion({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
        isActive: true,
        rules: [],
      });
      setNotice("Đã tạo khuyến mãi.");
      setForm({ code: "", name: "", description: "", discountType: "percentage", discountValue: "", maxDiscountAmount: "", usageLimit: "", perCustomerLimit: "", validFrom: today(), validTo: "" });
      reload();
    } catch (err) {
      setError(err.message || "Không thể tạo khuyến mãi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(promo) {
    try {
      await adminOperationsService.updatePromotionStatus(promo.id, !promo.isActive);
      reload();
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái khuyến mãi.");
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Tạo khuyến mãi mới</h2>
        {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label><span className="mb-1 block text-sm font-semibold">Mã khuyến mãi *</span>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} />
          </label>
          <label className="xl:col-span-2"><span className="mb-1 block text-sm font-semibold">Tên khuyến mãi *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Loại giảm giá *</span>
            <select required value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className={inputClass}>
              {discountTypes.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giá trị giảm *</span>
            <input required type="number" min="0.01" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "percentage" ? "VD: 10 (%)" : "VD: 200000 (VND)"} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giảm tối đa (VND)</span>
            <input type="number" min="0" step="1000" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giới hạn lượt dùng</span>
            <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Giới hạn / khách hàng</span>
            <input type="number" min="1" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Hiệu lực từ *</span>
            <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Hiệu lực đến *</span>
            <input required type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className={inputClass} />
          </label>
          <label className="xl:col-span-2"><span className="mb-1 block text-sm font-semibold">Mô tả</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </label>
        </div>
        <button disabled={saving} className={`mt-4 ${buttonClass}`}>{saving ? "Đang tạo..." : "Tạo khuyến mãi"}</button>
      </form>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách khuyến mãi{promotions ? ` (${promotions.length})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải...</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {promotions && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Mã", "Tên", "Giảm giá", "Hiệu lực", "Trạng thái", "Thao tác"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{promo.code}</td>
                    <td className="p-3">{promo.name}</td>
                    <td className="p-3">{promo.discountType === "percentage" ? `${promo.discountValue}%` : formatVnd(promo.discountValue)}</td>
                    <td className="p-3">{new Date(promo.validFrom).toLocaleDateString("vi-VN")} - {new Date(promo.validTo).toLocaleDateString("vi-VN")}</td>
                    <td className="p-3">{promo.isActive ? "Đang áp dụng" : "Tạm ngừng"}</td>
                    <td className="p-3 text-right">
                      <button type="button" onClick={() => toggleStatus(promo)} className="rounded-lg bg-[#eef4ff] px-3 py-1.5 font-semibold text-[#1d5fe5]">
                        {promo.isActive ? "Tạm ngừng" : "Kích hoạt"}
                      </button>
                    </td>
                  </tr>
                ))}
                {promotions.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#58657a]">Chưa có khuyến mãi.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminPricingPolicy() {
  const [facilities, setFacilities] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [tab, setTab] = useState("rates");

  useEffect(() => {
    facilityService.getFacilities().then(setFacilities).catch(() => setFacilities([]));
    facilityService.getUnitTypes().then(setUnitTypes).catch(() => setUnitTypes([]));
  }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">payments</span>
            Chính sách giá &amp; Khuyến mãi
          </h1>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("rates")} className={tabClass(tab === "rates")}>Bảng giá thuê</button>
        <button type="button" onClick={() => setTab("fees")} className={tabClass(tab === "fees")}>Quy tắc phí</button>
        <button type="button" onClick={() => setTab("promotions")} className={tabClass(tab === "promotions")}>Khuyến mãi</button>
      </div>

      <div className="mt-5">
        {tab === "rates" && facilities.length > 0 && <RatesTab facilities={facilities} unitTypes={unitTypes} />}
        {tab === "fees" && <FeesTab facilities={facilities} />}
        {tab === "promotions" && <PromotionsTab />}
      </div>
    </div>
  );
}
