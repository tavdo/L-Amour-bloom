export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export function normalizeCart(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of items) {
    if (!item.productId || item.quantity < 1) continue;
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: Math.min(item.quantity, 20),
      });
    }
  }
  return [...map.values()];
}
