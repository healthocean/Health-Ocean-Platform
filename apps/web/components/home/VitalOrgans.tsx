import Image from 'next/image';

export default function VitalOrgans() {
  const organs = [
    { name: 'Heart', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_heart.webp' },
    { name: 'Thyroid', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_thyroid.webp' },
    { name: 'Joint pain', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_joint.webp' },
    { name: 'Liver', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_liver.webp' },
    { name: 'Lungs', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_lungs.webp' },
    { name: 'Kidney', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_kidneys.webp' },
    { name: 'Bone', color: 'from-primary-200 to-primary-300', image: '/assets/home/vital_bone.webp' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Checkups based on Vital Organs
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {organs.map((organ, index) => (
            <button
              key={index}
              className={`relative p-4 rounded-2xl bg-gradient-to-br ${organ.color} hover:scale-105 transition-transform group overflow-hidden`}
            >
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="mb-2 w-full aspect-square relative rounded-xl overflow-hidden">
                  <Image src={organ.image} alt={organ.name} fill className="object-cover" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 text-center">{organ.name}</h3>
              </div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors"></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}