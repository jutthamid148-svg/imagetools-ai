import {
  canvasToBlob,
  downloadBlob,
  extFromMime,
  fileToCanvas,
  fitSize,
  flashSuccess,
  formatBytes,
  initUploader,
  replaceExt,
  setBusy,
  setMeta,
  showError,
} from "./common.js";

function jpegCanvas(source) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=compress]");
  if (!root) return;

  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const originalEl = root.querySelector("[data-original]");
  const compressedEl = root.querySelector("[data-compressed]");
  const savedEl = root.querySelector("[data-saved]");
  const qualityEl = root.querySelector("[name=quality]");
  const formatEl = root.querySelector("[name=format]");
  const maxWEl = root.querySelector("[name=maxw]");
  const maxHEl = root.querySelector("[name=maxh]");
  const qualityLabel = root.querySelector("[data-quality-label]");

  let file = null;
  let source = null;
  let output = null;

  qualityEl?.addEventListener("input", () => {
    if (qualityLabel) qualityLabel.textContent = `${qualityEl.value}%`;
  });

  const reset = () => {
    file = null;
    source = null;
    output = null;
    preview.removeAttribute("src");
    preview.hidden = true;
    meta.hidden = true;
    dropzone.hidden = false;
    downloadBtn.disabled = true;
    processBtn.disabled = true;
    originalEl.textContent = " - ";
    compressedEl.textContent = " - ";
    savedEl.textContent = " - ";
    showError(error, "");
  };

  initUploader({
    root,
    accept: root.dataset.accept || "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        source = await fileToCanvas(file);
        preview.src = source.toDataURL("image/png");
        preview.hidden = false;
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        originalEl.textContent = formatBytes(file.size);
        processBtn.disabled = false;
        downloadBtn.disabled = true;
        output = null;
      } catch (err) {
        showError(error, err.message || "Could not open that image.");
      }
    },
  });

  processBtn.addEventListener("click", async () => {
    if (!source || !file) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      const maxW = Number(maxWEl.value) || source.width;
      const maxH = Number(maxHEl.value) || source.height;
      const fitted = fitSize(source.width, source.height, maxW, maxH);
      const canvas = document.createElement("canvas");
      canvas.width = fitted.width;
      canvas.height = fitted.height;
      canvas.getContext("2d").drawImage(source, 0, 0, fitted.width, fitted.height);
      const mime = formatEl.value;
      const quality = Number(qualityEl.value) / 100;
      const prepared = mime === "image/jpeg" ? jpegCanvas(canvas) : canvas;
      output = await canvasToBlob(prepared, mime, quality);
      preview.src = URL.createObjectURL(output);
      compressedEl.textContent = formatBytes(output.size);
      const saved = file.size > 0 ? Math.max(0, Math.round((1 - output.size / file.size) * 100)) : 0;
      savedEl.textContent = output.size < file.size ? `${saved}%` : "0%";
      downloadBtn.disabled = false;
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Compression failed in this browser.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!output || !file) return;
    downloadBlob(output, replaceExt(file.name, extFromMime(formatEl.value)));
    flashSuccess(downloadBtn);
  });

  resetBtn.addEventListener("click", reset);
});
