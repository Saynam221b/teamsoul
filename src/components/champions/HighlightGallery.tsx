"use client";

import Image from "next/image";
import { useState } from "react";

interface HighlightFrame {
  id: string;
  url: string;
  alt: string;
}

function normalizeAspectRatio(width: number, height: number) {
  if (!width || !height) return "4 / 3";

  const ratio = width / height;

  if (ratio < 0.78) return "3 / 4";
  if (ratio > 1.9) return "16 / 9";

  return `${width} / ${height}`;
}

export default function HighlightGallery({ highlights }: { highlights: HighlightFrame[] }) {
  const [ratios, setRatios] = useState<Record<string, string>>({});

  return (
    <div className="champions-highlight-grid">
      {highlights.map((highlight) => (
        <figure
          key={highlight.id}
          className="public-card route-card-chromatic champions-highlight-frame relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.02]"
          style={{ aspectRatio: ratios[highlight.id] ?? "4 / 3" }}
        >
          <Image
            src={highlight.url}
            alt={highlight.alt}
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onLoadingComplete={(img) => {
              setRatios((prev) => {
                if (prev[highlight.id]) return prev;
                return {
                  ...prev,
                  [highlight.id]: normalizeAspectRatio(img.naturalWidth, img.naturalHeight),
                };
              });
            }}
          />
        </figure>
      ))}
    </div>
  );
}
