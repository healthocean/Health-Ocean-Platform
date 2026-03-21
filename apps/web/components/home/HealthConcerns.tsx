import Image from 'next/image';

export default function HealthConcerns() {
  const concerns = [
    { name: 'Full Body Checkups', image: '/assets/home/full_body.webp', color: 'bg-primary-50' },
    { name: 'Fever', image: '/assets/home/fever.webp', color: 'bg-primary-50' },
    { name: 'Thyroid', image: '/assets/home/thyroid.webp', color: 'bg-primary-50' },
    { name: 'Diabetes', image: '/assets/home/diabetes.webp', color: 'bg-primary-50' },
    { name: 'Heart Health', image: '/assets/home/heart_health.webp', color: 'bg-primary-50' },
    { name: 'Allergy Tests', image: '/assets/home/allergy.webp', color: 'bg-primary-50' },
    { name: 'Hair & Skin', image: '/assets/home/hair_skin.webp', color: 'bg-primary-50' },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Browse By Health Concern
          </h2>
          <p className="text-sm text-gray-600">
            Powered by <span className="text-primary-500 font-semibold">Health Ocean</span>
          </p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {concerns.map((concern, index) => (
            <button
              key={index}
              className="flex-shrink-0 flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition min-w-[120px]"
            >
              <div className={`w-24 h-24 ${concern.color} rounded-2xl flex items-center justify-center overflow-hidden`}>
                <Image src={concern.image} alt={concern.name} width={96} height={96} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {concern.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}