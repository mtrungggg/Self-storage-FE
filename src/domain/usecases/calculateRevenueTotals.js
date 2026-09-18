// Domain layer: sums two parallel revenue series into monthly totals.
export function calculateRevenueTotals(seriesA, seriesB) {
  return seriesA.map((value, index) => value + (seriesB[index] ?? 0));
}
