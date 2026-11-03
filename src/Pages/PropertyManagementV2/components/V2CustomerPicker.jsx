
// // src/Pages/PropertyManagementV2/components/V2CustomerPicker.jsx
// // Existing-customer picker only. New customers are entered in V2QuickBookingModal
// // and created by the booking API when "Confirm Booking" is clicked.
// import React, { useState } from "react";
// import { User, Search, Check } from "lucide-react";

// export default function V2CustomerPicker({
//   customers = [],
//   selectedCustomer,
//   onSelectCustomer,
// }) {
//   const [search, setSearch] = useState("");
//   const [isChanging, setIsChanging] = useState(false);

//   const filteredCustomers = customers.filter((c) => {
//     const q = search.toLowerCase().trim();
//     if (!q) return true;
//     return (
//       (c.name && c.name.toLowerCase().includes(q)) ||
//       (c.email && c.email.toLowerCase().includes(q)) ||
//       (c.phone && String(c.phone).includes(q)) ||
//       (c.id && String(c.id).toLowerCase().includes(q))
//     );
//   });

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//       {selectedCustomer && !isChanging ? (
//         <div className="pmv2-customer-card">
//           <div className="pmv2-customer-card-left">
//             <div className="pmv2-customer-avatar">
//               <User size={18} />
//             </div>
//             <div>
//               <div className="pmv2-customer-card-name">
//                 <span>{selectedCustomer.name}</span>
//                 {/* <span className="pmv2-customer-id-pill">
//                   {selectedCustomer.id}
//                 </span> */}
//               </div>
//               <div className="pmv2-customer-card-sub">
//                 {selectedCustomer.phone} • {selectedCustomer.email}
//               </div>
//             </div>
//           </div>
//           <button
//             type="button"
//             className="pmv2-btn"
//             style={{
//               color: "#2563EB",
//               background: "transparent",
//               fontSize: 12.5,
//               padding: "4px 8px",
//               height: "auto",
//             }}
//             onClick={() => setIsChanging(true)}
//           >
//             Change Customer
//           </button>
//         </div>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//           {/* Search box */}
//           <div className="pmv2-search-input-wrap">
//             <Search size={16} className="pmv2-search-icon" />
//             <input
//               type="text"
//               className="pmv2-search-input"
//               placeholder="Search customer by name, mobile, or ID..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               autoFocus
//             />
//           </div>

//           {/* Customer List */}
//           <div
//             style={{
//               maxHeight: 180,
//               overflowY: "auto",
//               border: "1px solid #E5E7EB",
//               borderRadius: 9,
//               background: "#FFFFFF",
//             }}
//           >
//             {filteredCustomers.length === 0 ? (
//               <div style={{ padding: "12px 14px", fontSize: 13, color: "#9CA3AF" }}>
//                 No customer matches found. Switch to "New customer" to add one.
//               </div>
//             ) : (
//               filteredCustomers.map((c) => {
//                 const isSelected = selectedCustomer?.id === c.id;
//                 return (
//                   <div
//                     key={c.id}
//                     className={`pmv2-dropdown-item ${isSelected ? "active" : ""}`}
//                     style={{ padding: "10px 14px", cursor: "pointer" }}
//                     onClick={() => {
//                       onSelectCustomer(c);
//                       setIsChanging(false);
//                     }}
//                   >
//                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                       <div
//                         style={{
//                           width: 32,
//                           height: 32,
//                           borderRadius: "50%",
//                           background: c.avatarBg || "#EFF6FF",
//                           color: c.avatarBg ? "#FFFFFF" : "#2563EB",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: 12,
//                           fontWeight: 700,
//                         }}
//                       >
//                         {c.initials || "C"}
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
//                           {c.name}{" "}
//                           <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
//                             ({c.id})
//                           </span>
//                         </div>
//                         <div style={{ fontSize: 12, color: "#6B7280" }}>
//                           {c.phone} • {c.email}
//                         </div>
//                       </div>
//                     </div>
//                     {isSelected && <Check size={16} style={{ color: "#2563EB" }} />}
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




























// src/Pages/PropertyManagementV2/components/V2CustomerPicker.jsx
// Existing-customer picker only. New customers are entered in V2QuickBookingModal
// and created by the booking API when "Confirm Booking" is clicked.
import React, { useState } from "react";
import { User, Search, Check } from "lucide-react";

export default function V2CustomerPicker({
  customers = [],
  selectedCustomer,
  onSelectCustomer,
}) {
  const [search, setSearch] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && String(c.phone).includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {selectedCustomer && !isChanging ? (
        <div className="pmv2-customer-card">
          <div className="pmv2-customer-card-left">
            <div className="pmv2-customer-avatar">
              <User size={18} />
            </div>
            <div>
              <div className="pmv2-customer-card-name">
                <span>{selectedCustomer.name}</span>
              </div>
              <div className="pmv2-customer-card-sub">
                {selectedCustomer.phone} • {selectedCustomer.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="pmv2-btn"
            style={{
              color: "#2563EB",
              background: "transparent",
              fontSize: 12.5,
              padding: "4px 8px",
              height: "auto",
            }}
            onClick={() => setIsChanging(true)}
          >
            Change Guest
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Search box */}
          <div className="pmv2-search-input-wrap">
            <Search size={16} className="pmv2-search-icon" />
            <input
              type="text"
              className="pmv2-search-input"
              placeholder="Search guest by name, mobile, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Customer List */}
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #E5E7EB",
              borderRadius: 9,
              background: "#FFFFFF",
            }}
          >
            {filteredCustomers.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "#9CA3AF" }}>
                No guest matches found. Switch to "New guest" to add one.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`pmv2-dropdown-item ${isSelected ? "active" : ""}`}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                    onClick={() => {
                      onSelectCustomer(c);
                      setIsChanging(false);
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: c.avatarBg || "#EFF6FF",
                          color: c.avatarBg ? "#FFFFFF" : "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {c.initials || "C"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                          {c.phone} • {c.email}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} style={{ color: "#2563EB" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}