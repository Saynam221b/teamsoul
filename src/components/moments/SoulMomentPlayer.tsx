"use client";

import { Player } from "@remotion/player";
import type { MediaMoment } from "@/data/types";
import { SoulMomentComposition } from "@/components/moments/SoulMomentComposition";

export default function SoulMomentPlayer({ moment }: { moment: MediaMoment }) {
  const durationInFrames = Math.max(180, Math.min(1800, moment.durationSeconds * 30));

  return (
    <div className="soul-moment-player overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
      <Player
        component={SoulMomentComposition}
        inputProps={{
          title: moment.title,
          subtitle: moment.description,
          templateKey: moment.templateKey,
          accent: moment.accent,
        }}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        style={{ width: "100%" }}
        controls
        loop
        showVolumeControls={false}
      />
    </div>
  );
}
