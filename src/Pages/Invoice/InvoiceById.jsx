








import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../Stays/Rooms/Room_Shared";
import { useAccess } from "../../services/AccessContext";


const STATUS_COLOR = {
  paid: { bg: "#DCFCE7", color: "#15803D", ribbon: "#22C55E" },
  overdue: { bg: "#FEE2E2", color: "#DC2626", ribbon: "#EF4444" },
  sent: { bg: "#DBEAFE", color: "#2563EB", ribbon: "#3B82F6" },
  draft: { bg: "#F3F4F6", color: "#6B7280", ribbon: "#9CA3AF" },
};

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

const ZERO_DECIMAL = [
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
];
const getDigits = (cur) => (ZERO_DECIMAL.includes(cur) ? 0 : 2);
const roundTo = (n, cur) => {
  const f = 10 ** getDigits(cur);
  return Math.round(n * f) / f;
};

const fmt = (n, currency = "INR") => {
  const digits = getDigits(currency);
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline" }}>
      <span style={{ fontSize: "0.72em", fontWeight: 600, color: "#6B7280", marginRight: "3px", textTransform: "uppercase" }}>
        {currency}
      </span>
      <span>
        {parseFloat(n || 0).toLocaleString("en-IN", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })}
      </span>
    </span>
  );
};

const extractDate = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object" && raw.$date !== undefined) return raw.$date;
  return raw;
};

const displayDate = (raw) => {
  const d = new Date(extractDate(raw));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { timeZone: "UTC" });
};

/* ── number → words ── */
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numToWords(num) {
  num = Math.round(num);
  if (num === 0) return "Zero";
  const twoDigits = (n) => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  const threeDigits = (n) => (n >= 100 ? ONES[Math.floor(n / 100)] + " Hundred " + twoDigits(n % 100) : twoDigits(n)).trim();
  let str = "";
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const hundred = num;
  if (crore) str += threeDigits(crore) + " Crore ";
  if (lakh) str += threeDigits(lakh) + " Lakh ";
  if (thousand) str += threeDigits(thousand) + " Thousand ";
  if (hundred) str += threeDigits(hundred);
  return str.trim();
}
const MINOR_UNIT = {
  INR: "Paise", GBP: "Pence", AED: "Fils", SAR: "Halalas", QAR: "Dirhams",
  KWD: "Fils", BHD: "Fils", OMR: "Baisa", JOD: "Fils", EGP: "Piastres",
  PKR: "Paisa", BDT: "Poisha", LKR: "Cents", NPR: "Paisa",
  USD: "Cents", EUR: "Cents", AUD: "Cents", CAD: "Cents", SGD: "Cents",
};

const DIGIT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

function totalInWords(amount, currency = "INR") {
  const label = currency === "INR" ? "Indian Rupee" : currency;
  const digits = getDigits(currency);
  const factor = 10 ** digits;
  const total = Math.round(parseFloat(amount || 0) * factor);
  const whole = Math.floor(total / factor);
  const frac = total % factor;
  const words = `${label} ${numToWords(whole)}`;
  if (digits === 0 || frac === 0) return `${words} Only`;

  const minor = MINOR_UNIT[currency];
  if (minor) {
    // e.g. "Indian Rupee Five Hundred Seventeen and Fifty Paise Only"
    return `${words} and ${numToWords(frac)} ${minor} Only`;
  }
  // e.g. "USD Twelve Point Twenty Four Only" / "Point Zero Five"
  const pointWords = frac < 10 ? `Zero ${numToWords(frac)}` : numToWords(frac);
  return `${words} Point ${pointWords} Only`;
}
const getWatermark = (status) => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "paid") return { text: "PAID", color: "rgba(34, 197, 94, 0.055)" };
  if (s === "sent") return { text: "PENDING", color: "rgba(245, 158, 11, 0.055)" };
  if (s === "overdue") return { text: "OVERDUE", color: "rgba(220, 38, 38, 0.055)" };
  if (s === "draft") return { text: "DRAFT", color: "rgba(107, 114, 128, 0.045)" };
  return null;
};

/* ── Dynamic html2pdf loader ── */
const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => resolve(window.html2pdf);
    script.onerror = () => reject(new Error("Could not load HTML2PDF library"));
    document.body.appendChild(script);
  });
};

/* Helper to convert image URL/element to Base64 data URL */
const convertImageToBase64 = (imgUrl) => {
  return new Promise((resolve) => {
    if (!imgUrl) return resolve(null);
    if (imgUrl.startsWith("data:image")) return resolve(imgUrl);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        fetchBlobBase64(imgUrl).then(resolve);
      }
    };
    img.onerror = () => {
      fetchBlobBase64(imgUrl).then(resolve);
    };
    img.src = imgUrl;
  });
};

const fetchBlobBase64 = (url) => {
  return fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => null);
};

/* ── icons ── */
function ChevronDownIcon({ size = 13, color = "#4584E5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MoreDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.6" fill="#1F2937" />
      <circle cx="12" cy="12" r="1.6" fill="#1F2937" />
      <circle cx="19" cy="12" r="1.6" fill="#1F2937" />
    </svg>
  );
}

