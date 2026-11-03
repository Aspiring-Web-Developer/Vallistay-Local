


import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../../services/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { useToast } from "../Stays/Rooms/Room_Shared";
import { compressImage, MAX_INPUT_BYTES } from "../Customer/Create_Customer";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserPlus,
  Camera,
  Upload,
  FileText,
  RefreshCw,
  UserRound,
  ShieldCheck,
  UserCheck,
  FileCode,
  Building2,
  Eye,
  ExternalLink,
  Download,
  Percent,
  Globe2,
  Home,
  Info,
  AlertTriangle,
} from "lucide-react";


const COMPACT_FROM = 1e9; // change to 1e6 to start at Million
const BIG_UNITS = [
  { v: 1e33, n: "Decillion" }, { v: 1e30, n: "Nonillion" }, { v: 1e27, n: "Octillion" },
  { v: 1e24, n: "Septillion" }, { v: 1e21, n: "Sextillion" }, { v: 1e18, n: "Quintillion" },
  { v: 1e15, n: "Quadrillion" }, { v: 1e12, n: "Trillion" }, { v: 1e9, n: "Billion" },
  { v: 1e6, n: "Million" },
];


export const MAX_QTY = 1e5;
export const MAX_RATE = 1e8;
export const MAX_INVOICE_TOTAL = 1e10;

export const fmtFull = (n) =>
  isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmt = (n) => {
  if (isNaN(n)) return "0.00";
  const abs = Math.abs(n);
  if (abs >= COMPACT_FROM) {
    const u = BIG_UNITS.find((u) => abs >= u.v);
    if (u) return `${(n / u.v).toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${u.n}`;
  }
  return fmtFull(n);
};
const today = () => new Date().toISOString().split("T")[0];
const emptyItem = () => ({ product_name: "", description: "", quantity: 1, amount: "" });

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export function getErrorMessage(err, fallback = "Something went wrong") {
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


/* ── Document Upload Modal (Take Photo / Upload File choice) ──── */
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
          position: "fixed", inset: 0, zIndex: 10021,
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        }}
      />

      <div style={{
        position: "fixed", inset: 0, zIndex: 10022,
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



const extractDate = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object" && raw.$date !== undefined) return raw.$date;
  return raw;
};

const toInputDate = (raw) => {
  if (!raw) return "";
  const d = new Date(extractDate(raw));
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ── Country codes data with aliases ── */
const COUNTRY_CODES = [
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
  { code: "54", country: "Argentina", len: 10 },
  { code: "43", country: "Austria", len: 10 },
  { code: "880", country: "Bangladesh", len: 10 },
  { code: "32", country: "Belgium", len: 9 },
  { code: "55", country: "Brazil", len: 11 },
  { code: "56", country: "Chile", len: 9 },
  { code: "57", country: "Colombia", len: 10 },
  { code: "45", country: "Denmark", len: 8 },
  { code: "20", country: "Egypt", len: 10 },
  { code: "358", country: "Finland", len: 9 },
  { code: "30", country: "Greece", len: 10 },
  { code: "62", country: "Indonesia", len: 11 },
  { code: "98", country: "Iran", len: 10 },
  { code: "964", country: "Iraq", len: 10 },
  { code: "353", country: "Ireland", len: 9 },
  { code: "972", country: "Israel", len: 9 },
  { code: "39", country: "Italy", len: 10 },
  { code: "962", country: "Jordan", len: 9 },
  { code: "7", country: "Kazakhstan", len: 10 },
  { code: "254", country: "Kenya", len: 9 },
  { code: "965", country: "Kuwait", len: 8 },
  { code: "961", country: "Lebanon", len: 8 },
  { code: "52", country: "Mexico", len: 10 },
  { code: "977", country: "Nepal", len: 10 },
  { code: "31", country: "Netherlands", len: 9 },
  { code: "64", country: "New Zealand", len: 9 },
  { code: "234", country: "Nigeria", len: 10 },
  { code: "47", country: "Norway", len: 8 },
  { code: "968", country: "Oman", len: 8 },
  { code: "92", country: "Pakistan", len: 10 },
  { code: "51", country: "Peru", len: 9 },
  { code: "63", country: "Philippines", len: 10 },
  { code: "48", country: "Poland", len: 9 },
  { code: "351", country: "Portugal", len: 9 },
  { code: "974", country: "Qatar", len: 8 },
  { code: "40", country: "Romania", len: 9 },
  { code: "7", country: "Russia", len: 10 },
  { code: "27", country: "South Africa", len: 9 },
  { code: "82", country: "South Korea", len: 10, aliases: ["korea"] },
  { code: "34", country: "Spain", len: 9 },
  { code: "94", country: "Sri Lanka", len: 9 },
  { code: "46", country: "Sweden", len: 9 },
  { code: "41", country: "Switzerland", len: 9 },
  { code: "886", country: "Taiwan", len: 9 },
  { code: "66", country: "Thailand", len: 9 },
  { code: "90", country: "Turkey", len: 10 },
  { code: "380", country: "Ukraine", len: 9 },
  { code: "58", country: "Venezuela", len: 10 },
  { code: "84", country: "Vietnam", len: 9 },
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
const COUNTRY_STATES = {
  "India": [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
  ],
  "United Arab Emirates": [
    "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"
  ],
  "Australia": [
    "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
    "South Australia", "Tasmania", "Victoria", "Western Australia"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon"
  ],
  "United Kingdom": [
    "England", "Northern Ireland", "Scotland", "Wales"
  ],
  "Saudi Arabia": [
    "Asir", "Bahah", "Eastern Province", "Ha'il", "Jizan", "Madinah", "Makkah", "Najran",
    "Northern Borders", "Qassim", "Riyadh", "Tabuk", "Jawf"
  ],
  "Germany": [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
    "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate",
    "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
  ],
  "Malaysia": [
    "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca", "Negeri Sembilan",
    "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu"
  ],
  "Singapore": [
    "Central Region", "East Region", "North Region", "North-East Region", "West Region"
  ],
  "Sri Lanka": [
    "Central", "Eastern", "North Central", "Northern", "North Western", "Sabaragamuwa",
    "Southern", "Uva", "Western"
  ],
  "Nepal": [
    "Bagmati", "Gandaki", "Karnali", "Koshi", "Lumbini", "Madesh", "Sudurpashchim"
  ],
  "Qatar": [
    "Al Daayen", "Al Khor", "Al Rayyan", "Al Shamal", "Al Wakrah", "Doha", "Shahaniya", "Umm Salal"
  ],
  "France": [
    "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
    "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
    "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
  ],
  "China": [
    "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou",
    "Hainan", "Hebei", "Heilongjiang", "Henan", "Hong Kong", "Hubei", "Hunan", "Inner Mongolia",
    "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Macau", "Ningxia", "Qinghai", "Shaanxi",
    "Shandong", "Shanghai", "Shanxi", "Sichuan", "Taiwan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"
  ],
  "Japan": [
    "Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gunma",
    "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima",
    "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki",
    "Nara", "Niigata", "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane",
    "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata",
    "Yamaguchi", "Yamanashi"
  ],
  "Indonesia": [
    "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi",
    "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan",
    "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
    "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
    "Nusa Tenggara Timur", "Papua", "Riau", "Sulawesi Selatan", "Sulawesi Tengah",
    "Sulawesi Tenggara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"
  ],
  "Thailand": [
    "Bangkok", "Chiang Mai", "Chiang Rai", "Chonburi", "Krabi", "Nakhon Ratchasima",
    "Nonthaburi", "Pathum Thani", "Phuket", "Songkhla", "Surat Thani", "Udon Thani"
  ],
  "New Zealand": [
    "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Wanganui",
    "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman",
    "Waikato", "Wellington", "West Coast"
  ],
  "Pakistan": [
    "Azad Jammu and Kashmir", "Balochistan", "Gilgit-Baltistan", "Islamabad Capital Territory",
    "Khyber Pakhtunkhwa", "Punjab", "Sindh"
  ],
  "Bangladesh": [
    "Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"
  ],
  "South Korea": [
    "Busan", "Chungcheongbuk-do", "Chungcheongnam-do", "Daegu", "Daejeon", "Gangwon-do",
    "Gwangju", "Gyeonggi-do", "Gyeongsangbuk-do", "Gyeongsangnam-do", "Incheon", "Jeju",
    "Jeollabuk-do", "Jeollanam-do", "Sejong", "Seoul", "Ulsan"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
    "Northern Cape", "North West", "Western Cape"
  ],
  "Nigeria": [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
    "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ],
  "Egypt": [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta",
    "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matrouh", "Minya",
    "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea",
    "Sharqia", "Sohag", "South Sinai", "Suez"
  ]
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/* ── Auto-growing textarea for item details ── */
export function AutoTextarea({ value, onChange, placeholder, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} rows={1} className={className}
      placeholder={placeholder} value={value} onChange={onChange} />
  );
}
/* ── Customer searchable dropdown in invoice ── */
function CustomerCombo({ customers, value, onChange, onAddNew }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const selected = customers.find(c => (c.customer_id || c.id) === value);

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 30);
    else setSearch("");
  }, [open]);

  const filtered = customers.filter(c => {
    const name = c.name || c.customer_name || "";
    const email = c.email || "";
    const q = search.toLowerCase();
    return !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="z-combo" ref={wrapRef}>
      <button type="button" className="z-combo-trigger" onClick={() => setOpen(o => !o)}>
        {selected ? (
          <span className="z-combo-sel">
            <span className="z-avatar">{initialsOf(selected.name || selected.customer_name)}</span>
            <span className="z-combo-names">
              <span className="z-cname">{selected.name || selected.customer_name}</span>
            </span>
          </span>
        ) : (
          <span className="z-combo-ph">Select or add a guest</span>
        )}
        <ChevronDown size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div className="z-combo-panel">
          <div className="z-combo-search-row">
            <Search size={12} color="#9ca3af" />
            <input ref={searchRef} className="z-combo-search" placeholder="Search name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="z-combo-list">
            {filtered.length === 0 && <div className="z-combo-empty">No customers match "{search}"</div>}
            {filtered.map(c => {
              const id = c.customer_id || c.id;
              return (
                <button type="button" key={id}
                  className={`z-combo-opt${id === value ? " active" : ""}`}
                  onClick={() => { onChange(id); setOpen(false); }}>
                  <span className="z-avatar">{initialsOf(c.name || c.customer_name)}</span>
                  <span className="z-combo-names">
                    <span className="z-cname">{c.name || c.customer_name}</span>
                    {c.email && <span className="z-cemail">{c.email}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="z-combo-add" onClick={() => { setOpen(false); onAddNew(); }}>
            <Plus size={12} color="#2563eb" /> Add new Guest
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Generic Custom Searchable Dropdown ── */
export function SelectDropdown({ value, options, onChange, error, placeholder = "Select", searchable = false }) {
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
          width: "100%", boxSizing: "border-box", padding: "8px 11px", height: 36,
          borderRadius: 7, border: `1px solid ${error ? "#ef4444" : open ? "#2563eb" : "#d0d5dd"}`,
          fontSize: 13, color: active ? "#111827" : "#9ca3af", outline: "none", background: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
          boxShadow: open ? `0 0 0 3px rgba(37,99,235,0.14)` : "none",
        }}
      >
        <span style={{ fontWeight: 500 }}>{active ? active.label : placeholder}</span>
        <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10010,
          background: "#ffffff", border: `1px solid #e5e7eb`, borderRadius: 10,
          boxShadow: "0 14px 32px rgba(17,24,39,0.14)", overflow: "hidden",
        }}>
          {searchable && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: `1px solid #f3f4f6`, background: "#f9fafb" }}>
              <Search size={13} color="#9ca3af" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search or type..."
                style={{ border: "none", outline: "none", fontSize: 13, width: "100%", color: "#111", background: "transparent" }}
              />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: 4 }}>
            {showCustomOption && (
              <button
                type="button"
                onClick={() => { onChange(search.trim()); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6, border: "none", textAlign: "left",
                  cursor: "pointer", background: "#eff6ff", fontSize: 13, fontWeight: 600, color: "#2563eb",
                  marginBottom: 4,
                }}
              >
                + Use "{search.trim()}"
              </button>
            )}
            {filtered.length === 0 && !showCustomOption && <div style={{ padding: "12px 10px", fontSize: 12, color: "#9ca3af", textAlign: "center" }}>No matches</div>}
            {filtered.map(o => (
              <button
                type="button"
                key={String(o.value)}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6, border: "none", textAlign: "left",
                  cursor: "pointer", background: o.value === value ? "#eff6ff" : "transparent", fontSize: 13,
                  fontWeight: o.value === value ? 600 : 400, color: o.value === value ? "#2563eb" : "#111",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Searchable Country Code Dropdown ── */
function CountryCodeSelect({ value, onChange, error }) {
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
    if (open) { setSearch(""); setTimeout(() => searchRef.current?.focus(), 30); }
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
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36, padding: "0 10px", width: 110, borderRadius: 7,
          border: `1px solid ${error ? "#ef4444" : open ? "#2563eb" : "#d0d5dd"}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#333"
        }}
      >
        <span>+{active.code}</span>
        <ChevronDown size={12} color="#9ca3af" />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10010,
          background: "#ffffff", border: `1px solid #e5e7eb`, borderRadius: 10,
          boxShadow: "0 14px 32px rgba(17,24,39,0.14)", width: 240, overflow: "hidden"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: `1px solid #f3f4f6`, background: "#f9fafb" }}>
            <Search size={13} color="#9ca3af" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search code or country…"
              style={{ border: "none", outline: "none", fontSize: 12.5, width: "100%", color: "#111", background: "transparent" }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: 4 }}>
            {filtered.map(c => (
              <button
                type="button"
                key={`${c.code}-${c.country}`}
                onClick={() => { onChange(c.code); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 6, border: "none", textAlign: "left",
                  cursor: "pointer", background: c.code === value ? "#eff6ff" : "transparent"
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", width: 42, flexShrink: 0 }}>+{c.code}</span>
                <span style={{ fontSize: 12.5, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.country}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── File Capture Component for Modal ── */
/* ── File Capture — click opens a choice modal (no default dropzone) ── */
function FileCapture({ label, required, error, value, onChange, accept = "image/*,.pdf", hint = "PNG, JPG or PDF (max. 5MB)" }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const isImage = !!(value && value.type && value.type.startsWith("image/"));

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value, isImage]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const startCamera = async () => {
    setModalOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 30);
    } catch {}
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
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

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}

      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid #d0d5dd`, borderRadius: 8, background: "#fff" }}>
          {previewUrl ? (
            <img src={previewUrl} alt={value.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={16} color="#2563eb" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.name}</div>
          </div>
          <button type="button" title="Replace" onClick={() => setModalOpen(true)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex" }}><RefreshCw size={14} /></button>
          <button type="button" title="Remove" onClick={() => onChange(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", display: "flex" }}><X size={14} /></button>
        </div>
      ) : (
        <div
          onClick={() => setModalOpen(true)}
          style={{
            border: `1.5px dashed ${error ? "#ef4444" : "#d1d5db"}`, borderRadius: 8, padding: "14px 10px",
            textAlign: "center", cursor: "pointer", background: "#f8fafc"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>Click to add document</div>
          <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 3 }}>{hint}</div>
        </div>
      )}
      {error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{error}</div>}

      {/* Hidden native file input — triggered only from the modal */}
      <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />

      <DocumentUploadModal
        visible={modalOpen}
        label={label}
        onTakePhoto={startCamera}
        onUploadClick={() => { setModalOpen(false); fileRef.current?.click(); }}
        onClose={() => setModalOpen(false)}
      />

      {cameraOn && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.65)", zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 14, padding: 16, width: 340 }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 8, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button type="button" className="z-btn-ghost" onClick={stopCamera}>Cancel</button>
              <button type="button" className="z-btn-blue" onClick={capture}>Capture</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Profile Photo Avatar Capture (Menu Auto-Closes Upon Upload/Capture) ── */
function AvatarCaptureModal({ value, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [sizeError, setSizeError] = useState("");

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
      onChange(await compressImage(file));
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

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const startCamera = async () => {
    setMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 30);
    } catch {}
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
      setMenuOpen(false);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const menuItemStyle = {
    display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
    fontSize: 12.5, fontWeight: 500, color: "#111827", background: "transparent",
    border: "none", cursor: "pointer", borderRadius: 6
  };

  return (
    <div ref={wrapRef} style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
      <div
        onClick={() => setMenuOpen(o => !o)}
        style={{
          position: "relative", width: 56, height: 56, borderRadius: "50%",
          border: `2px solid #2563eb`, background: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}
      >
        {previewUrl
          ? <img src={previewUrl} alt="Customer" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : <UserRound size={24} color="#2563eb" />}
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "#2563eb", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Camera size={11} color="#fff" />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            handleIncoming(e.target.files?.[0]);
            e.target.value = "";
            setMenuOpen(false);
          }}
        />
      </div>
      <div onClick={() => setMenuOpen(o => !o)} style={{ cursor: "pointer" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Customer Photo</div>
        <div style={{ fontSize: 11.5, color: sizeError ? "#ef4444" : "#2563eb", fontWeight: 600, marginTop: 2 }}>
          {busy ? "Compressing…" : sizeError || (value ? "Click to change photo" : "Click to upload photo")}
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10015,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)", padding: 4, width: 150
          }}
        >
          <button type="button" onClick={startCamera} style={menuItemStyle}> Take photo</button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false); // Close menu when opening file browser
              fileRef.current?.click();
            }}
            style={menuItemStyle}
          >
             Upload photo
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChange(null);
              }}
              style={{ ...menuItemStyle, color: "#ef4444" }}
            >
              🗑️ Remove
            </button>
          )}
        </div>
      )}

      {cameraOn && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.65)", backdropFilter: "blur(4px)", zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 20, width: 340, maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#111827" }}>Customer Guest</div>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 10, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button type="button" className="z-btn-ghost" onClick={stopCamera}>Cancel</button>
              <button type="button" className="z-btn-blue" onClick={capture}>Capture</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Full Featured Add Customer Modal ── */
