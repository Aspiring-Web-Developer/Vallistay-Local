export const DATE_PRESETS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Last 24 hours" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

const DAY = 86400000;

export const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseLocal = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmt = (s) =>
  parseLocal(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function getDateBounds(range, from, to) {
  const now = new Date();
  const t = now.getTime();
  switch (range) {
    case "today":
      return { start: t - DAY, end: Infinity };
    case "last_7_days":
      return { start: t - 7 * DAY, end: Infinity };
    case "last_30_days":
      return { start: t - 30 * DAY, end: Infinity };
    case "this_month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), end: Infinity };
    case "last_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime(),
      };
    case "custom": {
      const start = from ? parseLocal(from).getTime() : -Infinity;
      const end = to ? new Date(parseLocal(to).setHours(23, 59, 59, 999)).getTime() : Infinity;
      return { start, end };
    }
    default:
      return { start: -Infinity, end: Infinity };
  }
}

export function getDateLabel(range, from, to) {
  if (range === "custom") {
    if (from && to) return from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`;
    if (from) return `From ${fmt(from)}`;
    if (to) return `Until ${fmt(to)}`;
    return "Custom range";
  }
  return DATE_PRESETS.find((o) => o.value === range)?.label || "All time";
}