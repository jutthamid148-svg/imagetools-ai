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
  const root = document.querySelector("[data-tool=crop]");
  if (!root) return;

  const stage = root.querySelector("[data-stage]");
  const imgEl = root.querySelector("[data-preview]");
  const box = root.querySelector("[data-crop]");
  const processBtn = root.querySelector("[data-process]");
  const downloadBtn = root.querySelector("[data-download]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const ratioEl = root.querySelector("[name=ratio]");
  const customW = root.querySelector("[name=rw]");
  const customH = root.querySelector("[name=rh]");
  const formatEl = root.querySelector("[name=format]");

  let file = null;
  let source = null;
  let output = null;
  let rotation = 0;
  let flipX = 1;
  let flipY = 1;
  let crop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

  const currentRatio = () => {
    const value = ratioEl.value;
    if (value === "free") return null;
    if (value === "custom") {
      const w = Number(customW.value) || 1;
      const h = Number(customH.value) || 1;
      return w / h;
    }
    const [w, h] = value.split(":").map(Number);
    return w / h;
  };

  const applyBox = () => {
    box.style.left = `${crop.x * 100}%`;
    box.style.top = `${crop.y * 100}%`;
    box.style.width = `${crop.w * 100}%`;
    box.style.height = `${crop.h * 100}%`;
  };

  const clampCrop = (ratio) => {
    crop.w = Math.min(1, Math.max(0.05, crop.w));
    crop.h = Math.min(1, Math.max(0.05, crop.h));
    if (ratio) {
      const stageRatio = (imgEl.clientWidth || 1) / (imgEl.clientHeight || 1);
      crop.h = crop.w * (stageRatio / ratio);
      if (crop.h > 1) {
        crop.h = 1;
        crop.w = crop.h / (stageRatio / ratio);
      }
    }
    crop.x = Math.min(Math.max(0, crop.x), 1 - crop.w);
    crop.y = Math.min(Math.max(0, crop.y), 1 - crop.h);
    applyBox();
  };

  const drawPreview = async () => {
    if (!source) return;
    const canvas = document.createElement("canvas");
    const rad = (rotation * Math.PI) / 180;
    const swapped = Math.abs(rotation) % 180 === 90;
    canvas.width = swapped ? source.height : source.width;
    canvas.height = swapped ? source.width : source.height;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipX, flipY);
    ctx.drawImage(source, -source.width / 2, -source.height / 2);
    imgEl.src = canvas.toDataURL("image/png");
    imgEl.hidden = false;
    imgEl.dataset.work = "1";
    imgEl._work = canvas;
    if (!imgEl.complete) {
      await new Promise((resolve) => {
        imgEl.onload = resolve;
      });
    }
  };

  const reset = () => {
    file = null;
    source = null;
    output = null;
    rotation = 0;
    flipX = 1;
    flipY = 1;
    imgEl.removeAttribute("src");
    imgEl.hidden = true;
    stage.hidden = true;
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
        dropzone.hidden = true;
        stage.hidden = false;
        meta.hidden = false;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        crop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
        await drawPreview();
        clampCrop(currentRatio());
        processBtn.disabled = false;
        downloadBtn.disabled = true;
        output = null;
      } catch (err) {
        showError(error, err.message || "Could not open that image.");
      }
    },
  });

  ratioEl.addEventListener("change", () => clampCrop(currentRatio()));
  customW.addEventListener("input", () => clampCrop(currentRatio()));
  customH.addEventListener("input", () => clampCrop(currentRatio()));

  root.querySelector("[data-rotate]").addEventListener("click", async () => {
    rotation = (rotation + 90) % 360;
    await drawPreview();
    clampCrop(currentRatio());
  });
  root.querySelector("[data-flipx]").addEventListener("click", async () => {
    flipX *= -1;
    await drawPreview();
  });
  root.querySelector("[data-flipy]").addEventListener("click", async () => {
    flipY *= -1;
    await drawPreview();
  });

  let drag = null;
  box.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const handle = event.target.dataset.handle;
    const rect = stage.getBoundingClientRect();
    drag = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      crop: { ...crop },
      rect,
    };
    box.setPointerCapture(event.pointerId);
  });

  box.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / drag.rect.width;
    const dy = (event.clientY - drag.startY) / drag.rect.height;
    crop = { ...drag.crop };
    if (!drag.handle) {
      crop.x += dx;
      crop.y += dy;
    } else {
      if (drag.handle.includes("w")) {
        crop.x += dx;
        crop.w -= dx;
      }
      if (drag.handle.includes("e")) crop.w += dx;
      if (drag.handle.includes("n")) {
        crop.y += dy;
        crop.h -= dy;
      }
      if (drag.handle.includes("s")) crop.h += dy;
    }
    clampCrop(currentRatio());
  });

  const endDrag = () => {
    drag = null;
  };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  processBtn.addEventListener("click", async () => {
    const work = imgEl._work || source;
    if (!work || !file) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      const sx = Math.round(crop.x * work.width);
      const sy = Math.round(crop.y * work.height);
      const sw = Math.max(1, Math.round(crop.w * work.width));
      const sh = Math.max(1, Math.round(crop.h * work.height));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext("2d").drawImage(work, sx, sy, sw, sh, 0, 0, sw, sh);
      output = await canvasToBlob(canvas, formatEl.value, 0.92);
      downloadBtn.disabled = false;
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Crop failed in this browser.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!output || !file) return;
    downloadBlob(
      output,
      replaceExt(file.name, extFromMime(formatEl.value)).replace(/(\.\w+)$/, "-cropped$1"),
    );
    flashSuccess(downloadBtn);
  });

  resetBtn.addEventListener("click", reset);
});
