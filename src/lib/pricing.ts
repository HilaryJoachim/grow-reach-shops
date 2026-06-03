export interface PricedProduct {
  retail_price: number;
  wholesale_price: number;
  moq: number;
}

export function unitPriceFor(p: PricedProduct, qty: number): number {
  return qty >= p.moq ? Number(p.wholesale_price) : Number(p.retail_price);
}

export function lineTotal(p: PricedProduct, qty: number): number {
  return unitPriceFor(p, qty) * qty;
}

export function savingsFor(p: PricedProduct, qty: number): number {
  if (qty < p.moq) return 0;
  return (Number(p.retail_price) - Number(p.wholesale_price)) * qty;
}
