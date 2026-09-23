export async function runAiTool({ tool, imageBase64, mimeType }) {
  let response;
  try {
    response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, imageBase64, mimeType }),
    });
  } catch {
    throw new Error("AI features are currently unavailable.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 503 || !response.ok) {
    throw new Error(data.message || "AI features are currently unavailable.");
  }
  if (!data.text) {
    throw new Error("The AI did not return a result. Try another image.");
  }
  return data;
}

export function canvasToBase64(canvas, mime = "image/jpeg") {
  const dataUrl = canvas.toDataURL(mime, 0.85);
  const comma = dataUrl.indexOf(",");
  return {
    mimeType: mime,
    imageBase64: comma === -1 ? dataUrl : dataUrl.slice(comma + 1),
  };
}

export function shrinkCanvas(source, max = 1024) {
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  if (scale === 1) return source;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}
