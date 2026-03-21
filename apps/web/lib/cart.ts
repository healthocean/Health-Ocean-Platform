// Cart utility functions

export interface CartItem {
  id: string;
  testId?: string;
  packageId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  sampleType: string;
  turnaroundTime: string;
}

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cartStr = localStorage.getItem('cart');
  if (!cartStr) return [];
  try {
    return JSON.parse(cartStr);
  } catch {
    return [];
  }
};

export const addToCart = (item: CartItem): void => {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  
  // Check if item already exists
  const exists = cart.find(i => i.id === item.id);
  if (exists) return;
  
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Dispatch event to update UI
  window.dispatchEvent(new Event('cart-change'));
};

export const removeFromCart = (itemId: string): void => {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const filtered = cart.filter(i => i.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(filtered));
  
  // Dispatch event to update UI
  window.dispatchEvent(new Event('cart-change'));
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
  
  // Dispatch event to update UI
  window.dispatchEvent(new Event('cart-change'));
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price, 0);
};

export const getCartCount = (): number => {
  return getCart().length;
};

export const isInCart = (itemId: string): boolean => {
  const cart = getCart();
  return cart.some(i => i.id === itemId);
};
