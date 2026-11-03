
// import React, { useState, useEffect, useRef, useMemo } from "react";
// import ReactDOM from "react-dom";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import api from "../../services/api";

// /* ─── Toast Hook ─────────────────────────────────────────────────── */
// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const push = (message, type = "success") => {
//     const id = Date.now() + Math.random();
//     setToasts(prev => [...prev, { id, message, type }]);
//     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
//   };
//   const ToastHost = () => (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24, zIndex: 99999,
//       display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
//     }}>
//       {toasts.map(t => (
//         <div key={t.id} style={{
//           display: "flex", alignItems: "center", gap: 10,
//           background: t.type === "error" ? "#FEF2F2" : t.type === "warning" ? "#FFFBEB" : "#F0FDF4",
//           border: `1px solid ${t.type === "error" ? "#FECACA" : t.type === "warning" ? "#FDE68A" : "#BBF7D0"}`,
//           borderLeft: `4px solid ${t.type === "error" ? "#DC2626" : t.type === "warning" ? "#D97706" : "#16A34A"}`,
//           borderRadius: 10, padding: "12px 16px", minWidth: 260, maxWidth: 360,
//           boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
//           animation: "toastIn 0.25s ease",
//           pointerEvents: "auto",
//         }}>
//           <span style={{ fontSize: 17 }}>
//             {t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "✅"}
//           </span>
//           <span style={{
//             fontSize: 13, fontWeight: 600,
//             color: t.type === "error" ? "#991B1B" : t.type === "warning" ? "#92400E" : "#166534",
//           }}>{t.message}</span>
//         </div>
//       ))}
//       <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
//     </div>
//   );
//   return { push, ToastHost };
// }

// /* ─── Constants & Helpers ────────────────────────────────────────── */
// const STATUS_COLOR = {
//   paid: { bg: "#DCFCE7", color: "#15803D" },
//   sent: { bg: "#DBEAFE", color: "#2563EB" },
//   draft: { bg: "#F3F4F6", color: "#6B7280" },
// };
// const SETTLEMENT_COLOR = {
//   setteled: { bg: "#DCFCE7", color: "#15803D" },
//   pending:  { bg: "#FEF3C7", color: "#B45309" },
//   overdue:  { bg: "#FEE2E2", color: "#DC2626" },
// };
// const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"];

// /* Format for Web UI (Using Rupee Symbol ₹) */
// const fmt = (n, currency = "INR") => {
//   return `₹${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// /* Format for PDF Document (Using Rs. to avoid PDF font encoding glyph corruption) */
// const fmtPdf = (n) => {
//   return `Rs. ${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const extractDate = (raw) => {
//   if (!raw) return null;
//   if (typeof raw === "object" && raw.$date !== undefined) return raw.$date;
//   return raw;
// };

// const todayStr = () => new Date().toISOString().slice(0, 10);

// const inDateRange = (raw, fromStr, toStr) => {
//   if (!fromStr && !toStr) return true;
//   const rawDt = extractDate(raw);
//   if (!rawDt) return false;
  
//   const d = new Date(rawDt);
//   if (isNaN(d.getTime())) return false;
  
//   const dStr = d.toISOString().slice(0, 10);
//   if (fromStr && dStr < fromStr) return false;
//   if (toStr && dStr > toStr) return false;
//   return true;
// };

// const fmtLabel = (dStr) => {
//   if (!dStr) return null;
//   const dt = new Date(dStr + "T00:00:00");
//   if (isNaN(dt.getTime())) return dStr;
//   return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };

// /* Financial extractor for standard stats calculation */
// const getInvoiceFinancials = (inv) => {
//   const grandTotal = parseFloat(inv.grand_total_amount || inv.total_amount || 0);
//   const advance = parseFloat(inv.advance_amount || 0);
//   const manualPaid = parseFloat(inv.manual_paid_amount || 0);
//   const paid = parseFloat(inv.paid_amount || 0);
  
//   let balanceDue;
//   if (inv.balance_amount !== undefined && inv.balance_amount !== null) {
//     balanceDue = parseFloat(inv.balance_amount || 0);
//   } else {
//     balanceDue = Math.max(0, grandTotal - advance - manualPaid - paid);
//   }
  
//   const totalPaidSoFar = Math.max(0, grandTotal - balanceDue);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const rawDue = extractDate(inv.due_date);
//   const dueDate = rawDue ? new Date(rawDue) : null;
//   const isOverdue = inv.settlement_status === "overdue" || (dueDate && dueDate < today && balanceDue > 0);

//   return { grandTotal, advance, manualPaid, paid, balanceDue, totalPaidSoFar, isOverdue };
// };

// /* ─── Payment Modal ──────────────────────────────────────────────── */
// function PaymentModal({ invoice, onClose, onSaved, pushToast }) {
//   const fin = getInvoiceFinancials(invoice);
//   const { grandTotal, advance: advanceAmt, manualPaid: manualPaidAmt, balanceDue, totalPaidSoFar: paidSoFar } = fin;

//   const [amount, setAmount]   = useState("");
//   const [method, setMethod]   = useState(PAYMENT_METHODS[0]);
//   const [saving, setSaving]   = useState(false);
//   const [error, setError]     = useState("");

//   const amtNum = parseFloat(amount) || 0;
//   const isOver = amtNum > balanceDue;
//   const isZero = amtNum <= 0;
//   const isFullPay = Math.abs(amtNum - balanceDue) < 0.01;

//   const handleSave = async () => {
//     if (isZero)  { setError("Please enter a valid amount."); return; }
//     if (isOver)  { setError(`Amount cannot exceed balance due (${fmt(balanceDue, invoice.invoice_currency || invoice.currency)}).`); return; }
//     setSaving(true);
//     setError("");
//     try {
//       await api.put("/invoices/update_payment", {
//         invoice_number: invoice.invoice_number,
//         amount: amtNum,
//         payment_method: method,
//       });
//       pushToast(
//         isFullPay
//           ? `Invoice #${invoice.invoice_number} fully settled! 🎉`
//           : `Payment of ${fmt(amtNum, invoice.invoice_currency || invoice.currency)} recorded successfully.`,
//         "success"
//       );
//       onSaved();
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Could not record payment.";
//       setError(msg);
//       pushToast(msg, "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const customerName = invoice.customer_data?.name || invoice.customer_data?.customer_name || "Customer";
//   const currency = invoice.invoice_currency || invoice.currency;

//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       zIndex: 10000, padding: 16, backdropFilter: "blur(2px)",
//     }} onClick={onClose}>
//       <div style={{
//         background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420,
//         boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
//         overflow: "hidden", fontFamily: "'Lato', sans-serif",
//       }} onClick={e => e.stopPropagation()}>

//         <div style={{
//           background: "linear-gradient(135deg, #4584E5 0%, #3568C4 100%)",
//           padding: "20px 22px 18px",
//         }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
//             <div>
//               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
//                 <div style={{
//                   width: 32, height: 32, borderRadius: 8,
//                   background: "rgba(255,255,255,0.2)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
//                     <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="#fff" strokeWidth="1.8"/>
//                     <path d="M2 10h20" stroke="#fff" strokeWidth="1.8"/>
//                     <path d="M6 14.5h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
//                   </svg>
//                 </div>
//                 <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>Record Payment</p>
//               </div>
//               <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.75)" }}>
//                 Invoice #{invoice.invoice_number} · {customerName}
//               </p>
//             </div>
//             <button onClick={onClose} style={{
//               background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
//               width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
//               cursor: "pointer", color: "#fff", fontSize: 18, lineHeight: 1,
//             }}>×</button>
//           </div>
//         </div>

//         <div style={{ padding: "18px 22px 0" }}>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
//             {[
//               { label: "Grand Total",   value: fmt(grandTotal, currency),  color: "#111827" },
//               { label: "Paid So Far",   value: fmt(paidSoFar, currency),    color: "#16A34A" },
//               { label: "Balance Due",   value: fmt(balanceDue, currency),   color: "#DC2626" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{
//                 background: "#F8F9FC", borderRadius: 10, padding: "10px 12px",
//                 border: "1px solid #E9EBF1", textAlign: "center",
//               }}>
//                 <div style={{ fontSize: 10, fontWeight: 700, color: "#9AA1AF", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>{label}</div>
//                 <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
//               </div>
//             ))}
//           </div>

//           {(advanceAmt > 0 || manualPaidAmt > 0) && (
//             <div style={{
//               background: "#F8F9FC", border: "1px solid #E9EBF1", borderRadius: 10,
//               padding: "10px 12px", marginBottom: 18, fontSize: 12,
//             }}>
//               {advanceAmt > 0 && (
//                 <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
//                   <span style={{ color: "#6B7280" }}>Advance Paid</span>
//                   <span style={{ fontWeight: 700, color: "#16A34A" }}>{fmt(advanceAmt, currency)}</span>
//                 </div>
//               )}
//               {manualPaidAmt > 0 && (
//                 <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
//                   <span style={{ color: "#6B7280" }}>Payment Made (Manual)</span>
//                   <span style={{ fontWeight: 700, color: "#16A34A" }}>{fmt(manualPaidAmt, currency)}</span>
//                 </div>
//               )}
//             </div>
//           )}

//           {balanceDue > 0 && grandTotal > 0 && (
//             <div style={{ marginBottom: 18 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9AA1AF", marginBottom: 5 }}>
//                 <span>Payment progress</span>
//                 <span style={{ fontWeight: 700, color: "#4584E5" }}>{Math.round((paidSoFar / grandTotal) * 100)}% paid</span>
//               </div>
//               <div style={{ height: 6, background: "#E9EBF1", borderRadius: 99, overflow: "hidden" }}>
//                 <div style={{
//                   height: "100%", borderRadius: 99,
//                   background: "linear-gradient(90deg, #4584E5, #3568C4)",
//                   width: `${Math.min(100, Math.max(0, (paidSoFar / grandTotal) * 100))}%`,
//                   transition: "width 0.3s ease",
//                 }} />
//               </div>
//             </div>
//           )}

//           <div style={{ marginBottom: 14 }}>
//             <label style={{
//               fontSize: 11.5, fontWeight: 700, color: "#374151",
//               textTransform: "uppercase", letterSpacing: "0.4px",
//               marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between",
//             }}>
//               <span>Amount to Pay</span>
//               <button onClick={() => { setAmount(balanceDue.toFixed(2)); setError(""); }}
//                 style={{
//                   background: "#EAF1FD", border: "none", borderRadius: 6,
//                   padding: "3px 9px", fontSize: 11, fontWeight: 700,
//                   color: "#4584E5", cursor: "pointer",
//                 }}>Pay Full</button>
//             </label>
//             <div style={{ position: "relative" }}>
//               <span style={{
//                 position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
//                 fontSize: 15, fontWeight: 300, color: "#6B7280",
//               }}>₹</span>
//               <input
//                 type="number" min="0" step="0.01"
//                 value={amount}
//                 placeholder="Enter Payment Amount"
//                 onChange={e => { setAmount(e.target.value); setError(""); }}
//                 style={{
//                   width: "100%", boxSizing: "border-box",
//                   border: `1.5px solid ${isOver ? "#DC2626" : error && isZero ? "#DC2626" : "#E9EBF1"}`,
//                   borderRadius: 10, padding: "11px 12px 11px 28px",
//                   fontSize: 14, fontWeight: 300, color: "#111827", outline: "none",
//                   background: isOver ? "#FEF2F2" : "#fff",
//                   transition: "border-color 0.15s",
//                 }}
//                 onFocus={e => { if (!isOver) e.target.style.borderColor = "#4584E5"; }}
//                 onBlur={e => { if (!isOver) e.target.style.borderColor = "#E9EBF1"; }}
//               />
//             </div>

//             {amtNum > 0 && !isOver && (
//               <div style={{
//                 marginTop: 6, fontSize: 11.5, color: "#6B7280",
//                 display: "flex", alignItems: "center", gap: 4,
//               }}>
//                 {isFullPay ? (
//                   <span style={{ color: "#16A34A", fontWeight: 700 }}>✓ This will fully settle the invoice</span>
//                 ) : (
//                   <span>
//                     After this payment, <b style={{ color: "#DC2626" }}>{fmt(balanceDue - amtNum, invoice.currency)}</b> will remain.
//                   </span>
//                 )}
//               </div>
//             )}
//             {isOver && (
//               <div style={{ marginTop: 6, fontSize: 12, color: "#DC2626", fontWeight: 600 }}>
//                 ⚠ Amount exceeds balance due of {fmt(balanceDue, invoice.currency)}
//               </div>
//             )}
//           </div>

//           <div style={{ marginBottom: 18 }}>
//             <label style={{
//               fontSize: 11.5, fontWeight: 700, color: "#374151",
//               textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 7, display: "block",
//             }}>Payment Method</label>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
//               {PAYMENT_METHODS.map(m => (
//                 <button key={m} onClick={() => setMethod(m)} style={{
//                   padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
//                   border: `1.5px solid ${method === m ? "#4584E5" : "#E9EBF1"}`,
//                   background: method === m ? "#EAF1FD" : "#fff",
//                   color: method === m ? "#3568C4" : "#6B7280",
//                   transition: "all 0.15s",
//                 }}>{m}</button>
//               ))}
//             </div>
//           </div>

//           {error && (
//             <div style={{
//               background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
//               padding: "10px 13px", marginBottom: 14,
//               fontSize: 12.5, color: "#DC2626", fontWeight: 600,
//               display: "flex", alignItems: "center", gap: 6,
//             }}>
//               <span>⚠</span> {error}
//             </div>
//           )}
//         </div>

//         <div style={{
//           padding: "14px 22px 20px",
//           display: "flex", gap: 10, justifyContent: "flex-end",
//           borderTop: "1px solid #F1F2F6",
//         }}>
//           <button onClick={onClose} disabled={saving} style={{
//             padding: "10px 20px", borderRadius: 10, border: "1px solid #E9EBF1",
//             background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
//           }}>Cancel</button>
//           <button onClick={handleSave} disabled={saving || isOver || isZero} style={{
//             padding: "10px 24px", borderRadius: 10, border: "none",
//             background: (saving || isOver || isZero) ? "#A5B4C8" : "linear-gradient(135deg, #4584E5, #3568C4)",
//             color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: (saving || isOver || isZero) ? "not-allowed" : "pointer",
//             display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
//             boxShadow: (saving || isOver || isZero) ? "none" : "0 2px 8px rgba(69,132,229,0.35)",
//           }}>
//             {saving ? (
//               <>
//                 <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
//                 Saving…
//               </>
//             ) : (
//               <>
//                 <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
//                   <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 Record Payment
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// }

// /* ─── Balance Cell with Tooltip ──────────────────────────────────── */
// function BalanceCell({ inv }) {
//   const [show, setShow] = useState(false);
//   const [pos, setPos] = useState({ x: 0, y: 0 });
//   const fin = getInvoiceFinancials(inv);
//   const { grandTotal, advance: advanceAmt, manualPaid: manualPaidAmt, paid: paidAmt, balanceDue, totalPaidSoFar: paidSoFar } = fin;
//   const currency = inv.invoice_currency || inv.currency;
//   const settle = inv.settlement_status || (balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");

