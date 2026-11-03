// import React from "react";
// import { Users, CheckCircle2, Lock, ReceiptText } from "lucide-react";

// export default function AccessSummaryCards({ stats }) {
//   const defaultStats = {
//     totalUsers: 14,
//     activeUsers: 12,
//     adminUsers: 3,
//     invoiceAccess: 9,
//   };

//   const data = { ...defaultStats, ...stats };

//   return (
//     <div className="am-summary-grid">
//       {/* Total Users */}
//       <div className="am-summary-card">
//         <div className="am-card-top">
//           <span className="am-card-label">Total Users</span>
//           <div className="am-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
//             <Users size={16} />
//           </div>
//         </div>
//         <div className="am-card-value">{data.totalUsers}</div>
//         <div className="am-card-subtext positive">
//           <span>↑</span> +2 this month
//         </div>
//       </div>

//       {/* Active Users */}
//       <div className="am-summary-card">
//         <div className="am-card-top">
//           <span className="am-card-label">Active Users</span>
//           <div className="am-card-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
//             <CheckCircle2 size={16} />
//           </div>
//         </div>
//         <div className="am-card-value">{data.activeUsers}</div>
//         {/* <div className="am-card-subtext">
//           85.7% active rate
//         </div> */}
//       </div>

//       {/* Admin Users */}
//       <div className="am-summary-card">
//         <div className="am-card-top">
//           <span className="am-card-label">Customer Access</span>
//           <div className="am-card-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
//             <Lock size={16} />
//           </div>
//         </div>
//         <div className="am-card-value">{data.adminUsers}</div>
//         {/* <div className="am-card-subtext">
//           Full system privileges
//         </div> */}
//       </div>

//       {/* Invoice Access */}
//       <div className="am-summary-card">
//         <div className="am-card-top">
//           <span className="am-card-label">Invoice Access</span>
//           <div className="am-card-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
//             <ReceiptText size={16} />
//           </div>
//         </div>
//         <div className="am-card-value">{data.invoiceAccess}</div>
//         <div className="am-card-subtext">
//           Billing & export rights
//         </div>
//       </div>
//     </div>
//   );
// }























import React from "react";
import { Users, CheckCircle2, Lock, ReceiptText } from "lucide-react";

export default function AccessSummaryCards({ stats }) {
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    customerAccess: 0,
    invoiceAccess: 0,
  };

  const data = { ...defaultStats, ...stats };

  return (
    <div className="am-summary-grid">
      <div className="am-summary-card">
        <div className="am-card-top">
          <span className="am-card-label">Total Users</span>
          <div className="am-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <Users size={16} />
          </div>
        </div>
        <div className="am-card-value">{data.totalUsers}</div>
        <div className="am-card-subtext positive">
          {/* <span>↑</span> +2 this month */}
        </div>
      </div>

      <div className="am-summary-card">
        <div className="am-card-top">
          <span className="am-card-label">Active Users</span>
          <div className="am-card-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="am-card-value">{data.activeUsers}</div>
      </div>

      <div className="am-summary-card">
        <div className="am-card-top">
          <span className="am-card-label">Guest Access</span>
          <div className="am-card-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
            <Lock size={16} />
          </div>
        </div>
        <div className="am-card-value">{data.customerAccess}</div>
      </div>

      <div className="am-summary-card">
        <div className="am-card-top">
          <span className="am-card-label">Invoice Access</span>
          <div className="am-card-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
            <ReceiptText size={16} />
          </div>
        </div>
        <div className="am-card-value">{data.invoiceAccess}</div>
        {/* <div className="am-card-subtext">Billing & export rights</div> */}
      </div>
    </div>
  );
}