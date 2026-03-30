'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import {
  Target, Heart, Award, Users, Clock, MapPin,
  Stethoscope, Shield, CheckCircle, ArrowRight,
  FlaskConical, Truck, FileText, Star,
} from 'lucide-react';

const stats = [
  { value: '700+',  label: 'NABL Certified Labs',  icon: '🏥' },
  { value: '80L+',  label: 'Happy Patients',        icon: '😊' },
  { value: '500+',  label: 'Diagnostic Tests',      icon: '🧪' },
  { value: '20+',   label: 'Cities Covered',        icon: '📍' },
];

const values = [
  { icon: <Award className="w-6 h-6" />,       title: 'NABL Certified',      desc: 'Every partner lab is NABL & ISO certified for accurate, reliable results.',       color: 'bg-[#caf0f8] text-[#0077b6]' },
  { icon: <Users className="w-6 h-6" />,       title: 'Expert Phlebotomists', desc: 'Trained professionals ensure safe, comfortable home sample collection.',          color: 'bg-[#e0f7fa] text-[#00b4d8]' },
  { icon: <Heart className="w-6 h-6" />,       title: 'Affordable Pricing',   desc: 'Up to 50% off on lab tests. Transparent pricing, zero hidden charges.',          color: 'bg-[#fce4ec] text-[#c2185b]' },
  { icon: <Clock className="w-6 h-6" />,       title: 'Fast Reports',         desc: 'Digital reports delivered within 24–48 hours, accessible anytime.',              color: 'bg-[#f3e5f5] text-[#7b1fa2]' },
  { icon: <Shield className="w-6 h-6" />,      title: 'Data Privacy',         desc: 'Your health data is encrypted and never shared without your consent.',           color: 'bg-[#e8f5e9] text-[#2e7d32]' },
  { icon: <MapPin className="w-6 h-6" />,      title: 'Pan-India Network',    desc: 'Serving 20+ cities with a growing network of certified diagnostic partners.',    color: 'bg-[#fff3e0] text-[#e65100]' },
];

const services = [
  { icon: <FlaskConical className="w-7 h-7 text-[#0077b6]" />, title: '500+ Lab Tests',     desc: 'From basic CBC to advanced genomics — all under one platform.' },
  { icon: <Truck className="w-7 h-7 text-[#0077b6]" />,        title: 'Free Home Collection', desc: 'Book a slot, we come to you. No travel, no queues.' },
  { icon: <FileText className="w-7 h-7 text-[#0077b6]" />,     title: 'Digital Reports',    desc: 'Secure, shareable reports delivered to your phone and email.' },
  { icon: <Stethoscope className="w-7 h-7 text-[#0077b6]" />,  title: 'Doctor Curated',     desc: 'Health packages designed by medical experts for every age group.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #caf0f8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #90e0ef 0%, transparent 40%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            🌊 About Health Ocean
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Dive Into<br />
            <span className="text-[#90e0ef]">Better Health</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to make quality diagnostics accessible, affordable, and effortless for every Indian — from the comfort of their home.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/tests" className="px-7 py-3 bg-white text-[#0077b6] font-semibold rounded-xl hover:bg-[#caf0f8] transition-all shadow-lg">
              Explore Tests
            </Link>
            <Link href="/packages" className="px-7 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#f0fbff]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#caf0f8] hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-[#03045e] mb-1">{s.value}</div>
                <div className="text-sm text-[#0077b6]/70 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] rounded-3xl p-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <Target className="w-6 h-6 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl font-bold text-[#03045e] mb-3">Our Mission</h2>
            <p className="text-[#03045e]/70 leading-relaxed">
              To revolutionize healthcare accessibility by providing convenient, affordable, and reliable lab testing services at your doorstep. We believe everyone deserves easy access to quality diagnostics — regardless of location or income.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#fce4ec] to-[#f8bbd0] rounded-3xl p-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <Heart className="w-6 h-6 text-[#c2185b]" />
            </div>
            <h2 className="text-2xl font-bold text-[#880e4f] mb-3">Our Vision</h2>
            <p className="text-[#880e4f]/70 leading-relaxed">
              To become India's most trusted healthcare platform — empowering millions to take control of their health through preventive care, early detection, and seamless digital experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 bg-[#f0fbff]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#0077b6] uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-3xl font-bold text-[#03045e]">Everything You Need, In One Place</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#caf0f8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#caf0f8] rounded-xl flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-[#03045e] mb-2">{s.title}</h3>
                <p className="text-sm text-[#0077b6]/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#0077b6] uppercase tracking-widest mb-2">Our Values</p>
            <h2 className="text-3xl font-bold text-[#03045e]">Why Patients Trust Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.color}`}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#03045e] mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#caf0f8] border border-[#90e0ef] rounded-full text-xs font-semibold text-[#0077b6] tracking-widest uppercase mb-6">
            <Star className="w-3.5 h-3.5" /> Rated 4.8 by 80L+ patients
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-[#0077b6]/60 mb-8 text-lg">Book a test today. Results delivered to your phone within 24 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/tests" className="flex items-center gap-2 px-8 py-3.5 bg-[#0077b6] text-white font-semibold rounded-xl hover:bg-[#03045e] transition-all shadow-lg shadow-[#0077b6]/20">
              Browse Tests <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/packages" className="flex items-center gap-2 px-8 py-3.5 border-2 border-[#90e0ef] text-[#0077b6] font-semibold rounded-xl hover:bg-[#caf0f8]/40 transition-all">
              View Packages
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
