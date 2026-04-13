"use client";

import { TIER_COLORS } from "@/data/types";

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const colors = TIER_COLORS[tier] || TIER_COLORS["C-Tier"];
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium uppercase tracking-wider rounded-md
        ${colors.bg} ${colors.text}
        ${sizeClasses[size]}
      `}
    >
      {tier}
    </span>
  );
}
