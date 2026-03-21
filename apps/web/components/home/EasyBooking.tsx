import { Phone, Upload } from 'lucide-react';

export default function EasyBooking() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Easy ways to book a test
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Call Us to Book */}
          <button className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-left hover:shadow-xl transition group overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Call Us to</h3>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Book 📞</h3>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full"></div>
          </button>

          {/* Upload Prescription */}
          <button className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-left hover:shadow-xl transition group overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Upload</h3>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Prescription 📄</h3>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full"></div>
          </button>
        </div>
      </div>
    </section>
  );
}