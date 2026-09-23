const PROMPTS = {
  analyze:
    "Analyze this image for a website visitor. Cover subject, setting, composition, colors, any readable text, and notable details. Use plain language. Do not invent things you cannot see. Write 3 short paragraphs.",
  alt: "Write useful alt text for this image, max 140 characters. Describe what is actually visible. Do not start with 'image of'. Return only the alt text.",
  description:
    "Write a 2 to 3 sentence caption for this image. Be specific and factual. No hashtags.",
  seo: 'Create SEO metadata for this image. Return JSON only with keys: title (max 60 characters), description (max 155 characters), filename_slug (lowercase hyphenated), tags (array of 6 short tags). No markdown.',
};

function parseJsonBody(req) {
  const rawBody = req.body;

  if (rawBody == null) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        if (!text) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          reject(new Error('Send a JSON body.'));
        }
      });
      req.on('error', () => reject(new Error('Send a JSON body.')));
    });
  }

  if (Buffer.isBuffer(rawBody)) {
    try {
      return Promise.resolve(JSON.parse(rawBody.toString('utf8')));
    } catch {
      return Promise.reject(new Error('Send a JSON body.'));
    }
  }

  if (rawBody instanceof Uint8Array) {
    try {
      return Promise.resolve(JSON.parse(Buffer.from(rawBody).toString('utf8')));
    } catch {
      return Promise.reject(new Error('Send a JSON body.'));
    }
  }

  if (typeof rawBody === 'string') {
    try {
      return Promise.resolve(JSON.parse(rawBody));
    } catch {
      return Promise.reject(new Error('Send a JSON body.'));
    }
  }

  if (typeof rawBody === 'object') {
    return Promise.resolve(rawBody);
  }

  return Promise.reject(new Error('Send a JSON body.'));
}

function json(response, body, status = 200) {
  response.status(status).json(body);
}

function stripDataUrl(value) {
  const text = String(value || '');
  const comma = text.indexOf(',');
  if (text.startsWith('data:') && comma !== -1) return text.slice(comma + 1);
  return text;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return json(res, { error: 'method', message: 'Use POST.' }, 405);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return json(
      res,
      { error: 'unavailable', message: 'AI features are currently unavailable.' },
      503,
    );
  }

  let payload;
  try {
    payload = await parseJsonBody(req);
  } catch (error) {
    return json(res, { error: 'invalid', message: error.message || 'Send a JSON body.' }, 400);
  }

  const tool = String(payload?.tool || '');
  const prompt = PROMPTS[tool];
  if (!prompt) {
    return json(res, { error: 'invalid', message: 'Unknown AI tool.' }, 400);
  }

  const imageBase64 = stripDataUrl(payload?.imageBase64);
  const mimeType = String(payload?.mimeType || 'image/jpeg');
  if (!imageBase64) {
    return json(res, { error: 'invalid', message: 'An image is required.' }, 400);
  }

  const upstream = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          },
        ],
      }),
    },
  );

  if (!upstream.ok) {
    let message = 'AI features are currently unavailable.';
    try {
      const errorData = await upstream.json();
      const googleMessage = errorData?.error?.message || errorData?.message;
      if (googleMessage) message = googleMessage;
    } catch {
      // Ignore parsing failures and keep the generic default.
    }

    if (/API key/i.test(message)) {
      message = 'The server-side Gemini API key is invalid or missing.';
    }

    return json(
      res,
      { error: 'unavailable', message },
      upstream.status >= 400 && upstream.status < 600 ? upstream.status : 503,
    );
  }

  const data = await upstream.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    return json(
      res,
      { error: 'empty', message: 'The AI did not return a result. Try another image.' },
      502,
    );
  }

  return json(res, { tool, text });
}
