



import { useEffect, useMemo, useState, useRef } from "react";
import { Edit, Trash, ArrowDown2, Buildings2 } from "iconsax-react";
import api from "../../services/api";
import { useToast } from "../Stays/Rooms/Room_Shared";
import { useAccess } from "../../services/AccessContext";

// ─── Responsive hook ──────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

// ─── Inject fonts + base styles + animations once ──────────────────────────
const STYLE_ID = "dept-page-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .dept-page * { box-sizing: border-box; }
    .dept-page { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
    .dept-heading { font-family: 'Inter','Segoe UI',Arial,sans-serif; }
    .dept-card-title { font-family: 'Inter','Segoe UI',Arial,sans-serif; }

    @keyframes deptOverlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes deptModalIn {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dept-overlay { animation: deptOverlayIn 0.16s ease-out; }
    .dept-modal { animation: deptModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }

    .dept-card {
      transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    }
    .dept-card:hover {
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.12);
      border-color: #bfdbfe;
    }
    .dept-icon-btn { transition: background 0.15s ease, border-color 0.15s ease; }
    .dept-icon-btn:hover { background: #eaf2fe; border-color: #bfdbfe; }
    .dept-primary-btn { transition: background 0.15s ease, transform 0.1s ease; }
    .dept-primary-btn:hover { background: #2f6fdb; }
    .dept-primary-btn:active { transform: scale(0.98); }
    .dept-view-btn { transition: background 0.15s ease, transform 0.1s ease; }
    .dept-view-btn:hover { background: #163fae; }
    .dept-view-btn:active { transform: scale(0.98); }
    .dept-input:focus, .dept-select:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }
  `;
  document.head.appendChild(style);
}

// ─── Design tokens — single blue accent theme ───────────────────────────────
const C = {
  blue: "#2f5fe5",
  blueDark: "#1d4ed8",
  blueSoft: "#93c5fd",
  blueLight: "#eaf2fe",
  red: "#dc2626",
  redLight: "#fee2e2",
  black: "#111214",
  border: "#e9eef7",
  white: "#ffffff",
  text: "#191828",
  muted: "#8d8a9c",
};

const cardStyle = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 1px 2px rgba(30,58,138,0.04)",
};

const ICON_COLORS = [
  { bg: C.blueLight, fg: C.blueDark },
  { bg: "#dbe9fe", fg: C.blue },
  { bg: "#f0f6ff", fg: C.blueDark },
  { bg: "#e2edfe", fg: C.blue },
];

function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function formatCurrency(v) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v ?? 0);
  } catch {
    return `₹${v ?? 0}`;
  }
}

function initials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "DP";
}

// ─── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 700,
        background: active ? C.blueLight : "#f3f4f6",
        color: active ? C.blueDark : "#6b7280",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Toggle switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: checked ? C.blue : "#d5d8de",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 19 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: C.white,
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}

// ─── Custom Status Dropdown (no native select UI) ───────────────────────────
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const OPTIONS = [
    { value: "all", label: "All status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];
  const active = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          border: `1px solid ${open ? C.blue : C.border}`,
          borderRadius: 8,
          padding: "13px 11px",
          fontSize: 12.5,
          background: C.white,
          fontWeight: 500,
          color: C.text,
          outline: "none",
          cursor: "pointer",
          boxShadow: open ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
          minWidth: 130,
        }}
      >
        <span>{active.label}</span>
        <ArrowDown2
          size={13}
          color="#8d8a9c"
          style={{ transition: "transform 0.15s ease", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            boxShadow: "0 12px 28px rgba(30,58,138,0.14)",
            overflow: "hidden",
            padding: 4,
          }}
        >
          {OPTIONS.map((o) => {
            const isActive = o.value === value;
            return (
              <button
                type="button"
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? C.blueDark : C.text,
                  background: isActive ? C.blueLight : "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8f7fb"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Department Card ────────────────────────────────────────────────────────
function DepartmentCard({ dept, index, maxRevenue, onEdit, onDelete, onView,canUpdate, canDelete }) {
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];
  const revenue = dept.total_invoice_amount ?? 0;
  const invoices = dept.total_invoice_count ?? 0;
  const overdue = dept.overdue_count ?? 0;
  const barWidth = pct(revenue, maxRevenue || 1);

  return (
    <div className="dept-card" style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: iconColor.bg,
              color: iconColor.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {initials(dept.department_name)}
          </div>
          <div className="dept-card-title" style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em", color: C.text }}>
            {dept.department_name}
          </div>
        </div>
        {/* <div style={{ display: "flex", gap: 5 }}>
          <button className="dept-icon-btn" onClick={() => onEdit(dept)} title="Edit" style={iconBtnStyle}>
            <Edit size={13} color={C.blue} />
          </button>
          <button className="dept-icon-btn" onClick={() => onDelete(dept)} title="Delete" style={iconBtnStyle}>
            <Trash size={13} color={C.red} />
          </button>
        </div> */}
        <div style={{ display: "flex", gap: 5 }}>
  {canUpdate && (
    <button className="dept-icon-btn" onClick={() => onEdit(dept)} title="Edit" style={iconBtnStyle}>
      <Edit size={13} color={C.blue} />
    </button>
  )}
  {/* {canDelete && (
    <button className="dept-icon-btn" onClick={() => onDelete(dept)} title="Delete" style={iconBtnStyle}>
      <Trash size={13} color={C.red} />
    </button>
  )} */}
</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          margin: "13px 0 11px",
        }}
      >
        <StatBox label="Revenue" value={formatCurrency(revenue)} />
        <StatBox label="Invoices" value={invoices} />
        <StatBox label="Overdue" value={overdue} color={overdue > 0 ? C.red : undefined} />
      </div>

      <div style={{ height: 5, background: "#f1eef8", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${C.blueSoft}, ${C.blue})`,
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 9.5, color: C.muted, marginTop: 4, fontWeight: 500 }}>{barWidth}% of top revenue</div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 11,
        }}
      >
        <StatusBadge active={dept.is_active} />
        <button
          className="dept-view-btn"
          onClick={() => onView(dept)}
          style={{
            border: "none",
            background: C.blueDark,
            color: C.white,
            fontSize: 11.5,
            fontWeight: 700,
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          View invoices →
        </button>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 26,
  height: 26,
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: C.white,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function StatBox({ label, value, color }) {
  return (
    <div
      style={{
        background: "#f8f7fb",
        borderRadius: 9,
        padding: "21px 1px",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: color ?? C.text }}>{value}</div>
      <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Add/Edit Modal ──────────────────────────────────────────────────────────
function DepartmentModal({ open, onClose, onSave, editing, saving }) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(editing?.department_name || "");
    setActive(editing ? !!editing.is_active : true);
  }, [editing, open]);

  if (!open) return null;

  return (
    <div
      className="dept-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,15,28,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="dept-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...cardStyle,
          padding: 22,
          width: 380,
          maxWidth: "100%",
          boxShadow: "0 20px 48px rgba(30,58,138,0.22)",
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="dept-heading" style={{ fontWeight: 700, fontSize: 17, marginBottom: 3, color: C.text }}>
          {editing ? "Edit Department" : "Add Department"}
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 18 }}>
          {editing ? "Update department name & status" : "Create a new department"}
        </div>

        <label style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>Department name</label>
        <input
          className="dept-input"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cardiology"
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: editing ? 14 : 20,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "9px 11px",
            fontSize: 13,
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
        />

        {editing && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8f7fb",
              borderRadius: 9,
              padding: "9px 11px",
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>Active status</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>{active ? "Department is active" : "Department is inactive"}</div>
            </div>
            <Toggle checked={active} onChange={setActive} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.text,
              fontSize: 11.5,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            className="dept-primary-btn"
            disabled={!name.trim() || saving}
            onClick={() => onSave({ name: name.trim(), active })}
            style={{
              border: "none",
              background: C.blue,
              color: C.white,
              fontSize: 11.5,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: !name.trim() || saving ? "not-allowed" : "pointer",
              opacity: !name.trim() || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteConfirmModal({ dept, onCancel, onConfirm, deleting }) {
  if (!dept) return null;
  return (
    <div
      className="dept-overlay"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,15,28,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="dept-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...cardStyle,
          padding: 20,
          width: 340,
          maxWidth: "100%",
          boxShadow: "0 20px 48px rgba(30,58,138,0.22)",
        }}
      >
        <div className="dept-heading" style={{ fontWeight: 700, fontSize: 16, marginBottom: 5, color: C.text }}>
          Delete department?
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
          "{dept.department_name}" will be permanently removed. This can't be undone.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.text,
              fontSize: 11.5,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              border: "none",
              background: C.red,
              color: C.white,
              fontSize: 11.5,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, canCreate, onAdd, onClear }) {
  return (
    <div
      style={{
        ...cardStyle,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "56px 24px",
        borderStyle: "dashed",
        borderColor: "#cfe0fb",
        background: "linear-gradient(180deg, #fbfdff 0%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 10px #f9fafb",
          marginBottom: 22,
        }}
      >
        <Buildings2 size={36} variant="Bulk" color="#9ca3af" />
      </div>

      <div
        className="dept-heading"
        style={{ fontSize: 19, fontWeight: 700, color: C.text, letterSpacing: "-0.01em", marginBottom: 8 }}
      >
        {hasFilters ? "No matching departments" : "No departments yet"}
      </div>

      <div style={{ fontSize: 13.5, color: C.muted, maxWidth: 380, lineHeight: 1.6, marginBottom: 22 }}>
        {hasFilters
          ? "We couldn't find any department matching your search or filter. Try a different name or clear the filters."
          : canCreate
          ? "Departments help you organise your invoices and track revenue for each team. Create your first department to get started."
          : "No departments have been created yet. Please contact your admin to add one."}
      </div>

      {hasFilters ? (
        <button
          type="button"
          className="dept-primary-btn"
          onClick={onClear}
          style={{
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.text,
            fontSize: 12.5,
            fontWeight: 700,
            padding: "10px 18px",
            borderRadius: 9,
            cursor: "pointer",
          }}
        >
          Clear filters
        </button>
      ) : (
        canCreate && (
          <button
            type="button"
            className="dept-primary-btn"
            onClick={onAdd}
            style={{
              border: "none",
              background: C.blue,
              color: C.white,
              fontSize: 12.5,
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: 9,
              cursor: "pointer",
            }}
          >
            + Add Department
          </button>
        )
      )}
    </div>
  );
}


// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 20 }}>
      <button disabled={page === 1} onClick={() => onChange(page - 1)} style={pageBtnStyle(false, page === 1)}>
        ‹ Prev
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)} style={pageBtnStyle(p === page)}>
          {p}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} style={pageBtnStyle(false, page === totalPages)}>
        Next ›
      </button>
    </div>
  );
}

