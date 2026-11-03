import React, { useState } from "react";

// 2-digit state code + 5 letters + 4 digits + letter + (1-9/A-Z) + Z + checksum
export const GST_REGEX = /^(0[1-9]|[12][0-9]|3[0-8]|9[79])[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// uppercase, strip spaces/dashes/symbols, max 15 chars (works for pasted values too)
export const cleanGst = (v) => (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);

// empty is allowed (field is optional)
export const gstError = (v) => {
  if (!v) return "";
  if (v.length < 15) return `GST number must be 15 characters (${v.length}/15)`;
  if (!GST_REGEX.test(v)) return "Invalid GST number. Example: 33ABCDE1234F1Z5";
  return "";
};

export default function GstInput({ value, onChange, label = "GST Number" }) {
  const [touched, setTouched] = useState(false);
  const [focus, setFocus] = useState(false);

  const err = gstError(value);
  const valid = value.length === 15 && !err;
  const showErr = touched && err;

  const borderColor = showErr ? "#DC2626" : valid ? "#16A34A" : focus ? "#2563EB" : "#E5E7EB";

  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        <span>{label} <span style={{ fontWeight: 500, color: "#9CA3AF" }}>(optional)</span></span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: valid ? "#16A34A" : "#9CA3AF" }}>
          {value.length}/15
        </span>
      </label>

      <div style={{ position: "relative" }}>
        <input
          value={value}
          maxLength={15}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. 33ABCDE1234F1Z5"
          onChange={(e) => onChange(cleanGst(e.target.value))}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); setTouched(true); }}
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 38px 10px 13px",
            borderRadius: 10, border: `1.5px solid ${borderColor}`, outline: "none",
            fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: "#111827",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            boxShadow: focus ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
            transition: "all .15s ease",
          }}
        />
        {valid && (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#16A34A" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>

      {showErr ? (
        <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 4, fontWeight: 500 }}>{err}</div>
      ) : (
        <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4 }}>
          {valid ? "Valid GST number ✓" : "15 characters. Type or paste, we format it for you."}
        </div>
      )}
    </div>
  );
}