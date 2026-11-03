// import { formatValue, pretty } from "./formatValue";

// const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
// const fmtDate = (ts) =>
//   new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// const C = {
//   navy: [15, 23, 42], blue: [37, 99, 235], text: [15, 23, 42], muted: [100, 116, 139],
//   line: [226, 232, 240], soft: [248, 250, 252], green: [21, 128, 61], red: [185, 28, 28],
//   greenBg: [220, 252, 231], redBg: [254, 226, 226],
// };

// async function loadPdf() {
//   const { jsPDF } = await import("jspdf");
//   const { default: autoTable } = await import("jspdf-autotable");
//   const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
//   return { doc, autoTable };
// }

// function drawHeader(doc, label) {
//   doc.setFillColor(...C.navy);
//   doc.rect(0, 0, 210, 30, "F");
//   doc.setFillColor(...C.blue);
//   doc.rect(0, 30, 210, 1.5, "F");
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(19);
//   doc.setTextColor(255, 255, 255);
//   doc.text("Valli Stay", 14, 19);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.setTextColor(203, 213, 225);
//   doc.text(label, 196, 19, { align: "right" });
// }

// function drawFooter(doc, label) {
//   const pages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= pages; i++) {
//     doc.setPage(i);
//     doc.setDrawColor(...C.line);
//     doc.line(14, 284, 196, 284);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(8);
//     doc.setTextColor(148, 163, 184);
//     doc.text(label, 14, 290);
//     doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
//   }
// }

// function pill(doc, text, x, y, w, ok) {
//   doc.setFillColor(...(ok ? C.greenBg : C.redBg));
//   doc.roundedRect(x, y, w, 7, 3.5, 3.5, "F");
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(8);
//   doc.setTextColor(...(ok ? C.green : C.red));
//   doc.text(text, x + w / 2, y + 4.8, { align: "center" });
// }

// function infoCard(doc, x, y, w, h, label, value, sub) {
//   doc.setFillColor(...C.soft);
//   doc.setDrawColor(...C.line);
//   doc.roundedRect(x, y, w, h, 2, 2, "FD");
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(7.5);
//   doc.setTextColor(...C.muted);
//   doc.text(label.toUpperCase(), x + 5, y + 7);
//   doc.setFontSize(11);
//   doc.setTextColor(...C.text);
//   doc.text(doc.splitTextToSize(String(value), w - 10)[0], x + 5, y + 14);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(8.5);
//   doc.setTextColor(...C.muted);
//   doc.text(doc.splitTextToSize(String(sub), w - 10)[0], x + 5, y + 20);
// }

// function sectionTitle(doc, text, y) {
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.setTextColor(...C.text);
//   doc.text(text, 14, y);
// }

// export async function downloadEventPdf(event, title = "Audit Event Report") {
//   const { doc, autoTable } = await loadPdf();
//   const failed = event.status === "failed";

//   drawHeader(doc, title);

//   // Title + status
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(16);
//   doc.setTextColor(...C.text);
//   doc.text(`${event.action_label} • ${pretty(event.module_name)}`, 14, 45);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9.5);
//   doc.setTextColor(...C.muted);
//   doc.text(event.formatted_date, 14, 52);
//   pill(doc, failed ? "FAILED" : "SUCCESS", 166, 40, 30, !failed);

//   // Description card
//   const lines = doc.splitTextToSize(event.description || "—", 172);
//   const h = 8 + lines.length * 5;
//   doc.setFillColor(...C.soft);
//   doc.setDrawColor(...C.line);
//   doc.roundedRect(14, 58, 182, h, 2, 2, "FD");
//   doc.setFontSize(10);
//   doc.setTextColor(...C.text);
//   doc.text(lines, 19, 65);

//   // Info cards
//   const cy = 58 + h + 6;
//   infoCard(doc, 14, cy, 89, 26, "Performed by", event.performed_by_name, `${event.performed_by_email} • ${event.performed_by_role}`);
//   infoCard(doc, 107, cy, 89, 26, "Module & action", pretty(event.module_name), event.action_label);

//   // Changes
//   const fields = event.changed_fields || [];
//   let y = cy + 26 + 10;
//   sectionTitle(doc, event.action === "create" ? "Created Values" : "Changes (Before & After)", y);
//   y += 4;

//   const isCreate = event.action === "create";
//   const rows = isCreate
//     ? fields.filter((f) => !isEmpty(f.new_value)).map((f) => [pretty(f.field_name), formatValue(f.new_value)])
//     : fields.map((f) => [pretty(f.field_name), formatValue(f.old_value), formatValue(f.new_value)]);