//   const tooltipContent = (
//     <div style={{
//       position: "fixed",
//       top: pos.y - 8,
//       left: pos.x + 14,
//       transform: "translateY(-100%)",
//       background: "#1F2937", color: "#fff",
//       borderRadius: 10, padding: "12px 14px",
//       width: 230, zIndex: 99999,
//       boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
//       fontSize: 12, pointerEvents: "none",
//     }}>
//       <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12.5, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6 }}>
//          Payment Breakdown
//       </div>
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//         <span style={{ color: "rgba(255,255,255,0.65)" }}>Grand Total</span>
//         <span style={{ fontWeight: 700 }}>{fmt(grandTotal, currency)}</span>
//       </div>
//       {advanceAmt > 0 && (
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//           <span style={{ color: "rgba(255,255,255,0.65)" }}>Advance Paid</span>
//           <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(advanceAmt, currency)}</span>
//         </div>
//       )}
//       {manualPaidAmt > 0 && (
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//           <span style={{ color: "rgba(255,255,255,0.65)" }}>Payment (Manual)</span>
//           <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(manualPaidAmt, currency)}</span>
//         </div>
//       )}
//       {paidAmt > 0 && (
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//           <span style={{ color: "rgba(255,255,255,0.65)" }}>Payment Recorded</span>
//           <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(paidAmt, currency)}</span>
//         </div>
//       )}
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//         <span style={{ color: "rgba(255,255,255,0.65)" }}>Total Paid</span>
//         <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(paidSoFar, currency)}</span>
//       </div>
//       <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
//         <span style={{ color: "rgba(255,255,255,0.65)" }}>Balance Due</span>
//         <span style={{ fontWeight: 800, color: balanceDue <= 0 ? "#4ADE80" : "#F87171" }}>{fmt(balanceDue, currency)}</span>
//       </div>
//       {balanceDue > 0 ? (
//         <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
//           Click the card payment icon to record payment.
//         </div>
//       ) : (
//         <div style={{ marginTop: 8, fontSize: 11, color: "#4ADE80", fontWeight: 600 }}>
//           ✓ Invoice Fully Settled
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end", width: "100%" }}>
//       {balanceDue <= 0 ? (
//         <span style={{
//           display: "inline-flex", alignItems: "center", gap: 4,
//           background: "#F0FDF4", color: "#16A34A",
//           border: "1px solid #BBF7D0",
//           borderRadius: 6, padding: "2px 8px",
//           fontSize: 11, fontWeight: 700,
//         }}>
//           ✓ No Balance
//         </span>
//       ) : (
//         <span style={{ fontWeight: 700, color: settle === "overdue" ? "#DC2626" : "#111827" }}>
//           {fmt(balanceDue, currency)}
//         </span>
//       )}

//       <span
//         onMouseEnter={e => { setPos({ x: e.clientX, y: e.clientY }); setShow(true); }}
//         onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
//         onMouseLeave={() => setShow(false)}
//         style={{
//           width: 16, height: 16, borderRadius: "50%",
//           background: "#EAF1FD", color: "#4584E5",
//           fontSize: 9.5, fontWeight: 800, display: "inline-flex",
//           alignItems: "center", justifyContent: "center",
//           cursor: "default", flexShrink: 0, userSelect: "none",
//         }}
//       >i</span>

//       {show && typeof document !== "undefined" && ReactDOM.createPortal(tooltipContent, document.body)}
//     </div>
//   );
// }

// /* ─── Icons ──────────────────────────────────────────────────────── */
// function FilterIcon({ color = "#4584E5" }) {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
//       <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
//     </svg>
//   );
// }

// /* ─── Filter Popover ─────────────────────────────────────────────── */
// function FilterPopover({ open, onClose, departments, deptFilter, setDeptFilter, settlementFilter, setSettlementFilter, activeTab, setActiveTab, TABS }) {
//   const ref = useRef(null);
//   useEffect(() => {
//     const onDoc = (e) => { if (open && ref.current && !ref.current.contains(e.target)) onClose(); };
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [open, onClose]);

//   if (!open) return null;

//   return (
//     <div className="li-filter-pop" ref={ref}>
//       <div className="li-filter-pop-header">
//         <span>Filter Invoices</span>
//         <button className="li-filter-pop-clear" onClick={() => { setActiveTab("all"); setDeptFilter("all"); setSettlementFilter("all"); }}>Reset All</button>
//       </div>
//       <div className="li-filter-pop-group">
//         <div className="li-filter-pop-label">Status</div>
//         <div className="li-filter-chip-row">
//           {TABS.map(t => (
//             <button key={t} className={`li-filter-chip${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
//               {t === "all" ? "All Statuses" : t.charAt(0).toUpperCase() + t.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="li-filter-pop-group">
//         <div className="li-filter-pop-label">Department</div>
//         <select className="li-filter-pop-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
//           <option value="all">All Departments</option>
//           {departments.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
//           <option value="__none__">No Department</option>
//         </select>
//       </div>
//       <div className="li-filter-pop-group">
//         <div className="li-filter-pop-label">Payment Settlement Status</div>
//         <select className="li-filter-pop-select" value={settlementFilter} onChange={e => setSettlementFilter(e.target.value)}>
//           <option value="all">All Payment Statuses</option>
//           <option value="pending">Pending</option>
//           <option value="setteled">Settled</option>
//           <option value="overdue">Overdue</option>
//         </select>
//       </div>
//     </div>
//   );
// }

// /* ─── Custom Date Range Picker Component (Future Dates Disabled) ─── */
// function CustomDateRangePicker({ dateFrom, dateTo, setDateFrom, setDateTo }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   const [tempFrom, setTempFrom] = useState(dateFrom);
//   const [tempTo, setTempTo] = useState(dateTo);

//   const [viewDate, setViewDate] = useState(() => {
//     if (dateFrom) return new Date(dateFrom + "T00:00:00");
//     return new Date();
//   });

//   useEffect(() => {
//     if (open) {
//       setTempFrom(dateFrom);
//       setTempTo(dateTo);
//       if (dateFrom) setViewDate(new Date(dateFrom + "T00:00:00"));
//     }
//   }, [open, dateFrom, dateTo]);

//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [open]);

//   const hasRange = !!(dateFrom || dateTo);
//   const triggerLabel = hasRange
//     ? `${fmtLabel(dateFrom) || "Start"} → ${fmtLabel(dateTo) || "End"}`
//     : "Date Range";

//   const handleApplyPreset = (type) => {
//     const now = new Date();
//     let from = "";
//     let to = todayStr();

//     if (type === "today") {
//       from = todayStr();
//       to = todayStr();
//     } else if (type === "yesterday") {
//       const y = new Date();
//       y.setDate(now.getDate() - 1);
//       from = y.toISOString().slice(0, 10);
//       to = from;
//     } else if (type === "last7") {
//       const f = new Date();
//       f.setDate(now.getDate() - 6);
//       from = f.toISOString().slice(0, 10);
//       to = todayStr();
//     } else if (type === "last30") {
//       const f = new Date();
//       f.setDate(now.getDate() - 29);
//       from = f.toISOString().slice(0, 10);
//       to = todayStr();
//     } else if (type === "thisMonth") {
//       const f = new Date(now.getFullYear(), now.getMonth(), 1);
//       from = f.toISOString().slice(0, 10);
//       to = todayStr();
//     } else if (type === "lastMonth") {
//       const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       const t = new Date(now.getFullYear(), now.getMonth(), 0);
//       from = f.toISOString().slice(0, 10);
//       to = t.toISOString().slice(0, 10);
//     } else if (type === "thisYear") {
//       const f = new Date(now.getFullYear(), 0, 1);
//       from = f.toISOString().slice(0, 10);
//       to = todayStr();
//     }

//     setTempFrom(from);
//     setTempTo(to);
//     if (from) setViewDate(new Date(from + "T00:00:00"));
//   };

//   const handleClear = () => {
//     setTempFrom("");
//     setTempTo("");
//     setDateFrom("");
//     setDateTo("");
//     setOpen(false);
//   };

//   const handleApply = () => {
//     setDateFrom(tempFrom);
//     setDateTo(tempTo);
//     setOpen(false);
//   };

//   const year = viewDate.getFullYear();
//   const month = viewDate.getMonth();

//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const firstDayOfWeek = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
//   const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

//   const handleDateClick = (dayNum) => {
//     const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
//     if (dStr > todayStr()) return; // Prevent future date selection

//     if (!tempFrom || (tempFrom && tempTo)) {
//       setTempFrom(dStr);
//       setTempTo("");
//     } else if (tempFrom && !tempTo) {
//       if (dStr < tempFrom) {
//         setTempFrom(dStr);
//         setTempTo(tempFrom);
//       } else {
//         setTempTo(dStr);
//       }
//     }
//   };

//   const getDayStatus = (dayNum) => {
//     const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
//     const isStart = dStr === tempFrom;
//     const isEnd = dStr === tempTo;
//     const isInRange = tempFrom && tempTo && dStr > tempFrom && dStr < tempTo;
//     const isToday = dStr === todayStr();
//     return { isStart, isEnd, isInRange, isToday, dStr };
//   };

//   const today = todayStr();

//   return (
//     <div className="cdr-wrap" ref={ref}>
//       <button
//         className={`cdr-trigger-btn${hasRange ? " active" : ""}`}
//         onClick={() => setOpen(o => !o)}
//       >
//         <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <rect x="3" y="4" width="18" height="18" rx="3" />
//           <line x1="16" y1="2" x2="16" y2="6" />
//           <line x1="8" y1="2" x2="8" y2="6" />
//           <line x1="3" y1="10" x2="21" y2="10" />
//         </svg>
//         <span className="cdr-trigger-text">{triggerLabel}</span>
//         {hasRange && (
//           <span
//             className="cdr-trigger-clear"
//             title="Clear date filter"
//             onClick={e => { e.stopPropagation(); handleClear(); }}
//           >
//             ×
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="cdr-popover">
//           <div className="cdr-presets-header">
//             <span className="cdr-presets-title">Quick Presets:</span>
//             <div className="cdr-presets-chips">
//               {[
//                 { id: "today", label: "Today" },
//                 { id: "yesterday", label: "Yesterday" },
//                 { id: "last7", label: "Last 7 Days" },
//                 { id: "last30", label: "Last 30 Days" },
//                 { id: "thisMonth", label: "This Month" },
//                 { id: "lastMonth", label: "Last Month" },
//                 { id: "thisYear", label: "This Year" },
//               ].map(p => (
//                 <button
//                   key={p.id}
//                   className="cdr-preset-chip"
//                   onClick={() => handleApplyPreset(p.id)}
//                 >
//                   {p.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="cdr-range-inputs">
//             <div className="cdr-input-box">
//               <label>From Date</label>
//               <input
//                 type="text"
//                 readOnly
//                 value={fmtLabel(tempFrom) || "Select Start Date"}
//                 className={tempFrom ? "filled" : ""}
//               />
//             </div>
//             <div className="cdr-range-arrow">→</div>
//             <div className="cdr-input-box">
//               <label>To Date</label>
//               <input
//                 type="text"
//                 readOnly
//                 value={fmtLabel(tempTo) || "Select End Date"}
//                 className={tempTo ? "filled" : ""}
//               />
//             </div>
//           </div>

//           <div className="cdr-calendar">
//             <div className="cdr-cal-header">
//               <button className="cdr-cal-nav" onClick={prevMonth}>‹</button>
//               <span className="cdr-cal-title">{monthNames[month]} {year}</span>
//               <button className="cdr-cal-nav" onClick={nextMonth}>›</button>
//             </div>

//             <div className="cdr-cal-grid">
//               {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
//                 <div key={d} className="cdr-cal-day-head">{d}</div>
//               ))}

//               {Array.from({ length: firstDayOfWeek }).map((_, i) => (
//                 <div key={`empty-${i}`} className="cdr-cal-day empty" />
//               ))}

//               {Array.from({ length: daysInMonth }).map((_, i) => {
//                 const dayNum = i + 1;
//                 const { isStart, isEnd, isInRange, isToday, dStr } = getDayStatus(dayNum);
//                 const isFuture = dStr > today;

//                 let cls = "cdr-cal-day";
//                 if (isStart) cls += " start";
//                 if (isEnd) cls += " end";
//                 if (isInRange) cls += " in-range";
//                 if (isToday) cls += " today";
//                 if (isFuture) cls += " future";

//                 return (
//                   <button
//                     key={dayNum}
//                     className={cls}
//                     disabled={isFuture}
//                     onClick={() => !isFuture && handleDateClick(dayNum)}
//                   >
//                     <span>{dayNum}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="cdr-footer">
//             <button className="cdr-btn-clear" onClick={handleClear}>Clear</button>
//             <div className="cdr-footer-right">
//               <button className="cdr-btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
//               <button className="cdr-btn-apply" onClick={handleApply}>Apply Filter</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── Main ListInvoice Component ─────────────────────────────────── */
// export default function ListInvoice() {
//   const navigate = useNavigate();
//   const { push, ToastHost } = useToast();
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchParams] = useSearchParams();
//   const [activeTab, setActiveTab] = useState("all");
//   const [search, setSearch] = useState("");
//   const [deptFilter, setDeptFilter] = useState(searchParams.get("department_id") || "all");
//   const [settlementFilter, setSettlementFilter] = useState("all");
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE = 10;
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [paymentInvoice, setPaymentInvoice] = useState(null);
//   const [pdfGenerating, setPdfGenerating] = useState(false);

//   const fetchInvoices = () => {
//     setLoading(true);
//     api.get("/invoices/")
//       .then(r => {
//         const list = r.data?.data || r.data || [];
//         setInvoices(Array.isArray(list) ? list : []);
//       })
//       .catch(() => setInvoices([]))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { fetchInvoices(); }, []);

//   const departments = Array.from(
//     new Map(
//       invoices
//         .filter(inv => inv.department_data?.department_id)
//         .map(inv => [inv.department_data.department_id, inv.department_data.department_name])
//     )
//   );

//   const filtered = useMemo(() => {
//     return invoices.filter(inv => {
//       const matchTab = activeTab === "all" || inv.status === activeTab;
//       const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || "";
//       const matchSearch = !search ||
//         (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
//         customerName.toLowerCase().includes(search.toLowerCase());
//       const matchDept =
//         deptFilter === "all" ? true
//         : deptFilter === "__none__" ? !inv.department_data
//         : inv.department_data?.department_id === deptFilter;
//       const settle = inv.settlement_status || (getInvoiceFinancials(inv).balanceDue <= 0 ? "setteled" : getInvoiceFinancials(inv).isOverdue ? "overdue" : "pending");
//       const matchSettlement = settlementFilter === "all" ? true : settle === settlementFilter;
//       const matchDate = inDateRange(inv.invoice_date, dateFrom, dateTo);

//       return matchTab && matchSearch && matchDept && matchSettlement && matchDate;
//     });
//   }, [invoices, activeTab, search, deptFilter, settlementFilter, dateFrom, dateTo]);

//   const stats = useMemo(() => {
//     let totalOutstanding = 0;
//     let overdue = 0;
//     let drafts = 0;
//     let totalPaid = 0;
//     let grandTotalSum = 0;
//     let balanceSum = 0;

//     filtered.forEach(inv => {
//       const fin = getInvoiceFinancials(inv);
//       grandTotalSum += fin.grandTotal;
//       balanceSum += fin.balanceDue;
//       totalPaid += fin.totalPaidSoFar;
      
//       if (fin.balanceDue > 0) {
//         totalOutstanding += fin.balanceDue;
//       }
//       if (fin.isOverdue) {
//         overdue += fin.balanceDue;
//       }
//       if (inv.status === "draft") {
//         drafts += 1;
//       }
//     });

//     return { totalOutstanding, overdue, drafts, totalPaid, grandTotalSum, balanceSum };
//   }, [filtered]);

//   const TABS = ["all", "draft", "sent"];
//   const activeFilterCount = (activeTab !== "all" ? 1 : 0) + (deptFilter !== "all" ? 1 : 0) + (settlementFilter !== "all" ? 1 : 0);

//   useEffect(() => { setCurrentPage(1); }, [activeTab, search, deptFilter, settlementFilter, dateFrom, dateTo]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);
//   const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

//   /* Vector Multi-Page PDF Generation */
//   const handleDownloadPdf = async () => {
//     if (filtered.length === 0) {
//       push("No invoices match the current filters.", "error");
//       return;
//     }
//     setPdfGenerating(true);
//     push(`Generating PDF report for ${filtered.length} invoice(s)…`, "success");

//     try {
//       const { jsPDF } = await import("jspdf");
      
//       const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 28;
//       const contentWidth = pageWidth - margin * 2;

//       const darkTextColor = [17, 24, 39];
//       const mutedTextColor = [107, 114, 128];
      
//       let currentY = margin;

