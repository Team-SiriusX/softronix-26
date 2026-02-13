import Image from "next/image";
import LandingContent from "./_components/LandingContent";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden">
      {/* Background Image - Fixed to stay during scroll */}
      <div
        className="fixed inset-0 z-0 animate-fade-in"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Logo in Top Left */}
      <div className="fixed top-0.5 left-6 z-50">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={40}
          className="h-24 w-auto object-contain"
          priority
        />
      </div>

      {/* Floating Dock Header with Liquid Glass Effect */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="relative group">
          {/* Liquid glass container */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-full px-8 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-8 transition-all duration-500 ease-out hover:bg-white/50 hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] hover:scale-[1.02] border border-white/60">
            {/* Liquid glass inner layers */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-white/30 to-transparent opacity-50"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-gray-100/40 via-transparent to-white/40 opacity-60"></div>

            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            {/* Content */}
            <div className="relative flex items-center gap-8">
              <nav>
                <ul className="flex gap-6 text-sm text-gray-600 geist-mono-medium">
                  <li>
                    <a
                      href="/chat"
                      className="hover:text-gray-900 transition-colors duration-300 relative group/link"
                    >
                      <span className="relative">Chat Interface</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-900 group-hover/link:w-full transition-all duration-300"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Team-SiriusX"
                      target="_blank"
                      className="hover:text-gray-900 transition-colors duration-300 relative group/link"
                    >
                      <span className="relative">GitHub</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-900 group-hover/link:w-full transition-all duration-300"></span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center p-4 pt-20 text-white">
        <h1
          className="text-5xl md:text-7xl mb-6 tracking-tighter animate-fade-in-up drop-shadow-lg space-grotesk-bold"
          style={{ animationDelay: "100ms" }}
        >
          Welcome to the Future
        </h1>
        <p
          className="max-w-xl text-base md:text-lg animate-fade-in-up text-gray-200 leading-relaxed drop-shadow-md poppins-light"
          style={{ animationDelay: "200ms" }}
        >
          Experience the perfect blend of aesthetics and performance. Designed
          to sink perfectly into your workflow.
        </p>

        <div
          className="mt-8 flex gap-4 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <button className="px-6 py-2 bg-white text-black poppins-medium rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
            Get Started
          </button>
          <button className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white poppins-medium rounded-full hover:bg-white/20 transition-colors duration-200 cursor-pointer">
            Learn More
          </button>
        </div>
      </main>

      {/* Content below the fold */}
      <LandingContent />
    </div>
  );
}
