import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import dynamic from "next/dynamic";

const EraTimeline = dynamic(() => import("@/components/timeline/EraTimeline"), { ssr: true });
const TrophyRoom = dynamic(() => import("@/components/trophy/TrophyRoom"), { ssr: true });

export default function HomePage() {
  return (
    <div className="archive-shell">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />

        <TrophyRoom />
        <EraTimeline />
      </main>
      <Footer />
    </div>
  );
}
