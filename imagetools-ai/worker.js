const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const PROMPTS = {
  analyze:
    "Analyze this image for a website visitor. Cover subject, setting, composition, colors, any readable text, and notable details. Use plain language. Do not invent things you cannot see. Write 3 short paragraphs.",
  alt: "Write useful alt text for this image, max 140 characters. Describe what is actually visible. Do not start with 'image of'. Return only the alt text.",
  description:
    "Write a 2 to 3 sentence caption for this image. Be specific and factual. No hashtags.",
  seo: 'Create SEO metadata for this image. Return JSON only with keys: title (max 60 characters), description (max 155 characters), filename_slug (lowercase hyphenated), tags (array of 6 short tags). No markdown.',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

function stripDataUrl(value) {
  const text = String(value || "");
  const comma = text.indexOf(",");
  if (text.startsWith("data:") && comma !== -1) return text.slice(comma + 1);
  return text;
}

async function handleAi(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== "POST") {
    return json({ error: "method", message: "Use POST." }, 405);
  }

  const key = env.GEMINI_API_KEY;
  if (!key) {
    return json(
      {
        error: "unavailable",
        message: "AI features are currently unavailable.",
      },
      503,
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid", message: "Send a JSON body." }, 400);
  }

  const tool = String(payload?.tool || "");
  const prompt = PROMPTS[tool];
  if (!prompt) {
    return json({ error: "invalid", message: "Unknown AI tool." }, 400);
  }

  const imageBase64 = stripDataUrl(payload?.imageBase64);
  const mimeType = String(payload?.mimeType || "image/jpeg");
  if (!imageBase64) {
    return json({ error: "invalid", message: "An image is required." }, 400);
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

  let upstream;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });
  } catch {
    return json(
      {
        error: "unavailable",
        message: "AI features are currently unavailable.",
      },
      503,
    );
  }

  if (!upstream.ok) {
    let message = "AI features are currently unavailable.";
    try {
      const errorData = await upstream.json();
      const googleMessage = errorData?.error?.message || errorData?.message;
      if (googleMessage) {
        message = googleMessage;
      }
    } catch {
      // Fall back to the generic message above.
    }

    if (/API key/i.test(message)) {
      message = "The server-side Gemini API key is invalid or missing.";
    }

    return json(
      {
        error: "unavailable",
        message,
      },
      upstream.status >= 400 && upstream.status < 600 ? upstream.status : 503,
    );
  }

  const data = await upstream.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    return json(
      { error: "empty", message: "The AI did not return a result. Try another image." },
      502,
    );
  }

  return json({ tool, text });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/ai") {
      return handleAi(request, env);
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
