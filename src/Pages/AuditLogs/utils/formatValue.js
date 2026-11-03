export const pretty = (s = "") =>
  String(s).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function formatValue(v) {
  if (v === undefined || v === null || v === "" || v === "—") return "—";
  let val = v;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "true") return "Yes";
    if (t === "false") return "No";
    if (t.startsWith("{") || t.startsWith("[")) {
      try { val = JSON.parse(t); } catch { /* keep string */ }
    }
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.map(formatValue).join(", ");
  if (val && typeof val === "object") {
    return Object.entries(val).map(([k, x]) => `${pretty(k)}: ${formatValue(x)}`).join("\n");
  }
  return String(val);
}