
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
      
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide">Contact Us</h1>
          <p className="text-gray-300 mt-2">We’re here to help you anytime</p>
        </div>

        {/* CEO Section */}
        <div className="bg-white/10 p-5 rounded-xl border border-white/10 mb-6">
          <h2 className="text-sm text-blue-300 font-semibold">CEO</h2>
          <h3 className="text-xl font-bold mt-1">Malik Afzal</h3>
          <p className="text-gray-300 mt-1">
            Building the future of learning
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">

          <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl">
            <span className="text-gray-300">Email</span>
            <a href="mailto:malikafzalrehmanofficial@gmail.com" className="text-blue-400 font-semibold">
              malikafzalrehmanofficial@gmail.com
            </a>
          </div>

          <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl">
            <span className="text-gray-300">Phone</span>
            <a href="tel:03315065007" className="text-green-400 font-semibold">
              03315065007
            </a>
          </div>

          <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl">
            <span className="text-gray-300">WhatsApp</span>
            <a
              href="https://wa.me/923315065007"
              target="_blank"
              className="text-emerald-400 font-semibold"
            >
              +92 331 5065007
            </a>
          </div>

        </div>

        {/* Support Hours */}
        <div className="mt-6 bg-white/10 p-4 rounded-xl text-center">
          <p className="text-gray-300 text-sm">Support Hours</p>
          <p className="font-semibold mt-1">
            Mon – Fri | 9:00 AM – 6:00 PM (PKT)
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          We usually respond within a few hours.
        </p>

      </div>
    </div>
  );
}