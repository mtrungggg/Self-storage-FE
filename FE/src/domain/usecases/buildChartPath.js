// Pure function: converts a series of numeric readings into an SVG path string.
// Framework-independent business logic (domain layer) — no React, no data fetching.
export function buildChartPath(values, min, max, width, height) {
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
