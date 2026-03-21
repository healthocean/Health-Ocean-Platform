import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import HealthConcerns from '@/components/home/HealthConcerns';
import VitalOrgans from '@/components/home/VitalOrgans';
import EasyBooking from '@/components/home/EasyBooking';
import RecommendedCheckups from '@/components/home/RecommendedCheckups';
import WhyTrust from '@/components/home/WhyTrust';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HealthConcerns />
      <VitalOrgans />
      <EasyBooking />
      <RecommendedCheckups />
      <WhyTrust />
      <Footer />
    </main>
  );
}