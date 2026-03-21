'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { getCart, removeFromCart, clearCart, getCartTotal, CartItem } from '@/lib/cart';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());

    const handleCartChange = () => {
      setCart(getCart());
    };

    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, []);

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    router.push('/booking');
  };

  const total = getCartTotal();
  const originalTotal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const savings = originalTotal - total;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some tests to get started!</p>
            <button
              onClick={() => router.push('/tests')}
              className="btn btn-primary"
            >
              Browse Tests
            </button>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const discount = item.originalPrice 
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        {discount > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Category:</span>
                          <span>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Sample:</span>
                          <span>{item.sampleType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Report in:</span>
                          <span>{item.turnaroundTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{originalTotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Home Collection</span>
                  <span className="text-green-600">FREE</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>100% NABL Certified Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Free Home Sample Collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Reports in 24-48 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