//   if (rows.length === 0) {
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(9);
//     doc.setTextColor(...C.muted);
//     doc.text("No field changes recorded for this operation.", 14, y + 6);
//   } else {
//     autoTable(doc, {
//       startY: y,
//       head: [isCreate ? ["Field", "Value"] : ["Field", "Previous Value", "New Value"]],
//       body: rows,
//       theme: "grid",
//       margin: { left: 14, right: 14 },
//       headStyles: { fillColor: C.navy, textColor: 255, fontStyle: "bold", fontSize: 8.5 },
//       styles: { fontSize: 8.5, cellPadding: 3, lineColor: C.line, lineWidth: 0.2, textColor: C.text },
//       columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
//       didParseCell: (d) => {
//         if (isCreate || d.section !== "body") return;
//         if (d.column.index === 1) { d.cell.styles.textColor = C.red; d.cell.styles.fillColor = [254, 242, 242]; }
//         if (d.column.index === 2) { d.cell.styles.textColor = C.green; d.cell.styles.fillColor = [240, 253, 244]; }
//       },
//     });
//   }

//   drawFooter(doc, `Valli Stay • Generated ${new Date().toLocaleString("en-GB")}`);
//   doc.save(`ValliStay_${event.module_name}_${event.action}.pdf`);
// }




// // export async function downloadReportPdf(events, { includeDiffs = true, rangeLabel = "All records" } = {}) {
// //   const { doc, autoTable } = await loadPdf();

// //   const times = events.map((e) => e.created_ts).filter(Boolean);
// //   const actualRange = times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—";
// //   const moduleNames = [...new Set(events.map((e) => pretty(e.module_name)))];
// //   const modSub = moduleNames.join(", ");
// //   const success = events.filter((e) => e.status === "success").length;
// //   const failed = events.length - success;

// //   // Header only on page 1
// //   drawHeader(doc, "Audit Report");

// //   doc.setFont("helvetica", "bold");
// //   doc.setFontSize(16);
// //   doc.setTextColor(...C.text);
// //   doc.text("Audit Report", 14, 45);
// //   doc.setFont("helvetica", "normal");
// //   doc.setFontSize(9.5);
// //   doc.setTextColor(...C.muted);
// //   doc.text(`Generated ${new Date().toLocaleString("en-GB")}`, 14, 52);

// //   infoCard(doc, 14, 58, 58, 26, "Date range", rangeLabel, actualRange);
// //   infoCard(doc, 76, 58, 58, 26, "Events", `${events.length} total`, `${success} success • ${failed} failed`);
// //   infoCard(doc, 138, 58, 58, 26, "Modules", `${moduleNames.length} module${moduleNames.length !== 1 ? "s" : ""}`, modSub.length > 30 ? modSub.slice(0, 28) + "…" : modSub);

// //   // ---- Activity log ----
// //   sectionTitle(doc, "Activity Log", 96);
// //   autoTable(doc, {
// //     startY: 100,
// //     head: [["#", "Date & Time", "Actor", "Module", "Action", "Description", "Status"]],
// //     body: events.map((ev, i) => [
// //       i + 1, ev.formatted_date, ev.performed_by_name, pretty(ev.module_name),
// //       ev.action_label, ev.description, ev.status === "failed" ? "Failed" : "Success",
// //     ]),
// //     theme: "striped",
// //     margin: { top: 15, left: 14, right: 14, bottom: 22 },
// //     headStyles: { fillColor: C.navy, textColor: 255, fontStyle: "bold", fontSize: 8 },
// //     styles: { fontSize: 7.5, cellPadding: 2.5, textColor: C.text, valign: "middle" },
// //     alternateRowStyles: { fillColor: C.soft },
// //     columnStyles: {
// //       0: { cellWidth: 8, halign: "center" },
// //       1: { cellWidth: 30 },
// //       2: { cellWidth: 26 },
// //       3: { cellWidth: 26 },
// //       4: { cellWidth: 16 },
// //       6: { cellWidth: 16, fontStyle: "bold" },
// //     },
// //     didParseCell: (d) => {
// //       if (d.section === "body" && d.column.index === 6) {
// //         d.cell.styles.textColor = d.cell.raw === "Failed" ? C.red : C.green;
// //       }
// //     },
// //   });

// //   // ---- Change details ----
// //   if (includeDiffs) {
// //     const withChanges = events
// //       .map((ev, i) => ({ ev, n: i + 1 }))
// //       .filter(({ ev }) => ev.changed_fields?.length > 0);

