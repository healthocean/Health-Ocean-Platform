import Image from 'next/image';

export default function RecommendedCheckups() {
  const menCheckups = [
    { age: 'Under 25 years', color: 'bg-primary-50', image: '/assets/home/young_man.webp' },
    { age: '25 - 50 years', color: 'bg-primary-100', image: '/assets/home/middle_age_man.webp' },
    { age: 'Above 50 years', color: 'bg-primary-200', image: '/assets/home/old_man.webp' },
  ];

  const womenCheckups = [
    { age: 'Under 25 years', color: 'bg-primary-50', image: '/assets/home/young_woman.webp' },
    { age: '25 - 50 years', color: 'bg-primary-100', image: '/assets/home/middle_age_woman.webp' },
    { age: 'Above 50 years', color: 'bg-primary-200', image: '/assets/home/old_woman.webp' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Men's Checkups */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Recommended Checkups for Men
            </h2>
            <p className="text-sm text-gray-600">Curated by Doctors for you</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menCheckups.map((checkup, index) => (
              <button
                key={index}
                className={`${checkup.color} rounded-2xl p-6 hover:shadow-lg transition text-center flex flex-col items-center justify-center`}
              >
                <div className="w-20 h-20 relative mb-4">
                  <Image src={checkup.image} alt={checkup.age} fill className="object-contain" />
                </div>
                <div className="flex items-center justify-center gap-2 text-primary-700 text-sm font-semibold">
                  <span>{checkup.age}</span>
                </div>
              </button>
            ))}
            <button className="bg-primary-50 rounded-2xl p-6 hover:shadow-lg transition flex flex-col items-center justify-center">
              <div className="text-4xl mb-2 text-primary-600">♂</div>
              <div className="text-sm font-semibold text-primary-600">Find more</div>
              <div className="text-xs text-gray-600">Men Care</div>
              <div className="text-xs text-gray-600">Packages</div>
            </button>
          </div>
        </div>

        {/* Women's Checkups */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Recommended Checkups for Women
            </h2>
            <p className="text-sm text-gray-600">Curated by Doctors for you</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {womenCheckups.map((checkup, index) => (
              <button
                key={index}
                className={`${checkup.color} rounded-2xl p-6 hover:shadow-lg transition text-center flex flex-col items-center justify-center`}
              >
                <div className="w-20 h-20 relative mb-4">
                  <Image src={checkup.image} alt={checkup.age} fill className="object-contain" />
                </div>
                <div className="flex items-center justify-center gap-2 text-primary-700 text-sm font-semibold">
                  <span>{checkup.age}</span>
                </div>
              </button>
            ))}
            <button className="bg-primary-50 rounded-2xl p-6 hover:shadow-lg transition flex flex-col items-center justify-center">
              <div className="text-4xl mb-2 text-primary-600">♀</div>
              <div className="text-sm font-semibold text-primary-600">Find more</div>
              <div className="text-xs text-gray-600">Women Care</div>
              <div className="text-xs text-gray-600">Packages</div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}