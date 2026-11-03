import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ViewRoomDrawer from "./View_Room";
import { RT, ROOM_TYPES, getRoomType, Pill, Spinner, useToast } from "./Room_Shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function GridIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "#fff" : RT.textSec} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? "#fff" : RT.textSec} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? "#fff" : RT.textSec} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? "#fff" : RT.textSec} />
    </svg>
  );
}
function ListIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : RT.textSec} />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : RT.textSec} />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : RT.textSec} />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RT.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function AddIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconBtn({ onClick, title, children }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 30,
        height: 30,
        borderRadius: RT.radius,
        border: "none",
        background: h ? RT.secondaryLight : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background .15s",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Grid card ───────────────────────────────────────────────────── */
function RoomCard({ room, onView, onEdit }) {
  const [h, setH] = useState(false);
  const type = getRoomType(room.room_type);
  const Icon = type.icon;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: RT.white,
        border: `1px solid ${h ? RT.primary : RT.border}`,
        borderRadius: RT.radiusLg,
        overflow: "hidden",
        boxShadow: h ? RT.shadowMd : RT.shadow,
        transform: h ? "translateY(-3px)" : "none",
        transition: "all .2s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${RT.secondaryLight} 0%, #fff 100%)`,
          padding: "18px 18px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: RT.shadow,
          }}
        >
          <Icon size={26} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: RT.text }}>{type.label}</div>
          <div style={{ fontSize: 11.5, color: RT.textSec }}>{type.sub}</div>
        </div>
        <Pill color={room.is_active ? "green" : "gray"}>{room.is_active ? "Active" : "Inactive"}</Pill>
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: RT.textTer, textTransform: "uppercase", letterSpacing: ".05em" }}>Capacity</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: RT.text, marginTop: 2 }}>
              {room.max_adults} Adults · {room.max_children} Kids
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: RT.textTer, textTransform: "uppercase", letterSpacing: ".05em" }}>Total Rooms</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: RT.text, marginTop: 2 }}>{room.total_rooms}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px dashed ${RT.border}` }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: RT.primary }}>₹{room.price_per_day}</span>
            <span style={{ fontSize: 11.5, color: RT.textSec }}> / day</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            <IconBtn title="Edit" onClick={() => onEdit(room.room_id)}><EditIcon /></IconBtn>
            <IconBtn title="View" onClick={() => onView(room.room_id)}><EyeIcon /></IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Table row ───────────────────────────────────────────────────── */
function TableRow({ room, isLast, onView, onEdit }) {
  const [h, setH] = useState(false);
  const type = getRoomType(room.room_type);
  const Icon = type.icon;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 90px",
        alignItems: "center",
        padding: "13px 20px",
        borderBottom: isLast ? "none" : `1px solid ${RT.border}`,
        background: h ? RT.secondaryLight : RT.white,
        borderLeft: h ? `3px solid ${RT.primary}` : "3px solid transparent",
        transition: "background .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: RT.secondaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{type.label}</span>
      </div>
      <span style={{ fontSize: 13, color: RT.text }}>{room.max_adults}</span>
      <span style={{ fontSize: 13, color: RT.text }}>{room.max_children}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: RT.primary }}>₹{room.price_per_day}</span>
      <span style={{ fontSize: 13, color: RT.text }}>{room.total_rooms}</span>
      <div><Pill color={room.is_active ? "green" : "gray"}>{room.is_active ? "Active" : "Inactive"}</Pill></div>
      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <IconBtn title="Edit" onClick={() => onEdit(room.room_id)}><EditIcon /></IconBtn>
        <IconBtn title="View" onClick={() => onView(room.room_id)}><EyeIcon /></IconBtn>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */
export default function ListRoom() {
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid"); // default grid
  const [typeFilter, setTypeFilter] = useState("all");
  const [drawer, setDrawer] = useState(null); // { roomId, edit }

  const fetchRooms = () => {
    setLoading(true);
    api
      .get(`${API_BASE_URL}/rooms/list_rooms`)
      .then((res) => setRooms(res.data?.data || []))
      .catch(() => push("Failed to load rooms", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const filtered = typeFilter === "all" ? rooms : rooms.filter((r) => r.room_type === typeFilter);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: RT.text }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 30,
          marginBottom: 18,
          background: RT.white,
          border: `1px solid ${RT.border}`,
          borderRadius: RT.radiusLg,
          padding: "16px 20px",
          boxShadow: RT.shadow,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Rooms</h3>
          <div style={{ fontSize: 12.5, color: RT.textSec, marginTop: 3 }}>
            <span style={{ color: RT.primary, fontWeight: 700 }}>{rooms.length}</span> room types configured
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Type filter pills */}
          <div style={{ display: "flex", gap: 6, background: RT.bg, border: `1px solid ${RT.border}`, borderRadius: RT.radiusMd, padding: 4 }}>
            <button
              onClick={() => setTypeFilter("all")}
              style={{
                padding: "6px 12px", borderRadius: RT.radius, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                background: typeFilter === "all" ? RT.primary : "transparent",
                color: typeFilter === "all" ? "#fff" : RT.textSec,
                transition: "all .15s",
              }}
            >
              All
            </button>
            {ROOM_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                style={{
                  padding: "6px 12px", borderRadius: RT.radius, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  background: typeFilter === t.key ? RT.primary : "transparent",
                  color: typeFilter === t.key ? "#fff" : RT.textSec,
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid/list toggle */}
          <div style={{ display: "flex", background: RT.bg, border: `1px solid ${RT.border}`, borderRadius: RT.radiusMd, padding: 3, gap: 2 }}>
            {[{ key: "grid", Icon: GridIcon }, { key: "list", Icon: ListIcon }].map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  width: 32, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  background: view === key ? RT.primary : "transparent", borderRadius: RT.radius,
                  border: "none", cursor: "pointer", transition: "all .15s",
                }}
              >
                <Icon active={view === key} />
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/stays/rooms/create")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: RT.radiusMd,
              border: "none", background: RT.primary, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = RT.primaryDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = RT.primary)}
          >
            <AddIcon /> Create Room
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg }}>
          <Spinner />
          <span style={{ fontSize: 13, color: RT.textSec }}>Loading rooms…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: RT.textSec, background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: RT.text }}>No rooms found</div>
          <div style={{ fontSize: 12.5 }}>Try a different filter or create a new room type</div>
        </div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {filtered.map((r) => (
            <RoomCard
              key={r.room_id}
              room={r}
              onView={(id) => setDrawer({ roomId: id, edit: false })}
              onEdit={(id) => setDrawer({ roomId: id, edit: true })}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg, overflow: "hidden", boxShadow: RT.shadow }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 90px",
              padding: "11px 20px",
              background: RT.secondaryLight,
              borderBottom: `1px solid ${RT.border}`,
              fontSize: 11,
              fontWeight: 700,
              color: RT.primaryDark,
              letterSpacing: ".05em",
              textTransform: "uppercase",
            }}
          >
            <span>Room Type</span><span>Adults</span><span>Children</span><span>Price/Day</span><span>Total</span><span>Status</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {filtered.map((r, i) => (
            <TableRow
              key={r.room_id}
              room={r}
              isLast={i === filtered.length - 1}
              onView={(id) => setDrawer({ roomId: id, edit: false })}
              onEdit={(id) => setDrawer({ roomId: id, edit: true })}
            />
          ))}
        </div>
      )}

      {drawer && (
        <ViewRoomDrawer
          roomId={drawer.roomId}
          startInEdit={drawer.edit}
          onClose={() => setDrawer(null)}
          onSaved={fetchRooms}
          push={push}
        />
      )}

      <ToastHost />
    </div>
  );
}