function AddCustomerModal({ onClose, onCreated, push }) {
  const [includeAdditional, setIncludeAdditional] = useState(false);

  const [form, setForm] = useState({
    name: "", last_name: "", email: "",
    mobile_country_code: "91", mobile: "",
    address: "", state: "", country: "",
    customer_type: "",
    proof_type: "",
    customer_image: null,
    domestic_customer_proof: null,
    passport: null,
    visa: null,
  //     additional_document_name: "",
  // additional_document: null,
  });
  const [errors, setErrors] = useState({});
  const [includeVisa, setIncludeVisa] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  const activeCountry =
    COUNTRY_CODES.find(c => c.code === form.mobile_country_code) || COUNTRY_CODES.find(c => c.code === "91");

  // Dynamic state options for currently selected country
  const stateOptions = (COUNTRY_STATES[form.country] || []).map(s => ({ value: s, label: s }));

  const handleCountryChange = (countryName) => {
    setForm(f => ({
      ...f,
      country: countryName,
      state: "", // Reset state when country changes
    }));
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const closeAnimated = () => {
    setVisible(false);
    setTimeout(onClose, 180);
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "First name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.mobile.trim()) {
      e.mobile = "Mobile number is required";
    } else if (form.mobile.trim().length !== activeCountry.len) {
      e.mobile = `Enter a valid ${activeCountry.len}-digit number for ${activeCountry.country}`;
    }

    if (!form.customer_type) {
      e.customer_type = "Select guest type";
    } else if (form.customer_type === "domestic") {
      if (!form.proof_type) e.proof_type = "Select a document type";
      if (!form.domestic_customer_proof) e.domestic_customer_proof = "Required";
    } else if (form.customer_type === "international") {
      if (!form.passport) e.passport = "Passport is mandatory for international guests";
      if (includeVisa && !form.visa) e.visa = "Upload a visa or turn this off";
    }
//     if (includeAdditional) {
//   if (!form.additional_document_name.trim()) e.additional_document_name = "Enter a document name";
//   if (!form.additional_document) e.additional_document = "Upload the document";
// }
  // if (preFeeTotal > MAX_INVOICE_TOTAL)
  //   e.items = `Invoice total can't exceed ${fmtFull(MAX_INVOICE_TOTAL)}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) { push && push("Please fix the highlighted fields", "error"); return; }
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
            if (form.country) fd.append("country", form.country);
      fd.append("customer_type", form.customer_type);
      if (form.customer_image) fd.append("customer_image", form.customer_image);

      if (form.customer_type === "domestic") {
        fd.append("proof_type", form.proof_type);
        if (form.domestic_customer_proof) fd.append("domestic_customer_proof", form.domestic_customer_proof);
      } else if (form.customer_type === "international") {
        if (form.passport) fd.append("passport", form.passport);
        if (includeVisa && form.visa) fd.append("visa", form.visa);
      }
//       if (includeAdditional) {
//   fd.append("additional_document_name", form.additional_document_name.trim());
//   if (form.additional_document) fd.append("additional_document", form.additional_document);
// }

      await api.post("/customers/", fd, { headers: { "Content-Type": "multipart/form-data" } });

      const listRes = await api.get("/customers/");
      const list = listRes.data?.data || listRes.data || [];
      const match = Array.isArray(list)
        ? list.find(c => (c.email || "").toLowerCase() === form.email.trim().toLowerCase())
        : null;

      if (!match) {
        push && push("Guest created but couldn't auto-select — please pick manually", "error");
        setSaving(false);
        return;
      }

      const newId = match.customer_id || match.id || match._id;
      const created = { ...form, ...match, customer_id: newId, id: newId };
      push && push("Guest added", "success");
      onCreated(created);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to add guest");
      push && push(msg, "error");
      const be = err.response?.data;
      if (be && typeof be === "object" && !be.message) {
        const fe = {};
        Object.keys(be).forEach(k => { fe[k] = Array.isArray(be[k]) ? be[k][0] : be[k]; });
        setErrors(fe);
      }
    } finally { setSaving(false); }
  };

  return (
    <div
      className={`zc-overlay${visible ? " show" : ""}`}
      onMouseDown={(e) => e.target === e.currentTarget && closeAnimated()}
    >
      <div className={`zc-modal${visible ? " show" : ""}`} style={{ maxWidth: 620 }}>

        {/* Header */}
        <div className="zc-hd">
          <div className="zc-hd-left">
            <div className="zc-hd-icon"><UserPlus size={19} color="#2563eb" /></div>
            <div>
              <p className="zc-title">Add New Guest</p>
              <p className="zc-subtitle">Create a complete guest profile to use across invoices</p>
            </div>
          </div>
          <button className="zc-x" onClick={closeAnimated}><X size={17} /></button>
        </div>

        {/* Body */}
        <div className="zc-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>

          {/* Top Avatar Capture + Customer Type */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 14px", background: "#f8fafc", border: `1px solid #e2e8f0`, borderRadius: 10 }}>
            <AvatarCaptureModal value={form.customer_image} onChange={(f) => set("customer_image", f)} />
            <div style={{ width: 220 }}>
              <label className="zc-label">Guest Type *</label>
              <SelectDropdown
                value={form.customer_type}
                options={CUSTOMER_TYPES}
                placeholder="Select guest type"
                onChange={(v) => {
                  set("customer_type", v);
                  set("proof_type", "");
                  set("domestic_customer_proof", null);
                  set("passport", null);
                  set("visa", null);
                  setIncludeVisa(false);
                }}
                error={errors.customer_type}
              />
              {errors.customer_type && <div className="zc-err">{errors.customer_type}</div>}
            </div>
          </div>

          {/* Section: Basic Info */}
          <div className="zc-section">
            <div className="zc-section-hd">
              <User size={13} color="#2563eb" />
              <span>Personal Details</span>
            </div>
            <div className="zc-row2">
              <div className="zc-field">
                <label className="zc-label">First Name *</label>
                <input className={`zc-input${errors.name ? " err" : ""}`}
                  value={form.name} onChange={e => set("name", e.target.value)}
                 placeholder="Enter first name" />
                {errors.name && <div className="zc-err">{errors.name}</div>}
              </div>
              <div className="zc-field">
                <label className="zc-label">Last Name</label>
                <input className="zc-input"
                  value={form.last_name} onChange={e => set("last_name", e.target.value)}
                  placeholder="Enter last name"/>
              </div>
            </div>

            <div className="zc-row2" style={{ marginTop: 10 }}>
              <div className="zc-field">
                <label className="zc-label">Email Address *</label>
                <div className="zc-input-icon">
                  <Mail size={14} color="#9ca3af" />
                  <input className={`zc-input-plain${errors.email ? " err" : ""}`}
                    value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="Enter email address" />
                </div>
                {errors.email && <div className="zc-err">{errors.email}</div>}
              </div>

              <div className="zc-field">
                <label className="zc-label">Mobile Number *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <CountryCodeSelect
                    value={form.mobile_country_code}
                    error={errors.mobile_country_code}
                    onChange={(code) => set("mobile_country_code", code)}
                  />
                  <div className="zc-input-icon" style={{ flex: 1 }}>
                    <Phone size={14} color="#9ca3af" />
                    <input
                      className={`zc-input-plain${errors.mobile ? " err" : ""}`}
                      value={form.mobile}
                      inputMode="numeric"
                      maxLength={activeCountry.len}
                      placeholder={`${activeCountry.len}-digit number`}
                      onChange={e => set("mobile", e.target.value.replace(/\D/g, "").slice(0, activeCountry.len))}
                    />
                  </div>
                </div>
                {(errors.mobile || errors.mobile_country_code) && (
                  <div className="zc-err">{errors.mobile || errors.mobile_country_code}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Address */}
          <div className="zc-section">
            <div className="zc-section-hd">
              <MapPin size={13} color="#2563eb" />
              <span>Location Details</span>
            </div>
            <div className="zc-row2">
              <div className="zc-field">
                <label className="zc-label">Country</label>
                <SelectDropdown
                  value={form.country}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select country"
                  onChange={handleCountryChange}
                  searchable
                />
              </div>

              {/* Dynamic Searchable State Dropdown */}
              <div className="zc-field">
                <label className="zc-label">State / Province</label>
                <SelectDropdown
                  value={form.state}
                  options={stateOptions}
                  placeholder={stateOptions.length > 0 ? "Select state / province" : "Select or type state"}
                  onChange={v => set("state", v)}
                  searchable
                />
              </div>
            </div>

            <div className="zc-field" style={{ marginTop: 10 }}>
              <label className="zc-label">Street Address</label>
              <textarea className="zc-input" style={{ minHeight: 64, height: "auto", padding: "8px 11px", resize: "vertical" }}
                value={form.address} onChange={e => set("address", e.target.value)}
               placeholder="Enter street address" />
            </div>
          </div>

          {/* Section: KYC Documents */}
          {form.customer_type && (
            <div className="zc-section">
              <div className="zc-section-hd">
                <ShieldCheck size={13} color="#2563eb" />
                <span>Verification Documents</span>
              </div>

              {form.customer_type === "domestic" ? (
                <div className="zc-row2">
                  <div className="zc-field">
                    <label className="zc-label">Document Type *</label>
                    <SelectDropdown
                      value={form.proof_type}
                      options={DOC_TYPES}
                      placeholder="Select document type"
                      onChange={v => set("proof_type", v)}
                      error={errors.proof_type}
                    />
                    {errors.proof_type && <div className="zc-err">{errors.proof_type}</div>}
                  </div>

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
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <FileCapture
                    label="Upload Passport"
                    required
                    error={errors.passport}
                    value={form.passport}
                    onChange={(f) => set("passport", f)}
                  />

                  <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                      <input type="checkbox" checked={includeVisa} onChange={e => setIncludeVisa(e.target.checked)} />
                      Add visa (optional)
                    </label>
                    {includeVisa && (
                      <div style={{ marginTop: 10 }}>
                        <FileCapture
                          label="Upload Visa Document"
                          error={errors.visa}
                          value={form.visa}
                          onChange={(f) => set("visa", f)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Section: Additional Document (common for all customers) */}
          {/* Hint: extra documents are added from the Customers menu */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 14px", borderRadius: 10,
            background: "#eff6ff", border: "1px solid #dbeafe",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "#2563eb", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Info size={15} color="#fff" />
            </div>
            <div style={{ fontSize: 12.5, color: "#1e3a8a", lineHeight: 1.5 }}>
              <b>Need to add more documents?</b><br />
              After this guest is created, go to the <b>Guests</b> menu, open the profile and
              click <b>Edit Profile</b> to add additional documents like Voter ID, address proof, etc.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="zc-ft">
          <button className="z-btn-ghost" style={{ flex: 1 }} onClick={closeAnimated} disabled={saving}>Cancel</button>
          <button className="z-btn-blue" style={{ flex: 1.4, justifyContent: "center", background: "#2563eb" }} onClick={handleCreate} disabled={saving}>
            {saving ? "Adding…" : (<><UserPlus size={14} /> Add Guest</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Send Invoice modal: pick currency before sending ── */
const CURRENCY_INFO = {
  AED: { country: "United Arab Emirates", name: "UAE Dirham" },
  ALL: { country: "Albania", name: "Albanian Lek" },
  AMD: { country: "Armenia", name: "Armenian Dram" },
  AUD: { country: "Australia", name: "Australian Dollar" },
  AWG: { country: "Aruba", name: "Aruban Florin" },
  AZN: { country: "Azerbaijan", name: "Azerbaijani Manat" },
  BAM: { country: "Bosnia and Herzegovina", name: "Convertible Mark" },
  BBD: { country: "Barbados", name: "Barbadian Dollar" },
  BDT: { country: "Bangladesh", name: "Bangladeshi Taka" },
  BGN: { country: "Bulgaria", name: "Bulgarian Lev" },
  BHD: { country: "Bahrain", name: "Bahraini Dinar" },
  BIF: { country: "Burundi", name: "Burundian Franc" },
  BMD: { country: "Bermuda", name: "Bermudian Dollar" },
  BND: { country: "Brunei", name: "Brunei Dollar" },
  BOB: { country: "Bolivia", name: "Bolivian Boliviano" },
  BRL: { country: "Brazil", name: "Brazilian Real" },
  BSD: { country: "Bahamas", name: "Bahamian Dollar" },
  BTN: { country: "Bhutan", name: "Bhutanese Ngultrum" },
  BWP: { country: "Botswana", name: "Botswana Pula" },
  BZD: { country: "Belize", name: "Belize Dollar" },
  CAD: { country: "Canada", name: "Canadian Dollar" },
  CHF: { country: "Switzerland", name: "Swiss Franc" },
  CLP: { country: "Chile", name: "Chilean Peso" },
  CNY: { country: "China", name: "Chinese Yuan Renminbi" },
  COP: { country: "Colombia", name: "Colombian Peso" },
  CRC: { country: "Costa Rica", name: "Costa Rican Colon" },
  CUP: { country: "Cuba", name: "Cuban Peso" },
  CVE: { country: "Cape Verde", name: "Cape Verdean Escudo" },
  CZK: { country: "Czech Republic", name: "Czech Koruna" },
  DJF: { country: "Djibouti", name: "Djiboutian Franc" },
  DKK: { country: "Denmark", name: "Danish Krone" },
  DOP: { country: "Dominican Republic", name: "Dominican Peso" },
  DZD: { country: "Algeria", name: "Algerian Dinar" },
  EGP: { country: "Egypt", name: "Egyptian Pound" },
  ETB: { country: "Ethiopia", name: "Ethiopian Birr" },
  EUR: { country: "European Union", name: "Euro" },
  FJD: { country: "Fiji", name: "Fijian Dollar" },
  GBP: { country: "United Kingdom", name: "Pound Sterling" },
  GHS: { country: "Ghana", name: "Ghanaian Cedi" },
  GIP: { country: "Gibraltar", name: "Gibraltar Pound" },
  GMD: { country: "Gambia", name: "Gambian Dalasi" },
  GNF: { country: "Guinea", name: "Guinean Franc" },
  GTQ: { country: "Guatemala", name: "Guatemalan Quetzal" },
  GYD: { country: "Guyana", name: "Guyanese Dollar" },
  HKD: { country: "Hong Kong", name: "Hong Kong Dollar" },
  HNL: { country: "Honduras", name: "Honduran Lempira" },
  HRK: { country: "Croatia", name: "Croatian Kuna" },
  HTG: { country: "Haiti", name: "Haitian Gourde" },
  HUF: { country: "Hungary", name: "Hungarian Forint" },
  IDR: { country: "Indonesia", name: "Indonesian Rupiah" },
  ILS: { country: "Israel", name: "Israeli New Shekel" },
  INR: { country: "India", name: "Indian Rupee" },
  IQD: { country: "Iraq", name: "Iraqi Dinar" },
  ISK: { country: "Iceland", name: "Iceland Krona" },
  JMD: { country: "Jamaica", name: "Jamaican Dollar" },
  JOD: { country: "Jordan", name: "Jordanian Dinar" },
  JPY: { country: "Japan", name: "Japanese Yen" },
  KES: { country: "Kenya", name: "Kenyan Shilling" },
  KGS: { country: "Kyrgyzstan", name: "Kyrgyzstani Som" },
  KHR: { country: "Cambodia", name: "Cambodian Riel" },
  KMF: { country: "Comoros", name: "Comorian Franc" },
  KRW: { country: "South Korea", name: "Korean Won" },
  KWD: { country: "Kuwait", name: "Kuwaiti Dinar" },
  KYD: { country: "Cayman Islands", name: "Cayman Islands Dollar" },
  KZT: { country: "Kazakhstan", name: "Kazakhstani Tenge" },
  LAK: { country: "Laos", name: "Lao Kip" },
  LKR: { country: "Sri Lanka", name: "Sri Lankan Rupee" },
  LRD: { country: "Liberia", name: "Liberian Dollar" },
  LSL: { country: "Lesotho", name: "Lesotho Loti" },
  MAD: { country: "Morocco", name: "Moroccan Dirham" },
  MDL: { country: "Moldova", name: "Moldovan Leu" },
  MGA: { country: "Madagascar", name: "Malagasy Ariary" },
  MKD: { country: "North Macedonia", name: "Macedonian Denar" },
  MMK: { country: "Myanmar", name: "Myanmar Kyat" },
  MNT: { country: "Mongolia", name: "Mongolian Tugrik" },
  MOP: { country: "Macau", name: "Macanese Pataca" },
  MUR: { country: "Mauritius", name: "Mauritian Rupee" },
  MVR: { country: "Maldives", name: "Maldivian Rufiyaa" },
  MWK: { country: "Malawi", name: "Malawian Kwacha" },
  MXN: { country: "Mexico", name: "Mexican Peso" },
  MYR: { country: "Malaysia", name: "Malaysian Ringgit" },
  MZN: { country: "Mozambique", name: "Mozambique Metical" },
  NAD: { country: "Namibia", name: "Namibian Dollar" },
  NGN: { country: "Nigeria", name: "Nigerian Naira" },
  NIO: { country: "Nicaragua", name: "Nicaraguan Cordoba" },
  NOK: { country: "Norway", name: "Norwegian Krone" },
  NPR: { country: "Nepal", name: "Nepalese Rupee" },
  NZD: { country: "New Zealand", name: "New Zealand Dollar" },
  OMR: { country: "Oman", name: "Rial Omani" },
  PEN: { country: "Peru", name: "Peruvian Sol" },
  PGK: { country: "Papua New Guinea", name: "Papua New Guinean Kina" },
  PHP: { country: "Philippines", name: "Philippine Peso" },
  PKR: { country: "Pakistan", name: "Pakistani Rupee" },
  PLN: { country: "Poland", name: "Polish Zloty" },
  PYG: { country: "Paraguay", name: "Paraguayan Guarani" },
  QAR: { country: "Qatar", name: "Qatari Riyal" },
  RON: { country: "Romania", name: "Romanian Leu" },
  RSD: { country: "Serbia", name: "Serbian Dinar" },
  RUB: { country: "Russia", name: "Russian Ruble" },
  RWF: { country: "Rwanda", name: "Rwanda Franc" },
  SAR: { country: "Saudi Arabia", name: "Saudi Arabian Riyal" },
  SCR: { country: "Seychelles", name: "Seychellois Rupee" },
  SEK: { country: "Sweden", name: "Swedish Krona" },
  SGD: { country: "Singapore", name: "Singapore Dollar" },
  SLL: { country: "Sierra Leone", name: "Sierra Leonean Leone" },
  SOS: { country: "Somalia", name: "Somali Shilling" },
  SVC: { country: "El Salvador", name: "Salvadoran Colon" },
  SZL: { country: "Eswatini", name: "Swazi Lilangeni" },
  THB: { country: "Thailand", name: "Thai Baht" },
  TND: { country: "Tunisia", name: "Tunisian Dinar" },
  TRY: { country: "Turkey", name: "Turkish Lira" },
  TTD: { country: "Trinidad and Tobago", name: "Trinidad and Tobago Dollar" },
  TWD: { country: "Taiwan", name: "New Taiwan Dollar" },
  TZS: { country: "Tanzania", name: "Tanzanian Shilling" },
  UAH: { country: "Ukraine", name: "Ukrainian Hryvnia" },
  UGX: { country: "Uganda", name: "Uganda Shilling" },
  USD: { country: "United States, America", name: "US Dollar" },
  UYU: { country: "Uruguay", name: "Uruguayan Peso" },
  UZS: { country: "Uzbekistan", name: "Uzbekistani Som" },
  VND: { country: "Vietnam", name: "Vietnamese Dong" },
  VUV: { country: "Vanuatu", name: "Vatu" },
  XAF: { country: "Central Africa", name: "CFA Franc BEAC" },
  XCD: { country: "Eastern Caribbean", name: "East Caribbean Dollar" },
  XOF: { country: "West Africa", name: "CFA Franc BCEAO" },
  XPF: { country: "French Polynesia", name: "CFP Franc" },
  YER: { country: "Yemen", name: "Yemeni Rial" },
  ZAR: { country: "South Africa", name: "South African Rand" },
  ZMW: { country: "Zambia", name: "Zambian Kwacha" },
};

const RAZORPAY_CURRENCY_CODES = Object.keys(CURRENCY_INFO).sort();
const currencyLabel = (code) => {
  const info = CURRENCY_INFO[code];
  return info ? `${code} - ${info.name}` : code;
};


export function SendInvoiceModal({ open, onClose, onConfirm, sending }) {
  const [currencies, setCurrencies] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setSearch("");
    setDropdownOpen(false);
    setLoadingList(false);
    setCurrencies(RAZORPAY_CURRENCY_CODES);
  }, [open]);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const filtered = currencies.filter((c) => {
    if (!q) return true;
    const info = CURRENCY_INFO[c];
    return (
      c.toLowerCase().includes(q) ||
      (info?.country && info.country.toLowerCase().includes(q)) ||
      (info?.name && info.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="ib-modal-overlay" onClick={onClose}>
      <div className="ib-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ib-modal-header">
          <h3>Send Invoice</h3>
          <button className="ib-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="ib-modal-body">
          <p className="ib-modal-sub">
            Pick the currency this invoice should be sent in.
          </p>
          <label className="ib-modal-label">Invoice Currency</label>
          <div className="ib-currency-select" ref={boxRef}>
            <input
              type="text"
              placeholder={loadingList ? "Loading currencies…" : "Search by currency or country…"}
              value={selected ? currencyLabel(selected) : search}
              onChange={(e) => { setSearch(e.target.value); setSelected(null); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              disabled={loadingList}
            />
            <div className={`ib-currency-dropdown${dropdownOpen ? " open" : ""}`}>
              {filtered.length === 0 && <div className="ib-currency-empty">No matches</div>}
              {filtered.map((c) => {
                const info = CURRENCY_INFO[c];
                return (
                  <div
                    key={c}
                    className={`ib-currency-option${selected === c ? " active" : ""}`}
                    onClick={() => { setSelected(c); setSearch(""); setDropdownOpen(false); }}
                  >
                    <span style={{ fontWeight: 700 }}>{c}</span>
                    {info && (
                      <>
                        {" - "}{info.name}
                        <span style={{ color: "#9AA1AF", fontWeight: 500 }}> ({info.country})</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="ib-modal-footer">
          <button className="ib-toolbtn" onClick={onClose}>Cancel</button>
          <button
            className="ib-toolbtn ib-toolbtn-primary"
            disabled={!selected || sending}
            onClick={() => onConfirm(selected)}
          >
            {sending ? "Sending…" : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN CREATE INVOICE COMPONENT
═══════════════════════════════════════════════ */
export default function CreateInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { push, ToastHost } = useToast();

  const [customers, setCustomers] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [invoiceNumberPart, setInvoiceNumberPart] = useState("");
  const [changeUpcomingPrefix, setChangeUpcomingPrefix] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [originalPrefix, setOriginalPrefix] = useState("");

  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [advanceEnabled, setAdvanceEnabled] = useState(false);
  const isPrefixEdited = invoicePrefix.trim() !== originalPrefix.trim();
  const [showSendModal, setShowSendModal] = useState(false);
const [errors, setErrors] = useState({});
  /* ── platform fee (profile-driven convenience fee) ── */
  const [profile, setProfile] = useState(null);
  const [platformFeePercentage, setPlatformFeePercentage] = useState("");
  const [platformFeeTouched, setPlatformFeeTouched] = useState(false); // true once user manually edits it
  const [platformFeeError, setPlatformFeeError] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    department_id: "",
    invoice_date: today(),
    due_date: today(),

    currency: "INR",
    items: [emptyItem()],
    tax_enabled: false,
    gst_percentage: 0,
    discount: 0,
    advance_amount: "",
    paid_amount: "",
    notes: "Your comfort is our priority.",
    terms_and_conditions: "",
  });

  const buildFormFromInvoice = (data) => ({
    customer_id: data?.customer_id || "",
    department_id: data?.department_id || "",
    invoice_date: toInputDate(data?.invoice_date) || today(),
    due_date: toInputDate(data?.due_date) || "",
    currency: data?.currency || "INR",
    items: data?.items?.length ? data.items : [emptyItem()],
    tax_enabled: data?.tax_enabled ?? false,
    gst_percentage: data?.tax_percentage || 0,
    discount: data?.discount_percentage || 0,
    advance_amount: data?.advance_amount || "",
    paid_amount: data?.manual_paid_amount || "",
    notes: data?.notes ?? "Your comfort is our priority.",
    terms_and_conditions: data?.terms_and_conditions || "",
  });

  useEffect(() => {
    api.get("/customers/").then(r => {
      const list = r.data?.data || r.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    }).catch(() => {});
    api.get("/departments/list_departments").then(r => {
      const list = r.data?.data || [];
      setDepartments(Array.isArray(list) ? list.filter(d => d.is_active) : []);
    }).catch(() => {});
    api.get("/profile/get_profile").then(r => {
      setProfile(r.data?.data || null);
    }).catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (isEdit) {
      setPageLoading(true);
      api.get(`/invoices/get_invoice?invoice_id=${id}`)
        .then(r => {
          const data = r.data?.data || r.data;
          if (data?.room_booking && data?.room_booking_id) {
            navigate(`/invoices/room-create?booking_id=${data.room_booking_id}`, { replace: true });
            return;
          }
          setForm(buildFormFromInvoice(data));
          setInvoiceNumber(data?.invoice_number || "");
          if (data?.terms_and_conditions) setShowTerms(true);
          if (data?.discount_percentage) setDiscountEnabled(true);  
          if (data?.advance_amount) setAdvanceEnabled(true);
          if (data?.platform_fee_percentage !== undefined && data?.platform_fee_percentage !== null) {
            setPlatformFeePercentage(String(data.platform_fee_percentage));
            setPlatformFeeTouched(true); // an existing saved value counts as "set", don't auto-override
          }
        })
        .catch(err => push(getErrorMessage(err, "Could not load invoice"), "error"))
        .finally(() => setPageLoading(false));
    } else {
      api.get("/invoices/generate_invoice_number")
        .then(r => {
          const data = r.data?.data || {};
          setInvoicePrefix(data.invoice_prefix || "");
          setOriginalPrefix(data.invoice_prefix || "");
          setInvoiceNumberPart(data.invoice_number ?? "");
        })
        .catch(() => {});
    }
  }, [id]);

  /* ── customer type of the currently selected customer ── */
  const selectedCustomer = customers.find(c => (c.customer_id || c.id) === form.customer_id);
  const customerType = selectedCustomer?.customer_type || "domestic"; // domestic | international

  /* ── auto-fill platform fee % from profile whenever customer type changes,
        unless the user has manually typed a value for this invoice ── */
  useEffect(() => {
    if (!profile || platformFeeTouched) return;
    const pct = customerType === "international"
      ? profile.international_platform_fee_percentage
      : profile.domestic_platform_fee_percentage;
    setPlatformFeePercentage(pct !== undefined && pct !== null ? String(pct) : "0");
  }, [profile, customerType, platformFeeTouched]);

  /* only digits + up to 2 decimals, hard-capped at 100 */
  const handlePlatformFeeChange = (e) => {
    let v = e.target.value;
    setPlatformFeeTouched(true);
    if (v === "") { setPlatformFeePercentage(""); setPlatformFeeError(""); return; }
    if (!/^\d{0,3}(\.\d{0,2})?$/.test(v)) return;
    if (Number(v) > 100) {
      setPlatformFeePercentage("100");
      setPlatformFeeError("Platform fee can't be more than 100%");
      return;
    }
    setPlatformFeeError("");
    setPlatformFeePercentage(v);
  };


  /* Discount / GST: digits + max 2 decimals, hard-capped at 100 */
const handlePercentChange = (field, label) => (e) => {
  const v = e.target.value;
  if (v === "") { setForm(f => ({ ...f, [field]: "" })); return; }
  if (!/^\d{0,3}(\.\d{0,2})?$/.test(v)) return;
  if (Number(v) > 100) {
    setForm(f => ({ ...f, [field]: "100" }));
    push(`${label} can't be more than 100%. We've set it to 100%.`, "error");
    return;
  }
  setForm(f => ({ ...f, [field]: v }));
};

/* Advance: can't exceed the invoice total (before platform fee) */
const handleAdvanceChange = (e) => {
  const v = e.target.value;
  if (v === "") { setForm(f => ({ ...f, advance_amount: "" })); return; }
  if (!/^\d*(\.\d{0,2})?$/.test(v)) return;

  if (preFeeTotal <= 0) {
    push("Add item amounts first, then set the advance", "error");
    return;
  }
  if (Number(v) > preFeeTotal) {
    setForm(f => ({ ...f, advance_amount: String(parseFloat(preFeeTotal.toFixed(2))) }));
    push(`Advance can't be more than the invoice total (₹${fmt(preFeeTotal)})`, "error");
    return;
  }
  setForm(f => ({ ...f, advance_amount: v }));
};

  /* clear a "0" placeholder value the moment the user focuses the field,
     so they don't have to backspace it manually */
  const clearZeroOnFocus = (getVal, setVal) => (e) => {
    const v = getVal();
    if (v === 0 || v === "0") setVal("");
    e.target.select?.();
  };

  /* calculations */
  const subtotal = form.items.reduce((s, i) => s + (parseFloat(i.quantity || 0) * parseFloat(i.amount || 0)), 0);
  const discountAmt = discountEnabled
    ? subtotal * (parseFloat(form.discount || 0) / 100)
    : 0;
  const taxAmt = form.tax_enabled ? ((subtotal - discountAmt) * (parseFloat(form.gst_percentage || 0) / 100)) : 0;
  const preFeeTotal = subtotal - discountAmt + taxAmt;

  // const platformFeePct = Math.min(parseFloat(platformFeePercentage || 0), 100);
  // const platformFeeAmt = preFeeTotal * (isNaN(platformFeePct) ? 0 : platformFeePct) / 100;

  // const grandTotal = preFeeTotal + platformFeeAmt;
  // const advanceAmt = advanceEnabled ? parseFloat(form.advance_amount || 0) : 0;
  // const paidAmt = parseFloat(form.paid_amount || 0);
  // const totalWithDeduction = grandTotal - advanceAmt - (isEdit ? paidAmt : 0);


  const advanceAmt = advanceEnabled ? parseFloat(form.advance_amount || 0) : 0;
const paidAmt = parseFloat(form.paid_amount || 0);

/* platform fee only applies to whatever balance actually gets charged via Razorpay,
   advance is collected outside razorpay flow so it's excluded from the fee base */
const razorpayChargeableAmount = Math.max(preFeeTotal - advanceAmt, 0);

const platformFeePct = Math.min(parseFloat(platformFeePercentage || 0), 100);
const platformFeeAmt = razorpayChargeableAmount * (isNaN(platformFeePct) ? 0 : platformFeePct) / 100;

const grandTotal = preFeeTotal + platformFeeAmt;
const totalWithDeduction = grandTotal - advanceAmt - (isEdit ? paidAmt : 0);


  /* guard: are all the numbers we're about to send actually valid? */
  const calculationsValid =
    !isNaN(subtotal) && !isNaN(discountAmt) && !isNaN(taxAmt) &&
    !isNaN(platformFeeAmt) && !isNaN(grandTotal) &&
    platformFeePct >= 0 && platformFeePct <= 100;

  // const fmt = (n) => (isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));


  const MAX_QTY = 1e5;
const MAX_RATE = 1e8;            // 10 crore per unit
const MAX_INVOICE_TOTAL = 1e10;  // adjust to whatever your gateway allows

const fmtFull = (n) =>
  isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Short display for huge numbers, full value stays in the tooltip (title)
const fmt = (n) => {
  if (isNaN(n)) return "0.00";
  const abs = Math.abs(n);
  if (abs >= COMPACT_FROM) {
    const u = BIG_UNITS.find((u) => abs >= u.v);
    if (u) return `${(n / u.v).toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${u.n}`;
  }
  return fmtFull(n);
};



  const setItem = (idx, field, val) =>

    
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = idx => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
const handleItemNumber = (idx, field, max, label) => (e) => {
  const v = e.target.value;
  if (v === "") return setItem(idx, field, "");
  if (!/^\d*(\.\d{0,2})?$/.test(v)) return;            // digits + max 2 decimals
  if (Number(v) > max) {
    setItem(idx, field, String(max));
    push(`${label} can't be more than ${fmtFull(max)}`, "error");
    return;
  }
  setItem(idx, field, v);
};
  const handleInvoiceDateChange = (val) => {
    setForm(f => {
      const dueOk = !f.due_date || f.due_date >= val;
      return { ...f, invoice_date: val, due_date: dueOk ? f.due_date : val };
    });
  };
  const handleDueDateChange = (val) => {
    if (form.invoice_date && val < form.invoice_date) { push("Due date can't be before the invoice date", "error"); return; }
    setForm(f => ({ ...f, due_date: val }));
  };

  const handleConfirmSend = async (currency) => {
    await handleSave(false, currency);
    setShowSendModal(false);
  };
  const INV_FIELD_LABELS = {
  customer_id: "Customer",
  invoice_date: "Invoice Date",
  due_date: "Due Date",
  items: "Item Details",
  invoice_prefix: "Invoice Prefix",
  platform_fee: "Platform Fee",
    advance_amount: "Advance Amount", 
};

/* Strict validation: used only when sending, never for drafts */
const validateInvoice = () => {
  const e = {};
  if (!form.customer_id) e.customer_id = "Please select a guest";
  if (!form.invoice_date) e.invoice_date = "Invoice date is required";
  if (!form.due_date) e.due_date = "Due date is required";
  if (form.due_date && form.invoice_date && form.due_date < form.invoice_date)
    e.due_date = "Due date can't be before the invoice date";
  if (form.items.some(i => !i.product_name || !i.amount))
    e.items = "Fill product name and amount for every row";
  if (!isEdit && !invoicePrefix.trim()) e.invoice_prefix = "Invoice prefix is required";
  if (platformFeePct > 100 || platformFeePct < 0 || isNaN(platformFeePct))
    e.platform_fee = "Platform fee must be between 0% and 100%";
  if (!calculationsValid) e.platform_fee = e.platform_fee || "Recheck the amounts before saving";
  if (advanceEnabled && advanceAmt > preFeeTotal)
    e.advance_amount = "Advance can't exceed the invoice total";

  setErrors(e);
  if (Object.keys(e).length > 0) {
    const names = Object.keys(e).map(k => INV_FIELD_LABELS[k] || k).join(", ");
    push(`Please fix: ${names}`, "error");
    return false;
  }
  return true;
};




const cleanDraftPayload = (payload) => {
  if (!payload.customer_id) delete payload.customer_id;
  if (!payload.invoice_date) delete payload.invoice_date;
  if (!payload.due_date) delete payload.due_date;
  payload.items = (payload.items || []).filter(i => i.product_name || i.amount);
  return payload;
};

const handleSave = async (asDraft = false, currency = null) => {
  if (asDraft) setErrors({});               // draft: no restrictions
  else if (!validateInvoice()) return;      // send: full validation

  setSaving(true);
    try {
      if (isEdit) {
        const payload = {
          ...form, invoice_id: id,
          discount_percentage: discountEnabled ? parseFloat(form.discount || 0) : 0,
          tax_percentage: form.tax_enabled ? parseFloat(form.gst_percentage || 0) : 0,
          total_amount: parseFloat(subtotal.toFixed(2)),
          grand_total_amount: parseFloat(grandTotal.toFixed(2)),
          tax_amount: parseFloat(taxAmt.toFixed(2)),
          discount_amount: parseFloat(discountAmt.toFixed(2)),
          customer_type: customerType,
          platform_fee_percentage: parseFloat(platformFeePct.toFixed(2)),
          platform_fee_amount: parseFloat(platformFeeAmt.toFixed(2)),
          status: asDraft ? "draft" : "sent",
        };
        if (currency) payload.invoice_currency = currency;
        delete payload.terms;
        delete payload.discount;
        delete payload.gst_percentage;
        if (!payload.department_id) delete payload.department_id;
        if (!advanceEnabled || !payload.advance_amount) delete payload.advance_amount;
        else payload.advance_amount = advanceAmt;
        if (!payload.paid_amount) delete payload.paid_amount; 
        else payload.manual_paid_amount = paidAmt;
        delete payload.paid_amount;
        if (asDraft) cleanDraftPayload(payload);
        await api.put("/invoices/update_invoice", payload);
        push(asDraft ? "Draft saved" : "Invoice updated", "success");
        setTimeout(() => navigate(`/invoices/${id}`), 700);
      } else {
        const payload = {
          ...form,
          invoice_prefix: invoicePrefix,
          invoice_number: `${invoicePrefix}-${invoiceNumberPart}`,
          change_upcoming_invoice_prefix: changeUpcomingPrefix,
          discount_percentage: discountEnabled ? parseFloat(form.discount || 0) : 0,
          tax_percentage: form.tax_enabled ? parseFloat(form.gst_percentage || 0) : 0,
          total_amount: parseFloat(subtotal.toFixed(2)),
          grand_total_amount: parseFloat(grandTotal.toFixed(2)),
          tax_amount: parseFloat(taxAmt.toFixed(2)),
          discount_amount: parseFloat(discountAmt.toFixed(2)),
          customer_type: customerType,
          platform_fee_percentage: parseFloat(platformFeePct.toFixed(2)),
          platform_fee_amount: parseFloat(platformFeeAmt.toFixed(2)),
          status: asDraft ? "draft" : "sent",
        };
        if (currency) payload.invoice_currency = currency;
        delete payload.terms;
        delete payload.paid_amount;
        delete payload.discount;
        delete payload.gst_percentage;
        if (!payload.department_id) delete payload.department_id;
        if (!advanceEnabled || !payload.advance_amount) delete payload.advance_amount;
        else payload.advance_amount = advanceAmt;
        if (paidAmt > 0) payload.manual_paid_amount = paidAmt;
        delete payload.paid_amount;
        if (asDraft) cleanDraftPayload(payload);
        await api.post("/invoices/", payload);
        push(asDraft ? "Draft saved" : "Invoice created", "success");
        setTimeout(() => navigate("/invoices"), 700);
      }
    } catch (err) {
      push(getErrorMessage(err, isEdit ? "Failed to update invoice" : "Failed to create invoice"), "error");
    } finally { setSaving(false); }
  };

  if (pageLoading) {
    return (
      <div className="z-page">
        <style>{CSS}</style>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          {[220, 400, 300].map((w, i) => (
            <div key={i} className="z-skel" style={{ width: w, height: i === 0 ? 20 : 80, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="z-page">

        {/* Page header */}
        <div className="z-page-hd">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="z-page-title">{isEdit ? "Edit Invoice" : "New Invoice"}</h1>
          </div>
          <button className="z-btn-icon" onClick={() => navigate("/invoices")} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="z-body">

          {/* Customer Name row */}
          <div className="z-form-row z-customer-row">
            <label className="z-field-label z-required-label">Guest Name</label>
            <div className="z-customer-inputs">
              <div className="z-combo-wrap">
                <CustomerCombo
                  customers={customers}
                  value={form.customer_id}
                  onChange={(cid) => { setForm(f => ({ ...f, customer_id: cid })); setPlatformFeeTouched(false); }}
                  onAddNew={() => setShowAddCustomer(true)}
                />
                <button type="button" className="z-search-icon-btn" title="Search guest">
                  <Search size={14} color="#fff" />
                </button>
              </div>
{departments.length > 0 && (
  <div className="z-dept-select">
    <SelectDropdown
      value={form.department_id}
      options={departments.map(d => ({ value: d.department_id, label: d.department_name }))}
      placeholder="Department"
      onChange={(v) => setForm(f => ({ ...f, department_id: v }))}
    />
  </div>
)}
              {form.customer_id && (
                <span className={`z-ctype-tag ${customerType === "international" ? "z-ctype-intl" : "z-ctype-dom"}`}>
                  {customerType === "international" ? <Globe2 size={12} /> : <Home size={12} />}
                  {customerType === "international" ? "International" : "Domestic"}
                </span>
              )}
            </div>
          </div>

          {/* Invoice # row */}
          <div className="z-form-row">
            <label className="z-field-label z-required-label">Invoice#</label>

            {isEdit ? (
              <div className="z-input-icon-wrap" style={{ maxWidth: 340 }}>
                <input className="z-input" value={invoiceNumber} disabled
                  style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed", paddingRight: 32 }} />
                <span className="z-input-suffix-icon"><Settings size={14} color="#3b82f6" /></span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", maxWidth: 540 }}>
                  <input
                    className="z-input"
                    style={{ width: 100, borderRadius: "4px 0 0 4px", textAlign: "center", fontWeight: 600 }}
                    value={invoicePrefix}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setInvoicePrefix(val);
                      if (val.trim() === originalPrefix.trim()) setChangeUpcomingPrefix(false);
                    }}
                    placeholder="PREFIX"
                  />
                  <span style={{
                    height: 32, display: "flex", alignItems: "center", padding: "0 8px",
                    color: "#6b7280", fontWeight: 600,
                  }}>-</span>
                  <input
                    className="z-input"
                    disabled
                    style={{ width: 120, borderRadius: "0 4px 4px 0", background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }}
                    value={invoiceNumberPart}
                  />

                  {isPrefixEdited && (
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer", marginLeft: 12 }}>
                      <input type="checkbox" className="z-checkbox"
                        checked={changeUpcomingPrefix}
                        onChange={e => setChangeUpcomingPrefix(e.target.checked)} />
                      Apply this prefix to all upcoming invoices
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Date / Due Date row */}
          <div className="z-form-row z-dates-row">
            <label className="z-field-label z-required-label">Invoice Date</label>
            <input className="z-input z-date-input" type="date"
              value={form.invoice_date} onChange={e => handleInvoiceDateChange(e.target.value)} />
            <label className="z-field-label z-mid-label">Due Date</label>
            <input className="z-input z-date-input" type="date"
              min={form.invoice_date || undefined}
              value={form.due_date} onChange={e => handleDueDateChange(e.target.value)} />
          </div>

          {/* Item Table */}
          <div className="z-item-table">
            <div className="z-item-table-hd">
              <span className="z-item-table-title">Item Table</span>
            </div>

            <div className="z-col-hd">
              <div className="z-col-details">ITEM DETAILS</div>
              <div className="z-col-qty">QUANTITY</div>
              <div className="z-col-rate">RATE</div>
              <div className="z-col-amt">AMOUNT</div>
            </div>

            {/* {form.items.map((item, idx) => {
              const lineTotal = parseFloat(item.quantity || 0) * parseFloat(item.amount || 0);
              return (
                <div className="z-item-row" key={idx}>
                  <div className="z-drag-handle">⠿</div>
                  <div className="z-col-details z-item-details-cell">
                    <input
                      className="z-item-name-inp"
                      placeholder="Type or click to select an item."
                      value={item.product_name}
                      onChange={e => setItem(idx, "product_name", e.target.value)}
                    />
                  </div>
                  <div className="z-col-qty z-item-num-cell">
                    <input type="number" min="1" className="z-item-num-inp"
                      value={item.quantity}
                      onFocus={clearZeroOnFocus(() => item.quantity, (v) => setItem(idx, "quantity", v))}
                      onChange={e => setItem(idx, "quantity", e.target.value)} />
                  </div>
                  <div className="z-col-rate z-item-num-cell">
                    <input type="number" min="0" placeholder="0.00" className="z-item-num-inp"
                      value={item.amount}
                      onFocus={clearZeroOnFocus(() => item.amount, (v) => setItem(idx, "amount", v))}
                      onChange={e => setItem(idx, "amount", e.target.value)} />
                  </div>
                  <div className="z-col-amt z-item-amt-cell">
                    <span>{fmt(lineTotal)}</span>
                    {form.items.length > 1 && (
                      <button className="z-del-row-btn" onClick={() => removeItem(idx)} title="Remove">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })} */}



            {form.items.map((item, idx) => {
  const lineTotal = parseFloat(item.quantity || 0) * parseFloat(item.amount || 0);
  return (
    <div className="z-item-row" key={idx}>
      <div className="z-drag-handle">⠿</div>
      <div className="z-col-details z-item-details-cell">
        <span className="z-mobile-label">Item Details</span>
        <AutoTextarea
          className="z-item-name-inp"
          placeholder="Type or click to select an item."
          value={item.product_name}
          onChange={e => setItem(idx, "product_name", e.target.value)}
        />
      </div>
      <div className="z-col-qty z-item-num-cell">
        <span className="z-mobile-label">Quantity</span>
        <input type="text" inputMode="decimal" className="z-item-num-inp"
          value={item.quantity}
          onFocus={clearZeroOnFocus(() => item.quantity, (v) => setItem(idx, "quantity", v))}
          onChange={handleItemNumber(idx, "quantity", MAX_QTY, "Quantity")} />
      </div>
      <div className="z-col-rate z-item-num-cell">
        <span className="z-mobile-label">Rate</span>
        <input type="text" inputMode="decimal" placeholder="0.00" className="z-item-num-inp"
          value={item.amount}
          onFocus={clearZeroOnFocus(() => item.amount, (v) => setItem(idx, "amount", v))}
          onChange={handleItemNumber(idx, "amount", MAX_RATE, "Rate")} />
      </div>
      <div className="z-col-amt z-item-amt-cell">
        <span className="z-mobile-label">Amount</span>
        <span className="z-item-line-total" title={fmtFull(lineTotal)}>{fmt(lineTotal)}</span>
        {form.items.length > 1 && (
          <button className="z-del-row-btn" onClick={() => removeItem(idx)} title="Remove">
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
})}

            <div className="z-table-footer">
              <button className="z-add-row-btn" onClick={addItem}>
                <span className="z-plus-circle"><Plus size={9} color="#fff" /></span>
                Add New Row
                <ChevronDown size={12} color="#374151" />
              </button>
            </div>
          </div>

          {/* Bottom: notes left + summary right */}
          <div className="z-bottom">

            {/* Left: notes + terms */}
            <div className="z-notes-col">
              <div className="z-notes-block">
                <label className="z-section-label"> Notes for Guest</label>
                <textarea className="z-textarea"
                  placeholder="Your comfort is our priority."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                <span className="z-helper">Will be displayed on the invoice</span>
              </div>

              {!showTerms ? (
                <button className="z-add-row-btn" onClick={() => setShowTerms(true)}>
                  <span className="z-plus-circle"><Plus size={9} color="#fff" /></span>
                  Add Terms and conditions
                </button>
              ) : (
                <div className="z-notes-block">
                  <label className="z-section-label">Terms &amp; Conditions</label>
                  <textarea className="z-textarea"
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                    value={form.terms_and_conditions}
                    onChange={e => setForm(f => ({ ...f, terms_and_conditions: e.target.value }))} />
                </div>
              )}
            </div>

            {/* Right: summary */}
            <div className="z-summary-col">

              <div className={`z-summary-panel${showSummary ? " open" : ""}`}>
                <div className="z-sum-row">
                  <span className="z-sum-label-bold">Sub Total</span>
                  <span className="z-sum-val-bold">{fmt(subtotal)}</span>
                </div>

                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <button
                      className={`z-toggle-sm ${discountEnabled ? "on" : "off"}`}
                      onClick={() => {
                        setDiscountEnabled(v => !v);
                        if (discountEnabled) setForm(f => ({ ...f, discount: 0 }));
                      }}
                    />
                    <span className="z-sum-label">Discount</span>
                  </div>
                  <div className="z-sum-right">
                    {discountEnabled && (
                      <div className="z-disc-group">
<input
  className="z-disc-inp"
  type="number"
  min="0"
  max="100"
  value={form.discount}
  onFocus={clearZeroOnFocus(() => form.discount, (v) => setForm(f => ({ ...f, discount: v })))}
  onChange={handlePercentChange("discount", "Discount")}
/>
                          
                        <span className="z-disc-pct">%</span>
                      </div>
                    )}
                    <span className="z-sum-val">{fmt(discountAmt)}</span>
                  </div>
                </div>

                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <button
                      className={`z-toggle-sm ${form.tax_enabled ? "on" : "off"}`}
                      onClick={() => setForm(f => ({ ...f, tax_enabled: !f.tax_enabled }))}
                    />
                    <span className="z-sum-label">GST / Tax</span>
                  </div>
                  <div className="z-sum-right">
                    {form.tax_enabled && (
                      <div className="z-disc-group">
<input
  className="z-disc-inp"
  type="number"
  min="0"
  max="100"
  value={form.gst_percentage}
  onFocus={clearZeroOnFocus(() => form.gst_percentage, (v) => setForm(f => ({ ...f, gst_percentage: v })))}
  onChange={handlePercentChange("gst_percentage", "GST")}
/>
                        <span className="z-disc-pct">%</span>
                      </div>
                    )}
                    <span className="z-sum-val">{fmt(taxAmt)}</span>
                  </div>
                </div>

                {/* ── Platform / Razorpay convenience fee row (auto from profile) ── */}
                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <span className={`z-fee-dot ${customerType === "international" ? "z-fee-dot-intl" : "z-fee-dot-dom"}`} />
                    <span className="z-sum-label">
                      Platform Fee
                      <span className="z-fee-sub">
                        {customerType === "international" ? "International rate" : "Domestic rate"}
                      </span>
                    </span>
                    <span className="z-info-dot" tabIndex={0}>
                      <Info size={11} />
<span className="z-info-tip">
  Auto-filled from your profile's convenience fee settings for {customerType} guests. Calculated only on the balance amount via Razorpay (advance is excluded). You can override it for this invoice — max 100%.
</span>
                    </span>
                  </div>
                  <div className="z-sum-right">
                    <div className="z-disc-group">
                      <input className="z-disc-inp" type="number" min="0" max="100"
                        value={platformFeePercentage}
                        onFocus={clearZeroOnFocus(() => platformFeePercentage, setPlatformFeePercentage)}
                        onChange={handlePlatformFeeChange} />
                      <span className="z-disc-pct">%</span>
                    </div>
                    <span className="z-sum-val">{fmt(platformFeeAmt)}</span>
                  </div>
                </div>
                {platformFeeError && (
                  <div className="z-fee-err"><AlertTriangle size={11} /> {platformFeeError}</div>
                )}

{/* <div className="z-sum-row z-advance-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
    <div className="z-sum-label-wrap">
      <input
        type="checkbox"
        className="z-checkbox"
        id="advance-check"
        checked={advanceEnabled}
        disabled={isEdit}
        onChange={e => {
          setAdvanceEnabled(e.target.checked);
          if (!e.target.checked) setForm(f => ({ ...f, advance_amount: "" }));
        }}
      />
      <label htmlFor="advance-check" className="z-sum-label" style={{ cursor: isEdit ? "default" : "pointer" }}>
        Advance Amount
      </label>
    </div>
    <div className={`z-advance-inp-wrap${advanceEnabled ? " show" : ""}`}>
      <input className="z-disc-inp" type="number" min="0" placeholder="0.00"
        value={form.advance_amount}
        disabled={isEdit}
        style={isEdit ? { background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" } : undefined}
        onFocus={clearZeroOnFocus(() => form.advance_amount, (v) => setForm(f => ({ ...f, advance_amount: v })))}
        onChange={e => setForm(f => ({ ...f, advance_amount: e.target.value }))} />
    </div>
  </div>

  {isEdit ? (
    <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 4 }}>
      Advance amount is set only once when the invoice is created and can't be changed later.
    </div>
  ) : (
    advanceEnabled && (
      <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 4 }}>
        You can only set this once — double-check the amount, as it can't be edited after the invoice is created.
      </div>
    )
  )}
</div> */}


<div className="z-advance-block">
  <div className="z-advance-top">
    <div className="z-sum-label-wrap">
      <button
        type="button"
        className={`z-toggle-sm ${advanceEnabled ? "on" : "off"}`}
        disabled={isEdit}
        onClick={() => {
          setAdvanceEnabled(v => !v);
          if (advanceEnabled) setForm(f => ({ ...f, advance_amount: "" }));
        }}
      />
      <span className="z-sum-label">Advance Amount</span>
    </div>
    {advanceEnabled && <span className="z-sum-val">{fmt(advanceAmt)}</span>}
  </div>

  {advanceEnabled && (
    <div className="z-advance-card">
      <div className={`z-advance-field${advanceAmt > preFeeTotal ? " err" : ""}${isEdit ? " locked" : ""}`}>
        <span className="z-advance-cur">₹</span>
        <input
          type="number" min="0" placeholder="Enter advance amount"
          value={form.advance_amount}
          disabled={isEdit}
          onChange={handleAdvanceChange}
        />
        {!isEdit && (
          <button
            type="button" className="z-advance-max"
            onClick={() => setForm(f => ({ ...f, advance_amount: String(parseFloat(preFeeTotal.toFixed(2))) }))}
          >
            Max
          </button>
        )}
      </div>

      <div className="z-advance-meta">
        <span>Invoice total <b>₹{fmt(preFeeTotal)}</b></span>
        <span>Remaining <b>₹{fmt(Math.max(preFeeTotal - advanceAmt, 0))}</b></span>
      </div>

      {advanceAmt > preFeeTotal && (
        <div className="z-advance-warn"><AlertTriangle size={12} /> Advance is more than the invoice total</div>
      )}

      <div className="z-advance-note">
        <Info size={11} />
        {isEdit
          ? "Advance is set once at creation and can't be changed later."
          : "Can only be set once. Double-check the amount before saving."}
      </div>
    </div>
  )}
</div>

                {isEdit && (
                  <div className="z-sum-row" style={{ borderBottom: "none" }}>
                    <span className="z-sum-label">Paid Amount (₹)</span>
                    <input className="z-disc-inp" type="number" min="0" placeholder="0.00"
                      value={form.paid_amount}
                      disabled={isEdit}
                      onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} />
                  </div>
                )}
              </div>

              <div className="z-total-line">
                <span className="z-total-label">Total ( ₹ )</span>
                <span className="z-total-val">{fmt(grandTotal)}</span>
              </div>

              <div className="z-summary-toggle-row">
                <button className="z-summary-toggle" onClick={() => setShowSummary(s => !s)}>
                  {showSummary ? "Hide Total Summary" : "Show Total Summary"}
                  {showSummary ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {showSummary && (advanceAmt > 0 || (isEdit && paidAmt > 0)) && (
                <div className="z-balance-row">
                  <span className="z-sum-label-bold">Balance Due</span>
                  <span className="z-sum-val-bold">₹{fmt(totalWithDeduction)}</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="z-footer">
          <button className="z-btn-ghost" onClick={() => handleSave(true)} disabled={saving}>Save as Draft</button>
<button className="z-btn-blue z-send-btn" onClick={() => { if (validateInvoice()) setShowSendModal(true); }} disabled={saving}>
            Save and Send <ChevronDown size={13} />
          </button>
          <button className="z-btn-ghost" onClick={() => navigate("/invoices")} disabled={saving}>Cancel</button>
        </div>
      </div>

      {showAddCustomer && (
        <AddCustomerModal
          push={push}
          onClose={() => setShowAddCustomer(false)}
          onCreated={(newCustomer) => {
            setCustomers(c => [...c, newCustomer]);
            setForm(f => ({ ...f, customer_id: newCustomer.customer_id || newCustomer.id }));
            setPlatformFeeTouched(false);
            setShowAddCustomer(false);
          }}
        />
      )}

      {showSendModal && (
        <SendInvoiceModal
          open={showSendModal}
          onClose={() => setShowSendModal(false)}
          onConfirm={handleConfirmSend}
          sending={saving}
        />
      )}

      <ToastHost />
    </>
  );
}

/* ═══════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════ */
	export const CSS =`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.z-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #333;
}

/* Page header */
.z-page-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; border-bottom: 1px solid #e8e8e8; background: #fff;
}
.z-page-title { font-size: 20px; font-weight: 600; color: #1a1a2e; }
.z-btn-icon { background: none; border: none; cursor: pointer; color: #777; padding: 6px; border-radius: 4px; display: flex; }
.z-btn-icon:hover { background: #f3f4f6; color: #333; }

.z-body { flex: 1; overflow-y: auto; padding: 0 24px 100px; }

@keyframes z-shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
.z-skel { background: #e9eaf0; border-radius: 4px; animation: z-shimmer 1.3s infinite; }

/* FORM ROWS */
.z-form-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap;
}
.z-field-label {
  width: 130px; flex-shrink: 0; font-size: 13px;
  font-weight: 500; color: #555; white-space: nowrap;
}
.z-required-label { color: #e53535; }
.z-mid-label { width: auto; min-width: 70px; color: #555; }

.z-customer-row { padding: 14px 0; }
.z-customer-inputs { display: flex; align-items: center; gap: 10px; flex: 1; flex-wrap: wrap; }
.z-combo-wrap { display: flex; align-items: stretch; flex: 1; max-width: 520px; min-width: 240px; }
.z-dept-select { width: 180px; flex-shrink: 0; }

.z-ctype-tag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; flex-shrink: 0;
}
.z-ctype-dom { background: #ecfdf5; color: #059669; }
.z-ctype-intl { background: #eff6ff; color: #2563eb; }

/* Customer combo */
.z-combo { position: relative; flex: 1; }
.z-combo-trigger {
  width: 100%; height: 32px; display: flex; align-items: center; justify-content: space-between;
  border: 1px solid #d0d5dd; border-right: none; border-radius: 4px 0 0 4px;
  padding: 0 10px; background: #fff; cursor: pointer; gap: 8px; font-size: 13px; color: #333;
}
.z-combo-trigger:hover { border-color: #2563eb; }
.z-combo-sel { display: flex; align-items: center; gap: 7px; min-width: 0; }
.z-avatar {
  width: 22px; height: 22px; border-radius: 50%; background: #dbeafe; color: #2563eb;
  font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.z-combo-names { display: flex; flex-direction: column; min-width: 0; }
.z-cname { font-size: 13px; font-weight: 500; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.z-cemail { font-size: 11px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.z-combo-ph { font-size: 13px; color: #9ca3af; }

.z-combo-panel {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); overflow: hidden;
}
.z-combo-search-row { display: flex; align-items: center; gap: 7px; padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
.z-combo-search { border: none; outline: none; font-size: 13px; width: 100%; color: #111; font-family: 'Inter',sans-serif; }
.z-combo-list { max-height: 200px; overflow-y: auto; padding: 4px; }
.z-combo-empty { padding: 12px 10px; font-size: 12px; color: #9ca3af; text-align: center; }
.z-combo-opt { width: 100%; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 5px; border: none; background: none; cursor: pointer; text-align: left; }
.z-combo-opt:hover, .z-combo-opt.active { background: #eff6ff; }
.z-combo-add { width: 100%; display: flex; align-items: center; gap: 7px; padding: 8px 12px; border: none; border-top: 1px solid #f3f4f6; background: #f9fafb; color: #2563eb; font-size: 12px; font-weight: 600; cursor: pointer; }
.z-combo-add:hover { background: #eff6ff; }

.z-search-icon-btn {
  width: 34px; height: 32px; flex-shrink: 0;
  background: #2563eb; border: 1px solid #2563eb; border-radius: 0 4px 4px 0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.z-search-icon-btn:hover { background: #1d4ed8; }

/* Inputs / selects */
.z-input {
  height: 32px; border: 1px solid #d0d5dd; border-radius: 4px;
  padding: 0 9px; font-size: 13px; font-family: 'Inter',sans-serif; color: #333;
  background: #fff; outline: none; width: 100%;
}
.z-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.15); }
.z-input::placeholder { color: #adb5bd; }

.z-select {
  height: 32px; border: 1px solid #d0d5dd; border-radius: 4px;
  padding: 0 28px 0 9px; font-size: 13px; font-family: 'Inter',sans-serif; color: #333;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 9px center;
  appearance: none; outline: none; cursor: pointer;
}
.z-select:focus { border-color: #2563eb; }

.z-input-icon-wrap { position: relative; display: inline-block; width: 100%; }
.z-input-suffix-icon { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); display: flex; pointer-events: none; }

.z-dates-row { gap: 16px; }
.z-date-input { width: 150px; flex-shrink: 0; }

/* ITEM TABLE */
.z-item-table {
  border: 1px solid #e8e8e8; border-radius: 4px; margin: 16px 0 0; overflow: hidden;
}
.z-item-table-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: #fff;
}
.z-item-table-title { font-size: 14px; font-weight: 600; color: #1a1a2e; }

.z-col-hd {
  display: grid;
  grid-template-columns: minmax(0,1fr) 110px minmax(130px,200px) minmax(150px,280px);
  padding-left: 20px;
  background: #f9fafb; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8;
}
.z-col-hd > div {
  padding: 8px 12px; font-size: 11px; font-weight: 600;
  color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;
}
.z-col-qty, .z-col-rate, .z-col-amt { text-align: right; }

.z-item-row {
  display: grid;
  grid-template-columns: 20px minmax(0,1fr) 110px minmax(130px,200px) minmax(150px,280px);
  border-bottom: 1px solid #f0f0f0; align-items: center; min-height: 52px;
}
.z-item-row:last-child { border-bottom: none; }
.z-item-row:hover { background: #fafafa; }

.z-drag-handle { color: #ccc; font-size: 14px; padding: 0 0 0 8px; cursor: grab; user-select: none; display: flex; align-items: center; }
.z-col-details { padding: 10px 12px; }
.z-col-qty, .z-col-rate, .z-col-amt { padding: 10px 12px; text-align: right; }

.z-item-details-cell { display: flex; flex-direction: column; gap: 4px; }
.z-item-name-inp {
  border: none; outline: none; background: transparent;
  font-size: 13px; color: #111; width: 100%; font-family: 'Inter',sans-serif; padding: 2px 0;
    resize: none; overflow: hidden; display: block; line-height: 1.4;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.z-item-name-inp::placeholder { color: #adb5bd; }

.z-item-num-cell { display: flex; justify-content: flex-end; align-items: center; }
.z-item-num-inp {
  border: none; outline: none; background: transparent;
  font-size: 13px; color: #111; font-family: 'Inter',sans-serif; text-align: right; width: 100%;
}
.z-item-num-inp::-webkit-outer-spin-button, .z-item-num-inp::-webkit-inner-spin-button { -webkit-appearance: none; }

.z-item-amt-cell {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 6px; font-size: 13px; font-weight: 600; color: #111; padding-right: 12px;
}
.z-del-row-btn {
  background: none; border: none; cursor: pointer; color: #ccc; padding: 2px; border-radius: 3px;
  display: flex; align-items: center; opacity: 0;
}
.z-item-row:hover .z-del-row-btn { opacity: 1; }
.z-del-row-btn:hover { color: #ef4444; background: #fef2f2; }

.z-table-footer {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #fff; border-top: 1px solid #f0f0f0;
}

.z-add-row-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid #d0d5dd; border-radius: 4px;
  padding: 0 12px; height: 32px; font-size: 13px; font-weight: 500;
  color: #374151; cursor: pointer; font-family: 'Inter',sans-serif;
}
.z-add-row-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
.z-plus-circle {
  width: 16px; height: 16px; border-radius: 50%;
  background: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* BOTTOM */
.z-bottom { display: flex; gap: 40px; margin-top: 20px; align-items: flex-start; flex-wrap: wrap; }
.z-notes-col { flex: 1 1 320px; display: flex; flex-direction: column; gap: 14px; }
.z-notes-block { display: flex; flex-direction: column; gap: 6px; }
.z-section-label { font-size: 12px; font-weight: 500; color: #555; }
.z-textarea {
  border: 1px solid #d0d5dd; border-radius: 4px;
  padding: 7px 9px; font-size: 13px; font-family: 'Inter',sans-serif;  
  resize: vertical; min-height: 68px; color: #333; outline: none;
}
.z-textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.12); }
.z-helper { font-size: 11px; color: #adb5bd; }

/* SUMMARY COLUMN */
.z-summary-col { flex: 1 1 380px; max-width: 420px; display: flex; flex-direction: column; }

.z-summary-panel {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.35s ease, opacity 0.25s ease;
}
.z-summary-panel.open {
  max-height: 640px;
  opacity: 1;
}

.z-toggle-sm:disabled { opacity: .5; cursor: not-allowed; }

.z-advance-block { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.z-advance-top { display: flex; justify-content: space-between; align-items: center; min-height: 28px; }

.z-advance-card {
  margin-top: 10px; padding: 12px; background: #f8fafc;
  border: 1px solid #e5e7eb; border-radius: 10px;
  display: flex; flex-direction: column; gap: 8px;
}
.z-advance-field {
  display: flex; align-items: center; height: 42px; background: #fff;
  border: 1.5px solid #d0d5dd; border-radius: 8px; overflow: hidden;
  transition: border-color .15s, box-shadow .15s;
}
.z-advance-field:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
.z-advance-field.err { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.z-advance-field.locked { background: #f3f4f6; }
.z-advance-cur {
  height: 100%; padding: 0 12px; display: flex; align-items: center;
  background: #f3f4f6; color: #6b7280; font-weight: 600; border-right: 1px solid #e5e7eb;
}
.z-advance-field input {
  flex: 1; min-width: 0; height: 100%; border: none; outline: none; background: transparent;
  padding: 0 12px; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif; color: #111;
}
.z-advance-field input::-webkit-outer-spin-button,
.z-advance-field input::-webkit-inner-spin-button { -webkit-appearance: none; }
.z-advance-max {
  margin-right: 6px; padding: 5px 10px; border: none; border-radius: 6px;
  background: #eaf1ff; color: #2563eb; font-size: 11.5px; font-weight: 700; cursor: pointer;
}
.z-advance-max:hover { background: #dbeafe; }
.z-advance-meta { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
.z-advance-meta b { color: #111; font-weight: 600; }
.z-advance-warn { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #ef4444; font-weight: 500; }
.z-advance-note { display: flex; align-items: flex-start; gap: 5px; font-size: 10.5px; color: #9ca3af; line-height: 1.4; }
.z-advance-note svg { margin-top: 1px; flex-shrink: 0; }

.z-sum-row {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  font-size: 13px; padding: 9px 0; border-bottom: 1px solid #f3f4f6; min-height: 40px;
}
.z-sum-row:first-child { border-top: 1px solid #e8e8e8; }
.z-sum-label-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
.z-sum-label { color: #6b7280; font-size: 13px; display: flex; flex-direction: column; line-height: 1.3; }
.z-fee-sub { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.03em; }
.z-sum-label-bold { font-size: 13px; font-weight: 600; color: #111; }
.z-sum-val { font-size: 13px; color: #111; font-weight: 500; min-width: 70px; text-align: right; }
.z-sum-val-bold { font-size: 13px; font-weight: 700; color: #111; }
.z-sum-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.z-fee-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.z-fee-dot-dom { background: #059669; }
.z-fee-dot-intl { background: #2563eb; }

.z-info-dot {
  position: relative; width: 15px; height: 15px; border-radius: 50%;
  background: #f3f4f6; color: #6b7280; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; cursor: default; outline: none;
}
.z-info-dot:hover, .z-info-dot:focus { background: #eaf1ff; color: #2563eb; }
.z-info-tip {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px);
  background: #1f2937; color: #fff; font-size: 11px; font-weight: 500; line-height: 1.45;
  padding: 9px 11px; border-radius: 8px; width: 210px; text-align: left;
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease; box-shadow: 0 10px 26px rgba(0,0,0,0.22); z-index: 40;
}
.z-info-dot:hover .z-info-tip, .z-info-dot:focus .z-info-tip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

.z-fee-err {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: #ef4444; padding: 2px 0 6px;
}

.z-toggle-sm {
  width: 28px; height: 16px; border-radius: 8px; border: none; cursor: pointer;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.z-toggle-sm.on { background: #2563eb; }
.z-toggle-sm.off { background: #d1d5db; }
.z-toggle-sm::after {
  content: ''; position: absolute; top: 2px; width: 12px; height: 12px;
  background: #fff; border-radius: 50%; transition: left 0.2s;
}
.z-toggle-sm.on::after { left: 14px; }
.z-toggle-sm.off::after { left: 2px; }

.z-disc-group { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
.z-disc-inp {
  width: 60px; height: 28px; border: 1px solid #d0d5dd; border-radius: 4px 0 0 4px;
  padding: 0 7px; font-size: 12px; font-family: 'Inter',sans-serif; color: #333;
  outline: none; background: #fff; text-align: right;
}
.z-disc-inp:focus { border-color: #2563eb; }
.z-disc-pct {
  height: 28px; padding: 0 7px; background: #f3f4f6; border: 1px solid #d0d5dd;
  border-left: none; border-radius: 0 4px 4px 0; font-size: 12px; color: #6b7280;
  display: flex; align-items: center;
}

.z-checkbox {
  width: 15px; height: 15px; border: 1px solid #d0d5dd; border-radius: 3px;
  cursor: pointer; accent-color: #2563eb; flex-shrink: 0;
}

.z-advance-row { flex-wrap: wrap; gap: 6px; }
.z-advance-inp-wrap {
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  transition: max-width 0.3s ease, opacity 0.25s ease;
  display: flex; align-items: center;
}
.z-advance-inp-wrap.show { max-width: 120px; opacity: 1; }
.z-advance-inp-wrap .z-disc-inp { border-radius: 4px; width: 90px; }

.z-total-line {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-top: 1px solid #e8e8e8; margin-top: 2px;
}
.z-total-label { font-size: 14px; font-weight: 500; color: #555; }
.z-total-val { font-size: 16px; font-weight: 600; color: #333; }

.z-summary-toggle-row { display: flex; justify-content: flex-end; }
.z-summary-toggle {
  background: none; border: none; color: #2563eb; font-size: 12px; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; gap: 3px;
  padding: 4px 0; font-family: inherit;
}
.z-summary-toggle:hover { text-decoration: underline; }

.z-balance-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-top: 1px solid #e8e8e8; margin-top: 8px;
}

/* FOOTER */
.z-footer {
  position: sticky; bottom: 0; left: 0; right: 0;
  background: #fff; border-top: 1px solid #e8e8e8;
  padding: 10px 24px; display: flex; align-items: center; gap: 10px; z-index: 20;
}
.z-btn-blue {
  height: 34px; padding: 0 16px; background: #2563eb; color: #fff; border: none;
  border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
}
.z-btn-blue:hover:not(:disabled) { background: #1d4ed8; }
.z-btn-blue:disabled { opacity: 0.7; cursor: not-allowed; }
.z-send-btn { border-radius: 4px 0 0 4px; }
.z-btn-ghost {
  height: 34px; padding: 0 16px; background: #fff; color: #374151;
  border: 1px solid #d0d5dd; border-radius: 4px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Inter',sans-serif;
}
.z-btn-ghost:hover:not(:disabled) { border-color: #9ca3af; background: #f9fafb; }
.z-btn-ghost:disabled { opacity: 0.7; cursor: not-allowed; }

/* ADD CUSTOMER MODAL */
.zc-overlay {
  position: fixed; inset: 0; background: rgba(17,17,26,0);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
  transition: background 0.2s ease;
}
.zc-overlay.show { background: rgba(17,17,26,0.5); }

.zc-modal {
  background: #fff; border-radius: 14px; width: 100%; max-width: 620px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22); max-height: 92vh;
  display: flex; flex-direction: column; font-family: 'Inter',sans-serif;
  transform: scale(0.94) translateY(8px); opacity: 0;
  transition: transform 0.22s cubic-bezier(.22,1,.36,1), opacity 0.18s ease;
}
.zc-modal.show { transform: scale(1) translateY(0); opacity: 1; }

.zc-hd {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
.zc-hd-left { display: flex; gap: 12px; align-items: flex-start; }
.zc-hd-icon {
  width: 38px; height: 38px; border-radius: 10px; background: #eff6ff;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.zc-title { font-size: 16px; font-weight: 700; color: #111; }
.zc-subtitle { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.zc-x {
  border: none; background: none; color: #9ca3af; cursor: pointer;
  display: flex; padding: 6px; border-radius: 6px; flex-shrink: 0;
}
.zc-x:hover { background: #f3f4f6; color: #374151; }

.zc-body { padding: 18px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }

.zc-section { display: flex; flex-direction: column; gap: 10px; }
.zc-section-hd {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700; color: #2563eb;
  text-transform: uppercase; letter-spacing: 0.04em;
}

.zc-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.zc-field { display: flex; flex-direction: column; gap: 5px; }
.zc-label { font-size: 12px; font-weight: 600; color: #555; }

.zc-input {
  height: 36px; border: 1px solid #d0d5dd; border-radius: 7px;
  padding: 0 11px; font-size: 13px; font-family: inherit; color: #333;
  outline: none; width: 100%; transition: border-color 0.15s, box-shadow 0.15s;
}
.zc-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.zc-input.err { border-color: #ef4444; }

.zc-input-icon {
  display: flex; align-items: center; gap: 8px;
  height: 36px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 11px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.zc-input-icon:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.zc-input-plain {
  border: none; outline: none; background: transparent; width: 100%;
  font-size: 13px; font-family: 'Inter',sans-serif; color: #333;
}
.zc-input-plain.err { color: #ef4444; }

.zc-err { font-size: 11px; color: #ef4444; margin-top: 1px; }

.zc-ft {
  display: flex; gap: 10px; padding: 14px 20px;
  border-top: 1px solid #f0f0f0; flex-shrink: 0; background: #fff;
}

.z-mobile-label { display: none; }

@media (max-width: 560px) {
  .zc-row2 { grid-template-columns: 1fr; }
}

/* ── TABLET (1024 and down) ── */
@media (max-width: 1024px) {
  .z-summary-col { max-width: 100%; }
  .z-bottom { gap: 24px; }
  .z-body { padding: 0 18px 100px; }
  .z-page-hd { padding: 12px 18px; }
.z-col-hd { grid-template-columns: minmax(0,1fr) 90px 110px 120px; }
.z-item-row { grid-template-columns: 20px minmax(0,1fr) 90px 110px 120px; }
}

/* ── TABLET PORTRAIT / LARGE PHONE (900 and down) ── */
@media (max-width: 900px) {
  .z-customer-inputs { gap: 8px; }
  .z-combo-wrap { min-width: 200px; }
  .z-dept-select { width: 150px; }
  .z-footer { gap: 8px; }
}
/* ── TABLET / SMALL LAPTOP FORM STACKING (768 and down) ── */

@media (max-width: 768px) {
  .z-page-hd { padding: 10px 14px; }
  .z-page-title { font-size: 17px; }
  .z-body { padding: 0 10px 120px; }

  .z-bottom { flex-direction: column; gap: 24px; }
  .z-summary-col { flex: 1 1 100%; max-width: 100%; }

  /* Form rows stack label above field */
  .z-form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 10px 0;
  }
  .z-field-label { width: 100%; }
  .z-mid-label { margin-top: 4px; }
  .z-customer-inputs { width: 100%; }
  .z-combo-wrap { width: 100%; min-width: 0; max-width: 100%; }
  .z-dept-select { width: 100%; }

  /* Dates row full stack */
  .z-dates-row { flex-direction: column; align-items: stretch; gap: 12px; }
  .z-date-input { width: 100%; }

  /* Invoice # row: prefix/number inputs shrink to fit */
  .z-form-row input[placeholder="PREFIX"] { width: 90px !important; }

  /* Item table → stacked card rows */
  .z-item-table-hd { padding: 10px 12px; }
  .z-col-hd { display: none; }
  .z-item-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    position: relative;
    min-height: 0;
  }
  .z-drag-handle { display: none; }
  .z-col-details, .z-col-qty, .z-col-rate, .z-col-amt {
    padding: 0;
    text-align: left;
    width: 100%;
  }
  .z-item-num-cell, .z-item-details-cell { justify-content: flex-start; flex-direction: column; align-items: stretch; }
  .z-item-name-inp {
    border: 1px solid #d0d5dd; border-radius: 6px; padding: 8px 10px;
  }
  .z-item-num-inp {
    border: 1px solid #d0d5dd; border-radius: 6px; padding: 8px 10px; text-align: left;
  }
  .z-mobile-label {
    display: block; font-size: 10.5px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px;
  }
  .z-item-amt-cell {
    flex-direction: row; align-items: center; justify-content: space-between;
    padding-top: 8px; border-top: 1px dashed #e5e7eb; margin-top: 2px;
  }
  .z-item-line-total { font-size: 14px; font-weight: 700; }
  .z-del-row-btn {
    opacity: 1; position: static; width: 30px; height: 30px;
    border: 1px solid #fecaca; border-radius: 6px; color: #ef4444;
  }
  .z-table-footer { padding: 10px 12px; }
  .z-add-row-btn { width: 100%; justify-content: center; }

  /* Summary block */
  .z-sum-row { min-height: auto; padding: 10px 0; flex-wrap: wrap; row-gap: 6px; }
  .z-sum-label-wrap { width: 100%; }
  .z-sum-right { width: 100%; justify-content: space-between; }
  .z-total-val { font-size: 18px; }

  /* Sticky footer stacks, primary action first */
  .z-footer {
    flex-direction: column;
    padding: 10px 14px;
    gap: 8px;
  }
  .z-footer button {
    width: 100%;
    height: 42px;
    justify-content: center;
  }
  .z-send-btn { order: -1; border-radius: 4px; }

  /* Add-customer modal → near-fullscreen sheet */
  .zc-overlay { padding: 0; align-items: flex-end; }
  .zc-modal {
    max-width: 100%; width: 100%; border-radius: 16px 16px 0 0;
    max-height: 94vh;
  }
  .zc-row2 { gap: 10px; }
  .zc-body { padding: 14px 16px; gap: 14px; }
  .zc-ft { padding: 12px 16px; }
}

/* ── MOBILE (640 and down): item table becomes stacked cards ── */
@media (max-width: 640px) {
  .z-page-hd { padding: 10px 14px; }
  .z-page-title { font-size: 17px; }
  .z-body { padding: 0 10px 120px; }

  /* Form rows stack label above field */
  .z-form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 10px 0;
  }
  .z-field-label { width: 100%; }
  .z-mid-label { margin-top: 4px; }
  .z-customer-inputs { width: 100%; }
  .z-combo-wrap { width: 100%; min-width: 0; max-width: 100%; }
  .z-dept-select { width: 100%; }

  /* Dates row full stack */
  .z-dates-row { flex-direction: column; align-items: stretch; }
  .z-date-input { width: 100%; }

  /* Invoice # row: prefix/number inputs shrink to fit */
  .z-form-row input[placeholder="PREFIX"] { width: 90px !important; }

  /* Item table → stacked card rows */
  .z-item-table-hd { padding: 10px 12px; }
  .z-col-hd { display: none; }
  .z-item-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    position: relative;
    min-height: 0;
  }
  .z-drag-handle { display: none; }
  .z-col-details, .z-col-qty, .z-col-rate, .z-col-amt {
    padding: 0;
    text-align: left;
    width: 100%;
  }
  .z-item-num-cell, .z-item-details-cell { justify-content: flex-start; flex-direction: column; align-items: stretch; }
  .z-item-name-inp {
    border: 1px solid #d0d5dd; border-radius: 6px; padding: 8px 10px;
  }
  .z-item-num-inp {
    border: 1px solid #d0d5dd; border-radius: 6px; padding: 8px 10px; text-align: left;
  }
  .z-mobile-label {
    display: block; font-size: 10.5px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px;
  }
  .z-item-amt-cell {
    flex-direction: row; align-items: center; justify-content: space-between;
    padding-top: 8px; border-top: 1px dashed #e5e7eb; margin-top: 2px;
  }
  .z-item-line-total { font-size: 14px; font-weight: 700; }
  .z-del-row-btn {
    opacity: 1; position: static; width: 30px; height: 30px;
    border: 1px solid #fecaca; border-radius: 6px; color: #ef4444;
  }
  .z-table-footer { padding: 10px 12px; }
  .z-add-row-btn { width: 100%; justify-content: center; }

  /* Summary block */
  .z-sum-row { min-height: auto; padding: 10px 0; }
  .z-sum-label-wrap { width: 100%; }
  .z-sum-right { width: 100%; justify-content: space-between; }
  .z-total-val { font-size: 18px; }

  /* Sticky footer stacks, primary action first */
  .z-footer {
    flex-direction: column;
    padding: 10px 14px;
    gap: 8px;
  }
  .z-footer button {
    width: 100%;
    height: 42px;
    justify-content: center;
  }
  .z-send-btn { order: -1; border-radius: 4px; }

  /* Add-customer modal → near-fullscreen sheet */
  .zc-overlay { padding: 0; align-items: flex-end; }
  .zc-modal {
    max-width: 100%; width: 100%; border-radius: 16px 16px 0 0;
    max-height: 94vh;
  }
  .zc-row2 { gap: 10px; }
  .zc-body { padding: 14px 16px; gap: 14px; }
  .zc-ft { padding: 12px 16px; }
}

/* ── VERY SMALL PHONES (420 and down) ── */
@media (max-width: 420px) {
  .z-ctype-tag { font-size: 11px; padding: 4px 8px; }
  .z-item-name-inp, .z-item-num-inp { font-size: 13px; }
  .z-disc-inp { width: 54px; }
}

/* send invoice modal */

/* send invoice modal */
@keyframes ib-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ib-modal-pop { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.ib-modal-overlay {
  position: fixed; inset: 0; background: rgba(17,24,39,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  animation: ib-fade-in 0.18s ease-out;
}
.ib-modal {
  background: #fff; width: 420px; max-width: 92vw; border-radius: 14px;
  box-shadow: 0 20px 60px rgba(17,24,39,0.25);
  animation: ib-modal-pop 0.22s cubic-bezier(.2,.9,.3,1.2);
  font-family: 'Inter', sans-serif;
}
.ib-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #E9EBF1; border-radius: 14px 14px 0 0; }
.ib-modal-header h3 { font-size: 16px; font-weight: 800; color: #111827; }
.ib-modal-close { border: none; background: none; font-size: 22px; line-height: 1; color: #9AA1AF; cursor: pointer; }
.ib-modal-body { padding: 18px 20px; }
.ib-modal-sub { font-size: 12.5px; color: #6B7280; margin-bottom: 14px; line-height: 1.5; }
.ib-modal-label { display: block; font-size: 11.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
.ib-currency-select { position: relative; }
.ib-currency-select input {
  width: 100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #E9EBF1;
  font-size: 13.5px; font-weight: 600; color: #1F1740; outline: none; transition: border-color 0.15s;
}
.ib-currency-select input:focus { border-color: #2563eb; }
.ib-currency-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff;
  border: 1px solid #E9EBF1; border-radius: 10px; box-shadow: 0 12px 32px rgba(17,24,39,0.14);
  max-height: 0; overflow-y: auto; opacity: 0; transform: translateY(-4px);
  transition: max-height 0.2s ease, opacity 0.15s ease, transform 0.15s ease; z-index: 400; pointer-events: none;
}
.ib-currency-dropdown.open { max-height: 220px; opacity: 1; transform: translateY(0); pointer-events: auto; }
.ib-currency-option { padding: 9px 12px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; transition: background 0.1s; }
.ib-currency-option:hover, .ib-currency-option.active { background: #EAF1FD; color: #2563eb; }
.ib-currency-empty { padding: 12px; font-size: 12.5px; color: #9AA1AF; text-align: center; }
.ib-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid #E9EBF1; background: #FAFBFD; border-radius: 0 0 14px 14px; }
.ib-toolbtn { display: flex; align-items: center; gap: 6px; background: none; border: none; padding: 7px 11px; border-radius: 7px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; transition: background 0.12s; }
.ib-toolbtn:hover { background: #EDEFF4; }
.ib-toolbtn-primary { background: #2563eb; color: #fff; }
.ib-toolbtn-primary:hover { background: #1d4ed8; }
.ib-toolbtn-primary:disabled { opacity: 0.55; cursor: not-allowed; }














/* overflow protection */
.z-col-details, .z-item-num-cell, .z-item-amt-cell { min-width: 0; }
.z-item-num-inp { min-width: 0; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.z-item-line-total {
  flex: 1; min-width: 0; text-align: right;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.z-sum-right { min-width: 0; }
.z-sum-val, .z-sum-val-bold {
  min-width: 0; text-align: right;
  overflow-wrap: anywhere; font-variant-numeric: tabular-nums;
}
.z-total-line { gap: 12px; }
.z-total-val { text-align: right; overflow-wrap: anywhere; }
`;