

import React, { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import { T, Btn, IconBtn } from "./shared";
import { createPortal } from "react-dom";
import { useToast } from "../Stays/Rooms/Room_Shared";
import { useNavigate } from "react-router-dom";
import AdditionalDocumentSection from "./AdditionalDocumentSection";
import {
  ChevronDown, Search, Upload, Camera, FileText, RefreshCw, X,
  UserRound, MapPin, ShieldCheck, Mail, Phone, Globe, ArrowLeft,
  UserCheck, FileCode, Building2,Eye
} from "lucide-react";

/* ─── Responsive helper ──────────────────────────────────────────── */
const useBreakpoint = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile: w < 640 };
};

/* ─── Extract clean backend error message ────────────────────────── */
function getErrorMessage(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return typeof data.error === "string" ? data.error : fallback;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return fallback;
}

/* ─── Field component with label icon ────────────────────────────── */
function Field({ label, icon: Icon, required, error, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6
      }}>
        {Icon && <Icon size={14} color="#6b7280" />}
        <span>{label}</span>
        {required && <span style={{ color: T.red, marginLeft: -2 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 11.5, color: T.red, marginTop: 4, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

const inpStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 13px",
  borderRadius: 10, border: `1px solid ${T.border}`,
  fontSize: 13.5, color: T.text, outline: "none", background: "#ffffff",
  transition: "all 0.15s ease",
};

/* ─── Section Header (Blue Accent) ────────────────────────────────── */
function SectionHeader({ category, title, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "#eff6ff", color: "#2563eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {category}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 1 }}>
          {title}
        </div>
      </div>
    </div>
  );
}

/* ─── Generic Custom Searchable Dropdown (Supports Aliases & Custom Input) ─── */
function SelectDropdown({ value, options, onChange, error, placeholder = "Select", searchable = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open && searchable) { setSearch(""); setTimeout(() => searchRef.current?.focus(), 30); }
  }, [open, searchable]);

  const active = options.find(o => o.value === value) || (value ? { value, label: value } : null);
  const q = search.trim().toLowerCase();
  
  const filtered = searchable ? options.filter(o => {
    if (!q) return true;
    const matchLabel = o.label.toLowerCase().includes(q);
    const matchAlias = o.aliases ? o.aliases.some(a => a.toLowerCase().includes(q)) : false;
    return matchLabel || matchAlias;
  }) : options;

  const showCustomOption = searchable && q && !options.some(o => o.label.toLowerCase() === q);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...inpStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", borderColor: error ? T.red : (open ? "#2563eb" : T.border),
          boxShadow: open ? `0 0 0 3px rgba(37,99,235,0.14)` : "none",
          background: open ? "#fff" : "#ffffff",
        }}
      >
        <span style={{ fontWeight: 500, color: active ? T.text : "#9ca3af" }}>
          {active ? active.label : placeholder}
        </span>
        <ChevronDown size={15} color="#9ca3af" style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 60,
          background: "#ffffff", border: `1px solid ${T.border}`, borderRadius: 12,
          boxShadow: "0 16px 36px rgba(17,24,39,0.12)", overflow: "hidden",
        }}>
          {searchable && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.border}`, background: "#f9fafb" }}>
              <Search size={14} color="#9ca3af" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search or type..."
                style={{ border: "none", outline: "none", fontSize: 13, width: "100%", color: T.text, background: "transparent" }}
              />
            </div>
          )}
          <div style={{ maxHeight: 230, overflowY: "auto", padding: 6 }}>
            {showCustomOption && (
              <button
                type="button"
                onClick={() => { onChange(search.trim()); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px", borderRadius: 8, border: "none", textAlign: "left",
                  cursor: "pointer", background: "#eff6ff", fontSize: 13.5, fontWeight: 600, color: "#2563eb",
                  marginBottom: 4,
                }}
              >
                + Use "{search.trim()}"
              </button>
            )}
            {filtered.length === 0 && !showCustomOption && (
              <div style={{ padding: "14px 10px", fontSize: 12.5, color: "#9ca3af", textAlign: "center" }}>No matches found</div>
            )}
            {filtered.map(o => {
              const isActive = o.value === value;
              return (
                <button
                  type="button"
                  key={String(o.value)}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8, border: "none", textAlign: "left",
                    cursor: "pointer", background: isActive ? "#eff6ff" : "transparent", fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400, color: isActive ? "#2563eb" : T.text,
                    transition: "all .12s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Country calling codes data with search aliases ── */
export const COUNTRY_CODES = [
  { code: "1", country: "United States", len: 10, aliases: ["usa", "us", "america", "united states of america"] },
  { code: "91", country: "India", len: 10, aliases: ["in", "bharat"] },
  { code: "44", country: "United Kingdom", len: 10, aliases: ["uk", "britain", "england", "great britain"] },
  { code: "971", country: "United Arab Emirates", len: 9, aliases: ["uae", "dubai", "emirates"] },
  { code: "966", country: "Saudi Arabia", len: 9, aliases: ["ksa", "saudi"] },
  { code: "61", country: "Australia", len: 9, aliases: ["aus"] },
  { code: "1", country: "Canada", len: 10, aliases: ["ca"] },
  { code: "49", country: "Germany", len: 11, aliases: ["de", "deutschland"] },
  { code: "33", country: "France", len: 9, aliases: ["fr"] },
  { code: "81", country: "Japan", len: 10, aliases: ["jp", "nippon"] },
  { code: "86", country: "China", len: 11, aliases: ["cn"] },
  { code: "65", country: "Singapore", len: 8, aliases: ["sg"] },
  { code: "60", country: "Malaysia", len: 9, aliases: ["my"] },
  { code: "93", country: "Afghanistan", len: 9 },
  { code: "355", country: "Albania", len: 9 },
  { code: "213", country: "Algeria", len: 9 },
  { code: "376", country: "Andorra", len: 6 },
  { code: "244", country: "Angola", len: 9 },
  { code: "1268", country: "Antigua and Barbuda", len: 10 },
  { code: "54", country: "Argentina", len: 10 },
  { code: "374", country: "Armenia", len: 8 },
  { code: "43", country: "Austria", len: 10 },
  { code: "994", country: "Azerbaijan", len: 9 },
  { code: "1242", country: "Bahamas", len: 10 },
  { code: "973", country: "Bahrain", len: 8 },
  { code: "880", country: "Bangladesh", len: 10 },
  { code: "1246", country: "Barbados", len: 10 },
  { code: "375", country: "Belarus", len: 9 },
  { code: "32", country: "Belgium", len: 9 },
  { code: "501", country: "Belize", len: 7 },
  { code: "229", country: "Benin", len: 8 },
  { code: "975", country: "Bhutan", len: 8 },
  { code: "591", country: "Bolivia", len: 8 },
  { code: "387", country: "Bosnia and Herzegovina", len: 8 },
  { code: "267", country: "Botswana", len: 8 },
  { code: "55", country: "Brazil", len: 11 },
  { code: "673", country: "Brunei", len: 7 },
  { code: "359", country: "Bulgaria", len: 9 },
  { code: "226", country: "Burkina Faso", len: 8 },
  { code: "257", country: "Burundi", len: 8 },
  { code: "238", country: "Cabo Verde", len: 7 },
  { code: "855", country: "Cambodia", len: 9 },
  { code: "237", country: "Cameroon", len: 9 },
  { code: "236", country: "Central African Republic", len: 8 },
  { code: "235", country: "Chad", len: 8 },
  { code: "56", country: "Chile", len: 9 },
  { code: "57", country: "Colombia", len: 10 },
  { code: "269", country: "Comoros", len: 7 },
  { code: "242", country: "Congo (Congo-Brazzaville)", len: 9 },
  { code: "506", country: "Costa Rica", len: 8 },
  { code: "385", country: "Croatia", len: 9 },
  { code: "53", country: "Cuba", len: 8 },
  { code: "357", country: "Cyprus", len: 8 },
  { code: "420", country: "Czechia", len: 9 },
  { code: "243", country: "Democratic Republic of the Congo", len: 9 },
  { code: "45", country: "Denmark", len: 8 },
  { code: "253", country: "Djibouti", len: 8 },
  { code: "1767", country: "Dominica", len: 10 },
  { code: "1809", country: "Dominican Republic", len: 10 },
  { code: "593", country: "Ecuador", len: 9 },
  { code: "20", country: "Egypt", len: 10 },
  { code: "503", country: "El Salvador", len: 8 },
  { code: "240", country: "Equatorial Guinea", len: 9 },
  { code: "291", country: "Eritrea", len: 7 },
  { code: "372", country: "Estonia", len: 8 },
  { code: "268", country: "Eswatini", len: 8 },
  { code: "251", country: "Ethiopia", len: 9 },
  { code: "679", country: "Fiji", len: 7 },
  { code: "358", country: "Finland", len: 9 },
  { code: "241", country: "Gabon", len: 8 },
  { code: "220", country: "Gambia", len: 7 },
  { code: "995", country: "Georgia", len: 9 },
  { code: "233", country: "Ghana", len: 9 },
  { code: "30", country: "Greece", len: 10 },
  { code: "1473", country: "Grenada", len: 10 },
  { code: "502", country: "Guatemala", len: 8 },
  { code: "224", country: "Guinea", len: 9 },
  { code: "245", country: "Guinea-Bissau", len: 9 },
  { code: "592", country: "Guyana", len: 7 },
  { code: "509", country: "Haiti", len: 8 },
  { code: "504", country: "Honduras", len: 8 },
  { code: "36", country: "Hungary", len: 9 },
  { code: "354", country: "Iceland", len: 7 },
  { code: "62", country: "Indonesia", len: 11 },
  { code: "98", country: "Iran", len: 10 },
  { code: "964", country: "Iraq", len: 10 },
  { code: "353", country: "Ireland", len: 9 },
  { code: "972", country: "Israel", len: 9 },
  { code: "39", country: "Italy", len: 10 },
  { code: "225", country: "Ivory Coast", len: 10 },
  { code: "1876", country: "Jamaica", len: 10 },
  { code: "962", country: "Jordan", len: 9 },
  { code: "7", country: "Kazakhstan", len: 10 },
  { code: "254", country: "Kenya", len: 9 },
  { code: "686", country: "Kiribati", len: 8 },
  { code: "383", country: "Kosovo", len: 8 },
  { code: "965", country: "Kuwait", len: 8 },
  { code: "996", country: "Kyrgyzstan", len: 9 },
  { code: "856", country: "Laos", len: 9 },
  { code: "371", country: "Latvia", len: 8 },
  { code: "961", country: "Lebanon", len: 8 },
  { code: "266", country: "Lesotho", len: 8 },
  { code: "231", country: "Liberia", len: 8 },
  { code: "218", country: "Libya", len: 9 },
  { code: "423", country: "Liechtenstein", len: 7 },
  { code: "370", country: "Lithuania", len: 8 },
  { code: "352", country: "Luxembourg", len: 9 },
  { code: "261", country: "Madagascar", len: 9 },
  { code: "265", country: "Malawi", len: 9 },
  { code: "960", country: "Maldives", len: 7 },
  { code: "223", country: "Mali", len: 8 },
  { code: "356", country: "Malta", len: 8 },
  { code: "692", country: "Marshall Islands", len: 7 },
  { code: "222", country: "Mauritania", len: 8 },
  { code: "230", country: "Mauritius", len: 8 },
  { code: "52", country: "Mexico", len: 10 },
  { code: "691", country: "Micronesia", len: 7 },
  { code: "373", country: "Moldova", len: 8 },
  { code: "377", country: "Monaco", len: 8 },
  { code: "976", country: "Mongolia", len: 8 },
  { code: "382", country: "Montenegro", len: 8 },
  { code: "212", country: "Morocco", len: 9 },
  { code: "258", country: "Mozambique", len: 9 },
  { code: "95", country: "Myanmar", len: 9 },
  { code: "264", country: "Namibia", len: 9 },
  { code: "674", country: "Nauru", len: 7 },
  { code: "977", country: "Nepal", len: 10 },
  { code: "31", country: "Netherlands", len: 9 },
  { code: "64", country: "New Zealand", len: 9 },
  { code: "505", country: "Nicaragua", len: 8 },
  { code: "227", country: "Niger", len: 8 },
  { code: "234", country: "Nigeria", len: 10 },
  { code: "850", country: "North Korea", len: 10, aliases: ["korea"] },
  { code: "389", country: "North Macedonia", len: 8 },
  { code: "47", country: "Norway", len: 8 },
  { code: "968", country: "Oman", len: 8 },
  { code: "92", country: "Pakistan", len: 10 },
  { code: "680", country: "Palau", len: 7 },
  { code: "970", country: "Palestine", len: 9 },
  { code: "507", country: "Panama", len: 8 },
  { code: "675", country: "Papua New Guinea", len: 8 },
  { code: "595", country: "Paraguay", len: 9 },
  { code: "51", country: "Peru", len: 9 },
  { code: "63", country: "Philippines", len: 10 },
  { code: "48", country: "Poland", len: 9 },
  { code: "351", country: "Portugal", len: 9 },
  { code: "974", country: "Qatar", len: 8 },
  { code: "40", country: "Romania", len: 9 },
  { code: "7", country: "Russia", len: 10 },
  { code: "250", country: "Rwanda", len: 9 },
  { code: "1869", country: "Saint Kitts and Nevis", len: 10 },
  { code: "1758", country: "Saint Lucia", len: 10 },
  { code: "1784", country: "Saint Vincent and the Grenadines", len: 10 },
  { code: "685", country: "Samoa", len: 7 },
  { code: "378", country: "San Marino", len: 10 },
  { code: "239", country: "Sao Tome and Principe", len: 7 },
  { code: "221", country: "Senegal", len: 9 },
  { code: "381", country: "Serbia", len: 9 },
  { code: "248", country: "Seychelles", len: 7 },
  { code: "232", country: "Sierra Leone", len: 8 },
  { code: "421", country: "Slovakia", len: 9 },
  { code: "386", country: "Slovenia", len: 8 },
  { code: "677", country: "Solomon Islands", len: 7 },
  { code: "252", country: "Somalia", len: 8 },
  { code: "27", country: "South Africa", len: 9 },
  { code: "82", country: "South Korea", len: 10, aliases: ["korea"] },
  { code: "211", country: "South Sudan", len: 9 },
  { code: "34", country: "Spain", len: 9 },
  { code: "94", country: "Sri Lanka", len: 9 },
  { code: "249", country: "Sudan", len: 9 },
  { code: "597", country: "Suriname", len: 7 },
  { code: "46", country: "Sweden", len: 9 },
  { code: "41", country: "Switzerland", len: 9 },
  { code: "963", country: "Syria", len: 9 },
  { code: "886", country: "Taiwan", len: 9 },
  { code: "992", country: "Tajikistan", len: 9 },
  { code: "255", country: "Tanzania", len: 9 },
  { code: "66", country: "Thailand", len: 9 },
  { code: "670", country: "Timor-Leste", len: 8 },
  { code: "228", country: "Togo", len: 8 },
  { code: "676", country: "Tonga", len: 7 },
  { code: "1868", country: "Trinidad and Tobago", len: 10 },
  { code: "216", country: "Tunisia", len: 8 },
  { code: "90", country: "Turkey", len: 10 },
  { code: "993", country: "Turkmenistan", len: 8 },
  { code: "688", country: "Tuvalu", len: 6 },
  { code: "256", country: "Uganda", len: 9 },
  { code: "380", country: "Ukraine", len: 9 },
  { code: "598", country: "Uruguay", len: 8 },
  { code: "998", country: "Uzbekistan", len: 9 },
  { code: "678", country: "Vanuatu", len: 7 },
  { code: "379", country: "Vatican City", len: 10 },
  { code: "58", country: "Venezuela", len: 10 },
  { code: "84", country: "Vietnam", len: 9 },
  { code: "967", country: "Yemen", len: 9 },
  { code: "260", country: "Zambia", len: 9 },
  { code: "263", country: "Zimbabwe", len: 9 },
].map(c => ({ ...c, label: `+${c.code} ${c.country}` }));

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad",
  "Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus",
  "Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji",
  "Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
  "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati",
  "Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein",
  "Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
  "Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
  "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain",
  "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const COUNTRY_ALIASES = {
  "United States": ["usa", "us", "america", "united states of america"],
  "United Kingdom": ["uk", "britain", "england", "great britain"],
  "United Arab Emirates": ["uae", "dubai", "emirates"],
  "Saudi Arabia": ["ksa", "saudi"],
  "India": ["in", "bharat"],
  "Australia": ["aus"],
  "Canada": ["ca"],
  "Germany": ["de", "deutschland"],
  "France": ["fr"],
  "Japan": ["jp", "nippon"],
  "China": ["cn"],
  "Singapore": ["sg"],
  "Malaysia": ["my"],
  "South Korea": ["korea", "kr"],
  "North Korea": ["korea"],
  "Russia": ["ru", "ussr"],
};

const COUNTRY_OPTIONS = COUNTRIES.map(c => ({
  value: c,
  label: c,
  aliases: COUNTRY_ALIASES[c] || []
}));

/* ── Dynamic Country States Dictionary ──────────────────────────── */
// const COUNTRY_STATES = {
//   "India": [
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
//     "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
//     "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
//     "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
//     "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
//     "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
//   ],
//   "United States": [
//     "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
//     "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
//     "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
//     "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
//     "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
//     "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
//     "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
//   ],
//   "United Arab Emirates": [
//     "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"
//   ],
//   "Australia": [
//     "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
//     "South Australia", "Tasmania", "Victoria", "Western Australia"
//   ],
//   "Canada": [
//     "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
//     "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
//     "Quebec", "Saskatchewan", "Yukon"
//   ],
//   "United Kingdom": [
//     "England", "Northern Ireland", "Scotland", "Wales"
//   ],
//   "Saudi Arabia": [
//     "Asir", "Bahah", "Eastern Province", "Ha'il", "Jizan", "Madinah", "Makkah", "Najran",
//     "Northern Borders", "Qassim", "Riyadh", "Tabuk", "Jawf"
//   ],
//   "Germany": [
//     "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
//     "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate",
//     "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
//   ],
//   "Malaysia": [
//     "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca", "Negeri Sembilan",
//     "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu"
//   ],
//   "Singapore": [
//     "Central Region", "East Region", "North Region", "North-East Region", "West Region"
//   ],
//   "Sri Lanka": [
//     "Central", "Eastern", "North Central", "Northern", "North Western", "Sabaragamuwa",
//     "Southern", "Uva", "Western"
//   ],
//   "Nepal": [
//     "Bagmati", "Gandaki", "Karnali", "Koshi", "Lumbini", "Madesh", "Sudurpashchim"
//   ],
//   "Qatar": [
//     "Al Daayen", "Al Khor", "Al Rayyan", "Al Shamal", "Al Wakrah", "Doha", "Shahaniya", "Umm Salal"
//   ],
//   "France": [
//     "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
//     "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
//     "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
//   ],
//   "China": [
//     "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou",
//     "Hainan", "Hebei", "Heilongjiang", "Henan", "Hong Kong", "Hubei", "Hunan", "Inner Mongolia",
//     "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Macau", "Ningxia", "Qinghai", "Shaanxi",
//     "Shandong", "Shanghai", "Shanxi", "Sichuan", "Taiwan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"
//   ],
//   "Japan": [
//     "Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gunma",
//     "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima",
//     "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki",
//     "Nara", "Niigata", "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane",
//     "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata",
//     "Yamaguchi", "Yamanashi"
//   ],
//   "Indonesia": [
//     "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi",
//     "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan",
//     "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
//     "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
//     "Nusa Tenggara Timur", "Papua", "Riau", "Sulawesi Selatan", "Sulawesi Tengah",
//     "Sulawesi Tenggara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"
//   ],
//   "Thailand": [
//     "Bangkok", "Chiang Mai", "Chiang Rai", "Chonburi", "Krabi", "Nakhon Ratchasima",
//     "Nonthaburi", "Pathum Thani", "Phuket", "Songkhla", "Surat Thani", "Udon Thani"
//   ],
//   "New Zealand": [
//     "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Wanganui",
//     "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman",
//     "Waikato", "Wellington", "West Coast"
//   ],
//   "Pakistan": [
//     "Azad Jammu and Kashmir", "Balochistan", "Gilgit-Baltistan", "Islamabad Capital Territory",
//     "Khyber Pakhtunkhwa", "Punjab", "Sindh"
//   ],
//   "Bangladesh": [
//     "Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"
//   ],
//   "South Korea": [
//     "Busan", "Chungcheongbuk-do", "Chungcheongnam-do", "Daegu", "Daejeon", "Gangwon-do",
//     "Gwangju", "Gyeonggi-do", "Gyeongsangbuk-do", "Gyeongsangnam-do", "Incheon", "Jeju",
//     "Jeollabuk-do", "Jeollanam-do", "Sejong", "Seoul", "Ulsan"
//   ],
//   "South Africa": [
//     "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
//     "Northern Cape", "North West", "Western Cape"
//   ],
//   "Nigeria": [
//     "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
//     "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
//     "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
//     "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
//   ],
//   "Egypt": [
//     "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta",
//     "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matrouh", "Minya",
//     "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea",
//     "Sharqia", "Sohag", "South Sinai", "Suez"
//   ]
// };














/* ── Dynamic Country States Dictionary — FULL (all countries) ──────
   Paste this in place of your existing COUNTRY_STATES object.
   Micro-states with no real administrative subdivisions
   (Monaco, Vatican City, Liechtenstein, Nauru, Tuvalu, Marshall Islands)
   are intentionally left out — for those, your SelectDropdown already
   falls back to free-text entry via the "+ Use ..." option.
------------------------------------------------------------------- */
const COUNTRY_STATES = {
  "Afghanistan": [
    "Badakhshan","Badghis","Baghlan","Balkh","Bamyan","Daykundi","Farah","Faryab","Ghazni","Ghor",
    "Helmand","Herat","Jowzjan","Kabul","Kandahar","Kapisa","Khost","Kunar","Kunduz","Laghman",
    "Logar","Nangarhar","Nimroz","Nuristan","Paktia","Paktika","Panjshir","Parwan","Samangan",
    "Sar-e Pol","Takhar","Urozgan","Wardak","Zabul"
  ],
  "Albania": [
    "Berat","Dibër","Durrës","Elbasan","Fier","Gjirokastër","Korçë","Kukës","Lezhë","Shkodër","Tirana","Vlorë"
  ],
  "Algeria": [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira",
    "Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers","Djelfa","Jijel","Sétif","Saïda",
    "Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara",
    "Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf",
    "Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
    "Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah",
    "In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
  ],
  "Andorra": ["Andorra la Vella","Canillo","Encamp","Escaldes-Engordany","La Massana","Ordino","Sant Julià de Lòria"],
  "Angola": [
    "Bengo","Benguela","Bié","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul","Cunene","Huambo",
    "Huíla","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Namibe","Uíge","Zaire"
  ],
  "Antigua and Barbuda": ["Saint George","Saint John","Saint Mary","Saint Paul","Saint Peter","Saint Philip","Barbuda","Redonda"],
  "Argentina": [
    "Buenos Aires","Buenos Aires (City)","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos",
    "Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
    "San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán"
  ],
  "Armenia": ["Aragatsotn","Ararat","Armavir","Gegharkunik","Kotayk","Lori","Shirak","Syunik","Tavush","Vayots Dzor","Yerevan"],
  "Australia": [
    "Australian Capital Territory","New South Wales","Northern Territory","Queensland",
    "South Australia","Tasmania","Victoria","Western Australia"
  ],
  "Austria": ["Burgenland","Carinthia","Lower Austria","Upper Austria","Salzburg","Styria","Tyrol","Vorarlberg","Vienna"],
  "Azerbaijan": [
    "Absheron","Aran","Baku","Ganja-Gazakh","Guba-Khachmaz","Lankaran","Nakhchivan","Shaki-Zaqatala","Yukhari-Karabakh"
  ],
  "Bahamas": [
    "New Providence","Grand Bahama","Abaco","Andros","Bimini","Cat Island","Eleuthera","Exuma","Inagua",
    "Long Island","Mayaguana","Ragged Island","Rum Cay","San Salvador","Berry Islands","Acklins","Crooked Island"
  ],
  "Bahrain": ["Capital","Muharraq","Northern","Southern"],
  "Bangladesh": ["Barishal","Chattogram","Dhaka","Khulna","Mymensingh","Rajshahi","Rangpur","Sylhet"],
  "Barbados": [
    "Christ Church","Saint Andrew","Saint George","Saint James","Saint John","Saint Joseph","Saint Lucy",
    "Saint Michael","Saint Peter","Saint Philip","Saint Thomas"
  ],
  "Belarus": ["Brest","Gomel","Grodno","Minsk","Mogilev","Vitebsk"],
  "Belgium": [
    "Antwerp","East Flanders","Flemish Brabant","Hainaut","Liège","Limburg","Luxembourg","Namur",
    "Walloon Brabant","West Flanders","Brussels-Capital"
  ],
  "Belize": ["Belize","Cayo","Corozal","Orange Walk","Stann Creek","Toledo"],
  "Benin": ["Alibori","Atacora","Atlantique","Borgou","Collines","Kouffo","Donga","Littoral","Mono","Ouémé","Plateau","Zou"],
  "Bhutan": [
    "Bumthang","Chukha","Dagana","Gasa","Haa","Lhuntse","Mongar","Paro","Pemagatshel","Punakha",
    "Samdrup Jongkhar","Samtse","Sarpang","Thimphu","Trashigang","Trashiyangtse","Trongsa","Tsirang",
    "Wangdue Phodrang","Zhemgang"
  ],
  "Bolivia": ["Beni","Chuquisaca","Cochabamba","La Paz","Oruro","Pando","Potosí","Santa Cruz","Tarija"],
  "Bosnia and Herzegovina": ["Federation of Bosnia and Herzegovina","Republika Srpska","Brčko District"],
  "Botswana": ["Central","Ghanzi","Kgalagadi","Kgatleng","Kweneng","North-East","North-West","South-East","Southern"],
  "Brazil": [
    "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás",
    "Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco",
    "Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina",
    "São Paulo","Sergipe","Tocantins"
  ],
  "Brunei": ["Belait","Brunei-Muara","Temburong","Tutong"],
  "Bulgaria": [
    "Blagoevgrad","Burgas","Dobrich","Gabrovo","Haskovo","Kardzhali","Kyustendil","Lovech","Montana",
    "Pazardzhik","Pernik","Pleven","Plovdiv","Razgrad","Ruse","Shumen","Silistra","Sliven","Smolyan",
    "Sofia City","Sofia Province","Stara Zagora","Targovishte","Varna","Veliko Tarnovo","Vidin","Vratsa","Yambol"
  ],
  "Burkina Faso": [
    "Boucle du Mouhoun","Cascades","Centre","Centre-Est","Centre-Nord","Centre-Ouest","Centre-Sud",
    "Est","Hauts-Bassins","Nord","Plateau-Central","Sahel","Sud-Ouest"
  ],
  "Burundi": [
    "Bubanza","Bujumbura Mairie","Bujumbura Rural","Bururi","Cankuzo","Cibitoke","Gitega","Karuzi",
    "Kayanza","Kirundo","Makamba","Muramvya","Muyinga","Mwaro","Ngozi","Rumonge","Rutana","Ruyigi"
  ],
  "Cabo Verde": [
    "Boa Vista","Brava","Maio","Mosteiros","Paul","Porto Novo","Praia","Ribeira Brava","Ribeira Grande",
    "Ribeira Grande de Santiago","Sal","Santa Catarina","Santa Catarina do Fogo","Santa Cruz","São Domingos",
    "São Filipe","São Lourenço dos Órgãos","São Miguel","São Salvador do Mundo","São Vicente","Tarrafal","Tarrafal de São Nicolau"
  ],
  "Cambodia": [
    "Banteay Meanchey","Battambang","Kampong Cham","Kampong Chhnang","Kampong Speu","Kampong Thom",
    "Kampot","Kandal","Kep","Koh Kong","Kratié","Mondulkiri","Oddar Meanchey","Pailin","Phnom Penh",
    "Preah Vihear","Prey Veng","Pursat","Ratanakiri","Siem Reap","Sihanoukville","Stung Treng","Svay Rieng",
    "Takéo","Tboung Khmum"
  ],
  "Cameroon": ["Adamawa","Centre","East","Far North","Littoral","North","Northwest","South","Southwest","West"],
  "Canada": [
    "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
    "Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"
  ],
  "Central African Republic": [
    "Bamingui-Bangoran","Bangui","Basse-Kotto","Haute-Kotto","Haut-Mbomou","Kémo","Lobaye",
    "Mambéré-Kadéï","Mbomou","Nana-Grébizi","Nana-Mambéré","Ombella-M'Poko","Ouaka","Ouham",
    "Ouham-Pendé","Sangha-Mbaéré","Vakaga"
  ],
  "Chad": [
    "Batha","Borkou","Chari-Baguirmi","Ennedi Est","Ennedi Ouest","Guéra","Hadjer-Lamis","Kanem","Lac",
    "Logone Occidental","Logone Oriental","Mandoul","Mayo-Kebbi Est","Mayo-Kebbi Ouest","Moyen-Chari",
    "N'Djamena","Ouaddaï","Salamat","Sila","Tandjilé","Tibesti","Wadi Fira"
  ],
  "Chile": [
    "Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo","Valparaíso",
    "Metropolitana de Santiago","Libertador General Bernardo O'Higgins","Maule","Ñuble","Biobío",
    "La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes"
  ],
  "China": [
    "Anhui","Beijing","Chongqing","Fujian","Gansu","Guangdong","Guangxi","Guizhou","Hainan","Hebei",
    "Heilongjiang","Henan","Hong Kong","Hubei","Hunan","Inner Mongolia","Jiangsu","Jiangxi","Jilin",
    "Liaoning","Macau","Ningxia","Qinghai","Shaanxi","Shandong","Shanghai","Shanxi","Sichuan","Taiwan",
    "Tianjin","Tibet","Xinjiang","Yunnan","Zhejiang"
  ],
  "Colombia": [
    "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca",
    "Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta",
    "Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander",
    "Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"
  ],
  "Comoros": ["Grande Comore","Anjouan","Mohéli"],
  "Congo (Congo-Brazzaville)": [
    "Bouenza","Brazzaville","Cuvette","Cuvette-Ouest","Kouilou","Lékoumou","Likouala","Niari",
    "Plateaux","Pointe-Noire","Pool","Sangha"
  ],
  "Costa Rica": ["Alajuela","Cartago","Guanacaste","Heredia","Limón","Puntarenas","San José"],
  "Croatia": [
    "Bjelovar-Bilogora","Brod-Posavina","Dubrovnik-Neretva","Istria","Karlovac","Koprivnica-Križevci",
    "Krapina-Zagorje","Lika-Senj","Međimurje","Osijek-Baranja","Požega-Slavonia","Primorje-Gorski Kotar",
    "Šibenik-Knin","Sisak-Moslavina","Split-Dalmatia","Varaždin","Virovitica-Podravina","Vukovar-Syrmia",
    "Zadar","Zagreb County","City of Zagreb"
  ],
  "Cuba": [
    "Pinar del Río","Artemisa","Havana","Mayabeque","Matanzas","Cienfuegos","Villa Clara","Sancti Spíritus",
    "Ciego de Ávila","Camagüey","Las Tunas","Holguín","Granma","Santiago de Cuba","Guantánamo","Isla de la Juventud"
  ],
  "Cyprus": ["Famagusta","Kyrenia","Larnaca","Limassol","Nicosia","Paphos"],
  "Czechia": [
    "Prague","Central Bohemian","South Bohemian","Plzeň","Karlovy Vary","Ústí nad Labem","Liberec",
    "Hradec Králové","Pardubice","Vysočina","South Moravian","Olomouc","Zlín","Moravian-Silesian"
  ],
  "Democratic Republic of the Congo": [
    "Bas-Uélé","Équateur","Haut-Katanga","Haut-Lomami","Haut-Uélé","Ituri","Kasaï","Kasaï-Central",
    "Kasaï-Oriental","Kinshasa","Kongo Central","Kwango","Kwilu","Lomami","Lualaba","Mai-Ndombe",
    "Maniema","Mongala","Nord-Kivu","Nord-Ubangi","Sankuru","Sud-Kivu","Sud-Ubangi","Tanganyika","Tshopo","Tshuapa"
  ],
  "Denmark": ["Capital Region","Central Denmark","North Denmark","Region Zealand","Region of Southern Denmark"],
  "Djibouti": ["Ali Sabieh","Arta","Dikhil","Djibouti","Obock","Tadjourah"],
  "Dominica": [
    "Saint Andrew","Saint David","Saint George","Saint John","Saint Joseph","Saint Luke",
    "Saint Mark","Saint Patrick","Saint Paul","Saint Peter"
  ],
  "Dominican Republic": [
    "Azua","Baoruco","Barahona","Dajabón","Distrito Nacional","Duarte","Elías Piña","El Seibo","Espaillat",
    "Hato Mayor","Hermanas Mirabal","Independencia","La Altagracia","La Romana","La Vega","María Trinidad Sánchez",
    "Monseñor Nouel","Monte Cristi","Monte Plata","Pedernales","Peravia","Puerto Plata","Samaná",
    "Sánchez Ramírez","San Cristóbal","San José de Ocoa","San Juan","San Pedro de Macorís","Santiago",
    "Santiago Rodríguez","Santo Domingo","Valverde"
  ],
  "Ecuador": [
    "Azuay","Bolívar","Cañar","Carchi","Chimborazo","Cotopaxi","El Oro","Esmeraldas","Galápagos","Guayas",
    "Imbabura","Loja","Los Ríos","Manabí","Morona-Santiago","Napo","Orellana","Pastaza","Pichincha",
    "Santa Elena","Santo Domingo de los Tsáchilas","Sucumbíos","Tungurahua","Zamora-Chinchipe"
  ],
  "Egypt": [
    "Alexandria","Aswan","Asyut","Beheira","Beni Suef","Cairo","Dakahlia","Damietta","Faiyum","Gharbia",
    "Giza","Ismailia","Kafr El Sheikh","Luxor","Matrouh","Minya","Monufia","New Valley","North Sinai",
    "Port Said","Qalyubia","Qena","Red Sea","Sharqia","Sohag","South Sinai","Suez"
  ],
  "El Salvador": [
    "Ahuachapán","Cabañas","Chalatenango","Cuscatlán","La Libertad","La Paz","La Unión","Morazán",
    "San Miguel","San Salvador","San Vicente","Santa Ana","Sonsonate","Usulután"
  ],
  "Equatorial Guinea": ["Annobón","Bioko Norte","Bioko Sur","Centro Sur","Kié-Ntem","Litoral","Wele-Nzas"],
  "Eritrea": ["Anseba","Debub","Gash-Barka","Maekel","Northern Red Sea","Southern Red Sea"],
  "Estonia": ["Harju","Hiiu","Ida-Viru","Jõgeva","Järva","Lääne","Lääne-Viru","Põlva","Pärnu","Rapla","Saare","Tartu","Valga","Viljandi","Võru"],
  "Eswatini": ["Hhohho","Lubombo","Manzini","Shiselweni"],
  "Ethiopia": [
    "Addis Ababa","Afar","Amhara","Benishangul-Gumuz","Dire Dawa","Gambela","Harari","Oromia","Sidama",
    "Somali","South West Ethiopia Peoples","Southern Nations Nationalities and Peoples","Tigray"
  ],
  "Fiji": ["Central","Eastern","Northern","Western"],
  "Finland": [
    "Åland","Central Finland","Central Ostrobothnia","Kainuu","Kanta-Häme","Kymenlaakso","Lapland",
    "North Karelia","North Ostrobothnia","North Savo","Ostrobothnia","Päijänne Tavastia","Pirkanmaa",
    "Satakunta","South Karelia","South Ostrobothnia","South Savo","Southwest Finland","Uusimaa"
  ],
  "France": [
    "Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","Brittany","Centre-Val de Loire","Corsica",
    "Grand Est","Hauts-de-France","Île-de-France","Normandy","Nouvelle-Aquitaine","Occitanie",
    "Pays de la Loire","Provence-Alpes-Côte d'Azur"
  ],
  "Gabon": ["Estuaire","Haut-Ogooué","Moyen-Ogooué","Ngounié","Nyanga","Ogooué-Ivindo","Ogooué-Lolo","Ogooué-Maritime","Woleu-Ntem"],
  "Gambia": ["Banjul","Central River","Lower River","North Bank","Upper River","West Coast"],
  "Georgia": [
    "Abkhazia","Adjara","Guria","Imereti","Kakheti","Kvemo Kartli","Mtskheta-Mtianeti",
    "Racha-Lechkhumi and Kvemo Svaneti","Samegrelo-Zemo Svaneti","Samtskhe-Javakheti","Shida Kartli","Tbilisi"
  ],
  "Germany": [
    "Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony",
    "Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony",
    "Saxony-Anhalt","Schleswig-Holstein","Thuringia"
  ],
  "Ghana": [
    "Ahafo","Ashanti","Bono","Bono East","Central","Eastern","Greater Accra","North East","Northern",
    "Oti","Savannah","Upper East","Upper West","Volta","Western","Western North"
  ],
  "Greece": [
    "Attica","Central Greece","Central Macedonia","Crete","Eastern Macedonia and Thrace","Epirus",
    "Ionian Islands","North Aegean","Peloponnese","South Aegean","Thessaly","Western Greece","Western Macedonia"
  ],
  "Grenada": ["Saint Andrew","Saint David","Saint George","Saint John","Saint Mark","Saint Patrick","Carriacou and Petite Martinique"],
  "Guatemala": [
    "Alta Verapaz","Baja Verapaz","Chimaltenango","Chiquimula","El Progreso","Escuintla","Guatemala",
    "Huehuetenango","Izabal","Jalapa","Jutiapa","Petén","Quetzaltenango","Quiché","Retalhuleu",
    "Sacatepéquez","San Marcos","Santa Rosa","Sololá","Suchitepéquez","Totonicapán","Zacapa"
  ],
  "Guinea": ["Boké","Conakry","Faranah","Kankan","Kindia","Labé","Mamou","Nzérékoré"],
  "Guinea-Bissau": ["Bafatá","Biombo","Bissau","Bolama","Cacheu","Gabú","Oio","Quinara","Tombali"],
  "Guyana": [
    "Barima-Waini","Cuyuni-Mazaruni","Demerara-Mahaica","East Berbice-Corentyne",
    "Essequibo Islands-West Demerara","Mahaica-Berbice","Pomeroon-Supenaam","Potaro-Siparuni",
    "Upper Demerara-Berbice","Upper Takutu-Upper Essequibo"
  ],
  "Haiti": ["Artibonite","Centre","Grand'Anse","Nippes","Nord","Nord-Est","Nord-Ouest","Ouest","Sud","Sud-Est"],
  "Honduras": [
    "Atlántida","Choluteca","Colón","Comayagua","Copán","Cortés","El Paraíso","Francisco Morazán",
    "Gracias a Dios","Intibucá","Islas de la Bahía","La Paz","Lempira","Ocotepeque","Olancho",
    "Santa Bárbara","Valle","Yoro"
  ],
  "Hungary": [
    "Bács-Kiskun","Baranya","Békés","Borsod-Abaúj-Zemplén","Csongrád-Csanád","Fejér","Győr-Moson-Sopron",
    "Hajdú-Bihar","Heves","Jász-Nagykun-Szolnok","Komárom-Esztergom","Nógrád","Pest","Somogy",
    "Szabolcs-Szatmár-Bereg","Tolna","Vas","Veszprém","Zala","Budapest"
  ],
  "Iceland": [
    "Capital Region","Southern Peninsula","Western Region","Westfjords","Northwestern Region",
    "Northeastern Region","Eastern Region","Southern Region"
  ],
  "India": [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
    "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
    "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
  ],
  "Indonesia": [
    "Bali","Banten","Bengkulu","DI Yogyakarta","DKI Jakarta","Gorontalo","Jambi","Jawa Barat","Jawa Tengah",
    "Jawa Timur","Kalimantan Barat","Kalimantan Selatan","Kalimantan Tengah","Kalimantan Timur",
    "Kalimantan Utara","Kepulauan Bangka Belitung","Kepulauan Riau","Lampung","Maluku","Maluku Utara",
    "Nusa Tenggara Barat","Nusa Tenggara Timur","Papua","Riau","Sulawesi Selatan","Sulawesi Tengah",
    "Sulawesi Tenggara","Sumatera Barat","Sumatera Selatan","Sumatera Utara"
  ],
  "Iran": [
    "Alborz","Ardabil","Bushehr","Chaharmahal and Bakhtiari","East Azerbaijan","Fars","Gilan","Golestan",
    "Hamadan","Hormozgan","Ilam","Isfahan","Kerman","Kermanshah","Khuzestan","Kohgiluyeh and Boyer-Ahmad",
    "Kurdistan","Lorestan","Markazi","Mazandaran","North Khorasan","Qazvin","Qom","Razavi Khorasan",
    "Semnan","Sistan and Baluchestan","South Khorasan","Tehran","West Azerbaijan","Yazd","Zanjan"
  ],
  "Iraq": [
    "Al Anbar","Babil","Baghdad","Basra","Dhi Qar","Al-Qādisiyyah","Diyala","Duhok","Erbil","Karbala",
    "Kirkuk","Maysan","Muthanna","Najaf","Nineveh","Saladin","Sulaymaniyah","Wasit"
  ],
  "Ireland": [
    "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry","Kildare","Kilkenny","Laois",
    "Leitrim","Limerick","Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo",
    "Tipperary","Waterford","Westmeath","Wexford","Wicklow"
  ],
  "Israel": ["Central","Haifa","Jerusalem","Northern","Southern","Tel Aviv"],
  "Italy": [
    "Abruzzo","Aosta Valley","Apulia","Basilicata","Calabria","Campania","Emilia-Romagna",
    "Friuli-Venezia Giulia","Lazio","Liguria","Lombardy","Marche","Molise","Piedmont","Sardinia",
    "Sicily","Trentino-Alto Adige","Tuscany","Umbria","Veneto"
  ],
  "Ivory Coast": [
    "Abidjan","Bas-Sassandra","Comoé","Denguélé","Gôh-Djiboua","Lacs","Lagunes","Montagnes",
    "Sassandra-Marahoué","Savanes","Vallée du Bandama","Woroba","Yamoussoukro","Zanzan"
  ],
  "Jamaica": [
    "Clarendon","Hanover","Kingston","Manchester","Portland","Saint Andrew","Saint Ann","Saint Catherine",
    "Saint Elizabeth","Saint James","Saint Mary","Saint Thomas","Trelawny","Westmoreland"
  ],
  "Japan": [
    "Aichi","Akita","Aomori","Chiba","Ehime","Fukui","Fukuoka","Fukushima","Gifu","Gunma","Hiroshima",
    "Hokkaido","Hyogo","Ibaraki","Ishikawa","Iwate","Kagawa","Kagoshima","Kanagawa","Kochi","Kumamoto",
    "Kyoto","Mie","Miyagi","Miyazaki","Nagano","Nagasaki","Nara","Niigata","Oita","Okayama","Okinawa",
    "Osaka","Saga","Saitama","Shiga","Shimane","Shizuoka","Tochigi","Tokushima","Tokyo","Tottori",
    "Toyama","Wakayama","Yamagata","Yamaguchi","Yamanashi"
  ],
  "Jordan": ["Amman","Ajloun","Aqaba","Balqa","Irbid","Jerash","Karak","Ma'an","Madaba","Mafraq","Tafilah","Zarqa"],
  "Kazakhstan": [
    "Abai","Akmola","Aktobe","Almaty Region","Almaty City","Astana","Atyrau","East Kazakhstan","Jambyl",
    "Jetisu","Karaganda","Kostanay","Kyzylorda","Mangystau","North Kazakhstan","Pavlodar","Shymkent",
    "Turkistan","Ulytau","West Kazakhstan"
  ],
  "Kenya": [
    "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado",
    "Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu",
    "Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru",
    "Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River",
    "Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
  ],
  "Kiribati": ["Gilbert Islands","Line Islands","Phoenix Islands"],
  "Kosovo": ["Ferizaj","Gjakova","Gjilan","Mitrovica","Peja","Pristina","Prizren"],
  "Kuwait": ["Al Ahmadi","Al Asimah","Al Farwaniyah","Al Jahra","Hawalli","Mubarak Al-Kabeer"],
  "Kyrgyzstan": ["Batken","Bishkek","Chuy","Jalal-Abad","Naryn","Osh Region","Osh City","Talas","Issyk-Kul"],
  "Laos": [
    "Attapeu","Bokeo","Bolikhamxai","Champasak","Houaphanh","Khammouane","Luang Namtha","Luang Prabang",
    "Oudomxay","Phongsaly","Sainyabuli","Salavan","Savannakhet","Sekong","Vientiane Capital",
    "Vientiane Province","Xaisomboun","Xieng Khouang"
  ],
  "Latvia": ["Kurzeme","Latgale","Riga","Vidzeme","Zemgale"],
  "Lebanon": ["Akkar","Baalbek-Hermel","Beirut","Beqaa","Mount Lebanon","Nabatieh","North","South"],
  "Lesotho": [
    "Berea","Butha-Buthe","Leribe","Mafeteng","Maseru","Mohale's Hoek","Mokhotlong","Qacha's Nek","Quthing","Thaba-Tseka"
  ],
  "Liberia": [
    "Bomi","Bong","Gbarpolu","Grand Bassa","Grand Cape Mount","Grand Gedeh","Grand Kru","Lofa","Margibi",
    "Maryland","Montserrado","Nimba","River Cess","River Gee","Sinoe"
  ],
  "Libya": [
    "Al Butnan","Al Jabal al Akhdar","Al Jabal al Gharbi","Al Jafara","Al Jufrah","Al Kufrah","Al Marj",
    "Al Marqab","Al Wahat","Az Zawiyah","Banghazi","Darnah","Ghat","Misrata","Murzuq","Nalut","Sabha",
    "Sirte","Tripoli","Wadi al Hayaa","Wadi al Shatii"
  ],
  "Lithuania": ["Alytus","Kaunas","Klaipėda","Marijampolė","Panevėžys","Šiauliai","Tauragė","Telšiai","Utena","Vilnius"],
  "Luxembourg": ["Diekirch","Grevenmacher","Luxembourg"],
  "Madagascar": ["Antananarivo","Antsiranana","Fianarantsoa","Mahajanga","Toamasina","Toliara"],
  "Malawi": ["Central","Northern","Southern"],
  "Malaysia": [
    "Johor","Kedah","Kelantan","Kuala Lumpur","Labuan","Malacca","Negeri Sembilan","Pahang","Penang",
    "Perak","Perlis","Putrajaya","Sabah","Sarawak","Selangor","Terengganu"
  ],
  "Maldives": [
    "Haa Alif","Haa Dhaalu","Shaviyani","Noonu","Raa","Baa","Lhaviyani","Kaafu","Alifu Alifu","Alifu Dhaalu",
    "Vaavu","Meemu","Faafu","Dhaalu","Thaa","Laamu","Gaafu Alifu","Gaafu Dhaalu","Gnaviyani","Seenu"
  ],
  "Mali": ["Bamako","Gao","Kayes","Kidal","Koulikoro","Ménaka","Mopti","Ségou","Sikasso","Taoudénit","Tombouctou"],
  "Malta": ["Northern","South Eastern","Southern Harbour","Western","Northern Harbour","Gozo and Comino"],
  "Mauritania": [
    "Adrar","Assaba","Brakna","Dakhlet Nouadhibou","Gorgol","Guidimaka","Hodh Ech Chargui","Hodh El Gharbi",
    "Inchiri","Nouakchott Nord","Nouakchott Ouest","Nouakchott Sud","Tagant","Tiris Zemmour","Trarza"
  ],
  "Mauritius": [
    "Black River","Flacq","Grand Port","Moka","Pamplemousses","Plaines Wilhems","Port Louis",
    "Rivière du Rempart","Savanne","Rodrigues","Agalega"
  ],
  "Mexico": [
    "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Coahuila",
    "Colima","Durango","Guanajuato","Guerrero","Hidalgo","Jalisco","Mexico City","México State",
    "Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo",
    "San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
  ],
  "Micronesia": ["Chuuk","Kosrae","Pohnpei","Yap"],
  "Moldova": [
    "Chișinău","Bălți","Gagauzia","Transnistria","Anenii Noi","Basarabeasca","Briceni","Cahul","Cantemir",
    "Călărași","Căușeni","Cimișlia","Criuleni","Dondușeni","Drochia","Dubăsari","Edineț","Fălești",
    "Florești","Glodeni","Hîncești","Ialoveni","Nisporeni","Ocnița","Orhei","Rezina","Rîșcani","Sîngerei",
    "Soroca","Ștefan Vodă","Strășeni","Șoldănești","Taraclia","Telenești","Ungheni"
  ],
  "Mongolia": [
    "Arkhangai","Bayan-Ölgii","Bayankhongor","Bulgan","Darkhan-Uul","Dornod","Dornogovi","Dundgovi",
    "Govi-Altai","Govisümber","Khentii","Khovd","Khövsgöl","Ömnögovi","Orkhon","Övörkhangai","Selenge",
    "Sükhbaatar","Töv","Uvs","Zavkhan","Ulaanbaatar"
  ],
  "Montenegro": [
    "Andrijevica","Bar","Berane","Bijelo Polje","Budva","Cetinje","Danilovgrad","Gusinje","Herceg Novi",
    "Kolašin","Kotor","Mojkovac","Nikšić","Petnjica","Plav","Pljevlja","Plužine","Podgorica","Rožaje",
    "Šavnik","Tivat","Tuzi","Ulcinj","Žabljak"
  ],
  "Morocco": [
    "Tanger-Tétouan-Al Hoceïma","Oriental","Fès-Meknès","Rabat-Salé-Kénitra","Béni Mellal-Khénifra",
    "Casablanca-Settat","Marrakech-Safi","Drâa-Tafilalet","Souss-Massa","Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra","Dakhla-Oued Ed-Dahab"
  ],
  "Mozambique": [
    "Cabo Delgado","Gaza","Inhambane","Manica","Maputo City","Maputo Province","Nampula","Niassa","Sofala","Tete","Zambezia"
  ],
  "Myanmar": [
    "Ayeyarwady","Bago","Chin","Kachin","Kayah","Kayin","Magway","Mandalay","Mon","Naypyidaw","Rakhine",
    "Sagaing","Shan","Tanintharyi","Yangon"
  ],
  "Namibia": [
    "Erongo","Hardap","Karas","Kavango East","Kavango West","Khomas","Kunene","Ohangwena","Omaheke",
    "Omusati","Oshana","Oshikoto","Otjozondjupa","Zambezi"
  ],
  "Nepal": ["Bagmati","Gandaki","Karnali","Koshi","Lumbini","Madesh","Sudurpashchim"],
  "Netherlands": [
    "Drenthe","Flevoland","Friesland","Gelderland","Groningen","Limburg","North Brabant","North Holland",
    "Overijssel","South Holland","Utrecht","Zeeland"
  ],
  "New Zealand": [
    "Auckland","Bay of Plenty","Canterbury","Gisborne","Hawke's Bay","Manawatu-Wanganui","Marlborough",
    "Nelson","Northland","Otago","Southland","Taranaki","Tasman","Waikato","Wellington","West Coast"
  ],
  "Nicaragua": [
    "Boaco","Carazo","Chinandega","Chontales","Estelí","Granada","Jinotega","León","Madriz","Managua",
    "Masaya","Matagalpa","Nueva Segovia","Río San Juan","Rivas","Atlántico Norte","Atlántico Sur"
  ],
  "Niger": ["Agadez","Diffa","Dosso","Maradi","Niamey","Tahoua","Tillabéri","Zinder"],
  "Nigeria": [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
    "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi",
    "Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
    "Taraba","Yobe","Zamfara"
  ],
  "North Korea": [
    "Chagang","North Hamgyong","South Hamgyong","North Hwanghae","South Hwanghae","Kangwon",
    "North Pyongan","South Pyongan","Ryanggang","Pyongyang","Rason"
  ],
  "North Macedonia": ["Eastern","Northeastern","Pelagonia","Polog","Skopje","Southeastern","Southwestern","Vardar"],
  "Norway": [
    "Agder","Innlandet","Møre og Romsdal","Nordland","Oslo","Rogaland","Troms og Finnmark","Trøndelag",
    "Vestfold og Telemark","Vestland","Viken"
  ],
  "Oman": [
    "Ad Dakhiliyah","Al Batinah North","Al Batinah South","Al Buraimi","Al Wusta","Ash Sharqiyah North",
    "Ash Sharqiyah South","Ad Dhahirah","Muscat","Musandam","Dhofar"
  ],
  "Pakistan": [
    "Azad Jammu and Kashmir","Balochistan","Gilgit-Baltistan","Islamabad Capital Territory",
    "Khyber Pakhtunkhwa","Punjab","Sindh"
  ],
  "Palau": [
    "Aimeliik","Airai","Angaur","Hatohobei","Kayangel","Koror","Melekeok","Ngaraard","Ngarchelong",
    "Ngardmau","Ngatpang","Ngchesar","Ngeremlengui","Ngiwal","Peleliu","Sonsorol"
  ],
  "Palestine": [
    "Bethlehem","Deir al-Balah","Gaza","Hebron","Jenin","Jericho","Jerusalem","Khan Yunis","Nablus",
    "North Gaza","Qalqilya","Rafah","Ramallah and al-Bireh","Salfit","Tubas","Tulkarm"
  ],
  "Panama": [
    "Bocas del Toro","Chiriquí","Coclé","Colón","Darién","Herrera","Los Santos","Panamá","Panamá Oeste",
    "Veraguas","Emberá-Wounaan","Guna Yala","Ngäbe-Buglé"
  ],
  "Papua New Guinea": [
    "Bougainville","Central","Chimbu","Eastern Highlands","East New Britain","East Sepik","Enga","Gulf",
    "Hela","Jiwaka","Madang","Manus","Milne Bay","Morobe","National Capital District","New Ireland",
    "Northern","Southern Highlands","West New Britain","Sandaun","Western","Western Highlands"
  ],
  "Paraguay": [
    "Alto Paraguay","Alto Paraná","Amambay","Boquerón","Caaguazú","Caazapá","Canindeyú","Central",
    "Concepción","Cordillera","Guairá","Itapúa","Misiones","Ñeembucú","Paraguarí","Presidente Hayes",
    "San Pedro","Asunción"
  ],
  "Peru": [
    "Amazonas","Áncash","Apurímac","Arequipa","Ayacucho","Cajamarca","Callao","Cusco","Huancavelica",
    "Huánuco","Ica","Junín","La Libertad","Lambayeque","Lima","Loreto","Madre de Dios","Moquegua",
    "Pasco","Piura","Puno","San Martín","Tacna","Tumbes","Ucayali"
  ],
  "Philippines": [
    "Ilocos","Cagayan Valley","Central Luzon","Calabarzon","Mimaropa","Bicol","Western Visayas",
    "Central Visayas","Eastern Visayas","Zamboanga Peninsula","Northern Mindanao","Davao","Soccsksargen",
    "Caraga","Bangsamoro","Cordillera","National Capital Region"
  ],
  "Poland": [
    "Greater Poland","Kuyavian-Pomeranian","Lesser Poland","Łódź","Lower Silesian","Lublin","Lubusz",
    "Masovian","Opole","Podkarpackie","Podlaskie","Pomeranian","Silesian","Świętokrzyskie",
    "Warmian-Masurian","West Pomeranian"
  ],
  "Portugal": [
    "Aveiro","Beja","Braga","Bragança","Castelo Branco","Coimbra","Évora","Faro","Guarda","Leiria",
    "Lisbon","Portalegre","Porto","Santarém","Setúbal","Viana do Castelo","Vila Real","Viseu","Azores","Madeira"
  ],
  "Qatar": ["Al Daayen","Al Khor","Al Rayyan","Al Shamal","Al Wakrah","Doha","Shahaniya","Umm Salal"],
  "Romania": [
    "Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București",
    "Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu",
    "Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt",
    "Prahova","Sălaj","Satu Mare","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea"
  ],
  "Russia": [
    "Moscow","Saint Petersburg","Adygea","Altai Krai","Altai Republic","Amur","Arkhangelsk","Astrakhan",
    "Bashkortostan","Belgorod","Bryansk","Buryatia","Chechnya","Chelyabinsk","Chukotka","Chuvashia",
    "Crimea","Dagestan","Ingushetia","Irkutsk","Ivanovo","Jewish Autonomous Oblast","Kabardino-Balkaria",
    "Kaliningrad","Kalmykia","Kaluga","Kamchatka","Karachay-Cherkessia","Karelia","Kemerovo","Khabarovsk",
    "Khakassia","Khanty-Mansi","Kirov","Komi","Kostroma","Krasnodar","Krasnoyarsk","Kurgan","Kursk",
    "Leningrad Oblast","Lipetsk","Magadan","Mari El","Mordovia","Murmansk","Nenets","Nizhny Novgorod",
    "North Ossetia-Alania","Novgorod","Novosibirsk","Omsk","Orenburg","Oryol","Penza","Perm","Primorsky",
    "Pskov","Rostov","Ryazan","Sakha","Sakhalin","Samara","Saratov","Sevastopol","Smolensk","Stavropol",
    "Sverdlovsk","Tambov","Tatarstan","Tomsk","Tula","Tuva","Tver","Tyumen","Udmurtia","Ulyanovsk",
    "Vladimir","Volgograd","Vologda","Voronezh","Yamalo-Nenets","Yaroslavl","Zabaykalsky"
  ],
  "Rwanda": ["Eastern","Kigali","Northern","Southern","Western"],
  "Saint Kitts and Nevis": [
    "Christ Church Nichola Town","Saint Anne Sandy Point","Saint George Basseterre","Saint George Gingerland",
    "Saint James Windward","Saint John Capisterre","Saint John Figtree","Saint Mary Cayon",
    "Saint Paul Capisterre","Saint Paul Charlestown","Saint Peter Basseterre","Saint Thomas Lowland",
    "Saint Thomas Middle Island","Trinity Palmetto Point"
  ],
  "Saint Lucia": ["Anse la Raye","Canaries","Castries","Choiseul","Dennery","Gros Islet","Laborie","Micoud","Soufrière","Vieux Fort"],
  "Saint Vincent and the Grenadines": ["Charlotte","Grenadines","Saint Andrew","Saint David","Saint George","Saint Patrick"],
  "Samoa": [
    "A'ana","Aiga-i-le-Tai","Atua","Fa'asaleleaga","Gaga'emauga","Gagaifomauga","Palauli","Satupa'itea",
    "Tuamasaga","Va'a-o-Fonoti","Vaisigano"
  ],
  "San Marino": ["Acquaviva","Borgo Maggiore","Chiesanuova","Domagnano","Faetano","Fiorentino","Montegiardino","San Marino Città","Serravalle"],
  "Sao Tome and Principe": ["Água Grande","Cantagalo","Caué","Lembá","Lobata","Mé-Zóchi","Príncipe"],
  "Saudi Arabia": [
    "Asir","Bahah","Eastern Province","Ha'il","Jizan","Madinah","Makkah","Najran","Northern Borders",
    "Qassim","Riyadh","Tabuk","Jawf"
  ],
  "Senegal": [
    "Dakar","Diourbel","Fatick","Kaffrine","Kaolack","Kédougou","Kolda","Louga","Matam","Saint-Louis",
    "Sédhiou","Tambacounda","Thiès","Ziguinchor"
  ],
  "Serbia": [
    "Belgrade","Bor","Braničevo","Central Banat","Jablanica","Kolubara","Mačva","Moravica","Nišava",
    "North Bačka","North Banat","Pčinja","Pirot","Podunavlje","Pomoravlje","Rasina","Raška","South Bačka",
    "South Banat","Srem","Šumadija","Toplica","West Bačka","Zaječar","Zlatibor"
  ],
  "Seychelles": [
    "Anse Boileau","Anse Etoile","Anse Royale","Au Cap","Baie Lazare","Baie Sainte Anne","Beau Vallon",
    "Bel Air","Bel Ombre","Cascade","Glacis","Grand Anse Mahe","Grand Anse Praslin","La Digue",
    "La Riviere Anglaise","Les Mamelles","Mont Buxton","Mont Fleuri","Plaisance","Pointe La Rue",
    "Port Glaud","Roche Caiman","Saint Louis","Takamaka"
  ],
  "Sierra Leone": ["Eastern","Northern","North West","Southern","Western Area"],
  "Singapore": ["Central Region","East Region","North Region","North-East Region","West Region"],
  "Slovakia": ["Banská Bystrica","Bratislava","Košice","Nitra","Prešov","Trenčín","Trnava","Žilina"],
  "Slovenia": [
    "Central Slovenia","Coastal-Karst","Drava","Carinthia","Gorizia","Lower Sava","Mura","Savinja",
    "Southeast Slovenia","Central Sava","Upper Carniola","Littoral-Inner Carniola"
  ],
  "Solomon Islands": ["Central","Choiseul","Guadalcanal","Honiara","Isabel","Makira-Ulawa","Malaita","Rennell and Bellona","Temotu","Western"],
  "Somalia": [
    "Awdal","Bakool","Banaadir","Bari","Bay","Galguduud","Gedo","Hiran","Lower Juba","Lower Shabelle",
    "Middle Juba","Middle Shabelle","Mudug","Nugal","Sanaag","Sool","Togdheer","Woqooyi Galbeed"
  ],
  "South Africa": [
    "Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape",
    "North West","Western Cape"
  ],
  "South Korea": [
    "Busan","Chungcheongbuk-do","Chungcheongnam-do","Daegu","Daejeon","Gangwon-do","Gwangju",
    "Gyeonggi-do","Gyeongsangbuk-do","Gyeongsangnam-do","Incheon","Jeju","Jeollabuk-do","Jeollanam-do",
    "Sejong","Seoul","Ulsan"
  ],
  "South Sudan": [
    "Central Equatoria","Eastern Equatoria","Jonglei","Lakes","Northern Bahr el Ghazal","Unity",
    "Upper Nile","Warrap","Western Bahr el Ghazal","Western Equatoria"
  ],
  "Spain": [
    "Andalusia","Aragon","Asturias","Balearic Islands","Basque Country","Canary Islands","Cantabria",
    "Castile and León","Castile-La Mancha","Catalonia","Extremadura","Galicia","La Rioja","Madrid",
    "Murcia","Navarre","Valencian Community","Ceuta","Melilla"
  ],
  "Sri Lanka": ["Central","Eastern","North Central","Northern","North Western","Sabaragamuwa","Southern","Uva","Western"],
  "Sudan": [
    "Al Jazirah","Blue Nile","Central Darfur","East Darfur","Kassala","Khartoum","North Darfur",
    "North Kordofan","Northern","Red Sea","River Nile","Sennar","South Darfur","South Kordofan",
    "West Darfur","West Kordofan","White Nile"
  ],
  "Suriname": ["Brokopondo","Commewijne","Coronie","Marowijne","Nickerie","Para","Paramaribo","Saramacca","Sipaliwini","Wanica"],
  "Sweden": [
    "Blekinge","Dalarna","Gävleborg","Gotland","Halland","Jämtland","Jönköping","Kalmar","Kronoberg",
    "Norrbotten","Örebro","Östergötland","Skåne","Södermanland","Stockholm","Uppsala","Värmland",
    "Västerbotten","Västernorrland","Västmanland","Västra Götaland"
  ],
  "Switzerland": [
    "Aargau","Appenzell Ausserrhoden","Appenzell Innerrhoden","Basel-Landschaft","Basel-Stadt","Bern",
    "Fribourg","Geneva","Glarus","Graubünden","Jura","Lucerne","Neuchâtel","Nidwalden","Obwalden",
    "Schaffhausen","Schwyz","Solothurn","St. Gallen","Thurgau","Ticino","Uri","Valais","Vaud","Zug","Zürich"
  ],
  "Syria": [
    "Aleppo","Damascus","Daraa","Deir ez-Zor","Hama","Al-Hasakah","Homs","Idlib","Latakia","Quneitra",
    "Raqqa","Rif Dimashq","As-Suwayda","Tartus"
  ],
  "Taiwan": [
    "Changhua","Chiayi City","Chiayi County","Hsinchu City","Hsinchu County","Hualien","Kaohsiung",
    "Keelung","Kinmen","Lienchiang","Miaoli","Nantou","New Taipei","Penghu","Pingtung","Taichung",
    "Tainan","Taipei","Taitung","Taoyuan","Yilan","Yunlin"
  ],
  "Tajikistan": ["Dushanbe","Gorno-Badakhshan","Khatlon","Sughd","Districts of Republican Subordination"],
  "Tanzania": [
    "Arusha","Dar es Salaam","Dodoma","Geita","Iringa","Kagera","Katavi","Kigoma","Kilimanjaro","Lindi",
    "Manyara","Mara","Mbeya","Morogoro","Mtwara","Mwanza","Njombe","Pemba North","Pemba South","Pwani",
    "Rukwa","Ruvuma","Shinyanga","Simiyu","Singida","Songwe","Tabora","Tanga","Zanzibar North",
    "Zanzibar South","Zanzibar Urban/West"
  ],
  "Thailand": [
    "Bangkok","Chiang Mai","Chiang Rai","Chonburi","Krabi","Nakhon Ratchasima","Nonthaburi","Pathum Thani",
    "Phuket","Songkhla","Surat Thani","Udon Thani"
  ],
  "Timor-Leste": ["Aileu","Ainaro","Baucau","Bobonaro","Cova Lima","Dili","Ermera","Lautém","Liquiçá","Manatuto","Manufahi","Oecusse","Viqueque"],
  "Togo": ["Centrale","Kara","Maritime","Plateaux","Savanes"],
  "Tonga": ["Ha'apai","Tongatapu","Vava'u","Eua","Niuas"],
  "Trinidad and Tobago": [
    "Couva-Tabaquite-Talparo","Diego Martin","Eastern Tobago","Penal-Debe","Point Fortin","Port of Spain",
    "Princes Town","San Fernando","San Juan-Laventille","Sangre Grande","Siparia","Tunapuna-Piarco",
    "Western Tobago","Arima","Chaguanas"
  ],
  "Tunisia": [
    "Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kébili",
    "Kef","Mahdia","Manouba","Medenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse",
    "Tataouine","Tozeur","Tunis","Zaghouan"
  ],
  "Turkey": [
    "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin","Aydın","Balıkesir",
    "Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli",
    "Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane",
    "Hakkâri","Hatay","Isparta","Mersin","İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli",
    "Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş",
    "Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Tekirdağ","Tokat",
    "Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak","Aksaray","Bayburt","Karaman",
    "Kırıkkale","Batman","Şırnak","Bartın","Ardahan","Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
  ],
  "Turkmenistan": ["Ahal","Balkan","Dashoguz","Lebap","Mary","Ashgabat"],
  "Uganda": ["Central","Eastern","Northern","Western"],
  "Ukraine": [
    "Cherkasy","Chernihiv","Chernivtsi","Crimea","Dnipropetrovsk","Donetsk","Ivano-Frankivsk","Kharkiv",
    "Kherson","Khmelnytskyi","Kirovohrad","Kyiv","Kyiv City","Luhansk","Lviv","Mykolaiv","Odesa",
    "Poltava","Rivne","Sumy","Ternopil","Vinnytsia","Volyn","Zakarpattia","Zaporizhzhia","Zhytomyr"
  ],
  "United Arab Emirates": ["Abu Dhabi","Ajman","Dubai","Fujairah","Ras Al Khaimah","Sharjah","Umm Al Quwain"],
  "United Kingdom": ["England","Northern Ireland","Scotland","Wales"],
  "United States": [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida",
    "Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
    "Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska",
    "Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
    "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee",
    "Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"
  ],
  "Uruguay": [
    "Artigas","Canelones","Cerro Largo","Colonia","Durazno","Flores","Florida","Lavalleja","Maldonado",
    "Montevideo","Paysandú","Río Negro","Rivera","Rocha","Salto","San José","Soriano","Tacuarembó","Treinta y Tres"
  ],
  "Uzbekistan": [
    "Andijan","Bukhara","Fergana","Jizzakh","Karakalpakstan","Kashkadarya","Namangan","Navoiy",
    "Samarkand","Sirdaryo","Surkhandarya","Tashkent Region","Tashkent City","Khorezm"
  ],
  "Vanuatu": ["Malampa","Penama","Sanma","Shefa","Tafea","Torba"],
  "Venezuela": [
    "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo","Cojedes","Delta Amacuro",
    "Distrito Capital","Falcón","Guárico","Lara","Mérida","Miranda","Monagas","Nueva Esparta",
    "Portuguesa","Sucre","Táchira","Trujillo","La Guaira","Yaracuy","Zulia"
  ],
  "Vietnam": [
    "An Giang","Bà Rịa-Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh","Bến Tre","Bình Định",
    "Bình Dương","Bình Phước","Bình Thuận","Cà Mau","Cần Thơ","Cao Bằng","Đà Nẵng","Đắk Lắk","Đắk Nông",
    "Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương",
    "Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng",
    "Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên",
    "Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh",
    "Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang","TP Hồ Chí Minh","Trà Vinh",
    "Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
  ],
  "Yemen": [
    "Abyan","Aden","Al Bayda","Al Dhale'e","Al Hudaydah","Al Jawf","Al Mahrah","Al Mahwit",
    "Amanat Al Asimah","Amran","Dhamar","Hadhramaut","Hajjah","Ibb","Lahij","Marib","Raymah","Saada",
    "Sana'a","Shabwah","Socotra","Taiz"
  ],
  "Zambia": ["Central","Copperbelt","Eastern","Luapula","Lusaka","Muchinga","Northern","North-Western","Southern","Western"],
  "Zimbabwe": [
    "Bulawayo","Harare","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West",
    "Masvingo","Matabeleland North","Matabeleland South","Midlands"
  ],
};


const CUSTOMER_TYPES = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
];

const DOC_TYPES = [
  { value: "aadhar_card", label: "Aadhaar Card" },
  { value: "pan_card", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
];
const DOC_LABELS = Object.fromEntries(DOC_TYPES.map(d => [d.value, d.label]));

/* ─── Searchable Country Code Dropdown (Smart Aliases + Code Search) ── */
// function CountryCodeDropdown({ value, onChange, error }) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const wrapRef = useRef(null);
//   const searchRef = useRef(null);

//   const active = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES.find(c => c.code === "91");

//   useEffect(() => {
//     const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", onClick);
//     return () => document.removeEventListener("mousedown", onClick);
//   }, []);

//   useEffect(() => {
//     if (open) {
//       setSearch("");
//       setTimeout(() => searchRef.current?.focus(), 30);
//     }
//   }, [open]);

//   const q = search.trim().toLowerCase();
//   const filtered = COUNTRY_CODES.filter(c => {
//     if (!q) return true;
//     const matchCountry = c.country.toLowerCase().includes(q);
//     const matchCode = c.code.includes(q);
//     const matchAlias = c.aliases ? c.aliases.some(a => a.toLowerCase().includes(q)) : false;
//     return matchCountry || matchCode || matchAlias;
//   });

//   return (
//     <div ref={wrapRef} style={{ position: "relative" }}>
//       <button
//         type="button"
//         onClick={() => setOpen(o => !o)}
//         style={{
//           ...inpStyle,
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           cursor: "pointer", borderColor: error ? T.red : (open ? "#2563eb" : T.border),
//           boxShadow: open ? `0 0 0 3px rgba(37,99,235,0.14)` : "none",
//         }}
//       >
//         <span style={{ fontWeight: 500, fontSize: 13.5 }}>+{active.code} {active.country}</span>
//         <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
//       </button>

//       {open && (
//         <div style={{
//           position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 60,
//           background: "#ffffff", border: `1px solid ${T.border}`, borderRadius: 12,
//           boxShadow: "0 16px 36px rgba(17,24,39,0.12)", overflow: "hidden",
//         }}>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
//             borderBottom: `1px solid ${T.border}`, background: "#f9fafb"
//           }}>
//             <Search size={14} color="#9ca3af" />
//             <input
//               ref={searchRef}
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search country (e.g. America, UK, 91)..."
//               style={{ border: "none", outline: "none", fontSize: 13, width: "100%", color: T.text, background: "transparent" }}
//             />
//           </div>
//           <div style={{ maxHeight: 230, overflowY: "auto", padding: 6 }}>
//             {filtered.length === 0 && (
//               <div style={{ padding: "14px 10px", fontSize: 12.5, color: "#9ca3af", textAlign: "center" }}>
//                 No matches found
//               </div>
//             )}
//             {filtered.map(c => {
//               const isActive = c.code === value && c.country === active.country;
//               return (
//                 <button
//                   type="button"
//                   key={`${c.code}-${c.country}`}
//                   onClick={() => { onChange(c.code); setOpen(false); }}
//                   style={{
//                     width: "100%", display: "flex", alignItems: "center", gap: 10,
//                     padding: "9px 12px", borderRadius: 8, border: "none", textAlign: "left",
//                     cursor: "pointer", background: isActive ? "#eff6ff" : "transparent",
//                     transition: "all .12s",
//                   }}
//                   onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
//                   onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
//                 >
//                   <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2563eb", width: 46, flexShrink: 0 }}>
//                     +{c.code}
//                   </span>
//                   <span style={{ fontSize: 13.5, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                     {c.country}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




function CountryCodeDropdown({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const active = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES.find(c => c.code === "91");

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open]);

  const q = search.trim().toLowerCase();
  const filtered = COUNTRY_CODES.filter(c => {
    if (!q) return true;
    const matchCountry = c.country.toLowerCase().includes(q);
    const matchCode = c.code.includes(q);
    const matchAlias = c.aliases ? c.aliases.some(a => a.toLowerCase().includes(q)) : false;
    return matchCountry || matchCode || matchAlias;
  });

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={`+${active.code} ${active.country}`}
        style={{
          ...inpStyle,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
          cursor: "pointer", borderColor: error ? T.red : (open ? "#2563eb" : T.border),
          boxShadow: open ? `0 0 0 3px rgba(37,99,235,0.14)` : "none",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap" }}>+{active.code}</span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 60,
          width: 300, maxWidth: "calc(100vw - 48px)",
          background: "#ffffff", border: `1px solid ${T.border}`, borderRadius: 12,
          boxShadow: "0 16px 36px rgba(17,24,39,0.12)", overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
            borderBottom: `1px solid ${T.border}`, background: "#f9fafb"
          }}>
            <Search size={14} color="#9ca3af" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code..."
              style={{ border: "none", outline: "none", fontSize: 13, width: "100%", minWidth: 0, color: T.text, background: "transparent" }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "14px 10px", fontSize: 12.5, color: "#9ca3af", textAlign: "center" }}>
                No matches found
              </div>
            )}
            {filtered.map(c => {
              const isActive = c.code === value && c.country === active.country;
              return (
                <button
                  type="button"
                  key={`${c.code}-${c.country}`}
                  onClick={() => { onChange(c.code); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8, border: "none", textAlign: "left",
                    cursor: "pointer", background: isActive ? "#eff6ff" : "transparent",
                    transition: "all .12s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2563eb", width: 50, flexShrink: 0 }}>
                    +{c.code}
                  </span>
                  <span style={{ fontSize: 13.5, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.country}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── File Capture Dropzone Component (Blue Accent) ─────────────── */
/* ─── Document Upload Modal (Take Photo / Upload File choice) ──── */
function DocumentUploadModal({ visible, label, onTakePhoto, onUploadClick, onClose }) {
  if (!visible) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes docModalBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes docModalBoxIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .doc-modal-backdrop { animation: docModalBackdropIn 0.18s ease forwards; }
        .doc-modal-box { animation: docModalBoxIn 0.25s cubic-bezier(0.34,1.36,0.64,1) forwards; }
        .doc-option-btn {
          transition: border-color 0.15s, background 0.15s, transform 0.12s;
        }
        .doc-option-btn:hover {
          border-color: #2563eb !important;
          background: #f0f7ff !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div
        className="doc-modal-backdrop"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9997,
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        }}
      />

      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, pointerEvents: "none",
      }}>
        <div
          className="doc-modal-box"
          style={{
            pointerEvents: "all", background: "#ffffff", borderRadius: 20,
            boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
            padding: "28px 26px 24px", width: 380, maxWidth: "calc(100vw - 32px)",
            fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              {label || "Add Document"}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none",
                background: "#f3f4f6", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", color: "#6b7280",
              }}
            >
              <X size={15} />
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "#8A93A6", marginBottom: 20 }}>
            Choose how you'd like to add this document
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="doc-option-btn"
              onClick={onTakePhoto}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "22px 12px", borderRadius: 14, border: "1.5px solid #e5e7eb",
                background: "#fafbfc", cursor: "pointer",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", background: "#eff6ff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={20} color="#2563eb" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Take Photo</span>
              <span style={{ fontSize: 10.5, color: "#9ca3af", textAlign: "center", lineHeight: 1.3 }}>
                Use your camera
              </span>
            </button>

            <button
              type="button"
              className="doc-option-btn"
              onClick={onUploadClick}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "22px 12px", borderRadius: 14, border: "1.5px solid #e5e7eb",
                background: "#fafbfc", cursor: "pointer",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", background: "#eff6ff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Upload size={20} color="#2563eb" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Upload File</span>
              <span style={{ fontSize: 10.5, color: "#9ca3af", textAlign: "center", lineHeight: 1.3 }}>
                PNG, JPG or PDF
              </span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}


/* ─── Camera problem → friendly message ─────────────────────────── */
function getCameraIssue(err) {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      title: "Camera not available",
      msg: "Your device or browser doesn't support camera access here. Please upload a photo or file instead.",
    };
  }
  switch (err?.name) {
    case "NotFoundError":
    case "DevicesNotFoundError":
      return {
        title: "No camera found",
        msg: "To take a photo you need a camera on this device. You can upload an existing photo or file instead.",
      };
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return {
        title: "Camera access blocked",
        msg: "Please allow camera permission in your browser settings and try again, or upload a file instead.",
      };
    case "NotReadableError":
    case "TrackStartError":
      return {
        title: "Camera is busy",
        msg: "Another app is using your camera. Close it and try again, or upload a file instead.",
      };
    default:
      return {
        title: "Couldn't open the camera",
        msg: "Something went wrong while opening the camera. Please try again or upload a file instead.",
      };
  }
}

function CameraWarningModal({ issue, onClose, onUpload }) {
  if (!issue) return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: 380, maxWidth: "100%",
          padding: "26px 24px 20px", textAlign: "center",
          boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <div style={{
          width: 54, height: 54, borderRadius: "50%", background: "#fff7ed",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>
          <Camera size={24} color="#ea580c" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
          {issue.title}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55, marginBottom: 20 }}>
          {issue.msg}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
              background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onUpload}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb",
              background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Upload size={14} /> Upload File instead
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


/* ─── File Capture — click opens a choice modal (no default dropzone) ── */
export function FileCapture({ label, required, error, value, onChange, accept = "image/*,.pdf", hint = "PNG, JPG or PDF (max. 5MB)" }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
const [camIssue, setCamIssue] = useState(null);
  const isImage = !!(value && value.type && value.type.startsWith("image/"));
const fileName = value?.name || "";
const fileSize = value?.size ? `${(value.size / 1024).toFixed(0)} KB` : "";
const isPdf = !!(value && (value.type === "application/pdf" || value.name?.toLowerCase().endsWith(".pdf")));

useEffect(() => {
  if (value && (isImage || isPdf)) {
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }
  setPreviewUrl(null);
}, [value, isImage, isPdf]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

const startCamera = async () => {
  setModalOpen(false);
  if (!navigator.mediaDevices?.getUserMedia) {
    setCamIssue(getCameraIssue(null));
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    streamRef.current = stream;
    setCameraOn(true);
    setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 30);
  } catch (err) {
    setCamIssue(getCameraIssue(err));
  }
};
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  // const capture = () => {
  //   const video = videoRef.current;
  //   if (!video) return;
  //   const canvas = document.createElement("canvas");
  //   canvas.width = video.videoWidth || 640;
  //   canvas.height = video.videoHeight || 480;
  //   canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  //   // canvas.toBlob((blob) => {
  //   //   if (!blob) return;
  //   //   onChange(new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
  //   //   stopCamera();
  //   // }, "image/jpeg", 0.92);


  //       canvas.toBlob((blob) => {
  //     if (!blob) return;
  //     handleIncoming(new File([blob], `profile-${Date.now()}.jpg`, { type: "image/jpeg" }));
  //     stopCamera();
  //   }, "image/jpeg", 0.92);
  // };

    const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const f = await compressImage(
        new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }),
        { maxBytes: 500 * 1024, maxDim: 1600 }
      );
      onChange(f);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const handleFiles = async (files) => {
    const f = files?.[0];
    if (!f) return;
    onChange(await compressImage(f, { maxBytes: 500 * 1024, maxDim: 1600 }));
  };

  // const handleFiles = (files) => {
  //   const f = files?.[0];
  //   if (f) onChange(f);
  // };

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          {label} {required && <span style={{ color: T.red }}>*</span>}
        </label>
      )}

      {value ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          border: `1px solid ${T.border}`, borderRadius: 12, background: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          width: "100%", boxSizing: "border-box", minWidth: 0, overflow: "hidden",
        }}>
          {/* thumbnail */}
          <div
            onClick={() => setPreviewOpen(true)}
            title="Click to preview"
            style={{ cursor: "pointer", flexShrink: 0 }}
          >
            {previewUrl && isImage ? (
              <img src={previewUrl} alt={fileName} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color="#2563eb" />
              </div>
            )}
          </div>

          {/* name + info */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setPreviewOpen(true)}>
            <div
              title={fileName}
              style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {fileName}
            </div>
            <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileSize} · <span style={{ color: "#2563eb", fontWeight: 600 }}>Click to preview</span>
            </div>
          </div>

          {/* action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <IconBtn title="Preview" onClick={() => setPreviewOpen(true)}><Eye size={15} color="#2563eb" /></IconBtn>
            <IconBtn title="Replace" onClick={() => fileRef.current?.click()}><RefreshCw size={15} color="#6b7280" /></IconBtn>
            <IconBtn title="Remove" onClick={() => onChange(null)}><X size={15} color={T.red} /></IconBtn>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setModalOpen(true)}
          style={{
            border: `1.5px dashed ${error ? T.red : "#d1d5db"}`,
            borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer",
            background: "#ffffff", transition: "all .18s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Upload size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Click to add document</div>
          <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>{hint}</div>
        </div>
      )}

      {/* Hidden native file input — triggered only from the modal */}
      <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />

      {error && <div style={{ fontSize: 11.5, color: T.red, marginTop: 4, fontWeight: 500 }}>{error}</div>}

      <DocumentUploadModal
        visible={modalOpen}
        label={label}
        onTakePhoto={startCamera}
        onUploadClick={() => { setModalOpen(false); fileRef.current?.click(); }}
        onClose={() => setModalOpen(false)}
      />

      <CameraWarningModal
  issue={camIssue}
  onClose={() => setCamIssue(null)}
  onUpload={() => { setCamIssue(null); fileRef.current?.click(); }}
/>
{previewOpen && previewUrl && createPortal(
  <div
    onClick={() => setPreviewOpen(false)}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#fff", borderRadius: 16, width: 900, maxWidth: "100%",
        maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
          {fileName}
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen(false)}
          style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <X size={16} color="#6b7280" />
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        {isImage ? (
          <img src={previewUrl} alt={fileName} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
        ) : isPdf ? (
         <iframe
  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
  title={fileName}
  style={{ width: "100%", height: "80vh", border: "none", background: "#fff" }}
/>
        ) : (
          <div style={{ padding: 40, fontSize: 13, color: "#6b7280" }}>Preview not available for this file type.</div>
        )}
      </div>
    </div>
  </div>,
  document.body
)}
      {cameraOn && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.65)", backdropFilter: "blur(4px)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 20, width: 380, maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#111827" }}>{label || "Capture Photo"}</div>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 10, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <Btn variant="ghost" size="sm" onClick={stopCamera}>Cancel</Btn>
              <Btn size="sm" onClick={capture}>Capture</Btn>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Profile Photo Capture (Entire Circle Clickable & Smooth Rounding) ── */

/* ─── Image compression (client-side, canvas) ────────────────────── */
export const MAX_INPUT_BYTES = 10 * 1024 * 1024; // user can pick up to 10 MB

// export async function compressImage(file, { maxBytes = 300 * 1024, maxDim = 800 } = {}) {
//   if (!file || !file.type?.startsWith("image/")) return file;
//   if (file.size <= maxBytes) return file;

//   let bitmap;
//   try { bitmap = await createImageBitmap(file); } catch { return file; }

//   let scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
//   let quality = 0.8;
//   let blob = null;

//   for (let i = 0; i < 20; i++) {
//     const canvas = document.createElement("canvas");
//     canvas.width = Math.max(1, Math.round(bitmap.width * scale));
//     canvas.height = Math.max(1, Math.round(bitmap.height * scale));
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
//     blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));
//     if (blob && blob.size <= maxBytes) break;
//     if (quality > 0.5) quality -= 0.1; else scale *= 0.85;
//   }
//   bitmap.close?.();
//   if (!blob) return file;
//   const base = file.name.replace(/\.[^.]+$/, "") || "photo";
//   return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
// }



export async function compressImage(file, { maxBytes = 300 * 1024, maxDim = 800 } = {}) {
  const kb = (n) => (n / 1024).toFixed(0) + " KB";
  console.log("🟡 [compress] START", { name: file?.name, type: file?.type, size: kb(file?.size || 0), limit: kb(maxBytes) });

  if (!file || !file.type?.startsWith("image/")) {
    console.log("⚪ [compress] SKIP: not an image, sending as is");
    return file;
  }
  if (file.size <= maxBytes) {
    console.log("⚪ [compress] SKIP: already under limit");
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    console.error("🔴 [compress] FAILED to decode image (HEIC/unsupported?), sending ORIGINAL", err);
    return file;
  }
  console.log("🖼️ [compress] original dimensions:", bitmap.width + "x" + bitmap.height);

  let scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  let quality = 0.8;
  let blob = null;

  for (let i = 0; i < 20; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));
    console.log(`🔁 [compress] try ${i + 1}: ${canvas.width}x${canvas.height} q=${quality.toFixed(1)} → ${kb(blob?.size || 0)}`);
    if (blob && blob.size <= maxBytes) break;
    if (quality > 0.5) quality -= 0.1; else scale *= 0.85;
  }
  bitmap.close?.();

  if (!blob) {
    console.error("🔴 [compress] no blob produced, sending ORIGINAL");
    return file;
  }
  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  const out = new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  console.log(`✅ [compress] DONE: ${kb(file.size)} → ${kb(out.size)}`);
  return out;
}

export function AvatarCapture({ value, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [cameraOn, setCameraOn] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [sizeError, setSizeError] = useState("");
const [camIssue, setCamIssue] = useState(null);

    const handleIncoming = async (file) => {
    if (!file) return;
    setSizeError("");
    if (!file.type.startsWith("image/")) {
      setSizeError("Please select an image file");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setSizeError("Image is too large. Max 10 MB allowed.");
      return;
    }
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } finally {
      setBusy(false);
    }
  };


  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const reposition = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const menuWidth = 160;
      let left = rect.left;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      let top = rect.bottom + 8;
      const menuHeight = 100;
      if (top + menuHeight > window.innerHeight) top = rect.top - menuHeight - 8;
      setMenuPos({ top, left });
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [menuOpen]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

const startCamera = async () => {
  setMenuOpen(false);
  if (!navigator.mediaDevices?.getUserMedia) {
    setCamIssue(getCameraIssue(null));
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    streamRef.current = stream;
    setCameraOn(true);
    setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 30);
  } catch (err) {
    setCamIssue(getCameraIssue(err));
  }
};
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
    canvas.toBlob((blob) => {
      if (!blob) return;
      handleIncoming(new File([blob], `profile-${Date.now()}.jpg`, { type: "image/jpeg" }));
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const menuItemStyle = {
    display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
    fontSize: 13, fontWeight: 500, color: T.text, background: "transparent",
    border: "none", cursor: "pointer", transition: "background 0.12s"
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* Entire avatar circle is clickable to open dropdown */}
      <div
        ref={wrapRef}
        onClick={() => setMenuOpen(o => !o)}
        style={{
          position: "relative", width: 68, height: 68, flexShrink: 0,
          cursor: "pointer", userSelect: "none"
        }}
      >
        <div style={{
          width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
          border: `2px solid #2563eb`, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#ffffff", boxShadow: "0 2px 8px rgba(37,99,235,0.15)",
          transition: "transform .15s ease",
        }}>
          {previewUrl
            ? <img src={previewUrl} alt="Customer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <UserRound size={28} color="#2563eb" />}
        </div>
        <div
          style={{
            position: "absolute", bottom: -2, right: -2,
            width: 26, height: 26, borderRadius: "50%", background: "#2563eb", border: `2px solid #ffffff`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
          }}
        >
          <Camera size={13} color="#fff" />
        </div>
        {/* <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        /> */}
                <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { handleIncoming(e.target.files?.[0]); e.target.value = ""; }}
        />
      </div>

      <div onClick={() => setMenuOpen(o => !o)} style={{ cursor: "pointer" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Guest Photo</div>
        {/* <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
          Click to upload or take photo
        </div> */}
             <div style={{ fontSize: 12, color: sizeError ? T.red : "#2563eb", fontWeight: 600, marginTop: 2 }}>
          {busy ? "Compressing…" : sizeError || "Click to upload or take photo"}
        </div>
      </div>

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed", top: menuPos.top, left: menuPos.left,
            background: "#ffffff", border: `1px solid ${T.border}`, borderRadius: 12,
            boxShadow: "0 14px 36px rgba(17,24,39,0.16)", overflow: "hidden", width: 160, zIndex: 10000,
          }}
        >
          <button type="button" onClick={startCamera} style={menuItemStyle}> Take photo</button>
          <button type="button" onClick={() => { setMenuOpen(false); fileRef.current?.click(); }} style={menuItemStyle}> Upload photo</button>
          {value && <button type="button" onClick={() => { setMenuOpen(false); onChange(null); }} style={{ ...menuItemStyle, color: T.red }}> Remove</button>}
        </div>,
        document.body
      )}

      {cameraOn && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.65)", backdropFilter: "blur(4px)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 20, width: 360, maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#111827" }}>Guest Photo</div>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 10, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <Btn variant="ghost" size="sm" onClick={stopCamera}>Cancel</Btn>
              <Btn size="sm" onClick={capture}>Capture</Btn>
            </div>
          </div>
        </div>,
        document.body
      )}


      <CameraWarningModal
  issue={camIssue}
  onClose={() => setCamIssue(null)}
  onUpload={() => { setCamIssue(null); fileRef.current?.click(); }}
