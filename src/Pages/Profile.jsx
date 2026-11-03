








// import React, { useState, useEffect, useRef } from "react";
// import api from "../services/api";
// import { useToast } from "./Stays/Rooms/Room_Shared";
// import { X, Pencil, Camera, MapPin, Building2, Check, Loader2, Info, PenTool, Upload, Trash2 } from "lucide-react";

// /* ── helpers ── */
// function initialsOf(name = "") {
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (!parts.length) return "?";
//   return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
// }

// function getErrorMessage(err, fallback = "Something went wrong") {
//   const data = err?.response?.data;
//   if (!data) return err?.message || fallback;
//   if (typeof data === "string") return data;
//   if (data.message) return data.message;
//   if (data.error) return typeof data.error === "string" ? data.error : fallback;
//   const firstKey = Object.keys(data)[0];
//   if (firstKey) {
//     const val = data[firstKey];
//     return Array.isArray(val) ? val[0] : String(val);
//   }
//   return fallback;
// }

// const fmtDate = (raw) => {
//   const ms = raw?.$date ?? raw;
//   if (!ms) return "";
//   const d = new Date(ms);
//   if (isNaN(d.getTime())) return "";
//   return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
// };

// /* dataURL -> File */
// function dataURLtoFile(dataUrl, filename) {
//   const arr = dataUrl.split(",");
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) u8arr[n] = bstr.charCodeAt(n);
//   return new File([u8arr], filename, { type: mime });
// }

// /**
//  * SignaturePad — canvas based draw signature
//  */
// function SignaturePad({ onChange }) {
//   const canvasRef = useRef(null);
//   const drawing = useRef(false);
//   const hasDrawn = useRef(false);

//   const getCtx = () => canvasRef.current?.getContext("2d");

//   const setupCanvas = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ratio = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();
//     canvas.width = rect.width * ratio;
//     canvas.height = rect.height * ratio;
//     const ctx = canvas.getContext("2d");
//     ctx.scale(ratio, ratio);
//     ctx.lineWidth = 2.2;
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";
//     ctx.strokeStyle = "#1f2937";
//   };

//   useEffect(() => {
//     setupCanvas();
//     window.addEventListener("resize", setupCanvas);
//     return () => window.removeEventListener("resize", setupCanvas);
//   }, []);

//   const getPos = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const point = e.touches ? e.touches[0] : e;
//     return { x: point.clientX - rect.left, y: point.clientY - rect.top };
//   };

//   const start = (e) => {
//     e.preventDefault();
//     drawing.current = true;
//     const { x, y } = getPos(e);
//     const ctx = getCtx();
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//   };

//   const move = (e) => {
//     if (!drawing.current) return;
//     e.preventDefault();
//     const { x, y } = getPos(e);
//     const ctx = getCtx();
//     ctx.lineTo(x, y);
//     ctx.stroke();
//     hasDrawn.current = true;
//   };

//   const end = () => {
//     if (!drawing.current) return;
//     drawing.current = false;
//     if (hasDrawn.current) {
//       const canvas = canvasRef.current;
//       onChange(canvas.toDataURL("image/png"));
//     }
//   };

//   const clear = () => {
//     const canvas = canvasRef.current;
//     const ctx = getCtx();
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     hasDrawn.current = false;
//     onChange(null);
//   };

//   return (
//     <div className="zp-sigpad-wrap">
//       <canvas
//         ref={canvasRef}
//         className="zp-sigpad-canvas"
//         onMouseDown={start}
//         onMouseMove={move}
//         onMouseUp={end}
//         onMouseLeave={end}
//         onTouchStart={start}
//         onTouchMove={move}
//         onTouchEnd={end}
//       />
//       <button type="button" className="zp-sigpad-clear" onClick={clear} title="Clear">
//         <Trash2 size={12} /> Clear
//       </button>
//     </div>
//   );
// }

// /**
//  * Profile — slide-in drawer, view + inline edit.
//  * Props:
//  *   isOpen: boolean
//  *   onClose: () => void
//  *   onLogout: () => void   (optional — renders a "Sign out" row in the footer)
//  */
// export default function Profile({ isOpen, onClose, onLogout }) {
//   const { push, ToastHost } = useToast();

//   const [render, setRender] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({ name: "", address: "" });
//   const [logoFile, setLogoFile] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const fileInputRef = useRef(null);

//   /* ── signature state ── */
//   const [sigMode, setSigMode] = useState("draw"); // "draw" | "upload"
//   const [sigFile, setSigFile] = useState(null);       // File object to send
//   const [sigPreview, setSigPreview] = useState(null);  // dataURL / URL for preview
//   const [sigDraft, setSigDraft] = useState(null);      // latest dataURL from pad
//   const sigInputRef = useRef(null);

//   /* mount / animate in-out */
//   useEffect(() => {
//     if (isOpen) {
//       setRender(true);
//       const raf = requestAnimationFrame(() => setMounted(true));
//       return () => cancelAnimationFrame(raf);
//     } else {
//       setMounted(false);
//       const t = setTimeout(() => setRender(false), 320);
//       return () => clearTimeout(t);
//     }
//   }, [isOpen]);

//   /* fetch on open */
//   useEffect(() => {
//     if (!isOpen) return;
//     setEditing(false);
//     setLoading(true);
//     api
//       .get("/profile/get_profile")
//       .then((r) => setProfile(r.data?.data || null))
//       .catch(() => setProfile(null))
//       .finally(() => setLoading(false));
//   }, [isOpen]);

//   /* lock body scroll while open */
//   useEffect(() => {
//     if (isOpen) {
//       const prev = document.body.style.overflow;
//       document.body.style.overflow = "hidden";
//       return () => { document.body.style.overflow = prev; };
//     }
//   }, [isOpen]);

//   if (!render) return null;

//   const startEdit = () => {
//     setForm({ name: profile?.name || "", address: profile?.address || "" });
//     setLogoFile(null);
//     setLogoPreview(profile?.logo || null);

//     setSigFile(null);
//     setSigDraft(null);
//     setSigPreview(profile?.signature || null);
//     setSigMode("draw");
//     setEditing(true);
//   };

