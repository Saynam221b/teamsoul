"use client";

import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { armRouteBusy } from "./routeBusyState";

type RouteLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  busyIndicator?: boolean;
  pendingIndicator?: "off" | "dot";
  pendingDelayMs?: number;
};

function normalizeHref(href: string) {
  return href.split("#")[0]?.split("?")[0] ?? href;
}

function LinkPendingHint({
  mode,
  delayMs,
}: {
  mode: RouteLinkProps["pendingIndicator"];
  delayMs: number;
}) {
  const { pending } = useLinkStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending || mode === "off") {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, mode, pending]);

  if (mode === "off") return null;

  return <span aria-hidden className={`nav-pending-dot ${visible ? "nav-pending-dot-active" : ""}`} />;
}

export default function RouteLink({
  href,
  busyIndicator = true,
  pendingIndicator = "dot",
  pendingDelayMs = 100,
  prefetch = true,
  children,
  onNavigate,
  ...props
}: RouteLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onNavigate={(event) => {
        onNavigate?.(event);

        if (!busyIndicator) return;

        const normalizedHref = normalizeHref(href);
        if (normalizedHref === pathname) return;

        armRouteBusy(normalizedHref);
      }}
      {...props}
    >
      {children}
      <LinkPendingHint mode={pendingIndicator} delayMs={pendingDelayMs} />
    </Link>
  );
}
