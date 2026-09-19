export interface CartItem {
  productSlug: string;
  name: string;
  priceCents: number;
  quantity: number;
}

function cartKey(tenantSlug: string) {
  return `cart:${tenantSlug}`;
}

// Carrinho vive só no localStorage do navegador — sem sessão de cliente
// obrigatória para navegar e montar o carrinho, só no checkout.
export function readCart(tenantSlug: string): CartItem[] {
  try {
    const raw = window.localStorage.getItem(cartKey(tenantSlug));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function addToCart(tenantSlug: string, item: CartItem) {
  const cart = readCart(tenantSlug);
  const existing = cart.find((i) => i.productSlug === item.productSlug);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  window.localStorage.setItem(cartKey(tenantSlug), JSON.stringify(cart));
  return cart;
}

export function clearCart(tenantSlug: string) {
  window.localStorage.removeItem(cartKey(tenantSlug));
}