// //     if (withChanges.length > 0) {
// //       let y = doc.lastAutoTable.finalY + 12;
// //       if (y > 250) { doc.addPage(); y = 20; }
// //       sectionTitle(doc, "Change Details", y);

// //       const body = [];
// //       withChanges.forEach(({ ev, n }) => {
// //         body.push([{
// //           content: `#${n}  ${ev.action_label} • ${pretty(ev.module_name)} — ${ev.description}   (${ev.formatted_date})`,
// //           colSpan: 3,
// //           styles: { fillColor: [226, 232, 240], fontStyle: "bold", textColor: C.text },
// //         }]);

// //         ev.changed_fields.forEach((f) => {
// //           if (ev.action === "create") {
// //             if (isEmpty(f.new_value)) return;
// //             body.push([
// //               { content: pretty(f.field_name), styles: { fontStyle: "bold" } },
// //               { content: formatValue(f.new_value), colSpan: 2, styles: { textColor: C.green, fillColor: [240, 253, 244] } },
// //             ]);
// //           } else {
// //             body.push([
// //               { content: pretty(f.field_name), styles: { fontStyle: "bold" } },
// //               { content: formatValue(f.old_value), styles: { textColor: C.red, fillColor: [254, 242, 242] } },
// //               { content: formatValue(f.new_value), styles: { textColor: C.green, fillColor: [240, 253, 244] } },
// //             ]);
// //           }
// //         });
// //       });

// //       autoTable(doc, {
// //         startY: y + 3,
// //         head: [["Field", "Previous Value", "New Value"]],
// //         body,
// //         theme: "grid",
// //         margin: { top: 15, left: 14, right: 14, bottom: 22 },
// //         headStyles: { fillColor: C.navy, textColor: 255, fontStyle: "bold", fontSize: 8 },
// //         styles: { fontSize: 7.5, cellPadding: 2.5, lineColor: C.line, lineWidth: 0.2, textColor: C.text },
// //         columnStyles: { 0: { cellWidth: 42 } },
// //       });
// //     }
// //   }

// //   drawFooter(doc, "Valli Stay • Audit Report");
// //   doc.save("ValliStay_Audit_Report.pdf");
// // }














// export async function downloadReportPdf(events, { includeDiffs = true, rangeLabel = "All records" } = {}) {
//   const { doc, autoTable } = await loadPdf();

//   const times = events.map((e) => e.created_ts).filter(Boolean);
//   const actualRange = times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—";
//   const moduleNames = [...new Set(events.map((e) => pretty(e.module_name)))];
//   const modSub = moduleNames.join(", ");
//   const success = events.filter((e) => e.status !== "failed").length;
//   const failed = events.length - success;

//   // ---- Page 1 header ----
//   drawHeader(doc, "Audit Report");
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(16);
//   doc.setTextColor(...C.text);
//   doc.text("Audit Report", 14, 45);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9.5);
//   doc.setTextColor(...C.muted);
//   doc.text(`Generated ${new Date().toLocaleString("en-GB")}`, 14, 52);

//   infoCard(doc, 14, 58, 58, 26, "Date range", rangeLabel, actualRange);
//   infoCard(doc, 76, 58, 58, 26, "Events", `${events.length} total`, `${success} success • ${failed} failed`);
//   infoCard(doc, 138, 58, 58, 26, "Modules", `${moduleNames.length} module${moduleNames.length !== 1 ? "s" : ""}`,
//     modSub.length > 30 ? modSub.slice(0, 28) + "…" : modSub);

//   sectionTitle(doc, "Activity Details", 96);
//   let y = 100;

//   const SLATE = [226, 232, 240];
//   const actionColors = { create: C.green, update: C.blue, delete: C.red };
//   const pad = (top, bottom) => ({ top, bottom, left: 3, right: 3 });

//   events.forEach((ev, i) => {
//     const isCreate = ev.action === "create";
//     const isFailed = ev.status === "failed";
//     const fields = includeDiffs
//       ? (ev.changed_fields || []).filter((f) => !isCreate || !isEmpty(f.new_value))
//       : [];

