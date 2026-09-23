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

function convolve(canvas, kernel, divisor) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const src = ctx.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);
  const k = kernel;
  const dim = Math.sqrt(k.length);
  const half = Math.floor(dim / 2);
  const div = divisor || k.reduce((a, b) => a + b, 0) || 1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let ky = 0; ky < dim; ky += 1) {
        for (let kx = 0; kx < dim; kx += 1) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const i = (py * width + px) * 4;
          const kv = k[ky * dim + kx];
          r += src.data[i] * kv;
          g += src.data[i + 1] * kv;
          b += src.data[i + 2] * kv;
        }
      }
      const o = (y * width + x) * 4;
      out.data[o] = Math.min(255, Math.max(0, r / div));
      out.data[o + 1] = Math.min(255, Math.max(0, g / div));
      out.data[o + 2] = Math.min(255, Math.max(0, b / div));
      out.data[o + 3] = src.data[o + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

function grayscale(canvas) {
  const ctx = canvas.getContext("2d");
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const y = image.data[i] * 0.299 + image.data[i + 1] * 0.587 + image.data[i + 2] * 0.114;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = y;
  }
  ctx.putImageData(image, 0, 0);
}

function contrast(canvas, amount) {
  const ctx = canvas.getContext("2d");
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = factor * (image.data[i] - 128) + 128;
    image.data[i + 1] = factor * (image.data[i + 1] - 128) + 128;
    image.data[i + 2] = factor * (image.data[i + 2] - 128) + 128;
  }
  ctx.putImageData(image, 0, 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=filter]");
  if (!root) return;
  const kind = root.dataset.filter;
  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const amountEl = root.querySelector("[name=amount]");
  const formatEl = root.querySelector("[name=format]");

  let file = null;
  let source = null;
  let output = null;

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
    showError(error, "");
  };

  initUploader({
    root,
    accept: "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        source = await fileToCanvas(file);
        preview.src = source.toDataURL("image/png");
        preview.hidden = false;
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        processBtn.disabled = false;
        downloadBtn.disabled = true;
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
      const canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      const ctx = canvas.getContext("2d");
      const amount = Number(amountEl?.value || 50);
      if (kind === "rotate") {
        canvas.width = source.height;
        canvas.height = source.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((amount * Math.PI) / 180);
        ctx.drawImage(source, -source.width / 2, -source.height / 2);
      } else if (kind === "flip") {
        const fx = root.querySelector("[name=flipx]").checked ? -1 : 1;
        const fy = root.querySelector("[name=flipy]").checked ? -1 : 1;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(fx, fy);
        ctx.drawImage(source, -source.width / 2, -source.height / 2);
      } else if (kind === "blur") {
        ctx.filter = `blur(${Math.max(1, amount / 12)}px)`;
        ctx.drawImage(source, 0, 0);
        ctx.filter = "none";
      } else {
        ctx.drawImage(source, 0, 0);
        if (kind === "grayscale") grayscale(canvas);
        if (kind === "sharpen") {
          convolve(canvas, [0, -1, 0, -1, 5, -1, 0, -1, 0], 1);
        }
        if (kind === "enhance") {
          contrast(canvas, amount / 4);
          convolve(canvas, [0, -1, 0, -1, 5, -1, 0, -1, 0], 1);
        }
      }
      output = await canvasToBlob(canvas, formatEl.value, 0.92);
      preview.src = URL.createObjectURL(output);
      downloadBtn.disabled = false;
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Could not process that image.");
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
