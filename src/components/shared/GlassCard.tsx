"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        archive-panel rounded-[24px]
        ${hover ? "transition-transform duration-200 hover:-translate-y-0.5" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