//     const body = [
//       // card header
//       [
//         { content: `#${String(i + 1).padStart(2, "0")}   ${ev.action_label} • ${pretty(ev.module_name)}`, colSpan: 2,
//           styles: { fontStyle: "bold", fontSize: 9, fillColor: SLATE, textColor: actionColors[ev.action] || C.text, cellPadding: pad(3, 3) } },
//         { content: ev.formatted_date,
//           styles: { halign: "right", fontSize: 7.5, fillColor: SLATE, textColor: C.muted, cellPadding: pad(3, 3) } },
//       ],
//       // description
//       [{ content: ev.description || "—", colSpan: 3,
//          styles: { fontStyle: "bold", fontSize: 9, textColor: C.text, cellPadding: pad(3, 2) } }],
//       // labels
//       ["PERFORMED BY", "MODULE", "STATUS"].map((t) => ({
//         content: t, styles: { fontSize: 6.5, fontStyle: "bold", textColor: C.muted, fillColor: C.soft, cellPadding: pad(2.5, 0.5) },
//       })),
//       // values
//       [
//         { content: ev.performed_by_name, styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, cellPadding: pad(0.5, 0.5) } },
//         { content: pretty(ev.module_name), styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, cellPadding: pad(0.5, 0.5) } },
//         { content: isFailed ? "Failed" : "Success",
//           styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, textColor: isFailed ? C.red : C.green, cellPadding: pad(0.5, 0.5) } },
//       ],
//       // sub line
//       [
//         { content: `${ev.performed_by_email} • ${ev.performed_by_role}`,
//           styles: { fontSize: 7, textColor: C.muted, fillColor: C.soft, cellPadding: pad(0.5, 3) } },
//         { content: "", styles: { fillColor: C.soft } },
//         { content: "", styles: { fillColor: C.soft } },
//       ],
//     ];

//     if (fields.length > 0) {
//       const head = { fontStyle: "bold", fontSize: 7.5, fillColor: C.navy, textColor: 255, cellPadding: pad(2, 2) };
//       body.push(
//         isCreate
//           ? [{ content: "Field", styles: head }, { content: "Value", colSpan: 2, styles: head }]
//           : [{ content: "Field", styles: head }, { content: "Previous Value", styles: head }, { content: "New Value", styles: head }]
//       );
//       const line = { lineWidth: { bottom: 0.2 }, lineColor: C.line };
//       fields.forEach((f) => {
//         if (isCreate) {
//           body.push([
//             { content: pretty(f.field_name), styles: { fontStyle: "bold", ...line } },
//             { content: formatValue(f.new_value), colSpan: 2, styles: { textColor: C.green, fillColor: [240, 253, 244], ...line } },
//           ]);
//         } else {
//           body.push([
//             { content: pretty(f.field_name), styles: { fontStyle: "bold", ...line } },
//             { content: formatValue(f.old_value), styles: { textColor: C.red, fillColor: [254, 242, 242], ...line } },
//             { content: formatValue(f.new_value), styles: { textColor: C.green, fillColor: [240, 253, 244], ...line } },
//           ]);
//         }
//       });
//     }

//     autoTable(doc, {
//       startY: y,
//       body,
//       theme: "plain",
//       pageBreak: "avoid",
//       margin: { top: 15, left: 14, right: 14, bottom: 22 },
//       tableLineColor: C.line,
//       tableLineWidth: 0.3,
//       styles: { fontSize: 7.5, cellPadding: 2.5, textColor: C.text, valign: "middle", lineWidth: 0, overflow: "linebreak" },
//       columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 61 }, 2: { cellWidth: 61 } },
//     });

//     y = doc.lastAutoTable.finalY + 6;
//   });

//   drawFooter(doc, "Valli Stay • Audit Report");
//   doc.save("ValliStay_Audit_Report.pdf");
// }
























import { formatValue, pretty } from "./formatValue";

const isEmpty = (v) => v === undefined || v === null || v === "" || v === "—";
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* #3d5346 = rgb(61, 83, 70) */
const C = {
  navy: [61, 83, 70],        // brand color (header, table heads)
  blue: [138, 165, 150],     // lighter tint of brand (accent strip)
  tint: [228, 236, 231],     // very light brand tint (card header rows)
  text: [15, 23, 42],
  muted: [100, 116, 139],
  line: [226, 232, 240],
  soft: [248, 250, 252],
  green: [21, 128, 61],
  red: [185, 28, 28],
  greenBg: [220, 252, 231],
  redBg: [254, 226, 226],
};

async function loadPdf() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  return { doc, autoTable };
}

function drawHeader(doc, label) {
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFillColor(...C.blue);
  doc.rect(0, 30, 210, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text("Valli Stay", 14, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 236, 230);
  doc.text(label, 196, 19, { align: "right" });
}

function drawFooter(doc, label) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.line);
    doc.line(14, 284, 196, 284);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(label, 14, 290);
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
  }
}