//       const drawDocumentHeader = () => {
//         // Report Title & Timestamp
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(18);
//         doc.setTextColor(...darkTextColor);
//         doc.text("INVOICE FINANCIAL REPORT", margin, currentY + 16);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(8.5);
//         doc.setTextColor(...mutedTextColor);
//         const nowStr = new Date().toLocaleString("en-IN", {
//           day: "2-digit", month: "short", year: "numeric",
//           hour: "2-digit", minute: "2-digit", hour12: true
//         });
//         doc.text(`Generated: ${nowStr}`, pageWidth - margin, currentY + 16, { align: "right" });
//         currentY += 22;

//         // Subtitle Metadata
//         let rangeText = "Date Filter: All Invoices";
//         if (dateFrom || dateTo) {
//           rangeText = `Date Range: ${fmtLabel(dateFrom) || "Beginning"} — ${fmtLabel(dateTo) || "Present"}`;
//         }
//         doc.setFontSize(9.5);
//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(53, 104, 196);
//         doc.text(rangeText, margin, currentY + 14);

//         doc.setFont("helvetica", "normal");
//         doc.setTextColor(...mutedTextColor);
//         doc.text(`Total Records: ${filtered.length} invoice(s)`, pageWidth - margin, currentY + 14, { align: "right" });
//         currentY += 24;

//         // Blue Line Placed Below Title Block
//         doc.setFillColor(69, 132, 229);
//         doc.rect(margin, currentY, contentWidth, 3.5, "F");
//         currentY += 16;

//         // Summary Stat Cards
//         const cardGap = 10;
//         const cardWidth = (contentWidth - cardGap * 3) / 4;
//         const cardHeight = 44;

//         const statItems = [
//           { label: "TOTAL OUTSTANDING", val: fmtPdf(stats.totalOutstanding), color: [69, 132, 229] },
//           { label: "OVERDUE AMOUNT", val: fmtPdf(stats.overdue), color: [220, 38, 38] },
//           { label: "DRAFTS PENDING", val: `${stats.drafts}`, color: [107, 114, 128] },
//           { label: "TOTAL PAID", val: fmtPdf(stats.totalPaid), color: [22, 163, 74] },
//         ];

//         statItems.forEach((st, idx) => {
//           const x = margin + idx * (cardWidth + cardGap);
//           doc.setFillColor(250, 251, 253);
//           doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, "F");
//           doc.setFillColor(...st.color);
//           doc.roundedRect(x, currentY, 3.5, cardHeight, 1.5, 1.5, "F");
//           doc.setDrawColor(233, 235, 241);
//           doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, "S");

//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(7);
//           doc.setTextColor(...mutedTextColor);
//           doc.text(st.label, x + 10, currentY + 14);

//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(11.5);
//           doc.setTextColor(...darkTextColor);
//           doc.text(st.val, x + 10, currentY + 31);
//         });

//         currentY += cardHeight + 16;
//       };

//       const cols = [
//         { header: "INVOICE #", width: 80, align: "left" },
//         { header: "CUSTOMER", width: 130, align: "left" },
//         { header: "DEPARTMENT", width: 95, align: "left" },
//         { header: "ISSUE DATE", width: 75, align: "left" },
//         { header: "DUE DATE", width: 75, align: "left" },
//         { header: "AMOUNT", width: 90, align: "right" },
//         { header: "BALANCE DUE", width: 95, align: "right" },
//         { header: "STATUS", width: 65, align: "center" },
//         { header: "PAYMENT", width: 75, align: "center" },
//       ];

//       const drawTableHeader = () => {
//         const headerHeight = 22;
//         doc.setFillColor(31, 41, 55);
//         doc.rect(margin, currentY, contentWidth, headerHeight, "F");

//         let curX = margin;
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(8);
//         doc.setTextColor(255, 255, 255);

//         cols.forEach(col => {
//           let posX = curX + 8;
//           if (col.align === "right") posX = curX + col.width - 8;
//           if (col.align === "center") posX = curX + col.width / 2;
//           doc.text(col.header, posX, currentY + 14, { align: col.align });
//           curX += col.width;
//         });

//         currentY += headerHeight;
//       };

//       drawDocumentHeader();
//       drawTableHeader();

//       const rowHeight = 20;

//       filtered.forEach((inv, index) => {
//         if (currentY + rowHeight > pageHeight - 35) {
//           doc.addPage();
//           currentY = margin;
//           drawTableHeader();
//         }

//         const fin = getInvoiceFinancials(inv);
//         const isEven = index % 2 === 0;

//         if (!isEven) {
//           doc.setFillColor(248, 250, 252);
//           doc.rect(margin, currentY, contentWidth, rowHeight, "F");
//         }

//         doc.setDrawColor(241, 242, 246);
//         doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

//         const invNum = `#${inv.invoice_number || (inv.invoice_id || inv.id || "").slice(0, 8)}`;
//         const customer = (inv.customer_data?.name || inv.customer_data?.customer_name || "—").slice(0, 22);
//         const dept = (inv.department_data?.department_name || "—").slice(0, 16);
//         const issueDt = inv.invoice_date ? new Date(extractDate(inv.invoice_date)).toLocaleDateString("en-IN") : "—";
//         const dueDt = inv.due_date ? new Date(extractDate(inv.due_date)).toLocaleDateString("en-IN") : "—";
//         const amtStr = fmtPdf(fin.grandTotal);
//         const balStr = fin.balanceDue <= 0 ? "No Balance" : fmtPdf(fin.balanceDue);
//         const statusStr = (inv.status || "draft").toUpperCase();
        
//         const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
//         const settleStr = settle === "setteled" ? "SETTLED" : settle === "overdue" ? "OVERDUE" : "PENDING";

//         let curX = margin;
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(8.5);

//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(69, 132, 229);
//         doc.text(invNum, curX + 8, currentY + 13);
//         curX += cols[0].width;

//         doc.setFont("helvetica", "normal");
//         doc.setTextColor(...darkTextColor);
//         doc.text(customer, curX + 8, currentY + 13);
//         curX += cols[1].width;

//         doc.setTextColor(...mutedTextColor);
//         doc.text(dept, curX + 8, currentY + 13);
//         curX += cols[2].width;

//         doc.setTextColor(...darkTextColor);
//         doc.text(issueDt, curX + 8, currentY + 13);
//         curX += cols[3].width;
//         doc.text(dueDt, curX + 8, currentY + 13);
//         curX += cols[4].width;

//         doc.setFont("helvetica", "bold");
//         doc.text(amtStr, curX + cols[5].width - 8, currentY + 13, { align: "right" });
//         curX += cols[5].width;

//         if (fin.balanceDue <= 0) doc.setTextColor(22, 163, 74);
//         else doc.setTextColor(220, 38, 38);
//         doc.text(balStr, curX + cols[6].width - 8, currentY + 13, { align: "right" });
//         curX += cols[6].width;

//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(7.5);
//         if (statusStr === "PAID") doc.setTextColor(22, 163, 74);
//         else if (statusStr === "SENT") doc.setTextColor(37, 99, 235);
//         else doc.setTextColor(107, 114, 128);
//         doc.text(statusStr, curX + cols[7].width / 2, currentY + 13, { align: "center" });
//         curX += cols[7].width;

//         if (settleStr === "SETTLED") doc.setTextColor(22, 163, 74);
//         else if (settleStr === "OVERDUE") doc.setTextColor(220, 38, 38);
//         else doc.setTextColor(180, 83, 9);
//         doc.text(settleStr, curX + cols[8].width / 2, currentY + 13, { align: "center" });

//         currentY += rowHeight;
//       });

//       if (currentY + 24 > pageHeight - 35) {
//         doc.addPage();
//         currentY = margin;
//       }
      
//       const totalRowHeight = 22;
//       doc.setFillColor(241, 245, 249);
//       doc.rect(margin, currentY, contentWidth, totalRowHeight, "F");
//       doc.setDrawColor(31, 41, 55);
//       doc.setLineWidth(1);
//       doc.line(margin, currentY, pageWidth - margin, currentY);
//       doc.line(margin, currentY + totalRowHeight, pageWidth - margin, currentY + totalRowHeight);

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(9);
//       doc.setTextColor(...darkTextColor);
//       doc.text("TOTALS", margin + 8, currentY + 15);

//       const amtColX = margin + cols[0].width + cols[1].width + cols[2].width + cols[3].width + cols[4].width;
//       const balColX = amtColX + cols[5].width;

//       doc.text(fmtPdf(stats.grandTotalSum), amtColX + cols[5].width - 8, currentY + 15, { align: "right" });
//       doc.setTextColor(220, 38, 38);
//       doc.text(fmtPdf(stats.balanceSum), balColX + cols[6].width - 8, currentY + 15, { align: "right" });

//       const totalPagesNum = doc.internal.getNumberOfPages();
//       for (let p = 1; p <= totalPagesNum; p++) {
//         doc.setPage(p);
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(8);
//         doc.setTextColor(...mutedTextColor);
//         doc.text(`Page ${p} of ${totalPagesNum}`, pageWidth - margin, pageHeight - 12, { align: "right" });
//         doc.text(`Invoice Report — Confidential`, margin, pageHeight - 12);
//       }

//       const fname = `Invoice_Report_${dateFrom || "All"}_to_${dateTo || "All"}.pdf`;
//       doc.save(fname);
//       push(`PDF downloaded (${filtered.length} invoices across ${totalPagesNum} page(s)).`, "success");
//     } catch (err) {
//       console.error("PDF Export Error:", err);
//       push("Could not generate PDF. Check console for details.", "error");
//     } finally {
//       setPdfGenerating(false);
//     }
//   };

//   return (
//     <>
//       <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;800&display=swap" />
//       <style>{`
//         :root {
//           --c-primary: #4584E5;
//           --c-primary-dark: #3568C4;
//           --c-primary-light: #EAF1FD;
//           --c-accent-row-hover: #F7FAFF;
//           --c-border: #E9EBF1;
//         }
//         * { font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-sizing: border-box; }
//         .li-wrap { padding: 24px 28px; }
//         .li-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
//         .li-title-row { display: flex; align-items: center; gap: 6px; }
//         .li-title { font-size: 21px; font-weight: 700; color: #111827; margin: 0; }
//         .li-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
//         .li-new-split { display: flex; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(69,132,229,0.18); }
//         .li-new-btn { display: flex; align-items: center; gap: 7px; background: var(--c-primary); color: #fff; border: none; padding: 9px 16px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
//         .li-new-btn:hover { background: var(--c-primary-dark); }
//         .li-filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 13px; border-radius: 8px; border: 1px solid var(--c-border); background: #fff; color: #374151; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; position: relative; }
//         .li-filter-btn.active { border-color: var(--c-primary); background: var(--c-primary-light); color: var(--c-primary-dark); }
//         .li-filter-count { background: var(--c-primary); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; }
        
//         /* ── PDF Icon Button ── */
//         .li-pdf-btn {
//           width: 36px; height: 36px;
//           display: flex; align-items: center; justify-content: center;
//           border-radius: 8px; border: 1px solid var(--c-border);
//           background: #fff; color: var(--c-primary);
//           cursor: pointer; transition: all 0.15s ease;
//           flex-shrink: 0;
//         }
//         .li-pdf-btn:hover:not(:disabled) {
//           border-color: var(--c-primary);
//           background: var(--c-primary-light);
//           color: var(--c-primary-dark);
//         }
//         .li-pdf-btn:disabled {
//           opacity: 0.5; cursor: not-allowed;
//         }
//         .li-pdf-spinner {
//           width: 14px; height: 14px; border-radius: 50%;
//           border: 2px solid #CBD5E1; border-top-color: var(--c-primary);
//           animation: spin 0.7s linear infinite;
//         }

//         .li-search { border: 1px solid var(--c-border); border-radius: 8px; padding: 8px 14px 8px 34px; font-size: 13px; outline: none; width: 200px; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%238A93A6' stroke-width='2'/%3E%3Cpath d='m21 21-4.35-4.35' stroke='%238A93A6' stroke-width='2'/%3E%3C/svg%3E") 10px center no-repeat; transition: border-color 0.15s; }
//         .li-search:focus { border-color: var(--c-primary); }

//         .cdr-wrap { position: relative; }
//         .cdr-trigger-btn {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 8px 14px; border-radius: 8px;
//           border: 1px solid var(--c-border); background: #fff;
//           color: #374151; font-size: 13px; font-weight: 600;
//           cursor: pointer; transition: all 0.15s ease;
//         }
//         .cdr-trigger-btn:hover { border-color: var(--c-primary); background: #F8FAFC; }
//         .cdr-trigger-btn.active {
//           border-color: var(--c-primary); background: var(--c-primary-light); color: var(--c-primary-dark);
//           font-weight: 700;
//         }
//         .cdr-trigger-text { white-space: nowrap; }
//         .cdr-trigger-clear {
//           margin-left: 2px; font-size: 15px; font-weight: 700;
//           line-height: 1; color: #9AA1AF; border-radius: 50%;
//           width: 18px; height: 18px; display: inline-flex;
//           align-items: center; justify-content: center;
//           transition: all 0.15s ease;
//         }
//         .cdr-trigger-clear:hover { background: #FEE2E2; color: #DC2626; }

//         .cdr-popover {
//           position: absolute; top: 44px; left: 0;
//           background: #fff; border-radius: 14px;
//           border: 1px solid #E9EBF1;
//           box-shadow: 0 16px 40px rgba(15,23,42,0.16);
//           width: 340px; padding: 16px; z-index: 500;
//           animation: cdrPopIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
//         }
//         @keyframes cdrPopIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

//         .cdr-presets-header { margin-bottom: 12px; }
//         .cdr-presets-title { font-size: 10.5px; font-weight: 800; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
//         .cdr-presets-chips { display: flex; flex-wrap: wrap; gap: 5px; }
//         .cdr-preset-chip {
//           padding: 4px 9px; border-radius: 6px;
//           border: 1px solid #E9EBF1; background: #F8F9FC;
//           font-size: 11.5px; font-weight: 600; color: #475569;
//           cursor: pointer; transition: all 0.12s ease;
//         }
//         .cdr-preset-chip:hover { border-color: #4584E5; background: #EAF1FD; color: #3568C4; }

//         .cdr-range-inputs { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; background: #F8F9FC; padding: 8px 10px; border-radius: 8px; border: 1px solid #E9EBF1; }
//         .cdr-input-box { flex: 1; display: flex; flex-direction: column; gap: 2px; }
//         .cdr-input-box label { font-size: 9.5px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; }
//         .cdr-input-box input { border: none; background: transparent; font-size: 12px; font-weight: 700; color: #9AA1AF; outline: none; padding: 0; }
//         .cdr-input-box input.filled { color: #111827; }
//         .cdr-range-arrow { color: #9AA1AF; font-size: 13px; font-weight: 700; }

//         .cdr-calendar { margin-bottom: 14px; }
//         .cdr-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
//         .cdr-cal-title { font-size: 13.5px; font-weight: 800; color: #111827; }
//         .cdr-cal-nav { background: #F1F5F9; border: none; border-radius: 6px; width: 26px; height: 26px; font-size: 15px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; }
//         .cdr-cal-nav:hover { background: #E2E8F0; color: #0F172A; }

//         .cdr-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
//         .cdr-cal-day-head { font-size: 10.5px; font-weight: 700; color: #9AA1AF; padding-bottom: 6px; }
//         .cdr-cal-day {
//           aspect-ratio: 1; border: none; background: transparent;
//           font-size: 12px; font-weight: 600; color: #334155;
//           border-radius: 50%; cursor: pointer; display: flex;
//           align-items: center; justify-content: center;
//           position: relative; margin: auto; width: 32px; height: 32px;
//           transition: all 0.1s ease;
//         }
//         .cdr-cal-day:hover:not(.empty):not(.future) { background: #EAF1FD; color: #3568C4; }
//         .cdr-cal-day.today { font-weight: 800; color: #4584E5; text-decoration: underline; }
//         .cdr-cal-day.start, .cdr-cal-day.end { background: #4584E5 !important; color: #fff !important; font-weight: 800; border-radius: 50%; }
//         .cdr-cal-day.in-range { background: #EAF1FD !important; color: #3568C4 !important; border-radius: 0; width: 100%; }
//         .cdr-cal-day.future {
//           opacity: 0.35;
//           color: #94A3B8 !important;
//           cursor: not-allowed !important;
//           background: transparent !important;
//         }
//         .cdr-cal-day.future:hover {
//           background: transparent !important;
//           color: #94A3B8 !important;
//         }

