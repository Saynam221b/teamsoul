import type { Player, Tournament } from "@/data/types";
import TrophyCard from "./TrophyCard";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

const TROPHY_ROOM_IDS = [
  "pmis-2019",
  "pmco-spring-india-2019",
  "bmps-s1-2022",
  "bgms-s3-2024",
  "bgis-2026",
] as const;

interface TrophyRoomProps {
  tournaments: Tournament[];
  players: Player[];
}

function selectTrophyRoomTournaments(tournaments: Tournament[]) {
  const byId = new Map(tournaments.map((tournament) => [tournament.id, tournament]));
  const curated = TROPHY_ROOM_IDS.map((id) => byId.get(id)).filter(
    (tournament): tournament is Tournament => Boolean(tournament)
  );

  if (curated.length >= TROPHY_ROOM_IDS.length) {
    return curated;
  }

  const usedIds = new Set(curated.map((tournament) => tournament.id));
  const fallbackWins = tournaments.filter(
    (tournament) =>
      !usedIds.has(tournament.id) &&
      tournament.isWin &&
      (tournament.tier === "S-Tier" || tournament.tier === "A-Tier")
  );

  return [...curated, ...fallbackWins].slice(0, TROPHY_ROOM_IDS.length);
}

export default function TrophyRoom({ tournaments, players }: TrophyRoomProps) {
  const majorWins = selectTrophyRoomTournaments(tournaments);
  const playerLookup = Object.fromEntries(
    players.map((player) => [player.id, { displayName: player.displayName, role: player.role }])
  );

  return (
    <section id="trophy-room" className="archive-section trophy-room-section">
      <div className="page-wrap">
        <RevealOnScroll className="section-head max-w-3xl">
          <p className="section-kicker">Championship Wall</p>
          <h2 className="section-title">The Wins That Built The Standard</h2>
          <p className="section-copy">
            Five title runs sit at the center of the archive. This pass puts the squad, the support lane,
            and the competitive context back on the wall instead of reducing each win to a bare stat tile.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08} distance={20} intensity="soft">
          <div className="major-wins-stage">
            {majorWins.map((tournament, index) => (
              <TrophyCard
                key={tournament.id}
                tournament={tournament}
                index={index}
                featured={index < 2}
                playerLookup={playerLookup}
              />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
