import {
  canvasToBlob,
  downloadBlob,
  fileToCanvas,
  flashSuccess,
  formatBytes,
  initUploader,
  replaceExt,
  setBusy,
  setMeta,
  showError,
} from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=utility]");
  if (!root) return;
  const kind = root.dataset.utility;
  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const result = root.querySelector("[data-result]");
  const swatch = root.querySelector("[data-swatch]");
  const canvasEl = root.querySelector("[data-picker]");

  let file = null;
  let source = null;
  let output = null;

  const reset = () => {
    file = null;
    source = null;
    output = null;
    if (preview) {
      preview.removeAttribute("src");
      preview.hidden = true;
    }
    if (canvasEl) canvasEl.hidden = true;
    meta.hidden = true;
    dropzone.hidden = false;
    if (downloadBtn) downloadBtn.disabled = true;
    if (processBtn) processBtn.disabled = true;
    if (result) result.textContent = "";
    showError(error, "");
  };

  initUploader({
    root,
    accept: "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        source = await fileToCanvas(file);
        if (kind === "picker" && canvasEl) {
          canvasEl.width = source.width;
          canvasEl.height = source.height;
          canvasEl.getContext("2d").drawImage(source, 0, 0);
          canvasEl.hidden = false;
          canvasEl.style.width = "100%";
          canvasEl.style.height = "auto";
        } else if (preview) {
          preview.src = source.toDataURL("image/png");
          preview.hidden = false;
        }
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        if (processBtn) processBtn.disabled = false;
        if (kind === "dims" && result) {
          result.textContent = `${source.width} × ${source.height} pixels`;
        }
        if (kind === "size" && result) {
          result.textContent = `${formatBytes(file.size)} (${file.size.toLocaleString()} bytes)`;
        }
      } catch (err) {
        showError(error, err.message || "Could not open that image.");
      }
    },
  });

  if (kind === "picker" && canvasEl) {
    canvasEl.addEventListener("click", (event) => {
      const rect = canvasEl.getBoundingClientRect();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvasEl.width);
      const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvasEl.height);
      const data = canvasEl.getContext("2d").getImageData(x, y, 1, 1).data;
      const hex = `#${[data[0], data[1], data[2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      if (swatch) swatch.style.background = hex;
      if (result) result.textContent = `${hex.toUpperCase()}  ·  rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    });
  }

  processBtn?.addEventListener("click", async () => {
    if (!source || !file) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      if (kind === "metadata") {
        output = await canvasToBlob(source, "image/jpeg", 0.92);
        preview.src = URL.createObjectURL(output);
        downloadBtn.disabled = false;
        result.textContent = "EXIF and other metadata are stripped by re-encoding the pixels only.";
      }
      if (kind === "base64") {
        const dataUrl = source.toDataURL("image/png");
        result.textContent = dataUrl;
        output = new Blob([dataUrl], { type: "text/plain" });
        downloadBtn.disabled = false;
      }
      if (kind === "dims") {
        result.textContent = `${source.width} × ${source.height} pixels`;
      }
      if (kind === "size") {
        result.textContent = `${formatBytes(file.size)} (${file.size.toLocaleString()} bytes)`;
      }
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Could not process that image.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  root.querySelector("[data-copy]")?.addEventListener("click", async (event) => {
    if (!result?.textContent) return;
    try {
      await navigator.clipboard.writeText(result.textContent);
      flashSuccess(event.currentTarget);
    } catch {
      showError(error, "Could not copy in this browser.");
    }
  });

  downloadBtn?.addEventListener("click", () => {
    if (!output || !file) return;
    if (kind === "base64") downloadBlob(output, replaceExt(file.name, "txt"));
    else downloadBlob(output, replaceExt(file.name, "jpg"));
    flashSuccess(downloadBtn);
  });

  resetBtn.addEventListener("click", reset);
});
