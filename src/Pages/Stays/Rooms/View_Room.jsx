import { useEffect, useState } from "react";
import api from "../../../services/api";
import { RT, ROOM_TYPES, getRoomType, Pill, Spinner } from "./Room_Shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 13px",
  border: `1.5px solid ${RT.border}`,
  borderRadius: RT.radiusMd,
  fontSize: 13.5,
  color: RT.text,
  outline: "none",
  background: RT.white,
  transition: "border-color .15s, box-shadow .15s",
};

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: RT.textSec, textTransform: "uppercase", letterSpacing: ".03em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ViewRoomDrawer({ roomId, startInEdit = false, onClose, onSaved, push }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(startInEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ max_adults: 1, max_children: 0, price_per_day: "", total_rooms: 1 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    fetchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const fetchRoom = () => {
    setLoading(true);
    api
      .get(`${API_BASE_URL}/rooms/get_rooms`, { params: { room_id: roomId } })
      .then((res) => {
        const r = res.data?.data;
        setRoom(r);
        setForm({
          max_adults: r.max_adults,
          max_children: r.max_children,
          price_per_day: r.price_per_day,
          total_rooms: r.total_rooms,
        });
      })
      .catch(() => push && push("Failed to load room", "error"))
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`${API_BASE_URL}/rooms/update_rooms`, {
        room_id: room.room_id,
        max_adults: Number(form.max_adults),
        max_children: Number(form.max_children),
        price_per_day: Number(form.price_per_day),
        total_rooms: Number(form.total_rooms),
      });
      push && push("Room updated successfully");
      setEditMode(false);
      fetchRoom();
      onSaved && onSaved();
    } catch (err) {
      push && push(err.response?.data?.message || "Failed to update room", "error");
    } finally {
      setSaving(false);
    }
  };

  const typeInfo = room ? getRoomType(room.room_type) : null;
  const TypeIcon = typeInfo?.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(31,42,36,0.35)",
          zIndex: 1000,
          opacity: visible ? 1 : 0,
          transition: "opacity .22s ease",
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(430px, 100vw)",
          background: RT.bg,
          zIndex: 1001,
          boxShadow: "-8px 0 30px rgba(31,42,36,0.18)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform .28s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: RT.primary,
            color: "#fff",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.75, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Room Details
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
              {typeInfo ? typeInfo.label : "Loading..."}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spinner />
            </div>
          ) : room ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Type card (read-only always — type can't change after creation) */}
              <div
                style={{
                  background: RT.white,
                  border: `1px solid ${RT.border}`,
                  borderRadius: RT.radiusLg,
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: RT.shadow,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: RT.secondaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {TypeIcon && <TypeIcon size={28} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{typeInfo.label}</div>
                  <div style={{ fontSize: 12, color: RT.textSec }}>{typeInfo.sub}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Pill color={room.is_active ? "green" : "gray"}>
                    {room.is_active ? "Active" : "Inactive"}
                  </Pill>
                </div>
              </div>
              <div style={{ fontSize: 11, color: RT.textTer, marginTop: -12 }}>
                Room type is locked after creation
              </div>

              {/* Editable fields */}
              <div
                style={{
                  background: RT.white,
                  border: `1px solid ${RT.border}`,
                  borderRadius: RT.radiusLg,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  boxShadow: RT.shadow,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Max Adults">
                    {editMode ? (
                      <input
                        type="number"
                        min={1}
                        value={form.max_adults}
                        onChange={(e) => set("max_adults", e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{room.max_adults}</div>
                    )}
                  </Field>
                  <Field label="Max Children">
                    {editMode ? (
                      <input
                        type="number"
                        min={0}
                        value={form.max_children}
                        onChange={(e) => set("max_children", e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{room.max_children}</div>
                    )}
                  </Field>
                  <Field label="Price / Day">
                    {editMode ? (
                      <input
                        type="number"
                        min={0}
                        value={form.price_per_day}
                        onChange={(e) => set("price_per_day", e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 700 }}>₹{room.price_per_day}</div>
                    )}
                  </Field>
                  <Field label="Total Rooms">
                    {editMode ? (
                      <input
                        type="number"
                        min={1}
                        value={form.total_rooms}
                        onChange={(e) => set("total_rooms", e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{room.total_rooms}</div>
                    )}
                  </Field>
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: RT.textTer }}>
                Room ID: {room.room_id}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: RT.textSec, padding: "40px 0" }}>
              Room not found
            </div>
          )}
        </div>

        {/* Footer actions */}
        {room && !loading && (
          <div
            style={{
              padding: 18,
              borderTop: `1px solid ${RT.border}`,
              background: RT.white,
              display: "flex",
              gap: 10,
            }}
          >
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      max_adults: room.max_adults,
                      max_children: room.max_children,
                      price_per_day: room.price_per_day,
                      total_rooms: room.total_rooms,
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
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
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "11px 0",
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
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {saving && <Spinner size={14} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: RT.radiusMd,
                  border: "none",
                  background: RT.primary,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Edit Room
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}