//   const cancelEdit = () => {
//     setEditing(false);
//     setLogoFile(null);
//     setSigFile(null);
//     setSigDraft(null);
//   };

//   const handleFile = (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     setLogoFile(f);
//     const reader = new FileReader();
//     reader.onload = () => setLogoPreview(reader.result);
//     reader.readAsDataURL(f);
//   };

//   const handleSigDraw = (dataUrl) => {
//     setSigDraft(dataUrl);
//     setSigPreview(dataUrl);
//     if (dataUrl) {
//       setSigFile(dataURLtoFile(dataUrl, `signature-${Date.now()}.png`));
//     } else {
//       setSigFile(null);
//     }
//   };

//   const handleSigUpload = (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     setSigFile(f);
//     const reader = new FileReader();
//     reader.onload = () => setSigPreview(reader.result);
//     reader.readAsDataURL(f);
//   };

//   const clearSignature = () => {
//     setSigFile(null);
//     setSigDraft(null);
//     setSigPreview(null);
//     if (sigInputRef.current) sigInputRef.current.value = "";
//   };

//   const switchSigMode = (mode) => {
//     setSigMode(mode);
//     // keep existing preview only if it belongs to that mode's source; simplest: clear on switch
//     if (mode === "draw" && sigFile && !sigDraft) {
//       clearSignature();
//     }
//     if (mode === "upload" && sigDraft) {
//       clearSignature();
//     }
//   };

//   const handleSave = async () => {
//     if (!form.name.trim()) return push("Name is required", "error");
//     if (!form.address.trim()) return push("Address is required", "error");

//     const isCreate = !profile?.profile_id;
//     if (isCreate && !logoFile) return push("Please add a logo", "error");

//     const fd = new FormData();
//     fd.append("name", form.name.trim());
//     fd.append("address", form.address.trim());
//     if (logoFile) fd.append("logo", logoFile);
//     if (sigFile) fd.append("signature", sigFile);

//     setSaving(true);
//     try {
//       const res = isCreate
//         ? await api.post("/profile/create_profile", fd, { headers: { "Content-Type": "multipart/form-data" } })
//         : await api.put("/profile/update_profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
//       push(res.data?.message || "Profile saved", "success");
//       setEditing(false);
//       setLoading(true);
//       const r = await api.get("/profile/get_profile");
//       setProfile(r.data?.data || null);
//       setLoading(false);
//     } catch (err) {
//       push(getErrorMessage(err, "Failed to save profile"), "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <>
//       <style>{CSS}</style>

//       <div className={`zp-overlay${mounted ? " zp-in" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
//         <aside className={`zp-panel${mounted ? " zp-in" : ""}`}>

//           {/* ── header ── */}
//           <div className="zp-hd">
//             <div className="zp-hd-left">
//               <span className="zp-hd-title">{editing ? "Edit Profile" : "Profile"}</span>
//               <span className="zp-logo-info" tabIndex={0}>
//                 <Info size={12} />
//                 <span className="zp-logo-info-tip">
//                   This logo appears automatically on your invoice page — top-left corner — and updates there too whenever you change it.
//                 </span>
//               </span>
//             </div>
//             <button className="zp-icon-btn" onClick={onClose} title="Close">
//               <X size={17} />
//             </button>
//           </div>

//           {/* ── body ── */}
//           <div className="zp-body">
//             {loading ? (
//               <div className="zp-loading">
//                 <div className="zp-skel zp-skel-avatar" />
//                 <div className="zp-skel" style={{ width: "60%", height: 16, marginTop: 18 }} />
//                 <div className="zp-skel" style={{ width: "85%", height: 13, marginTop: 10 }} />
//               </div>
//             ) : (
//               <>
//                 {/* avatar / logo */}
//                 <div className="zp-avatar-wrap">
//                   <div className="zp-avatar-ring">
//                     {(editing ? logoPreview : profile?.logo) ? (
//                       <img src={editing ? logoPreview : profile.logo} alt="" className="zp-avatar-img" />
//                     ) : (
//                       <span className="zp-avatar-fallback">{initialsOf(form.name || profile?.name)}</span>
//                     )}
//                   </div>

//                   {editing && (
//                     <button className="zp-avatar-edit" onClick={() => fileInputRef.current?.click()} title="Change photo">
//                       <Camera size={13} />
//                     </button>
//                   )}
//                   <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
//                 </div>

//                 {!editing ? (
//                   <>
//                     <div className="zp-name">{profile?.name || "—"}</div>

//                     <div className="zp-divider" />

//                     <div className="zp-field-row">
//                       <div className="zp-field-icon"><Building2 size={14} /></div>
//                       <div className="zp-field-col">
//                         <span className="zp-field-label">Business name</span>
//                         <span className="zp-field-val">{profile?.name || "Not set"}</span>
//                       </div>
//                     </div>

//                     <div className="zp-field-row">
//                       <div className="zp-field-icon"><MapPin size={14} /></div>
//                       <div className="zp-field-col">
//                         <span className="zp-field-label">Address</span>
//                         <span className="zp-field-val">{profile?.address || "Not set"}</span>
//                       </div>
//                     </div>

//                     <div className="zp-field-row">
//                       <div className="zp-field-icon"><PenTool size={14} /></div>
//                       <div className="zp-field-col" style={{ width: "100%" }}>
//                         <span className="zp-field-label">Signature</span>
//                         {profile?.signature ? (
//                           <div className="zp-sig-view">
//                             <img src={profile.signature} alt="Signature" className="zp-sig-view-img" />
//                           </div>
//                         ) : (
//                           <span className="zp-field-val">Not set</span>
//                         )}
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="zp-form">
//                     <div className="zp-mfield">
//                       <label className="zp-mlabel">Business name</label>
//                       <input
//                         className="zp-minput"
//                         value={form.name}
//                         onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                         placeholder="e.g. Valli Stay"
//                       />
//                     </div>
//                     <div className="zp-mfield">
//                       <label className="zp-mlabel">Address</label>
//                       <textarea
//                         className="zp-mtextarea"
//                         rows={3}
//                         value={form.address}
//                         onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
//                         placeholder="Full address"
//                       />
//                     </div>