function pill(doc, text, x, y, w, ok) {
  doc.setFillColor(...(ok ? C.greenBg : C.redBg));
  doc.roundedRect(x, y, w, 7, 3.5, 3.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...(ok ? C.green : C.red));
  doc.text(text, x + w / 2, y + 4.8, { align: "center" });
}

function infoCard(doc, x, y, w, h, label, value, sub) {
  doc.setFillColor(...C.soft);
  doc.setDrawColor(...C.line);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(label.toUpperCase(), x + 5, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(...C.text);
  doc.text(doc.splitTextToSize(String(value), w - 10)[0], x + 5, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(doc.splitTextToSize(String(sub), w - 10)[0], x + 5, y + 20);
}

function sectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(text, 14, y);
}

export async function downloadEventPdf(event, title = "Audit Event Report") {
  const { doc, autoTable } = await loadPdf();
  const failed = event.status === "failed";

  drawHeader(doc, title);

  // Title + status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.text);
  doc.text(`${event.action_label} • ${pretty(event.module_name)}`, 14, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.muted);
  doc.text(event.formatted_date, 14, 52);
  pill(doc, failed ? "FAILED" : "SUCCESS", 166, 40, 30, !failed);

  // Description card
  const lines = doc.splitTextToSize(event.description || "—", 172);
  const h = 8 + lines.length * 5;
  doc.setFillColor(...C.soft);
  doc.setDrawColor(...C.line);
  doc.roundedRect(14, 58, 182, h, 2, 2, "FD");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(lines, 19, 65);

  // Info cards
  const cy = 58 + h + 6;
  infoCard(doc, 14, cy, 89, 26, "Performed by", event.performed_by_name, `${event.performed_by_email} • ${event.performed_by_role}`);
  infoCard(doc, 107, cy, 89, 26, "Module & action", pretty(event.module_name), event.action_label);

  // Changes
  const fields = event.changed_fields || [];
  let y = cy + 26 + 10;
  sectionTitle(doc, event.action === "create" ? "Created Values" : "Changes (Before & After)", y);
  y += 4;

  const isCreate = event.action === "create";
  const rows = isCreate
    ? fields.filter((f) => !isEmpty(f.new_value)).map((f) => [pretty(f.field_name), formatValue(f.new_value)])
    : fields.map((f) => [pretty(f.field_name), formatValue(f.old_value), formatValue(f.new_value)]);

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text("No field changes recorded for this operation.", 14, y + 6);
  } else {
    autoTable(doc, {
      startY: y,
      head: [isCreate ? ["Field", "Value"] : ["Field", "Previous Value", "New Value"]],
      body: rows,
      theme: "grid",
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: C.navy, textColor: 255, fontStyle: "bold", fontSize: 8.5 },
      styles: { fontSize: 8.5, cellPadding: 3, lineColor: C.line, lineWidth: 0.2, textColor: C.text },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
      didParseCell: (d) => {
        if (isCreate || d.section !== "body") return;
        if (d.column.index === 1) { d.cell.styles.textColor = C.red; d.cell.styles.fillColor = [254, 242, 242]; }
        if (d.column.index === 2) { d.cell.styles.textColor = C.green; d.cell.styles.fillColor = [240, 253, 244]; }
      },
    });
  }

  drawFooter(doc, `Valli Stay • Generated ${new Date().toLocaleString("en-GB")}`);
  doc.save(`ValliStay_${event.module_name}_${event.action}.pdf`);
}

