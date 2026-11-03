import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { RT, ROOM_TYPES, useToast, Spinner } from "./Room_Shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─── Big selectable room-type card ──────────────────────────────── */
function TypeCard({ type, active, onClick }) {
  const [h, setH] = useState(false);
  const Icon = type.icon;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        flex: 1,
        minWidth: 160,
        cursor: "pointer",
        border: `2px solid ${active ? RT.primary : RT.border}`,
        background: active ? RT.primary : RT.white,
        borderRadius: RT.radiusLg,
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        boxShadow: active ? RT.shadowMd : h ? RT.shadow : "none",
        transform: h && !active ? "translateY(-2px)" : "none",
        transition: "all .2s ease",
        position: "relative",
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RT.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: active ? "rgba(255,255,255,0.15)" : RT.secondaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={34} active={active} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, color: active ? "#fff" : RT.text }}>
        {type.label}
      </div>
      <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.8)" : RT.textSec }}>
        {type.sub}
      </div>
    </div>
  );
}

/* ─── Field ───────────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: RT.text }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  border: `1.5px solid ${RT.border}`,
  borderRadius: RT.radiusMd,
  fontSize: 14,
  color: RT.text,
  outline: "none",
  background: RT.bg,
  transition: "border-color .15s, box-shadow .15s",
};

export default function CreateRoom() {
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    room_type: "deluxe",
    max_adults: 2,
    max_children: 1,
    price_per_day: "",
    total_rooms: 1,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const focusRing = (e) => {
    e.target.style.borderColor = RT.primary;
    e.target.style.boxShadow = `0 0 0 3px ${RT.secondaryLight}`;
  };
  const blurRing = (e) => {
    e.target.style.borderColor = RT.border;
    e.target.style.boxShadow = "none";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.price_per_day || Number(form.price_per_day) <= 0) {
      push("Enter a valid price per day", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post(`${API_BASE_URL}/rooms/create_rooms`, {
        room_type: form.room_type,
        max_adults: Number(form.max_adults),
        max_children: Number(form.max_children),
        price_per_day: Number(form.price_per_day),
        total_rooms: Number(form.total_rooms),
      });
      push("Room created successfully");
      setTimeout(() => navigate("/stays/rooms"), 800);
    } catch (err) {
      push(err.response?.data?.message || "Failed to create room", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: RT.text, maxWidth: 880, margin: "30px auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Create Room</h3>
        <div style={{ fontSize: 13, color: RT.textSec, marginTop: 4 }}>
          Add a new room category to your inventory
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: RT.white,
          border: `1px solid ${RT.border}`,
          borderRadius: RT.radiusLg,
          boxShadow: RT.shadow,
          padding: 26,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {/* Room type selector */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: RT.text, marginBottom: 10 }}>
            Room Type
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {ROOM_TYPES.map((t) => (
              <TypeCard
                key={t.key}
                type={t}
                active={form.room_type === t.key}
                onClick={() => set("room_type", t.key)}
              />
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: RT.border }} />

        {/* Numeric fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 18,
          }}
        >
          <Field label="Max Adults">
            <input
              type="number"
              min={1}
              value={form.max_adults}
              onChange={(e) => set("max_adults", e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
              style={inputStyle}
            />
          </Field>
          <Field label="Max Children">
            <input
              type="number"
              min={0}
              value={form.max_children}
              onChange={(e) => set("max_children", e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
              style={inputStyle}
            />
          </Field>
          <Field label="Price / Day (₹)">
            <input
              type="number"
              min={0}
              placeholder="e.g. 2500"
              value={form.price_per_day}
              onChange={(e) => set("price_per_day", e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
              style={inputStyle}
            />
          </Field>
          <Field label="Total Rooms">
            <input
              type="number"
              min={1}
              value={form.total_rooms}
              onChange={(e) => set("total_rooms", e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
          <button
            type="button"
            onClick={() => navigate("/stays/rooms")}
            style={{
              padding: "11px 22px",
              borderRadius: RT.radiusMd,
              border: `1.5px solid ${RT.border}`,
              background: RT.white,
              color: RT.text,
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "11px 26px",
              borderRadius: RT.radiusMd,
              border: "none",
              background: RT.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.75 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background .15s, transform .15s",
            }}
            onMouseEnter={(e) => !saving && (e.target.style.background = RT.primaryDark)}
            onMouseLeave={(e) => !saving && (e.target.style.background = RT.primary)}
          >
            {saving && <Spinner size={14} />}
            {saving ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>

      <ToastHost />
    </div>
  );
}