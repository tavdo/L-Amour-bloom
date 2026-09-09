export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  shipping: "shipping",
  orders: "orders",
  settings: "settings",
  product: (slug: string) => `product:${slug}`,
} as const;
