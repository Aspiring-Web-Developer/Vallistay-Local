











import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";



/* ── BASE API URL FROM ENVIRONMENT ── */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ── status colors & ribbon badge theme ── */
const STATUS_COLOR = {
  paid:    { bg: "#DCFCE7", color: "#15803D", ribbon: "#22C55E" },
  overdue: { bg: "#FEE2E2", color: "#DC2626", ribbon: "#EF4444" },
  sent:    { bg: "#DBEAFE", color: "#2563EB", ribbon: "#3B82F6" },
  draft:   { bg: "#F3F4F6", color: "#6B7280", ribbon: "#9CA3AF" },
};

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

const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
  "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function numToWords(num) {
  num = Math.round(num);
  if (num === 0) return "Zero";
  const twoDigits = (n) => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  const threeDigits = (n) => (n >= 100 ? ONES[Math.floor(n / 100)] + " Hundred " + twoDigits(n % 100) : twoDigits(n)).trim();
  let str = "";
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh  = Math.floor(num / 100000);   num %= 100000;
  const thou  = Math.floor(num / 1000);     num %= 1000;
  if (crore) str += threeDigits(crore) + " Crore ";
  if (lakh)  str += threeDigits(lakh)  + " Lakh ";
  if (thou)  str += threeDigits(thou)  + " Thousand ";
  if (num)   str += threeDigits(num);
  return str.trim();
}

const MINOR_UNIT = {
  INR: "Paise", GBP: "Pence", AED: "Fils", SAR: "Halalas", QAR: "Dirhams",
  KWD: "Fils", BHD: "Fils", OMR: "Baisa", JOD: "Fils", EGP: "Piastres",
  PKR: "Paisa", BDT: "Poisha", LKR: "Cents", NPR: "Paisa",
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

/* ─────────────────────────────────────────────
   DYNAMIC HTML2PDF LOADER
   ───────────────────────────────────────────── */
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


const convertImageToBase64 = (imgUrl) => {
  return new Promise((resolve) => {
    if (!imgUrl) return resolve(null);
    if (imgUrl.startsWith("data:image")) return resolve(imgUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Canvas tainted (CORS issue on S3 bucket):", err);
        fetchBlobBase64(imgUrl).then(resolve);
      }
    };
    img.onerror = (err) => {
      console.error("Image failed to load:", imgUrl, err);
      fetchBlobBase64(imgUrl).then(resolve);
    };
    img.src = imgUrl;
  });
};

const fetchBlobBase64 = (url) => {
  return fetch(url, { mode: "cors" })
    .then((res) => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        })
    )
    .catch((err) => {
      console.error("Blob fetch fallback failed (likely no CORS on S3):", err);
      return null;
    });
};
/* ─────────────────────────────────────────────
   PUBLIC API call
   ───────────────────────────────────────────── */
