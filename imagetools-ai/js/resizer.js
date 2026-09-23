import {
  canvasToBlob,
  downloadBlob,
  extFromMime,
  fileToCanvas,
  flashSuccess,
  initUploader,
  replaceExt,
  setBusy,
  setMeta,
  showError,
} from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=resize]");
  if (!root) return;

  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const widthEl = root.querySelector("[name=width]");
  const heightEl = root.querySelector("[name=height]");
  const percentEl = root.querySelector("[name=percent]");
  const lockEl = root.querySelector("[name=lock]");
  const formatEl = root.querySelector("[name=format]");
  const qualityEl = root.querySelector("[name=quality]");
  const outDims = root.querySelector("[data-outdims]");

  let file = null;
  let source = null;
  let output = null;
  let ratio = 1;
  let syncing = false;

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
    outDims.textContent = " - ";
    showError(error, "");
  };

  const updateOut = () => {
    const w = Number(widthEl.value) || 0;
    const h = Number(heightEl.value) || 0;
    outDims.textContent = w && h ? `${w} × ${h}` : " - ";
  };

  widthEl.addEventListener("input", () => {
    if (syncing || !lockEl.checked || !ratio) return;
    syncing = true;
    heightEl.value = Math.max(1, Math.round(Number(widthEl.value) / ratio));
    syncing = false;
    updateOut();
  });

  heightEl.addEventListener("input", () => {
    if (syncing || !lockEl.checked || !ratio) return;
    syncing = true;
    widthEl.value = Math.max(1, Math.round(Number(heightEl.value) * ratio));
    syncing = false;
    updateOut();
  });

  percentEl.addEventListener("input", () => {
    if (!source) return;
    const p = Number(percentEl.value) / 100;
    widthEl.value = Math.max(1, Math.round(source.width * p));
    heightEl.value = Math.max(1, Math.round(source.height * p));
    updateOut();
  });

  initUploader({
    root,
    accept: "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        source = await fileToCanvas(file);
        ratio = source.width / source.height;
        widthEl.value = source.width;
        heightEl.value = source.height;
        percentEl.value = 100;
        preview.src = source.toDataURL("image/png");
        preview.hidden = false;
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        updateOut();
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
      const w = Math.max(1, Number(widthEl.value) || source.width);
      const h = Math.max(1, Number(heightEl.value) || source.height);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(source, 0, 0, w, h);
      const mime = formatEl.value;
      output = await canvasToBlob(canvas, mime, Number(qualityEl.value) / 100);
      preview.src = URL.createObjectURL(output);
      downloadBtn.disabled = false;
      updateOut();
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Resize failed in this browser.");
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
