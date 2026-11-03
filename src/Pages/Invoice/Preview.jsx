import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_COLOR = {
  paid: { bg: "#DCFCE7", color: "#15803D" },
  sent: { bg: "#DBEAFE", color: "#2563EB" },
  draft: { bg: "#F3F4F6", color: "#6B7280" },
};
const SETTLEMENT_COLOR = {
  setteled: { bg: "#DCFCE7", color: "#15803D" },
  pending: { bg: "#FEF3C7", color: "#B45309" },
  overdue: { bg: "#FEE2E2", color: "#DC2626" },
};

const fmt = (n, currency = "INR") => {
  const sym = currency === "INR" ? "₹" : "$";
  return `${sym}${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
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

/* hex "#RRGGBB" -> [r,g,b] for jsPDF setFillColor/setTextColor */
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export default function Preview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [downloading, setDownloading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // data passed in from List_Invoice.jsx via navigate(..., { state: {...} })
  const { invoices = [], from = "", to = "" } = location.state || {};

  const rangeLabel = useMemo(() => {
    if (!from || !to) return "";
    const f = new Date(from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const t = new Date(to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return from === to ? f : `${f}  –  ${t}`;
  }, [from, to]);

  const totalAmount = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const overdue = invoices
    .filter(i => i.settlement_status === "overdue")
    .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const drafts = invoices.filter(i => i.status === "draft").length;
  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);

  if (!invoices.length) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6B7280", fontFamily: "'Lato',sans-serif" }}>
        No invoice data to preview.
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => navigate("/invoices")}
            style={{
              background: "#4584E5", color: "#fff", border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  /* ── PDF download — mirrors the on-screen table with colored pill badges, landscape so nothing wraps ── */
  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const currency = invoices[0]?.currency || "INR";
      const CUR_PREFIX = { INR: "Rs.", USD: "$", EUR: "EUR ", GBP: "GBP ", AED: "AED " };
      const pfmt = (n) => {
        const sym = CUR_PREFIX[currency] || `${currency} `;
        return `${sym} ${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(69, 132, 229);
      doc.text("Invoice Report", 30, 26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(rangeLabel, 30, 40);

      // pre-compute per-row status/settlement so the draw hook can look them up by row index
      const rowMeta = invoices.map(inv => {
        const status = inv.status || "draft";
        const settle = inv.settlement_status || "pending";
        const settleLabel = settle === "setteled" ? "Settled" : settle === "overdue" ? "Overdue" : "Pending";
        return {
          statusColor: STATUS_COLOR[status] || STATUS_COLOR.draft,
          statusLabel: status.toUpperCase(),
          settleColor: SETTLEMENT_COLOR[settle] || SETTLEMENT_COLOR.pending,
          settleLabel,
        };
      });

      const rows = invoices.map((inv, i) => {
        const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || inv.customer_details?.name || "No customer";
        const dept = inv.department_data?.department_name || "—";
        return [
          inv.invoice_number || (inv.invoice_id || "").slice(0, 8),
          customerName,
          dept,
          displayDate(inv.invoice_date),
          displayDate(inv.due_date),
          pfmt(inv.total_amount),
          rowMeta[i].statusLabel,
          rowMeta[i].settleLabel,
        ];
      });

      const STATUS_COL = 6;
      const PAYMENT_COL = 7;

      autoTable(doc, {
        startY: 52,
        margin: { left: 30, right: 30 },
        head: [["Invoice #", "Customer", "Department", "Issue Date", "Due Date", "Amount", "Status", "Payment"]],
        body: rows,
        styles: { font: "helvetica", fontSize: 9, cellPadding: 7, valign: "middle" },
        headStyles: { fillColor: [69, 132, 229], textColor: 255, fontStyle: "bold", fontSize: 9 },
        alternateRowStyles: { fillColor: [247, 250, 255] },
        columnStyles: {
          0: { cellWidth: 75 },
          1: { cellWidth: 110 },
          2: { cellWidth: 90 },
          3: { cellWidth: 65, halign: "center" },
          4: { cellWidth: 65, halign: "center" },
          5: { cellWidth: 75, halign: "right" },
          6: { cellWidth: 70, halign: "center" },
          7: { cellWidth: 70, halign: "center" },
        },
        foot: [["", "", "", "", "Total", pfmt(totalAmount), `${invoices.length} invoice(s)`, ""]],
        footStyles: { fillColor: [219, 234, 254], textColor: [30, 64, 175], fontStyle: "bold", fontSize: 9 },

        // hide the raw uppercase text jsPDF would otherwise print for badge columns —
        // we draw our own pill + centered label in didDrawCell instead
        didParseCell: (data) => {
          if (data.section === "body" && (data.column.index === STATUS_COL || data.column.index === PAYMENT_COL)) {
            data.cell.text = [];
          }
        },

        didDrawCell: (data) => {
          if (data.section !== "body") return;
          if (data.column.index !== STATUS_COL && data.column.index !== PAYMENT_COL) return;

          const meta = rowMeta[data.row.index];
          const isStatus = data.column.index === STATUS_COL;
          const { bg, color } = isStatus ? meta.statusColor : meta.settleColor;
          const label = isStatus ? meta.statusLabel : meta.settleLabel;

          const padX = 6, padY = 5;
          const pillW = data.cell.width - padX * 2;
          const pillH = data.cell.height - padY * 2;
          const x = data.cell.x + padX;
          const y = data.cell.y + padY;

          doc.setFillColor(...hexToRgb(bg));
          doc.roundedRect(x, y, pillW, pillH, 4, 4, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...hexToRgb(color));
          doc.text(label, x + pillW / 2, y + pillH / 2 + 2.5, { align: "center" });
        },
      });

      const filename = from === to ? `invoices_${from}.pdf` : `invoices_${from}_to_${to}.pdf`;
      doc.save(filename);
    } finally {
      setDownloading(false);
    }
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
        .pv-wrap { padding: 24px 28px; }
        .pv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .pv-back {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          border-radius: 8px; border: 1px solid var(--c-border); background: #fff;
          color: #374151; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .pv-back:hover { background: #F5F7FB; }
        .pv-title { font-size: 21px; font-weight: 700; color: #111827; margin: 0; }
        .pv-subtitle { font-size: 12.5px; color: #8A93A6; margin-top: 2px; }
        .pv-download-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--c-primary); color: #fff; border: none; border-radius: 8px;
          padding: 9px 18px; font-size: 13.5px; font-weight: 700; cursor: pointer;
        }
        .pv-download-btn:hover { background: var(--c-primary-dark); }
        .pv-download-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .pv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
        @media (max-width: 900px) { .pv-stats { grid-template-columns: repeat(2, 1fr); } }
        .pv-stat { background: #fff; border: 1px solid var(--c-border); border-radius: 12px; padding: 16px 18px; position: relative; overflow: hidden; }
        .pv-stat::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--c-primary); }
        .pv-stat.red::before { background: #DC2626; }
        .pv-stat-label { font-size: 10.5px; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 700; }
        .pv-stat-value { font-size: 21px; font-weight: 800; color: #111827; }
        .pv-stat-value.red { color: #DC2626; }

        .pv-table-wrap { background: #fff; border: 1px solid var(--c-border); border-radius: 12px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 900px; }
        thead th {
          padding: 11px 14px; font-size: 10.5px; font-weight: 700; color: #9AA1AF;
          text-transform: uppercase; letter-spacing: 0.4px; background: #F8F9FC;
          border-bottom: 1px solid var(--c-border); white-space: nowrap; text-align: left;
        }
        tbody td { padding: 13px 14px; font-size: 13.5px; color: #374151; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid #F1F2F6; }
        tbody tr:last-child { border-bottom: none; }
        .pv-inv-num { color: var(--c-primary); font-weight: 700; font-size: 13px; }
        .pv-customer { display: flex; align-items: center; gap: 8px; }
        .pv-avatar {
          width: 28px; height: 28px; border-radius: 50%; background: var(--c-primary-light);
          color: var(--c-primary-dark); font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pv-amount { font-weight: 700; color: #111827; }
        .pv-badge { display: inline-block; border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .pv-dept-badge {
          display: inline-flex; align-items: center; gap: 4px; background: var(--c-primary-light);
          color: var(--c-primary-dark); border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700;
        }
        .pv-dept-none { color: #D1D5DB; font-style: italic; font-size: 12px; }

        .pv-footer-row { display: flex; justify-content: space-between; padding: 13px 16px; font-size: 12.5px; color: #6B7280; border-top: 1px solid #F1F2F6; }

        .pv-fadein { animation: pvFadeIn 0.35s ease; }
        @keyframes pvFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .pv-spin-wrap { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 320px; color: #8A93A6; font-size: 13.5px; font-weight: 600; }
        .pv-spinner { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--c-primary-light); border-top-color: var(--c-primary); animation: pvSpin 0.8s linear infinite; }
        @keyframes pvSpin { to { transform: rotate(360deg); } }
      `}</style>

      {pageLoading ? (
        <div className="pv-wrap">
          <div className="pv-spin-wrap">
            <div className="pv-spinner" />
            Preparing report preview…
          </div>
        </div>
      ) : (
      <div className="pv-wrap pv-fadein">
        <div className="pv-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="pv-back" onClick={() => navigate("/invoices")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="pv-title">Invoice Report Preview</h1>
              <p className="pv-subtitle">{rangeLabel}</p>
            </div>
          </div>
          <button className="pv-download-btn" onClick={handleDownloadPDF} disabled={downloading}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>

        {/* <div className="pv-stats">
          <div className="pv-stat">
            <p className="pv-stat-label">Total Amount</p>
            <p className="pv-stat-value">{fmt(totalAmount)}</p>
          </div>
          <div className="pv-stat red">
            <p className="pv-stat-label">Overdue Amount</p>
            <p className="pv-stat-value red">{fmt(overdue)}</p>
          </div>
          <div className="pv-stat">
            <p className="pv-stat-label">Drafts</p>
            <p className="pv-stat-value">{drafts}</p>
          </div>
          <div className="pv-stat">
            <p className="pv-stat-label">Total Paid</p>
            <p className="pv-stat-value">{fmt(totalPaid)}</p>
          </div>
        </div> */}

        <div className="pv-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Department</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const id = inv.invoice_id || inv.id;
                const s = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
                const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || null;
                const initials = customerName
                  ? customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                  : "?";
                const deptName = inv.department_data?.department_name || null;
                const settle = inv.settlement_status || "pending";
                const sc = SETTLEMENT_COLOR[settle] || SETTLEMENT_COLOR.pending;
                const settleLabel = settle === "setteled" ? "Settled" : settle === "overdue" ? "Overdue" : "Pending";

                return (
                  <tr key={id}>
                    <td><span className="pv-inv-num">#{inv.invoice_number || id?.slice(0, 8)}</span></td>
                    <td>
                      <div className="pv-customer">
                        <div className="pv-avatar">{initials}</div>
                        {customerName || <span style={{ color: "#9AA1AF", fontStyle: "italic" }}>No customer</span>}
                      </div>
                    </td>
                    <td>
                      {deptName
                        ? <span className="pv-dept-badge">{deptName}</span>
                        : <span className="pv-dept-none">—</span>}
                    </td>
                    <td>{displayDate(inv.invoice_date)}</td>
                    <td>{displayDate(inv.due_date)}</td>
                    <td><span className="pv-amount">{fmt(inv.total_amount, inv.currency)}</span></td>
                    <td>
                      <span className="pv-badge" style={{ background: s.bg, color: s.color }}>
                        {inv.status || "draft"}
                      </span>
                    </td>
                    <td>
                      <span className="pv-badge" style={{ background: sc.bg, color: sc.color }}>
                        {settleLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pv-footer-row">
            <span>{invoices.length} invoice(s)</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>Total: {fmt(totalAmount)}</span>
          </div>
        </div>
      </div>
      )}
    </>
  );
}