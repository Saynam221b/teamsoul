import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import EraTimeline from "@/components/timeline/EraTimeline";
import TrophyRoom from "@/components/trophy/TrophyRoom";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <EraTimeline />
        <TrophyRoom />
      </main>
      <Footer />
    </>
  );
}
