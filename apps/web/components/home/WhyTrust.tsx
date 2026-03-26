export default function WhyTrust() {
  const stats = [
    { number: '100% NABL', subtitle: 'Certified Labs', icon: '🏆' },
    { number: '80 LAKHS+', subtitle: 'Happy Users', icon: '😊' },
    { number: '27 YEARS+', subtitle: 'Lab Expertise', icon: '📅' },
  ];

  const features = [
    { number: '700+', text: '100% NABL & ISO Certified Labs', icon: '🏥' },
    { number: '70,000+', text: 'Test processed everyday', icon: '🧪' },
    { number: '70 Million', text: 'Total customer served', icon: '👥' },
    { number: '700', text: 'Collection Center', icon: '📍' },
    { number: '7000', text: 'Quality & trained Phlebotomist', icon: '💉' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why trust Health Ocean?
          </h2>
          <p className="text-lg text-primary-500 font-semibold">
            # ONE OF INDIA'S MOST TRUSTED HEALTHCARE PLATFORM
          </p>
        </div>

        {/* Top Stats */}
        <div className="flex justify-center gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <div className="text-2xl font-bold text-primary-500 mb-2">{feature.number}</div>
              <div className="text-xs text-gray-600 leading-tight">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100 px-6 py-3 rounded-full">
            <span className="text-2xl">💚</span>
            <p className="text-sm text-teal-800 font-medium">
              Making lab test bookings affordable, high-quality, and easily accessible across India
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}