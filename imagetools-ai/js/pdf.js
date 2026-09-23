import {
  fileToCanvas,
  flashSuccess,
  formatBytes,
  initUploader,
  setBusy,
  showError,
} from "./common.js";

const PAGE = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
};

function rowIcon(name) {
  const paths = {
    up: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
    down: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
    remove: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  };
  return `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=pdf]");
  if (!root) return;

  const list = root.querySelector("[data-thumbs]");
  const processBtn = root.querySelector("[data-process]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const pageEl = root.querySelector("[name=page]");
  const orientEl = root.querySelector("[name=orient]");
  const marginEl = root.querySelector("[name=margin]");
  const qualityEl = root.querySelector("[name=quality]");

  let items = [];

  const render = () => {
    list.innerHTML = "";
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "thumb";
      row.innerHTML = `
        <img alt="" src="${item.thumb}">
        <div>
          <strong>${item.file.name}</strong>
          <div class="privacy-note">${formatBytes(item.file.size)} · ${item.canvas.width} × ${item.canvas.height}</div>
        </div>
        <div class="tiny">
          <button type="button" class="btn btn-ghost" data-up ${index === 0 ? "disabled" : ""} aria-label="Move up">${rowIcon("up")}</button>
          <button type="button" class="btn btn-ghost" data-down ${index === items.length - 1 ? "disabled" : ""} aria-label="Move down">${rowIcon("down")}</button>
          <button type="button" class="btn btn-ghost" data-remove aria-label="Remove">${rowIcon("remove")}</button>
        </div>`;
      row.querySelector("[data-up]")?.addEventListener("click", () => {
        if (index === 0) return;
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        render();
      });
      row.querySelector("[data-down]")?.addEventListener("click", () => {
        if (index === items.length - 1) return;
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        render();
      });
      row.querySelector("[data-remove]").addEventListener("click", () => {
        items.splice(index, 1);
        render();
      });
      list.appendChild(row);
    });
    processBtn.disabled = items.length === 0;
    dropzone.querySelector("strong").textContent = items.length
      ? "Add another image"
      : "Add an image";
  };

  initUploader({
    root,
    accept: "image/*",
    multiple: true,
    onFiles: async (files) => {
      try {
        for (const file of files) {
          const canvas = await fileToCanvas(file);
          items.push({
            file,
            canvas,
            thumb: canvas.toDataURL("image/jpeg", 0.6),
          });
        }
        showError(error, "");
        render();
      } catch (err) {
        showError(error, err.message || "Could not add one of those images.");
      }
    },
  });

  processBtn.addEventListener("click", async () => {
    if (!items.length) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const quality = Number(qualityEl.value) / 100;
      const margin = Number(marginEl.value) || 0;
      for (const item of items) {
        const blob = await new Promise((resolve) =>
          item.canvas.toBlob(resolve, "image/jpeg", quality),
        );
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const image = await pdf.embedJpg(bytes);
        let pageW;
        let pageH;
        if (pageEl.value === "fit") {
          pageW = image.width + margin * 2;
          pageH = image.height + margin * 2;
        } else {
          const size = PAGE[pageEl.value] || PAGE.a4;
          pageW = size.w;
          pageH = size.h;
          if (orientEl.value === "landscape") {
            pageW = size.h;
            pageH = size.w;
          }
        }
        const page = pdf.addPage([pageW, pageH]);
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const scale = Math.min(maxW / image.width, maxH / image.height);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, {
          x: (pageW - w) / 2,
          y: (pageH - h) / 2,
          width: w,
          height: h,
        });
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      flashSuccess(processBtn);
    } catch (err) {
      showError(error, err.message || "Could not create the PDF.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  resetBtn.addEventListener("click", () => {
    items = [];
    render();
    dropzone.hidden = false;
    showError(error, "");
  });
});