/>
    </div>
  );
}

/* ─── Blue Toggle Switch ─────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
    >
      <span style={{
        width: 36, height: 20, borderRadius: 999, background: checked ? "#2563eb" : "#d1d5db",
        position: "relative", transition: "background .18s ease", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%",
          background: "#ffffff", transition: "left .18s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
    </button>
  );
}

/* ─── MAIN CREATE CUSTOMER COMPONENT ─────────────────────────────── */
export default function CreateCustomer() {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [includeVisa, setIncludeVisa] = useState(false);
const [includeAdditional, setIncludeAdditional] = useState(false);

  const [form, setForm] = useState({
    name: "", last_name: "", email: "",
    mobile_country_code: "91", mobile: "",
    address: "", state: "", country: "India",
    customer_type: "", // Defaults to empty so placeholder "Select customer type" is shown
    proof_type: "",
    customer_image: null,
    domestic_customer_proof: null,
    passport: null,
    visa: null,
  //     additional_document_name: "",
  // additional_document: null,

  additional_documents: [],
  });

  // const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const set = (key, value) => {
  setForm(f => ({ ...f, [key]: value }));
  setErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
};

  const activeCountry =
    COUNTRY_CODES.find(c => c.code === form.mobile_country_code) || COUNTRY_CODES.find(c => c.code === "91");

  // Dynamic state options for currently selected country
  const stateOptions = (COUNTRY_STATES[form.country] || []).map(s => ({ value: s, label: s }));

  // const handleCountryChange = (countryName) => {
  //   setForm(f => ({
  //     ...f,
  //     country: countryName,
  //     state: "", // Reset state when country changes
  //   }));
  // };

  const handleCountryChange = (countryName) => {
  setForm(f => ({
    ...f,
    country: countryName,
    state: "",
  }));
  setErrors(er => ({ ...er, country: undefined }));
};
  // const handleCustomerTypeChange = (val) => {
  //   setForm(f => ({
  //     ...f,
  //     customer_type: val,
  //     proof_type: "",
  //     domestic_customer_proof: null,
  //     passport: null,
  //     visa: null,
  //   }));
  //   setIncludeVisa(false);
  // };

  const handleCustomerTypeChange = (val) => {
  setForm(f => ({
    ...f,
    customer_type: val,
    proof_type: "",
    domestic_customer_proof: null,
    passport: null,
    visa: null,
  }));
  setIncludeVisa(false);
  setErrors(er => ({ ...er, customer_type: undefined }));
};


  // const validate = () => {
  //   const e = {};
  //   if (!form.name)  e.name  = "Required";
  //   if (!form.email) e.email = "Required";
  //   if (!form.mobile) {
  //     e.mobile = "Required";
  //   } else if (form.mobile.length !== activeCountry.len) {
  //     e.mobile = `Enter a valid ${activeCountry.len}-digit number for ${activeCountry.country}`;
  //   }

  //   if (!form.customer_type) {
  //     e.customer_type = "Select customer type";
  //   } else if (form.customer_type === "domestic") {
  //     if (!form.proof_type) e.proof_type = "Select a document type";
  //     if (!form.domestic_customer_proof) e.domestic_customer_proof = "Required";
  //   } else if (form.customer_type === "international") {
  //     if (!form.passport) e.passport = "Passport is mandatory for international customers";
  //     if (includeVisa && !form.visa) e.visa = "Upload a visa or turn this off";
  //   }

  //   setErrors(e);
  //   return Object.keys(e).length === 0;
  // };





  const FIELD_LABELS = {
  name: "First Name",
  email: "Email Address",
  mobile: "Mobile Number",
  customer_type: "Guest Type",
  proof_type: "Document Type",
  domestic_customer_proof: "Document Upload",
  passport: "Passport",
  visa: "Visa Document",
//   additional_document_name: "Additional Document Name",
// additional_document: "Additional Document",

 additional_docs: "Additional Documents",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = () => {
  const e = {};
  if (!form.name)  e.name  = "Required";
  if (!form.email) {
    e.email = "Required";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    e.email = "Enter a valid email address";
  }
  if (!form.mobile) {
    e.mobile = "Required";
  } else if (form.mobile.length !== activeCountry.len) {
    e.mobile = `Enter a valid ${activeCountry.len}-digit number for ${activeCountry.country}`;
  }

  if (!form.customer_type) {
    e.customer_type = "Select Guest type";
  } else if (form.customer_type === "domestic") {
    if (!form.proof_type) e.proof_type = "Select a document type";
    if (!form.domestic_customer_proof) e.domestic_customer_proof = "Required";
  } else if (form.customer_type === "international") {
    if (!form.passport) e.passport = "Passport is mandatory for international Guest";
    if (includeVisa && !form.visa) e.visa = "Upload a visa or turn this off";
  }

// if (includeAdditional) {
//   if (!form.additional_document_name.trim()) e.additional_document_name = "Enter a document name";
//   if (!form.additional_document) e.additional_document = "Upload the document";
// }


let docToast = null;
if (includeAdditional) {
  const docErrs = {};
  form.additional_documents.forEach((d, i) => {
    const de = {};
    if (!d.name.trim()) {
      de.name = "Enter document name";
      if (!docToast) docToast = `Please enter a name for document ${i + 1}`;
    }
    if (!d.file) {
      de.file = "Upload the file";
      if (!docToast) docToast = `Please upload the file for document ${i + 1}`;
    }
    if (Object.keys(de).length) docErrs[d.id] = de;
  });
  if (Object.keys(docErrs).length) e.additional_docs = docErrs;
}

setErrors(e);

// one toast only: the document message wins if a document is the problem
const missingKeys = Object.keys(e).filter(k => k !== "additional_docs");
if (missingKeys.length > 0) {
  const names = missingKeys.map(k => FIELD_LABELS[k] || k).join(", ");
  push(`Please fill: ${names}`, "error");
} else if (docToast) {
  push(docToast, "error");
}

return Object.keys(e).length === 0;
};

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      fd.append("mobile_country_code", form.mobile_country_code);
      fd.append("mobile", form.mobile);
      fd.append("address", form.address);
      if (form.state) fd.append("state", form.state);
      fd.append("country", form.country);
      fd.append("customer_type", form.customer_type);
      if (form.customer_image) fd.append("customer_image", form.customer_image);

      if (form.customer_type === "domestic") {
        fd.append("proof_type", form.proof_type);
        if (form.domestic_customer_proof) fd.append("domestic_customer_proof", form.domestic_customer_proof);
      } else if (form.customer_type === "international") {
        if (form.passport) fd.append("passport", form.passport);
        if (includeVisa && form.visa) fd.append("visa", form.visa);
      }
if (includeAdditional) {
  form.additional_documents.forEach((d, i) => {
    const n = i + 1; // 1, 2, 3, ...
    fd.append(`additional_document_name_${n}`, d.name.trim());
    if (d.file) fd.append(`additional_document_file_${n}`, d.file);
  });
}
      await api.post("/customers/", fd, { headers: { "Content-Type": "multipart/form-data" } });
            for (const [k, v] of fd.entries()) {
        if (v instanceof File) console.log(`📤 [upload] ${k}: ${v.name} (${(v.size / 1024).toFixed(0)} KB)`);
      }
      push("Customer created!", "success");
      navigate("/customers");
    } catch (err) {
      const msg = getErrorMessage(err, "Could not create Guest");
      push(msg, "error");

      const be = err.response?.data;
      if (be && typeof be === "object" && !be.message) {
        const fe = {};
        Object.keys(be).forEach(k => { fe[k] = Array.isArray(be[k]) ? be[k][0] : be[k]; });
        setErrors(fe);
      }
    } finally { setSaving(false); }
  };

  const formCols = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{
      fontFamily: "'Inter','Segoe UI',Roboto,sans-serif",
      color: T.text, background: "#f8fafc", minHeight: "100vh",
      padding: isMobile ? "16px 12px 40px" : "28px 20px 60px"
    }}>

      {/* ── Top Page Bar (Back button + Icon Badge Header) ── */}
      <div style={{
        maxWidth: 960, margin: "0 auto 20px", display: "flex",
        alignItems: "center", gap: 14
      }}>
        <button
          type="button"
          onClick={() => navigate("/customers")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10, border: `1px solid ${T.border}`,
            background: "#ffffff", color: T.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s ease"
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: "#eff6ff",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb"
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile ? 17 : 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>
              Add New Guest
            </h3>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>
              Fill in the guest details below
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Container Card ── */}
      <div style={{
        maxWidth: 960, margin: "0 auto", background: "#ffffff",
        border: `1px solid ${T.border}`, borderRadius: 18,
        padding: isMobile ? "20px 16px" : "32px 36px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}>

        {/* Top Profile Photo + Customer Type Card */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: 16, padding: "16px 20px", background: "#f8fafc", border: `1px solid #e2e8f0`,
          borderRadius: 14, marginBottom: 28,
        }}>
          <AvatarCapture value={form.customer_image} onChange={(f) => set("customer_image", f)} />
          <div style={{ width: isMobile ? "100%" : 230 }}>
            <Field label="Guest Type" icon={UserCheck} required error={errors.customer_type}>
              <SelectDropdown
                value={form.customer_type}
                options={CUSTOMER_TYPES}
                placeholder="Select guest type"
                onChange={handleCustomerTypeChange}
                error={errors.customer_type}
              />
            </Field>
          </div>
        </div>

        {/* Section 1: Basic Details */}
        <SectionHeader category="" title="Personal Details" icon={UserRound} />
        <div style={{ display: "grid", gridTemplateColumns: formCols, gap: "16px 24px", marginBottom: 28 }}>
          <Field label="First Name" icon={UserRound} required error={errors.name}>
            <input
              style={inpStyle}
              placeholder="Enter First Name"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </Field>

          <Field label="Last Name" icon={UserRound} error={errors.last_name}>
            <input
              style={inpStyle}
              placeholder="Enter Last Name"
              value={form.last_name}
              onChange={e => set("last_name", e.target.value)}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </Field>

<Field label="Email Address" icon={Mail} required error={errors.email}>
  <input
    style={inpStyle}
    placeholder="Enter Email"
    value={form.email}
    onChange={e => set("email", e.target.value)}
    onFocus={e => e.target.style.borderColor = "#2563eb"}
    onBlur={e => {
      e.target.style.borderColor = T.border;
      if (form.email && !EMAIL_REGEX.test(form.email.trim())) {
        setErrors(er => ({ ...er, email: "Enter a valid email address" }));
      }
    }}
  />
</Field>

<Field label="Mobile Number" icon={Phone} required error={errors.mobile || errors.mobile_country_code}>
  <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
    <div style={{ width: 104, flexShrink: 0 }}>
      <CountryCodeDropdown
        value={form.mobile_country_code}
        error={errors.mobile_country_code}
        onChange={(code) => {
          const newCountry = COUNTRY_CODES.find(c => c.code === code);
          set("mobile_country_code", code);
          if (newCountry && form.mobile.length > newCountry.len) {
            set("mobile", form.mobile.slice(0, newCountry.len));
          }
        }}
      />
    </div>
    <input
      style={{ ...inpStyle, flex: 1, minWidth: 0 }}
      value={form.mobile}
      inputMode="numeric"
      maxLength={activeCountry.len}
      placeholder={`${activeCountry.len}-digit number`}
      onChange={e => {
        const v = e.target.value.replace(/\D/g, "");
        if (v.length <= activeCountry.len) set("mobile", v);
      }}
      onFocus={e => e.target.style.borderColor = "#2563eb"}
      onBlur={e => e.target.style.borderColor = T.border}
    />
  </div>
</Field>
        </div>

        {/* Section 2: Address Details */}
        <div style={{ borderTop: `1px solid ${T.border}`, margin: "28px 0 24px" }} />
        <SectionHeader category="" title="Location Details" icon={MapPin} />

        <div style={{ display: "grid", gridTemplateColumns: formCols, gap: "16px 24px", marginBottom: 16 }}>
          <Field label="Country" icon={Globe} error={errors.country}>
            <SelectDropdown
              value={form.country}
              options={COUNTRY_OPTIONS}
              onChange={handleCountryChange}
              searchable
            />
          </Field>

          {/* Dynamic Searchable State Dropdown */}
          <Field label="State / Province" icon={Building2} error={errors.state}>
            <SelectDropdown
              value={form.state}
              options={stateOptions}
              placeholder={stateOptions.length > 0 ? "Select state / province" : "Select or type state"}
              onChange={(v) => set("state", v)}
              searchable
            />
          </Field>
        </div>

        <div style={{ marginBottom: 28 }}>
          <Field label="Address" icon={MapPin} error={errors.address}>
            <textarea
              style={{
                ...inpStyle,
                minHeight: 80,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: "1.5"
              }}
              placeholder="Enter full street address, apartment, city..."
              value={form.address}
              onChange={e => set("address", e.target.value)}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </Field>
        </div>

        {/* Section 3: Verification */}
        {form.customer_type && (
          <>
            <div style={{ borderTop: `1px solid ${T.border}`, margin: "28px 0 24px" }} />
            <SectionHeader category="" title="Documents" icon={ShieldCheck} />

            {form.customer_type === "domestic" ? (
              <div style={{ display: "grid", gridTemplateColumns: formCols, gap: "18px 24px" }}>
                <Field label="Document Type" icon={FileCode} required error={errors.proof_type}>
                  <SelectDropdown
                    value={form.proof_type}
                    options={DOC_TYPES}
                    onChange={(v) => set("proof_type", v)}
                    placeholder="Select document type"
                    error={errors.proof_type}
                  />
                </Field>

                {form.proof_type && (
                  <FileCapture
                    label={`Upload ${DOC_LABELS[form.proof_type]}`}
                    required
                    error={errors.domestic_customer_proof}
                    value={form.domestic_customer_proof}
                    onChange={(f) => set("domestic_customer_proof", f)}
                  />
                )}
              </div>
            ) : (
              /* Stacked Vertically: Passport on top, Visa toggle and Upload underneath */
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <FileCapture
                    label="Upload Passport"
                    required
                    error={errors.passport}
                    value={form.passport}
                    onChange={(f) => set("passport", f)}
                  />
                </div>

                <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: includeVisa ? 12 : 0 }}>
                    <Toggle checked={includeVisa} onChange={setIncludeVisa} label="Add Visa " /><span style={{fontSize: 11, color: T.textSec}}> (optional)</span>
                  </div>
                  {includeVisa && (
                    <FileCapture
                      label="Upload Visa Document"
                      error={errors.visa}
                      value={form.visa}
                      onChange={(f) => set("visa", f)}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
<div style={{ borderTop: `1px solid ${T.border}`, margin: "28px 0 24px" }} />
<SectionHeader category="" title="Additional Document" icon={FileText} />
<AdditionalDocumentSection
  enabled={includeAdditional}
  onToggle={(v) => {
    setIncludeAdditional(v);
    if (!v) set("additional_documents", []);
  }}
  docs={form.additional_documents}
  onDocsChange={(d) => {
    setForm(f => ({ ...f, additional_documents: d }));
    setErrors(er => ({ ...er, additional_docs: undefined }));
  }}
  errors={errors}
  compress={(f) => compressImage(f, { maxBytes: 500 * 1024, maxDim: 1600 })}
/>
        {/* Form Action Footer Buttons */}
        <div style={{
          display: "flex", gap: 12, marginTop: 36, paddingTop: 20,
          borderTop: `1px solid ${T.border}`,
          justifyContent: isMobile ? "stretch" : "flex-end"
        }}>
          <Btn variant="ghost" onClick={() => navigate("/customers")} style={isMobile ? { flex: 1, justifyContent: "center" } : { padding: "10px 20px" }}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} disabled={saving} style={isMobile ? { flex: 1, justifyContent: "center" } : { padding: "10px 26px", background: "#2563eb", borderColor: "#2563eb" }}>
            {saving ? "Saving…" : "Create Guest"}
          </Btn>
        </div>
      </div>

      {/* Loading Overlay */}
      {saving && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,.7)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid #2563eb`, borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      <ToastHost />
    </div>
  );
}