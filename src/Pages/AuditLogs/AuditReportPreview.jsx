








// import React, { useState, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Printer, FileDown, Download, RotateCw, AlertCircle } from "lucide-react";
// import { useToast } from "../Stays/Rooms/Room_Shared";
// import "./AuditLogs.css";
// import { fetchGlobalAuditLogs } from "./services/auditLogsApi";
// import { downloadReportPdf } from "./utils/auditPdf";
// import { formatValue, pretty } from "./utils/formatValue";

// const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
// const fmtDate = (ts) =>
//   new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// const ACTION_COLOR = { create: "#15803d", update: "#2563eb", delete: "#b91c1c" };

// const card = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" };
// const cardLabel = { fontSize: 10.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" };
// const cardValue = { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "4px 0 2px" };
// const cardSub = { fontSize: 12, color: "#64748b" };
// const th = { padding: "7px 12px", background: "#0f172a", color: "#fff", fontSize: 11, textAlign: "left" };
// const td = { padding: "7px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 12, whiteSpace: "pre-line", verticalAlign: "top" };

// const PRINT_CSS = `
// .al-print-only { display: none; }

// @media print {
//   @page { size: A4 portrait; margin: 12mm; }

//   html, body { height: auto !important; overflow: visible !important; background: #fff !important; }

//   /* hide the whole app (sidebar, navbar, page toolbar) */
//   #root { display: none !important; }

//   /* show only the portal copy of the report */
//   .al-print-only { display: block !important; }
//   .al-print-only .al-report-paper {
//     max-width: 100% !important;
//     width: 100% !important;
//     margin: 0 !important;
//     box-shadow: none !important;
//     border: none !important;
//     border-radius: 0 !important;
//   }

//   * {
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }
// }
// `;

// function ReportPaper({ events, summary }) {
//   return (
//     <div className="al-report-paper" style={{ padding: 0, overflow: "hidden", maxWidth: 900 }}>
//       {/* Header band */}
//       <div style={{ background: "#0f172a", borderBottom: "4px solid #2563eb", padding: "26px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Valli Stay</span>
//         <span style={{ fontSize: 13, color: "#cbd5e1" }}>Audit Report</span>
//       </div>

//       <div style={{ padding: "28px 40px 36px" }}>
//         <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Audit Report</h1>
//         <p style={{ margin: "4px 0 20px", fontSize: 13, color: "#64748b" }}>
//           Generated {new Date().toLocaleString("en-GB")}
//         </p>

//         {/* Summary cards */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
//           <div style={card}>
//             <div style={cardLabel}>Date range</div>
//             <div style={cardValue}>All records</div>
//             <div style={cardSub}>{summary.range}</div>
//           </div>
//           <div style={card}>
//             <div style={cardLabel}>Events</div>
//             <div style={cardValue}>{events.length} total</div>
//             <div style={cardSub}>{summary.success} success • {summary.failed} failed</div>
//           </div>
//           <div style={card}>
//             <div style={cardLabel}>Modules</div>
//             <div style={cardValue}>{summary.modules.length} module{summary.modules.length !== 1 ? "s" : ""}</div>
//             <div style={cardSub}>{summary.modules.join(", ")}</div>
//           </div>
//         </div>

//         <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Activity Details</div>

//         {events.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>No events recorded.</div>}

//         {/* Event cards */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           {events.map((ev, i) => {
//             const isCreate = ev.action === "create";
//             const failed = ev.status === "failed";
//             const fields = (ev.changed_fields || []).filter((f) => !isCreate || !isEmpty(f.new_value));
//             return (
//               <div key={ev.audit_id || i} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", breakInside: "avoid", pageBreakInside: "avoid" }}>
//                 <div style={{ background: "#e2e8f0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <span style={{ fontWeight: 700, fontSize: 13, color: ACTION_COLOR[ev.action] || "#0f172a" }}>
//                     #{String(i + 1).padStart(2, "0")} &nbsp; {ev.action_label} • {pretty(ev.module_name)}
//                   </span>
//                   <span style={{ fontSize: 11.5, color: "#64748b" }}>{ev.formatted_date}</span>
//                 </div>