/* ── PDF/Print split-dropdown ── */
function PdfPrintMenu({ onDownload, onPrint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="ib-toolbtn" onClick={() => setOpen(o => !o)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
        </svg>
        PDF/Print
        <ChevronDownIcon size={11} color="#6B7280" />
      </button>
      {open && (
        <div className="ib-toolmenu">
          <button className="ib-toolmenu-item" onClick={() => { setOpen(false); onDownload(); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4584E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Download PDF
          </button>
          <button className="ib-toolmenu-item" onClick={() => { setOpen(false); onPrint(); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4584E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
            Print
          </button>
        </div>
      )}
    </div>
  );
}

/* ── More actions menu ── */
function MoreMenu({ onDelete, canDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      {/* <button className="ib-icon-btn" onClick={() => setOpen(o => !o)} title="More">
        <MoreDotsIcon />
      </button> */}
      {open && (
        <div className="ib-toolmenu" style={{ right: 0, left: "auto" }}>
          <button className="ib-toolmenu-item" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4584E5" strokeWidth="1.8" strokeLinecap="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
            Print
          </button>
          {canDelete && (
          <button className="ib-toolmenu-item ib-toolmenu-danger" onClick={() => { setOpen(false); onDelete(); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" /></svg>
            Delete
          </button>
          )}
        </div>
      )}
    </div>
  );
}

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

function CurrencySelectInput({ value, onChange, currencies, loadingList }) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
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
    <div className="ib-currency-select" ref={boxRef}>
      <input
        type="text"
        placeholder={loadingList ? "Loading currencies…" : "Search by code, currency or country…"}
        value={value ? currencyLabel(value) : search}
        onChange={(e) => { setSearch(e.target.value); onChange(null); setDropdownOpen(true); }}
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
              className={`ib-currency-option${value === c ? " active" : ""}`}
              onClick={() => { onChange(c); setSearch(""); setDropdownOpen(false); }}
            >
              <span style={{ fontWeight: 700 }}>{c}</span>
              {info && (<>{" - "}{info.name}<span style={{ color: "#9AA1AF", fontWeight: 500 }}> ({info.country})</span></>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SendInvoiceModal({ open, onClose, onConfirm, sending, currentCurrency, currencies, loadingList }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (!open) return;
    setSelected(currentCurrency || null);
  }, [open, currentCurrency]);
  if (!open) return null;
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
          <CurrencySelectInput value={selected} onChange={setSelected} currencies={currencies} loadingList={loadingList} />
          {currentCurrency && <div className="ib-modal-hint">Current invoice currency: {currencyLabel(currentCurrency)}</div>}
        </div>
        <div className="ib-modal-footer">
          <button className="ib-toolbtn" onClick={onClose}>Cancel</button>
          <button className="ib-toolbtn ib-toolbtn-primary" disabled={!selected || sending} onClick={() => onConfirm(selected)}>
            {sending ? "Sending…" : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResendConfirmModal({ open, onClose, onConfirm, sending, currentCurrency, currencies, loadingList }) {
  const [changeCurrency, setChangeCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState(null);
  useEffect(() => {
    if (!open) return;
    setChangeCurrency(false);
    setNewCurrency(null);
  }, [open]);
  if (!open) return null;
  const handleYes = () => {
    if (changeCurrency && !newCurrency) return;
    onConfirm(changeCurrency ? newCurrency : currentCurrency);
  };
  return (
    <div className="ib-modal-overlay" onClick={onClose}>
      <div className="ib-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ib-modal-header">
          <h3>Resend Invoice</h3>
          <button className="ib-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="ib-modal-body">
          <p className="ib-modal-sub">
            This invoice was already sent{currentCurrency ? ` in ${currencyLabel(currentCurrency)}` : ""}.
            Do you want to send it again?
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", marginTop: 4 }}>
            <input
              type="checkbox"
              checked={changeCurrency}
              onChange={(e) => { setChangeCurrency(e.target.checked); setNewCurrency(null); }}
            />
            Change currency before sending
          </label>
          {changeCurrency && (
            <div style={{ marginTop: 12 }}>
              <label className="ib-modal-label">New Invoice Currency</label>
              <CurrencySelectInput value={newCurrency} onChange={setNewCurrency} currencies={currencies} loadingList={loadingList} />
              {newCurrency && (
                <div className="ib-modal-hint">PDF and invoice will be updated to {currencyLabel(newCurrency)} before sending.</div>
              )}
            </div>
          )}
        </div>
        <div className="ib-modal-footer">
          <button className="ib-toolbtn" onClick={onClose}>No, Cancel</button>
          <button
            className="ib-toolbtn ib-toolbtn-primary"
            disabled={sending || (changeCurrency && !newCurrency)}
            onClick={handleYes}
          >
            {sending ? "Sending…" : "Yes, Send Again"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();
  const { can } = useAccess();
const canCreate = can("invoice", "create");
const canUpdate = can("invoice", "update");
const canDelete = can("invoice", "delete");
const canExport = can("invoice", "export");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [viewCurrency, setViewCurrency] = useState("INR");
  const [fxRates, setFxRates] = useState(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencyOptionsLoading, setCurrencyOptionsLoading] = useState(false);

  useEffect(() => {
    setCurrencyOptionsLoading(false);
    setCurrencyOptions(RAZORPAY_CURRENCY_CODES);
  }, []);

  useEffect(() => {
    api.get("/profile/get_profile")
      .then(r => setProfile(r.data?.data || null))
      .catch(() => setProfile(null));
  }, []);

  const [invoiceList, setInvoiceList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const fetchInvoice = () => {
    setLoading(true);
    api.get(`/invoices/get_invoice?invoice_id=${id}`)
      .then(r => {
        const data = r.data?.data || r.data;
        setInvoice(data);
      })
      .catch((err) => push(getErrorMessage(err, "Could not load invoice"), "error"))
      .finally(() => setLoading(false));
  };

  const fetchList = () => {
    setListLoading(true);
    api.get("/invoices/")
      .then(r => {
        const list = r.data?.data || r.data || [];
        setInvoiceList(Array.isArray(list) ? list : []);
      })
      .catch(() => setInvoiceList([]))
      .finally(() => setListLoading(false));
  };

  useEffect(() => { fetchInvoice(); }, [id]);
  useEffect(() => { fetchList(); }, []);

  useEffect(() => {
    if (!invoice) return;
    const target = invoice.invoice_currency || invoice.currency || "INR";
    if (target === "INR") { setFxRates(null); return; }
    setFxLoading(true);
    fetch(`https://open.er-api.com/v6/latest/INR`)
      .then((r) => r.json())
      .then((d) => setFxRates(d.result === "success" ? d.rates : null))
      .catch(() => setFxRates(null))
      .finally(() => setFxLoading(false));
  }, [invoice]);

  const invoiceAdvanceAmt = parseFloat(invoice?.advance_amount || 0);
  const invoiceManualPaidAmt = parseFloat(invoice?.manual_paid_amount || 0); 
  const invoiceBalanceDue = invoice?.balance_amount !== undefined
    ? parseFloat(invoice.balance_amount || 0)
    : parseFloat(invoice?.grand_total_amount || 0) - invoiceAdvanceAmt;
  const invoicePaidAmt = parseFloat(invoice?.paid_amount || 0);

  const handleConfirmSend = async (currency) => {
    if (!invoice || !currency) return;
    setSending(true);
    try {
      await api.put("/invoices/update_invoice", { invoice_id: id, invoice_currency: currency, status: "sent" });
      push("Invoice sent", "success");
      setShowSendModal(false);
      fetchInvoice();
    } catch (err) {
      push(getErrorMessage(err, "Could not send invoice"), "error");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await api.delete(`/invoices/delete_invoice?invoice_id=${id}`);
      push("Invoice deleted", "success");
      navigate("/invoices");
    } catch (err) {
      push(getErrorMessage(err, "Could not delete invoice"), "error");
    }
  };

  const watermark = getWatermark(invoice?.status);

  /* ── 100% Guaranteed Logo + Pixel-Perfect PDF Export ── */
// const handleDownloadPDF = async () => {
//   if (!invoice) return;
//   setDownloading(true);
//   try {
//     const html2pdf = await loadHtml2Pdf();

//     const logoEl = document.querySelector(".ib-logo-img");
//     const originalLogoSrc = logoEl?.src;

//     const sigEl = document.querySelector(".ib-signature-img");
//     const originalSigSrc = sigEl?.src;

//     // Convert logo to Base64 to bypass CORS taint in html2canvas
//     if (logoEl && originalLogoSrc) {
//       const base64Data = await convertImageToBase64(originalLogoSrc);
//       if (base64Data) logoEl.src = base64Data;
//     }

//     // Convert signature to Base64 too
//     if (sigEl && originalSigSrc) {
//       const sigBase64 = await convertImageToBase64(originalSigSrc);
//       if (sigBase64) sigEl.src = sigBase64;
//     }

//     const element = document.querySelector(".ib-paper");

// const opt = {
//   margin: [6, 6, 6, 6],
//   filename: `Invoice-${invoice.invoice_number || invoice.invoice_id?.slice(0, 8) || "document"}.pdf`,
//   image: { type: "jpeg", quality: 0.98 },
//   html2canvas: {
//     scale: 2,
//     useCORS: true,
//     allowTaint: true,
//     logging: false,
//     scrollY: 0,
//     scrollX: 0,
//     windowWidth: 1100,
//     onclone: (clonedDoc) => {
//       const paper = clonedDoc.querySelector(".ib-paper");
//       if (!paper) return;

//       // fixed A4 content width, no min-height (stops blank page 2)
//       paper.style.width = "186mm";
//       paper.style.maxWidth = "186mm";
//       paper.style.minHeight = "0";
//       paper.style.height = "auto";
//       paper.style.margin = "0";
//       paper.style.padding = "28px 24px";
//       paper.style.boxSizing = "border-box";
//       paper.style.overflow = "visible";
//       paper.style.border = "none";
//       paper.style.boxShadow = "none";
//       paper.style.borderRadius = "0";

//       // stop amounts from wrapping/clipping
//       paper.querySelectorAll(".ib-items-table td.num, .ib-items-table th.num, .ib-totals-row span")
//         .forEach((el) => { el.style.whiteSpace = "nowrap"; });

//       // slimmer totals column so the table fits the width
//       const grid = paper.querySelector(".ib-bottom-grid");
//       if (grid) grid.style.gridTemplateColumns = "1fr 230px";

//       // widen Rate / Amount columns a bit
//       const ths = paper.querySelectorAll(".ib-items-table thead th");
//       if (ths.length >= 2) {
//         ths[ths.length - 2].style.width = "120px";
//         ths[ths.length - 1].style.width = "130px";
//       }
//     },
//   },
//   pagebreak: { mode: ["avoid-all", "css"] },
//   jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
// };

//     await html2pdf().set(opt).from(element).save();

//     // Restore original srcs
//     if (logoEl && originalLogoSrc) logoEl.src = originalLogoSrc;
//     if (sigEl && originalSigSrc) sigEl.src = originalSigSrc;
//   } catch (err) {
//     console.error(err);
//     push("Could not generate PDF", "error");
//   } finally {
//     setDownloading(false);
//   }
// };




const handleDownloadPDF = async () => {
  if (!invoice) return;
  setDownloading(true);

  const logoEl = document.querySelector(".ib-logo-img");
  const sigEl = document.querySelector(".ib-signature-img");
  const originalLogoSrc = logoEl?.src;
  const originalSigSrc = sigEl?.src;

  try {
    const html2pdf = await loadHtml2Pdf();

    // base64 images first so the clone gets them (avoids CORS taint)
    if (logoEl && originalLogoSrc) {
      const b64 = await convertImageToBase64(originalLogoSrc);
      if (b64) logoEl.src = b64;
    }
    if (sigEl && originalSigSrc) {
      const b64 = await convertImageToBase64(originalSigSrc);
      if (b64) sigEl.src = b64;
    }

    // detached clone, sized by html2pdf's own A4 container
    const clone = document.querySelector(".ib-paper").cloneNode(true);
    clone.style.cssText += `
      width: 100%; max-width: none; min-width: 0;
      min-height: 0; height: auto; margin: 0;
      padding: 24px 20px; box-sizing: border-box;
      border: none; box-shadow: none; border-radius: 0;
      overflow: hidden; background: #fff;
    `;
    clone
      .querySelectorAll(".ib-items-table td.num, .ib-items-table th.num, .ib-totals-row span")
      .forEach((el) => { el.style.whiteSpace = "nowrap"; });

    const opt = {
      margin: [6, 6, 6, 6],
      filename: `Invoice-${invoice.invoice_number || invoice.invoice_id?.slice(0, 8) || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
      },
      pagebreak: { mode: ["avoid-all", "css"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(clone).save();
  } catch (err) {
    console.error(err);
    push("Could not generate PDF", "error");
  } finally {
    if (logoEl && originalLogoSrc) logoEl.src = originalLogoSrc;
    if (sigEl && originalSigSrc) sigEl.src = originalSigSrc;
    setDownloading(false);
  }
};
  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ padding: 40, fontFamily: "'Lato',sans-serif" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
      {[200, 140, 300].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 20 : 14, background: "#E9EAF0", borderRadius: 6, width: w, marginBottom: 12, animation: "shimmer 1.3s infinite" }} />
      ))}
    </div>
  );

  if (!invoice) return (
    <div style={{ padding: 40, textAlign: "center", color: "#6B7280", fontFamily: "'Lato',sans-serif" }}>
      Invoice not found.
    </div>
  );

  const statusStyle = STATUS_COLOR[invoice.status] || STATUS_COLOR.draft;
  const isRoom = invoice.room_booking === true;
  const customerName = invoice.customer_details?.name || invoice.customer_details?.customer_name || null;
   const lineQty = (item) => (isRoom ? 1 : parseFloat(item.quantity || 0));
  const subtotal = (invoice.items || []).reduce((s, i) => s + lineQty(i) * parseFloat(i.amount || 0), 0);
  const invCurrency = invoice.invoice_currency || invoice.currency || "INR";
  const displayCurrency = viewCurrency === "INR" ? "INR" : invCurrency;

const convert = (amount) => {
  const n = parseFloat(amount || 0);
  if (invCurrency === "INR" || viewCurrency === "INR") return roundTo(n, "INR");
  const rate = fxRates?.[invCurrency];
  return roundTo(rate ? n * rate : n, invCurrency);
};

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;800&display=swap" />
      <style>{`
        :root {
          --c-primary: #4584E5;
          --c-primary-dark: #3568C4;
          --c-primary-light: #EAF1FD;
          --c-border: #E9EBF1;
        }
        * { font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .ib-shell { display: grid; grid-template-columns: 270px 1fr; height: calc(100vh - 56px); background: #F5F6FA; }
        @media (max-width: 900px) { .ib-shell { grid-template-columns: 1fr; } .ib-sidelist { display: none; } }
        .ib-sidelist { background: #fff; border-right: 1px solid var(--c-border); overflow-y: auto; }
        .ib-sidelist-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid var(--c-border);
        }
        .ib-sidelist-title { display: flex; align-items: center; gap: 5px; font-size: 15px; font-weight: 700; color: #111827; cursor: pointer; }
        .ib-sidelist-newsplit { display: flex; border-radius: 7px; overflow: hidden; }
        .ib-sidelist-new { background: var(--c-primary); border: none; color: #fff; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .ib-sidelist-new:hover { background: var(--c-primary-dark); }
        .ib-side-item {
          display: flex; flex-direction: column; gap: 3px; padding: 12px 16px;
          border-bottom: 1px solid #F1F2F6; cursor: pointer; transition: background 0.12s;
        }
        .ib-side-item:hover { background: #F7F9FC; }
        .ib-side-item.active { background: var(--c-primary-light); border-left: 3px solid var(--c-primary); padding-left: 13px; }
        .ib-side-item-top { display: flex; justify-content: space-between; align-items: center; }
        .ib-side-item-name { font-size: 13.5px; font-weight: 700; color: #1F2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ib-side-item-amt { font-size: 13px; font-weight: 700; color: #1F2937; flex-shrink: 0; }
        .ib-side-item-meta { font-size: 11.5px; color: #9AA1AF; display: flex; gap: 6px; align-items: center; }
        .ib-side-item-status { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
        .ib-docpane { overflow-y: auto; display: flex; flex-direction: column; }
        .ib-toolbar {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          padding: 14px 24px; background: #fff; border-bottom: 1px solid var(--c-border);
          position: sticky; top: 0; z-index: 20;
        }
        .ib-toolbar-title { display: flex; align-items: center; gap: 10px; }
        .ib-doc-num { font-size: 19px; font-weight: 800; color: #111827; }
        .ib-toolbar-icons { display: flex; gap: 8px; align-items: center; }
        .ib-icon-btn {
          width: 32px; height: 32px; border-radius: 7px; border: 1px solid var(--c-border);
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6B7280; transition: background 0.12s;
        }
        .ib-icon-btn:hover { background: #F5F7FB; }
        .ib-actionbar {
          display: flex; align-items: center; gap: 6px; padding: 10px 24px;
          background: #FAFBFD; border-bottom: 1px solid var(--c-border); flex-wrap: wrap;
          position: sticky; top: 61px; z-index: 19;
        }
        .ib-toolbtn {
          display: flex; align-items: center; gap: 6px; background: none; border: none;
          padding: 7px 11px; border-radius: 7px; font-size: 13px; font-weight: 600; color: #374151;
          cursor: pointer; transition: background 0.12s;
        }
        .ib-toolbtn:hover { background: #EDEFF4; }
        .ib-toolbtn-primary { background: var(--c-primary); color: #fff; }
        .ib-toolbtn-primary:hover { background: var(--c-primary-dark); }
        .ib-toolbtn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ib-toolmenu {
          position: absolute; top: 38px; left: 0; background: #fff; border: 1px solid var(--c-border);
          border-radius: 10px; box-shadow: 0 12px 32px rgba(17,24,39,0.14); min-width: 190px; padding: 5px; z-index: 300;
        }
        .ib-toolmenu-item {
          display: flex; align-items: center; gap: 9px; width: 100%; padding: 9px 10px;
          border-radius: 7px; border: none; background: transparent; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #1F2937; text-align: left; transition: background 0.12s;
        }
        .ib-toolmenu-item:hover { background: #F5F7FB; }
        .ib-toolmenu-danger { color: #DC2626; }
        .ib-currency-toggle { display: flex; border: 1.5px solid var(--c-border); border-radius: 8px; overflow: hidden; }
        .ib-currency-toggle button {
          border: none; background: #fff; padding: 7px 13px; font-size: 12.5px; font-weight: 700;
          color: #6B7280; cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .ib-currency-toggle button.active { background: var(--c-primary); color: #fff; }
        .ib-modal-overlay {
          position: fixed; inset: 0; background: rgba(17,24,39,0.45);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .ib-modal {
          background: #fff; width: 420px; max-width: 92vw; border-radius: 14px;
          box-shadow: 0 20px 60px rgba(17,24,39,0.25);
        }
        .ib-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--c-border); }
        .ib-modal-header h3 { font-size: 16px; font-weight: 800; color: #111827; }
        .ib-modal-close { border: none; background: none; font-size: 22px; line-height: 1; color: #9AA1AF; cursor: pointer; }
        .ib-modal-body { padding: 18px 20px; }
        .ib-modal-sub { font-size: 12.5px; color: #6B7280; margin-bottom: 14px; line-height: 1.5; }
        .ib-modal-label { display: block; font-size: 11.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
        .ib-currency-select { position: relative; }
        .ib-currency-select input {
          width: 100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid var(--c-border);
          font-size: 13.5px; font-weight: 600; color: #1F1740; outline: none; box-sizing: border-box;
        }
        .ib-currency-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff;
          border: 1px solid var(--c-border); border-radius: 10px; box-shadow: 0 12px 32px rgba(17,24,39,0.14);
          max-height: 0; overflow-y: auto; opacity: 0; transform: translateY(-4px);
          transition: max-height 0.2s ease, opacity 0.15s ease; z-index: 400; pointer-events: none;
        }
        .ib-currency-dropdown.open { max-height: 220px; opacity: 1; transform: translateY(0); pointer-events: auto; }
        .ib-currency-option { padding: 9px 12px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; }
        .ib-currency-option:hover, .ib-currency-option.active { background: var(--c-primary-light); color: var(--c-primary-dark); }
        .ib-currency-empty { padding: 12px; font-size: 12.5px; color: #9AA1AF; text-align: center; }
        .ib-modal-hint { margin-top: 10px; font-size: 12px; color: #9AA1AF; }
        .ib-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--c-border); background: #FAFBFD; }
        .ib-paper-wrap { flex: 1; padding: 40px 20px; display: flex; justify-content: center; overflow-y: auto; }
        .ib-paper {
          background: #fff;
          width: 100%;
          max-width: 210mm;
          min-height: 297mm;
          border: 1px solid var(--c-border);
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(17,24,39,0.08);
          position: relative;
          overflow: hidden;
          padding: 50px 48px;
          margin: 0 auto;
        }
        .ib-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 110px; font-weight: 900; pointer-events: none; user-select: none;
          z-index: 0; text-transform: uppercase; white-space: nowrap; letter-spacing: 8px;
        }
        .ib-ribbon-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 90px;
          height: 90px;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .ib-ribbon-banner {
          position: absolute;
          top: 18px;
          left: -28px;
          width: 120px;
          transform: rotate(-45deg);
          text-align: center;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4.5px 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          font-family: 'Lato', sans-serif;
          line-height: 1;
        }
        .ib-doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-left: 8px; margin-bottom: 18px; position: relative; z-index: 5; }
        .ib-company-name { font-size: 19px; font-weight: 800; color: #1F1740; }
        .ib-company-meta { font-size: 12px; color: #6B7280; line-height: 1.6; margin-top: 4px; }
        .ib-doc-type { font-size: 24px; font-weight: 800; color: #1F1740; letter-spacing: 1px; }
        .ib-doc-divider { border-top: 1px solid #E9EAF0; margin: 14px 0; position: relative; z-index: 5; }
        .ib-meta-table { width: 100%; font-size: 12.5px; margin-bottom: 4px; position: relative; z-index: 5; }
        .ib-meta-table tr td { padding: 3px 0; }
        .ib-meta-table .lbl { color: #6B7280; width: 110px; }
        .ib-meta-table .sep { color: #9CA3AF; width: 14px; }
        .ib-meta-table .val { color: #1F1740; font-weight: 600; }
        .ib-billto-band { background: #F8F9FC; padding: 7px 10px; font-size: 11px; font-weight: 700; color: #6B7280; letter-spacing: 0.5px; margin-top: 16px; position: relative; z-index: 5; }
        .ib-billto-name { font-size: 15px; font-weight: 700; color: #2563EB; margin-top: 8px; position: relative; z-index: 5; }
        .ib-billto-meta { font-size: 12px; color: #6B7280; margin-top: 3px; line-height: 1.6; position: relative; z-index: 5; }
.ib-items-table {
  width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12.5px;
  position: relative; z-index: 5;
  table-layout: fixed;              /* columns keep their widths, content can't stretch them */
}
.ib-items-table thead th {
  background: #F8F9FC; color: #6B7280; font-weight: 700; font-size: 10.5px;
  text-transform: uppercase; letter-spacing: 0.4px; padding: 9px 10px; text-align: left;
  border-bottom: 1px solid #E9EAF0;
}
.ib-items-table thead th.num { text-align: right; }
.ib-items-table tbody td {
  padding: 11px 10px; border-bottom: 1px solid #F3F4F6; color: #374151; vertical-align: top;
}
.ib-items-table tbody td.desc {
  white-space: pre-wrap;            /* keeps the line breaks the user typed */
  overflow-wrap: anywhere;          /* breaks long words like "bbbbbbbb..." */
  word-break: break-word;
  min-width: 0;
}
.ib-items-table tbody td.num {
  text-align: right; font-weight: 600; color: #1F1740; white-space: nowrap;
}

/* long notes / terms / customer text should wrap too */
.ib-doc-notes div, .ib-billto-name, .ib-billto-meta, .ib-words-val {
  overflow-wrap: anywhere; white-space: pre-wrap;
}
.ib-bottom-grid > div { min-width: 0; }
        .ib-bottom-grid { display: grid; grid-template-columns: 1fr 240px; gap: 24px; margin-top: 20px; align-items: start; position: relative; z-index: 5; }
        .ib-words-label { font-size: 11px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .ib-words-val { font-size: 12.5px; font-style: italic; font-weight: 700; color: #1F1740; line-height: 1.5; }
        .ib-doc-notes { margin-top: 20px; font-size: 12px; color: #374151; }
        .ib-doc-notes b { display: block; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700; margin-bottom: 5px; }
        .ib-totals-box { font-size: 12.5px; }
        .ib-totals-row { display: flex; justify-content: space-between; padding: 5px 0; color: #6B7280; }
        .ib-totals-row.neg { color: #15803D; }
        .ib-totals-row.due { color: #DC2626; }
        .ib-totals-row.grand { font-weight: 800; color: #1F1740; font-size: 14px; border-top: 1.5px solid #E9EAF0; padding-top: 9px; margin-top: 4px; }
        .ib-totals-row.balance { font-weight: 800; color: #1F1740; font-size: 14.5px; border-top: 1.5px solid #E9EAF0; padding-top: 9px; margin-top: 4px; }
        .ib-signature { margin-top: 60px; display: flex; justify-content: flex-end; position: relative; z-index: 5; }
        .ib-signature-line { width: 180px; border-top: 1px solid #C8CCD6; text-align: center; font-size: 11px; color: #9CA3AF; padding-top: 6px; }
        @media print {
          body * { visibility: hidden !important; }
          .ib-paper, .ib-paper * { visibility: visible !important; }
          .ib-paper {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; max-width: 100% !important; margin: 0 !important;
            padding: 24px !important; box-shadow: none !important; border: none !important;
          }
          @page { margin: 12mm; }
        }


        .ib-signature-box { display: flex; flex-direction: column; align-items: center; width: 180px; }
.ib-signature-img { max-height: 50px; max-width: 100%; object-fit: contain; margin-bottom: 4px; }
      `}</style>

      <div className="ib-shell">
        <div className="ib-sidelist">
          <div className="ib-sidelist-header">
            <div className="ib-sidelist-title" onClick={() => navigate("/invoices")}>
              All Invoices <ChevronDownIcon />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {canCreate && (
              <div className="ib-sidelist-newsplit">
                
                <button className="ib-sidelist-new" onClick={() => navigate("/invoices/create")}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
                </button>
              </div>
              )}
            </div>
          </div>
          {listLoading ? (
            <div style={{ padding: 16, fontSize: 13, color: "#9AA1AF" }}>Loading…</div>
          ) : invoiceList.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: "#9AA1AF" }}>No invoices yet.</div>
          ) : (
            invoiceList.map(inv => {
              const invId = inv.invoice_id || inv.id;
              const s = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
              const cName = inv.customer_data?.name || inv.customer_data?.customer_name || inv.customer_details?.name || "No customer";
              return (
                <div
                  key={invId}
                  className={`ib-side-item${invId === id ? " active" : ""}`}
                  onClick={() => navigate(`/invoices/${invId}`)}
                >
                  <div className="ib-side-item-top">
                    <span className="ib-side-item-name">{cName}</span>
                    <span className="ib-side-item-amt">{fmt(inv.grand_total_amount, inv.currency)}</span>
                  </div>
                  <div className="ib-side-item-meta">
                    <span>{inv.invoice_number || invId?.slice(0, 8)}</span>
                    <span>•</span>
                    <span>{displayDate(inv.invoice_date)}</span>
                  </div>
                  <span className="ib-side-item-status" style={{ color: s.color }}>{inv.status || "draft"}</span>
                </div>
              );
            })
          )}
        </div>
        <div className="ib-docpane">
          <div className="ib-toolbar">
            <div className="ib-toolbar-title">
              <span className="ib-doc-num">{invoice.invoice_number || invoice.invoice_id?.slice(0, 8)}</span>
            </div>
            <div className="ib-toolbar-icons">
              {/* <button className="ib-icon-btn" title="Preview" onClick={handlePrint}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button> */}
              <button className="ib-icon-btn" title="Close" onClick={() => navigate("/invoices")}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="ib-actionbar">
            {invoice.status === "draft" && canUpdate && (
              <button
                className="ib-toolbtn"
                                onClick={() =>
                  invoice.room_booking && invoice.room_booking_id
                    ? navigate(`/invoices/room-create?booking_id=${invoice.room_booking_id}`)
                    : navigate(`/invoices/${invoice.invoice_id || invoice.id}/edit`)
                }
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4584E5" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </button>
            )}
            <button
              className="ib-toolbtn"
              onClick={() => {
                if (invoice.status === "sent" || invoice.status === "paid") {
                  setShowResendModal(true);
                } else {
                  setShowSendModal(true);
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4584E5" strokeWidth="1.8"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              Send
            </button>
            {canExport &&
            <PdfPrintMenu onDownload={handleDownloadPDF} onPrint={handlePrint} />
  }
            {invoice.invoice_currency && (
              <div className="ib-currency-toggle" title="Switch how amounts are displayed">
                <button className={viewCurrency === "INR" ? "active" : ""} onClick={() => setViewCurrency("INR")}>
                  INR
                </button>
                <button className={viewCurrency === "ORIGINAL" ? "active" : ""} onClick={() => setViewCurrency("ORIGINAL")}>
                  {fxLoading ? "…" : invoice.invoice_currency}
                </button>
              </div>
            )}
            <div style={{ marginLeft: "auto" }}>
              <MoreMenu onDelete={handleDelete} canDelete={canDelete} />
            </div>
          </div>
          <div className="ib-paper-wrap">
            <div className="ib-paper">
              {watermark && (
                <div className="ib-watermark" style={{ color: watermark.color }}>
                  {watermark.text}
                </div>
              )}
              {invoice.status && (
                <div className="ib-ribbon-wrapper">
                  <div className="ib-ribbon-banner" style={{ background: statusStyle.ribbon }}>
                    {invoice.status}
                  </div>
                </div>
              )}
              <div className="ib-doc-header">
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {(profile?.logo || invoice.company_details?.logo || invoice.logo) && (
                    <img
                      src={profile?.logo || invoice.company_details?.logo || invoice.logo}
                      alt="Company Logo"
                      className="ib-logo-img"
                      style={{ width: 57, height: 57, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <div className="ib-company-name">{profile?.name || invoice.company_name }</div>
                <div className="ib-company-meta">
  {profile?.address || "Tamil Nadu, India"}<br />{invoice.company_email || "admin@vallistay.com"}
  {profile?.gst_number && (
    <>
      <br />
      <span style={{ fontWeight: 700, color: "#374151" }}>GSTIN: {profile.gst_number}</span>
    </>
  )}
</div>
                  </div>
                </div>
                {/* <div className="ib-doc-type">TAX INVOICE</div> */}
              </div>
              <div className="ib-doc-divider" />
              <table className="ib-meta-table">
                <tbody>
                  <tr><td className="lbl">#Invoice No</td><td className="sep">:</td><td className="val">{invoice.invoice_number || invoice.invoice_id?.slice(0, 8)}</td></tr>
                  <tr><td className="lbl">Invoice Date</td><td className="sep">:</td><td className="val">{displayDate(invoice.invoice_date)}</td></tr>
                  <tr><td className="lbl">Due Date</td><td className="sep">:</td><td className="val">{displayDate(invoice.due_date)}</td></tr>
                </tbody>
              </table>
              <div className="ib-billto-band">BILL TO</div>
              <div className="ib-billto-name">{customerName || "No customer linked"}</div>
              {(invoice.customer_details?.email || invoice.customer_details?.mobile) && (
                <div className="ib-billto-meta">
                  {invoice.customer_details?.email}{invoice.customer_details?.mobile ? ` · ${invoice.customer_details.mobile}` : ""}
                </div>
              )}
              <table className="ib-items-table">
                <thead>
<tr>
  <th style={{ width: 30 }}>#</th>
  <th>Item & Description</th>
  {!isRoom && <th className="num" style={{ width: 60 }}>Qty</th>}
  <th className="num" style={{ width: 120 }}>Rate</th>
  <th className="num" style={{ width: 160 }}>Amount</th>
</tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, idx) => {
                    const lt = lineQty(item) * parseFloat(item.amount || 0);
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                      <td className="desc">{item.product_name || "—"}</td>
                        {!isRoom && <td className="num">{item.quantity}</td>}
                        <td className="num">{fmt(convert(item.amount), displayCurrency)}</td>
                        <td className="num">{fmt(convert(lt), displayCurrency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="ib-bottom-grid">
                <div>
                  <div className="ib-words-label">Total In Words</div>
                  <div className="ib-words-val">{totalInWords(convert(invoice.grand_total_amount), displayCurrency)}</div>
                  {(invoice.notes || invoice.terms_and_conditions) && (
                    <div className="ib-doc-notes">
                      {invoice.notes && (<><b>Notes</b><div style={{ marginBottom: 12 }}>{invoice.notes}</div></>)}
                      {invoice.terms_and_conditions && (<><b>Terms & Conditions</b><div>{invoice.terms_and_conditions}</div></>)}
                    </div>
                  )}
                </div>
                <div className="ib-totals-box">
                  <div className="ib-totals-row"><span>Sub Total</span><span>{fmt(convert(subtotal), displayCurrency)}</span></div>
                  {parseFloat(invoice.discount_amount || 0) > 0 && (
                    <div className="ib-totals-row neg"><span>Discount ({invoice.discount_percentage || 0}%)</span><span>(-) {fmt(convert(invoice.discount_amount), displayCurrency)}</span></div>
                  )}
                  {invoice.tax_enabled && (
                    <div className="ib-totals-row"><span>GST ({invoice.tax_percentage || 0}%)</span><span>+ {fmt(convert(invoice.tax_amount), displayCurrency)}</span></div>
                  )}
                  {parseFloat(invoice.platform_fee_amount || 0) > 0 && (
  <div className="ib-totals-row">
    <span>
      Platform Fee ({invoice.platform_fee_percentage || 0}%)
    </span>
    <span>+ {fmt(convert(invoice.platform_fee_amount), displayCurrency)}</span>
  </div>
)}
                  <div className="ib-totals-row grand"><span>Total</span><span>{fmt(convert(invoice.grand_total_amount), displayCurrency)}</span></div>
                  {invoiceAdvanceAmt > 0 && (
                    <div className="ib-totals-row neg"><span>Advance Paid</span><span>(-) {fmt(convert(invoiceAdvanceAmt), displayCurrency)}</span></div>
                  )}
                  {invoiceManualPaidAmt > 0 && (
                    <div className="ib-totals-row neg"><span>Payment Made (Manual)</span><span>(-) {fmt(convert(invoiceManualPaidAmt), displayCurrency)}</span></div>
                  )}
                  {invoicePaidAmt > 0 && (
                    <div className="ib-totals-row due"><span>Payment Made</span><span>(-) {fmt(convert(invoicePaidAmt), displayCurrency)}</span></div>
                  )}
                  <div className="ib-totals-row balance"><span>Balance Due</span><span>{fmt(convert(invoiceBalanceDue), displayCurrency)}</span></div>
                </div>
              </div>
{invoice.status === "paid" && profile?.signature && (
  <div className="ib-signature">
    <div className="ib-signature-box">
      <img src={profile.signature} alt="Signature" className="ib-signature-img" />
      <div className="ib-signature-line">Authorized Signature</div>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
      <SendInvoiceModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        onConfirm={handleConfirmSend}
        sending={sending}
        currentCurrency={invCurrency}
        currencies={currencyOptions}
        loadingList={currencyOptionsLoading}
      />
      <ResendConfirmModal
        open={showResendModal}
        onClose={() => setShowResendModal(false)}
        onConfirm={(currency) => { handleConfirmSend(currency).then(() => setShowResendModal(false)); }}
        sending={sending}
        currentCurrency={invCurrency}
        currencies={currencyOptions}
        loadingList={currencyOptionsLoading}
      />
      <ToastHost />
    </>
  );
}