async function fetchPublicInvoice(invoiceNumber) {
  const res = await axios.get(`${API_BASE_URL}/invoices/get_invoice_data`, {
    params: { invoice_number: invoiceNumber },
  });
  return res.data?.data || res.data;
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function CustomerInvoiceView() {
  const { invoice_number } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [downloading, setDownloading] = useState(false);

  /* payment link states */
  const [paymentLink, setPaymentLink] = useState(null);

  /* FX rate states */
  const [fxRate, setFxRate] = useState(null);
  const [fxLoading, setFxLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPublicInvoice(invoice_number)
      .then(setInvoice)
      .catch(() => setError("Invoice not found or the link has expired."))
      .finally(() => setLoading(false));
  }, [invoice_number]);

  useEffect(() => {
    if (!invoice) return;
    const target = invoice.invoice_currency || invoice.currency || "INR";
    if (target === "INR") { setFxRate(null); return; }
    setFxLoading(true);
    axios.get(`https://open.er-api.com/v6/latest/INR`)
      .then((res) => {
        if (res.data?.result === "success") setFxRate(res.data.rates?.[target] || null);
        else setFxRate(null);
      })
      .catch(() => setFxRate(null))
      .finally(() => setFxLoading(false));
  }, [invoice]);

  /* Fetch Payment Link dynamically from API_BASE_URL */
  useEffect(() => {
    if (!invoice || invoice.status === "paid") return;
    axios.post(`${API_BASE_URL}/payment/create_payment_link`, {
      invoice_currency: invoice.invoice_currency || invoice.currency || "INR",
      invoice_number: invoice.invoice_number
    })
    .then((res) => {
      if (res.data?.success && res.data?.data?.payment_link) {
        setPaymentLink(res.data.data.payment_link);
      }
    })
    .catch((err) => console.error("Error creating payment link:", err));
  }, [invoice]);

  /* derived amounts */
  const advanceAmt    = parseFloat(invoice?.advance_amount || 0);
  const manualPaidAmt = parseFloat(invoice?.manual_paid_amount || 0);
  const balanceDue    = invoice?.balance_amount !== undefined
    ? parseFloat(invoice.balance_amount || 0)
    : parseFloat(invoice?.grand_total_amount || 0) - advanceAmt;
  const paidAmt       = parseFloat(invoice?.paid_amount || 0);
  const isRoom        = invoice?.room_booking === true;
  const lineQty       = (item) => (isRoom ? 1 : parseFloat(item.quantity || 0));
  const subtotal      = (invoice?.items || []).reduce(
    (s, i) => s + lineQty(i) * parseFloat(i.amount || 0), 0
  );
  const statusStyle   = STATUS_COLOR[invoice?.status] || STATUS_COLOR.draft;
  const customerName  = invoice?.customer_details?.name || invoice?.customer_details?.customer_name || "Customer";
  const baseCurrency  = invoice?.invoice_currency || invoice?.currency || "INR";
  const watermark     = getWatermark(invoice?.status);

const convert = (amount) => {
  const n = parseFloat(amount || 0);
  const v = baseCurrency === "INR" ? n : (fxRate ? n * fxRate : n);
  return roundTo(v, baseCurrency);
};
  /* ── PDF Export ── */
const handleDownloadPDF = async () => {
  if (!invoice) return;
  setDownloading(true);
  try {
    const html2pdf = await loadHtml2Pdf();

    const logoEl = document.querySelector(".civ-logo-img");
    const originalLogoSrc = logoEl?.src;

    const sigEl = document.querySelector(".civ-sig-img");
    const originalSigSrc = sigEl?.src;

    if (logoEl && originalLogoSrc) {
      const base64Data = await convertImageToBase64(originalLogoSrc);
      if (base64Data) logoEl.src = base64Data;
    }

    if (sigEl && originalSigSrc) {
      const sigBase64 = await convertImageToBase64(originalSigSrc);
      if (sigBase64) sigEl.src = sigBase64;
    }

    const element = document.querySelector(".civ-paper");
    const opt = {
      margin: [6, 6, 6, 6],
      filename: `Invoice-${invoice.invoice_number || invoice.invoice_id?.slice(0, 8) || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();

    if (logoEl && originalLogoSrc) logoEl.src = originalLogoSrc;
    if (sigEl && originalSigSrc) sigEl.src = originalSigSrc;
  } catch (err) {
    console.error("Could not generate PDF", err);
    alert("Failed to download PDF. Please try again.");
  } finally {
    setDownloading(false);
  }
};
  /* ── loading skeleton ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5F6FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato',sans-serif" }}>
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
      <div style={{ width: 700, padding: 48 }}>
        {[280, 180, 120, 340, 220].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 22 : 14, background: "#E2E5EE", borderRadius: 6, width: w, marginBottom: 16, animation: "shimmer 1.4s infinite" }} />
        ))}
      </div>
    </div>
  );

  /* ── error state ── */
  if (error || !invoice) return (
    <div style={{ minHeight: "100vh", background: "#F5F6FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>Invoice Not Found</div>
        <div style={{ fontSize: 14, color: "#6B7280", maxWidth: 340 }}>{error || "This invoice link is invalid or has expired."}</div>
      </div>
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;800;900&display=swap" />
      <style>{`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { font-family: 'Lato', -apple-system, sans-serif; background: #F3F4F6; overflow-x: hidden; }

  .civ-wrap {
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
  }

  /* ── action strip ── */
  .civ-action-strip {
    width: 100%;
    max-width: 210mm;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    background: #fff;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid #E4E6EF;
    box-shadow: 0 4px 12px rgba(17,24,39,0.03);
  }
  .civ-status-pill-wrap { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .civ-status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    border-radius: 20px; padding: 5px 13px; font-size: 12px; font-weight: 700; text-transform: uppercase;
    white-space: nowrap; letter-spacing: 0.5px;
  }
  .civ-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .civ-ref { font-size: 12px; color: #9AA1AF; font-weight: 600; }
  .civ-action-buttons { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .civ-action-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 9px 14px; font-size: 12.5px; font-weight: 700; border-radius: 7px;
    cursor: pointer; transition: all 0.15s ease; text-decoration: none; font-family: inherit;
    white-space: nowrap;
  }
  .civ-btn-download { background: #fff; border: 1.5px solid #E4E6EF; color: #4B5563; }
  .civ-btn-download:hover:not(:disabled) { background: #F9FAFB; border-color: #D1D5DB; }
  .civ-btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
  .civ-btn-pay { background: #2563EB; color: #fff; border: none; box-shadow: 0 4px 10px rgba(37,99,235,0.2); }
  .civ-btn-pay:hover { background: #1D4ED8; }

  /* ── paper ── */
  .civ-paper {
    background: #fff;
    width: 100%;
    max-width: 210mm;
    border: 1px solid #E4E6EF;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(17,24,39,0.08);
    position: relative;
    overflow: hidden;
    padding: 40px 44px;
    margin: 0 auto;
  }

  .civ-watermark {
    position: absolute; top: 68%; left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 90px; font-weight: 900; pointer-events: none; user-select: none;
    z-index: 0; text-transform: uppercase; white-space: nowrap; letter-spacing: 8px;
  }

  /* ── Corner Ribbon Banner ── */
  .civ-ribbon-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 90px;
    height: 90px;
    overflow: hidden;
    pointer-events: none;
    z-index: 10;
  }
  .civ-ribbon-banner {
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

  /* header */
  .civ-doc-header {
    display: flex; flex-wrap: wrap; gap: 16px;
    justify-content: space-between; align-items: flex-start;
    padding-left: 68px; margin-bottom: 20px; position: relative; z-index: 5;
  }
  .civ-doc-header-left { display: flex; gap: 14px; align-items: center; min-width: 0; flex: 1 1 240px; }
  .civ-logo-img {
    width: 56px; height: 56px; border-radius: 50%;
    object-fit: cover;            /* big or wide images are cropped to the circle, never stretched */
    flex-shrink: 0;
    background: #f8fafc; border: 1px solid #e2e8f0;
  }
  .civ-company-name { font-size: 17px; font-weight: 800; color: #1F1740; word-break: break-word; }
  .civ-company-meta { font-size: 11.5px; color: #6B7280; line-height: 1.5; margin-top: 3px; word-break: break-word; }
  .civ-doc-type { font-size: 19px; font-weight: 800; color: #1F1740; letter-spacing: 0.5px; white-space: nowrap; }

  .civ-divider { border-top: 1px solid #E9EAF0; margin: 14px 0; position: relative; z-index: 5; }

  .civ-meta-table { font-size: 12px; border-collapse: collapse; position: relative; z-index: 5; width: 100%; }
  .civ-meta-table td { padding: 3px 0; }
  .civ-meta-lbl { color: #6B7280; width: 100px; }
  .civ-meta-sep { color: #9CA3AF; width: 12px; }
  .civ-meta-val { color: #1F1740; font-weight: 600; word-break: break-word; }

  .civ-billto-band { background: #F8F9FC; padding: 7px 10px; font-size: 10.5px; font-weight: 700; color: #6B7280; letter-spacing: 0.5px; margin-top: 16px; position: relative; z-index: 5; }
  .civ-billto-name { font-size: 14px; font-weight: 700; color: #2563EB; margin-top: 8px; position: relative; z-index: 5; word-break: break-word; }
  .civ-billto-meta { font-size: 11.5px; color: #6B7280; margin-top: 3px; line-height: 1.6; position: relative; z-index: 5; word-break: break-word; }

  /* items table */
  .civ-items-scroll {
    width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;
    margin-top: 18px; position: relative; z-index: 5;
    border-radius: 6px;
  }
  .civ-items {
    width: 100%; min-width: 560px;      /* below this width the table scrolls sideways */
    border-collapse: collapse; font-size: 12px;
    table-layout: fixed;                /* header widths decide the columns, content can't stretch them */
  }
  .civ-items thead th {
    background: #F8F9FC; color: #6B7280; font-weight: 700; font-size: 10px;
    text-transform: uppercase; letter-spacing: 0.4px; padding: 9px 8px;
    text-align: left; border-bottom: 1px solid #E9EAF0; white-space: nowrap;
  }
  .civ-items thead th.r { text-align: right; }
  .civ-items tbody td { padding: 10px 8px; border-bottom: 1px solid #F3F4F6; color: #374151; vertical-align: top; }
  .civ-items tbody td.desc {
    white-space: pre-wrap;              /* keeps the line breaks the user typed */
    overflow-wrap: anywhere;            /* breaks long words like "bbbbbb..." */
    word-break: break-word;
    min-width: 0;
  }
  .civ-items tbody td.r { text-align: right; font-weight: 600; color: #1F1740; white-space: nowrap; }

  /* long notes / terms / words should wrap too */
  .civ-notes div, .civ-words-val { overflow-wrap: anywhere; white-space: pre-wrap; }
  .civ-bottom > div { min-width: 0; }
  .civ-logo-pdf-hide { display: none !important; }

  /* bottom grid */
  .civ-bottom { display: grid; grid-template-columns: 1fr 220px; gap: 20px; margin-top: 20px; align-items: start; position: relative; z-index: 5; }

  .civ-words-lbl { font-size: 10.5px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
  .civ-words-val { font-size: 12px; font-style: italic; font-weight: 700; color: #1F1740; line-height: 1.5; word-break: break-word; }

  .civ-notes { margin-top: 18px; font-size: 11.5px; color: #374151; word-break: break-word; }
  .civ-notes-lbl { display: block; font-size: 10.5px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700; margin-bottom: 5px; margin-top: 12px; }

  .civ-totals { font-size: 12px; }
  .civ-trow { display: flex; justify-content: space-between; gap: 8px; padding: 5px 0; color: #6B7280; }
  .civ-trow.neg { color: #15803D; }
  .civ-trow.red { color: #DC2626; }
  .civ-trow.grand { font-weight: 700; color: #1F1740; font-size: 13px; border-top: 1.5px solid #E9EAF0; padding-top: 9px; margin-top: 4px; }
  .civ-trow.balance { font-weight: 700; color: #1F1740; font-size: 13.5px; border-top: 1.5px solid #E9EAF0; padding-top: 9px; margin-top: 4px; }
  .civ-inr-approx { display: flex; justify-content: space-between; max-width: 260px; font-size: 11px; color: #9AA1AF; font-weight: 600; margin-top: 14px; }
  .civ-sig { margin-top: 50px; display: flex; justify-content: flex-end; position: relative; z-index: 5; }
  .civ-sig-line { width: 160px; border-top: 1px solid #C8CCD6; text-align: center; font-size: 10.5px; color: #9CA3AF; padding-top: 6px; }

  .civ-footer {
    width: 100%; max-width: 210mm; margin-top: 20px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 11.5px; color: #B0B6C3;
  }
  .civ-footer a { color: #4584E5; text-decoration: none; font-weight: 600; }

  /* ══════════ RESPONSIVE BREAKPOINTS ══════════ */

  @media (max-width: 640px) {
    .civ-wrap { padding: 16px 10px; }
    .civ-action-strip { padding: 10px 14px; border-radius: 8px; }
    .civ-status-pill { font-size: 11px; padding: 4px 11px; }
    .civ-ref { font-size: 11px; width: 100%; }
    .civ-action-buttons { width: 100%; }
    .civ-action-btn { flex: 1 1 0; padding: 10px 10px; font-size: 12px; }
  .civ-watermark { font-size: 60px; letter-spacing: 4px; top: 68%; }
    .civ-paper { padding: 24px 16px; border-radius: 6px; }
    .civ-doc-header { padding-left: 0; margin-top: 24px; flex-direction: column; gap: 10px; }
    .civ-doc-header-left { flex: 1 1 100%; }
    .civ-doc-type { font-size: 16px; align-self: flex-start; }
    .civ-company-name { font-size: 15px; }
    .civ-company-meta { font-size: 11px; }

    .civ-meta-table { font-size: 11.5px; }
    .civ-meta-lbl { width: 84px; }

    .civ-billto-name { font-size: 13.5px; }

    .civ-bottom { grid-template-columns: 1fr; gap: 18px; }
    .civ-totals { border-top: 1px solid #F1F2F6; padding-top: 14px; }

    .civ-watermark { font-size: 60px; letter-spacing: 4px; }

    .civ-sig { margin-top: 36px; }
  }

  @media (max-width: 380px) {
    .civ-paper { padding: 18px 12px; }
    .civ-action-buttons { flex-direction: column; }
    .civ-action-btn { width: 100%; }
    .civ-doc-type { font-size: 15px; }
  }

  /* ── PRINT ── */
  @media print {
    body { background: #fff !important; }
    .civ-action-strip, .civ-footer { display: none !important; }
    .civ-wrap { padding: 0 !important; }
    .civ-items-scroll { overflow-x: visible !important; }
    .civ-paper {
      box-shadow: none !important; border: none !important; border-radius: 0 !important;
      max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important;
    }
    @page { margin: 12mm; }
  }


.civ-sig-box { display: flex; flex-direction: column; align-items: center; width: 160px; }
.civ-sig-img { max-height: 46px; max-width: 100%; object-fit: contain; margin-bottom: 4px; }
`}</style>

      {/* ── CONTENT ── */}
      <div className="civ-wrap">

        {/* Action strip */}
        <div className="civ-action-strip">
          <div className="civ-status-pill-wrap">
            <div
              className="civ-status-pill"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <span className="civ-status-dot" style={{ background: statusStyle.ribbon }} />
              {invoice.status || "draft"}
            </div>

            <span className="civ-ref">
              {invoice.invoice_number || invoice.invoice_id?.slice(0, 8)} &nbsp;·&nbsp; Due {displayDate(invoice.due_date)}
            </span>
          </div>

          <div className="civ-action-buttons">
            <button className="civ-action-btn civ-btn-download" onClick={handleDownloadPDF} disabled={downloading}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {downloading ? "Downloading..." : "Download PDF"}
            </button>

            {paymentLink && invoice.status !== "paid" && (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="civ-action-btn civ-btn-pay"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Pay Now
              </a>
            )}
          </div>
        </div>

        {/* ── PAPER ── */}
        <div className="civ-paper">

          {/* Watermark */}
          {watermark && (
            <div className="civ-watermark" style={{ color: watermark.color }}>
              {watermark.text}
            </div>
          )}

          {/* Corner Ribbon */}
          {invoice.status && (
            <div className="civ-ribbon-wrapper">
              <div
                className="civ-ribbon-banner"
                style={{ background: statusStyle.ribbon }}
              >
                {invoice.status}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="civ-doc-header">
            <div className="civ-doc-header-left">
              {invoice.company_details?.logo && (
<img
  src={invoice.company_details.logo}
  alt="Company Logo"
  className="civ-logo-img"
  onError={(e) => { e.target.style.display = "none"; }}
/>
              )}
              <div>
                <div className="civ-company-name" >{invoice.company_details?.company_name || "—"}</div>
<div className="civ-company-meta">
  {invoice.company_details?.address || ""}
  {invoice.company_details?.gst_number && (
    <>
      <br />
      <span style={{ fontWeight: 700, color: "#374151" }}>GSTIN: {invoice.company_details.gst_number}</span>
    </>
  )}
</div>
              </div>
            </div>
            <div className="civ-doc-type">TAX INVOICE</div>
          </div>
          <div className="civ-divider" />

          {/* Meta */}
          <table className="civ-meta-table">
            <tbody>
              <tr>
                <td className="civ-meta-lbl">Invoice No</td>
                <td className="civ-meta-sep">:</td>
                <td className="civ-meta-val">{invoice.invoice_number || invoice.invoice_id?.slice(0, 8)}</td>
              </tr>
              <tr>
                <td className="civ-meta-lbl">Invoice Date</td>
                <td className="civ-meta-sep">:</td>
                <td className="civ-meta-val">{displayDate(invoice.invoice_date)}</td>
              </tr>
              <tr>
                <td className="civ-meta-lbl">Due Date</td>
                <td className="civ-meta-sep">:</td>
                <td className="civ-meta-val">{displayDate(invoice.due_date)}</td>
              </tr>
            </tbody>
          </table>

          {/* Bill to */}
          <div className="civ-billto-band">BILL TO</div>
          <div className="civ-billto-name">{customerName}</div>
          {(invoice.customer_details?.email || invoice.customer_details?.mobile) && (
            <div className="civ-billto-meta">
              {invoice.customer_details?.email}
              {invoice.customer_details?.mobile ? ` · ${invoice.customer_details.mobile}` : ""}
            </div>
          )}

          {/* Items table */}
          <div className="civ-items-scroll">
            <table className="civ-items">
              <thead>
<tr>
  <th style={{ width: 30 }}>#</th>
  <th>Item & Description</th>
  {!isRoom && <th className="r" style={{ width: 60 }}>Qty</th>}
  <th className="r" style={{ width: 120 }}>Rate</th>
  <th className="r" style={{ width: 150 }}>Amount</th>
</tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, idx) => {
                                   const lineTotal = lineQty(item) * parseFloat(item.amount || 0);
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="desc">{item.product_name || "—"}</td>
                                            {!isRoom && <td className="r">{item.quantity}</td>}
                      <td className="r">{fmt(convert(item.amount), baseCurrency)}</td>
                      <td className="r">{fmt(convert(lineTotal), baseCurrency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom: words + totals */}
          <div className="civ-bottom">
            <div>
              <div className="civ-words-lbl">Total In Words</div>
              <div className="civ-words-val">{totalInWords(convert(invoice.grand_total_amount), baseCurrency)}</div>

              {(invoice.notes || invoice.terms_and_conditions) && (
                <div className="civ-notes">
                  {invoice.notes && (
                    <>
                      <span className="civ-notes-lbl">Notes</span>
                      <div style={{ marginBottom: 10 }}>{invoice.notes}</div>
                    </>
                  )}
                  {invoice.terms_and_conditions && (
                    <>
                      <span className="civ-notes-lbl">Terms & Conditions</span>
                      <div>{invoice.terms_and_conditions}</div>
                    </>
                  )}
                </div>
              )}

              {/* {baseCurrency !== "INR" && (
                <div className="civ-inr-approx">
                  <span>Approx.</span>
                  <span>{fxLoading ? "Converting…" : fmt(invoice.grand_total_amount, "INR")}</span>
                </div>
              )} */}
            </div>

            <div className="civ-totals">
              <div className="civ-trow"><span>Sub Total</span><span>{fmt(convert(subtotal), baseCurrency)}</span></div>

              {parseFloat(invoice.discount_amount || 0) > 0 && (
                <div className="civ-trow neg">
                  <span>Discount ({invoice.discount_percentage || 0}%)</span>
                  <span>(-) {fmt(convert(invoice.discount_amount), baseCurrency)}</span>
                </div>
              )}
              {invoice.tax_enabled && (
                <div className="civ-trow">
                  <span>GST ({invoice.tax_percentage || 0}%)</span>
                  <span>+ {fmt(convert(invoice.tax_amount), baseCurrency)}</span>
                </div>
              )}
              {parseFloat(invoice.platform_fee_amount || 0) > 0 && (
  <div className="civ-trow">
    <span>Platform Fee ({invoice.platform_fee_percentage || 0}%)</span>
    <span>+ {fmt(convert(invoice.platform_fee_amount), baseCurrency)}</span>
  </div>
)}


              <div className="civ-trow grand"><span>Total</span><span>{fmt(convert(invoice.grand_total_amount), baseCurrency)}</span></div>

              {advanceAmt > 0 && (
                <div className="civ-trow neg">
                  <span>Advance Paid</span><span>(-) {fmt(convert(advanceAmt), baseCurrency)}</span>
                </div>
              )}
              {manualPaidAmt > 0 && (
                <div className="civ-trow neg">
                  <span>Payment Made (Manual)</span><span>(-) {fmt(convert(manualPaidAmt), baseCurrency)}</span>
                </div>
              )}
              {paidAmt > 0 && (
                <div className="civ-trow red">
                  <span>Payment Made</span><span>(-) {fmt(convert(paidAmt), baseCurrency)}</span>
                </div>
              )}

              <div className="civ-trow balance"><span>Balance Due</span><span>{fmt(convert(balanceDue), baseCurrency)}</span></div>
            </div>
          </div>

          {/* Signature */}
          {/* Signature */}
{invoice.status === "paid" && invoice.company_details?.signature && (
  <div className="civ-sig">
    <div className="civ-sig-box">
      <img src={invoice.company_details.signature} alt="Signature" className="civ-sig-img" />
      <div className="civ-sig-line">Authorized Signature</div>
    </div>
  </div>
)}
        </div>

        {/* Footer */}
        <div className="civ-footer">
          Generated by <a href="#" target="_blank" rel="noreferrer">Valli Stays</a>
        </div>

      </div>
    </>
  );
}
