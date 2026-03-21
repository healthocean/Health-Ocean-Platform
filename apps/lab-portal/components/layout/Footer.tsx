import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Health Ocean</span>
                <p className="text-xs text-gray-400">Lab Portal</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-md">
              Empowering diagnostic laboratories with cutting-edge management tools. Join India's fastest-growing healthcare network.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full group-hover:w-2 transition-all"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tests/add" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full group-hover:w-2 transition-all"></span>
                  Add Test
                </Link>
              </li>
              <li>
                <Link href="/packages/add" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full group-hover:w-2 transition-all"></span>
                  Add Package
                </Link>
              </li>
              <li>
                <Link href="/employees/register" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full group-hover:w-2 transition-all"></span>
                  Add Employee
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:lab-support@healthocean.com" className="hover:text-primary-400 transition-colors">
                  lab-support@healthocean.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <a href="tel:1800-LAB-HELP" className="hover:text-primary-400 transition-colors">
                  1800-LAB-HELP
                </a>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Available 24/7 for support
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2024 Health Ocean Lab Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for laboratories</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
