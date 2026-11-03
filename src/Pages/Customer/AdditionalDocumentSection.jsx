// import React, { useState, useRef, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { FilePlus2, FileText, Upload, Eye, RefreshCw, X, ExternalLink, Tag, CheckCircle2 } from "lucide-react";
// import { T } from "./shared";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BLUE = "#2563eb";
// const SUGGESTIONS = ["Voter ID", "Address Proof", "Bank Statement", "Other"];
// const MAX_BYTES = 10 * 1024 * 1024;

// const toUrl = (v) =>
//   typeof v === "string"
//     ? (v.startsWith("http") || v.startsWith("blob:") ? v : `${API_BASE_URL}${v.startsWith("/") ? "" : "/"}${v}`)
//     : null;

// export default function AdditionalDocumentSection({
//   enabled, onToggle,
//   name, onNameChange,
//   file, onFileChange,
//   errors = {},
//   compress, // optional: async (file) => file
// }) {
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const [busy, setBusy] = useState(false);
//   const [sizeError, setSizeError] = useState("");
//   const fileRef = useRef(null);

//   const isPdf = typeof file === "string" ? file.toLowerCase().endsWith(".pdf") : file?.type === "application/pdf";
//   const isImage =
//     (file instanceof File && file.type.startsWith("image/")) ||
//     (typeof file === "string" && /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

//   useEffect(() => {
//     if (!file) { setPreviewUrl(null); return; }
//     if (typeof file === "string") { setPreviewUrl(toUrl(file)); return; }
//     const url = URL.createObjectURL(file);
//     setPreviewUrl(url);
//     return () => URL.revokeObjectURL(url);
//   }, [file]);

//   const fileName = typeof file === "string" ? file.split("/").pop() : file?.name;
//   const fileSize = typeof file === "string" ? "Uploaded file" : file?.size ? `${(file.size / 1024).toFixed(0)} KB` : "";

//   const handleFiles = async (files) => {
//     const f = files?.[0];
//     if (!f) return;
//     setSizeError("");
//     if (f.size > MAX_BYTES) { setSizeError("File is too large. Max 10 MB allowed."); return; }
//     setBusy(true);
//     try { onFileChange(compress ? await compress(f) : f); }
//     finally { setBusy(false); }
//   };

//   const nameErr = errors.additional_document_name;
//   const fileErr = errors.additional_document || sizeError;

//   return (
//     <div>
//       <style>{`
//         @keyframes adxOpen { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
//         .adx-open { animation: adxOpen .25s ease forwards; }
//         .adx-chip { transition: all .15s ease; }
//         .adx-chip:hover { border-color:${BLUE} !important; color:${BLUE} !important; background:#f0f7ff !important; }
//         .adx-drop:hover { border-color:${BLUE} !important; background:#f8fbff !important; }
//       `}</style>

//       {/* ── Toggle card ── */}
//       <div style={{
//         display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
//         padding: "16px 18px", borderRadius: 14, cursor: "pointer",
//         border: `1.5px solid ${enabled ? BLUE : T.border}`,
//         background: enabled ? "linear-gradient(135deg,#f0f7ff 0%,#ffffff 100%)" : "#ffffff",
//         boxShadow: enabled ? "0 4px 16px rgba(37,99,235,0.10)" : "0 1px 3px rgba(0,0,0,0.03)",
//         transition: "all .2s ease",
//       }} onClick={() => onToggle(!enabled)}>
//         <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
//           <div style={{
//             width: 44, height: 44, borderRadius: 12, flexShrink: 0,
//             background: enabled ? BLUE : "#eff6ff", color: enabled ? "#fff" : BLUE,
//             display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s ease",
//           }}>
//             <FilePlus2 size={21} />
//           </div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Add additional document</div>
//             <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>
//               Attach any extra proof — Voter ID, address proof, bank statement, etc.
//             </div>
//           </div>
//         </div>

//         <button type="button" role="switch" aria-checked={enabled}
//           onClick={(e) => { e.stopPropagation(); onToggle(!enabled); }}
//           style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", flexShrink: 0 }}>
//           <span style={{
//             display: "block", width: 44, height: 24, borderRadius: 999, position: "relative",
//             background: enabled ? BLUE : "#d1d5db", transition: "background .18s ease",
//           }}>
//             <span style={{
//               position: "absolute", top: 3, left: enabled ? 23 : 3, width: 18, height: 18, borderRadius: "50%",
//               background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .18s ease",
//             }} />
//           </span>
//         </button>
//       </div>

