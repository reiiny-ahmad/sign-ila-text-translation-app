import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import HowItWorks from "@/components/HowItWorks";
import TranslatorSection from "@/components/TranslatorSection";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] font-sans">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HowItWorks />
      <TranslatorSection />
      <Footer />
    </div>
  );
}
