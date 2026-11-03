


// // src/Pages/PropertyManagementV2/components/V2EditRoomModal.jsx
// import React, { useState, useEffect } from "react";
// import { X } from "lucide-react";

// export default function V2EditRoomModal({
//   isOpen,
//   room,
//   onClose,
//   onSubmit,
// }) {
//   const [subRoomName, setSubRoomName] = useState("");
//   const [pricePerDay, setPricePerDay] = useState("");
//   const [maxAdults, setMaxAdults] = useState(3);
//   const [maxChildren, setMaxChildren] = useState(3);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (room) {
//       setSubRoomName(room.roomName || room.roomNumber || "");
//       setPricePerDay(room.pricePerDay ? room.pricePerDay : "");
//       setMaxAdults(room.maxAdults ?? 3);
//       setMaxChildren(room.maxChildren ?? 0);
//       setErrors({});
//     }
//   }, [room]);

//   if (!isOpen || !room) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newErrors = {};

//     if (!subRoomName.trim()) {
//       newErrors.subRoomName = "Room name is required.";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const payload = {
//       roomId: room.propertyId, // -> room_id
//       subRoomName: subRoomName.trim(), // -> sub_room_name
//       maxAdults: Number(maxAdults) || 0, // -> max_adults
//       maxChildren: Number(maxChildren) || 0, // -> max_children
//     };

//     // Optional: only send price_per_day when filled
//     if (String(pricePerDay).trim() !== "") {
//       payload.pricePerDay = Number(pricePerDay); // -> price_per_day
//     }

//     // room.id = sub_room_id
//     const success = onSubmit(room.id, payload);

//     if (success !== false) {
//       onClose();
//     }
//   };

//   return (
//     <div className="pmv2-modal-backdrop" onClick={onClose}>
//       <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="pmv2-modal-header">
//           <div>
//             <h3 className="pmv2-modal-title">Edit Room</h3>
//             <p className="pmv2-modal-subtitle">
//               Modify details for {room.roomName || room.roomNumber}.
//             </p>
//           </div>
//           <button
//             type="button"
//             className="pmv2-btn-icon"
//             onClick={onClose}
//             style={{ width: 34, height: 34 }}
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Form Body */}
//         <form onSubmit={handleSubmit}>
//           <div className="pmv2-modal-body">
//             {/* Room Name */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">
//                 <span>Room Name *</span>
//               </label>
//               <input
//                 type="text"
//                 className={`pmv2-form-input ${errors.subRoomName ? "error" : ""}`}
//                 value={subRoomName}
//                 onChange={(e) => {
//                   setSubRoomName(e.target.value);
//                   if (errors.subRoomName) setErrors((prev) => ({ ...prev, subRoomName: null }));
//                 }}
//                 autoFocus
//               />
//               {errors.subRoomName && (
//                 <span className="pmv2-form-error">{errors.subRoomName}</span>
//               )}
//             </div>

//             {/* Price per Day (optional) */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">
//                 <span>Price per Day (₹)</span>
//                 <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF" }}>Optional</span>
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 className="pmv2-form-input"
//                 placeholder="Price"
//                 value={pricePerDay}
//                 onChange={(e) => setPricePerDay(e.target.value)}
//               />
//             </div>

//             {/* Max Adults & Max Children */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//               <div className="pmv2-form-group">
//                 <label className="pmv2-form-label">Max Adults</label>
//                 <input
//                   type="number"
//                   className="pmv2-form-input"
//                   value={maxAdults}
//                   onChange={(e) => setMaxAdults(e.target.value)}
//                 />
//               </div>

//               <div className="pmv2-form-group">
//                 <label className="pmv2-form-label">Max Children</label>
//                 <input
//                   type="number"
//                   className="pmv2-form-input"
//                   value={maxChildren}
//                   onChange={(e) => setMaxChildren(e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="pmv2-modal-footer">
//             <div className="pmv2-modal-footer-right">
//               <button
//                 type="button"
//                 className="pmv2-btn pmv2-btn-secondary"
//                 onClick={onClose}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="pmv2-btn pmv2-btn-primary">
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }






















// src/Pages/PropertyManagementV2/components/V2EditRoomModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// keep only digits and cap at 2 characters
const sanitizeTwoDigits = (value) => String(value).replace(/\D/g, "").slice(0, 2);

// block e, E, +, -, . in number inputs
const blockInvalidKeys = (e) => {
  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
};

export default function V2EditRoomModal({
  isOpen,
  room,
  onClose,
  onSubmit,
}) {
  const [subRoomName, setSubRoomName] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [maxAdults, setMaxAdults] = useState("3");
  const [maxChildren, setMaxChildren] = useState("3");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setSubRoomName(room.roomName || room.roomNumber || "");
      setPricePerDay(room.pricePerDay ? room.pricePerDay : "");
      setMaxAdults(sanitizeTwoDigits(room.maxAdults ?? 3));
      setMaxChildren(sanitizeTwoDigits(room.maxChildren ?? 0));
      setErrors({});
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!subRoomName.trim()) {
      newErrors.subRoomName = "Room name is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      roomId: room.propertyId, // -> room_id
      subRoomName: subRoomName.trim(), // -> sub_room_name
      maxAdults: Number(maxAdults) || 0, // -> max_adults
      maxChildren: Number(maxChildren) || 0, // -> max_children
    };

    // Optional: only send price_per_day when filled
    if (String(pricePerDay).trim() !== "") {
      payload.pricePerDay = Number(pricePerDay); // -> price_per_day
    }

    // room.id = sub_room_id
    const success = onSubmit(room.id, payload);

    if (success !== false) {
      onClose();
    }
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div>
            <h3 className="pmv2-modal-title">Edit Room</h3>
            <p className="pmv2-modal-subtitle">
              Modify details for {room.roomName || room.roomNumber}.
            </p>
          </div>
          <button
            type="button"
            className="pmv2-btn-icon"
            onClick={onClose}
            style={{ width: 34, height: 34 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="pmv2-modal-body">
            {/* Room Name */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">
                <span>Room Name *</span>
              </label>
              <input
                type="text"
                className={`pmv2-form-input ${errors.subRoomName ? "error" : ""}`}
                value={subRoomName}
                onChange={(e) => {
                  setSubRoomName(e.target.value);
                  if (errors.subRoomName) setErrors((prev) => ({ ...prev, subRoomName: null }));
                }}
                autoFocus
              />
              {errors.subRoomName && (
                <span className="pmv2-form-error">{errors.subRoomName}</span>
              )}
            </div>

            {/* Price per Day (optional) */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">
                <span>Price per Day (₹)</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF" }}>Optional</span>
              </label>
              <input
                type="number"
                min="0"
                className="pmv2-form-input"
                placeholder="Price"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>

            {/* Max Adults & Max Children */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="pmv2-form-group">
                <label className="pmv2-form-label">Max Adults</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  className="pmv2-form-input"
                  value={maxAdults}
                  onKeyDown={blockInvalidKeys}
                  onChange={(e) => setMaxAdults(sanitizeTwoDigits(e.target.value))}
                />
              </div>

              <div className="pmv2-form-group">
                <label className="pmv2-form-label">Max Children</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  className="pmv2-form-input"
                  value={maxChildren}
                  onKeyDown={blockInvalidKeys}
                  onChange={(e) => setMaxChildren(sanitizeTwoDigits(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pmv2-modal-footer">
            <div className="pmv2-modal-footer-right">
              <button
                type="button"
                className="pmv2-btn pmv2-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="pmv2-btn pmv2-btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}