//                     {/* ── signature field ── */}
//                     <div className="zp-mfield">
//                       <label className="zp-mlabel">Signature</label>

//                       <div className="zp-sig-tabs">
//                         <button
//                           type="button"
//                           className={`zp-sig-tab${sigMode === "draw" ? " zp-sig-tab-active" : ""}`}
//                           onClick={() => switchSigMode("draw")}
//                         >
//                           Draw signature
//                         </button>
//                         <button
//                           type="button"
//                           className={`zp-sig-tab${sigMode === "upload" ? " zp-sig-tab-active" : ""}`}
//                           onClick={() => switchSigMode("upload")}
//                         >
//                           Upload signature
//                         </button>
//                       </div>

//                       {sigMode === "draw" ? (
//                         <SignaturePad onChange={handleSigDraw} />
//                       ) : (
//                         <div className="zp-sig-upload">
//                           {sigPreview ? (
//                             <div className="zp-sig-upload-preview">
//                               <img src={sigPreview} alt="Signature" />
//                               <button type="button" className="zp-sig-upload-remove" onClick={clearSignature}>
//                                 <Trash2 size={12} /> Remove
//                               </button>
//                             </div>
//                           ) : (
//                             <button
//                               type="button"
//                               className="zp-sig-upload-btn"
//                               onClick={() => sigInputRef.current?.click()}
//                             >
//                               <Upload size={15} />
//                               <span>Click to upload signature image</span>
//                             </button>
//                           )}
//                           <input
//                             ref={sigInputRef}
//                             type="file"
//                             accept="image/*"
//                             hidden
//                             onChange={handleSigUpload}
//                           />
//                         </div>
//                       )}

//                       <p className="zp-sig-hint">
//                         {sigMode === "draw"
//                           ? "Draw your signature above using your mouse or finger, then it's saved automatically."
//                           : "Upload a clear photo or scan of your signature — PNG with a white or transparent background works best."}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           {/* ── footer ── */}
//           <div className="zp-ft">
//             {!editing ? (
//               <>
//                 <button className="zp-btn-blue" onClick={startEdit} disabled={loading}>
//                   <Pencil size={13} /> Edit profile
//                 </button>
//                 {onLogout && (
//                   <button className="zp-btn-ghost-danger" onClick={onLogout}>
//                     Sign out
//                   </button>
//                 )}
//               </>
//             ) : (
//               <>
//                 <button className="zp-btn-ghost" onClick={cancelEdit} disabled={saving}>
//                   Cancel
//                 </button>
//                 <button className="zp-btn-blue" onClick={handleSave} disabled={saving}>
//                   {saving ? <Loader2 size={13} className="zp-spin" /> : <Check size={13} />}
//                   {saving ? "Saving…" : "Save changes"}
//                 </button>
//               </>
//             )}
//           </div>
//         </aside>
//       </div>

//       <ToastHost />
//     </>
//   );
// }

// /* ═══════════════════════════════════════════════
//    CSS
// ═══════════════════════════════════════════════ */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');

// .zp-overlay {
//   position: fixed; inset: 0; z-index: 99999;
//   background: rgba(17,17,26,0);
//   transition: background 0.32s ease;
//   display: flex; justify-content: flex-end;
// }
// .zp-overlay.zp-in { background: rgba(17,17,26,0.42); }

// .zp-panel {
//   width: 380px; max-width: 92vw; height: 100%;
//   background: #fff; box-shadow: -8px 0 32px rgba(0,0,0,0.14);
//   display: flex; flex-direction: column;
//   font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
//   color: #333;
//   transform: translateX(100%);
//   transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
// }
// .zp-panel.zp-in { transform: translateX(0); }

// .zp-hd {
//   display: flex; align-items: center; justify-content: space-between;
//   padding: 16px 20px; border-bottom: 1px solid #e8e8e8; flex-shrink: 0;
//   position: relative;
// }
// .zp-hd-left { display: flex; align-items: center; gap: 7px; }
// .zp-hd-title { font-size: 15px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.01em; }
// .zp-icon-btn { background: none; border: none; cursor: pointer; color: #8a93a6; padding: 6px; border-radius: 6px; display: flex; }
// .zp-icon-btn:hover { background: #f3f4f6; color: #333; }

// .zp-logo-info {
//   position: relative;
//   width: 18px; height: 18px; border-radius: 50%;
//   background: #f3f4f6; color: #6b7280;
//   display: flex; align-items: center; justify-content: center;
//   cursor: default; outline: none; flex-shrink: 0;
// }
// .zp-logo-info:hover, .zp-logo-info:focus { background: #eaf1ff; color: #3b82f6; }
// .zp-logo-info-tip {
//   position: absolute; top: calc(100% + 11px); left: 0;
//   transform: translateY(4px);
//   background: #1f2937; color: #fff;
//   font-size: 11.5px; font-weight: 600; line-height: 1.45;
//   padding: 10px 12px; border-radius: 9px; width: 220px; text-align: left;
//   opacity: 0; visibility: hidden; pointer-events: none;
//   transition: opacity 0.15s ease, transform 0.15s ease;
//   box-shadow: 0 10px 26px rgba(0,0,0,0.22);
//   z-index: 40;
// }
// .zp-logo-info-tip::after {
//   content: ""; position: absolute; bottom: 100%; left: 14px;
//   border: 6px solid transparent; border-bottom-color: #1f2937;
// }
// .zp-logo-info:hover .zp-logo-info-tip,
// .zp-logo-info:focus .zp-logo-info-tip {
//   opacity: 1; visibility: visible; transform: translateY(0);
// }

// .zp-body { flex: 1; overflow-y: auto; padding: 28px 20px 20px; display: flex; flex-direction: column; }

// .zp-loading { display: flex; flex-direction: column; align-items: center; padding-top: 8px; }
// @keyframes zp-shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
// .zp-skel { background: #edeef3; border-radius: 6px; animation: zp-shimmer 1.3s infinite; }
// .zp-skel-avatar { width: 88px; height: 88px; border-radius: 50%; }

