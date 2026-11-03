


import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users, FileText, Plus, TrendingUp, Wallet, Clock, AlertCircle,
  ArrowRight, ChevronDown, ChevronRight, Calendar, Download,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(v) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v ?? 0);
  } catch {
    return `₹${Number(v ?? 0).toFixed(2)}`;
  }
}

const extractDate = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object" && raw.$date !== undefined) return raw.$date;
  return raw;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Adjust the keys here if your auth stores the user under a different key
function getStoredUserName() {
  try {
    for (const key of ["user", "userData", "user_info", "profile"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const o = JSON.parse(raw);
      const n =
        o?.name ||
        o?.full_name ||
        o?.username ||
        [o?.first_name, o?.last_name].filter(Boolean).join(" ");
      if (n) return n;
    }
  } catch {
    /* ignore */
  }
  return "";
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const PERIODS = [
  "This financial year",
  "Last 6 Months",
  "Last 3 Months",
  "This Month",
];

// Same logic as the Invoices list page so numbers always match
const getInvoiceFinancials = (inv) => {
  const grandTotal = parseFloat(inv.grand_total_amount || inv.total_amount || 0);
  const advance = parseFloat(inv.advance_amount || 0);
  const manualPaid = parseFloat(inv.manual_paid_amount || 0);
  const paid = parseFloat(inv.paid_amount || 0);

  let balanceDue;
  if (inv.balance_amount !== undefined && inv.balance_amount !== null) {
    balanceDue = parseFloat(inv.balance_amount || 0);
  } else {
    balanceDue = Math.max(0, grandTotal - advance - manualPaid - paid);
  }

  const totalPaidSoFar = Math.max(0, grandTotal - balanceDue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawDue = extractDate(inv.due_date);
  const dueDate = rawDue ? new Date(rawDue) : null;
  const isOverdue =
    balanceDue > 0 &&
    (inv.settlement_status === "overdue" || (dueDate && dueDate < today));

  return { grandTotal, balanceDue, totalPaidSoFar, isOverdue };
};

const getSettle = (fin) =>
  fin.balanceDue <= 0 ? "settled" : fin.isOverdue ? "overdue" : "pending";

const SETTLE_UI = {
  settled: { label: "Paid", bg: "#DCFCE7", color: "#15803D" },
  pending: { label: "Pending", bg: "#FEF3C7", color: "#B45309" },
  overdue: { label: "Overdue", bg: "#FEE2E2", color: "#DC2626" },
};

// Period → date range + chart buckets
function getPeriodConfig(period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let start;
  let end;
  const buckets = [];

  if (period === "This financial year") {
    const fy = m >= 3 ? y : y - 1;
    start = new Date(fy, 3, 1);
    end = new Date(fy + 1, 3, 1);
    for (let i = 0; i < 12; i++) buckets.push(new Date(fy, 3 + i, 1));
  } else {
    const n = period === "Last 6 Months" ? 6 : period === "Last 3 Months" ? 3 : 1;
    start = new Date(y, m - (n - 1), 1);
    end = new Date(y, m + 1, 1);
    for (let i = n - 1; i >= 0; i--) buckets.push(new Date(y, m - i, 1));
  }

  const fyLabel =
    period === "This financial year"
      ? `FY ${start.getFullYear()}-${String(start.getFullYear() + 1).slice(2)}`
      : period.toUpperCase();

  return { start, end, buckets, label: fyLabel };
}

const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;

// ─── Header ──────────────────────────────────────────────────────────────────
function DashboardHeader({ userName, period, setPeriod, onCreateInvoice }) {
  const firstName = userName ? userName.split(" ")[0] : "";
  return (
    <header className="valli-header">
      <div className="valli-header-left">
        <h1 className="valli-header-title">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="valli-header-subtitle">
          Here is a quick overview of your business today.
        </p>
      </div>

      <div className="valli-header-right">
        <div className="valli-period-wrapper">
          <Calendar size={15} className="valli-period-icon" />
          <select
            className="valli-period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={14} className="valli-select-chevron" />
        </div>

        <button type="button" className="valli-btn-primary" onClick={onCreateInvoice}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Create invoice</span>
        </button>
      </div>
    </header>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, description, accent, icon: Icon, tag }) {
  return (
    <div className={`valli-kpi-card accent-${accent}`}>
      <div className="valli-kpi-top">
        <span className="valli-kpi-label">{label}</span>
        <div className="valli-kpi-icon-wrapper">
          <Icon size={18} />
        </div>
      </div>
      <div className="valli-kpi-value">{formatCurrency(value)}</div>
      <div className="valli-kpi-footer">
        {tag && <span className="valli-kpi-tag">{tag}</span>}
        <span className="valli-kpi-desc">{description}</span>
      </div>
    </div>
  );
}

// ─── Chart Tooltip ───────────────────────────────────────────────────────────
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="valli-chart-tooltip">
      <div className="valli-tooltip-month">{label}</div>
      <div className="valli-tooltip-row blue">
        <span className="valli-tooltip-dot blue"></span>
        <span className="valli-tooltip-name">Invoiced:</span>
        <span className="valli-tooltip-val">{formatCurrency(d.revenue)}</span>
      </div>
      <div className="valli-tooltip-row green">
        <span className="valli-tooltip-dot green"></span>
        <span className="valli-tooltip-name">Collected:</span>
        <span className="valli-tooltip-val">{formatCurrency(d.collected)}</span>
      </div>
    </div>
  );
}

// ─── Revenue Performance ─────────────────────────────────────────────────────
function RevenuePerformanceCard({ chartData, periodLabel, totalInvoiced }) {
  const hasData = chartData.some((d) => d.revenue > 0 || d.collected > 0);

  return (
    <div className="valli-card valli-revenue-card">
      <div className="valli-card-header">
        <div>
          <h2 className="valli-card-title">Revenue performance</h2>
          <p className="valli-card-subtitle">
            Monthly comparison between total invoiced volume and actual collections.
          </p>
        </div>
        <div className="valli-chart-header-actions">
          <div className="valli-chart-legend">
            <span className="valli-legend-item">
              <span className="valli-legend-badge blue"></span> Invoiced
            </span>
            <span className="valli-legend-item">
              <span className="valli-legend-badge green"></span> Collected
            </span>
          </div>
          <span className="valli-chart-year-badge">{periodLabel}</span>
        </div>
      </div>

      <div className="valli-card-body">
        {hasData ? (
          <div className="valli-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 10, left: -14, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="0" stroke="#f0f4f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#728096" }}
                  axisLine={{ stroke: "#e7edf5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#728096" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : v)}
                />
                <Tooltip
                  content={<CustomChartTooltip />}
                  cursor={{ fill: "rgba(244, 247, 251, 0.6)" }}
                />
                <Bar dataKey="revenue" fill="#2867dc" radius={[4, 4, 0, 0]} barSize={13} name="Invoiced" />
                <Bar dataKey="collected" fill="#18a56b" radius={[4, 4, 0, 0]} barSize={13} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="valli-chart-empty">
            <div className="valli-empty-icon-wrap">
              <TrendingUp size={24} />
            </div>
            <h3 className="valli-empty-title">No revenue data yet</h3>
            <p className="valli-empty-text">
              Invoice activity will appear here once you start creating invoices.
            </p>
          </div>
        )}
      </div>

      <div className="valli-card-footer valli-revenue-footer">
        <div className="valli-footer-metric">
          <Clock size={15} className="valli-footer-icon" />
          <span>
            Invoiced in this period: <strong>{formatCurrency(totalInvoiced)}</strong>
          </span>
        </div>
        {/* <button
          type="button"
          className="valli-btn-link"
          onClick={() => {
            if (typeof window !== "undefined" && window.print) window.print();
          }}
        >
          <Download size={14} />
          <span>Download statement</span>
        </button> */}
      </div>
    </div>
  );
}

// ─── Receivables Overview ────────────────────────────────────────────────────
function ReceivablesOverviewCard({ stats }) {
  const navigate = useNavigate();
  const collectionRate =
    stats.totalRevenue > 0
      ? Math.min(100, Math.max(0, Math.round((stats.collected / stats.totalRevenue) * 100)))
      : 0;

  const hasOverdue = stats.overdueCount > 0;
  const invoiceText = `${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"}`;

  return (
    <div className="valli-card valli-receivables-card">
      <div className="valli-card-header">
        <div>
          <h2 className="valli-card-title">Receivables overview</h2>
          <p className="valli-card-subtitle">Real-time collections pipeline</p>
        </div>
        <div className="valli-icon-pill">
          <FileText size={16} />
        </div>
      </div>

      <div className="valli-card-body">
        <div className="valli-rec-headline">
          <div className="valli-rec-label">TOTAL PENDING SETTLEMENT</div>
          <div className="valli-rec-amount-row">
            <span className="valli-rec-amount">{formatCurrency(stats.outstanding)}</span>
            {stats.outstanding > 0 && <span className="valli-badge-active">Active</span>}
          </div>
        </div>

        <div className="valli-progress-wrap">
          <div className="valli-progress-labels">
            <span>Collection rate</span>
            <span className="valli-progress-val">{collectionRate}%</span>
          </div>
          <div className="valli-progress-track">
            <div className="valli-progress-fill" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>

        <div className="valli-breakdown-list">
          <div className="valli-breakdown-item">
            <div className="valli-breakdown-key">
              <span className="valli-dot dot-green"></span>
              Collected
            </div>
            <div className="valli-breakdown-val">{formatCurrency(stats.collected)}</div>
          </div>
          <div className="valli-breakdown-item">
            <div className="valli-breakdown-key">
              <span className="valli-dot dot-red"></span>
              Overdue · {invoiceText}
            </div>
            <div className="valli-breakdown-val">{formatCurrency(stats.overdue)}</div>
          </div>
        </div>

        <div className="valli-reminder-callout">
          <div className="valli-reminder-icon">
            {hasOverdue ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div className="valli-reminder-content">
            <div className="valli-reminder-title">
              {hasOverdue ? "Payments need your attention" : "All caught up"}
            </div>
            <p className="valli-reminder-text">
              {hasOverdue
                ? `${formatCurrency(stats.overdue)} across ${invoiceText} is past the due date and still to be collected.`
                : "Nice work — there are no overdue invoices at this time."}
            </p>
            {hasOverdue && (
              <button
                type="button"
                className="valli-reminder-action"
                onClick={() => navigate("/invoices")}
              >
                Review overdue invoices <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Business Snapshot ───────────────────────────────────────────────────────
function BusinessSnapshotCard({ stats, periodLabel }) {
  const metrics = [
    { label: "Total guest", value: stats.totalCustomers, icon: Users, colorClass: "blue" },
    { label: "Invoices generated", value: stats.totalInvoices, icon: FileText, colorClass: "indigo" },
    { label: "Paid & settled", value: stats.settledCount, icon: CheckCircle2, colorClass: "green" },
  ];

  return (
    <div className="valli-card valli-snapshot-card">
      <div className="valli-card-header valli-snapshot-header">
        <div>
          <h2 className="valli-card-title">Business Overview</h2>
          <p className="valli-card-subtitle">Key activity across your billing workflow</p>
        </div>
        <span className="valli-cadence-badge">{periodLabel}</span>
      </div>

      <div className="valli-snapshot-grid">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="valli-snapshot-block">
              <div className={`valli-snapshot-icon ${m.colorClass}`}>
                <Icon size={20} />
              </div>
              <div className="valli-snapshot-info">
                <div className="valli-snapshot-number">{m.value}</div>
                <div className="valli-snapshot-label">{m.label}</div>
              </div>
              {idx < metrics.length - 1 && <div className="valli-snapshot-divider" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ settle }) {
  const ui = SETTLE_UI[settle] || SETTLE_UI.pending;
  return (
    <span
      className="valli-status-badge"
      style={{ background: ui.bg, color: ui.color }}
    >
      <span
        className="valli-status-dot-sm"
        style={{ background: "currentColor" }}
      ></span>{" "}
      {ui.label}
    </span>
  );
}

// ─── Recent Invoices ─────────────────────────────────────────────────────────
function RecentInvoicesCard({ transactions, loading, totalInvoices, onCreateInvoice }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name || name === "No customer") return "NA";
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="valli-card valli-invoices-card">
      <div className="valli-card-header">
        <div>
          <h2 className="valli-card-title">Recent invoices</h2>
          <p className="valli-card-subtitle">Real-time ledger entries and settlement records</p>
        </div>
        <button type="button" className="valli-btn-view-all" onClick={() => navigate("/invoices")}>
          <span>View all invoices</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="valli-table-skeleton">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="valli-skeleton-row">
              <div className="valli-skeleton-bar short" />
              <div className="valli-skeleton-bar medium" />
              <div className="valli-skeleton-bar short" />
              <div className="valli-skeleton-bar short" />
              <div className="valli-skeleton-bar pill" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="valli-table-empty">
          <div className="valli-empty-icon-wrap">
            <FileText size={28} />
          </div>
          <h3 className="valli-empty-title">No invoices in this period</h3>
          <p className="valli-empty-text">Create an invoice to start tracking revenue.</p>
          <button type="button" className="valli-btn-primary" onClick={onCreateInvoice}>
            <Plus size={16} />
            <span>Create invoice</span>
          </button>
        </div>
      ) : (
        <>
          <div className="valli-table-responsive">
            <table className="valli-table">
              <thead>
                <tr>
                  <th>INVOICE</th>
                  <th>GUEST</th>
                  <th>ISSUED DATE</th>
                  <th style={{ textAlign: "right" }}>AMOUNT</th>
                  <th style={{ textAlign: "center" }}>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.invoice_id || t.invoice_no}
                    className="valli-table-row"
                    tabIndex={0}
                    role="button"
                    aria-label={`View invoice ${t.invoice_no}`}
                    onClick={() => t.invoice_id && navigate(`/invoices/${t.invoice_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        t.invoice_id && navigate(`/invoices/${t.invoice_id}`);
                      }
                    }}
                  >
                    <td>
                      <span className="valli-invoice-code">{t.invoice_no ?? "—"}</span>
                    </td>
                    <td>
                      <div className="valli-customer-cell">
                        <div className="valli-customer-avatar">{getInitials(t.customer)}</div>
                        <div className="valli-customer-details">
                          <span className="valli-customer-name">{t.customer}</span>
                          <span className="valli-customer-sub">{t.department || "No department"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="valli-invoice-date">{t.date}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="valli-invoice-amount">{formatCurrency(t.amount)}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <StatusBadge settle={t.settle} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="valli-row-action-btn"
                        title="View details"
                        aria-label="View details"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="valli-mobile-invoices-list">
            {transactions.map((t) => (
              <div
                key={t.invoice_id || t.invoice_no}
                className="valli-mobile-invoice-card"
                onClick={() => t.invoice_id && navigate(`/invoices/${t.invoice_id}`)}
              >
                <div className="valli-mobile-row-top">
                  <span className="valli-invoice-code">{t.invoice_no ?? "—"}</span>
                  <span className="valli-invoice-amount">{formatCurrency(t.amount)}</span>
                </div>
                <div className="valli-mobile-row-mid">
                  <span className="valli-customer-name">{t.customer}</span>
                  <StatusBadge settle={t.settle} />
                </div>
                <div className="valli-mobile-row-bot">
                  <span className="valli-invoice-date">{t.date}</span>
                  <ChevronRight size={16} className="valli-mobile-arrow" />
                </div>
              </div>
            ))}
          </div>

          <div className="valli-table-footer">
            <div className="valli-footer-count">
              Showing {transactions.length} of {totalInvoices || transactions.length} invoices
            </div>
            <button type="button" className="valli-btn-view-all" onClick={() => navigate("/invoices")}>
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("This financial year");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiCustomers, setApiCustomers] = useState(null);

  const userName = useMemo(() => getStoredUserName(), []);

  const handleCreateInvoice = () => navigate("/invoices/create");

  // Invoices (single source of truth)
  useEffect(() => {
    setLoading(true);
    api
      .get("/invoices/")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setInvoices(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Invoices fetch error:", err);
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Customer count only
  useEffect(() => {
    api
      .get("/dashboard/")
      .then((res) => {
        const c = res.data?.data?.total_customers;
        if (typeof c === "number") setApiCustomers(c);
      })
      .catch((err) => console.error("Dashboard stats fetch error:", err));
  }, []);

  // Enrich every invoice once
  const enriched = useMemo(
    () =>
      invoices.map((inv) => {
        const fin = getInvoiceFinancials(inv);
        const raw = extractDate(inv.invoice_date);
        const date = raw ? new Date(raw) : null;
        return {
          inv,
          fin,
          date: date && !isNaN(date.getTime()) ? date : null,
          settle: getSettle(fin),
        };
      }),
    [invoices]
  );

  const config = useMemo(() => getPeriodConfig(period), [period]);

  const periodItems = useMemo(
    () => enriched.filter((e) => e.date && e.date >= config.start && e.date < config.end),
    [enriched, config]
  );

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let collected = 0;
    let outstanding = 0;
    let overdue = 0;
    let overdueCount = 0;
    let settledCount = 0;
    const customers = new Set();

    periodItems.forEach(({ inv, fin, settle }) => {
      totalRevenue += fin.grandTotal;
      collected += fin.totalPaidSoFar;
      if (fin.balanceDue > 0) outstanding += fin.balanceDue;
      if (fin.isOverdue) {
        overdue += fin.balanceDue;
        overdueCount += 1;
      }
      if (settle === "settled") settledCount += 1;
      const cName = inv.customer_data?.name || inv.customer_data?.customer_name;
      if (cName) customers.add(cName);
    });

    return {
      totalRevenue,
      collected,
      outstanding,
      overdue,
      overdueCount,
      pending: Math.max(0, outstanding - overdue),
      unpaidCount: periodItems.filter((e) => e.fin.balanceDue > 0).length,
      totalInvoices: periodItems.length,
      settledCount,
      totalCustomers: apiCustomers ?? customers.size,
    };
  }, [periodItems, apiCustomers]);

  // Month-over-month change (real, not hardcoded)
  const momTag = useMemo(() => {
    const now = new Date();
    const curKey = monthKey(now);
    const prevKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    let cur = 0;
    let prev = 0;
    enriched.forEach(({ date, fin }) => {
      if (!date) return;
      const k = monthKey(date);
      if (k === curKey) cur += fin.grandTotal;
      if (k === prevKey) prev += fin.grandTotal;
    });
    if (prev <= 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }, [enriched]);

  const chartData = useMemo(() => {
    const map = new Map(
      config.buckets.map((d) => [
        monthKey(d),
        { month: MONTH_NAMES[d.getMonth()], revenue: 0, collected: 0 },
      ])
    );
    periodItems.forEach(({ date, fin }) => {
      const row = map.get(monthKey(date));
      if (row) {
        row.revenue += fin.grandTotal;
        row.collected += fin.totalPaidSoFar;
      }
    });
    return Array.from(map.values());
  }, [periodItems, config]);

  const transactions = useMemo(
    () =>
      periodItems
        .slice()
        .sort((a, b) => b.date - a.date)
        .slice(0, 8)
        .map(({ inv, fin, date, settle }) => ({
          invoice_id: inv.invoice_id || inv._id || inv.id,
          invoice_no: inv.invoice_number
            ? `#${inv.invoice_number}`
            : inv.invoice_id?.slice(0, 8),
          customer:
            inv.customer_data?.name ||
            inv.customer_data?.customer_name ||
            inv.customer_details?.name ||
            inv.customer_details?.customer_name ||
            "No customer",
          department: inv.department_data?.department_name || "",
          amount: fin.grandTotal,
          date: date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          settle,
        })),
    [periodItems]
  );

  return (
    <div className="valli-dashboard-page">
      <div className="valli-dashboard-container">
        <DashboardHeader
          userName={userName}
          period={period}
          setPeriod={setPeriod}
          onCreateInvoice={handleCreateInvoice}
        />

        <section className="valli-kpi-grid">
          <StatCard
            label="Total revenue"
            value={stats.totalRevenue}
            // description={momTag ? "vs last month" : `${stats.totalInvoices} invoices in period`}
            // tag={momTag}
            accent="blue"
            icon={TrendingUp}
          />
          <StatCard
            label="Collected"
            value={stats.collected}
            description="Payments received"
            accent="green"
            icon={Wallet}
          />
          <StatCard
            label="Outstanding"
            value={stats.outstanding}
            description={`${stats.unpaidCount} unpaid invoice${stats.unpaidCount === 1 ? "" : "s"}`}
            accent="amber"
            icon={Clock}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            description={
              stats.overdueCount > 0
                ? `${stats.overdueCount} need follow-up`
                : "No overdue payments"
            }
            accent="red"
            icon={AlertCircle}
          />
        </section>

        <section className="valli-insights-grid">
          <RevenuePerformanceCard
            chartData={chartData}
            periodLabel={config.label}
            totalInvoiced={stats.totalRevenue}
          />
          <ReceivablesOverviewCard stats={stats} />
        </section>

        <section>
          <BusinessSnapshotCard stats={stats} periodLabel={config.label} />
        </section>

        <section>
          <RecentInvoicesCard
            transactions={transactions}
            loading={loading}
            totalInvoices={stats.totalInvoices}
            onCreateInvoice={handleCreateInvoice}
          />
        </section>
      </div>
    </div>
  );
}