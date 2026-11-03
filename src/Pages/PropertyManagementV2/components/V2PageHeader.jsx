
// // src/Pages/PropertyManagementV2/components/V2PageHeader.jsx
// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { RotateCw, Plus, ChevronRight, Upload, ClipboardList } from "lucide-react";

// export default function V2PageHeader({
//   breadcrumbs = "",
//   title = "Property Management",
//   subtitle = "",
//   primaryActionText = "Add Property",
//   onPrimaryAction,
//   onRefresh,
//   showExport = false,
//   onExport,
//   // Booking Details button (replaces the old "···" button)
//   showBookings = true,
//   bookingsLink = "/property-management-v2/bookings",
// }) {
//   const navigate = useNavigate();

//   return (
//     <div className="pmv2-header-wrap">
//       {breadcrumbs && breadcrumbs.length > 0 && (
//         <div className="pmv2-breadcrumb">
//           {breadcrumbs.map((crumb, idx) => {
//             const isLast = idx === breadcrumbs.length - 1;
//             return (
//               <React.Fragment key={idx}>
//                 {crumb.to && !isLast ? (
//                   <Link to={crumb.to} className="pmv2-breadcrumb-link">
//                     {crumb.label}
//                   </Link>
//                 ) : (
//                   <span className={isLast ? "pmv2-breadcrumb-active" : ""}>
//                     {crumb.label}
//                   </span>
//                 )}
//                 {!isLast && <ChevronRight size={12} className="pmv2-breadcrumb-sep" />}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       )}

//       <div className="pmv2-header-top">
//         <div className="pmv2-header-title-wrap">
//           <h1 className="pmv2-header-title">{title}</h1>
//           {subtitle && <p className="pmv2-header-subtitle">{subtitle}</p>}
//         </div>

//         <div className="pmv2-header-actions">
//           {/* {onRefresh && (
//             <button
//               type="button"
//               onClick={onRefresh}
//               className="pmv2-btn pmv2-btn-secondary"
//               title="Refresh"
//             >
//               <RotateCw size={15} />
//               <span>Refresh</span>
//             </button>
//           )} */}

//           {showExport && (
//             <button
//               type="button"
//               onClick={onExport || (() => {})}
//               className="pmv2-btn pmv2-btn-secondary"
//               title="Export"
//             >
//               <Upload size={15} />
//               <span>Export</span>
//             </button>
//           )}

//           {onPrimaryAction && primaryActionText && (
//             <button
//               type="button"
//               onClick={onPrimaryAction}
//               className="pmv2-btn pmv2-btn-primary"
//             >
//               <Plus size={16} />
//               <span>{primaryActionText}</span>
//             </button>
//           )}

//           {showBookings && (
//             <button
//               type="button"
//               onClick={() => navigate(bookingsLink)}
//               className="pmv2-btn pmv2-btn-secondary"
//               title="View all bookings"
//             >
//               <ClipboardList size={15} />
//               <span>Booking Details</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






















// src/Pages/PropertyManagementV2/components/V2PageHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Upload, ClipboardList, ArrowRight } from "lucide-react";

export default function V2PageHeader({
  breadcrumbs = "",
  title = "Property Management",
  subtitle = "",
  primaryActionText = "Add Property",
  onPrimaryAction,
  onRefresh,
  showExport = false,
  onExport,
  // Booking Details button (unique highlighted menu)
  showBookings = true,
  bookingsLink = "/property-management-v2/bookings",
}) {
  const navigate = useNavigate();

  return (
    <div className="pmv2-header-wrap">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="pmv2-breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="pmv2-breadcrumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "pmv2-breadcrumb-active" : ""}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={12} className="pmv2-breadcrumb-sep" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="pmv2-header-top">
        <div className="pmv2-header-title-wrap">
          <h1 className="pmv2-header-title">{title}</h1>
          {subtitle && <p className="pmv2-header-subtitle">{subtitle}</p>}
        </div>

        <div className="pmv2-header-actions">
          {showExport && (
            <button
              type="button"
              onClick={onExport || (() => {})}
              className="pmv2-btn pmv2-btn-secondary"
              title="Export"
            >
              <Upload size={15} />
              <span>Export</span>
            </button>
          )}

          {showBookings && (
            <button
              type="button"
              onClick={() => navigate(bookingsLink)}
              className="pmv2-btn pmv2-btn-bookings"
              title="View all bookings"
            >
              <span className="pmv2-btn-bookings-icon">
                <ClipboardList size={14} />
              </span>
              <span>Booking Details</span>
              <ArrowRight size={14} className="pmv2-btn-bookings-arrow" />
            </button>
          )}

          {onPrimaryAction && primaryActionText && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="pmv2-btn pmv2-btn-primary"
            >
              <Plus size={16} />
              <span>{primaryActionText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}