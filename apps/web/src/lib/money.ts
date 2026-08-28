export type HourlyRate = number | string | null | undefined;

export function parseHourlyRate(rate: HourlyRate) {
  if (rate === null || rate === undefined || rate === "") return null;

  const value = Number(rate);
  return Number.isFinite(value) ? value : null;
}

export function calculateAmount(minutes: number, hourlyRate: HourlyRate) {
  const rate = parseHourlyRate(hourlyRate);
  return rate === null ? null : (minutes / 60) * rate;
}

export function formatMoney(amount: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CZK" ? 0 : 2,
  }).format(amount);
}
