export const SITE_URL = "https://imagetools-ai.whop.site";

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = i === 0 || n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return `${n.toFixed(digits)} ${units[i]}`;
}

export function extFromName(name) {
  const match = String(name || "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

export function mimeFromExt(ext) {
  const map = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",
  };
  return map[String(ext).toLowerCase()] || "";
}

export function extFromMime(mime) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "application/pdf": "pdf",
  };
  return map[mime] || "bin";
}

export function replaceExt(name, ext) {
  const base = String(name || "image").replace(/\.[a-z0-9]+$/i, "");
  return `${base || "image"}.${ext}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not read this image. Try a JPG, PNG, WebP, BMP, or TIFF file."));
    img.src = src;
  });
}

export async function blobToImage(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageElement(url);
    img.dataset.objectUrl = url;
    return img;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function imageToCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width ?? (img.naturalWidth || img.width)));
  canvas.height = Math.max(1, Math.round(height ?? (img.naturalHeight || img.height)));
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas, mime = "image/png", quality) {
  return new Promise((resolve, reject) => {
    const type = mime === "image/jpg" ? "image/jpeg" : mime;
    const q = typeof quality === "number" ? quality : undefined;
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not encode the image in this browser."));
        else resolve(blob);
      },
      type,
      q,
    );
  });
}

const ALERT_ICON =
  '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 1 21h22z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

export function showError(node, message) {
  if (!node) return;
  node.hidden = !message;
  if (!message) {
    node.textContent = "";
    return;
  }
  node.innerHTML = "";
  const icon = document.createElement("span");
  icon.className = "error-icon";
  icon.innerHTML = ALERT_ICON;
  const text = document.createElement("span");
  text.textContent = message;
  node.append(icon, text);
}

export function setBusy(root, button, busy) {
  if (root) root.classList.toggle("is-busy", busy);
  if (button) button.classList.toggle("is-loading", busy);
}

export function flashSuccess(button, duration = 1600) {
  if (!button) return;
  button.classList.add("is-success");
  clearTimeout(button._successTimer);
  button._successTimer = setTimeout(() => {
    button.classList.remove("is-success");
  }, duration);
}

export function setMeta(root, file, img) {
  const name = root.querySelector("[data-meta=name]");
  const size = root.querySelector("[data-meta=size]");
  const dims = root.querySelector("[data-meta=dims]");
  const format = root.querySelector("[data-meta=format]");
  if (name) name.textContent = file?.name || " - ";
  if (size) size.textContent = file ? formatBytes(file.size) : " - ";
  if (dims) {
    dims.textContent =
      img && (img.naturalWidth || img.width)
        ? `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}`
        : " - ";
  }
  if (format) {
    format.textContent = (file?.type || mimeFromExt(extFromName(file?.name)) || "unknown")
      .replace("image/", "")
      .toUpperCase();
  }
}

function isAllowedFile(file, accept) {
  if (!accept || accept === "image/*") {
    return file.type.startsWith("image/") || Boolean(mimeFromExt(extFromName(file.name)));
  }
  const tokens = accept.split(",").map((part) => part.trim().toLowerCase());
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  return tokens.some((token) => {
    if (token === "image/*") return type.startsWith("image/") || Boolean(mimeFromExt(extFromName(name)));
    if (token.startsWith(".")) return name.endsWith(token);
    return type === token;
  });
}

export function initUploader({
  root,
  accept = "image/*",
  multiple = false,
  onFiles,
}) {
  const dropzone = root.querySelector("[data-dropzone]");
  const input = root.querySelector("[data-file]");
  const error = root.querySelector("[data-error]");
  if (!dropzone || !input) return;

  input.accept = accept;
  input.multiple = multiple;

  const handleList = (list) => {
    const files = [...list].filter(Boolean);
    if (!files.length) return;
    const bad = files.find((file) => !isAllowedFile(file, accept));
    if (bad) {
      showError(error, `“${bad.name}” is not a supported image for this tool.`);
      return;
    }
    showError(error, "");
    onFiles(multiple ? files : files[0]);
  };

  dropzone.addEventListener("click", () => input.click());
  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", () => {
    handleList(input.files || []);
    input.value = "";
  });
  ["dragenter", "dragover"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-over");
    });
  });
  dropzone.addEventListener("drop", (event) => {
    handleList(event.dataTransfer?.files || []);
  });
  document.addEventListener("paste", (event) => {
    const items = [...(event.clipboardData?.items || [])]
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (items.length) {
      event.preventDefault();
      handleList(items);
    }
  });
}

export function decodeBmp(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 54 || view.getUint16(0, false) !== 0x424d) {
    throw new Error("This BMP file is not supported.");
  }
  const offset = view.getUint32(10, true);
  const headerSize = view.getUint32(14, true);
  const width = view.getInt32(18, true);
  const height = view.getInt32(22, true);
  const bits = view.getUint16(28, true);
  const compression = view.getUint32(30, true);
  if (compression !== 0 || (bits !== 24 && bits !== 32)) {
    throw new Error("Only uncompressed 24-bit or 32-bit BMP files can be converted here.");
  }
  const w = Math.abs(width);
  const h = Math.abs(height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(w, h);
  const rowSize = Math.floor((bits * w + 31) / 32) * 4;
  const start = offset || 14 + headerSize;
  for (let y = 0; y < h; y += 1) {
    const srcY = height > 0 ? h - 1 - y : y;
    for (let x = 0; x < w; x += 1) {
      const i = start + srcY * rowSize + x * (bits / 8);
      const o = (y * w + x) * 4;
      image.data[o] = view.getUint8(i + 2);
      image.data[o + 1] = view.getUint8(i + 1);
      image.data[o + 2] = view.getUint8(i);
      image.data[o + 3] = bits === 32 ? view.getUint8(i + 3) : 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export async function decodeTiff(buffer) {
  const mod = await import("utif");
  const UTIF = mod.default || mod;
  const ifds = UTIF.decode(buffer);
  if (!ifds.length) throw new Error("Could not read this TIFF file.");
  UTIF.decodeImage(buffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const canvas = document.createElement("canvas");
  canvas.width = ifds[0].width;
  canvas.height = ifds[0].height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(canvas.width, canvas.height);
  image.data.set(rgba);
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export async function fileToCanvas(file) {
  const ext = extFromName(file.name);
  const type = file.type || mimeFromExt(ext);
  if (type === "image/bmp" || ext === "bmp") {
    try {
      const img = await blobToImage(file);
      return imageToCanvas(img);
    } catch {
      return decodeBmp(await file.arrayBuffer());
    }
  }
  if (type === "image/tiff" || ext === "tif" || ext === "tiff") {
    return decodeTiff(await file.arrayBuffer());
  }
  const img = await blobToImage(file);
  return imageToCanvas(img);
}

export function canvasToImage(canvas) {
  return loadImageElement(canvas.toDataURL("image/png"));
}

export function fitSize(width, height, maxW, maxH) {
  let w = width;
  let h = height;
  if (maxW && w > maxW) {
    h = Math.max(1, Math.round((h * maxW) / w));
    w = maxW;
  }
  if (maxH && h > maxH) {
    w = Math.max(1, Math.round((w * maxH) / h));
    h = maxH;
  }
  return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) };
}

let navReady = false;
export function initNav() {
  if (navReady) return;
  navReady = true;
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

let revealReady = false;
export function initReveal() {
  if (revealReady) return;
  revealReady = true;
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  items.forEach((el) => observer.observe(el));
}

let microReady = false;
export function initMicroInteractions() {
  if (microReady) return;
  microReady = true;
  document.addEventListener("click", (event) => {
    const resetBtn = event.target.closest("[data-reset]");
    if (!resetBtn) return;
    const spinIcon = resetBtn.querySelector(".icon-reset");
    if (!spinIcon) return;
    spinIcon.classList.remove("is-spinning");
    // restart the animation even if it just played
    void spinIcon.offsetWidth;
    spinIcon.classList.add("is-spinning");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initReveal();
    initMicroInteractions();
  });
} else {
  initNav();
  initReveal();
  initMicroInteractions();
}
