'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const menCheckups = [
  { age: 'Under 25', label: 'Young Adult', image: '/assets/home/young_man.webp',      bg: 'bg-[#e0f7fa]', border: 'border-[#b2ebf2]', text: 'text-[#0077b6]' },
  { age: '25 – 50',  label: 'Mid Life',    image: '/assets/home/middle_age_man.webp', bg: 'bg-[#caf0f8]', border: 'border-[#90e0ef]', text: 'text-[#0077b6]' },
  { age: 'Above 50', label: 'Senior',      image: '/assets/home/old_man.webp',        bg: 'bg-[#90e0ef]', border: 'border-[#00b4d8]', text: 'text-[#03045e]' },
];

const womenCheckups = [
  { age: 'Under 25', label: 'Young Adult', image: '/assets/home/young_woman.webp',      bg: 'bg-[#fce4ec]', border: 'border-[#f8bbd0]', text: 'text-[#c2185b]' },
  { age: '25 – 50',  label: 'Mid Life',    image: '/assets/home/middle_age_woman.webp', bg: 'bg-[#f8bbd0]', border: 'border-[#f48fb1]', text: 'text-[#c2185b]' },
  { age: 'Above 50', label: 'Senior',      image: '/assets/home/old_woman.webp',        bg: 'bg-[#f48fb1]', border: 'border-[#e91e8c]', text: 'text-[#880e4f]' },
];

interface CheckupCardProps {
  image: string;
  age: string;
  label: string;
  bg: string;
  border: string;
  text: string;
}

function CheckupCard({ image, age, label, bg, border, text }: CheckupCardProps) {
  return (
    <button className={`group flex flex-col items-center rounded-2xl border ${border} ${bg} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden w-[200px]`}>
      {/* Square image area */}
      <div className="w-full aspect-square relative">
        <Image
          src={image}
          alt={`${label} ${age}`}
          fill
          className="object-cover object-top"
        />
      </div>
      {/* Label below */}
      <div className="w-full px-2 py-2 text-center">
        <p className={`text-xs font-bold ${text} leading-none mb-0.5`}>{age} yrs</p>
        <p className={`text-[10px] font-medium ${text} opacity-70`}>{label}</p>
      </div>
    </button>
  );
}

interface SectionProps {
  title: string;
  subtitle: string;
  items: typeof menCheckups;
  findMoreBg: string;
  findMoreBorder: string;
  findMoreText: string;
  findMoreIcon: string;
  onExplore: () => void;
}

function CheckupSection({ title, subtitle, items, findMoreBg, findMoreBorder, findMoreText, findMoreIcon, onExplore }: SectionProps) {
  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#03045e] leading-tight">{title}</h2>
          <p className="text-xs text-[#0077b6]/60 mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {items.map((c, i) => (
          <CheckupCard key={i} {...c} />
        ))}
        {/* Find more card — same fixed size */}
        <button
          onClick={onExplore}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${findMoreBorder} ${findMoreBg} hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-[200px] aspect-square`}
        >
          <span className={`text-2xl mb-1 ${findMoreText}`}>{findMoreIcon}</span>
          <span className={`text-xs font-bold ${findMoreText}`}>Explore</span>
          <span className={`text-[10px] font-medium ${findMoreText} opacity-60`}>All packages</span>
        </button>
      </div>
    </div>
  );
}

export default function RecommendedCheckups() {
  const router = useRouter();

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-[#90e0ef]">
            Curated by Doctors
          </div>
          <h2 className="text-2xl font-bold text-[#03045e]">Recommended Health Checkups</h2>
          <p className="text-sm text-[#0077b6]/60 mt-1">Tailored packages based on your age and gender</p>
        </div>

        <div className="flex flex-col gap-10">
          <CheckupSection
            title="For Men"
            subtitle="Age-specific wellness plans"
            items={menCheckups}
            findMoreBg="bg-[#e0f7fa]"
            findMoreBorder="border-[#90e0ef]"
            findMoreText="text-[#0077b6]"
            findMoreIcon="♂"
            onExplore={() => router.push('/packages')}
          />
          <CheckupSection
            title="For Women"
            subtitle="Age-specific wellness plans"
            items={womenCheckups}
            findMoreBg="bg-[#fce4ec]"
            findMoreBorder="border-[#f48fb1]"
            findMoreText="text-[#c2185b]"
            findMoreIcon="♀"
            onExplore={() => router.push('/packages')}
          />
        </div>
      </div>
    </section>
  );
}
