// ============================================================================
// Formatting helpers used across public and admin surfaces.
// ============================================================================

export function formatPrize(amount: number | null): string {
  if (amount === null || amount === 0) return "—";
  return `~$${amount.toLocaleString("en-US")}`;
}

export function formatPlacement(placement: number | string): string {
  if (typeof placement === "string") return placement;
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = suffixes[placement] || "th";
  return `${placement}${suffix}`;
}

function isDateOnlyString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

export function getYearFromDateString(dateStr: string): number {
  if (isDateOnlyString(dateStr)) {
    return parseDateOnly(dateStr).year;
  }

  return new Date(dateStr).getUTCFullYear();
}

export function formatDate(dateStr: string): string {
  if (isDateOnlyString(dateStr)) {
    const { year, month, day } = parseDateOnly(dateStr);
    return `${getMonthName(month)} ${day}, ${year}`;
  }

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getMonthName(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[month - 1] || "";
}
