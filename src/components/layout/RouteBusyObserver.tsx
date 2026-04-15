"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearRouteBusy, finishRouteBusy } from "./routeBusyState";

const MONITORED_ROUTES = new Set(["/tournaments", "/roster", "/bgis-champions"]);

export default function RouteBusyObserver() {
  const pathname = usePathname();
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      clearRouteBusy();
      return;
    }

    const result = finishRouteBusy(pathname);
    if (
      process.env.NODE_ENV !== "production" &&
      result &&
      (MONITORED_ROUTES.has(result.href) || MONITORED_ROUTES.has(pathname))
    ) {
      console.info(
        `[route-perf] ${result.href} -> ${pathname} settled in ${Math.round(result.duration)}ms`
      );
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearRouteBusy();
    };
  }, []);

  return null;
}