//                 <div style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>
//                   {ev.description}
//                 </div>

//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: "10px 16px 14px", background: "#f8fafc" }}>
//                   <div>
//                     <div style={cardLabel}>Performed by</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{ev.performed_by_name}</div>
//                     <div style={{ fontSize: 11.5, color: "#64748b" }}>{ev.performed_by_email} • {ev.performed_by_role}</div>
//                   </div>
//                   <div>
//                     <div style={cardLabel}>Module</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{pretty(ev.module_name)}</div>
//                   </div>
//                   <div>
//                     <div style={cardLabel}>Status</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: failed ? "#b91c1c" : "#15803d" }}>
//                       {failed ? "Failed" : "Success"}
//                     </div>
//                   </div>
//                 </div>

//                 {fields.length > 0 && (
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead>
//                       <tr>
//                         <th style={{ ...th, width: "28%" }}>Field</th>
//                         {isCreate ? <th style={th}>Value</th> : (<><th style={th}>Previous Value</th><th style={th}>New Value</th></>)}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {fields.map((f, k) => (
//                         <tr key={k}>
//                           <td style={{ ...td, fontWeight: 700 }}>{pretty(f.field_name)}</td>
//                           {isCreate ? (
//                             <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
//                           ) : (
//                             <>
//                               <td style={{ ...td, background: "#fef2f2", color: "#b91c1c" }}>{formatValue(f.old_value)}</td>
//                               <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
//                             </>
//                           )}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8" }}>
//           Valli Stay • Audit Report
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AuditReportPreview() {
//   const navigate = useNavigate();
//   const { push: toast, ToastHost } = useToast();
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       setEvents(await fetchGlobalAuditLogs());
//     } catch (err) {
//       console.error(err);
//       setError(err?.message || "The report could not be prepared.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => { load(); }, []);

//   const summary = useMemo(() => {
//     const times = events.map((e) => e.created_ts).filter(Boolean);
//     const modules = [...new Set(events.map((e) => pretty(e.module_name)))];
//     const failed = events.filter((e) => e.status === "failed").length;
//     return {
//       range: times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—",
//       modules,
//       failed,
//       success: events.length - failed,
//     };
//   }, [events]);

//   const handleDownloadPDF = async () => {
//     try {
//       await downloadReportPdf(events, { rangeLabel: "All records" });
//       toast("Report downloaded successfully.", "success");
//     } catch (err) {
//       console.error(err);
//       toast(`Could not generate the PDF: ${err?.message || "unknown error"}`, "error");
//     }
//   };

//   const handleDownloadCsv = () => {
//     const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
//     const headers = ["Date & Time", "Performed By", "Email", "Role", "Module", "Action", "Description", "Status"];
//     const rows = events.map((e) =>
//       [e.formatted_date, e.performed_by_name, e.performed_by_email, e.performed_by_role,
//        e.module_name, e.action_label, e.description, e.status].map(esc).join(",")
//     );
//     const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "ValliStay_Audit_Report.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//     toast("Report downloaded successfully.", "success");
//   };

//   const disabled = loading || Boolean(error);

//   return (
//     <div className="al-container">
//       <ToastHost />
//       <style>{PRINT_CSS}</style>

//       {/* Print-only copy: lives outside #root so sidebar/navbar never print */}
//       {!loading && !error &&
//         createPortal(
//           <div className="al-print-only">
//             <ReportPaper events={events} summary={summary} />
//           </div>,
//           document.body
//         )}

//       <div className="al-hide-on-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, background: "#fff", padding: "14px 20px", borderRadius: 12, border: "1px solid #eef2f6", flexWrap: "wrap", gap: 10 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <button type="button" className="al-btn-action" onClick={() => navigate("/audit-logs")}>
//             <ArrowLeft size={16} /> Back to Audit Logs
//           </button>
//           <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Report Preview</span>
//         </div>
//         <div style={{ display: "flex", gap: 8 }}>
//           <button type="button" className="al-btn-action" onClick={() => window.print()} disabled={disabled}>
//             <Printer size={15} /> Print
//           </button>
//           <button type="button" className="al-btn-action" onClick={handleDownloadCsv} disabled={disabled}>
//             <Download size={15} color="#16a34a" /> Download CSV
//           </button>
//           <button type="button" className="al-btn-action" style={{ background: "#2563eb", color: "#fff", borderColor: "#2563eb" }} onClick={handleDownloadPDF} disabled={disabled}>
//             <FileDown size={15} /> Download PDF
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="al-report-paper" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
//           <RotateCw size={24} color="#2563eb" className="al-spinner" />
//           <p>Preparing report...</p>
//         </div>
//       ) : error ? (
//         <div className="al-report-paper" style={{ textAlign: "center", padding: "48px 20px" }}>
//           <AlertCircle size={28} color="#dc2626" />
//           <h3 style={{ margin: "10px 0 6px", fontSize: 16, color: "#0f172a" }}>Failed to Load Report</h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>{error}</p>
//           <button type="button" className="al-btn-action" onClick={load}><RotateCw size={14} /> Retry</button>
//         </div>
//       ) : (
//         <ReportPaper events={events} summary={summary} />
//       )}
//     </div>
//   );
// }

















// import React, { useState, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Printer, FileDown, Download, RotateCw, AlertCircle } from "lucide-react";
// import { useToast } from "../Stays/Rooms/Room_Shared";
// import "./AuditLogs.css";
// import "./AuditLogs.responsive.css";
// import "./AuditPages.responsive.css";
// import { fetchGlobalAuditLogs } from "./services/auditLogsApi";
// import { downloadReportPdf } from "./utils/auditPdf";
// import { formatValue, pretty } from "./utils/formatValue";

// const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
// const fmtDate = (ts) =>
//   new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// const ACTION_COLOR = { create: "#15803d", update: "#2563eb", delete: "#b91c1c" };

// const card = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" };
// const cardLabel = { fontSize: 10.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" };
// const cardValue = { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "4px 0 2px" };
// const cardSub = { fontSize: 12, color: "#64748b" };
// const th = { padding: "7px 12px", background: "#0f172a", color: "#fff", fontSize: 11, textAlign: "left" };
// const td = { padding: "7px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 12, whiteSpace: "pre-line", verticalAlign: "top" };

// const PRINT_CSS = `
// .al-print-only { display: none; }

// @media print {
//   @page { size: A4 portrait; margin: 12mm; }

//   html, body { height: auto !important; overflow: visible !important; background: #fff !important; }

//   /* hide the whole app (sidebar, navbar, page toolbar) */
//   #root { display: none !important; }

//   /* show only the portal copy of the report */
//   .al-print-only { display: block !important; }
//   .al-print-only .al-report-paper {
//     max-width: 100% !important;
//     width: 100% !important;
//     margin: 0 !important;
//     box-shadow: none !important;
//     border: none !important;
//     border-radius: 0 !important;
//   }

//   * {
//     -webkit-print-color-adjust: exact;
//     print-color-adjust: exact;
//   }
// }
// `;

// function ReportPaper({ events, summary }) {
//   return (
//     <div className="al-report-paper" style={{ padding: 0, overflow: "hidden" }}>
//       {/* Header band */}
//       <div className="al-rp-band">
//         <span className="al-rp-brand">Valli Stay</span>
//         <span className="al-rp-band-sub">Audit Report</span>
//       </div>

//       <div className="al-rp-body">
//         <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Audit Report</h1>
//         <p style={{ margin: "4px 0 20px", fontSize: 13, color: "#64748b" }}>
//           Generated {new Date().toLocaleString("en-GB")}
//         </p>

//         {/* Summary cards */}
//         <div className="al-rp-summary">
//           <div style={card}>
//             <div style={cardLabel}>Date range</div>
//             <div style={cardValue}>All records</div>
//             <div style={cardSub}>{summary.range}</div>
//           </div>
//           <div style={card}>
//             <div style={cardLabel}>Events</div>
//             <div style={cardValue}>{events.length} total</div>
//             <div style={cardSub}>{summary.success} success • {summary.failed} failed</div>
//           </div>
//           <div style={card}>
//             <div style={cardLabel}>Modules</div>
//             <div style={cardValue}>{summary.modules.length} module{summary.modules.length !== 1 ? "s" : ""}</div>
//             <div style={cardSub}>{summary.modules.join(", ")}</div>
//           </div>
//         </div>

//         <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Activity Details</div>

//         {events.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>No events recorded.</div>}

//         {/* Event cards */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           {events.map((ev, i) => {
//             const isCreate = ev.action === "create";
//             const failed = ev.status === "failed";
//             const fields = (ev.changed_fields || []).filter((f) => !isCreate || !isEmpty(f.new_value));
//             return (
//               <div key={ev.audit_id || i} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", breakInside: "avoid", pageBreakInside: "avoid" }}>
//                 <div className="al-rp-evhead">
//                   <span style={{ fontWeight: 700, fontSize: 13, color: ACTION_COLOR[ev.action] || "#0f172a" }}>
//                     #{String(i + 1).padStart(2, "0")} &nbsp; {ev.action_label} • {pretty(ev.module_name)}
//                   </span>
//                   <span style={{ fontSize: 11.5, color: "#64748b" }}>{ev.formatted_date}</span>
//                 </div>

//                 <div style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: 13.5, color: "#0f172a", overflowWrap: "anywhere" }}>
//                   {ev.description}
//                 </div>

//                 <div className="al-rp-meta">
//                   <div>
//                     <div style={cardLabel}>Performed by</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{ev.performed_by_name}</div>
//                     <div style={{ fontSize: 11.5, color: "#64748b" }}>{ev.performed_by_email} • {ev.performed_by_role}</div>
//                   </div>
//                   <div>
//                     <div style={cardLabel}>Module</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{pretty(ev.module_name)}</div>
//                   </div>
//                   <div>
//                     <div style={cardLabel}>Status</div>
//                     <div style={{ fontWeight: 700, fontSize: 13, color: failed ? "#b91c1c" : "#15803d" }}>
//                       {failed ? "Failed" : "Success"}
//                     </div>
//                   </div>
//                 </div>

//                 {fields.length > 0 && (
//                   <div className="al-rp-tablewrap">
//                     <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                       <thead>
//                         <tr>
//                           <th style={{ ...th, width: "28%" }}>Field</th>
//                           {isCreate ? <th style={th}>Value</th> : (<><th style={th}>Previous Value</th><th style={th}>New Value</th></>)}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {fields.map((f, k) => (
//                           <tr key={k}>
//                             <td style={{ ...td, fontWeight: 700 }}>{pretty(f.field_name)}</td>
//                             {isCreate ? (
//                               <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
//                             ) : (
//                               <>
//                                 <td style={{ ...td, background: "#fef2f2", color: "#b91c1c" }}>{formatValue(f.old_value)}</td>
//                                 <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
//                               </>
//                             )}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8" }}>
//           Valli Stay • Audit Report
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AuditReportPreview() {
//   const navigate = useNavigate();
//   const { push: toast, ToastHost } = useToast();
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       setEvents(await fetchGlobalAuditLogs());
//     } catch (err) {
//       console.error(err);
//       setError(err?.message || "The report could not be prepared.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => { load(); }, []);

//   const summary = useMemo(() => {
//     const times = events.map((e) => e.created_ts).filter(Boolean);
//     const modules = [...new Set(events.map((e) => pretty(e.module_name)))];
//     const failed = events.filter((e) => e.status === "failed").length;
//     return {
//       range: times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—",
//       modules,
//       failed,
//       success: events.length - failed,
//     };
//   }, [events]);

//   const handleDownloadPDF = async () => {
//     try {
//       await downloadReportPdf(events, { rangeLabel: "All records" });
//       toast("Report downloaded successfully.", "success");
//     } catch (err) {
//       console.error(err);
//       toast(`Could not generate the PDF: ${err?.message || "unknown error"}`, "error");
//     }
//   };

//   const handleDownloadCsv = () => {
//     const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
//     const headers = ["Date & Time", "Performed By", "Email", "Role", "Module", "Action", "Description", "Status"];
//     const rows = events.map((e) =>
//       [e.formatted_date, e.performed_by_name, e.performed_by_email, e.performed_by_role,
//        e.module_name, e.action_label, e.description, e.status].map(esc).join(",")
//     );
//     const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "ValliStay_Audit_Report.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//     toast("Report downloaded successfully.", "success");
//   };

//   const disabled = loading || Boolean(error);

//   return (
//     <div className="al-container">
//       <ToastHost />
//       <style>{PRINT_CSS}</style>

//       {/* Print-only copy: lives outside #root so sidebar/navbar never print */}
//       {!loading && !error &&
//         createPortal(
//           <div className="al-print-only">
//             <ReportPaper events={events} summary={summary} />
//           </div>,
//           document.body
//         )}

//       <div className="al-hide-on-print al-rp-toolbar">
//         <div className="al-rp-toolbar-left">
//           <button type="button" className="al-btn-action" onClick={() => navigate("/audit-logs")}>
//             <ArrowLeft size={16} /> Back to Audit Logs
//           </button>
//           <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Report Preview</span>
//         </div>
//         <div className="al-rp-actions">
//           <button type="button" className="al-btn-action" onClick={() => window.print()} disabled={disabled}>
//             <Printer size={15} /> Print
//           </button>
//           <button type="button" className="al-btn-action" onClick={handleDownloadCsv} disabled={disabled}>
//             <Download size={15} color="#16a34a" /> Download CSV
//           </button>
//           <button type="button" className="al-btn-action" style={{ background: "#2563eb", color: "#fff", borderColor: "#2563eb" }} onClick={handleDownloadPDF} disabled={disabled}>
//             <FileDown size={15} /> Download PDF
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="al-report-paper" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
//           <RotateCw size={24} color="#2563eb" className="al-spinner" />
//           <p>Preparing report...</p>
//         </div>
//       ) : error ? (
//         <div className="al-report-paper" style={{ textAlign: "center", padding: "48px 20px" }}>
//           <AlertCircle size={28} color="#dc2626" />
//           <h3 style={{ margin: "10px 0 6px", fontSize: 16, color: "#0f172a" }}>Failed to Load Report</h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>{error}</p>
//           <button type="button" className="al-btn-action" onClick={load}><RotateCw size={14} /> Retry</button>
//         </div>
//       ) : (
//         <ReportPaper events={events} summary={summary} />
//       )}
//     </div>
//   );
// }

















import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, FileDown, Download, RotateCw, AlertCircle } from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AuditLogs.css";
import "./AuditLogs.responsive.css";
import "./AuditPages.responsive.css";
import { fetchGlobalAuditLogs } from "./services/auditLogsApi";
import { downloadReportPdf } from "./utils/auditPdf";
import { formatValue, pretty } from "./utils/formatValue";

/* ---------- brand colors ---------- */
const BRAND = "#3d5346";
const ACCENT = "#8aa596";
const TINT = "#e4ece7";

const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const ACTION_COLOR = { create: "#15803d", update: BRAND, delete: "#b91c1c" };

const card = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" };
const cardLabel = { fontSize: 10.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" };
const cardValue = { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "4px 0 2px" };
const cardSub = { fontSize: 12, color: "#64748b" };
const th = { padding: "7px 12px", background: BRAND, color: "#fff", fontSize: 11, textAlign: "left" };
const td = { padding: "7px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 12, whiteSpace: "pre-line", verticalAlign: "top" };

const PRINT_CSS = `
.al-print-only { display: none; }

@media print {
  @page { size: A4 portrait; margin: 12mm; }

  html, body { height: auto !important; overflow: visible !important; background: #fff !important; }

  /* hide the whole app (sidebar, navbar, page toolbar) */
  #root { display: none !important; }

  /* show only the portal copy of the report */
  .al-print-only { display: block !important; }
  .al-print-only .al-report-paper {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

function ReportPaper({ events, summary }) {
  return (
    <div className="al-report-paper" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header band */}
      <div
        className="al-rp-band"
        style={{ background: BRAND, borderBottom: `4px solid ${ACCENT}` }}
      >
        <span className="al-rp-brand">Valli Stay</span>
        <span className="al-rp-band-sub">Audit Report</span>
      </div>

      <div className="al-rp-body">
        <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Audit Report</h1>
        <p style={{ margin: "4px 0 20px", fontSize: 13, color: "#64748b" }}>
          Generated {new Date().toLocaleString("en-GB")}
        </p>

        {/* Summary cards */}
        <div className="al-rp-summary">
          <div style={card}>
            <div style={cardLabel}>Date range</div>
            <div style={cardValue}>All records</div>
            <div style={cardSub}>{summary.range}</div>
          </div>
          <div style={card}>
            <div style={cardLabel}>Events</div>
            <div style={cardValue}>{events.length} total</div>
            <div style={cardSub}>{summary.success} success • {summary.failed} failed</div>
          </div>
          <div style={card}>
            <div style={cardLabel}>Modules</div>
            <div style={cardValue}>{summary.modules.length} module{summary.modules.length !== 1 ? "s" : ""}</div>
            <div style={cardSub}>{summary.modules.join(", ")}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Activity Details</div>

        {events.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>No events recorded.</div>}

        {/* Event cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {events.map((ev, i) => {
            const isCreate = ev.action === "create";
            const failed = ev.status === "failed";
            const fields = (ev.changed_fields || []).filter((f) => !isCreate || !isEmpty(f.new_value));
            return (
              <div key={ev.audit_id || i} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div className="al-rp-evhead" style={{ background: TINT }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: ACTION_COLOR[ev.action] || "#0f172a" }}>
                    #{String(i + 1).padStart(2, "0")} &nbsp; {ev.action_label} • {pretty(ev.module_name)}
                  </span>
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>{ev.formatted_date}</span>
                </div>

                <div style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: 13.5, color: "#0f172a", overflowWrap: "anywhere" }}>
                  {ev.description}
                </div>

                <div className="al-rp-meta">
                  <div>
                    <div style={cardLabel}>Performed by</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{ev.performed_by_name}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>{ev.performed_by_email} • {ev.performed_by_role}</div>
                  </div>
                  <div>
                    <div style={cardLabel}>Module</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{pretty(ev.module_name)}</div>
                  </div>
                  <div>
                    <div style={cardLabel}>Status</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: failed ? "#b91c1c" : "#15803d" }}>
                      {failed ? "Failed" : "Success"}
                    </div>
                  </div>
                </div>

                {fields.length > 0 && (
                  <div className="al-rp-tablewrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ ...th, width: "28%" }}>Field</th>
                          {isCreate ? <th style={th}>Value</th> : (<><th style={th}>Previous Value</th><th style={th}>New Value</th></>)}
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((f, k) => (
                          <tr key={k}>
                            <td style={{ ...td, fontWeight: 700 }}>{pretty(f.field_name)}</td>
                            {isCreate ? (
                              <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
                            ) : (
                              <>
                                <td style={{ ...td, background: "#fef2f2", color: "#b91c1c" }}>{formatValue(f.old_value)}</td>
                                <td style={{ ...td, background: "#f0fdf4", color: "#15803d" }}>{formatValue(f.new_value)}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8" }}>
          Valli Stay • Audit Report
        </div>
      </div>
    </div>
  );
}

export default function AuditReportPreview() {
  const navigate = useNavigate();
  const { push: toast, ToastHost } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.logs)) return res.logs;
  if (Array.isArray(res?.results)) return res.results;
  if (Array.isArray(res?.events)) return res.events;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const load = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetchGlobalAuditLogs();
    console.log("audit response:", res); // check the shape once, then remove
    setEvents(toArray(res));
  } catch (err) {
    console.error(err);
    setError(err?.message || "The report could not be prepared.");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { load(); }, []);

const summary = useMemo(() => {
  const list = Array.isArray(events) ? events : [];
  const times = list.map((e) => e.created_ts).filter(Boolean);
  const modules = [...new Set(list.map((e) => pretty(e.module_name)))];
  const failed = list.filter((e) => e.status === "failed").length;
  return {
    range: times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—",
    modules,
    failed,
    success: list.length - failed,
  };
}, [events]);

  const handleDownloadPDF = async () => {
    try {
      await downloadReportPdf(events, { rangeLabel: "All records" });
      toast("Report downloaded successfully.", "success");
    } catch (err) {
      console.error(err);
      toast(`Could not generate the PDF: ${err?.message || "unknown error"}`, "error");
    }
  };

  const handleDownloadCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["Date & Time", "Performed By", "Email", "Role", "Module", "Action", "Description", "Status"];
    const rows = events.map((e) =>
      [e.formatted_date, e.performed_by_name, e.performed_by_email, e.performed_by_role,
       e.module_name, e.action_label, e.description, e.status].map(esc).join(",")
    );
    const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ValliStay_Audit_Report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Report downloaded successfully.", "success");
  };

  const disabled = loading || Boolean(error);

  return (
    <div className="al-container">
      <ToastHost />
      <style>{PRINT_CSS}</style>

      {/* Print-only copy: lives outside #root so sidebar/navbar never print */}
      {!loading && !error &&
        createPortal(
          <div className="al-print-only">
            <ReportPaper events={events} summary={summary} />
          </div>,
          document.body
        )}

      <div className="al-hide-on-print al-rp-toolbar">
        <div className="al-rp-toolbar-left">
          <button type="button" className="al-btn-action" onClick={() => navigate("/audit-logs")}>
            <ArrowLeft size={16} /> Back to Audit Logs
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Report Preview</span>
        </div>
        <div className="al-rp-actions">
          <button type="button" className="al-btn-action" onClick={() => window.print()} disabled={disabled}>
            <Printer size={15} /> Print
          </button>
          <button type="button" className="al-btn-action" onClick={handleDownloadCsv} disabled={disabled}>
            <Download size={15} color="#16a34a" /> Download CSV
          </button>
          <button
            type="button"
            className="al-btn-action"
            style={{ background: BRAND, color: "#fff", borderColor: BRAND }}
            onClick={handleDownloadPDF}
            disabled={disabled}
          >
            <FileDown size={15} /> Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="al-report-paper" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <RotateCw size={24} color={BRAND} className="al-spinner" />
          <p>Preparing report...</p>
        </div>
      ) : error ? (
        <div className="al-report-paper" style={{ textAlign: "center", padding: "48px 20px" }}>
          <AlertCircle size={28} color="#dc2626" />
          <h3 style={{ margin: "10px 0 6px", fontSize: 16, color: "#0f172a" }}>Failed to Load Report</h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>{error}</p>
          <button type="button" className="al-btn-action" onClick={load}><RotateCw size={14} /> Retry</button>
        </div>
      ) : (
        <ReportPaper events={events} summary={summary} />
      )}
    </div>
  );
}