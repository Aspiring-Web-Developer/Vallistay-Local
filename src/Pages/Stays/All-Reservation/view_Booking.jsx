import { useEffect, useState } from "react";
import api from "../../../services/api";
import { RT, getRoomType, Spinner, useToast } from "../Rooms/Room_Shared";
import { fmtDate, STATUS_MAP, StatusDropdown } from "./List_Bookings";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: RT.textTer, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: RT.text, marginTop: 3 }}>{value || "—"}</div>
    </div>
  );
}

export default function ViewBookingDrawer({ bookingId, onClose, onStatusChanged }) {
  const { push, ToastHost } = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setVisible(true);
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBooking = () => {
    setLoading(true);
    api
      .get(`${API_BASE_URL}/room_booking/get_booking`, { params: { room_booking_id: bookingId } })
      .then((res) => setBooking(res.data?.data))
      .catch(() => push("Failed to load booking", "error"))
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`${API_BASE_URL}/room_booking/update_booking`, {
        room_booking_id: booking.room_booking_id,
        status: newStatus,
      });
      setBooking((b) => ({ ...b, status: newStatus }));
      push(`Status updated to ${STATUS_MAP[newStatus]?.label || newStatus}`);
      onStatusChanged && onStatusChanged();
    } catch (err) {
      push(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const type = booking ? getRoomType(booking.room_details?.room_type) : null;
  const TypeIcon = type?.icon;

  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(31,42,36,0.35)", zIndex: 1000,
          opacity: visible ? 1 : 0, transition: "opacity .22s ease",
        }}
      />
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(440px, 100vw)",
          background: RT.bg, zIndex: 1001, boxShadow: "-8px 0 30px rgba(31,42,36,0.18)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform .28s cubic-bezier(.4,0,.2,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ background: RT.primary, color: "#fff", padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.75, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Booking Details
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
              {booking ? booking.name : "Loading..."}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
          ) : booking ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Status */}
              <div style={{
                background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg,
                padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: RT.shadow,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: RT.textSec }}>Current Status</div>
                <StatusDropdown status={booking.status} disabled={updating} onChange={handleStatusChange} />
              </div>

              {/* Room info */}
              <div style={{
                background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg,
                padding: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: RT.shadow,
              }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: RT.secondaryLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {TypeIcon && <TypeIcon size={26} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{type.label} Room</div>
                  <div style={{ fontSize: 12, color: RT.textSec }}>
                    ₹{booking.room_details?.price_per_day}/day · {booking.room_count} room{booking.room_count > 1 ? "s" : ""} booked
                  </div>
                </div>
              </div>

              {/* Stay details */}
              <div style={{
                background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg,
                padding: 18, boxShadow: RT.shadow, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
              }}>
                <InfoRow label="Check-in" value={fmtDate(booking.booking_check_in_date)} />
                <InfoRow label="Check-out" value={fmtDate(booking.booking_check_out_date)} />
                <InfoRow label="Adults" value={booking.adults} />
                <InfoRow label="Children" value={booking.children} />
                <InfoRow label="Rooms Booked" value={booking.room_count} />
              </div>

              {/* Guest info */}
              <div style={{
                background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg,
                padding: 18, boxShadow: RT.shadow, display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: RT.textSec, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  Guest Information
                </div>
                <InfoRow label="Name" value={booking.name} />
                <InfoRow label="Email" value={booking.email} />
                <InfoRow label="Phone" value={booking.phone} />
                <InfoRow label="Address" value={booking.address} />
              </div>

              <div style={{ fontSize: 11, color: RT.textTer }}>
                Booking ID: {booking.room_booking_id}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: RT.textSec, padding: "40px 0" }}>Booking not found</div>
          )}
        </div>
      </div>

      <ToastHost />
    </>
  );
}