// .zp-avatar-wrap { position: relative; display: flex; justify-content: center; margin-bottom: 14px; }
// .zp-avatar-ring {
//   width: 88px; height: 88px; border-radius: 50%;
//   border: 3px solid #eaf1ff; overflow: hidden;
//   display: flex; align-items: center; justify-content: center;
//   background: #eff6ff; flex-shrink: 0;
// }
// .zp-avatar-img { width: 100%; height: 100%; object-fit: cover; }
// .zp-avatar-fallback { font-size: 28px; font-weight: 700; color: #3b82f6; }
// .zp-avatar-edit {
//   position: absolute; bottom: 0; right: calc(50% - 44px + 2px);
//   width: 28px; height: 28px; border-radius: 50%;
//   background: #3b82f6; border: 2px solid #fff; color: #fff;
//   display: flex; align-items: center; justify-content: center; cursor: pointer;
// }
// .zp-avatar-edit:hover { background: #2563eb; }

// .zp-name { font-size: 17px; font-weight: 700; color: #111; text-align: center; }
// .zp-since { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 3px; }

// .zp-divider { height: 1px; background: #eef0f4; margin: 20px 0 4px; }

// .zp-field-row { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f3f4f6; align-items: flex-start; }
// .zp-field-icon {
//   width: 30px; height: 30px; border-radius: 8px; background: #f5f7fb;
//   color: #6b7280; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
// }
// .zp-field-col { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
// .zp-field-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
// .zp-field-val { font-size: 13.5px; color: #1f2937; line-height: 1.45; word-break: break-word; }

// .zp-sig-view {
//   margin-top: 4px; border: 1px solid #eef0f4; border-radius: 8px;
//   background: #fafbfc; padding: 8px 10px; display: flex; align-items: center;
// }
// .zp-sig-view-img { max-height: 46px; max-width: 100%; object-fit: contain; }

// .zp-form { display: flex; flex-direction: column; gap: 16px; margin-top: 4px; }
// .zp-mfield { display: flex; flex-direction: column; gap: 6px; }
// .zp-mlabel { font-size: 12px; font-weight: 600; color: #555; }
// .zp-minput, .zp-mtextarea {
//   border: 1px solid #d0d5dd; border-radius: 6px;
//   padding: 9px 10px; font-size: 13.5px; font-family: inherit; color: #333;
//   outline: none; width: 100%; resize: vertical;
// }
// .zp-minput:focus, .zp-mtextarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

// /* ── signature ── */
// .zp-sig-tabs { display: flex; border: 1px solid #e5e7eb; border-radius: 7px; overflow: hidden; }
// .zp-sig-tab {
//   flex: 1; padding: 8px 10px; font-size: 12.5px; font-weight: 600; font-family: inherit;
//   background: #f9fafb; color: #6b7280; border: none; cursor: pointer;
// }
// .zp-sig-tab + .zp-sig-tab { border-left: 1px solid #e5e7eb; }
// .zp-sig-tab-active { background: #eaf1ff; color: #3b82f6; }

// .zp-sigpad-wrap { position: relative; margin-top: 8px; }
// .zp-sigpad-canvas {
//   width: 100%; height: 140px; border: 1px solid #d0d5dd; border-radius: 8px;
//   background: #fff; touch-action: none; cursor: crosshair;
// }
// .zp-sigpad-clear {
//   position: absolute; bottom: 8px; right: 8px;
//   display: inline-flex; align-items: center; gap: 4px;
//   background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
//   font-size: 11px; font-weight: 600; color: #6b7280;
//   padding: 4px 8px; cursor: pointer; font-family: inherit;
// }
// .zp-sigpad-clear:hover { background: #f9fafb; color: #ef4444; border-color: #fecaca; }

// .zp-sig-upload { margin-top: 8px; }
// .zp-sig-upload-btn {
//   width: 100%; height: 100px; border: 1.5px dashed #d0d5dd; border-radius: 8px;
//   background: #fafbfc; color: #6b7280; display: flex; flex-direction: column;
//   align-items: center; justify-content: center; gap: 6px; cursor: pointer;
//   font-size: 12.5px; font-weight: 600; font-family: inherit;
// }
// .zp-sig-upload-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #f5f9ff; }
// .zp-sig-upload-preview {
//   border: 1px solid #d0d5dd; border-radius: 8px; padding: 10px;
//   display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fff;
// }
// .zp-sig-upload-preview img { max-height: 70px; max-width: 100%; object-fit: contain; }
// .zp-sig-upload-remove {
//   display: inline-flex; align-items: center; gap: 4px;
//   background: #fff; border: 1px solid #fecaca; color: #ef4444; border-radius: 6px;
//   font-size: 11px; font-weight: 600; padding: 4px 8px; cursor: pointer; font-family: inherit;
// }
// .zp-sig-upload-remove:hover { background: #fef2f2; }

// .zp-sig-hint { font-size: 11px; color: #9ca3af; line-height: 1.5; margin-top: 6px; }

// .zp-ft {
//   display: flex; align-items: center; gap: 10px;
//   padding: 16px 20px; border-top: 1px solid #e8e8e8; flex-shrink: 0;
// }
// .zp-btn-blue {
//   flex: 1; height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
//   background: #3b82f6; color: #fff; border: none; border-radius: 7px;
//   font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit;
// }
// .zp-btn-blue:hover:not(:disabled) { background: #2563eb; }
// .zp-btn-blue:disabled { opacity: 0.7; cursor: not-allowed; }
// .zp-btn-ghost {
//   flex: 1; height: 38px; background: #fff; color: #374151; border: 1px solid #d0d5dd;
//   border-radius: 7px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit;
// }
// .zp-btn-ghost:hover:not(:disabled) { background: #f9fafb; border-color: #9ca3af; }
// .zp-btn-ghost-danger {
//   height: 38px; padding: 0 14px; background: #fff; color: #ef4444; border: 1px solid #fecaca;
//   border-radius: 7px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit;
// }
// .zp-btn-ghost-danger:hover { background: #fef2f2; }

