import { isEffective } from './getStorageTerms.js';

// Display candidates only. Facility eligibility and redemption limits require backend validation.
export function getPromotions(data, date) {
  return (data.promotions ?? [])
    .filter((promotion) => (promotion.is_active === true || promotion.is_active === 1) && isEffective(promotion, date))
    .map((promotion) => ({
      ...promotion,
      rules: (data.promotion_rules ?? []).filter((rule) => String(rule.promotion_id) === String(promotion.id)),
    }));
}
