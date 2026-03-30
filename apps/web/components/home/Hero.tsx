'use client';

import { Phone, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Hero Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Left Banner */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-8 flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full mb-3">
                OFFER
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Compare. Choose. Save.
              </h2>
              <p className="text-gray-700 mb-4">
                Explore top health checkups<br />and pick the perfect one<br />for you!
              </p>
              <button 
                onClick={() => router.push('/tests')}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
              >
                View Packages
              </button>
            </div>
            <div className="hidden md:block w-48 h-48 bg-white/50 rounded-lg"></div>
          </div>

          {/* Right Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Book your lab tests<br />effortlessly via<br />📱 WhatsApp.
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your convenience is our priority
              </p>
              <button 
                onClick={() => router.push('/booking')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Book Now
              </button>
            </div>
            <div className="hidden md:block w-48 h-48 bg-white/50 rounded-lg"></div>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => router.push('/tests')}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">🧪</span>
            <span className="font-medium">All Tests</span>
          </button>
          <button 
            onClick={() => router.push('/tests')}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">❤️</span>
            <span className="font-medium">Health Packages</span>
          </button>
          <button 
            onClick={() => router.push('/booking')}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <span className="text-2xl">📞</span>
            <span className="font-medium">Book on Call</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition">
            <span className="text-2xl">📄</span>
            <span className="font-medium">Upload Prescription</span>
          </button>
          <button 
            onClick={() => document.getElementById('nearby-labs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition shadow-sm"
          >
            <span className="text-2xl">📍</span>
            <span className="font-medium text-primary-600">Labs Near Me</span>
          </button>
        </div>

        {/* PLUS Membership Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-lg font-bold">Plus</span>
            <p className="text-sm">
              Save 5% on medicines, 50% on 1st lab test & get FREE delivery with PLUS membership
            </p>
          </div>
          <button className="text-white underline hover:no-underline whitespace-nowrap">
            Know more &gt;
          </button>
        </div>
      </div>
    </section>
  );
}