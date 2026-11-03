// import React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const box = (active, disabled) => ({
//   width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
//   display: "flex", alignItems: "center", justifyContent: "center",
//   border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
//   background: active ? "#2563eb" : "#ffffff",
//   color: active ? "#ffffff" : disabled ? "#cbd5e1" : "#475569",
//   cursor: disabled ? "not-allowed" : "pointer",
// });

// export default function Pagination({ currentPage, totalPages, onChange, windowSize = 3 }) {
//   const start = Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
//   const end = Math.min(start + windowSize - 1, totalPages);
//   const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//       <button type="button" style={box(false, currentPage === 1)} disabled={currentPage === 1}
//         onClick={() => onChange(currentPage - 1)}>
//         <ChevronLeft size={16} />
//       </button>
//       {pages.map((p) => (
//         <button key={p} type="button" style={box(p === currentPage, false)} onClick={() => onChange(p)}>
//           {p}
//         </button>
//       ))}
//       <button type="button" style={box(false, currentPage === totalPages)} disabled={currentPage === totalPages}
//         onClick={() => onChange(currentPage + 1)}>
//         <ChevronRight size={16} />
//       </button>
//     </div>
//   );
// }











import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const box = (active, disabled) => ({
  width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
  background: active ? "#2563eb" : "#ffffff",
  color: active ? "#ffffff" : disabled ? "#cbd5e1" : "#475569",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default function Pagination({ currentPage, totalPages, onChange, windowSize = 3 }) {
  const start = Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
  const end = Math.min(start + windowSize - 1, totalPages);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="al-pg" aria-label="Pagination">
      <button type="button" className="al-pg-btn" style={box(false, currentPage === 1)} disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" className="al-pg-btn" style={box(p === currentPage, false)}
          onClick={() => onChange(p)} aria-current={p === currentPage ? "page" : undefined}>
          {p}
        </button>
      ))}
      <button type="button" className="al-pg-btn" style={box(false, currentPage === totalPages)} disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}