// @keyframes zp-spin { to { transform: rotate(360deg); } }
// .zp-spin { animation: zp-spin 0.7s linear infinite; }

// @media (max-width: 480px) {
//   .zp-panel { width: 100vw; max-width: 100vw; }
// }
// `;



















import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useToast } from "./Stays/Rooms/Room_Shared";
import { X, Pencil, Camera, MapPin, Building2, Check, Loader2, Info, PenTool, Upload, Trash2, Percent, Globe2, Home } from "lucide-react";
import GstInput, { cleanGst, gstError } from "./GstInput";


/* ── helpers ── */
function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function getErrorMessage(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return typeof data.error === "string" ? data.error : fallback;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return fallback;
}

const fmtDate = (raw) => {
  const ms = raw?.$date ?? raw;
  if (!ms) return "";
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtPct = (val) => {
  if (val === null || val === undefined || val === "") return "Not set";
  const n = Number(val);
  if (isNaN(n)) return "Not set";
  return `${n}%`;
};

/* dataURL -> File */
function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

/**
 * SignaturePad — canvas based draw signature
 */
function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

  const getCtx = () => canvasRef.current?.getContext("2d");

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getPos(e);
    const ctx = getCtx();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = getCtx();
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawn.current = true;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasDrawn.current) {
      const canvas = canvasRef.current;
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    onChange(null);
  };

  return (
    <div className="zp-sigpad-wrap">
      <canvas
        ref={canvasRef}
        className="zp-sigpad-canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <button type="button" className="zp-sigpad-clear" onClick={clear} title="Clear">
        <Trash2 size={12} /> Clear
      </button>
    </div>
  );
}

/**
 * Profile — slide-in drawer, view + inline edit.
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onLogout: () => void   (optional — renders a "Sign out" row in the footer)
 */
