import { ArrowDown, Sparkles } from "lucide-react";

const HERO_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/994783/2026-02-28/cd98303a-71f1-4f04-bbf6-aeb410cdc333.png";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt="Sign Language Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F1A]/90 via-[#0F0F1A]/70 to-[#0F0F1A]" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E94560]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#533483]/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#E94560]" />
          <span className="text-sm font-medium text-gray-300">
            Propulsé par l'IA — Youth for Challenge 🇲🇦
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6 animate-slide-up">
          Sign
          <span className="bg-gradient-to-r from-[#E94560] to-[#533483] bg-clip-text text-transparent">
            {" "}Language
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 animate-slide-up-delay font-light">
          Traduisez le langage des signes ASL en temps réel grâce à
          l'intelligence artificielle
        </p>

        <p className="text-sm text-gray-500 mb-10 animate-slide-up-delay-2">
          Une initiative de{" "}
          <span className="text-[#E94560] font-semibold">
            Youth for Challenge
          </span>{" "}
          — Organisation marocaine pour l'inclusion
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
          <button
            onClick={() => scrollTo("#translator")}
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E94560] to-[#533483] text-white font-bold text-lg shadow-lg shadow-[#E94560]/25 hover:shadow-[#E94560]/40 hover:scale-105 transition-all duration-300"
          >
            <span className="relative z-10">Essayer Maintenant</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#533483] to-[#E94560] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => scrollTo("#how-it-works")}
            className="px-8 py-4 rounded-2xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 hover:border-white/20 transition-all duration-300"
          >
            Comment ça marche ?
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo("#translator")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce"
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </section>
  );
}