import { getPromotions } from '../domain/usecases/getPromotions';

const display = (value) => value == null ? 'Chưa có thông tin' : typeof value === 'object' ? JSON.stringify(value) : String(value);

export default function StoragePromotions({ data, date }) {
  const promotions = getPromotions(data, date);
  return <section aria-label="Chương trình khuyến mãi" className="mt-6 rounded-xl border border-[#dfe7f5] bg-white p-5">
    <h2 className="text-lg font-bold">Chương trình khuyến mãi</h2>
    <p className="mt-1 text-sm text-[#58657a]">Các chương trình còn hiệu lực tại {date}. Chưa xác nhận áp dụng cho cơ sở hoặc lượt thuê của bạn; giá hiển thị chưa trừ khuyến mãi.</p>
    {promotions.length === 0 ? <p className="mt-3 text-sm">Chưa có chương trình khuyến mãi có hiệu lực trong dữ liệu được cung cấp.</p> :
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {promotions.map((promotion) => <article key={promotion.id} className="min-w-0 rounded-lg border border-[#dfe7f5] p-4">
          <h3 className="font-bold">{promotion.name}</h3>
          <p className="mt-1 break-words font-semibold text-blue-700">Mã: {promotion.code}</p>
          {promotion.description && <p className="mt-2 whitespace-pre-wrap text-sm">{promotion.description}</p>}
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt>Loại giảm giá</dt><dd className="break-words">{display(promotion.discount_type)}</dd>
            <dt>Giá trị giảm</dt><dd>{display(promotion.discount_value)}</dd>
            <dt>Mức giảm tối đa</dt><dd>{display(promotion.max_discount_amount)}</dd>
            <dt>Giới hạn lượt dùng</dt><dd>{display(promotion.usage_limit)}</dd>
            <dt>Giới hạn mỗi khách</dt><dd>{display(promotion.per_customer_limit)}</dd>
          </dl>
          <p className="mt-2 text-xs text-[#58657a]">Hiệu lực: {promotion.valid_from} → {promotion.valid_to || 'Không giới hạn'}</p>
          <details className="mt-3 rounded-lg bg-[#f8faff] p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Điều kiện áp dụng ({promotion.rules.length})</summary>
            {promotion.rules.length === 0 ? <p className="mt-2">Chưa có thông tin điều kiện áp dụng.</p> : <ul className="mt-2 space-y-2">
              {promotion.rules.map((rule) => <li key={rule.id} className="break-words">{display(rule.rule_type)} · {display(rule.operator)} · {display(rule.rule_value)}</li>)}
            </ul>}
            <p className="mt-2 text-xs text-[#58657a]">Loại giảm và điều kiện đang hiển thị theo dữ liệu gốc. Mức giảm thực tế và lượt dùng còn lại cần được xác nhận trước khi đặt chỗ.</p>
          </details>
        </article>)}
      </div>}
  </section>;
}
