import { useState, useEffect } from "react";
import { Menu, X, Hand } from "lucide-react";

const navLinks = [
  { label: "Accueil", href: "#hero" },
  { label: "Traducteur", href: "#translator" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "À propos", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0F0F1A]/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleClick("#hero")}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E94560] to-[#533483] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Hand className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight hidden sm:block">
              Sign<span className="text-[#E94560]">Language</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleClick(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#E94560] to-[#533483] group-hover:w-3/4 transition-all duration-300 rounded-full" />
              </button>
            ))}
          </div>

          {/* YFC Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E94560]/20 to-[#533483]/20 border border-[#E94560]/30 text-xs font-semibold text-[#E94560] tracking-wider uppercase">
              Youth for Challenge
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0F0F1A]/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 px-4">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#E94560]/20 to-[#533483]/20 border border-[#E94560]/30 text-xs font-semibold text-[#E94560] tracking-wider uppercase text-center">
              Youth for Challenge
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}