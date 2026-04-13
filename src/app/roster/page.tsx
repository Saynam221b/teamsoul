import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlayerGrid from "@/components/roster/PlayerGrid";

export const metadata: Metadata = {
  title: "The Roster — Team SouL Archive",
  description:
    "Complete player history of Team SouL. 30+ players spanning 4 eras, with join/leave dates, roles, awards, and impact analysis.",
};

export default function RosterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
              The Roster
            </h1>
            <p className="mt-3 text-text-secondary text-sm max-w-lg">
              Every verified player who has worn the SouL tag. From the founding
              five in December 2018 to the current championship roster.
            </p>
          </div>

          <PlayerGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
