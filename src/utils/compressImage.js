export async function compressImage(file, { maxBytes = 300 * 1024, maxDim = 800 } = {}) {
  const kb = (n) => (n / 1024).toFixed(0) + " KB";
  if (!file || !file.type?.startsWith("image/")) return file; // PDFs pass through
  if (file.size <= maxBytes) {
    console.log(`⚪ [compress] skip ${file.name} (${kb(file.size)})`);
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    console.error("🔴 [compress] decode failed, sending original", err);
    return file;
  }

  let scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  let quality = 0.8;
  let blob = null;

  for (let i = 0; i < 20; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= maxBytes) break;
    if (quality > 0.5) quality -= 0.1; else scale *= 0.85;
  }
  bitmap.close?.();
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  const out = new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  console.log(`✅ [compress] ${file.name}: ${kb(file.size)} → ${kb(out.size)}`);
  return out;
}