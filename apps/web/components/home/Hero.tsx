'use client';

import { Search, MapPin, Phone, Upload } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/tests');
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Location Selector */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-none outline-none bg-transparent font-medium cursor-pointer"
              >
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Pune</option>
                <option>Hyderabad</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for Tests/Packages/Labs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Search Button */}
            <button type="submit" className="btn btn-primary px-8">
              Search
            </button>

            {/* Right side buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-500">
                <Phone className="w-4 h-4" />
                Download App
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-500">
                <Upload className="w-4 h-4" />
                Offers
              </button>
            </div>
          </div>
        </form>

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