export default function Profile({ isOpen, onClose, onLogout }) {
  const { push, ToastHost } = useToast();

  const [render, setRender] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    domestic_platform_fee_percentage: "",
    international_platform_fee_percentage: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  /* ── signature state ── */
  const [sigMode, setSigMode] = useState("draw"); // "draw" | "upload"
  const [sigFile, setSigFile] = useState(null);       // File object to send
  const [sigPreview, setSigPreview] = useState(null);  // dataURL / URL for preview
  const [sigDraft, setSigDraft] = useState(null);      // latest dataURL from pad
  const sigInputRef = useRef(null);
const [gstNumber, setGstNumber] = useState("");
  /* mount / animate in-out */
  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setMounted(false);
      const t = setTimeout(() => setRender(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* fetch on open */
  useEffect(() => {
    if (!isOpen) return;
    setEditing(false);
    setLoading(true);
    api
      .get("/profile/get_profile")
      .then((r) => setProfile(r.data?.data || null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [isOpen]);

  /* lock body scroll while open */
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!render) return null;

  const startEdit = () => {
    setForm({
      name: profile?.name || "",
      address: profile?.address || "",
      domestic_platform_fee_percentage:
        profile?.domestic_platform_fee_percentage ?? "",
      international_platform_fee_percentage:
        profile?.international_platform_fee_percentage ?? "",
    });
    setGstNumber(cleanGst(profile?.gst_number));
    setLogoFile(null);
    setLogoPreview(profile?.logo || null);

    setSigFile(null);
    setSigDraft(null);
    setSigPreview(profile?.signature || null);
    setSigMode("draw");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setLogoFile(null);
    setSigFile(null);
    setSigDraft(null);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSigDraw = (dataUrl) => {
    setSigDraft(dataUrl);
    setSigPreview(dataUrl);
    if (dataUrl) {
      setSigFile(dataURLtoFile(dataUrl, `signature-${Date.now()}.png`));
    } else {
      setSigFile(null);
    }
  };

  const handleSigUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSigFile(f);
    const reader = new FileReader();
    reader.onload = () => setSigPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const clearSignature = () => {
    setSigFile(null);
    setSigDraft(null);
    setSigPreview(null);
    if (sigInputRef.current) sigInputRef.current.value = "";
  };

  const switchSigMode = (mode) => {
    setSigMode(mode);
    // keep existing preview only if it belongs to that mode's source; simplest: clear on switch
    if (mode === "draw" && sigFile && !sigDraft) {
      clearSignature();
    }
    if (mode === "upload" && sigDraft) {
      clearSignature();
    }
  };

  /* only allow numbers 0-100 with up to 2 decimals */
  const handlePctChange = (field) => (e) => {
    let v = e.target.value;
    if (v === "") {
      setForm((f) => ({ ...f, [field]: "" }));
      return;
    }
    if (!/^\d{0,3}(\.\d{0,2})?$/.test(v)) return;
    if (Number(v) > 100) return;
    setForm((f) => ({ ...f, [field]: v }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return push("Name is required", "error");
    if (!form.address.trim()) return push("Address is required", "error");
const gstErr = gstError(gstNumber);
if (gstErr) return push(gstErr, "error");
    const isCreate = !profile?.profile_id;
    if (isCreate && !logoFile) return push("Please add a logo", "error");

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("address", form.address.trim());
    fd.append(
      "domestic_platform_fee_percentage",
      form.domestic_platform_fee_percentage === "" ? "0" : form.domestic_platform_fee_percentage
    );
    fd.append(
      "international_platform_fee_percentage",
      form.international_platform_fee_percentage === "" ? "0" : form.international_platform_fee_percentage
    );
    fd.append("gst_number", gstNumber);
    if (logoFile) fd.append("logo", logoFile);
    if (sigFile) fd.append("signature", sigFile);

    setSaving(true);
    try {
      const res = isCreate
        ? await api.post("/profile/create_profile", fd, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.put("/profile/update_profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      push(res.data?.message || "Profile saved", "success");
      setEditing(false);
      setLoading(true);
      const r = await api.get("/profile/get_profile");
      setProfile(r.data?.data || null);
      setLoading(false);
    } catch (err) {
      push(getErrorMessage(err, "Failed to save profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className={`zp-overlay${mounted ? " zp-in" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <aside className={`zp-panel${mounted ? " zp-in" : ""}`}>

          {/* ── header ── */}
          <div className="zp-hd">
            <div className="zp-hd-left">
              <span className="zp-hd-title">{editing ? "Edit Profile" : "Profile"}</span>
              <span className="zp-logo-info" tabIndex={0}>
                <Info size={12} />
                <span className="zp-logo-info-tip">
                  This logo appears automatically on your invoice page — top-left corner — and updates there too whenever you change it.
                </span>
              </span>
            </div>
            <button className="zp-icon-btn" onClick={onClose} title="Close">
              <X size={17} />
            </button>
          </div>

          {/* ── body ── */}
          <div className="zp-body">
            {loading ? (
              <div className="zp-loading">
                <div className="zp-skel zp-skel-avatar" />
                <div className="zp-skel" style={{ width: "60%", height: 16, marginTop: 18 }} />
                <div className="zp-skel" style={{ width: "85%", height: 13, marginTop: 10 }} />
              </div>
            ) : (
              <>
                {/* avatar / logo */}
                <div className="zp-avatar-wrap">
                  <div className="zp-avatar-ring">
                    {(editing ? logoPreview : profile?.logo) ? (
                      <img src={editing ? logoPreview : profile.logo} alt="" className="zp-avatar-img" />
                    ) : (
                      <span className="zp-avatar-fallback">{initialsOf(form.name || profile?.name)}</span>
                    )}
                  </div>

                  {editing && (
                    <button className="zp-avatar-edit" onClick={() => fileInputRef.current?.click()} title="Change photo">
                      <Camera size={13} />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
                </div>

                {!editing ? (
                  <>
                    <div className="zp-name">{profile?.name || "—"}</div>

                    <div className="zp-divider" />

                    <div className="zp-grid">
                      <div className="zp-field-row">
                        <div className="zp-field-icon"><Building2 size={14} /></div>
                        <div className="zp-field-col">
                          <span className="zp-field-label">Business name</span>
                          <span className="zp-field-val">{profile?.name || "Not set"}</span>
                        </div>
                      </div>

                      <div className="zp-field-row">
                        <div className="zp-field-icon"><MapPin size={14} /></div>
                        <div className="zp-field-col">
                          <span className="zp-field-label">Address</span>
                          <span className="zp-field-val">{profile?.address || "Not set"}</span>
                        </div>
                      </div>


                      <div className="zp-field-row">
  <div className="zp-field-icon"><Building2 size={14} /></div>
  <div className="zp-field-col">
    <span className="zp-field-label">GST number</span>
    <span className="zp-field-val">{profile?.gst_number || "Not set"}</span>
  </div>
</div>

                      <div className="zp-field-row zp-field-row-split">
                        <div className="zp-split-item">
                          <div className="zp-field-icon"><Home size={14} /></div>
                          <div className="zp-field-col">
                            <span className="zp-field-label">Domestic fee</span>
                            <span className="zp-field-val">{fmtPct(profile?.domestic_platform_fee_percentage)}</span>
                          </div>
                        </div>
                        <div className="zp-split-item">
                          <div className="zp-field-icon"><Globe2 size={14} /></div>
                          <div className="zp-field-col">
                            <span className="zp-field-label">International fee</span>
                            <span className="zp-field-val">{fmtPct(profile?.international_platform_fee_percentage)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="zp-field-row">
                        <div className="zp-field-icon"><PenTool size={14} /></div>
                        <div className="zp-field-col" style={{ width: "100%" }}>
                          <span className="zp-field-label">Signature</span>
                          {profile?.signature ? (
                            <div className="zp-sig-view">
                              <img src={profile.signature} alt="Signature" className="zp-sig-view-img" />
                            </div>
                          ) : (
                            <span className="zp-field-val">Not set</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="zp-form">
                    <div className="zp-mrow">
                      <div className="zp-mfield">
                        <label className="zp-mlabel">Business name</label>
                        <input
                          className="zp-minput"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Valli Stay"
                        />
                      </div>
                    </div>

                    <div className="zp-mfield">
                      <label className="zp-mlabel">Address</label>
                      <textarea
                        className="zp-mtextarea"
                        rows={3}
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="Full address"
                      />
                    </div>

                    <GstInput value={gstNumber} onChange={setGstNumber} />

                    {/* ── platform fee fields ── */}
                    <div className="zp-mfield">
                      <label className="zp-mlabel">
                        Platform convenience fee
                        <span className="zp-logo-info" tabIndex={0} style={{ marginLeft: 6, verticalAlign: "middle" }}>
                          <Info size={11} />
                          <span className="zp-logo-info-tip">
                            This percentage is added on top as a Razorpay convenience fee and applied automatically to invoices based on whether the customer is domestic or international.
                          </span>
                        </span>
                      </label>

                      <div className="zp-fee-row">
                        <div className="zp-fee-item">
                          <span className="zp-fee-tag zp-fee-tag-domestic"><Home size={12} /> Domestic</span>
                          <div className="zp-pct-wrap">
                            <input
                              className="zp-minput zp-pct-input"
                              type="text"
                              inputMode="decimal"
                              value={form.domestic_platform_fee_percentage}
                              onChange={handlePctChange("domestic_platform_fee_percentage")}
                              placeholder="0.0"
                            />
                            <Percent size={13} className="zp-pct-icon" />
                          </div>
                        </div>

                        <div className="zp-fee-item">
                          <span className="zp-fee-tag zp-fee-tag-intl"><Globe2 size={12} /> International</span>
                          <div className="zp-pct-wrap">
                            <input
                              className="zp-minput zp-pct-input"
                              type="text"
                              inputMode="decimal"
                              value={form.international_platform_fee_percentage}
                              onChange={handlePctChange("international_platform_fee_percentage")}
                              placeholder="0.0"
                            />
                            <Percent size={13} className="zp-pct-icon" />
                          </div>
                        </div>
                      </div>
                      <p className="zp-sig-hint">
                        Set separate convenience-fee percentages for domestic and international Guest — these get added to invoices automatically at billing time.
                      </p>
                    </div>

                    {/* ── signature field ── */}
                    <div className="zp-mfield">
                      <label className="zp-mlabel">Signature</label>

                      <div className="zp-sig-tabs">
                        <button
                          type="button"
                          className={`zp-sig-tab${sigMode === "draw" ? " zp-sig-tab-active" : ""}`}
                          onClick={() => switchSigMode("draw")}
                        >
                          Draw signature
                        </button>
                        <button
                          type="button"
                          className={`zp-sig-tab${sigMode === "upload" ? " zp-sig-tab-active" : ""}`}
                          onClick={() => switchSigMode("upload")}
                        >
                          Upload signature
                        </button>
                      </div>

                      {sigMode === "draw" ? (
                        <SignaturePad onChange={handleSigDraw} />
                      ) : (
                        <div className="zp-sig-upload">
                          {sigPreview ? (
                            <div className="zp-sig-upload-preview">
                              <img src={sigPreview} alt="Signature" />
                              <button type="button" className="zp-sig-upload-remove" onClick={clearSignature}>
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="zp-sig-upload-btn"
                              onClick={() => sigInputRef.current?.click()}
                            >
                              <Upload size={15} />
                              <span>Click to upload signature image</span>
                            </button>
                          )}
                          <input
                            ref={sigInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleSigUpload}
                          />
                        </div>
                      )}

                      <p className="zp-sig-hint">
                        {sigMode === "draw"
                          ? "Draw your signature above using your mouse or finger, then it's saved automatically."
                          : "Upload a clear photo or scan of your signature — PNG with a white or transparent background works best."}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── footer ── */}
          <div className="zp-ft">
            {!editing ? (
              <>
                <button className="zp-btn-blue" onClick={startEdit} disabled={loading}>
                  <Pencil size={13} /> Edit profile
                </button>
                {onLogout && (
                  <button className="zp-btn-ghost-danger" onClick={onLogout}>
                    Sign out
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="zp-btn-ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button className="zp-btn-blue" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={13} className="zp-spin" /> : <Check size={13} />}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      <ToastHost />
    </>
  );
}

/* ═══════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');

.zp-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(17,17,26,0);
  transition: background 0.32s ease;
  display: flex; justify-content: flex-end;
}
.zp-overlay.zp-in { background: rgba(17,17,26,0.42); }

.zp-panel {
  width: 460px; max-width: 94vw; height: 100%;
  background: #fff; box-shadow: -8px 0 32px rgba(0,0,0,0.14);
  display: flex; flex-direction: column;
  font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #333;
  transform: translateX(100%);
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.zp-panel.zp-in { transform: translateX(0); }

.zp-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 26px; border-bottom: 1px solid #e8e8e8; flex-shrink: 0;
  position: relative;
}
.zp-hd-left { display: flex; align-items: center; gap: 7px; }
.zp-hd-title { font-size: 16px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.01em; }
.zp-icon-btn { background: none; border: none; cursor: pointer; color: #8a93a6; padding: 6px; border-radius: 6px; display: flex; }
.zp-icon-btn:hover { background: #f3f4f6; color: #333; }

.zp-logo-info {
  position: relative;
  width: 18px; height: 18px; border-radius: 50%;
  background: #f3f4f6; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  cursor: default; outline: none; flex-shrink: 0;
}
.zp-logo-info:hover, .zp-logo-info:focus { background: #eaf1ff; color: #3b82f6; }
.zp-logo-info-tip {
  position: absolute; top: calc(100% + 11px); left: 0;
  transform: translateY(4px);
  background: #1f2937; color: #fff;
  font-size: 11.5px; font-weight: 600; line-height: 1.45;
  padding: 10px 12px; border-radius: 9px; width: 230px; text-align: left;
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  box-shadow: 0 10px 26px rgba(0,0,0,0.22);
  z-index: 40;
}
.zp-logo-info-tip::after {
  content: ""; position: absolute; bottom: 100%; left: 14px;
  border: 6px solid transparent; border-bottom-color: #1f2937;
}
.zp-logo-info:hover .zp-logo-info-tip,
.zp-logo-info:focus .zp-logo-info-tip {
  opacity: 1; visibility: visible; transform: translateY(0);
}

.zp-body { flex: 1; overflow-y: auto; padding: 30px 26px 22px; display: flex; flex-direction: column; }

.zp-loading { display: flex; flex-direction: column; align-items: center; padding-top: 8px; }
@keyframes zp-shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
.zp-skel { background: #edeef3; border-radius: 6px; animation: zp-shimmer 1.3s infinite; }
.zp-skel-avatar { width: 92px; height: 92px; border-radius: 50%; }

.zp-avatar-wrap { position: relative; display: flex; justify-content: center; margin-bottom: 16px; }
.zp-avatar-ring {
  width: 92px; height: 92px; border-radius: 50%;
  border: 3px solid #eaf1ff; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: #eff6ff; flex-shrink: 0;
}
.zp-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.zp-avatar-fallback { font-size: 30px; font-weight: 700; color: #3b82f6; }
.zp-avatar-edit {
  position: absolute; bottom: 0; right: calc(50% - 46px + 2px);
  width: 29px; height: 29px; border-radius: 50%;
  background: #3b82f6; border: 2px solid #fff; color: #fff;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.zp-avatar-edit:hover { background: #2563eb; }

.zp-name { font-size: 18px; font-weight: 700; color: #111; text-align: center; }
.zp-since { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 3px; }

.zp-divider { height: 1px; background: #eef0f4; margin: 22px 0 4px; }

.zp-grid { display: flex; flex-direction: column; }

.zp-field-row { display: flex; gap: 14px; padding: 15px 0; border-bottom: 1px solid #f3f4f6; align-items: flex-start; }
.zp-field-row-split { gap: 22px; }
.zp-split-item { flex: 1; display: flex; gap: 12px; align-items: flex-start; min-width: 0; }

.zp-field-icon {
  width: 32px; height: 32px; border-radius: 8px; background: #f5f7fb;
  color: #6b7280; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
}
.zp-field-col { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.zp-field-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
.zp-field-val { font-size: 14px; color: #1f2937; line-height: 1.5; word-break: break-word; }

.zp-sig-view {
  margin-top: 4px; border: 1px solid #eef0f4; border-radius: 8px;
  background: #fafbfc; padding: 10px 12px; display: flex; align-items: center;
}
.zp-sig-view-img { max-height: 48px; max-width: 100%; object-fit: contain; }

.zp-form { display: flex; flex-direction: column; gap: 18px; margin-top: 4px; }
.zp-mrow { display: flex; gap: 14px; }
.zp-mrow .zp-mfield { flex: 1; min-width: 0; }
.zp-mfield { display: flex; flex-direction: column; gap: 7px; }
.zp-mlabel { font-size: 12.5px; font-weight: 600; color: #555; display: flex; align-items: center; }
.zp-minput, .zp-mtextarea {
  border: 1px solid #d0d5dd; border-radius: 7px;
  padding: 10px 12px; font-size: 14px; font-family: inherit; color: #333;
  outline: none; width: 100%; resize: vertical; box-sizing: border-box;
}
.zp-minput:focus, .zp-mtextarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

/* ── platform fee ── */
.zp-fee-row { display: flex; gap: 14px; flex-wrap: wrap; }
.zp-fee-item { flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 8px; }
.zp-fee-tag {
  display: inline-flex; align-items: center; gap: 5px; width: fit-content;
  font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px;
}
.zp-fee-tag-domestic { background: #ecfdf5; color: #059669; }
.zp-fee-tag-intl { background: #eff6ff; color: #2563eb; }
.zp-pct-wrap { position: relative; }
.zp-pct-input { padding-right: 30px; }
.zp-pct-icon { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }

/* ── signature ── */
.zp-sig-tabs { display: flex; border: 1px solid #e5e7eb; border-radius: 7px; overflow: hidden; }
.zp-sig-tab {
  flex: 1; padding: 9px 10px; font-size: 13px; font-weight: 600; font-family: inherit;
  background: #f9fafb; color: #6b7280; border: none; cursor: pointer;
}
.zp-sig-tab + .zp-sig-tab { border-left: 1px solid #e5e7eb; }
.zp-sig-tab-active { background: #eaf1ff; color: #3b82f6; }

.zp-sigpad-wrap { position: relative; margin-top: 8px; }
.zp-sigpad-canvas {
  width: 100%; height: 150px; border: 1px solid #d0d5dd; border-radius: 8px;
  background: #fff; touch-action: none; cursor: crosshair;
}
.zp-sigpad-clear {
  position: absolute; bottom: 8px; right: 8px;
  display: inline-flex; align-items: center; gap: 4px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 11px; font-weight: 600; color: #6b7280;
  padding: 4px 8px; cursor: pointer; font-family: inherit;
}
.zp-sigpad-clear:hover { background: #f9fafb; color: #ef4444; border-color: #fecaca; }

.zp-sig-upload { margin-top: 8px; }
.zp-sig-upload-btn {
  width: 100%; height: 106px; border: 1.5px dashed #d0d5dd; border-radius: 8px;
  background: #fafbfc; color: #6b7280; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px; cursor: pointer;
  font-size: 13px; font-weight: 600; font-family: inherit;
}
.zp-sig-upload-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #f5f9ff; }
.zp-sig-upload-preview {
  border: 1px solid #d0d5dd; border-radius: 8px; padding: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fff;
}
.zp-sig-upload-preview img { max-height: 74px; max-width: 100%; object-fit: contain; }
.zp-sig-upload-remove {
  display: inline-flex; align-items: center; gap: 4px;
  background: #fff; border: 1px solid #fecaca; color: #ef4444; border-radius: 6px;
  font-size: 11px; font-weight: 600; padding: 4px 8px; cursor: pointer; font-family: inherit;
}
.zp-sig-upload-remove:hover { background: #fef2f2; }

.zp-sig-hint { font-size: 11.5px; color: #9ca3af; line-height: 1.55; margin-top: 6px; }

.zp-ft {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 26px; border-top: 1px solid #e8e8e8; flex-shrink: 0;
}
.zp-btn-blue {
  flex: 1; height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  background: #3b82f6; color: #fff; border: none; border-radius: 7px;
  font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.zp-btn-blue:hover:not(:disabled) { background: #2563eb; }
.zp-btn-blue:disabled { opacity: 0.7; cursor: not-allowed; }
.zp-btn-ghost {
  flex: 1; height: 40px; background: #fff; color: #374151; border: 1px solid #d0d5dd;
  border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.zp-btn-ghost:hover:not(:disabled) { background: #f9fafb; border-color: #9ca3af; }
.zp-btn-ghost-danger {
  height: 40px; padding: 0 16px; background: #fff; color: #ef4444; border: 1px solid #fecaca;
  border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.zp-btn-ghost-danger:hover { background: #fef2f2; }

@keyframes zp-spin { to { transform: rotate(360deg); } }
.zp-spin { animation: zp-spin 0.7s linear infinite; }

/* ── Tablet (landscape/portrait) ── */
@media (max-width: 1024px) and (min-width: 769px) {
  .zp-panel { width: 440px; }
  .zp-body { padding: 28px 24px 20px; }
}

/* ── Tablet / small tablet ── */
@media (max-width: 768px) {
  .zp-panel { width: 62vw; min-width: 380px; max-width: 92vw; }
  .zp-hd { padding: 16px 22px; }
  .zp-body { padding: 26px 22px 20px; }
  .zp-ft { padding: 16px 22px; }
  .zp-fee-row { gap: 12px; }
  .zp-fee-item { min-width: 140px; }
}

/* ── Mobile ── */
@media (max-width: 480px) {
  .zp-panel { width: 100vw; max-width: 100vw; min-width: 0; }
  .zp-hd { padding: 14px 18px; }
  .zp-body { padding: 22px 18px 18px; }
  .zp-ft { padding: 14px 18px; flex-wrap: wrap; }
  .zp-field-row-split { flex-direction: column; gap: 14px; }
  .zp-fee-row { flex-direction: column; }
}
`;