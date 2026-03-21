'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, MapPin, User, Phone, Mail, ShoppingCart } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getCart, clearCart, getCartTotal } from '@/lib/cart';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Mumbai',
    pincode: '',
    date: '',
    timeSlot: '',
  });

  // Available coupons
  const availableCoupons = [
    { code: 'FIRST50', discount: 50, type: 'percentage', description: 'First booking - 50% off' },
    { code: 'HEALTH100', discount: 100, type: 'fixed', description: '₹100 off on orders above ₹500' },
    { code: 'SAVE20', discount: 20, type: 'percentage', description: '20% off on all tests' },
    { code: 'WELCOME', discount: 150, type: 'fixed', description: '₹150 off for new users' },
  ];

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);
      
      // Pre-fill form with user data
      if (userData) {
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        }));
        
        // Skip to address step if logged in
        setStep(2);
      }
    }

    // Load cart items
    setCart(getCart());
  }, []);

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const timeSlots = ['6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }

    const total = getCartTotal();
    
    // Check minimum order for fixed discount coupons
    if (coupon.code === 'HEALTH100' && total < 500) {
      setCouponError('Minimum order of ₹500 required for this coupon');
      return;
    }

    setAppliedCoupon(coupon);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const total = getCartTotal();
    
    if (appliedCoupon.type === 'percentage') {
      return Math.round((total * appliedCoupon.discount) / 100);
    } else {
      return appliedCoupon.discount;
    }
  };

  const getFinalTotal = () => {
    const total = getCartTotal();
    const discount = calculateDiscount();
    return Math.max(0, total - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit booking to API
      setLoading(true);
      
      try {
        const bookingData = {
          ...formData,
          testIds: cart.filter(i => !i.packageId).map(i => i.testId || i.id),
          packageIds: cart.filter(i => i.packageId).map(i => i.packageId || i.id),
          couponCode: appliedCoupon?.code || null,
          discount: calculateDiscount(),
          total: getFinalTotal(),
        };

        const response = await fetch('http://10.121.197.207:4000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (data.success) {
          console.log('Booking created:', data.booking);
          
          // Clear cart after successful booking
          clearCart();
          
          setStep(5);
        } else {
          alert('Booking failed: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to create booking. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const totalSteps = user ? 3 : 4;
  const stepLabels = user
    ? ['Address', 'Schedule', 'Review']
    : ['Personal Info', 'Address', 'Schedule', 'Review'];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        {step <= totalSteps && <div className="mb-8">
          {/* Circles and connectors */}
          <div className="flex items-center w-full">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <>
                <div key={`circle-${s}`} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 ${
                  step >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < totalSteps && (
                  <div key={`line-${s}`} className={`flex-1 h-1 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />
                )}
              </>
            ))}
          </div>
          {/* Labels */}
          <div className="flex items-start w-full mt-2">
            {stepLabels.map((label, index) => (
              <>
                <div key={`label-${index}`} className="w-10 text-xs text-center shrink-0">
                  <span className={step >= index + 1 ? 'text-primary-500 font-medium' : 'text-gray-500'}>
                    {label}
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div key={`spacer-${index}`} className="flex-1" />
                )}
              </>
            ))}
          </div>
        </div>}

        {step === 5 ? (
          /* Success Message */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your test has been scheduled. A phlebotomist will visit you at the scheduled time.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{formData.city}</span>
                </div>
                {cart.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tests:</span>
                    <span className="font-medium">{cart.length} test(s)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="btn btn-outline flex-1">
                View Dashboard
              </button>
              <button onClick={() => router.push('/')} className="btn btn-primary flex-1">
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Step 1: Personal Info (only if not logged in) */}
            {!user && step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address (Step 1 for logged in users) */}
            {((user && step === 2) || (!user && step === 2)) && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Address Details</h2>
                  {user && (
                    <p className="text-sm text-gray-600">
                      Booking for: <span className="font-medium">{user.name}</span> ({user.email})
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input"
                    placeholder="House/Flat No., Building Name, Street, Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    maxLength={6}
                    className="input"
                    placeholder="400001"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Schedule (Step 2 for logged in users) */}
            {((user && step === 3) || (!user && step === 3)) && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Sample Collection</h2>
                
                {/* Show cart items if any */}
                {cart.length > 0 && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="w-5 h-5 text-primary-500" />
                      <h3 className="font-semibold text-gray-900">Tests in Cart ({cart.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">₹{item.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-primary-200 pt-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>₹{getCartTotal()}</span>
                        </div>
                        
                        {appliedCoupon && (
                          <div className="flex justify-between text-sm text-green-600 mt-1">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-₹{calculateDiscount()}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-semibold mt-2">
                          <span>Total</span>
                          <span>₹{getFinalTotal()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Have a Coupon Code?</h3>
                  
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="btn btn-outline whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">{appliedCoupon.code}</span>
                          <span className="text-green-600">✓</span>
                        </div>
                        <p className="text-sm text-green-700">{appliedCoupon.description}</p>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          You saved ₹{calculateDiscount()}!
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  {couponError && (
                    <p className="text-sm text-red-600 mt-2">{couponError}</p>
                  )}

                  {/* Available Coupons */}
                  {!appliedCoupon && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Available coupons:</p>
                      <div className="space-y-2">
                        {availableCoupons.map((coupon) => (
                          <button
                            key={coupon.code}
                            type="button"
                            onClick={() => {
                              setCouponCode(coupon.code);
                              setCouponError('');
                            }}
                            className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded p-2 text-xs transition"
                          >
                            <span className="font-semibold text-primary-500">{coupon.code}</span>
                            <span className="text-gray-600"> - {coupon.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time Slot
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Our trained phlebotomist will arrive at your location during the selected time slot for sample collection.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review (non-logged-in) / Step 3: Review (logged-in) */}
            {step === totalSteps && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>
                <div className="space-y-4 text-sm">
                  {!user && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-700 mb-2">Personal Info</p>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500">Name</span><span>{formData.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{formData.email}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{formData.phone}</span></div>
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-700 mb-2">Address</p>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">City</span><span>{formData.city}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pincode</span><span>{formData.pincode}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="text-right max-w-xs">{formData.address}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-700 mb-2">Schedule</p>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formData.date}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Time Slot</span><span>{formData.timeSlot}</span></div>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-700 mb-2">Tests ({cart.length})</p>
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-gray-700">{item.name}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600 mt-2 border-t pt-2">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-₹{calculateDiscount()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2 border-t pt-2">
                        <span>Total</span>
                        <span>₹{getFinalTotal()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > (user ? 2 : 1) && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-outline flex-1"
                >
                  Back
                </button>
              )}
              <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                {loading ? 'Processing...' : (step === totalSteps ? 'Confirm Booking' : 'Continue')}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}
