// // src/Pages/PropertyManagementV2/components/V2EditPropertyModal.jsx
// import React, { useState, useEffect } from "react";
// import { X, ChevronDown } from "lucide-react";

// export default function V2EditPropertyModal({
//   isOpen,
//   property,
//   onClose,
//   onSubmit,
// }) {
//   const [name, setName] = useState("");
//   const [code, setCode] = useState("");
//   const [location, setLocation] = useState("");
//   const [status, setStatus] = useState("Active");
//   const [type, setType] = useState("Boutique Hotel");

//   const [errors, setErrors] = useState({});
//   const [statusOpen, setStatusOpen] = useState(false);
//   const [typeOpen, setTypeOpen] = useState(false);

//   useEffect(() => {
//     if (property) {
//       setName(property.name || "");
//       setCode(property.code || "");
//       setLocation(property.location || "");
//       setStatus(property.status || "Active");
//       setType(property.type || "Boutique Hotel");
//     }
//   }, [property]);

//   if (!isOpen || !property) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newErrors = {};

//     if (!name.trim()) {
//       newErrors.name = "Property name is required.";
//     }
//     if (!code.trim()) {
//       newErrors.code = "Property code is required.";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     onSubmit(property.id, {
//       name: name.trim(),
//       shortName: name.trim(),
//       code: code.trim(),
//       location: location.trim(),
//       status,
//       type,
//     });

//     onClose();
//   };

//   const statusOptions = ["Active", "Inactive", "Maintenance"];
//   const typeOptions = [
//     "Boutique Hotel",
//     "Heritage Stay",
//     "Luxury Villa",
//     "Resort",
//     "Business Hotel",
//   ];

//   return (
//     <div className="pmv2-modal-backdrop" onClick={onClose}>
//       <div className="pmv2-modal" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="pmv2-modal-header">
//           <div>
//             <h3 className="pmv2-modal-title">Edit Property</h3>
//             <p className="pmv2-modal-subtitle">
//               Update details for {property.name}.
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

//         {/* Body Form */}
//         <form onSubmit={handleSubmit}>
//           <div className="pmv2-modal-body">
//             {/* Property Name */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">
//                 <span>Property Name *</span>
//               </label>
//               <input
//                 type="text"
//                 className={`pmv2-form-input ${errors.name ? "error" : ""}`}
//                 value={name}
//                 onChange={(e) => {
//                   setName(e.target.value);
//                   if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
//                 }}
//               />
//               {errors.name && <span className="pmv2-form-error">{errors.name}</span>}
//             </div>

//             {/* Property Code */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">
//                 <span>Property Code *</span>
//               </label>
//               <input
//                 type="text"
//                 className={`pmv2-form-input ${errors.code ? "error" : ""}`}
//                 value={code}
//                 onChange={(e) => {
//                   setCode(e.target.value);
//                   if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
//                 }}
//               />
//               {errors.code && <span className="pmv2-form-error">{errors.code}</span>}
//             </div>

//             {/* Address / Location */}
//             <div className="pmv2-form-group">
//               <label className="pmv2-form-label">Address / Location</label>
//               <input
//                 type="text"
//                 className="pmv2-form-input"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//               />
//             </div>

//             {/* Property Type Custom Dropdown */}
//             <div className="pmv2-form-group" style={{ position: "relative" }}>
//               <label className="pmv2-form-label">Property Type</label>
//               <button
//                 type="button"
//                 className="pmv2-form-input"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   cursor: "pointer",
//                   textAlign: "left",
//                 }}
//                 onClick={() => {
//                   setTypeOpen((prev) => !prev);
//                   setStatusOpen(false);
//                 }}
//               >
//                 <span>{type}</span>
//                 <ChevronDown size={16} style={{ color: "#9CA3AF" }} />
//               </button>

//               {typeOpen && (
//                 <div
//                   className="pmv2-dropdown-menu"
//                   style={{ width: "100%", top: "calc(100% + 4px)" }}
//                 >
//                   {typeOptions.map((opt) => (
//                     <div
//                       key={opt}
//                       className={`pmv2-dropdown-item ${type === opt ? "active" : ""}`}
//                       onClick={() => {
//                         setType(opt);
//                         setTypeOpen(false);
//                       }}
//                     >
//                       {opt}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Status Custom Dropdown */}
//             <div className="pmv2-form-group" style={{ position: "relative" }}>
//               <label className="pmv2-form-label">Status</label>
//               <button
//                 type="button"
//                 className="pmv2-form-input"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   cursor: "pointer",
//                   textAlign: "left",
//                 }}
//                 onClick={() => {
//                   setStatusOpen((prev) => !prev);
//                   setTypeOpen(false);
//                 }}
//               >
//                 <span>{status}</span>
//                 <ChevronDown size={16} style={{ color: "#9CA3AF" }} />
//               </button>

//               {statusOpen && (
//                 <div
//                   className="pmv2-dropdown-menu"
//                   style={{ width: "100%", top: "calc(100% + 4px)" }}
//                 >
//                   {statusOptions.map((opt) => (
//                     <div
//                       key={opt}
//                       className={`pmv2-dropdown-item ${status === opt ? "active" : ""}`}
//                       onClick={() => {
//                         setStatus(opt);
//                         setStatusOpen(false);
//                       }}
//                     >
//                       {opt}
//                     </div>
//                   ))}
//                 </div>
//               )}
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

















// src/Pages/PropertyManagementV2/components/V2EditPropertyModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function V2EditPropertyModal({
  isOpen,
  property,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setAddress(property.location || "");
      setErrors({});
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Property name is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(property.id, {
      name: name.trim(),
      address: address.trim(),
    });

    onClose();
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        <div className="pmv2-modal-header">
          <div>
            <h3 className="pmv2-modal-title">Edit Property</h3>
            <p className="pmv2-modal-subtitle">
              Update details for {property.name}.
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

        <form onSubmit={handleSubmit}>
          <div className="pmv2-modal-body">
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">
                <span>Property Name *</span>
              </label>
              <input
                type="text"
                className={`pmv2-form-input ${errors.name ? "error" : ""}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                autoFocus
              />
              {errors.name && <span className="pmv2-form-error">{errors.name}</span>}
            </div>

            <div className="pmv2-form-group">
              <label className="pmv2-form-label">Address</label>
              <input
                type="text"
                className="pmv2-form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

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