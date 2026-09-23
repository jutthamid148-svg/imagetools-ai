import {
  canvasToBlob,
  downloadBlob,
  extFromMime,
  fileToCanvas,
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
  const root = document.querySelector("[data-tool=convert]");
  if (!root) return;

  const toMime = root.dataset.to || "image/png";
  const quality = toMime === "image/jpeg" || toMime === "image/webp" ? 0.92 : undefined;
  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");

  let file = null;
  let canvas = null;
  let output = null;

  const reset = () => {
    file = null;
    canvas = null;
    output = null;
    if (preview) {
      preview.removeAttribute("src");
      preview.hidden = true;
    }
    if (meta) meta.hidden = true;
    if (dropzone) dropzone.hidden = false;
    downloadBtn.disabled = true;
    processBtn.disabled = true;
    showError(error, "");
  };

  initUploader({
    root,
    accept: root.dataset.accept || "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        canvas = await fileToCanvas(file);
        const url = canvas.toDataURL("image/png");
        preview.src = url;
        preview.hidden = false;
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: canvas.width, naturalHeight: canvas.height });
        processBtn.disabled = false;
        downloadBtn.disabled = true;
        output = null;
      } catch (err) {
        showError(error, err.message || "Could not open that image.");
      }
    },
  });

  processBtn.addEventListener("click", async () => {
    if (!canvas || !file) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      const source = toMime === "image/jpeg" ? jpegCanvas(canvas) : canvas;
      output = await canvasToBlob(source, toMime, quality);
      downloadBtn.disabled = false;
      const outMeta = root.querySelector("[data-meta=size]");
      if (outMeta) outMeta.textContent = `${formatBytes(file.size)} → ${formatBytes(output.size)}`;
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Conversion failed in this browser.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!output || !file) return;
    downloadBlob(output, replaceExt(file.name, extFromMime(toMime)));
    flashSuccess(downloadBtn);
  });

  resetBtn.addEventListener("click", reset);
});
