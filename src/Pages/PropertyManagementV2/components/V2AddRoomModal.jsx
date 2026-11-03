




// // src/Pages/PropertyManagementV2/components/V2AddRoomModal.jsx
// import React, { useState } from "react";
// import { X, Building2 } from "lucide-react";

// export default function V2AddRoomModal({
//   isOpen,
//   property,
//   onClose,
//   onSubmit,
// }) {
//   const [subRoomName, setSubRoomName] = useState("");
//   const [pricePerDay, setPricePerDay] = useState("");
//   const [maxAdults, setMaxAdults] = useState(3);
//   const [maxChildren, setMaxChildren] = useState(3);
//   const [errors, setErrors] = useState({});

//   if (!isOpen || !property) return null;

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
//       roomId: property.id, // -> room_id
//       subRoomName: subRoomName.trim(), // -> sub_room_name
//       maxAdults: Number(maxAdults) || 0, // -> max_adults
//       maxChildren: Number(maxChildren) || 0, // -> max_children
//     };

//     // Optional: only send price_per_day when the user typed one
//     if (String(pricePerDay).trim() !== "") {
//       payload.pricePerDay = Number(pricePerDay); // -> price_per_day
//     }

//     onSubmit(payload);

//     setSubRoomName("");
//     setPricePerDay("");
//     setMaxAdults(3);
//     setMaxChildren(3);
//     setErrors({});
//     onClose();
//   };

//   return (
//     <div className="pmv2-modal-backdrop" onClick={onClose}>
//       <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="pmv2-modal-header">
//           <div>
//             <h3 className="pmv2-modal-title">Add Room</h3>
//             <p className="pmv2-modal-subtitle">
//               Create a room for {property.name}.
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
//             {/* Selected Property */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">Selected Property</label>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 12,
//                   padding: "10px 14px",
//                   background: "#F9FAFB",
//                   border: "1px solid #E5E7EB",
//                   borderRadius: 9,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 32,
//                     height: 32,
//                     borderRadius: 8,
//                     background: "#EFF6FF",
//                     color: "#2563EB",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Building2 size={18} />
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
//                     {property.name}
//                   </div>
//                   <div style={{ fontSize: 11.5, color: "#6B7280" }}>
//                     {property.city || property.location || "Campus"}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Room Name */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">
//                 <span>Room Name *</span>
//               </label>
//               <input
//                 type="text"
//                 className={`pmv2-form-input ${errors.subRoomName ? "error" : ""}`}
//                 placeholder="e.g. g-h-1"
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
//                   placeholder="3"
//                   value={maxAdults}
//                   onChange={(e) => setMaxAdults(e.target.value)}
//                 />
//               </div>

//               <div className="pmv2-form-group">
//                 <label className="pmv2-form-label">Max Children</label>
//                 <input
//                   type="number"
//                   className="pmv2-form-input"
//                   placeholder="3"
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
//                 Create Room
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }























// src/Pages/PropertyManagementV2/components/V2AddRoomModal.jsx
import React, { useState } from "react";
import { X, Building2 } from "lucide-react";

// keep only digits and cap at 2 characters
const sanitizeTwoDigits = (value) => String(value).replace(/\D/g, "").slice(0, 2);

// block e, E, +, -, . in number inputs
const blockInvalidKeys = (e) => {
  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
};

export default function V2AddRoomModal({
  isOpen,
  property,
  onClose,
  onSubmit,
}) {
  const [subRoomName, setSubRoomName] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [maxAdults, setMaxAdults] = useState("3");
  const [maxChildren, setMaxChildren] = useState("3");
  const [errors, setErrors] = useState({});

  if (!isOpen || !property) return null;

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
      roomId: property.id, // -> room_id
      subRoomName: subRoomName.trim(), // -> sub_room_name
      maxAdults: Number(maxAdults) || 0, // -> max_adults
      maxChildren: Number(maxChildren) || 0, // -> max_children
    };

    // Optional: only send price_per_day when the user typed one
    if (String(pricePerDay).trim() !== "") {
      payload.pricePerDay = Number(pricePerDay); // -> price_per_day
    }

    onSubmit(payload);

    setSubRoomName("");
    setPricePerDay("");
    setMaxAdults("3");
    setMaxChildren("3");
    setErrors({});
    onClose();
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div>
            <h3 className="pmv2-modal-title">Add Room</h3>
            <p className="pmv2-modal-subtitle">
              Create a room for {property.name}.
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
            {/* Selected Property */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">Selected Property</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#EFF6FF",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
                    {property.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6B7280" }}>
                    {property.city || property.location || "Campus"}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Name */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">
                <span>Room Name *</span>
              </label>
              <input
                type="text"
                className={`pmv2-form-input ${errors.subRoomName ? "error" : ""}`}
                placeholder="e.g. g-h-1"
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
                  placeholder="3"
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
                  placeholder="3"
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
                Create Room
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}