

// import React from "react";
// import { formatValue, pretty } from "./utils/formatValue";

// const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
// const fmt = formatValue;
// const emptyBox = (
//   <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, fontSize: "12px", color: "#64748b" }}>
//     No field changes recorded for this operation.
//   </div>
// );

// export default function BeforeAfterTable({ action, changedFields, oldValue, newValue }) {
//   // CREATE: just show the values
//   if (action === "create") {
//     let rows = (changedFields || [])
//       .filter((f) => !isEmpty(f.new_value))
//       .map((f) => ({ name: f.field_name, value: fmt(f.new_value) }));

//     if (rows.length === 0 && newValue && typeof newValue === "object") {
//       rows = Object.entries(newValue)
//         .filter(([k, v]) => !isEmpty(v) && !/password|token|secret/i.test(k))
//         .map(([k, v]) => ({ name: k, value: fmt(v) }));
//     }

//     if (rows.length === 0) return emptyBox;

//     return (
//       <div style={{ overflowX: "auto" }}>
//         <table className="al-diff-table">
//           <thead>
//             <tr>
//               <th className="al-diff-th">Field</th>
//               <th className="al-diff-th">Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, i) => (
//               <tr key={i}>
//                 <td className="al-diff-td" data-label="Field" style={{ fontWeight: 600, color: "#334155" }}>{r.name}</td>
//                 <td className="al-diff-td" data-label="Value">{r.value}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }

//   // UPDATE / DELETE: before → after
//   if (changedFields && changedFields.length > 0) {
//     return (
//       <div style={{ overflowX: "auto" }}>
//         <table className="al-diff-table">
//           <thead>
//             <tr>
//               <th className="al-diff-th">Field</th>
//               <th className="al-diff-th">Previous Value</th>
//               <th className="al-diff-th">New Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {changedFields.map((field, idx) => (
//               <tr key={idx}>
//                 <td className="al-diff-td" data-label="Field" style={{ fontWeight: 600, color: "#334155" }}>{field.field_name}</td>
//                 <td className="al-diff-td al-diff-old" data-label="Previous">{fmt(field.old_value ?? "—")}</td>
//                 <td className="al-diff-td al-diff-new" data-label="New">{fmt(field.new_value ?? "—")}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }

//   return emptyBox;
// }











import React from "react";
import { formatValue } from "./utils/formatValue";
import { formatLabel } from "./utils/formatLabel";

const fmt = formatValue;

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// true for null, undefined, "", "—", and the string "null"/"none"/"undefined"
const isNil = (v) => {
  if (v === undefined || v === null) return true;
  if (isPlainObject(v)) return Object.keys(v).length === 0 || Object.values(v).every(isNil);
  if (Array.isArray(v)) return v.length === 0;
  const s = String(v).trim().toLowerCase();
  return s === "" || s === "—" || s === "null" || s === "none" || s === "undefined";
};

const isEmpty = isNil;

// accepts a real object or a JSON string like '{"view":true}'
const toObject = (v) => {
  if (isPlainObject(v)) return v;
  if (typeof v === "string" && v.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(v);
      if (isPlainObject(parsed)) return parsed;
    } catch {}
  }
  return null;
};

const toBool = (v) => {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return null;
};

// 1793600913174 (ms) or 1793600913 (sec) -> "02 Nov 2026, 11:58 am"
const formatTimestamp = (v) => {
  const n = Number(v);
  const d = new Date(n < 1e12 ? n * 1000 : n);
  if (isNaN(d.getTime())) return null;
  return d
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toLowerCase());
};

const mutedLabel = (text) => (
  <span
    style={{
      display: "inline-block", // stops the strike-through from the old-value cell
      textDecoration: "none",
      fontStyle: "italic",
      fontWeight: 500,
      color: "#94a3b8",
      fontFamily: "inherit",
    }}
  >
    {text}
  </span>
);

// Permission-style objects -> chips: "Create · Yes"
const renderObject = (obj) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {Object.entries(obj).map(([k, v]) => {
      const b = toBool(v);
      const text = b === null ? (isNil(v) ? "—" : String(v)) : b ? "Yes" : "No";
      const bg = b === true ? "#dcfce7" : b === false ? "#f1f5f9" : "#f8fafc";
      const color = b === true ? "#15803d" : b === false ? "#64748b" : "#475569";
      return (
        <span
          key={k}
          style={{
            display: "inline-block",
            textDecoration: "none",
            padding: "2px 9px",
            borderRadius: 9999,
            background: bg,
            color,
            fontFamily: "inherit",
            fontSize: 11.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {formatLabel(k)} · {text}
        </span>
      );
    })}
  </div>
);

// Render a value cell. side: "old" | "new"
const renderVal = (value, fieldName, side) => {
  if (isNil(value)) return mutedLabel(side === "old" ? "Not set" : "Cleared");

  const obj = toObject(value);
  if (obj) return renderObject(obj);

  const b = toBool(value);
  if (b !== null && typeof value !== "number") return b ? "Yes" : "No";

  if (/(_at|_date|_time)$/i.test(String(fieldName || "")) && /^\d{10,13}$/.test(String(value).trim())) {
    const nice = formatTimestamp(value);
    if (nice) return nice;
  }

  return fmt(value);
};

const emptyBox = (
  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, fontSize: "12px", color: "#64748b" }}>
    No field changes recorded for this operation.
  </div>
);

export default function BeforeAfterTable({ action, changedFields, oldValue, newValue }) {
  // CREATE: just show the values
  if (action === "create") {
    let rows = (changedFields || [])
      .filter((f) => !isEmpty(f.new_value))
      .map((f) => ({ key: f.field_name, name: formatLabel(f.field_name), value: f.new_value }));

    if (rows.length === 0 && newValue && typeof newValue === "object") {
      rows = Object.entries(newValue)
        .filter(([k, v]) => !isEmpty(v) && !/password|token|secret/i.test(k))
        .map(([k, v]) => ({ key: k, name: formatLabel(k), value: v }));
    }

    if (rows.length === 0) return emptyBox;

    return (
      <div style={{ overflowX: "auto" }}>
        <table className="al-diff-table">
          <thead>
            <tr>
              <th className="al-diff-th">Field</th>
              <th className="al-diff-th">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="al-diff-td" data-label="Field" style={{ fontWeight: 600, color: "#334155" }}>{r.name}</td>
                <td className="al-diff-td" data-label="Value">{renderVal(r.value, r.key, "new")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // UPDATE / DELETE: before → after
  if (changedFields && changedFields.length > 0) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table className="al-diff-table">
          <thead>
            <tr>
              <th className="al-diff-th">Field</th>
              <th className="al-diff-th">Previous Value</th>
              <th className="al-diff-th">New Value</th>
            </tr>
          </thead>
          <tbody>
            {changedFields.map((field, idx) => (
              <tr key={idx}>
                <td className="al-diff-td" data-label="Field" style={{ fontWeight: 600, color: "#334155" }}>
                  {formatLabel(field.field_name)}
                </td>
                <td className="al-diff-td al-diff-old" data-label="Previous">
                  {renderVal(field.old_value, field.field_name, "old")}
                </td>
                <td className="al-diff-td al-diff-new" data-label="New">
                  {renderVal(field.new_value, field.field_name, "new")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return emptyBox;
}