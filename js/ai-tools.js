import { fileToCanvas, flashSuccess, initUploader, setBusy, setMeta, showError } from "./common.js";
import { canvasToBase64, runAiTool, shrinkCanvas } from "../ai/ai-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-tool=ai]");
  if (!root) return;
  const tool = root.dataset.ai;
  const preview = root.querySelector("[data-preview]");
  const processBtn = root.querySelector("[data-process]");
  const resetBtn = root.querySelector("[data-reset]");
  const error = root.querySelector("[data-error]");
  const dropzone = root.querySelector("[data-dropzone]");
  const meta = root.querySelector("[data-meta-row]");
  const result = root.querySelector("[data-result]");
  const copyBtn = root.querySelector("[data-copy]");

  let file = null;
  let source = null;

  const reset = () => {
    file = null;
    source = null;
    preview.removeAttribute("src");
    preview.hidden = true;
    meta.hidden = true;
    dropzone.hidden = false;
    processBtn.disabled = true;
    result.textContent = "";
    showError(error, "");
  };

  initUploader({
    root,
    accept: "image/*",
    onFiles: async (next) => {
      try {
        file = next;
        source = await fileToCanvas(file);
        preview.src = source.toDataURL("image/jpeg", 0.85);
        preview.hidden = false;
        meta.hidden = false;
        dropzone.hidden = true;
        setMeta(root, file, { naturalWidth: source.width, naturalHeight: source.height });
        processBtn.disabled = false;
      } catch (err) {
        showError(error, err.message || "Could not open that image.");
      }
    },
  });

  processBtn.addEventListener("click", async () => {
    if (!source) return;
    try {
      processBtn.disabled = true;
      setBusy(root, processBtn, true);
      showError(error, "");
      result.textContent = "Working…";
      const small = shrinkCanvas(source, 1024);
      const payload = canvasToBase64(small, "image/jpeg");
      const data = await runAiTool({ tool, ...payload });
      result.textContent = data.text;
      flashSuccess(processBtn);
    } catch (err) {
      result.textContent = "";
      showError(error, err.message || "AI features are currently unavailable.");
    } finally {
      processBtn.disabled = false;
      setBusy(root, processBtn, false);
    }
  });

  copyBtn?.addEventListener("click", async (event) => {
    if (!result.textContent) return;
    try {
      await navigator.clipboard.writeText(result.textContent);
      flashSuccess(event.currentTarget);
    } catch {
      showError(error, "Could not copy the text in this browser.");
    }
  });

  resetBtn.addEventListener("click", reset);
});