//         .cdr-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F1F2F6; }
//         .cdr-footer-right { display: flex; gap: 6px; }
//         .cdr-btn-clear { background: none; border: none; color: #DC2626; font-size: 12px; font-weight: 700; cursor: pointer; padding: 6px 8px; }
//         .cdr-btn-clear:hover { text-decoration: underline; }
//         .cdr-btn-cancel { background: #F1F5F9; border: none; border-radius: 8px; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; }
//         .cdr-btn-cancel:hover { background: #E2E8F0; }
//         .cdr-btn-apply { background: linear-gradient(135deg, #4584E5, #3568C4); border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; box-shadow: 0 2px 6px rgba(69,132,229,0.3); }
//         .cdr-btn-apply:hover { opacity: 0.95; }

//         .li-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
//         @media (max-width: 1024px) { .li-stats { grid-template-columns: repeat(2, 1fr); } }
//         .li-stat { background: #fff; border: 1px solid var(--c-border); border-radius: 12px; padding: 16px 18px; position: relative; overflow: hidden; }
//         .li-stat::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--c-primary); }
//         .li-stat.red::before { background: #DC2626; }
//         .li-stat-label { font-size: 10.5px; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 700; }
//         .li-stat-value { font-size: 21px; font-weight: 800; color: #111827; }
//         .li-stat-value.red { color: #DC2626; }
//         .li-filter-pop-wrap { position: relative; }
//         .li-filter-pop { position: absolute; top: 44px; right: 0; background: #fff; border-radius: 12px; border: 1px solid var(--c-border); box-shadow: 0 14px 36px rgba(17,24,39,0.16); width: 300px; padding: 16px; z-index: 300; }
//         .li-filter-pop-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 14px; }
//         .li-filter-pop-clear { background: none; border: none; color: var(--c-primary); font-size: 12px; font-weight: 700; cursor: pointer; }
//         .li-filter-pop-group { margin-bottom: 14px; }
//         .li-filter-pop-group:last-child { margin-bottom: 0; }
//         .li-filter-pop-label { font-size: 11px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 7px; }
//         .li-filter-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
//         .li-filter-chip { padding: 6px 11px; border-radius: 999px; border: 1px solid var(--c-border); background: #fff; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s; text-transform: capitalize; }
//         .li-filter-chip.active { background: var(--c-primary); border-color: var(--c-primary); color: #fff; }
//         .li-filter-pop-select { width: 100%; box-sizing: border-box; border: 1px solid var(--c-border); border-radius: 8px; padding: 8px 10px; font-size: 13px; color: #374151; background: #fff; outline: none; cursor: pointer; }
//         .li-filter-pop-select:focus { border-color: var(--c-primary); }

//         .li-table-wrap { background: #fff; border: 1px solid var(--c-border); border-radius: 12px; overflow: hidden; }
//         .li-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
//         table { width: 100%; border-collapse: collapse; min-width: 960px; table-layout: fixed; }
//         thead th { padding: 11px 14px; font-size: 10.5px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.4px; background: #F8F9FC; border-bottom: 1px solid var(--c-border); white-space: nowrap; text-align: left; }
//         tbody td { padding: 13px 14px; font-size: 13.5px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; }
//         tbody tr { border-bottom: 1px solid #F1F2F6; cursor: pointer; transition: background 0.12s; }
//         tbody tr:last-child { border-bottom: none; }
//         tbody tr:hover { background: var(--c-accent-row-hover); }
//         .li-inv-num { color: var(--c-primary); font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 5px; }
//         .li-inv-num:hover { text-decoration: underline; }
//         .li-customer { display: flex; align-items: center; gap: 8px; }
//         .li-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--c-primary-light); color: var(--c-primary-dark); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
//         .li-amount { font-weight: 700; color: #111827; }
//         .li-badge { display: inline-block; border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
//         .li-dept-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--c-primary-light); color: var(--c-primary-dark); border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; }
//         .li-dept-none { color: #D1D5DB; font-style: italic; font-size: 12px; }

//         .li-actions-cell { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
//         .li-pay-icon-btn, .li-action-btn, .li-pay-icon-placeholder {
//           width: 28px; height: 28px; flex-shrink: 0;
//           display: flex; align-items: center; justify-content: center;
//           border-radius: 7px; box-sizing: border-box;
//         }
//         .li-pay-icon-btn { background: none; border: 1px solid #E9EBF1; cursor: pointer; color: #4584E5; transition: all 0.15s; }
//         .li-pay-icon-btn:hover { background: #EAF1FD; border-color: #4584E5; }
//         .li-action-btn { background: none; border: 1px solid transparent; cursor: pointer; color: #9AA1AF; font-size: 17px; line-height: 1; transition: color 0.15s, background 0.15s, border-color 0.15s; }
//         .li-action-btn:hover { color: var(--c-primary-dark); background: var(--c-primary-light); }
//         .li-pay-icon-placeholder { visibility: hidden; border: 1px solid transparent; }

//         .li-pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 13px 16px; font-size: 12.5px; color: #6B7280; border-top: 1px solid #F1F2F6; }
//         .li-page-btns { display: flex; gap: 4px; }
//         .li-page-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--c-border); background: #fff; cursor: pointer; font-size: 12.5px; font-weight: 700; color: #374151; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
//         .li-page-btn.active { background: var(--c-primary); color: #fff; border-color: var(--c-primary); }
//         .li-page-btn:hover:not(.active):not(:disabled) { border-color: var(--c-primary); color: var(--c-primary-dark); }
//         .li-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
//         .li-empty { padding: 56px 20px; text-align: center; color: #9AA1AF; }
//         .li-empty svg { opacity: 0.3; margin-bottom: 12px; }
//         .li-empty p { font-size: 14px; }
//         .li-skeleton { animation: shimmer 1.4s infinite; }
//         @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
//         .li-sk-row td { padding: 14px 14px; }
//         .li-sk-bar { height: 13px; border-radius: 6px; background: #EDEFF4; }

//         @media (max-width: 900px) { .li-wrap { padding: 16px; } }
//         @media (max-width: 768px) {
//           .li-header { align-items: flex-start; }
//           .li-search { width: 100%; }
//           .li-header-actions { width: 100%; }
//           .cdr-popover { width: 300px; left: auto; right: 0; }
//         }
//         @media (max-width: 600px) {
//           thead th:nth-child(4), thead th:nth-child(5), tbody td:nth-child(4), tbody td:nth-child(5) { display: none; }
//           .li-filter-pop { width: 260px; right: -60px; }
//         }
//       `}</style>

//       <div className="li-wrap">
//         <div className="li-header">
//           <div>
//             <div className="li-title-row">
//               <h1 className="li-title">All Invoices</h1>
//             </div>
//           </div>
//           <div className="li-header-actions">
//             <input
//               className="li-search"
//               placeholder="Search invoices, clients…"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />

//             <CustomDateRangePicker
//               dateFrom={dateFrom}
//               dateTo={dateTo}
//               setDateFrom={setDateFrom}
//               setDateTo={setDateTo}
//             />

//             <div className="li-filter-pop-wrap">
//               <button
//                 className={`li-filter-btn${activeFilterCount > 0 ? " active" : ""}`}
//                 onClick={() => setFilterOpen(o => !o)}
//               >
//                 <FilterIcon color={activeFilterCount > 0 ? "#3568C4" : "#4584E5"} />
//                 Filter
//                 {activeFilterCount > 0 && <span className="li-filter-count">{activeFilterCount}</span>}
//               </button>
//               <FilterPopover
//                 open={filterOpen}
//                 onClose={() => setFilterOpen(false)}
//                 departments={departments}
//                 deptFilter={deptFilter} setDeptFilter={setDeptFilter}
//                 settlementFilter={settlementFilter} setSettlementFilter={setSettlementFilter}
//                 activeTab={activeTab} setActiveTab={setActiveTab} TABS={TABS}
//               />
//             </div>

//             <div className="li-new-split">
//               <button className="li-new-btn" onClick={() => navigate("/invoices/create")}>
//                 <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
//                 New
//               </button>
//             </div>

//             {/* Dedicated PDF Download Icon Button */}
//             <button
//               className="li-pdf-btn"
//               title={pdfGenerating ? "Generating PDF Report…" : "Download PDF Report"}
//               disabled={pdfGenerating || loading}
//               onClick={handleDownloadPdf}
//             >
//               {pdfGenerating ? (
//                 <div className="li-pdf-spinner" />
//               ) : (
//                 <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                   <polyline points="7 10 12 15 17 10" />
//                   <line x1="12" y1="15" x2="12" y2="3" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         <div className="li-stats">
//           <div className="li-stat">
//             <p className="li-stat-label">Total Outstanding</p>
//             <p className="li-stat-value">{fmt(stats.totalOutstanding)}</p>
//           </div>
//           <div className="li-stat red">
//             <p className="li-stat-label">Overdue Amount</p>
//             <p className="li-stat-value red">{fmt(stats.overdue)}</p>
//           </div>
//           <div className="li-stat">
//             <p className="li-stat-label">Drafts Pending</p>
//             <p className="li-stat-value">{stats.drafts}</p>
//           </div>
//           <div className="li-stat">
//             <p className="li-stat-label">Total Paid</p>
//             <p className="li-stat-value">{fmt(stats.totalPaid)}</p>
//           </div>
//         </div>

//         <div className="li-table-wrap">
//           <div className="li-table-scroll">
//             <table>
//               <colgroup>
//                 <col style={{ width: "110px" }} />
//                 <col style={{ width: "170px" }} />
//                 <col style={{ width: "130px" }} />
//                 <col style={{ width: "100px" }} />
//                 <col style={{ width: "100px" }} />
//                 <col style={{ width: "110px" }} />
//                 <col style={{ width: "130px" }} />
//                 <col style={{ width: "90px" }} />
//                 <col style={{ width: "100px" }} />
//                 <col style={{ width: "78px" }} />
//               </colgroup>
//               <thead>
//                 <tr>
//                   <th>Invoice</th>
//                   <th>Customer</th>
//                   <th>Department</th>
//                   <th>Issue Date</th>
//                   <th>Due Date</th>
//                   <th>Amount</th>
//                   <th style={{ textAlign: "right" }}>Balance Due</th>
//                   <th>Status</th>
//                   <th>Payment</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading
//                   ? Array.from({ length: 5 }).map((_, i) => (
//                       <tr key={i} className="li-sk-row li-skeleton">
//                         {Array.from({ length: 10 }).map((__, j) => (
//                           <td key={j}><div className="li-sk-bar" style={{ width: j === 0 ? 80 : j === 1 ? 130 : j === 9 ? 40 : 80 }} /></td>
//                         ))}
//                       </tr>
//                     ))
//                   : filtered.length === 0
//                     ? (
//                       <tr>
//                         <td colSpan={10}>
//                           <div className="li-empty">
//                             <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
//                               <rect x="4" y="5" width="16" height="14" rx="2" stroke="#9AA1AF" strokeWidth="1.5" />
//                               <path d="M8 9h8M8 13h5M8 16h3" stroke="#9AA1AF" strokeWidth="1.5" strokeLinecap="round" />
//                             </svg>
//                             <p>No invoices match the current filter criteria</p>
//                           </div>
//                         </td>
//                       </tr>
//                     )
//                     : paginated.map(inv => {
//                       const fin = getInvoiceFinancials(inv);
//                       const s = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
//                       const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
//                       const sc = SETTLEMENT_COLOR[settle] || SETTLEMENT_COLOR.pending;
//                       const settleLabel = settle === "setteled" ? "Settled" : settle === "overdue" ? "Overdue" : "Pending";
//                       const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || null;
//                       const initials = customerName ? customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
//                       const deptName = inv.department_data?.department_name || null;
//                       const id = inv.invoice_id || inv.id;

//                       return (
//                         <tr key={id} onClick={() => navigate(`/invoices/${id}`)}>
//                           <td>
//                             <span className="li-inv-num">
//                               #{inv.invoice_number || (id ? id.slice(0, 8) : "—")}
//                               <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4584E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M4 4h11v11M4 15 15 4" />
//                               </svg>
//                             </span>
//                           </td>
//                           <td>
//                             <div className="li-customer">
//                               <div className="li-avatar">{initials}</div>
//                               {customerName || <span style={{ color: "#9AA1AF", fontStyle: "italic" }}>No customer</span>}
//                             </div>
//                           </td>
//                           <td>
//                             {deptName
//                               ? <span className="li-dept-badge">
//                                   <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#3568C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                                   {deptName}
//                                 </span>
//                               : <span className="li-dept-none">—</span>
//                             }
//                           </td>
//                           <td>{inv.invoice_date ? new Date(extractDate(inv.invoice_date)).toLocaleDateString("en-IN") : "—"}</td>
//                           <td>{inv.due_date ? new Date(extractDate(inv.due_date)).toLocaleDateString("en-IN") : "—"}</td>
//                           <td><span className="li-amount">{fmt(fin.grandTotal, inv.invoice_currency || inv.currency)}</span></td>
//                           <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
//                             <BalanceCell inv={inv} />
//                           </td>
//                           <td>
//                             <span className="li-badge" style={{ background: s.bg, color: s.color }}>
//                               {inv.status || "draft"}
//                             </span>
//                           </td>
//                           <td>
//                             <span className="li-badge" style={{ background: sc.bg, color: sc.color }}>
//                               {settleLabel}
//                             </span>
//                           </td>
//                           <td onClick={e => e.stopPropagation()}>
//                             <div className="li-actions-cell">
//                               {settle !== "setteled" ? (
//                                 <button
//                                   className="li-pay-icon-btn"
//                                   title="Record payment"
//                                   onClick={e => { e.stopPropagation(); setPaymentInvoice(inv); }}
//                                 >
//                                   <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
//                                     <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
//                                     <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
//                                     <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//                                   </svg>
//                                 </button>
//                               ) : (
//                                 <span className="li-pay-icon-placeholder" aria-hidden="true" />
//                               )}
//                               <button className="li-action-btn" onClick={e => { e.stopPropagation(); navigate(`/invoices/${id}`); }}>⋯</button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                 }
//               </tbody>
//             </table>
//           </div>

//           {!loading && filtered.length > 0 && (
//             <div className="li-pagination">
//               <span>Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} invoices</span>
//               <div className="li-page-btns">
//                 <button className="li-page-btn" disabled={safePage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
//                 {Array.from({ length: totalPages }).map((_, i) => (
//                   <button key={i} className={`li-page-btn${safePage === i + 1 ? " active" : ""}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
//                 ))}
//                 <button className="li-page-btn" disabled={safePage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {paymentInvoice && (
//         <PaymentModal
//           invoice={paymentInvoice}
//           pushToast={push}
//           onClose={() => setPaymentInvoice(null)}
//           onSaved={() => {
//             setPaymentInvoice(null);
//             fetchInvoices();
//           }}
//         />
//       )}

//       <ToastHost />
//     </>
//   );
// }






































import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useAccess } from "../../services/AccessContext";
import Pagination from "../AuditLogs/Pagination";
/* ─── Toast Hook ─────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const ToastHost = () => (
    <div style={{
      position: "fixed", bottom: 20, right: 20, left: "auto", zIndex: 99999,
      display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      maxWidth: "calc(100vw - 40px)",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: t.type === "error" ? "#FEF2F2" : t.type === "warning" ? "#FFFBEB" : "#F0FDF4",
          border: `1px solid ${t.type === "error" ? "#FECACA" : t.type === "warning" ? "#FDE68A" : "#BBF7D0"}`,
          borderLeft: `4px solid ${t.type === "error" ? "#DC2626" : t.type === "warning" ? "#D97706" : "#16A34A"}`,
          borderRadius: 10, padding: "10px 14px", minWidth: 240, maxWidth: 360,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          animation: "toastIn 0.25s ease",
          pointerEvents: "auto",
        }}>
          <span style={{ fontSize: 16 }}>
            {t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "✅"}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: t.type === "error" ? "#991B1B" : t.type === "warning" ? "#92400E" : "#166534",
            wordBreak: "break-word"
          }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
  return { push, ToastHost };
}

/* ─── Constants & Helpers ────────────────────────────────────────── */
const STATUS_COLOR = {
  paid: { bg: "#DCFCE7", color: "#15803D" },
  sent: { bg: "#DBEAFE", color: "#2563EB" },
  draft: { bg: "#F3F4F6", color: "#6B7280" },
};
const SETTLEMENT_COLOR = {
  setteled: { bg: "#DCFCE7", color: "#15803D" },
  pending:  { bg: "#FEF3C7", color: "#B45309" },
  overdue:  { bg: "#FEE2E2", color: "#DC2626" },
};
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"];

