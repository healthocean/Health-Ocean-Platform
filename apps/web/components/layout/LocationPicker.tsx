'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Crosshair, X, Globe, MapPinned } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

export default function LocationPicker() {
  const { location, setLocation, detectLocation, isLoading } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isError, setIsError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleManualPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setIsError(true);
      return;
    }
    
    // Reverse geocode pincode to city (simple mock or use an API)
    // For now we'll fetch from a public API to get city for pincode
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setLocation({
          city: postOffice.District || postOffice.Name,
          pincode: pincode,
          source: 'manual',
        });
        setIsOpen(false);
        setPincode('');
        setIsError(false);
      } else {
        setIsError(true);
      }
    } catch (e) {
      setIsError(true);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-all group border border-gray-100 bg-white shadow-sm"
      >
        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="text-left hidden sm:block pr-1">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">Delivering to</p>
          <div className="flex items-center gap-1 leading-none">
            <span className="text-xs font-black text-gray-900 truncate max-w-[120px]">
              {isLoading ? 'Detecting...' : (location?.city ? `${location.city}, ${location.pincode}` : 'Select Location')}
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Modern Location Modal */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 sm:left-0 w-[320px] bg-white rounded-[28px] shadow-2xl border border-gray-100 p-6 z-[60] animate-in fade-in zoom-in duration-200 origin-top">
          <div ref={modalRef}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Select Location</h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Auto Detect Button */}
            <button
              onClick={async () => {
                await detectLocation();
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-4 p-4 bg-primary-50 rounded-2xl hover:bg-primary-100 transition group border-2 border-primary-100 border-dashed mb-6"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 group-hover:scale-110 transition">
                <Crosshair className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <p className="font-black text-primary-900 text-sm">Use Current Location</p>
                <p className="text-xs text-primary-600 font-bold opacity-70 italic">GPS or IP Detection</p>
              </div>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                <span className="bg-white px-3 text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">OR</span>
              </div>
              <div className="border-t border-gray-100"></div>
            </div>

            {/* Manual Pincode Input */}
            <form onSubmit={handleManualPincode}>
              <div className="space-y-4">
                <div className="relative">
                  <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ''));
                      setIsError(false);
                    }}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none transition font-bold text-gray-900 placeholder:text-gray-300 ${
                      isError ? 'border-red-200 bg-red-50 focus:border-red-500' : 'border-transparent focus:border-primary-500 focus:bg-white'
                    }`}
                  />
                </div>
                
                {isError && (
                  <p className="text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Please enter a valid Indian pincode
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pincode.length !== 6 || isLoading}
                  className="w-full py-4 bg-[#0077b6] hover:bg-[#03045e] text-white rounded-2xl font-black text-sm tracking-widest transition shadow-lg disabled:opacity-30 disabled:hover:bg-[#0077b6]"
                >
                  APPLY LOCATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
