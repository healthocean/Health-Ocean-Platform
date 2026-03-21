import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Target, Users, Award, Heart, Shield, Clock, MapPin, Stethoscope } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Health Ocean</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dive into Better Health - Making lab test bookings affordable, high-quality, and easily accessible across India
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
            <Target className="w-12 h-12 text-primary-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-700">
              To revolutionize healthcare accessibility by providing convenient, affordable, and reliable lab testing services at your doorstep. We believe everyone deserves easy access to quality healthcare.
            </p>
          </div>

          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-8">
            <Heart className="w-12 h-12 text-secondary-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-700">
              To become India's most trusted healthcare platform, empowering millions to take control of their health through preventive care and early detection.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">700+</div>
              <div className="text-gray-600">NABL Labs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">80L+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">20</div>
              <div className="text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">500+</div>
              <div className="text-gray-600">Tests Available</div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Health Ocean?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% NABL Certified</h3>
              <p className="text-gray-600">
                All our partner labs are NABL and ISO certified, ensuring accurate and reliable results.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Phlebotomists</h3>
              <p className="text-gray-600">
                Trained and certified professionals ensure safe and comfortable sample collection at home.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-accent-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Up to 50% off on lab tests with transparent pricing and no hidden charges.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Reports</h3>
              <p className="text-gray-600">
                Get your test results within 24-48 hours delivered securely online.
              </p>
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-16 bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Services</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6">
              <Stethoscope className="w-12 h-12 text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">500+ Lab Tests</h3>
              <p className="text-gray-600">
                Comprehensive range of diagnostic tests from basic to advanced health screenings.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <MapPin className="w-12 h-12 text-secondary-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Home Collection</h3>
              <p className="text-gray-600">
                Free sample collection at your doorstep at your convenient time slot.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <Shield className="w-12 h-12 text-accent-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Reports</h3>
              <p className="text-gray-600">
                Access your reports anytime, anywhere through our secure online platform.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-6 opacity-90">Book your lab test today and get reports delivered online</p>
          <button 
            onClick={() => window.location.href = '/tests'}
            className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Browse Tests
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
