import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type SoulMomentCompositionProps = {
  title: string;
  subtitle?: string | null;
  templateKey: "trophy_pulse" | "roster_intro" | "match_countdown";
  accent: "cyan" | "gold" | "energy";
};

const accentMap: Record<SoulMomentCompositionProps["accent"], { primary: string; secondary: string }> = {
  cyan: { primary: "#23e8ff", secondary: "#0a7890" },
  gold: { primary: "#ffd166", secondary: "#88620e" },
  energy: { primary: "#ff4f7b", secondary: "#7a1732" },
};

export function SoulMomentComposition({
  title,
  subtitle,
  templateKey,
  accent,
}: SoulMomentCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = accentMap[accent];
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 95 } });
  const sweep = interpolate(frame % 90, [0, 90], [-35, 115]);
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.45, 1]);

  const label =
    templateKey === "match_countdown"
      ? "Match Countdown"
      : templateKey === "roster_intro"
        ? "Roster Intro"
        : "Trophy Pulse";

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 20% 15%, rgba(35,232,255,0.22), transparent 34%), linear-gradient(135deg, #02050b 0%, #07111b 52%, #010207 100%)",
        color: "#ffffff",
        fontFamily: "var(--font-display), Outfit, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 46,
          border: `1px solid ${colors.primary}55`,
          borderRadius: 46,
          boxShadow: `0 0 80px ${colors.secondary}88`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: `${sweep}%`,
          left: "-20%",
          width: "140%",
          height: 110,
          transform: "rotate(-12deg)",
          background: `linear-gradient(90deg, transparent, ${colors.primary}44, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 90,
          width: 280,
          height: 280,
          borderRadius: 999,
          border: `24px solid ${colors.primary}22`,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          bottom: 90,
          transform: `translateY(${(1 - enter) * 80}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            border: `1px solid ${colors.primary}66`,
            borderRadius: 999,
            padding: "12px 18px",
            color: colors.primary,
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 880,
            fontSize: 86,
            lineHeight: 0.86,
            letterSpacing: "-0.07em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 24,
              maxWidth: 760,
              color: "#b9c3d2",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
