export function storeName(): string {
  return process.env.NEXT_PUBLIC_STORE_NAME?.trim() || "L'Amour Bloom";
}

export function storeNameKa(): string {
  return process.env.NEXT_PUBLIC_STORE_NAME_KA?.trim() || "სიყვარულის ყვავილობა";
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function paymentsMode(): "live" | "mock" {
  return process.env.PAYMENTS_MODE === "live" ? "live" : "mock";
}
