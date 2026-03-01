import { Camera, Hand, Clock, Type } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Activez la caméra",
    description:
      "Autorisez l'accès à votre webcam pour que l'IA puisse capturer vos gestes en temps réel.",
    color: "#E94560",
  },
  {
    icon: Hand,
    step: "02",
    title: "Faites un signe",
    description:
      "Placez votre main devant la caméra et formez une lettre de l'alphabet ASL.",
    color: "#533483",
  },
  {
    icon: Clock,
    step: "03",
    title: "Attendez la confirmation",
    description:
      "Maintenez le signe pendant le temps choisi (2-5 secondes) pour confirmer la lettre.",
    color: "#0F3460",
  },
  {
    icon: Type,
    step: "04",
    title: "Lisez la traduction",
    description:
      "La lettre confirmée s'affiche dans la zone de traduction. Continuez pour former des mots !",
    color: "#E94560",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 md:py-32 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#533483]/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#533483]/10 border border-[#533483]/20 text-[#533483] text-xs font-semibold uppercase tracking-wider mb-4">
            Guide
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Comment ça{" "}
            <span className="bg-gradient-to-r from-[#E94560] to-[#533483] bg-clip-text text-transparent">
              marche ?
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Quatre étapes simples pour traduire le langage des signes en texte
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={index} className="group relative">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[1px] bg-gradient-to-r from-white/10 to-white/5" />
              )}

              <div className="relative bg-[#16213E]/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-[#16213E]/80 transition-all duration-500 group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-3 -right-2 text-5xl font-black text-white/[0.03] select-none">
                  {item.step}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <item.icon
                    className="w-6 h-6"
                    style={{ color: item.color }}
                  />
                </div>

                {/* Step label */}
                <span
                  className="text-xs font-bold uppercase tracking-wider mb-2 block"
                  style={{ color: item.color }}
                >
                  Étape {item.step}
                </span>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}