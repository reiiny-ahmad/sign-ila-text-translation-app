import { Heart, Users, Globe, Award } from "lucide-react";

const TEAM_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/994783/2026-02-28/83229a0d-f4f2-4073-9082-3062945583dd.png";
const COMM_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/994783/2026-02-28/a431d775-1133-457f-a20b-350baa9db609.png";
const ASL_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/994783/2026-02-28/538f70ec-5c2d-4018-bdbc-09f30ed76442.png";

const stats = [
  { icon: Users, value: "26", label: "Lettres ASL", color: "#E94560" },
  { icon: Globe, value: "100%", label: "Accessible", color: "#533483" },
  { icon: Heart, value: "IA", label: "Temps réel", color: "#E94560" },
  { icon: Award, value: "YFC", label: "Maroc", color: "#0F3460" },
];

const ASL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AboutSection() {
  return (
    <section id="about" className="relative py-20 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] text-xs font-semibold uppercase tracking-wider mb-4">
            À propos
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Notre{" "}
            <span className="bg-gradient-to-r from-[#E94560] to-[#533483] bg-clip-text text-transparent">
              Mission
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Youth for Challenge est une organisation marocaine dédiée à
            l'inclusion et à l'innovation technologique pour tous.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#16213E]/50 border border-white/5 rounded-2xl p-5 text-center hover:border-white/10 transition-all duration-300"
            >
              <stat.icon
                className="w-6 h-6 mx-auto mb-3"
                style={{ color: stat.color }}
              />
              <div className="text-2xl font-black text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* About YFC */}
          <div className="bg-[#16213E]/50 border border-white/5 rounded-3xl overflow-hidden">
            <img
              src={TEAM_IMG}
              alt="Youth for Challenge Team"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Youth for Challenge 🇲🇦
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Youth for Challenge est une organisation marocaine de jeunesse
                qui œuvre pour l'inclusion sociale à travers la technologie et
                l'innovation. Notre mission est de créer des ponts entre les
                communautés et de rendre la technologie accessible à tous.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ce projet de traduction du langage des signes ASL est l'une de
                nos initiatives phares, utilisant l'intelligence artificielle
                pour faciliter la communication avec les personnes sourdes et
                malentendantes.
              </p>
            </div>
          </div>

          {/* About the project */}
          <div className="bg-[#16213E]/50 border border-white/5 rounded-3xl overflow-hidden">
            <img
              src={COMM_IMG}
              alt="Sign Language Communication"
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Le Projet Sign Language
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Notre plateforme utilise un modèle d'intelligence artificielle
                entraîné sur l'alphabet ASL (American Sign Language) pour
                reconnaître 26 lettres en temps réel via la webcam.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Le modèle <code className="text-[#E94560] bg-[#E94560]/10 px-1.5 py-0.5 rounded text-xs">model_sign_language.p</code> a
                été entraîné avec des techniques de Machine Learning et utilise
                la détection des landmarks de la main pour classifier chaque
                geste en une lettre de l'alphabet.
              </p>
            </div>
          </div>
        </div>

        {/* ASL Alphabet */}
        <div className="bg-[#16213E]/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">
                Alphabet ASL
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Les 26 lettres de l'alphabet reconnues par notre modèle IA
              </p>
              <div className="grid grid-cols-9 sm:grid-cols-13 gap-2">
                {ASL_ALPHABET.map((letter) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm hover:bg-gradient-to-br hover:from-[#E94560]/20 hover:to-[#533483]/20 hover:border-[#E94560]/30 hover:scale-110 transition-all duration-200 cursor-default"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-64 flex-shrink-0">
              <img
                src={ASL_IMG}
                alt="ASL Alphabet Chart"
                className="w-full rounded-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}