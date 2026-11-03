// // src/Pages/PropertyManagementV2/components/V2PropertyList.jsx
// import React from "react";
// import V2PropertyCard from "./V2PropertyCard";
// import V2EmptyState from "./V2EmptyState";
// import { Building2 } from "lucide-react";

// export default function V2PropertyList({
//   properties,
//   viewMode = "grid",
//   onEditProperty,
//   onDeleteProperty,
//   onAddProperty,
// }) {
//   if (!properties || properties.length === 0) {
//     return (
//       <V2EmptyState
//         icon={Building2}
//         title="No properties found."
//         subtitle="Add a property to start managing rooms and bookings."
//         actionText="Add Property"
//         onAction={onAddProperty}
//       />
//     );
//   }

//   return (
//     <div className="pmv2-properties-grid">
//       {properties.map((property) => (
//         <V2PropertyCard
//           key={property.id}
//           property={property}
//           onEdit={onEditProperty}
//           onDelete={onDeleteProperty}
//         />
//       ))}
//     </div>
//   );
// }





















import React from "react";
import V2PropertyCard from "./V2PropertyCard";
import V2EmptyState from "./V2EmptyState";
import { Building2 } from "lucide-react";

export default function V2PropertyList({
  properties,
  viewMode = "grid",
  onEditProperty,
  onDeleteProperty,
  onAddProperty,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}) {
  if (!properties || properties.length === 0) {
    return (
      <V2EmptyState
        icon={Building2}
        title="No properties found."
        subtitle={
          canAdd
            ? "Add a property to start managing rooms and bookings."
            : "No properties have been added yet."
        }
        actionText={canAdd ? "Add Property" : undefined}
        onAction={canAdd ? onAddProperty : undefined}
      />
    );
  }

  return (
    <div className="pmv2-properties-grid">
      {properties.map((property) => (
        <V2PropertyCard
          key={property.id}
          property={property}
          onEdit={onEditProperty}
          onDelete={onDeleteProperty}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}