//       {/* ── Expanded content ── */}
//       {enabled && (
//         <div className="adx-open" style={{
//           marginTop: 14, padding: "20px 18px", borderRadius: 14,
//           border: `1px solid ${T.border}`, background: "#f8fafc",
//           display: "flex", flexDirection: "column", gap: 22,
//         }}>
//           {/* Step 1 */}
//           <div>
//             <StepLabel n={1} title="Name this document" done={!!name.trim()} />
//             <div style={{ position: "relative" }}>
//               <Tag size={15} color="#9ca3af" style={{ position: "absolute", left: 13, top: 13 }} />
//               <input
//                 value={name}
//                 onChange={(e) => onNameChange(e.target.value)}
//                 placeholder="e.g. Voter ID, Address Proof..."
//                 maxLength={60}
//                 style={{
//                   width: "100%", boxSizing: "border-box", padding: "10px 13px 10px 38px", borderRadius: 10,
//                   border: `1px solid ${nameErr ? T.red : T.border}`, fontSize: 13.5, color: T.text,
//                   outline: "none", background: "#fff", transition: "all .15s ease",
//                 }}
//                 onFocus={(e) => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.14)"; }}
//                 onBlur={(e) => { e.target.style.borderColor = nameErr ? T.red : T.border; e.target.style.boxShadow = "none"; }}
//               />
//             </div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
//               {SUGGESTIONS.map((s) => {
//                 const active = name.trim().toLowerCase() === s.toLowerCase();
//                 return (
//                   <button key={s} type="button" className="adx-chip" onClick={() => onNameChange(s === "Other" ? "" : s)}
//                     style={{
//                       padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
//                       border: `1px solid ${active ? BLUE : T.border}`,
//                       background: active ? "#eff6ff" : "#fff", color: active ? BLUE : "#4b5563",
//                     }}>
//                     {s}
//                   </button>
//                 );
//               })}
//             </div>
//             {nameErr && <div style={{ fontSize: 11.5, color: T.red, marginTop: 6, fontWeight: 500 }}>{nameErr}</div>}
//           </div>

//           {/* Step 2 */}
//           <div>
//             <StepLabel n={2} title="Upload the document" done={!!file} />
//             {file ? (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
//                 border: `1px solid ${T.border}`, background: "#fff", minWidth: 0, overflow: "hidden",
//               }}>
//                 <div onClick={() => setModalOpen(true)} style={{ cursor: "pointer", flexShrink: 0 }}>
//                   {previewUrl && isImage ? (
//                     <img src={previewUrl} alt={fileName} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", display: "block" }} />
//                   ) : (
//                     <div style={{ width: 48, height: 48, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                       <FileText size={22} color={BLUE} />
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setModalOpen(true)}>
//                   <div title={fileName} style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                     {fileName}
//                   </div>
//                   <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
//                     <CheckCircle2 size={12} color="#16a34a" /> {fileSize} · <span style={{ color: BLUE, fontWeight: 600 }}>Preview</span>
//                   </div>
//                 </div>
//                 <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
//                   <MiniBtn title="Preview" onClick={() => setModalOpen(true)}><Eye size={15} color={BLUE} /></MiniBtn>
//                   <MiniBtn title="Replace" onClick={() => fileRef.current?.click()}><RefreshCw size={15} color="#6b7280" /></MiniBtn>
//                   <MiniBtn title="Remove" onClick={() => onFileChange(null)}><X size={15} color={T.red} /></MiniBtn>
//                 </div>
//               </div>
//             ) : (
//               <div
//                 className="adx-drop"
//                 onClick={() => fileRef.current?.click()}
//                 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
//                 style={{
//                   border: `1.5px dashed ${fileErr ? T.red : dragOver ? BLUE : "#cbd5e1"}`,
//                   background: dragOver ? "#f0f7ff" : "#fff", borderRadius: 12, padding: "26px 16px",
//                   textAlign: "center", cursor: "pointer", transition: "all .18s ease",
//                 }}>
//                 <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
//                   <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     <Upload size={19} color={BLUE} />
//                   </div>
//                 </div>
//                 <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
//                   {busy ? "Compressing…" : <>Click to upload or <span style={{ color: BLUE }}>drag & drop</span></>}
//                 </div>
//                 <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>PNG, JPG or PDF (max. 10MB)</div>
//               </div>
//             )}
//             {fileErr && <div style={{ fontSize: 11.5, color: T.red, marginTop: 6, fontWeight: 500 }}>{fileErr}</div>}
//             <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
//               onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
//           </div>
//         </div>
//       )}