function pageBtnStyle(active, disabled) {
  return {
    border: `1px solid ${active ? C.blue : C.border}`,
    background: active ? C.blue : C.white,
    color: active ? C.white : disabled ? "#c7cbd3" : C.text,
    fontSize: 11.5,
    fontWeight: 700,
    padding: "6px 11px",
    borderRadius: 7,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  };
}

const PAGE_SIZE = 10;

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Department() {
  const bp = useBreakpoint();
  const { push, ToastHost } = useToast();
const { can } = useAccess();
const canCreate = can("departments", "create");
const canUpdate = can("departments", "update");
const canDelete = can("departments", "delete");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = () => {
    setLoading(true);
    api
      .get("/departments/list_departments")
      .then((res) => setDepartments(res.data?.data || []))
      .catch((err) => console.error("Department list fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const matchSearch = !search || d.department_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? d.is_active : !d.is_active);
      return matchSearch && matchStatus;
    });
  }, [departments, search, statusFilter]);

  useEffect(() => setPage(1), [search, statusFilter]);

  const maxRevenue = useMemo(
    () => Math.max(...departments.map((d) => d.total_invoice_amount ?? 0), 0),
    [departments]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setModalOpen(true);
  };

  const handleSave = ({ name, active }) => {
    setSaving(true);
    const req = editing
      ? api.put("/departments/update_department", {
          department_id: editing.department_id,
          department_name: name,
          is_active: active,
        })
      : api.post("/departments/", { department_name: name });

    req
      .then(() => {
        setModalOpen(false);
        setEditing(null);
        fetchDepartments();
        push(editing ? "Department updated!" : "Department created!", "success");
      })
      .catch((err) => {
        console.error("Department save error:", err);
        const msg = err?.response?.data?.message || "Could not save department.";
        push(msg, "error");
      })
      .finally(() => setSaving(false));
  };
  const requestDelete = (dept) => setDeleteTarget(dept);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    api
      .delete(`/departments/delete_department?department_id=${deleteTarget.department_id}`)
      .then(() => {
        fetchDepartments();
        push("Department deleted", "success");
        setDeleteTarget(null);
      })
      .catch((err) => {
        console.error("Department delete error:", err);
        const msg = err?.response?.data?.message || "Could not delete department.";
        push(msg, "error");
      })
      .finally(() => setDeleting(false));
  };

  const handleView = (dept) => {
    window.location.href = `/invoices?department_id=${dept.department_id}`;
  };

  return (
    <div className="dept-page" style={{ padding: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 className="dept-heading" style={{ fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", color: C.text }}>
            Departments
          </h2>
          {/* <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, fontWeight: 500 }}>
            {filtered.length} department{filtered.length !== 1 ? "s" : ""}
          </div> */}
        </div>
        {canCreate && (
        <button
          className="dept-primary-btn"
          onClick={openAdd}
          style={{
            border: "none",
            background: C.blue,
            color: C.white,
            fontSize: 12.5,
            fontWeight: 700,
            padding: "9px 15px",
            borderRadius: 9,
            cursor: "pointer",
          }}
        >
          + Add Department
        </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          className="dept-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search departments…"
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "9px 11px",
            fontSize: 12.5,
            outline: "none",
            width: bp === "mobile" ? "100%" : 240,
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
        />
        <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 36, color: C.muted, fontSize: 13 }}>Loading…</div>
      ) : paged.length === 0 ? (
        <EmptyState
          hasFilters={!!search || statusFilter !== "all"}
          canCreate={canCreate}
          onAdd={openAdd}
          onClear={() => { setSearch(""); setStatusFilter("all"); }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: bp === "desktop" ? "repeat(2, 1fr)" : "1fr",
            gap: 14,
          }}
        >
          {paged.map((dept, i) => (
            <DepartmentCard
              key={dept.department_id}
              dept={dept}
              index={(page - 1) * PAGE_SIZE + i}
              maxRevenue={maxRevenue}
              onEdit={openEdit}
              onDelete={requestDelete}
              onView={handleView}
                canUpdate={canUpdate}
  canDelete={canDelete}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <DepartmentModal open={modalOpen} editing={editing} saving={saving} onClose={() => setModalOpen(false)} onSave={handleSave} />

      <DeleteConfirmModal
        dept={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ToastHost />
    </div>
  );
}