// Domain layer: derives the full term-based price matrix from a base monthly price per unit type.
export function calculatePriceMatrix(units, terms) {
  return units.map((unit) => ({
    ...unit,
    prices: terms.map((term) => ({
      termId: term.id,
      amount: Math.round((unit.basePrice * (1 - term.discountPercent / 100)) / 500) * 500,
    })),
  }));
}