//       {modalOpen && previewUrl && createPortal(
//         <div onClick={() => setModalOpen(false)} style={{
//           position: "fixed", inset: 0, zIndex: 10005, background: "rgba(17,24,39,0.82)",
//           backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//         }}>
//           <div onClick={(e) => e.stopPropagation()} style={{
//             background: "#fff", borderRadius: 16, width: "100%", maxWidth: 900, height: "88vh",
//             display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
//           }}>
//             <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//                 <FileText size={18} color={BLUE} />
//                 <span style={{ fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {name || fileName}
//                 </span>
//               </div>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <a href={previewUrl} target="_blank" rel="noreferrer" style={{
//                   display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8,
//                   border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 600, textDecoration: "none",
//                 }}><ExternalLink size={13} /> Open</a>
//                 <button onClick={() => setModalOpen(false)} style={{
//                   border: "none", background: "#e5e7eb", borderRadius: "50%", width: 28, height: 28, cursor: "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}><X size={16} /></button>
//               </div>
//             </div>
//             <div style={{ flex: 1, background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 16 }}>
//               {isPdf
//                 ? <iframe src={`${previewUrl}#toolbar=0`} title="Preview" style={{ width: "100%", height: "100%", border: "none", borderRadius: 8, background: "#fff" }} />
//                 : <img src={previewUrl} alt="Document" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
//             </div>
//           </div>
//         </div>,
//         document.body
//       )}
//     </div>
//   );
// }

// function StepLabel({ n, title, done }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
//       <span style={{
//         width: 22, height: 22, borderRadius: "50%", fontSize: 11.5, fontWeight: 800,
//         display: "inline-flex", alignItems: "center", justifyContent: "center",
//         background: done ? "#16a34a" : BLUE, color: "#fff", transition: "background .2s",
//       }}>
//         {done ? "✓" : n}
//       </span>
//       <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151" }}>{title}</span>
//       <span style={{ color: T.red, marginLeft: -4 }}>*</span>
//     </div>
//   );
// }

// function MiniBtn({ children, onClick, title }) {
//   return (
//     <button type="button" title={title} onClick={onClick} style={{
//       width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent",
//       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
//     }}
//       onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
//       onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
//       {children}
//     </button>
//   );
// }

























import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Eye, Camera, Upload, FileText, RefreshCw, ExternalLink } from "lucide-react";
import { T } from "./shared";
import { getCameraIssue, CameraWarningModal } from "./CameraWarning";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const BLUE = "#2563eb";
const BLUE_BG = "#eff6ff";

const uid = () => Math.random().toString(36).slice(2, 9);
export const newDoc = () => ({ id: uid(), serverId: null, name: "", file: null });

/* ── file helpers: works for File objects AND server URL strings ── */
const IMG_RE = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
const PDF_RE = /\.pdf(\?.*)?$/i;
const toUrl = (s) =>
  /^(https?:|blob:|data:)/.test(s) ? s : `${API_BASE_URL}${s.startsWith("/") ? "" : "/"}${s}`;
const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
const fileInfo = (f) => {
  if (!f) return null;
  if (typeof f === "string") {
    return {
      name: safeDecode(f.split("?")[0].split("/").pop() || "document"),
      isImg: IMG_RE.test(f), isPdf: PDF_RE.test(f), size: "Uploaded",
    };
  }
  return {
    name: f.name, isImg: !!f.type?.startsWith("image/"),
    isPdf: f.type === "application/pdf", size: `${(f.size / 1024).toFixed(0)} KB`,
  };
};

/* ── small toggle ── */
function MiniToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
    >
      <span style={{ width: 36, height: 20, borderRadius: 999, background: checked ? BLUE : "#d1d5db", position: "relative", transition: "background .18s ease", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .18s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
    </button>
  );
}