export async function downloadReportPdf(events, { includeDiffs = true, rangeLabel = "All records" } = {}) {
  const { doc, autoTable } = await loadPdf();

  const times = events.map((e) => e.created_ts).filter(Boolean);
  const actualRange = times.length ? `${fmtDate(Math.min(...times))} – ${fmtDate(Math.max(...times))}` : "—";
  const moduleNames = [...new Set(events.map((e) => pretty(e.module_name)))];
  const modSub = moduleNames.join(", ");
  const success = events.filter((e) => e.status !== "failed").length;
  const failed = events.length - success;

  // ---- Page 1 header ----
  drawHeader(doc, "Audit Report");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.text);
  doc.text("Audit Report", 14, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.muted);
  doc.text(`Generated ${new Date().toLocaleString("en-GB")}`, 14, 52);

  infoCard(doc, 14, 58, 58, 26, "Date range", rangeLabel, actualRange);
  infoCard(doc, 76, 58, 58, 26, "Events", `${events.length} total`, `${success} success • ${failed} failed`);
  infoCard(doc, 138, 58, 58, 26, "Modules", `${moduleNames.length} module${moduleNames.length !== 1 ? "s" : ""}`,
    modSub.length > 30 ? modSub.slice(0, 28) + "…" : modSub);

  sectionTitle(doc, "Activity Details", 96);
  let y = 100;

  const HEAD_BG = C.tint;
  const actionColors = { create: C.green, update: C.navy, delete: C.red };
  const pad = (top, bottom) => ({ top, bottom, left: 3, right: 3 });

  events.forEach((ev, i) => {
    const isCreate = ev.action === "create";
    const isFailed = ev.status === "failed";
    const fields = includeDiffs
      ? (ev.changed_fields || []).filter((f) => !isCreate || !isEmpty(f.new_value))
      : [];

    const body = [
      // card header
      [
        { content: `#${String(i + 1).padStart(2, "0")}   ${ev.action_label} • ${pretty(ev.module_name)}`, colSpan: 2,
          styles: { fontStyle: "bold", fontSize: 9, fillColor: HEAD_BG, textColor: actionColors[ev.action] || C.text, cellPadding: pad(3, 3) } },
        { content: ev.formatted_date,
          styles: { halign: "right", fontSize: 7.5, fillColor: HEAD_BG, textColor: C.muted, cellPadding: pad(3, 3) } },
      ],
      // description
      [{ content: ev.description || "—", colSpan: 3,
         styles: { fontStyle: "bold", fontSize: 9, textColor: C.text, cellPadding: pad(3, 2) } }],
      // labels
      ["PERFORMED BY", "MODULE", "STATUS"].map((t) => ({
        content: t, styles: { fontSize: 6.5, fontStyle: "bold", textColor: C.muted, fillColor: C.soft, cellPadding: pad(2.5, 0.5) },
      })),
      // values
      [
        { content: ev.performed_by_name, styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, cellPadding: pad(0.5, 0.5) } },
        { content: pretty(ev.module_name), styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, cellPadding: pad(0.5, 0.5) } },
        { content: isFailed ? "Failed" : "Success",
          styles: { fontStyle: "bold", fontSize: 8.5, fillColor: C.soft, textColor: isFailed ? C.red : C.green, cellPadding: pad(0.5, 0.5) } },
      ],
      // sub line
      [
        { content: `${ev.performed_by_email} • ${ev.performed_by_role}`,
          styles: { fontSize: 7, textColor: C.muted, fillColor: C.soft, cellPadding: pad(0.5, 3) } },
        { content: "", styles: { fillColor: C.soft } },
        { content: "", styles: { fillColor: C.soft } },
      ],
    ];

    if (fields.length > 0) {
      const head = { fontStyle: "bold", fontSize: 7.5, fillColor: C.navy, textColor: 255, cellPadding: pad(2, 2) };
      body.push(
        isCreate
          ? [{ content: "Field", styles: head }, { content: "Value", colSpan: 2, styles: head }]
          : [{ content: "Field", styles: head }, { content: "Previous Value", styles: head }, { content: "New Value", styles: head }]
      );
      const line = { lineWidth: { bottom: 0.2 }, lineColor: C.line };
      fields.forEach((f) => {
        if (isCreate) {
          body.push([
            { content: pretty(f.field_name), styles: { fontStyle: "bold", ...line } },
            { content: formatValue(f.new_value), colSpan: 2, styles: { textColor: C.green, fillColor: [240, 253, 244], ...line } },
          ]);
        } else {
          body.push([
            { content: pretty(f.field_name), styles: { fontStyle: "bold", ...line } },
            { content: formatValue(f.old_value), styles: { textColor: C.red, fillColor: [254, 242, 242], ...line } },
            { content: formatValue(f.new_value), styles: { textColor: C.green, fillColor: [240, 253, 244], ...line } },
          ]);
        }
      });
    }

    autoTable(doc, {
      startY: y,
      body,
      theme: "plain",
      pageBreak: "avoid",
      margin: { top: 15, left: 14, right: 14, bottom: 22 },
      tableLineColor: C.line,
      tableLineWidth: 0.3,
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: C.text, valign: "middle", lineWidth: 0, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 61 }, 2: { cellWidth: 61 } },
    });

    y = doc.lastAutoTable.finalY + 6;
  });

  drawFooter(doc, "Valli Stay • Audit Report");
  doc.save("ValliStay_Audit_Report.pdf");
}