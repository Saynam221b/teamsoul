declare global {
  interface Window {
    __teamSoulRouteNav?: {
      href: string;
      startedAt: number;
    };
  }
}

export function armRouteBusy(href: string) {
  if (typeof window === "undefined") return;

  window.__teamSoulRouteNav = {
    href,
    startedAt: window.performance.now(),
  };
}

export function clearRouteBusy() {
  if (typeof window === "undefined") return;
  delete window.__teamSoulRouteNav;
}

export function finishRouteBusy(pathname: string) {
  if (typeof window === "undefined") return null;

  const current = window.__teamSoulRouteNav;
  clearRouteBusy();

  if (!current) return null;

  return {
    href: current.href,
    pathname,
    duration: window.performance.now() - current.startedAt,
  };
}