/* ── choose modal (Take Photo / Upload File) ── */
function PickModal({ onTakePhoto, onUpload, onClose }) {
  return createPortal(
    <>
      <div className="adx-backdrop" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9997, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div className="adx-pop" style={{ pointerEvents: "all", background: "#fff", borderRadius: 18, padding: "22px 22px 20px", width: 340, maxWidth: "calc(100vw - 32px)", boxShadow: "0 28px 70px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Add Document</div>
            <button type="button" onClick={onClose} style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} color="#6b7280" />
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: Camera, title: "Take Photo", sub: "Use camera", fn: onTakePhoto },
              { icon: Upload, title: "Upload File", sub: "PNG, JPG or PDF", fn: onUpload },
            ].map(({ icon: Icon, title, sub, fn }) => (
              <button key={title} type="button" className="adx-opt" onClick={fn}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 10px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "#fafbfc", cursor: "pointer" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: BLUE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={BLUE} />
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{title}</span>
                <span style={{ fontSize: 10.5, color: "#9ca3af" }}>{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── preview modal ── */
function PreviewModal({ url, info, title, onClose }) {
  return createPortal(
    <>
      <div className="adx-backdrop" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10004, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 10005, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div className="adx-pop" style={{ pointerEvents: "all", background: "#fff", borderRadius: 18, width: 680, maxWidth: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.28)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title || "Preview"}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{info?.name}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <a href={url} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, color: "#374151", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <ExternalLink size={13} /> Open
              </a>
              <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#6b7280" />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
            {info?.isImg && <img src={url} alt={info.name} style={{ maxWidth: "100%", maxHeight: "74vh", objectFit: "contain", display: "block" }} />}
          {info?.isPdf && (
  <iframe
    title="pdf"
    src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
    style={{ width: "100%", height: "74vh", border: "none", background: "#fff" }}
  />
)}
            {!info?.isImg && !info?.isPdf && <div style={{ padding: 30, fontSize: 13, color: "#6b7280" }}>No preview available — use Open</div>}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── one document card ── */
function DocCard({ doc, index, error, onChange, onRemove, compress }) {
  const [pickOpen, setPickOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [url, setUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
const [camIssue, setCamIssue] = useState(null);
  const file = doc.file;
  const info = fileInfo(file);

  useEffect(() => {
    if (!file) { setUrl(null); return; }
    if (typeof file === "string") { setUrl(toUrl(file)); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const setFile = async (f) => {
    if (!f) return;
    setBusy(true);
    try { onChange({ ...doc, file: compress ? await compress(f) : f }); }
    finally { setBusy(false); }
  };

const startCamera = async () => {
  setPickOpen(false);
  if (!navigator.mediaDevices?.getUserMedia) {
    setCamIssue(getCameraIssue(null));
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    streamRef.current = stream;
    setCameraOn(true);
    setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 30);
  } catch (err) {
    setCamIssue(getCameraIssue(err));
  }
};
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(b => {
      if (!b) return;
      setFile(new File([b], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const tileClick = () => (file ? setPreviewOpen(true) : setPickOpen(true));

  const miniBtn = {
    width: 26, height: 26, borderRadius: 8, border: "none", background: "#f3f4f6",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  };

  return (
    <div className="adx-card" style={{
      position: "relative", background: "#fff", borderRadius: 14, padding: 10,
      border: `1px solid ${error?.name || error?.file ? T.red : T.border}`,
      display: "flex", flexDirection: "column", gap: 8, minWidth: 0,
    }}>
      {/* thumbnail / upload tile */}
      <div
        className="adx-tile"
        onClick={tileClick}
        style={{
          position: "relative", height: 92, borderRadius: 10, overflow: "hidden", cursor: "pointer",
          border: file ? "none" : `1.5px dashed ${error?.file ? T.red : "#cbd5e1"}`,
          background: file ? "#f1f5f9" : "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {file ? (
          <>
            {info?.isImg && url
              ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <FileText size={26} color={BLUE} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: BLUE }}>{info?.isPdf ? "PDF" : "FILE"}</span>
                </div>}
            <div className="adx-hover" style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.38)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Eye size={20} color="#fff" />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: BLUE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Upload size={14} color={BLUE} />
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#374151" }}>{busy ? "Compressing…" : "Add file"}</span>
          </div>
        )}
      </div>

      {/* name */}
      <input
        value={doc.name}
        onChange={e => onChange({ ...doc, name: e.target.value })}
        placeholder={`Document name ${index + 1}`}
        style={{
          width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8,
          border: `1px solid ${error?.name ? T.red : T.border}`, fontSize: 12.5, color: T.text,
          outline: "none", background: "#fff", transition: "border-color .15s",
        }}
        onFocus={e => (e.target.style.borderColor = BLUE)}
        onBlur={e => (e.target.style.borderColor = error?.name ? T.red : T.border)}
      />

      {/* footer: file info + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 26 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 10.5, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={info?.name}>
          {file ? `${info.size} · ${info.name}` : "PNG, JPG or PDF"}
        </div>
        {file && (
          <>
            <button type="button" title="Preview" style={miniBtn} onClick={() => setPreviewOpen(true)}><Eye size={13} color={BLUE} /></button>
            <button type="button" title="Replace" style={miniBtn} onClick={() => setPickOpen(true)}><RefreshCw size={13} color="#6b7280" /></button>
          </>
        )}
      </div>

      {(error?.name || error?.file) && (
        <div style={{ fontSize: 11, color: T.red, fontWeight: 500, marginTop: -2 }}>{error.name || error.file}</div>
      )}

      {/* remove card */}
      <button type="button" title="Remove" onClick={onRemove}
        style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", border: "2px solid #fff", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}>
        <X size={11} color="#fff" />
      </button>

      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
        onChange={e => { setFile(e.target.files?.[0]); e.target.value = ""; }} />

      {pickOpen && (
        <PickModal
          onTakePhoto={startCamera}
          onUpload={() => { setPickOpen(false); fileRef.current?.click(); }}
          onClose={() => setPickOpen(false)}
        />
      )}


      <CameraWarningModal
  issue={camIssue}
  onClose={() => setCamIssue(null)}
  onUpload={() => { setCamIssue(null); fileRef.current?.click(); }}
/>
      {previewOpen && file && url && (
        <PreviewModal url={url} info={info} title={doc.name} onClose={() => setPreviewOpen(false)} />
      )}
      {cameraOn && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.65)", backdropFilter: "blur(4px)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="adx-pop" style={{ background: "#fff", borderRadius: 16, padding: 18, width: 380, maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 10, background: "#000", display: "block" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button type="button" onClick={stopCamera} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${T.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={capture} style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: BLUE, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Capture</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── MAIN SECTION ── */
export default function AdditionalDocumentSection({ enabled, onToggle, docs = [], onDocsChange, errors = {}, compress }) {
  const docErrors = errors.additional_docs || {};

  const handleToggle = (v) => {
    onToggle(v);
    if (v && docs.length === 0) onDocsChange([newDoc()]);
  };
  const update = (d) => onDocsChange(docs.map(x => (x.id === d.id ? d : x)));
  const remove = (id) => {
    const next = docs.filter(x => x.id !== id);
    onDocsChange(next);
    if (next.length === 0) onToggle(false);
  };
  const add = () => onDocsChange([...docs, newDoc()]);

  return (
    <div style={{ background: "#f8fafc", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <style>{`
        @keyframes adxBackdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adxPop { from { opacity: 0; transform: scale(.94) translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes adxCardIn { from { opacity: 0; transform: translateY(8px) scale(.97) } to { opacity: 1; transform: none } }
        .adx-backdrop { animation: adxBackdrop .18s ease forwards }
        .adx-pop { animation: adxPop .24s cubic-bezier(.34,1.3,.64,1) forwards }
        .adx-card { animation: adxCardIn .22s ease both; transition: box-shadow .15s ease }
        .adx-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,0.08) }
        .adx-hover { opacity: 0; transition: opacity .15s ease }
        .adx-tile:hover .adx-hover { opacity: 1 }
        .adx-opt { transition: border-color .15s, background .15s, transform .12s }
        .adx-opt:hover { border-color: ${BLUE} !important; background: #f0f7ff !important; transform: translateY(-2px) }
        .adx-add { transition: all .15s ease }
        .adx-add:hover { background: ${BLUE} !important; color: #fff !important }
        .adx-add:hover svg { stroke: #fff }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MiniToggle checked={enabled} onChange={handleToggle} label="Add additional documents" />
          <span style={{ fontSize: 11, color: T.textSec }}>(optional)</span>
        </div>

        {enabled && (
          <button
            type="button"
            className="adx-add"
            onClick={add}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px",
              borderRadius: 999, border: `1px solid ${BLUE}`, background: BLUE_BG, color: BLUE,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            <Plus size={13} color={BLUE} /> Add document
            {docs.length > 0 && <span style={{ opacity: 0.7 }}>({docs.length})</span>}
          </button>
        )}
      </div>

      {enabled && docs.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: 12, marginTop: 14,
        }}>
          {docs.map((d, i) => (
            <DocCard
              key={d.id}
              doc={d}
              index={i}
              error={docErrors[d.id]}
              onChange={update}
              onRemove={() => remove(d.id)}
              compress={compress}
            />
          ))}
        </div>
      )}
    </div>
  );
}