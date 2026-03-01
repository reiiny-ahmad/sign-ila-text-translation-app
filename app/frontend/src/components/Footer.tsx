import { Hand, Github, Twitter, Instagram, Mail, MapPin } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Mail, href: "#", label: "Email" },
];

const quickLinks = [
  { label: "Accueil", href: "#hero" },
  { label: "Traducteur", href: "#translator" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "À propos", href: "#about" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E94560]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E94560] to-[#533483] flex items-center justify-center">
                <Hand className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">
                Sign<span className="text-[#E94560]">Language</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xs">
              Plateforme de traduction du langage des signes ASL en temps réel,
              propulsée par l'intelligence artificielle.
            </p>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>Maroc — Youth for Challenge</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-gray-500 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Suivez-nous
            </h4>
            <div className="flex gap-2 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#E94560]/10 to-[#533483]/10 border border-[#E94560]/20">
              <p className="text-xs text-gray-400">
                <span className="text-[#E94560] font-semibold">
                  Youth for Challenge
                </span>{" "}
                — Organisation marocaine pour l'inclusion et l'innovation
                technologique 🇲🇦
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Sign Language — Youth for Challenge.
            Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Fait avec ❤️ au Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}