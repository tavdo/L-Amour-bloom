export type Currency = "GEL" | "USD";

export const CURRENCY_COOKIE = "af_currency";
export const CART_STORAGE_KEY = "af_cart_v1";

export function formatMoney(amountMinor: number, currency: Currency): string {
  const major = (amountMinor / 100).toFixed(2);
  return currency === "GEL" ? `₾${major}` : `$${major}`;
}

export function pickPrice(
  gelMinor: number,
  usdMinor: number,
  currency: Currency,
): number {
  return currency === "USD" ? usdMinor : gelMinor;
}
