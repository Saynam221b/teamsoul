import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TournamentDash from "@/components/tournaments/TournamentDash";

export const metadata: Metadata = {
  title: "Tournament History — Team SouL Archive",
  description:
    "Complete tournament history of Team SouL. 80+ verified tournaments from 2019 to 2026 with placements, prizes, and roster data.",
};

export default function TournamentsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
              Tournament History
            </h1>
            <p className="mt-3 text-text-secondary text-sm max-w-lg">
              Every verified tournament placement, prize pool, and roster from 2018 to
              April 2026. Filter by tier, year, or browse championships only.
            </p>
          </div>

          <TournamentDash />
        </div>
      </main>
      <Footer />
    </>
  );
}