const isRoom = (inv) => inv?.room_booking === true;
const CATEGORY_TABS = [
  {
    id: "all", label: "All",
    icon: (
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "standard", label: "Standard",
    icon: (
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><polyline points="14 3 14 8 19 8" />
      </svg>
    ),
  },
  {
    id: "rooms", label: "Rooms",
    icon: (
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];
/* Format for Web UI (Using Rupee Symbol ₹) */
const fmt = (n, currency = "INR") => {
  return `₹${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* Format for PDF Document */
const fmtPdf = (n) => {
  return `Rs. ${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const extractDate = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object" && raw.$date !== undefined) return raw.$date;
  return raw;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const inDateRange = (raw, fromStr, toStr) => {
  if (!fromStr && !toStr) return true;
  const rawDt = extractDate(raw);
  if (!rawDt) return false;
  
  const d = new Date(rawDt);
  if (isNaN(d.getTime())) return false;
  
  const dStr = d.toISOString().slice(0, 10);
  if (fromStr && dStr < fromStr) return false;
  if (toStr && dStr > toStr) return false;
  return true;
};

const fmtLabel = (dStr) => {
  if (!dStr) return null;
  const dt = new Date(dStr + "T00:00:00");
  if (isNaN(dt.getTime())) return dStr;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* Financial extractor */
const getInvoiceFinancials = (inv) => {
  const grandTotal = parseFloat(inv.grand_total_amount || inv.total_amount || 0);
  const advance = parseFloat(inv.advance_amount || 0);
  const manualPaid = parseFloat(inv.manual_paid_amount || 0);
  const paid = parseFloat(inv.paid_amount || 0);
  
  let balanceDue;
  if (inv.balance_amount !== undefined && inv.balance_amount !== null) {
    balanceDue = parseFloat(inv.balance_amount || 0);
  } else {
    balanceDue = Math.max(0, grandTotal - advance - manualPaid - paid);
  }
  
  const totalPaidSoFar = Math.max(0, grandTotal - balanceDue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawDue = extractDate(inv.due_date);
  const dueDate = rawDue ? new Date(rawDue) : null;
  const isOverdue = inv.settlement_status === "overdue" || (dueDate && dueDate < today && balanceDue > 0);

  return { grandTotal, advance, manualPaid, paid, balanceDue, totalPaidSoFar, isOverdue };
};

/* ─── Custom Beautiful Select Dropdown ────────────────────────────── */
function CustomSelect({ value, options, onChange, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="c-select-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`c-select-trigger ${isOpen ? "open" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
      >
        <span className="c-select-label">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`c-select-chevron ${isOpen ? "rotate" : ""}`}
          viewBox="0 0 24 24" width="14" height="14" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="c-select-menu" onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`c-select-option ${isSelected ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4584E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Filter Popover ─────────────────────────────────────────────── */
function FilterPopover({ open, onClose, departments, deptFilter, setDeptFilter, settlementFilter, setSettlementFilter, activeTab, setActiveTab, TABS }) {
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      // Close only if click is strictly outside the filter card
      if (open && ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    ...departments.map(([id, name]) => ({ value: id, label: name })),
    { value: "__none__", label: "No Department" }
  ];

  const settlementOptions = [
    { value: "all", label: "All Payment Statuses" },
    { value: "pending", label: "Pending" },
    { value: "setteled", label: "Settled" },
    { value: "overdue", label: "Overdue" }
  ];

  return (
    <>
      <div className="li-filter-backdrop" onClick={onClose} />
      <div className="li-filter-pop" ref={ref} onClick={e => e.stopPropagation()}>
        <div className="li-filter-pop-header">
          <span>Filter Invoices</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="li-filter-pop-clear"
              onClick={() => { setActiveTab("all"); setDeptFilter("all"); setSettlementFilter("all"); }}
            >
              Reset All
            </button>
            <button type="button" className="li-filter-pop-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="li-filter-pop-group">
          <div className="li-filter-pop-label">Status</div>
          <div className="li-filter-chip-row">
            {TABS.map(t => (
              <button
                type="button"
                key={t}
                className={`li-filter-chip${activeTab === t ? " active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "all" ? "All Statuses" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="li-filter-pop-group">
          <div className="li-filter-pop-label">Department</div>
          <CustomSelect
            value={deptFilter}
            options={departmentOptions}
            onChange={val => setDeptFilter(val)}
          />
        </div>

        <div className="li-filter-pop-group">
          <div className="li-filter-pop-label">Payment Settlement Status</div>
          <CustomSelect
            value={settlementFilter}
            options={settlementOptions}
            onChange={val => setSettlementFilter(val)}
          />
        </div>

        <div className="li-filter-footer">
          <button type="button" className="li-filter-apply-btn" onClick={onClose}>Apply & Close</button>
        </div>
      </div>
    </>
  );
}

/* ─── Custom Date Range Picker Component ─────────────────────────── */
function CustomDateRangePicker({ dateFrom, dateTo, setDateFrom, setDateTo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [tempFrom, setTempFrom] = useState(dateFrom);
  const [tempTo, setTempTo] = useState(dateTo);

  const [viewDate, setViewDate] = useState(() => {
    if (dateFrom) return new Date(dateFrom + "T00:00:00");
    return new Date();
  });

  useEffect(() => {
    if (open) {
      setTempFrom(dateFrom);
      setTempTo(dateTo);
      if (dateFrom) setViewDate(new Date(dateFrom + "T00:00:00"));
    }
  }, [open, dateFrom, dateTo]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const hasRange = !!(dateFrom || dateTo);
  const triggerLabel = hasRange
    ? `${fmtLabel(dateFrom) || "Start"} → ${fmtLabel(dateTo) || "End"}`
    : "Date Range";
const toLocalDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayStr = () => toLocalDateStr(new Date());


  // const handleApplyPreset = (type) => {
  //   const now = new Date();
  //   let from = "";
  //   let to = todayStr();

  //   if (type === "today") {
  //     from = todayStr();
  //     to = todayStr();
  //   } else if (type === "yesterday") {
  //     const y = new Date();
  //     y.setDate(now.getDate() - 1);
  //     from = y.toISOString().slice(0, 10);
  //     to = from;
  //   } else if (type === "last7") {
  //     const f = new Date();
  //     f.setDate(now.getDate() - 6);
  //     from = f.toISOString().slice(0, 10);
  //     to = todayStr();
  //   } else if (type === "last30") {
  //     const f = new Date();
  //     f.setDate(now.getDate() - 29);
  //     from = f.toISOString().slice(0, 10);
  //     to = todayStr();
  //   } else if (type === "thisMonth") {
  //     const f = new Date(now.getFullYear(), now.getMonth(), 1);
  //     from = f.toISOString().slice(0, 10);
  //     to = todayStr();
  //   } else if (type === "lastMonth") {
  //     const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //     const t = new Date(now.getFullYear(), now.getMonth(), 0);
  //     from = f.toISOString().slice(0, 10);
  //     to = t.toISOString().slice(0, 10);
  //   }

  //   setTempFrom(from);
  //   setTempTo(to);
  //   if (from) setViewDate(new Date(from + "T00:00:00"));
  // };




    const handleApplyPreset = (type) => {
    const now = new Date();
    let from = "";
    let to = todayStr();

    if (type === "today") {
      from = todayStr();
      to = todayStr();
    } else if (type === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      from = toLocalDateStr(y);
      to = from;
    } else if (type === "last7") {
      const f = new Date();
      f.setDate(now.getDate() - 6);
      from = toLocalDateStr(f);
      to = todayStr();
    } else if (type === "last30") {
      const f = new Date();
      f.setDate(now.getDate() - 29);
      from = toLocalDateStr(f);
      to = todayStr();
    } else if (type === "thisMonth") {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      from = toLocalDateStr(f);
      to = todayStr();
    } else if (type === "lastMonth") {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0);
      from = toLocalDateStr(f);
      to = toLocalDateStr(t);
    }

    setTempFrom(from);
    setTempTo(to);
    if (from) setViewDate(new Date(from + "T00:00:00"));
  };

  const handleClear = () => {
    setTempFrom("");
    setTempTo("");
    setDateFrom("");
    setDateTo("");
    setOpen(false);
  };

  const handleApply = () => {
    setDateFrom(tempFrom);
    setDateTo(tempTo);
    setOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDateClick = (dayNum) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    if (dStr > todayStr()) return;

    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(dStr);
      setTempTo("");
    } else if (tempFrom && !tempTo) {
      if (dStr < tempFrom) {
        setTempFrom(dStr);
        setTempTo(tempFrom);
      } else {
        setTempTo(dStr);
      }
    }
  };

  const getDayStatus = (dayNum) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const isStart = dStr === tempFrom;
    const isEnd = dStr === tempTo;
    const isInRange = tempFrom && tempTo && dStr > tempFrom && dStr < tempTo;
    const isToday = dStr === todayStr();
    return { isStart, isEnd, isInRange, isToday, dStr };
  };

  const today = todayStr();

  return (
    <div className="cdr-wrap" ref={ref}>
      <button
        type="button"
        className={`cdr-trigger-btn${hasRange ? " active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="cdr-trigger-text">{triggerLabel}</span>
        {hasRange && (
          <span
            className="cdr-trigger-clear"
            title="Clear date filter"
            onClick={e => { e.stopPropagation(); handleClear(); }}
          >
            ×
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="cdr-backdrop" onClick={() => setOpen(false)} />
          <div className="cdr-popover" onClick={e => e.stopPropagation()}>
            <div className="cdr-presets-header">
              <span className="cdr-presets-title">Quick Presets:</span>
              <div className="cdr-presets-chips">
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "last7", label: "Last 7D" },
                  { id: "last30", label: "Last 30D" },
                  { id: "thisMonth", label: "This Month" },
                  { id: "lastMonth", label: "Last Month" },
                ].map(p => (
                  <button
                    type="button"
                    key={p.id}
                    className="cdr-preset-chip"
                    onClick={() => handleApplyPreset(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="cdr-range-inputs">
              <div className="cdr-input-box">
                <label>From</label>
                <input
                  type="text"
                  readOnly
                  value={fmtLabel(tempFrom) || "Start"}
                  className={tempFrom ? "filled" : ""}
                />
              </div>
              <div className="cdr-range-arrow">→</div>
              <div className="cdr-input-box">
                <label>To</label>
                <input
                  type="text"
                  readOnly
                  value={fmtLabel(tempTo) || "End"}
                  className={tempTo ? "filled" : ""}
                />
              </div>
            </div>

            <div className="cdr-calendar">
              <div className="cdr-cal-header">
                <button type="button" className="cdr-cal-nav" onClick={prevMonth}>‹</button>
                <span className="cdr-cal-title">{monthNames[month]} {year}</span>
                <button type="button" className="cdr-cal-nav" onClick={nextMonth}>›</button>
              </div>

              <div className="cdr-cal-grid">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className="cdr-cal-day-head">{d}</div>
                ))}

                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="cdr-cal-day empty" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const { isStart, isEnd, isInRange, isToday, dStr } = getDayStatus(dayNum);
                  const isFuture = dStr > today;

                  let cls = "cdr-cal-day";
                  if (isStart) cls += " start";
                  if (isEnd) cls += " end";
                  if (isInRange) cls += " in-range";
                  if (isToday) cls += " today";
                  if (isFuture) cls += " future";

                  return (
                    <button
                      type="button"
                      key={dayNum}
                      className={cls}
                      disabled={isFuture}
                      onClick={() => !isFuture && handleDateClick(dayNum)}
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cdr-footer">
              <button type="button" className="cdr-btn-clear" onClick={handleClear}>Clear</button>
              <div className="cdr-footer-right">
                <button type="button" className="cdr-btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className="cdr-btn-apply" onClick={handleApply}>Apply</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Balance Cell with Tooltip / Responsive Breakdown ────────────── */
function BalanceCell({ inv, isCard = false }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const fin = getInvoiceFinancials(inv);
  const { grandTotal, advance: advanceAmt, manualPaid: manualPaidAmt, paid: paidAmt, balanceDue, totalPaidSoFar: paidSoFar } = fin;
  const currency = inv.invoice_currency || inv.currency;
  const settle = inv.settlement_status || (balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");

  const tooltipContent = (
    <div style={{
      position: "fixed",
      top: Math.max(10, Math.min(window.innerHeight - 240, pos.y - 8)),
      left: Math.max(10, Math.min(window.innerWidth - 240, pos.x + 10)),
      transform: "translateY(-100%)",
      background: "#1F2937", color: "#fff",
      borderRadius: 10, padding: "12px 14px",
      width: 230, zIndex: 99999,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      fontSize: 12, pointerEvents: "none",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12.5, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6 }}>
         Payment Breakdown
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>Grand Total</span>
        <span style={{ fontWeight: 700 }}>{fmt(grandTotal, currency)}</span>
      </div>
      {advanceAmt > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>Advance Paid</span>
          <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(advanceAmt, currency)}</span>
        </div>
      )}
      {manualPaidAmt > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>Payment (Manual)</span>
          <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(manualPaidAmt, currency)}</span>
        </div>
      )}
      {paidAmt > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>Payment Recorded</span>
          <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(paidAmt, currency)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>Total Paid</span>
        <span style={{ fontWeight: 700, color: "#4ADE80" }}>{fmt(paidSoFar, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>Balance Due</span>
        <span style={{ fontWeight: 800, color: balanceDue <= 0 ? "#4ADE80" : "#F87171" }}>{fmt(balanceDue, currency)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: isCard ? "flex-start" : "flex-end", width: "100%" }}>
      {balanceDue <= 0 ? (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#F0FDF4", color: "#16A34A",
          border: "1px solid #BBF7D0",
          borderRadius: 6, padding: "3px 8px",
          fontSize: 11.5, fontWeight: 700,
        }}>
          ✓ Settled
        </span>
      ) : (
        <span style={{ fontWeight: 700, color: settle === "overdue" ? "#DC2626" : "#111827", fontSize: isCard ? 14 : 13 }}>
          {fmt(balanceDue, currency)}
        </span>
      )}

      <span
        onMouseEnter={e => { setPos({ x: e.clientX, y: e.clientY }); setShow(true); }}
        onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setShow(false)}
        onClick={e => {
          e.stopPropagation();
          setPos({ x: e.clientX, y: e.clientY });
          setShow(s => !s);
        }}
        style={{
          width: 17, height: 17, borderRadius: "50%",
          background: "#EAF1FD", color: "#4584E5",
          fontSize: 10, fontWeight: 800, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, userSelect: "none",
        }}
      >i</span>

      {show && typeof document !== "undefined" && ReactDOM.createPortal(tooltipContent, document.body)}
    </div>
  );
}

/* ─── Main ListInvoice Component ─────────────────────────────────── */
export default function ListInvoice() {
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();
  const { can } = useAccess();
const canCreate = can("invoice", "create");
const canUpdate = can("invoice", "update");
const canExport = can("invoice", "export");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryTab, setCategoryTab] = useState("all");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState(searchParams.get("department_id") || "all");
  const [settlementFilter, setSettlementFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    api.get("/invoices/")
      .then(r => {
        const list = r.data?.data || r.data || [];
        setInvoices(Array.isArray(list) ? list : []);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, []);

  // Quick spinner/loading trigger on search & filter change
  useEffect(() => {
    setFiltering(true);
    const t = setTimeout(() => setFiltering(false), 240);
    return () => clearTimeout(t);
  }, [search, activeTab,  categoryTab,deptFilter, settlementFilter, dateFrom, dateTo]);

  const departments = Array.from(
    new Map(
      invoices
        .filter(inv => inv.department_data?.department_id)
        .map(inv => [inv.department_data.department_id, inv.department_data.department_name])
    )
  );

  // const filtered = useMemo(() => {
  //   return invoices.filter(inv => {
  //     const matchTab = activeTab === "all" || inv.status === activeTab;
  //     const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || "";
  //     const matchSearch = !search ||
  //       (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
  //       customerName.toLowerCase().includes(search.toLowerCase());
  //     const matchDept =
  //       deptFilter === "all" ? true
  //       : deptFilter === "__none__" ? !inv.department_data
  //       : inv.department_data?.department_id === deptFilter;
  //     const settle = inv.settlement_status || (getInvoiceFinancials(inv).balanceDue <= 0 ? "setteled" : getInvoiceFinancials(inv).isOverdue ? "overdue" : "pending");
  //     const matchSettlement = settlementFilter === "all" ? true : settle === settlementFilter;
  //     const matchDate = inDateRange(inv.invoice_date, dateFrom, dateTo);

  //     return matchTab && matchSearch && matchDept && matchSettlement && matchDate;
  //   });
  // }, [invoices, activeTab, search, deptFilter, settlementFilter, dateFrom, dateTo]);




  // everything except the category tab
const baseFiltered = useMemo(() => {
  return invoices.filter(inv => {
    const matchTab = activeTab === "all" || inv.status === activeTab;
    const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || "";
    const matchSearch = !search ||
      (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      deptFilter === "all" ? true
      : deptFilter === "__none__" ? !inv.department_data
      : inv.department_data?.department_id === deptFilter;
    const fin = getInvoiceFinancials(inv);
    const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
    const matchSettlement = settlementFilter === "all" ? true : settle === settlementFilter;
    const matchDate = inDateRange(inv.invoice_date, dateFrom, dateTo);
    return matchTab && matchSearch && matchDept && matchSettlement && matchDate;
  });
}, [invoices, activeTab, search, deptFilter, settlementFilter, dateFrom, dateTo]);

const filtered = useMemo(() => {
  if (categoryTab === "rooms") return baseFiltered.filter(isRoom);
  if (categoryTab === "standard") return baseFiltered.filter(inv => !isRoom(inv));
  return baseFiltered;
}, [baseFiltered, categoryTab]);

const categoryCounts = useMemo(() => {
  const rooms = baseFiltered.filter(isRoom).length;
  return { all: baseFiltered.length, rooms, standard: baseFiltered.length - rooms };
}, [baseFiltered]);

const emptyMsg =
  categoryTab === "rooms" ? "No room invoices match the current filters"
  : categoryTab === "standard" ? "No standard invoices match the current filters"
  : "No invoices match the current filter criteria";

  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let overdue = 0;
    let drafts = 0;
    let totalPaid = 0;
    let grandTotalSum = 0;
    let balanceSum = 0;

    filtered.forEach(inv => {
      const fin = getInvoiceFinancials(inv);
      grandTotalSum += fin.grandTotal;
      balanceSum += fin.balanceDue;
      totalPaid += fin.totalPaidSoFar;
      
      if (fin.balanceDue > 0) totalOutstanding += fin.balanceDue;
      if (fin.isOverdue) overdue += fin.balanceDue;
      if (inv.status === "draft") drafts += 1;
    });

    return { totalOutstanding, overdue, drafts, totalPaid, grandTotalSum, balanceSum };
  }, [filtered]);



  /* ─── Payment Modal ──────────────────────────────────────────────── */
function PaymentModal({ invoice, onClose, onSaved, pushToast }) {
  const fin = getInvoiceFinancials(invoice);
  const { grandTotal, advance: advanceAmt, manualPaid: manualPaidAmt, balanceDue, totalPaidSoFar: paidSoFar } = fin;

  const [amount, setAmount]   = useState("");
  const [method, setMethod]   = useState(PAYMENT_METHODS[0]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const amtNum = parseFloat(amount) || 0;
  const isOver = amtNum > balanceDue;
  const isZero = amtNum <= 0;
  const isFullPay = Math.abs(amtNum - balanceDue) < 0.01;

  const handleSave = async () => {
    if (isZero)  { setError("Please enter a valid amount."); return; }
    if (isOver)  { setError(`Amount cannot exceed balance due (${fmt(balanceDue, invoice.invoice_currency || invoice.currency)}).`); return; }
    setSaving(true);
    setError("");
    try {
      await api.put("/invoices/update_payment", {
        invoice_number: invoice.invoice_number,
        amount: amtNum,
        payment_method: method,
      });
      pushToast(
        isFullPay
          ? `Invoice #${invoice.invoice_number} fully settled! 🎉`
          : `Payment of ${fmt(amtNum, invoice.invoice_currency || invoice.currency)} recorded successfully.`,
        "success"
      );
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not record payment.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const customerName = invoice.customer_data?.name || invoice.customer_data?.customer_name || "Customer";
  const currency = invoice.invoice_currency || invoice.currency;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000, padding: 16, backdropFilter: "blur(2px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        overflow: "hidden", fontFamily: "'Lato', sans-serif",
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          background: "linear-gradient(135deg, #4584E5 0%, #3568C4 100%)",
          padding: "20px 22px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="#fff" strokeWidth="1.8"/>
                    <path d="M2 10h20" stroke="#fff" strokeWidth="1.8"/>
                    <path d="M6 14.5h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>Record Payment</p>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.75)" }}>
                Invoice #{invoice.invoice_number} · {customerName}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
              width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", fontSize: 18, lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "18px 22px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[
              { label: "Grand Total",   value: fmt(grandTotal, currency),  color: "#111827" },
              { label: "Paid So Far",   value: fmt(paidSoFar, currency),    color: "#16A34A" },
              { label: "Balance Due",   value: fmt(balanceDue, currency),   color: "#DC2626" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#F8F9FC", borderRadius: 10, padding: "10px 12px",
                border: "1px solid #E9EBF1", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9AA1AF", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>

          {(advanceAmt > 0 || manualPaidAmt > 0) && (
            <div style={{
              background: "#F8F9FC", border: "1px solid #E9EBF1", borderRadius: 10,
              padding: "10px 12px", marginBottom: 18, fontSize: 12,
            }}>
              {advanceAmt > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "#6B7280" }}>Advance Paid</span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>{fmt(advanceAmt, currency)}</span>
                </div>
              )}
              {manualPaidAmt > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "#6B7280" }}>Payment Made (Manual)</span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>{fmt(manualPaidAmt, currency)}</span>
                </div>
              )}
            </div>
          )}

          {balanceDue > 0 && grandTotal > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9AA1AF", marginBottom: 5 }}>
                <span>Payment progress</span>
                <span style={{ fontWeight: 700, color: "#4584E5" }}>{Math.round((paidSoFar / grandTotal) * 100)}% paid</span>
              </div>
              <div style={{ height: 6, background: "#E9EBF1", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: "linear-gradient(90deg, #4584E5, #3568C4)",
                  width: `${Math.min(100, Math.max(0, (paidSoFar / grandTotal) * 100))}%`,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{
              fontSize: 11.5, fontWeight: 700, color: "#374151",
              textTransform: "uppercase", letterSpacing: "0.4px",
              marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>Amount to Pay</span>
              <button onClick={() => { setAmount(balanceDue.toFixed(2)); setError(""); }}
                style={{
                  background: "#EAF1FD", border: "none", borderRadius: 6,
                  padding: "3px 9px", fontSize: 11, fontWeight: 700,
                  color: "#4584E5", cursor: "pointer",
                }}>Pay Full</button>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 15, fontWeight: 300, color: "#6B7280",
              }}>₹</span>
              <input
                type="number" min="0" step="0.01"
                value={amount}
                placeholder="Enter Payment Amount"
                onChange={e => { setAmount(e.target.value); setError(""); }}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1.5px solid ${isOver ? "#DC2626" : error && isZero ? "#DC2626" : "#E9EBF1"}`,
                  borderRadius: 10, padding: "11px 12px 11px 28px",
                  fontSize: 14, fontWeight: 300, color: "#111827", outline: "none",
                  background: isOver ? "#FEF2F2" : "#fff",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { if (!isOver) e.target.style.borderColor = "#4584E5"; }}
                onBlur={e => { if (!isOver) e.target.style.borderColor = "#E9EBF1"; }}
              />
            </div>

            {amtNum > 0 && !isOver && (
              <div style={{
                marginTop: 6, fontSize: 11.5, color: "#6B7280",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {isFullPay ? (
                  <span style={{ color: "#16A34A", fontWeight: 700 }}>✓ This will fully settle the invoice</span>
                ) : (
                  <span>
                    After this payment, <b style={{ color: "#DC2626" }}>{fmt(balanceDue - amtNum, invoice.currency)}</b> will remain.
                  </span>
                )}
              </div>
            )}
            {isOver && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#DC2626", fontWeight: 600 }}>
                ⚠ Amount exceeds balance due of {fmt(balanceDue, invoice.currency)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              fontSize: 11.5, fontWeight: 700, color: "#374151",
              textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 7, display: "block",
            }}>Payment Method</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${method === m ? "#4584E5" : "#E9EBF1"}`,
                  background: method === m ? "#EAF1FD" : "#fff",
                  color: method === m ? "#3568C4" : "#6B7280",
                  transition: "all 0.15s",
                }}>{m}</button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
              padding: "10px 13px", marginBottom: 14,
              fontSize: 12.5, color: "#DC2626", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>⚠</span> {error}
            </div>
          )}
        </div>

        <div style={{
          padding: "14px 22px 20px",
          display: "flex", gap: 10, justifyContent: "flex-end",
          borderTop: "1px solid #F1F2F6",
        }}>
          <button onClick={onClose} disabled={saving} style={{
            padding: "10px 20px", borderRadius: 10, border: "1px solid #E9EBF1",
            background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || isOver || isZero} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: (saving || isOver || isZero) ? "#A5B4C8" : "linear-gradient(135deg, #4584E5, #3568C4)",
            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: (saving || isOver || isZero) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
            boxShadow: (saving || isOver || isZero) ? "none" : "0 2px 8px rgba(69,132,229,0.35)",
          }}>
            {saving ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                Saving…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Record Payment
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

  const TABS = ["all", "draft", "sent"];
  const activeFilterCount = (activeTab !== "all" ? 1 : 0) + (deptFilter !== "all" ? 1 : 0) + (settlementFilter !== "all" ? 1 : 0);

  useEffect(() => { setCurrentPage(1); }, [activeTab,categoryTab, search, deptFilter, settlementFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Vector Multi-Page PDF Generation */
  const handleDownloadPdf = async () => {
    if (filtered.length === 0) {
      push("No invoices match the current filters.", "error");
      return;
    }
    setPdfGenerating(true);
    // push(`Generating PDF report for ${filtered.length} invoice(s)…`, "success");

    try {
      const { jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;

      const darkTextColor = [17, 24, 39];
      const mutedTextColor = [107, 114, 128];
      
      let currentY = margin;

      const drawDocumentHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...darkTextColor);
        doc.text("INVOICE FINANCIAL REPORT", margin, currentY + 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...mutedTextColor);
        const nowStr = new Date().toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true
        });
        doc.text(`Generated: ${nowStr}`, pageWidth - margin, currentY + 16, { align: "right" });
        currentY += 22;

        let rangeText = "Date Filter: All Invoices";
        if (dateFrom || dateTo) {
          rangeText = `Date Range: ${fmtLabel(dateFrom) || "Beginning"} — ${fmtLabel(dateTo) || "Present"}`;
        }
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(53, 104, 196);
        doc.text(rangeText, margin, currentY + 14);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedTextColor);
        doc.text(`Total Records: ${filtered.length} invoice(s)`, pageWidth - margin, currentY + 14, { align: "right" });
        currentY += 24;

        doc.setFillColor(69, 132, 229);
        doc.rect(margin, currentY, contentWidth, 3.5, "F");
        currentY += 16;

        const cardGap = 10;
        const cardWidth = (contentWidth - cardGap * 3) / 4;
        const cardHeight = 44;

        const statItems = [
          { label: "TOTAL OUTSTANDING", val: fmtPdf(stats.totalOutstanding), color: [69, 132, 229] },
          { label: "OVERDUE AMOUNT", val: fmtPdf(stats.overdue), color: [220, 38, 38] },
          { label: "DRAFTS PENDING", val: `${stats.drafts}`, color: [107, 114, 128] },
          { label: "TOTAL PAID", val: fmtPdf(stats.totalPaid), color: [22, 163, 74] },
        ];

        statItems.forEach((st, idx) => {
          const x = margin + idx * (cardWidth + cardGap);
          doc.setFillColor(250, 251, 253);
          doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, "F");
          doc.setFillColor(...st.color);
          doc.roundedRect(x, currentY, 3.5, cardHeight, 1.5, 1.5, "F");
          doc.setDrawColor(233, 235, 241);
          doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, "S");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(...mutedTextColor);
          doc.text(st.label, x + 10, currentY + 14);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11.5);
          doc.setTextColor(...darkTextColor);
          doc.text(st.val, x + 10, currentY + 31);
        });

        currentY += cardHeight + 16;
      };

      const cols = [
        { header: "INVOICE #", width: 80, align: "left" },
        { header: "GUEST", width: 130, align: "left" },
        { header: "DEPARTMENT", width: 95, align: "left" },
        { header: "ISSUE DATE", width: 75, align: "left" },
        { header: "DUE DATE", width: 75, align: "left" },
        { header: "AMOUNT", width: 90, align: "right" },
        { header: "BALANCE DUE", width: 95, align: "right" },
        { header: "STATUS", width: 65, align: "center" },
        { header: "PAYMENT", width: 75, align: "center" },
      ];

      const drawTableHeader = () => {
        const headerHeight = 22;
        doc.setFillColor(31, 41, 55);
        doc.rect(margin, currentY, contentWidth, headerHeight, "F");

        let curX = margin;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);

        cols.forEach(col => {
          let posX = curX + 8;
          if (col.align === "right") posX = curX + col.width - 8;
          if (col.align === "center") posX = curX + col.width / 2;
          doc.text(col.header, posX, currentY + 14, { align: col.align });
          curX += col.width;
        });

        currentY += headerHeight;
      };

      drawDocumentHeader();
      drawTableHeader();

      const rowHeight = 20;

      filtered.forEach((inv, index) => {
        if (currentY + rowHeight > pageHeight - 35) {
          doc.addPage();
          currentY = margin;
          drawTableHeader();
        }

        const fin = getInvoiceFinancials(inv);
        const isEven = index % 2 === 0;

        if (!isEven) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, currentY, contentWidth, rowHeight, "F");
        }

        doc.setDrawColor(241, 242, 246);
        doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

        const invNum = `#${inv.invoice_number || (inv.invoice_id || inv.id || "").slice(0, 8)}`;
        const customer = (inv.customer_data?.name || inv.customer_data?.customer_name || "—").slice(0, 22);
        const dept = (inv.department_data?.department_name || "—").slice(0, 16);
        const issueDt = inv.invoice_date ? new Date(extractDate(inv.invoice_date)).toLocaleDateString("en-IN") : "—";
        const dueDt = inv.due_date ? new Date(extractDate(inv.due_date)).toLocaleDateString("en-IN") : "—";
        const amtStr = fmtPdf(fin.grandTotal);
        const balStr = fin.balanceDue <= 0 ? "No Balance" : fmtPdf(fin.balanceDue);
        const statusStr = (inv.status || "draft").toUpperCase();
        
        const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
        const settleStr = settle === "setteled" ? "SETTLED" : settle === "overdue" ? "OVERDUE" : "PENDING";

        let curX = margin;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(69, 132, 229);
        doc.text(invNum, curX + 8, currentY + 13);
        curX += cols[0].width;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...darkTextColor);
        doc.text(customer, curX + 8, currentY + 13);
        curX += cols[1].width;

        doc.setTextColor(...mutedTextColor);
        doc.text(dept, curX + 8, currentY + 13);
        curX += cols[2].width;

        doc.setTextColor(...darkTextColor);
        doc.text(issueDt, curX + 8, currentY + 13);
        curX += cols[3].width;
        doc.text(dueDt, curX + 8, currentY + 13);
        curX += cols[4].width;

        doc.setFont("helvetica", "bold");
        doc.text(amtStr, curX + cols[5].width - 8, currentY + 13, { align: "right" });
        curX += cols[5].width;

        if (fin.balanceDue <= 0) doc.setTextColor(22, 163, 74);
        else doc.setTextColor(220, 38, 38);
        doc.text(balStr, curX + cols[6].width - 8, currentY + 13, { align: "right" });
        curX += cols[6].width;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        if (statusStr === "PAID") doc.setTextColor(22, 163, 74);
        else if (statusStr === "SENT") doc.setTextColor(37, 99, 235);
        else doc.setTextColor(107, 114, 128);
        doc.text(statusStr, curX + cols[7].width / 2, currentY + 13, { align: "center" });
        curX += cols[7].width;

        if (settleStr === "SETTLED") doc.setTextColor(22, 163, 74);
        else if (settleStr === "OVERDUE") doc.setTextColor(220, 38, 38);
        else doc.setTextColor(180, 83, 9);
        doc.text(settleStr, curX + cols[8].width / 2, currentY + 13, { align: "center" });

        currentY += rowHeight;
      });

      if (currentY + 24 > pageHeight - 35) {
        doc.addPage();
        currentY = margin;
      }
      
      const totalRowHeight = 22;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, contentWidth, totalRowHeight, "F");
      doc.setDrawColor(31, 41, 55);
      doc.setLineWidth(1);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      doc.line(margin, currentY + totalRowHeight, pageWidth - margin, currentY + totalRowHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkTextColor);
      doc.text("TOTALS", margin + 8, currentY + 15);

      const amtColX = margin + cols[0].width + cols[1].width + cols[2].width + cols[3].width + cols[4].width;
      const balColX = amtColX + cols[5].width;

      doc.text(fmtPdf(stats.grandTotalSum), amtColX + cols[5].width - 8, currentY + 15, { align: "right" });
      doc.setTextColor(220, 38, 38);
      doc.text(fmtPdf(stats.balanceSum), balColX + cols[6].width - 8, currentY + 15, { align: "right" });

      const totalPagesNum = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPagesNum; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...mutedTextColor);
        doc.text(`Page ${p} of ${totalPagesNum}`, pageWidth - margin, pageHeight - 12, { align: "right" });
        doc.text(`Invoice Report — Confidential`, margin, pageHeight - 12);
      }

      const fname = `Invoice_Report_${dateFrom || "All"}_to_${dateTo || "All"}.pdf`;
      doc.save(fname);
      push(`PDF downloaded (${filtered.length} invoices across ${totalPagesNum} page(s)).`, "success");
    } catch (err) {
      console.error("PDF Export Error:", err);
      push("Could not generate PDF. Check console for details.", "error");
    } finally {
      setPdfGenerating(false);
    }
  };

  const showLoading = loading || filtering;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;800&display=swap" />
      <style>{`
        :root {
          --c-primary: #4584E5;
          --c-primary-dark: #3568C4;
          --c-primary-light: #EAF1FD;
          --c-accent-row-hover: #F7FAFF;
          --c-border: #E9EBF1;
        }
        * { font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-sizing: border-box; }
        
        .li-wrap {
          padding: 24px 28px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Top Header ── */
        .li-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .li-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .li-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
        .li-count-badge {
          background: #F1F5F9; color: #64748B; font-weight: 700;
          font-size: 13px; padding: 2px 8px; border-radius: 999px;
        }

        /* ── Download PDF Button (Beside Title) ── */
        .li-pdf-title-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          background: #fff; color: var(--c-primary);
          border: 1px solid var(--c-border); font-size: 12.5px; font-weight: 700;
          cursor: pointer; transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          height: 34px;
        }
        .li-pdf-title-btn:hover:not(:disabled) {
          border-color: var(--c-primary);
          background: var(--c-primary-light);
          color: var(--c-primary-dark);
        }
        .li-pdf-title-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .li-pdf-spinner {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid #CBD5E1; border-top-color: var(--c-primary);
          animation: spin 0.7s linear infinite;
        }

        .li-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Buttons & Actions */
        .li-new-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; background: var(--c-primary); color: #fff;
          border: none; border-radius: 8px; padding: 9px 16px;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          transition: background 0.15s;
          box-shadow: 0 1px 3px rgba(69,132,229,0.3);
          height: 38px;
        }
        .li-new-btn:hover { background: var(--c-primary-dark); }

        .li-filter-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid var(--c-border); background: #fff;
          color: #374151; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; position: relative;
          height: 38px;
        }
        .li-filter-btn.active {
          border-color: var(--c-primary); background: var(--c-primary-light);
          color: var(--c-primary-dark);
        }
        .li-filter-count {
          background: var(--c-primary); color: #fff; font-size: 10px;
          font-weight: 700; padding: 1px 6px; border-radius: 999px;
        }

        .li-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .li-search {
          border: 1px solid var(--c-border); border-radius: 8px;
          padding: 8px 30px 8px 34px; font-size: 13px; outline: none;
          width: 220px; height: 38px;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%238A93A6' stroke-width='2'/%3E%3Cpath d='m21 21-4.35-4.35' stroke='%238A93A6' stroke-width='2'/%3E%3C/svg%3E") 10px center no-repeat;
          transition: border-color 0.15s;
        }
        .li-search:focus { border-color: var(--c-primary); }
        .li-search-spinner {
          position: absolute; right: 10px; width: 14px; height: 14px;
          border: 2px solid #E2E8F0; border-top-color: var(--c-primary);
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }

        /* ── Date Range Trigger ── */
        .cdr-wrap { position: relative; }
        .cdr-trigger-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid var(--c-border); background: #fff;
          color: #374151; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          height: 38px;
        }
        .cdr-trigger-btn:hover { border-color: var(--c-primary); background: #F8FAFC; }
        .cdr-trigger-btn.active {
          border-color: var(--c-primary); background: var(--c-primary-light); color: var(--c-primary-dark);
          font-weight: 700;
        }
        .cdr-trigger-text { white-space: nowrap; }
        .cdr-trigger-clear {
          margin-left: 2px; font-size: 15px; font-weight: 700;
          line-height: 1; color: #9AA1AF; border-radius: 50%;
          width: 18px; height: 18px; display: inline-flex;
          align-items: center; justify-content: center;
          transition: all 0.15s ease;
        }
        .cdr-trigger-clear:hover { background: #FEE2E2; color: #DC2626; }

        .cdr-popover {
          position: absolute; top: 46px; left: 0;
          background: #fff; border-radius: 14px;
          border: 1px solid #E9EBF1;
          box-shadow: 0 16px 40px rgba(15,23,42,0.16);
          width: 320px; padding: 16px; z-index: 1000;
          animation: cdrPopIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cdrPopIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .cdr-presets-header { margin-bottom: 12px; }
        .cdr-presets-title { font-size: 10.5px; font-weight: 800; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
        .cdr-presets-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .cdr-preset-chip {
          padding: 4px 8px; border-radius: 6px;
          border: 1px solid #E9EBF1; background: #F8F9FC;
          font-size: 11.5px; font-weight: 600; color: #475569;
          cursor: pointer; transition: all 0.12s ease;
        }
        .cdr-preset-chip:hover { border-color: #4584E5; background: #EAF1FD; color: #3568C4; }

        .cdr-range-inputs { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; background: #F8F9FC; padding: 8px 10px; border-radius: 8px; border: 1px solid #E9EBF1; }
        .cdr-input-box { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .cdr-input-box label { font-size: 9.5px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; }
        .cdr-input-box input { border: none; background: transparent; font-size: 12px; font-weight: 700; color: #9AA1AF; outline: none; padding: 0; }
        .cdr-input-box input.filled { color: #111827; }
        .cdr-range-arrow { color: #9AA1AF; font-size: 13px; font-weight: 700; }

        .cdr-calendar { margin-bottom: 12px; }
        .cdr-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .cdr-cal-title { font-size: 13px; font-weight: 800; color: #111827; }
        .cdr-cal-nav { background: #F1F5F9; border: none; border-radius: 6px; width: 28px; height: 28px; font-size: 15px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .cdr-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
        .cdr-cal-day-head { font-size: 10px; font-weight: 700; color: #9AA1AF; padding-bottom: 6px; }
        .cdr-cal-day {
          aspect-ratio: 1; border: none; background: transparent;
          font-size: 12px; font-weight: 600; color: #334155;
          border-radius: 50%; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          position: relative; margin: auto; width: 30px; height: 30px;
        }
        .cdr-cal-day:hover:not(.empty):not(.future) { background: #EAF1FD; color: #3568C4; }
        .cdr-cal-day.today { font-weight: 800; color: #4584E5; text-decoration: underline; }
        .cdr-cal-day.start, .cdr-cal-day.end { background: #4584E5 !important; color: #fff !important; font-weight: 800; border-radius: 50%; }
        .cdr-cal-day.in-range { background: #EAF1FD !important; color: #3568C4 !important; border-radius: 0; width: 100%; }
        .cdr-cal-day.future { opacity: 0.35; color: #94A3B8 !important; cursor: not-allowed !important; background: transparent !important; }

        .cdr-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F1F2F6; }
        .cdr-footer-right { display: flex; gap: 6px; }
        .cdr-btn-clear { background: none; border: none; color: #DC2626; font-size: 12px; font-weight: 700; cursor: pointer; padding: 6px 8px; }
        .cdr-btn-cancel { background: #F1F5F9; border: none; border-radius: 8px; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; }
        .cdr-btn-apply { background: linear-gradient(135deg, #4584E5, #3568C4); border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; }

        /* ── Stats Grid ── */
        .li-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .li-stat {
          background: #fff; border: 1px solid var(--c-border);
          border-radius: 12px; padding: 14px 16px;
          position: relative; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .li-stat::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3.5px; background: var(--c-primary); }
        .li-stat.red::before { background: #DC2626; }
        .li-stat-label { font-size: 10.5px; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 700; }
        .li-stat-value { font-size: 20px; font-weight: 800; color: #111827; }
        .li-stat-value.red { color: #DC2626; }

        /* ── Custom Select Component ── */
        .c-select-wrapper { position: relative; width: 100%; }
        .c-select-trigger {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 9px 12px; background: #fff; border: 1.5px solid var(--c-border);
          border-radius: 9px; font-size: 13px; font-weight: 600; color: #374151;
          cursor: pointer; transition: all 0.15s ease;
        }
        .c-select-trigger:hover, .c-select-trigger.open {
          border-color: var(--c-primary);
        }
        .c-select-trigger.open { box-shadow: 0 0 0 3px rgba(69,132,229,0.12); }
        .c-select-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .c-select-chevron { color: #9AA1AF; transition: transform 0.2s ease; flex-shrink: 0; }
        .c-select-chevron.rotate { transform: rotate(180deg); color: var(--c-primary); }
        
        .c-select-menu {
          position: absolute; top: calc(100% + 5px); left: 0; right: 0;
          background: #fff; border: 1px solid #E2E8F0; border-radius: 10px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          max-height: 210px; overflow-y: auto; z-index: 1200;
          padding: 5px;
          animation: cdrPopIn 0.15s ease;
        }
        .c-select-option {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600;
          color: #475569; cursor: pointer; transition: background 0.1s;
        }
        .c-select-option:hover { background: #F1F5F9; color: #0F172A; }
        .c-select-option.selected { background: var(--c-primary-light); color: var(--c-primary-dark); font-weight: 700; }

        /* ── Filter Popover ── */
        .li-filter-pop-wrap { position: relative; }
        .li-filter-pop {
          position: absolute; top: 46px; right: 0;
          background: #fff; border-radius: 14px; border: 1px solid var(--c-border);
          box-shadow: 0 16px 40px rgba(17,24,39,0.18);
          width: 320px; padding: 18px; z-index: 1050;
        }
        .li-filter-pop-header { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 14px; }
        .li-filter-pop-clear { background: none; border: none; color: var(--c-primary); font-size: 12px; font-weight: 700; cursor: pointer; }
        .li-filter-pop-clear:hover { text-decoration: underline; }
        .li-filter-pop-close { background: none; border: none; font-size: 19px; color: #9AA1AF; cursor: pointer; line-height: 1; }
        .li-filter-pop-group { margin-bottom: 14px; }
        .li-filter-pop-group:last-child { margin-bottom: 0; }
        .li-filter-pop-label { font-size: 11px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .li-filter-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .li-filter-chip { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--c-border); background: #fff; font-size: 12px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s; }
        .li-filter-chip.active { background: var(--c-primary); border-color: var(--c-primary); color: #fff; }
        .li-filter-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid #F1F2F6; }
        .li-filter-apply-btn { width: 100%; padding: 9px; border-radius: 8px; background: linear-gradient(135deg, #4584E5, #3568C4); color: #fff; font-weight: 700; border: none; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(69,132,229,0.3); }

        /* ── Table Layout (Desktop) ── */
        .li-table-wrap {
          background: #fff; border: 1px solid var(--c-border);
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          position: relative;
        }
        .li-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { width: 100%; border-collapse: collapse; min-width: 1180px; table-layout: fixed; }
        thead th { padding: 12px 14px; font-size: 10.5px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; letter-spacing: 0.4px; background: #F8F9FC; border-bottom: 1px solid var(--c-border); white-space: nowrap; text-align: left; }
        tbody td { padding: 13px 14px; font-size: 13.5px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; }
        tbody tr { border-bottom: 1px solid #F1F2F6; cursor: pointer; transition: background 0.12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--c-accent-row-hover); }
        .li-inv-num { color: var(--c-primary); font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 5px; }
        .li-inv-num:hover { text-decoration: underline; }
        .li-customer { display: flex; align-items: center; gap: 8px; }
        .li-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--c-primary-light); color: var(--c-primary-dark); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .li-amount { font-weight: 700; color: #111827; }
        .li-badge { display: inline-block; border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .li-dept-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--c-primary-light); color: var(--c-primary-dark); border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700; }
        .li-dept-none { color: #D1D5DB; font-style: italic; font-size: 12px; }

        .li-actions-cell { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .li-pay-icon-btn, .li-action-btn, .li-pay-icon-placeholder {
          width: 30px; height: 30px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 7px; box-sizing: border-box;
        }
        .li-pay-icon-btn { background: none; border: 1px solid #E9EBF1; cursor: pointer; color: #4584E5; transition: all 0.15s; }
        .li-pay-icon-btn:hover { background: #EAF1FD; border-color: #4584E5; }
        .li-action-btn { background: none; border: 1px solid transparent; cursor: pointer; color: #9AA1AF; font-size: 17px; line-height: 1; }
        .li-action-btn:hover { color: var(--c-primary-dark); background: var(--c-primary-light); }
        .li-pay-icon-placeholder { visibility: hidden; border: 1px solid transparent; }

        /* ── Mobile/Tablet Card View ── */
        .li-card-list { display: none; padding: 10px; gap: 10px; flex-direction: column; }
        .li-card-item {
          background: #fff; border: 1px solid var(--c-border);
          border-radius: 12px; padding: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .li-card-item:hover { border-color: #CBD5E1; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .li-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 8px; }
        .li-card-customer { display: flex; align-items: center; gap: 9px; }
        .li-card-cust-name { font-size: 14px; font-weight: 700; color: #111827; }
   .li-card-inv-no {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
  font-size: 12px; font-weight: 700; color: var(--c-primary);
}
  .li-inv-cell { overflow: visible !important; text-overflow: clip !important; }
.li-inv-num { white-space: nowrap; gap: 5px; }
.li-room-badge {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;
  border-radius: 4px; padding: 0 5px;
  font-size: 9.5px; font-weight: 600; line-height: 1.6; white-space: nowrap;
}
        .li-card-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        
        .li-card-mid-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; background: #F8F9FC; border-radius: 8px;
          padding: 10px 12px; margin-bottom: 10px;
        }
        .li-card-mid-cell { display: flex; flex-direction: column; gap: 2px; }
        .li-card-mid-label { font-size: 10px; font-weight: 700; color: #9AA1AF; text-transform: uppercase; }
        .li-card-mid-val { font-size: 13.5px; font-weight: 700; color: #111827; }
        
        .li-card-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 8px; border-top: 1px solid #F1F2F6;
          font-size: 11.5px; color: #6B7280;
        }
        .li-card-pay-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 6px;
          background: var(--c-primary-light); color: var(--c-primary-dark);
          border: 1px solid #C7D8F9; font-size: 12px; font-weight: 700; cursor: pointer;
        }

        /* ── Pagination ── */
        .li-pagination {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; padding: 13px 16px; font-size: 12.5px;
          color: #6B7280; border-top: 1px solid #F1F2F6;
        }
        .li-page-btns { display: flex; gap: 4px; }
        .al-pg { display: flex; align-items: center; gap: 4px; }
        .li-page-btn {
          width: 32px; height: 32px; border-radius: 7px;
          border: 1px solid var(--c-border); background: #fff;
          cursor: pointer; font-size: 12.5px; font-weight: 700;
          color: #374151; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .li-page-btn.active { background: var(--c-primary); color: #fff; border-color: var(--c-primary); }
        .li-page-btn:hover:not(.active):not(:disabled) { border-color: var(--c-primary); color: var(--c-primary-dark); }
        .li-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .li-empty { padding: 48px 20px; text-align: center; color: #9AA1AF; }
        .li-empty svg { opacity: 0.3; margin-bottom: 12px; }
        .li-empty p { font-size: 14px; }
        
        /* Loading Skeleton */
        .li-skeleton { animation: shimmer 1.2s infinite; }
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .li-sk-row td { padding: 14px 14px; }
        .li-sk-bar { height: 13px; border-radius: 6px; background: #EDEFF4; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── TABLET RESPONSIVE (1024px and down) ── */
        @media (max-width: 1024px) {
          .li-wrap { padding: 18px 20px; }
          .li-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .li-stat-value { font-size: 18px; }
          .li-search { width: 170px; }
        }
.li-new-btn { white-space: nowrap; }
        /* ── TABLET & MOBILE SWITCH (860px and down) ── */
        @media (max-width: 860px) {
          .li-table-scroll { display: none; }
          .li-card-list { display: flex; }
.li-header { flex-direction: column; align-items: stretch; gap: 12px; }
.li-title-row { justify-content: flex-start; flex-wrap: wrap; }
.li-header-actions {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) auto auto auto;
  gap: 8px;
  width: 100%;
  align-items: center;
}
.li-search { width: 100%; padding-left: 30px; padding-right: 8px; }

          .cdr-trigger-btn { padding: 8px 10px; }
          .cdr-trigger-text { max-width: 110px; overflow: hidden; text-overflow: ellipsis; }

          .li-filter-backdrop, .cdr-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1020;
          }
          .li-filter-pop {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto;
            width: 100%; border-radius: 20px 20px 0 0;
            padding: 20px; z-index: 1050; max-height: 80vh; overflow-y: auto;
            animation: slideUp 0.2s ease;
          }
          .cdr-popover {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto;
            width: 100%; border-radius: 20px 20px 0 0;
            padding: 20px; z-index: 1050; max-height: 85vh; overflow-y: auto;
            animation: slideUp 0.2s ease;
          }

          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        }

        /* ── MOBILE PHONES (580px and down) ── */
        @media (max-width: 580px) {
          .li-wrap { padding: 12px; }
          .li-title-row { flex-wrap: wrap; }
          .li-header-actions {
            grid-template-columns: 1fr 1fr;
          }
          .li-search-box {
            grid-column: span 2;
          }
          .cdr-trigger-btn { width: 100%; justify-content: center; }
          .li-filter-btn { width: 100%; justify-content: center; }
          .li-new-btn { width: 100%; }

          .li-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
          .li-stat { padding: 10px 12px; }
          .li-stat-value { font-size: 16px; }

          .li-pagination { flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        }


        /* ── Category Tabs ── */
.li-cat-tabs {
  display: inline-flex; gap: 2px; padding: 3px; margin-bottom: 14px;
  background: #fff; border: 1px solid var(--c-border); border-radius: 10px;
}
.li-cat-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: transparent;
  border: 1px solid transparent; border-radius: 7px;
  font-size: 12px; font-weight: 600; color: #6B7280;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.li-cat-tab svg { flex-shrink: 0; }
.li-cat-tab:hover:not(.active) { background: #F8F9FC; color: #111827; }
.li-cat-tab.active {
  background: #fff; color: var(--c-primary-dark); font-weight: 700;
  border-color: var(--c-border); box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.li-cat-count {
  background: #F1F5F9; color: #64748B; font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 999px; line-height: 1.4;
}
.li-cat-tab.active .li-cat-count { background: var(--c-primary-light); color: var(--c-primary-dark); }

/* ── Room Badge ── */
.li-room-badge {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;
  border-radius: 4px; padding: 0 5px; margin-left: 3px;
  font-size: 9.5px; font-weight: 600; line-height: 1.6; white-space: nowrap;
}
.li-card-inv-no { display: inline-flex; align-items: center; gap: 6px; }

@media (max-width: 580px) {
  .li-cat-tabs { display: flex; width: 100%; }
  .li-cat-tab { flex: 1; justify-content: center; padding: 6px 6px; }
}
      `}</style>

      <div className="li-wrap">
        {/* Header with Download Report button right beside the Title */}
        <div className="li-header">
          <div className="li-title-row">
            <h1 className="li-title">All Invoices</h1>
            <span className="li-count-badge">{filtered.length}</span>

            {/* DOWNLOAD BUTTON PLACED NEAR ALL INVOICES TITLE */}
            {canExport && (
            <button
              type="button"
              className="li-pdf-title-btn"
              title={pdfGenerating ? "Generating PDF Report…" : "Download Invoices PDF Report"}
              disabled={pdfGenerating || loading}
              onClick={handleDownloadPdf}
            >
              {pdfGenerating ? (
                <>
                  <div className="li-pdf-spinner" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export PDF</span>
                </>
              )}
            </button>
            )}
          </div>

          <div className="li-header-actions">
            {/* Search Input with inline loader */}
            <div className="li-search-box">
              <input
                className="li-search"
                placeholder="Search invoices, clients…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {filtering && <div className="li-search-spinner" />}
            </div>

            <CustomDateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              setDateFrom={setDateFrom}
              setDateTo={setDateTo}
            />

            <div className="li-filter-pop-wrap">
              <button
                type="button"
                className={`li-filter-btn${activeFilterCount > 0 ? " active" : ""}`}
                onClick={() => setFilterOpen(o => !o)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activeFilterCount > 0 ? "#3568C4" : "#4584E5"} strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filter
                {activeFilterCount > 0 && <span className="li-filter-count">{activeFilterCount}</span>}
              </button>
              <FilterPopover
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                departments={departments}
                deptFilter={deptFilter} setDeptFilter={setDeptFilter}
                settlementFilter={settlementFilter} setSettlementFilter={setSettlementFilter}
                activeTab={activeTab} setActiveTab={setActiveTab} TABS={TABS}
              />
            </div>
{canCreate && (
            <button className="li-new-btn" onClick={() => navigate("/invoices/create")}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
              <span>New</span>
            </button>
            )}
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="li-stats">
          <div className="li-stat">
            <p className="li-stat-label">Total Outstanding</p>
            <p className="li-stat-value">{fmt(stats.totalOutstanding)}</p>
          </div>
          <div className="li-stat red">
            <p className="li-stat-label">Overdue Amount</p>
            <p className="li-stat-value red">{fmt(stats.overdue)}</p>
          </div>
          <div className="li-stat">
            <p className="li-stat-label">Drafts Pending</p>
            <p className="li-stat-value">{stats.drafts}</p>
          </div>
          <div className="li-stat">
            <p className="li-stat-label">Total Paid</p>
            <p className="li-stat-value">{fmt(stats.totalPaid)}</p>
          </div>
        </div>
