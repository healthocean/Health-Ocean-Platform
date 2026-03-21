import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/logo.jpeg" 
                alt="Health Ocean Logo" 
                width={40} 
                height={40} 
                className="rounded-lg"
              />
              <div>
                <span className="text-xl font-bold text-white">Health Ocean</span>
                <p className="text-xs text-gray-400">Dive into better health</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted partner for convenient lab testing with home sample collection and digital reports.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/tests" className="hover:text-primary-400 transition">All Tests</Link></li>
              <li><Link href="/packages" className="hover:text-primary-400 transition">Health Packages</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary-400 transition">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-primary-400 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-primary-400 transition">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition">Terms of Service</Link></li>
              <li><Link href="/cancellation" className="hover:text-primary-400 transition">Cancellation Policy</Link></li>
              <li><Link href="/help" className="hover:text-primary-400 transition">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                <span className="text-sm">support@healthocean.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-400 mt-0.5" />
                <span className="text-sm">1800-123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                <span className="text-sm">Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Health Ocean. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-primary-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-primary-400 transition">Terms</Link>
              <Link href="/sitemap" className="hover:text-primary-400 transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}