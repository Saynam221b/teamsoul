import type { Player, Tournament } from "@/data/types";
import {
  formatPlacement,
  formatPrize,
  getMonthName,
} from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

interface TrophyCardProps {
  tournament: Tournament;
  index: number;
  featured?: boolean;
  playerLookup: Record<string, Pick<Player, "displayName" | "role">>;
}

const TROPHY_CONTEXT: Record<
  string,
  { label: string; note: string; tone: "accent" | "gold" | "energy" }
> = {
  "pmis-2019": {
    label: "Domestic breakthrough",
    note: "The original four converted raw mechanics into SouL's first statement title and set the base standard for everything that followed.",
    tone: "gold",
  },
  "pmco-spring-india-2019": {
    label: "Back-to-back proof",
    note: "The same OG core followed PMIS with another clean domestic finish, turning early hype into a repeatable title identity.",
    tone: "accent",
  },
  "bmps-s1-2022": {
    label: "Superteam payoff",
    note: "Omega, AkshaT, Hector, and Goblin reset the ceiling in the first full superteam chapter and gave SouL a modern championship template.",
    tone: "accent",
  },
  "bgms-s3-2024": {
    label: "Rebuild lands immediately",
    note: "Manya and NakuL's ex-Blind core hit on arrival, while Ayogi stayed inside the modern setup that carried forward into the next title phase.",
    tone: "gold",
  },
  "bgis-2026": {
    label: "Modern crown",
    note: "The NakuL-led five closed the rebuild under Ayogi's coaching guidance and turned the modern chapter into SouL's biggest championship moment.",
    tone: "energy",
  },
};

const TONE_CLASS: Record<string, string> = {
  accent: "border-accent/25 bg-accent/10 text-accent",
  gold: "border-gold/25 bg-gold/10 text-gold",
  energy: "border-energy/25 bg-energy/10 text-energy",
};

function getRoleLabel(role: string) {
  const normalized = role.toLowerCase();

  if (normalized.includes("captain") || normalized.includes("igl")) return "IGL";
  if (normalized.includes("fragger")) return "Fragger";
  if (normalized.includes("support")) return "Support";
  if (normalized.includes("assaulter")) return "Assaulter";
  if (normalized.includes("coach")) return "Coach";
  if (normalized.includes("leader")) return "Leader";

  return "Player";
}

export default function TrophyCard({
  tournament,
  index,
  featured = false,
  playerLookup,
}: TrophyCardProps) {
  const context = TROPHY_CONTEXT[tournament.id] ?? {
    label: "Title run",
    note: "One of the key wins that kept Team SouL in the championship conversation.",
    tone: "accent" as const,
  };
  const roster = (tournament.roster ?? [])
    .map((playerId) => {
      const player = playerLookup[playerId];
      return player ? { id: playerId, ...player } : null;
    })
    .filter((player): player is { id: string; displayName: string; role: string } => Boolean(player));
  const staffLabels = [
    tournament.coach ? `Coach · ${tournament.coach}` : null,
    tournament.analyst ? `Analyst · ${tournament.analyst}` : null,
  ].filter((label): label is string => Boolean(label));
  const eventStamp = tournament.month ? `${getMonthName(tournament.month)} ${tournament.year}` : `${tournament.year}`;

  return (
    <RevealOnScroll
      as="article"
      delay={Math.min(index * 0.05, 0.22)}
      distance={24}
      margin="-40px"
      intensity="soft"
      className={`${featured ? "major-win-featured" : ""} public-card trophy-card major-win-card major-win-${context.tone} rounded-[28px] p-5 md:p-6`}
    >
      <div className="trophy-card-meta flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${TONE_CLASS[context.tone]}`}>
            {context.label}
          </span>
          <span className="rounded-full border border-border-subtle bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            {tournament.tier}
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{eventStamp}</span>
      </div>

      <div className="public-card-accent public-card-accent-highlight trophy-card-context mt-6 rounded-[20px] border border-white/8 bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Competition context</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {context.note}
        </p>
      </div>

      <div className="trophy-card-title mt-8 flex min-h-[7.5rem] flex-1 flex-col justify-start md:min-h-[8.5rem]">
        <h3 className="font-display text-3xl uppercase leading-[0.88] tracking-[-0.05em] text-white md:text-4xl">
          {tournament.name}
        </h3>
      </div>

      <div className="trophy-card-stats mt-6 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Placement</p>
          <p className="mt-2 font-display text-4xl uppercase leading-none text-white md:text-5xl">
            {typeof tournament.placement === "number"
              ? formatPlacement(tournament.placement)
              : tournament.placement}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Approx prize</p>
          <p className="mt-2 font-sans text-xl font-semibold uppercase leading-none tracking-[0.03em] text-text-primary md:text-2xl">
            {formatPrize(tournament.prize)}
          </p>
        </div>
      </div>

      {roster.length > 0 ? (
        <div className="trophy-card-roster mt-6 border-t border-border-subtle pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Winning squad</p>
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {roster.length} players
            </span>
          </div>
          <div className="trophy-card-roster-grid mt-4 flex flex-wrap gap-2.5">
            {roster.map((player) => (
              <div
                key={player.id}
                className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2"
              >
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white">
                  {player.displayName}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-muted">
                  {getRoleLabel(player.role)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {staffLabels.length > 0 ? (
        <div className="trophy-card-staff mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Coaching lane</span>
          {staffLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-accent/18 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-accent"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </RevealOnScroll>
  );
}
