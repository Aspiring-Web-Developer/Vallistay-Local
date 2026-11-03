

import React, { useEffect, useState } from "react";
import { Trash } from "iconsax-react";
import api from "../../services/api";
import { T, Avatar, Btn } from "./shared";
import { useToast } from "../Stays/Rooms/Room_Shared";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const inp = {
  width: "100%", boxSizing: "border-box", padding: "8px 11px",
  borderRadius: T.radius, border: `1px solid ${T.border}`,
  fontSize: 13, color: T.text, outline: "none", background: T.white,
};

function Field({ label, children, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : "auto" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSec, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Simple active/inactive switch ──────────────────────────────── */
function StatusSwitch({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        border: "none", background: "transparent", cursor: "pointer", padding: 0,
      }}
    >
      <span
        style={{
          width: 38, height: 22, borderRadius: 999, position: "relative",
          background: active ? T.purple || "#16a34a" : "#d1d5db",
          transition: "background .2s",
        }}
      >
        <span
          style={{
            position: "absolute", top: 2, left: active ? 18 : 2,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .2s",
          }}
        />
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? (T.purpleDark || "#166534") : T.textSec }}>
        {active ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

/* ─── Tiny inline confirm popover (no SweetAlert) ────────────────── */
function ConfirmPopover({ title, text, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(17,24,39,0.45)" }} />
      <div style={{
        position: "relative", background: T.white, borderRadius: T.radiusLg, padding: 22,
        width: "min(340px, 90vw)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 18 }}>{text}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "8px 14px", borderRadius: T.radius, border: `1px solid ${T.border}`,
            background: T.white, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "8px 14px", borderRadius: T.radius, border: "none",
            background: T.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Slide-over drawer ───────────────────────────────────────────── */
export default function CustomerDrawer({ customerId, onClose, onSaved, onDeleted }) {
  const token = localStorage.getItem("access_token");
  const { push, ToastHost } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null); // snapshot to diff against for dirty-check
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`${API_BASE_URL}/customers/get_customer?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!active) return;
        const c = res.data?.data || res.data;
        const loaded = {
          id: c.customer_id,
          name: c.name || "", last_name: c.last_name || "", email: c.email || "",
          mobile: c.mobile || "", mobile_country_code: c.mobile_country_code || "",
          address: c.address || "", country: c.country || "",
          prefered_currency: c.prefered_currency || "", is_active: !!c.is_active,
        };
        setForm(loaded);
        setInitialForm(loaded);
      })
      .catch((err) => push(getErrorMessage(err, "Failed to load customer"), "error"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [customerId]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // Dirty check — Done button only enables once something actually changed
  const isDirty = !!(form && initialForm && Object.keys(initialForm).some(
    (key) => form[key] !== initialForm[key]
  ));

  const handleSave = async () => {
    if (!isDirty) return;
    if (!form.name) {
      push("Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      await api.put(`${API_BASE_URL}/customers/update_customer`, {
        customer_id: form.id, name: form.name, last_name: form.last_name,
        email: form.email, mobile: form.mobile, mobile_country_code: form.mobile_country_code,
        address: form.address, country: form.country,
        prefered_currency: form.prefered_currency,
        is_active: form.is_active,
      }, { headers: { Authorization: `Bearer ${token}` } });
      push("Customer updated", "success");
      onSaved && onSaved();
      // Give the toast a moment to render before this component unmounts on close
      setTimeout(() => onClose(), 600);
    } catch (err) {
      push(getErrorMessage(err, "Update failed"), "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setConfirmingDelete(false);
    try {
      await api.delete(`${API_BASE_URL}/customers/delete_customer?customer_id=${form.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      push("Deleted!", "success");
      setTimeout(() => onDeleted && onDeleted(), 600);
    } catch (err) {
      push(getErrorMessage(err, "Could not delete customer"), "error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", justifyContent: "flex-end" }}>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(17,24,39,0.35)" }} />

      {/* panel */}
      <div style={{
        position: "relative", width: "min(420px, 100vw)", height: "100%",
        background: T.white, boxShadow: "-8px 0 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "customerDrawerIn .22s ease-out",
      }}>
        <style>{`
          @keyframes customerDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {loading || !form ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSec }}>Loading…</div>
        ) : (
          <>
            {/* header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 20px", borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={form.name || "?"} size={44} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{form.name || "Unnamed customer"}</div>
                  <div style={{ fontSize: 12, color: T.textSec }}>{form.is_active ? "Active" : "Inactive"}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: T.textSec, lineHeight: 1 }}>✕</button>
            </div>

            {/* scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Basic Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px" }}>
                  <Field label="First Name"><input style={inp} value={form.name} onChange={e => set("name", e.target.value)} /></Field>
                  <Field label="Last Name"><input style={inp} value={form.last_name} onChange={e => set("last_name", e.target.value)} /></Field>
                  <Field label="Email">
                    <input style={inp} value={form.email} onChange={e => set("email", e.target.value)} />
                  </Field>
                  <Field label="Mobile">
                    <input style={inp} value={form.mobile} inputMode="numeric" maxLength={14}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 14) set("mobile", v); }} />
                  </Field>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Address & Preferences</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px" }}>
                  <Field label="Address" span><input style={inp} value={form.address} onChange={e => set("address", e.target.value)} /></Field>
                  <Field label="Country"><input style={inp} value={form.country} onChange={e => set("country", e.target.value)} /></Field>
                  {/* <Field label="Preferred Currency"><input style={inp} value={form.prefered_currency} onChange={e => set("prefered_currency", e.target.value.toUpperCase())} /></Field> */}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 12 }}>Status</div>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "10px 12px",
                }}>
                  <span style={{ fontSize: 12.5, color: T.textSec }}>Customer can place / manage bookings while active</span>
                  <StatusSwitch active={form.is_active} onChange={(v) => set("is_active", v)} />
                </div>
              </div>
            </div>

            {/* footer */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: 16, borderTop: `1px solid ${T.border}`,
            }}>
              <button
                onClick={() => setConfirmingDelete(true)}
                title="Delete customer"
                style={{
                  width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: T.radius, border: `1px solid #fca5a5`, background: T.redLight, cursor: "pointer",
                }}
              >
                <Trash size={16} color={T.red} />
              </button>
              <Btn
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{
                  minWidth: 100, justifyContent: "center",
                  opacity: (!isDirty && !saving) ? 0.5 : 1,
                  cursor: (!isDirty && !saving) ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Done"}
              </Btn>
            </div>
          </>
        )}
      </div>

      {confirmingDelete && (
        <ConfirmPopover
          title="Delete this customer?"
          text="This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      <ToastHost />
    </div>
  );
}