<div className="li-cat-tabs" role="tablist">
  {CATEGORY_TABS.map(t => (
    <button
      key={t.id}
      type="button"
      role="tab"
      aria-selected={categoryTab === t.id}
      className={`li-cat-tab${categoryTab === t.id ? " active" : ""}`}
      onClick={() => setCategoryTab(t.id)}
    >
      {t.icon}
      <span>{t.label}</span>
      <span className="li-cat-count">{categoryCounts[t.id]}</span>
    </button>
  ))}
</div>
        {/* Invoice Data Container */}
        <div className="li-table-wrap">
          {/* Desktop Full Table View */}
          <div className="li-table-scroll">
            <table>
              <colgroup>
                <col style={{ width: "175px" }} />
                <col style={{ width: "170px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "78px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Guest</th>
                  <th>Department</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: "right" }}>Balance Due</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {showLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="li-sk-row li-skeleton">
                        {Array.from({ length: 10 }).map((__, j) => (
                          <td key={j}><div className="li-sk-bar" style={{ width: j === 0 ? 80 : j === 1 ? 130 : j === 9 ? 40 : 80 }} /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={10}>
                          <div className="li-empty">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                              <rect x="4" y="5" width="16" height="14" rx="2" stroke="#9AA1AF" strokeWidth="1.5" />
                              <path d="M8 9h8M8 13h5M8 16h3" stroke="#9AA1AF" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p>No invoices match the current filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paginated.map(inv => {
                      const fin = getInvoiceFinancials(inv);
                      const s = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
                      const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
                      const sc = SETTLEMENT_COLOR[settle] || SETTLEMENT_COLOR.pending;
                      const settleLabel = settle === "setteled" ? "Settled" : settle === "overdue" ? "Overdue" : "Pending";
                      const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || null;
                      const initials = customerName ? customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
                      const deptName = inv.department_data?.department_name || null;
                      const id = inv.invoice_id || inv.id;

                      return (
                        <tr key={id} onClick={() => navigate(`/invoices/${id}`)}>
    <td className="li-inv-cell">
  <span className="li-inv-num">
    #{inv.invoice_number || (id ? id.slice(0, 8) : "—")}
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4584E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h11v11M4 15 15 4" />
    </svg>
    {inv.room_booking === true && <span className="li-room-badge">Room</span>}
  </span>
</td>
                          <td>
                            <div className="li-customer">
                              <div className="li-avatar">{initials}</div>
                              {customerName || <span style={{ color: "#9AA1AF", fontStyle: "italic" }}>No customer</span>}
                            </div>
                          </td>
                          <td>
                            {deptName
                              ? <span className="li-dept-badge">
                                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#3568C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  {deptName}
                                </span>
                              : <span className="li-dept-none">—</span>
                            }
                          </td>
                          <td>{inv.invoice_date ? new Date(extractDate(inv.invoice_date)).toLocaleDateString("en-IN") : "—"}</td>
                          <td>{inv.due_date ? new Date(extractDate(inv.due_date)).toLocaleDateString("en-IN") : "—"}</td>
                          <td><span className="li-amount">{fmt(fin.grandTotal, inv.invoice_currency || inv.currency)}</span></td>
                          <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                            <BalanceCell inv={inv} />
                          </td>
                          <td>
                            <span className="li-badge" style={{ background: s.bg, color: s.color }}>
                              {inv.status || "draft"}
                            </span>
                          </td>
                          <td>
                            <span className="li-badge" style={{ background: sc.bg, color: sc.color }}>
                              {settleLabel}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div className="li-actions-cell">
                              {settle !== "setteled"  && canUpdate ? (
                                <button
                                  className="li-pay-icon-btn"
                                  title="Record payment"
                                  onClick={e => { e.stopPropagation(); setPaymentInvoice(inv); }}
                                >
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                                    <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  </svg>
                                </button>
                              ) : (
                                <span className="li-pay-icon-placeholder" aria-hidden="true" />
                              )}
                              <button className="li-action-btn" onClick={e => { e.stopPropagation(); navigate(`/invoices/${id}`); }}>⋯</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="li-card-list">
            {showLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="li-card-item li-skeleton" style={{ height: 120 }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="li-empty">
                <p>No invoices match the current filter criteria</p>
              </div>
            ) : (
              paginated.map(inv => {
                const fin = getInvoiceFinancials(inv);
                const s = STATUS_COLOR[inv.status] || STATUS_COLOR.draft;
                const settle = inv.settlement_status || (fin.balanceDue <= 0 ? "setteled" : fin.isOverdue ? "overdue" : "pending");
                const sc = SETTLEMENT_COLOR[settle] || SETTLEMENT_COLOR.pending;
                const settleLabel = settle === "setteled" ? "Settled" : settle === "overdue" ? "Overdue" : "Pending";
                const customerName = inv.customer_data?.name || inv.customer_data?.customer_name || "Customer";
                const initials = customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const deptName = inv.department_data?.department_name;
                const id = inv.invoice_id || inv.id;

                return (
                  <div key={id} className="li-card-item" onClick={() => navigate(`/invoices/${id}`)}>
                    <div className="li-card-head">
                      <div className="li-card-customer">
                        <div className="li-avatar">{initials}</div>
                        <div>
                          <div className="li-card-cust-name">{customerName}</div>
                        <div className="li-card-inv-no">
  <span>#{inv.invoice_number || id.slice(0, 8)}</span>
  {inv.room_booking === true && <span className="li-room-badge">Room</span>}
</div>
                        </div>
                      </div>
                      <div className="li-card-badges">
                        <span className="li-badge" style={{ background: s.bg, color: s.color }}>
                          {inv.status || "draft"}
                        </span>
                        <span className="li-badge" style={{ background: sc.bg, color: sc.color }}>
                          {settleLabel}
                        </span>
                      </div>
                    </div>

                    <div className="li-card-mid-grid">
                      <div className="li-card-mid-cell">
                        <span className="li-card-mid-label">Total Amount</span>
                        <span className="li-card-mid-val">{fmt(fin.grandTotal, inv.invoice_currency || inv.currency)}</span>
                      </div>
                      <div className="li-card-mid-cell" onClick={e => e.stopPropagation()}>
                        <span className="li-card-mid-label">Balance Due</span>
                        <BalanceCell inv={inv} isCard={true} />
                      </div>
                      <div className="li-card-mid-cell">
                        <span className="li-card-mid-label">Issue Date</span>
                        <span style={{ fontSize: 12, color: "#374151" }}>
                          {inv.invoice_date ? new Date(extractDate(inv.invoice_date)).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                      <div className="li-card-mid-cell">
                        <span className="li-card-mid-label">Due Date</span>
                        <span style={{ fontSize: 12, color: fin.isOverdue ? "#DC2626" : "#374151", fontWeight: fin.isOverdue ? 700 : 400 }}>
                          {inv.due_date ? new Date(extractDate(inv.due_date)).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="li-card-bottom">
                      <div>
                        {deptName ? (
                          <span className="li-dept-badge">{deptName}</span>
                        ) : (
                          <span style={{ color: "#9AA1AF" }}>No Department</span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                        {settle !== "setteled" && canUpdate && (
                          <button
                            type="button"
                            className="li-card-pay-btn"
                            onClick={() => setPaymentInvoice(inv)}
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
                              <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                              <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                            </svg>
                            Record Pay
                          </button>
                        )}
                        <button
                          type="button"
                          className="li-action-btn"
                          onClick={() => navigate(`/invoices/${id}`)}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

{/* Pagination */}
{!showLoading && filtered.length > 0 && (
  <div className="li-pagination">
    <span>Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} invoices</span>
    <Pagination
      currentPage={safePage}
      totalPages={totalPages}
      onChange={setCurrentPage}
      windowSize={3}
    />
  </div>
)}
        </div>
      </div>

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          pushToast={push}
          onClose={() => setPaymentInvoice(null)}
          onSaved={() => {
            setPaymentInvoice(null);
            fetchInvoices();
          }}
        />
      )}

      <ToastHost />
    </>
  );
}