import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = "https://imagetools-ai.whop.site";
const OG = `${SITE}/assets/images/og-image.png`;
const ROOT = join(import.meta.dirname, "..");

const navItems = [
  ["All Tools", "/tools.html", "layers"],
  ["Convert", "/convert.html", "repeat"],
  ["Compress", "/compress.html", "minimize-2"],
  ["Resize", "/resize.html", "maximize-2"],
  ["Edit", "/edit.html", "wand-2"],
  ["AI Tools", "/ai-tools.html", "sparkles"],
  ["About", "/about.html", "building-2"],
];

const ICON_PATHS = {
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  "chevron-down": '<polyline points="6 9 12 15 18 9"/>',
  "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  sparkles:
    '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  "minimize-2":
    '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
  "maximize-2":
    '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  "rotate-cw": '<path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/>',
  "flip-horizontal":
    '<path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="4" x2="12" y2="20" stroke-dasharray="2 3"/>',
  contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/>',
  droplet: '<path d="M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/>',
  focus:
    '<circle cx="12" cy="12" r="3"/><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>',
  "wand-2":
    '<path d="M3 21l6-6"/><path d="M13.4 3.6l7 7"/><path d="M17 2l1 1"/><path d="M2 17l1 1"/><path d="M9.2 7.4l1.4 1.4"/>',
  "file-text":
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
  pipette: '<path d="M15 5l4 4"/><path d="M3 21l6-1 9-9-5-5-9 9z"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="M13 7l2 2"/><path d="M9 11l2 2"/>',
  "hard-drive":
    '<line x1="2" y1="12" x2="22" y2="12"/><path d="M5.4 4h13.2l3 8H2.4z"/><circle cx="6" cy="16" r="0.6" fill="currentColor" stroke="none"/><circle cx="10" cy="16" r="0.6" fill="currentColor" stroke="none"/>',
  eraser: '<path d="M18 13l-8 8H6l-4-4 10-10z"/><path d="M14 7l4 4"/><path d="M6 21h14"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  download: '<path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/>',
  "upload-cloud":
    '<path d="M20 16.6A5 5 0 0 0 18 7h-1.3A7 7 0 1 0 4 15.9"/><path d="M12 12v8"/><polyline points="9 15 12 12 15 15"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  "check-circle": '<circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 8"/>',
  "alert-triangle": '<path d="M12 2 1 21h22z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>',
  "user-check":
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  "mouse-pointer-click": '<path d="M4 4l6 14 2-6 6-2z"/><path d="M14.5 14.5 20 20"/>',
  "sliders-horizontal":
    '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2"/>',
  "building-2":
    '<path d="M4 22V6l8-4 8 4v16"/><path d="M9 22V12h6v10"/><line x1="9" y1="8" x2="9.01" y2="8"/><line x1="15" y1="8" x2="15.01" y2="8"/>',
  repeat:
    '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  tag: '<path d="M20.6 13.6 13.6 20.6a2 2 0 0 1-2.8 0l-8.4-8.4a2 2 0 0 1 0-2.8L9.4 2.4A2 2 0 0 1 10.8 2H18a2 2 0 0 1 2 2v7.2a2 2 0 0 1-.6 1.4z"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 1 0-5.4 5.4L2 19v3h3l7.3-7.3a4 4 0 0 0 5.4-5.4z"/>',
};

function icon(name, opts = {}) {
  const size = opts.size || 18;
  const cls = opts.className ? ` ${opts.className}` : "";
  const paths = ICON_PATHS[name];
  if (!paths) return "";
  return `<svg class="icon${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function toolIcon(label) {
  const s = label.toLowerCase();
  if (s.includes("pdf")) return "file-text";
  if (s.includes("compress") || s.includes("size reducer")) return "minimize-2";
  if (s.includes("resiz")) return "maximize-2";
  if (s.includes("crop")) return "crop";
  if (s.includes("rotat")) return "rotate-cw";
  if (s.includes("flip")) return "flip-horizontal";
  if (s.includes("gray")) return "contrast";
  if (s.includes("blur")) return "droplet";
  if (s.includes("sharpen")) return "focus";
  if (s.includes("enhanc")) return "wand-2";
  if (s.includes("color picker")) return "pipette";
  if (s.includes("dimensions")) return "ruler";
  if (s.includes("file size")) return "hard-drive";
  if (s.includes("metadata")) return "eraser";
  if (s.includes("base64")) return "code";
  if (s.includes("analyzer")) return "search";
  if (s.includes("alt text")) return "type";
  if (s.includes("description")) return "file-text";
  if (s.includes("seo")) return "tag";
  if (s.startsWith("ai ")) return "sparkles";
  if (s.includes(" to ")) return "repeat";
  return "image";
}

const AI_ICONS = { analyze: "search", alt: "type", description: "file-text", seo: "tag" };

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function prefix(path) {
  const depth = path.split("/").length - 1;
  return depth ? "../".repeat(depth) : "./";
}

function nav(path) {
  const here = `/${path}`;
  return `
<header class="nav" data-nav>
  <div class="nav-inner">
    <a class="brand" href="${prefix(path)}index.html">
      <img src="/assets/images/logo.png" width="32" height="32" alt="">
      ImageTools AI
    </a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-label="Open menu">
      <span class="icon-menu">${icon("menu", { size: 20 })}</span>
      <span class="icon-close">${icon("x", { size: 20 })}</span>
    </button>
    <nav class="nav-links" data-nav-panel>
      ${navItems
        .map(
          ([label, href, ic]) =>
            `<a href="${href}"${here === href ? ' aria-current="page"' : ""}>${icon(ic, { size: 16 })}<span>${label}</span></a>`,
        )
        .join("")}
    </nav>
    <a class="btn btn-primary nav-cta" href="/tools.html"><span>All Tools</span>${icon("arrow-right", { size: 16 })}</a>
  </div>
</header>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <h2><span class="foot-brand-icon">${icon("sparkles", { size: 16 })}</span>ImageTools AI</h2>
      <p class="prose">Free online image tools that run in your browser. Convert, compress, resize and edit without creating an account.</p>
    </div>
    <div>
      <h3><span class="foot-icon">${icon("sliders-horizontal", { size: 15 })}</span>Tools</h3>
      <a href="/convert.html">Convert images</a>
      <a href="/compress.html">Compress images</a>
      <a href="/resize.html">Resize images</a>
      <a href="/edit.html">Edit images</a>
      <a href="/tools/image-to-pdf.html">Image to PDF</a>
      <a href="/ai-tools.html">AI tools</a>
    </div>
    <div>
      <h3><span class="foot-icon">${icon("building-2", { size: 15 })}</span>Company</h3>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/tools.html">All tools</a>
    </div>
    <div>
      <h3><span class="foot-icon">${icon("shield", { size: 15 })}</span>Legal</h3>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </div>
  </div>
  <div class="wrap fineprint">© ${new Date().getFullYear()} ImageTools AI. Browser-based image utilities.</div>
</footer>`;
}

function head({ title, description, path, extra = "", jsonld = [] }) {
  const url = `${SITE}/${path === "index.html" ? "" : path}`;
  const ld = jsonld
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="color-scheme" content="light">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ImageTools AI">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${OG}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${OG}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix(path)}style.css">
  <link rel="stylesheet" href="${prefix(path)}css/tools.css">
  ${extra}
  ${ld}
</head>`;
}

function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map((item, i) =>
      i === items.length - 1
        ? `<span>${esc(item.label)}</span>`
        : `<a href="${item.href}">${esc(item.label)}</a><span>/</span>`,
    )
    .join("")}</nav>`;
}

function faqBlock(faqs) {
  return `<section class="faq wrap reveal" style="padding-top:8px">
    <h2>Frequently asked questions</h2>
    ${faqs
      .map(
        (f) =>
          `<details><summary><span>${esc(f.q)}</span>${icon("chevron-down", { size: 16, className: "faq-chevron" })}</summary><p>${f.a}</p></details>`,
      )
      .join("")}
  </section>`;
}

function relatedBlock(links) {
  return `<aside class="card reveal">
    <h2>Related tools</h2>
    <div class="related">
      ${links
        .map(
          (l) =>
            `<a class="card" href="${l.href}">${icon(toolIcon(l.label), { size: 16, className: "related-icon" })}<span>${esc(l.label)}</span></a>`,
        )
        .join("")}
    </div>
  </aside>`;
}

function howTo(steps) {
  return `<aside class="card side-card reveal">
    <h2>How to use this tool</h2>
    <ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
  </aside>`;
}

function metaRow() {
  return `<div class="meta" data-meta-row hidden>
    <div><dt>File</dt><dd data-meta="name"> - </dd></div>
    <div><dt>Size</dt><dd data-meta="size"> - </dd></div>
    <div><dt>Dimensions</dt><dd data-meta="dims"> - </dd></div>
    <div><dt>Format</dt><dd data-meta="format"> - </dd></div>
  </div>`;
}

function dropzone(text = "Drop an image here, click to choose, or paste from the clipboard") {
  return `<div class="dropzone" data-dropzone role="button" tabindex="0">
    <div class="dropzone-icon">${icon("upload-cloud", { size: 26 })}</div>
    <div>
      <strong>Add an image</strong>
      <span>${esc(text)}</span>
    </div>
    <input class="file-input" data-file type="file">
  </div>`;
}

function documentPage(path, options, body) {
  const html = `${head({ ...options, path })}
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${nav(path)}
  <main id="main">${body}</main>
  ${footer()}
  ${options.scripts || ""}
</body>
</html>`;
  const full = join(ROOT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ImageTools AI",
  url: SITE,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "Convert, compress, resize and edit images directly in your browser.",
};

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href.startsWith("http") ? item.href : `${SITE}${item.href}`,
    })),
  };
}

function faqLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
    })),
  };
}

const popular = [
  ["Image Compressor", "/tools/image-compressor.html", "Cut JPG, PNG and WebP file size with a quality slider."],
  ["JPG to PNG", "/tools/jpg-to-png.html", "Convert photos to PNG with a real pixel conversion."],
  ["Image Resizer", "/tools/image-resizer.html", "Change width, height or scale by percentage."],
  ["Image Cropper", "/tools/image-cropper.html", "Crop to free, square, 4:3 or 16:9 frames."],
  ["Image to PDF", "/tools/image-to-pdf.html", "Combine photos into a downloadable PDF."],
  ["PNG to WebP", "/tools/png-to-webp.html", "Turn PNG graphics into smaller WebP files."],
  ["JPG to WebP", "/tools/jpg-to-webp.html", "Export photos as WebP for faster pages."],
  ["AI Alt Text Generator", "/tools/ai-alt-text-generator.html", "Draft alt text from the image itself."],
];

const categories = [
  ["Convert", "/convert.html", "JPG, PNG, WebP, BMP and TIFF conversions that actually re-encode pixels.", "repeat"],
  ["Compress", "/compress.html", "Reduce file size with quality and maximum dimension controls.", "minimize-2"],
  ["Resize & crop", "/resize.html", "Change dimensions, lock aspect ratio, or crop to a frame.", "crop"],
  ["Edit", "/edit.html", "Rotate, flip, grayscale, blur, sharpen and enhance locally.", "wand-2"],
  ["Utilities", "/tools.html#utilities", "PDF, color picker, dimensions, metadata and Base64.", "sliders-horizontal"],
  ["AI tools", "/ai-tools.html", "Optional Gemini-powered descriptions. Separate from local tools.", "sparkles"],
];

documentPage(
  "index.html",
  {
    title: "ImageTools AI  -  Free Online Image Tools",
    description:
      "Convert, compress, resize and edit images instantly  -  right in your browser. Fast, private and free. No signup required.",
    jsonld: [webAppLd],
    scripts: `<script type="module" src="./script.js"></script>`,
  },
  `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="badge hero-in">${icon("zap", { size: 14 })}<span>100% Free • Browser-Based • Privacy Friendly</span></p>
        <h1 class="hero-in delay-1">Free Online Image Tools</h1>
        <p class="lede hero-in delay-2">Convert, compress, resize and edit images instantly  -  right in your browser.</p>
        <div class="hero-actions hero-in delay-3">
          <a class="btn btn-primary" href="/tools.html"><span>Explore Image Tools</span>${icon("arrow-right", { size: 16 })}</a>
          <a class="btn btn-secondary" href="/tools/image-compressor.html">${icon("minimize-2", { size: 16 })}<span>Compress an Image</span></a>
        </div>
      </div>
      <div class="preview-card hero-in delay-2" aria-hidden="true">
        <div class="preview-top"><span>Image compressor</span><span>Local preview</span></div>
        <div class="preview-stage">
          <div class="preview-pane"><div class="scene"></div><b>Original 2.4 MB</b></div>
          <div class="preview-pane"><div class="scene soft"></div><b>Compressed 640 KB</b></div>
        </div>
        <div class="preview-stats"><span>${icon("check-circle", { size: 14 })}Saved 73%</span><span>JPG · 1600×900</span></div>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">Popular tools</p>
          <h2>Start with a job people actually do</h2>
        </div>
        <a href="/tools.html">View all tools</a>
      </div>
      <div class="grid grid-4">
        ${popular
          .map(
            ([name, href, copy]) =>
              `<a class="card tool-card reveal" href="${href}"><div class="tool-icon">${icon(toolIcon(name), { size: 20 })}</div><h3>${name}</h3><p>${copy}</p></a>`,
          )
          .join("")}
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <p class="section-kicker">Tool categories</p>
      <h2>Everything in one place</h2>
      <div class="grid grid-3" style="margin-top:16px">
        ${categories
          .map(
            ([name, href, copy, ic]) =>
              `<a class="card tool-card reveal" href="${href}"><div class="tool-icon">${icon(ic, { size: 20 })}</div><h3>${name}</h3><p>${copy}</p></a>`,
          )
          .join("")}
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <p class="section-kicker">Why ImageTools AI</p>
      <h2>Built to stay on the device</h2>
      <div class="why-list" style="margin-top:16px">
        <article class="card reveal"><div class="feature-icon">${icon("shield", { size: 20 })}</div><h3>Private by default</h3><p>Standard tools run in your browser. Images are not uploaded to ImageTools AI servers.</p></article>
        <article class="card reveal"><div class="feature-icon">${icon("user-check", { size: 20 })}</div><h3>No account required</h3><p>Open a tool, drop a file, download the result. Sign-up is not part of the basic workflow.</p></article>
        <article class="card reveal"><div class="feature-icon">${icon("repeat", { size: 20 })}</div><h3>Real conversions</h3><p>JPG, PNG and WebP exports use the Canvas API. Files are not renamed and passed off as a new format.</p></article>
        <article class="card reveal"><div class="feature-icon">${icon("smartphone", { size: 20 })}</div><h3>Mobile-first</h3><p>Upload, preview and download are laid out for phones as well as desktops.</p></article>
        <article class="card reveal"><div class="feature-icon">${icon("search", { size: 20 })}</div><h3>Indexable tools</h3><p>Every tool has its own page, title and explanation so you can link the exact job you need.</p></article>
        <article class="card reveal"><div class="feature-icon">${icon("sparkles", { size: 20 })}</div><h3>Optional AI</h3><p>Alt text and descriptions use a separate, server-side Gemini path. If it is offline, local tools still work.</p></article>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <p class="section-kicker">How it works</p>
      <div class="steps" style="margin-top:16px">
        <article class="card reveal"><h3><span class="step-icon">${icon("mouse-pointer-click", { size: 18 })}</span>Pick a tool</h3><p>Choose convert, compress, resize, crop, PDF or an editor.</p></article>
        <article class="card reveal"><h3><span class="step-icon">${icon("upload-cloud", { size: 18 })}</span>Add your image</h3><p>Click, drag and drop, or paste. Preview filename, size and dimensions first.</p></article>
        <article class="card reveal"><h3><span class="step-icon">${icon("download", { size: 18 })}</span>Download the result</h3><p>Process in the browser, then save the new file. Reset whenever you want a clean start.</p></article>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <p class="section-kicker">AI tools</p>
      <h2>Descriptions when you want them</h2>
      <p class="prose">AI tools send a resized copy of your image through ImageTools AI’s secure API layer. They are optional and clearly labeled. Local convert and compress tools never need them.</p>
      <div class="grid grid-4" style="margin-top:16px">
        <a class="card tool-card ai-banner reveal" href="/tools/ai-image-analyzer.html"><div class="tool-icon">${icon("search", { size: 20 })}</div><h3>AI Image Analyzer</h3><p>Get a written readout of subject, color and composition.</p></a>
        <a class="card tool-card ai-banner reveal" href="/tools/ai-alt-text-generator.html"><div class="tool-icon">${icon("type", { size: 20 })}</div><h3>AI Alt Text Generator</h3><p>Draft short alt text you can paste into a website.</p></a>
        <a class="card tool-card ai-banner reveal" href="/tools/ai-image-description-generator.html"><div class="tool-icon">${icon("file-text", { size: 20 })}</div><h3>AI Description Generator</h3><p>Write a caption from what is actually in the photo.</p></a>
        <a class="card tool-card ai-banner reveal" href="/tools/ai-image-seo-metadata-generator.html"><div class="tool-icon">${icon("tag", { size: 20 })}</div><h3>AI SEO Metadata</h3><p>Title, description, slug and tags from the image.</p></a>
      </div>
    </div>
  </section>
  ${faqBlock([
    {
      q: "Are these image tools really free?",
      a: "Yes. The browser-based convert, compress, resize and edit tools on ImageTools AI are free to use and do not require an account.",
    },
    {
      q: "Do you upload my images?",
      a: "Standard tools process files locally with the File, Canvas and Blob APIs. AI tools are separate: they send a resized image to our API only for that request, and only if AI is configured.",
    },
    {
      q: "Which formats can I convert?",
      a: "JPG, PNG and WebP conversions run in the browser. BMP and TIFF have dedicated conversion pages. Output is a newly encoded file, not a renamed extension.",
    },
    {
      q: "Will this work on a phone?",
      a: "Yes. The layout is built for 320px and up. You can pick images from the camera roll and download the result on the same device.",
    },
  ])}
`,
);

const allTools = [
  { group: "Conversion", items: [
    ["JPG to PNG", "/tools/jpg-to-png.html"],
    ["PNG to JPG", "/tools/png-to-jpg.html"],
    ["JPG to WebP", "/tools/jpg-to-webp.html"],
    ["PNG to WebP", "/tools/png-to-webp.html"],
    ["WebP to JPG", "/tools/webp-to-jpg.html"],
    ["WebP to PNG", "/tools/webp-to-png.html"],
    ["BMP to JPG", "/tools/bmp-to-jpg.html"],
    ["TIFF to JPG", "/tools/tiff-to-jpg.html"],
  ]},
  { group: "Compression", items: [
    ["Image Compressor", "/tools/image-compressor.html"],
    ["JPG Compressor", "/tools/jpg-compressor.html"],
    ["PNG Compressor", "/tools/png-compressor.html"],
    ["WebP Compressor", "/tools/webp-compressor.html"],
    ["Image Size Reducer", "/tools/image-size-reducer.html"],
  ]},
  { group: "Editing", items: [
    ["Image Resizer", "/tools/image-resizer.html"],
    ["Image Cropper", "/tools/image-cropper.html"],
    ["Image Rotator", "/tools/image-rotator.html"],
    ["Image Flipper", "/tools/image-flipper.html"],
    ["Grayscale Image", "/tools/grayscale-image.html"],
    ["Blur Image", "/tools/blur-image.html"],
    ["Sharpen Image", "/tools/sharpen-image.html"],
    ["Image Quality Enhancer", "/tools/image-quality-enhancer.html"],
  ]},
  { group: "Utilities", id: "utilities", items: [
    ["Image to PDF", "/tools/image-to-pdf.html"],
    ["Image Color Picker", "/tools/image-color-picker.html"],
    ["Image Dimensions Checker", "/tools/image-dimensions-checker.html"],
    ["Image File Size Checker", "/tools/image-file-size-checker.html"],
    ["Image Metadata Remover", "/tools/image-metadata-remover.html"],
    ["Base64 Image Converter", "/tools/base64-image-converter.html"],
  ]},
  { group: "AI", items: [
    ["AI Image Analyzer", "/tools/ai-image-analyzer.html"],
    ["AI Alt Text Generator", "/tools/ai-alt-text-generator.html"],
    ["AI Image Description Generator", "/tools/ai-image-description-generator.html"],
    ["AI Image SEO Metadata Generator", "/tools/ai-image-seo-metadata-generator.html"],
  ]},
];

function listItemIcon(name, href) {
  if (href.includes("ai-image-analyzer")) return AI_ICONS.analyze;
  if (href.includes("ai-alt-text")) return AI_ICONS.alt;
  if (href.includes("ai-image-description")) return AI_ICONS.description;
  if (href.includes("ai-image-seo")) return AI_ICONS.seo;
  return toolIcon(name);
}

function listing(path, title, description, groups, h1, intro) {
  documentPage(
    path,
    {
      title,
      description,
      jsonld: [breadcrumbLd([{ label: "Home", href: "/" }, { label: h1, href: `/${path}` }])],
      scripts: `<script type="module" src="${prefix(path)}js/common.js"></script>`,
    },
    `<section class="page-hero wrap hero-in">
      ${crumbs([{ href: "/index.html", label: "Home" }, { label: h1 }])}
      <h1>${esc(h1)}</h1>
      <p class="lede">${intro}</p>
    </section>
    ${groups
      .map(
        (g) => `<section class="wrap"${g.id ? ` id="${g.id}"` : ""}>
        <h2>${esc(g.group)}</h2>
        <div class="grid grid-3" style="margin-top:12px">
          ${g.items
            .map(
              ([name, href]) =>
                `<a class="card tool-card reveal" href="${href}"><div class="tool-icon">${icon(listItemIcon(name, href), { size: 20 })}</div><h3>${name}</h3><p>Open the ${name} tool</p></a>`,
            )
            .join("")}
        </div>
      </section>`,
      )
      .join("")}`,
  );
}

listing(
  "tools.html",
  "All Image Tools  -  ImageTools AI",
  "Browse every ImageTools AI converter, compressor, editor and utility. Each tool has its own page and runs in your browser.",
  allTools,
  "All tools",
  "Every converter, compressor, editor and utility on ImageTools AI, grouped so you can jump to the exact job.",
);
listing(
  "convert.html",
  "Convert Images Online  -  ImageTools AI",
  "Convert JPG, PNG, WebP, BMP and TIFF in your browser. Real re-encoding with the Canvas API, not renamed file extensions.",
  [allTools[0]],
  "Convert images",
  "Re-encode photos and graphics between JPG, PNG, WebP, BMP and TIFF without installing software.",
);
listing(
  "compress.html",
  "Compress Images Online  -  ImageTools AI",
  "Compress JPG, PNG and WebP files in the browser. See original size, new size and percentage saved before you download.",
  [allTools[1]],
  "Compress images",
  "Shrink file size with quality and maximum dimension controls. Compare original and compressed size on the same page.",
);
listing(
  "resize.html",
  "Resize and Crop Images  -  ImageTools AI",
  "Resize by pixels or percentage, lock aspect ratio, or crop to 1:1, 4:3 and 16:9. All processing stays in the browser.",
  [{ group: "Resize and crop", items: allTools[2].items.slice(0, 2) }],
  "Resize and crop",
  "Change dimensions precisely or trim a frame. Aspect lock, percentage scale and live crop handles are included.",
);
listing(
  "edit.html",
  "Edit Images Online  -  ImageTools AI",
  "Rotate, flip, grayscale, blur, sharpen and enhance images locally in your browser with ImageTools AI.",
  [{ group: "Editors", items: allTools[2].items.slice(2) }],
  "Edit images",
  "Pixel tools for orientation, color and detail. These filters run on a canvas in your browser.",
);
listing(
  "ai-tools.html",
  "AI Image Tools  -  ImageTools AI",
  "Optional Gemini-powered image analysis, alt text, captions and SEO metadata. Local convert and compress tools keep working if AI is offline.",
  [allTools[4]],
  "AI tools",
  "These pages talk to a secure API layer. If Gemini is not configured, you will see that AI features are currently unavailable. Every other tool on the site still works.",
);

function legal(path, title, description, h1, blocks) {
  documentPage(
    path,
    {
      title,
      description,
      jsonld: [breadcrumbLd([{ label: "Home", href: "/" }, { label: h1, href: `/${path}` }])],
      scripts: `<script type="module" src="${prefix(path)}js/common.js"></script>`,
    },
    `<section class="page-hero wrap hero-in">
      ${crumbs([{ href: "/index.html", label: "Home" }, { label: h1 }])}
      <h1>${esc(h1)}</h1>
      <div class="prose">${blocks}</div>
    </section>`,
  );
}

legal(
  "about.html",
  "About ImageTools AI",
  "ImageTools AI is a free, browser-based suite for converting, compressing, resizing and editing images without an account.",
  "About ImageTools AI",
  `<p>ImageTools AI is a set of free online image tools. The product is simple on purpose: pick a tool, add a file, download a result.</p>
   <p>Most tools use the File API, Canvas API and Blob API in your browser. That keeps everyday conversions and compression off our servers and makes the pages fast to open.</p>
   <p>AI features are optional and separated. They only run when the Gemini integration is configured on the server. If it is not, those pages say so and the rest of the site continues to work.</p>
   <p>ImageTools AI is operated as a software product on Whop.</p>`,
);
legal(
  "contact.html",
  "Contact ImageTools AI",
  "How to reach ImageTools AI and what to check before you write in about a tool that runs in your browser.",
  "Contact",
  `<p>ImageTools AI is a self-serve browser toolkit. For a tool that is not behaving as expected, note the file type, browser, and whether the page showed a specific error.</p>
   <p>Local tools never send your image to ImageTools AI. If a conversion fails, it is usually because the browser cannot decode that file, or because a format such as TIFF uses a decoder that only handles common variants.</p>
   <p>AI pages need a configured Gemini key on the server. If you see “AI features are currently unavailable,” the rest of the site is still usable.</p>
   <p>This product is run by ImageTools AI on Whop. There is no separate support inbox published on this website.</p>`,
);
legal(
  "privacy.html",
  "Privacy Policy  -  ImageTools AI",
  "How ImageTools AI handles images. Browser tools stay on your device. AI tools send a request only when you run them.",
  "Privacy",
  `<p>For convert, compress, resize, crop, filter, PDF and utility tools, your images are processed locally in your browser and are not uploaded to our servers.</p>
   <p>Those pages read the file you select, draw it to a canvas, and let you download a new file. We do not get a copy of that image as part of the tool running.</p>
   <p>AI tools are different. If you run an AI tool, a resized copy of the image is sent to ImageTools AI’s API layer so it can call Gemini. We do not keep an image library of those uploads in this application. The request exists so the model can see the picture.</p>
   <p>This site is a progressive web app. The service worker may cache static application files such as HTML, CSS and JavaScript. It is not written to cache the photos you open in a tool.</p>
   <p>Hosting and analytics for the website follow the platform this product runs on. This policy describes the image tools themselves, not every network log a browser or host may keep.</p>`,
);
legal(
  "terms.html",
  "Terms of Use  -  ImageTools AI",
  "Terms for using ImageTools AI’s free browser-based image conversion, compression and editing tools.",
  "Terms of use",
  `<p>ImageTools AI provides free browser tools for converting, compressing, resizing and editing images. Use them only with files you have the right to process.</p>
   <p>Results depend on your browser. We do not promise that every BMP, TIFF or color profile will decode, or that a compressed file will look identical to the original.</p>
   <p>AI output can be wrong. Treat generated alt text, captions and metadata as drafts.</p>
   <p>The tools are provided as they are. ImageTools AI is not liable for lost files, publishing mistakes, or downstream use of a download.</p>`,
);

const privacyLocal =
  "Your images are processed locally in your browser and are not uploaded to our servers.";
const privacyAi =
  "This AI tool sends a resized copy of your image to ImageTools AI’s API so Gemini can read it. Images are not stored in an ImageTools AI gallery after the request. If Gemini is not configured, you will see that AI features are currently unavailable.";

function toolPage(tool) {
  const path = tool.path.replace(/^\//, "");
  const faqs = tool.faqs;
  const trail = [
    { href: "/index.html", label: "Home" },
    { href: tool.sectionHref, label: tool.section },
    { label: tool.h1 },
  ];
  const jsonld = [
    breadcrumbLd([
      { label: "Home", href: "/" },
      { label: tool.section, href: tool.sectionHref },
      { label: tool.h1, href: tool.path },
    ]),
    faqLd(faqs),
  ];
  const scripts = (tool.scripts || [])
    .map((src) => `<script type="module" src="${prefix(path)}${src}"></script>`)
    .join("");
  const processIcon = tool.icon || "wand-2";
  documentPage(
    path,
    {
      title: tool.title,
      description: tool.description,
      jsonld,
      scripts,
    },
    `<section class="page-hero wrap hero-in">
      ${crumbs(trail)}
      <h1>${esc(tool.h1)}</h1>
      <p class="lede">${tool.intro}</p>
    </section>
    <section class="wrap tool-layout hero-in delay-2">
      <div class="workspace" ${tool.attrs}>
        <div class="progress" data-progress><span></span></div>
        ${dropzone(tool.drop)}
        ${metaRow()}
        ${tool.preview || `<div class="preview-wrap"><img data-preview alt="Image preview" hidden></div>`}
        <div class="controls">${tool.controls || ""}</div>
        <div class="actions">
          <button class="btn btn-primary" data-process disabled>
            <span class="btn-state state-default">${icon(processIcon, { size: 16 })}<span>${esc(tool.process)}</span></span>
            <span class="btn-state state-success">${icon("check", { size: 16 })}<span>Done</span></span>
          </button>
          ${
            tool.hideDownload
              ? ""
              : `<button class="btn btn-secondary" data-download disabled>
            <span class="btn-state state-default">${icon("download", { size: 16 })}<span>Download</span></span>
            <span class="btn-state state-success">${icon("check", { size: 16 })}<span>Downloaded</span></span>
          </button>`
          }
          <button class="btn btn-ghost" type="button" data-reset>${icon("rotate-cw", { size: 16, className: "icon-reset" })}<span>Reset</span></button>
          ${tool.extraActions || ""}
        </div>
        <p class="error" data-error hidden></p>
        <p class="privacy-note">${tool.ai ? privacyAi : privacyLocal}</p>
        ${tool.after || ""}
      </div>
      <div>
        ${howTo(tool.steps)}
        ${relatedBlock(tool.related)}
      </div>
    </section>
    <section class="wrap tool-copy reveal">
      <h2>${esc(tool.h2)}</h2>
      ${tool.body}
    </section>
    ${faqBlock(faqs)}`,
  );
}

const formatSelect = `<div class="field"><label for="format">Output format</label>
  <select id="format" name="format">
    <option value="image/jpeg">JPG</option>
    <option value="image/webp">WebP</option>
    <option value="image/png">PNG</option>
  </select></div>`;

const qualitySlider = `<div class="field"><label for="quality">Quality <span data-quality-label>80%</span></label>
  <input id="quality" name="quality" type="range" min="40" max="95" value="80"></div>`;

function convertTool(opts) {
  toolPage({
    section: "Convert",
    sectionHref: "/convert.html",
    scripts: ["js/converter.js"],
    icon: "repeat",
    process: opts.process,
    drop: opts.drop,
    attrs: `data-tool="convert" data-to="${opts.to}" data-accept="${opts.accept}"`,
    related: opts.related,
    title: opts.title,
    description: opts.description,
    path: opts.path,
    h1: opts.h1,
    intro: opts.intro,
    h2: opts.h2,
    body: opts.body,
    steps: opts.steps,
    faqs: opts.faqs,
  });
}

convertTool({
  path: "/tools/jpg-to-png.html",
  title: "JPG to PNG Converter  -  ImageTools AI",
  description: "Convert JPG photos to PNG in your browser. Transparent-ready PNG output without uploading the file.",
  h1: "JPG to PNG converter",
  intro: "Turn a JPEG photo into a PNG on this page. The conversion draws the image onto a canvas and exports a real PNG file, not a renamed .jpg.",
  h2: "When JPG to PNG is the right move",
  body: `<p>JPEG is efficient for photographs, but it cannot store transparency and it adds compression artifacts around hard edges. PNG keeps edges cleaner and is the usual choice when you need to drop a photo onto a colored background later.</p><p>This converter accepts .jpg and .jpeg files, including pictures from a phone camera. After you convert, download the PNG and open it in any editor that reads PNG. If you only need a smaller photo, use the <a href="/tools/image-compressor.html">image compressor</a> instead of converting up to PNG.</p>`,
  drop: "JPG or JPEG files",
  to: "image/png",
  accept: "image/jpeg,.jpg,.jpeg",
  process: "Convert to PNG",
  steps: ["Add a JPG file.", "Check the preview and dimensions.", "Convert to PNG.", "Download the new file."],
  related: [
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/jpg-to-webp.html", label: "JPG to WebP" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-to-pdf.html", label: "Image to PDF" },
  ],
  faqs: [
    { q: "Does this just change the file extension?", a: "No. The page re-encodes pixels to PNG with the Canvas API and offers a PNG download." },
    { q: "Will transparency appear automatically?", a: "JPEG has no alpha channel, so the PNG will be opaque. Use PNG to WebP if you already have transparency." },
    { q: "Is the photo uploaded?", a: "No. Your images are processed locally in your browser and are not uploaded to our servers." },
    { q: "What size can I convert?", a: "Very large camera files may be limited by browser memory. Resize first if the tab struggles." },
  ],
});

convertTool({
  path: "/tools/png-to-jpg.html",
  title: "PNG to JPG Converter  -  ImageTools AI",
  description: "Convert PNG images to JPG in your browser. Flatten transparency onto white and download a smaller photo file.",
  h1: "PNG to JPG converter",
  intro: "Export a PNG as JPEG. Transparent areas are flattened onto white so the JPG stays valid.",
  h2: "Why convert PNG to JPG",
  body: `<p>PNG is excellent for graphics and screenshots with text. For photographs, JPEG is usually smaller at a similar visual quality. This page re-encodes the PNG through a canvas, fills the background with white, and writes a JPEG blob.</p><p>If you need to keep a logo’s transparent background, stay on PNG or convert to <a href="/tools/png-to-webp.html">WebP</a> instead.</p>`,
  drop: "PNG files",
  to: "image/jpeg",
  accept: "image/png,.png",
  process: "Convert to JPG",
  steps: ["Add a PNG.", "Preview the graphic.", "Convert to JPG.", "Download the JPEG."],
  related: [
    { href: "/tools/jpg-to-png.html", label: "JPG to PNG" },
    { href: "/tools/png-to-webp.html", label: "PNG to WebP" },
    { href: "/tools/png-compressor.html", label: "PNG Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "What happens to transparent pixels?", a: "They are drawn on a white background because JPEG cannot store alpha." },
    { q: "Can I pick the JPEG quality?", a: "This converter uses a high-quality encode. Use the JPG compressor if you need a smaller file." },
    { q: "Are screenshots supported?", a: "Yes. PNG screenshots convert like any other PNG." },
    { q: "Is this done on a server?", a: "No. Conversion stays in the browser." },
  ],
});

convertTool({
  path: "/tools/jpg-to-webp.html",
  title: "JPG to WebP Converter  -  ImageTools AI",
  description: "Convert JPG images to WebP in your browser for smaller photos on websites and apps.",
  h1: "JPG to WebP converter",
  intro: "Export JPEG photos as WebP. Most modern browsers can encode WebP from a canvas, which is how this page does the conversion.",
  h2: "WebP for photographs",
  body: `<p>WebP often beats JPEG on file size at a similar look, which helps page weight. This tool does not upload your photo. It decodes the JPG, draws it, and asks the browser for a WebP blob.</p><p>If a download fails, the browser may lack WebP encoding. Chrome, Edge, Firefox and Safari current versions typically work. Pair this with the <a href="/tools/image-compressor.html">compressor</a> when you also need a maximum width.</p>`,
  drop: "JPG files",
  to: "image/webp",
  accept: "image/jpeg,.jpg,.jpeg",
  process: "Convert to WebP",
  steps: ["Add a JPG.", "Review the preview.", "Convert to WebP.", "Download the .webp file."],
  related: [
    { href: "/tools/png-to-webp.html", label: "PNG to WebP" },
    { href: "/tools/webp-to-jpg.html", label: "WebP to JPG" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/jpg-compressor.html", label: "JPG Compressor" },
  ],
  faqs: [
    { q: "Is WebP smaller than JPG?", a: "Often, yes, but it depends on the photo. Compare file sizes after you convert." },
    { q: "Will older apps open WebP?", a: "Some editors still prefer JPEG. Convert back with WebP to JPG if needed." },
    { q: "Do you store the photo?", a: "No. Processing is local." },
    { q: "Can I convert several files?", a: "This page handles one image at a time so the preview stays clear." },
  ],
});

convertTool({
  path: "/tools/png-to-webp.html",
  title: "PNG to WebP Converter  -  ImageTools AI",
  description: "Convert PNG images to WebP in your browser. Keep graphics sharp while cutting file size for the web.",
  h1: "PNG to WebP converter",
  intro: "Turn PNG graphics into WebP. The browser encodes a new file from the canvas, including cases where PNG was larger than it needed to be.",
  h2: "PNG graphics as WebP",
  body: `<p>UI assets, screenshots and illustrations are often saved as PNG by default. WebP can keep edges clean at a lower size. Transparency support depends on the browser encoder. If you must have a classic PNG, keep a copy before converting.</p><p>For photos saved as PNG, <a href="/tools/png-to-jpg.html">PNG to JPG</a> or this WebP export will usually shrink the file more than PNG compression alone.</p>`,
  drop: "PNG files",
  to: "image/webp",
  accept: "image/png,.png",
  process: "Convert to WebP",
  steps: ["Add a PNG.", "Check the preview.", "Convert to WebP.", "Download the result."],
  related: [
    { href: "/tools/jpg-to-webp.html", label: "JPG to WebP" },
    { href: "/tools/webp-to-png.html", label: "WebP to PNG" },
    { href: "/tools/png-compressor.html", label: "PNG Compressor" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Is this lossy?", a: "The browser WebP encoder used here is lossy at a high quality setting. Keep the original PNG if you need a lossless master." },
    { q: "Does it run offline after the page loads?", a: "Yes. The conversion does not call a server." },
    { q: "Can I convert icons?", a: "Yes, though tiny icons may not shrink much." },
    { q: "What if WebP encoding is missing?", a: "You will see an error. Use PNG to JPG as a fallback." },
  ],
});

convertTool({
  path: "/tools/webp-to-jpg.html",
  title: "WebP to JPG Converter  -  ImageTools AI",
  description: "Convert WebP images to JPG in your browser when a tool or printer still needs JPEG.",
  h1: "WebP to JPG converter",
  intro: "Decode a WebP image and export JPEG. Useful when an upload form, printer, or older editor rejects WebP.",
  h2: "Going back to JPEG",
  body: `<p>WebP is common on the web, but plenty of workflows still expect .jpg. This page loads the WebP in the browser, draws it, and encodes JPEG. Transparent WebP files flatten onto white.</p><p>If you need a lossless-style graphic instead, use <a href="/tools/webp-to-png.html">WebP to PNG</a>.</p>`,
  drop: "WebP files",
  to: "image/jpeg",
  accept: "image/webp,.webp",
  process: "Convert to JPG",
  steps: ["Add a WebP file.", "Preview it.", "Convert to JPG.", "Download the JPEG."],
  related: [
    { href: "/tools/webp-to-png.html", label: "WebP to PNG" },
    { href: "/tools/jpg-to-webp.html", label: "JPG to WebP" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "My browser will not open the WebP.", a: "Update the browser or try another one. Decoding WebP is required for this conversion." },
    { q: "Is quality reduced?", a: "JPEG is lossy. The export uses a high quality setting, but it is not a bit-perfect copy." },
    { q: "Are animated WebP files supported?", a: "No. This tool converts a still frame, not animation." },
    { q: "Is the file uploaded?", a: "No." },
  ],
});

convertTool({
  path: "/tools/webp-to-png.html",
  title: "WebP to PNG Converter  -  ImageTools AI",
  description: "Convert WebP images to PNG in your browser for editors and sites that still want PNG.",
  h1: "WebP to PNG converter",
  intro: "Export WebP as PNG when you need a widely supported graphic format with a simple alpha channel.",
  h2: "WebP into PNG",
  body: `<p>Some design tools still prefer PNG. This converter decodes WebP and writes PNG from the canvas. The PNG may be larger than the WebP. That is expected.</p><p>For photographs, <a href="/tools/webp-to-jpg.html">WebP to JPG</a> is usually the smaller download.</p>`,
  drop: "WebP files",
  to: "image/png",
  accept: "image/webp,.webp",
  process: "Convert to PNG",
  steps: ["Add a WebP image.", "Preview the graphic.", "Convert to PNG.", "Download the PNG."],
  related: [
    { href: "/tools/webp-to-jpg.html", label: "WebP to JPG" },
    { href: "/tools/png-to-webp.html", label: "PNG to WebP" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/image-to-pdf.html", label: "Image to PDF" },
  ],
  faqs: [
    { q: "Will the PNG be larger?", a: "Often yes. PNG is a different compression style." },
    { q: "Is animation preserved?", a: "No. Only a still image is exported." },
    { q: "Can I edit after converting?", a: "Yes. PNG opens in essentially every editor." },
    { q: "Does this use a server?", a: "No. It runs locally." },
  ],
});

convertTool({
  path: "/tools/bmp-to-jpg.html",
  title: "BMP to JPG Converter  -  ImageTools AI",
  description: "Convert BMP bitmaps to JPG in your browser. Supports common BMP files and a fallback decoder for uncompressed 24-bit and 32-bit images.",
  h1: "BMP to JPG converter",
  intro: "Open a BMP and download JPEG. If the browser cannot decode the bitmap, the page tries an uncompressed 24-bit or 32-bit BMP reader.",
  h2: "From BMP to a web-friendly JPEG",
  body: `<p>BMP files show up from older Windows software and some scanners. They are large because they often store uncompressed pixels. JPEG is the practical format for sharing those pictures.</p><p>This tool first asks the browser to decode the BMP. If that fails, it reads uncompressed 24-bit and 32-bit BMP data directly. Compressed BMP variants are not claimed here.</p>`,
  drop: "BMP files",
  to: "image/jpeg",
  accept: "image/bmp,.bmp",
  process: "Convert to JPG",
  steps: ["Add a BMP file.", "Wait for the preview.", "Convert to JPG.", "Download the JPEG."],
  related: [
    { href: "/tools/tiff-to-jpg.html", label: "TIFF to JPG" },
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "Why did my BMP fail?", a: "Compressed or indexed BMP files are not decoded here. Export PNG or TIFF from the original app if you can." },
    { q: "Is BMP uploaded?", a: "No. Decoding happens in the tab." },
    { q: "Will colors look the same?", a: "The converter copies pixel values it can read. Color profiles in BMP are not a full CMS." },
    { q: "Can I keep a BMP?", a: "This page only exports JPEG. Keep the original file if you still need BMP." },
  ],
});

convertTool({
  path: "/tools/tiff-to-jpg.html",
  title: "TIFF to JPG Converter  -  ImageTools AI",
  description: "Convert TIFF images to JPG in your browser. Common TIFF files are decoded locally, then exported as JPEG.",
  h1: "TIFF to JPG converter",
  intro: "Decode a TIFF still image and save JPEG. The decoder loads only on this page so the rest of the site stays light.",
  h2: "TIFF scans as JPEG",
  body: `<p>Scanners and cameras still write TIFF. Those files are awkward to email and many websites reject them. This page decodes a common TIFF and encodes JPEG in the browser.</p><p>Multi-page or exotic TIFF variants may not open. If the preview fails, export PNG from the scanner software and use <a href="/tools/png-to-jpg.html">PNG to JPG</a>.</p>`,
  drop: "TIFF or TIF files",
  to: "image/jpeg",
  accept: "image/tiff,.tif,.tiff",
  process: "Convert to JPG",
  steps: ["Add a TIFF file.", "Wait while it decodes.", "Convert to JPG.", "Download the JPEG."],
  related: [
    { href: "/tools/bmp-to-jpg.html", label: "BMP to JPG" },
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/image-to-pdf.html", label: "Image to PDF" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Are multi-page TIFFs supported?", a: "Only the first decoded frame is converted." },
    { q: "Is the TIFF sent to a server?", a: "No. A decoder runs in the browser on this page." },
    { q: "Why is JPEG the output?", a: "JPEG is the format most forms and printers accept from a scan." },
    { q: "Can I convert TIFF to PNG?", a: "Convert to JPG here, or open a PNG export from your scanner if you need lossless graphics." },
  ],
});

function compressPage(opts) {
  toolPage({
    section: "Compress",
    sectionHref: "/compress.html",
    scripts: ["js/compressor.js"],
    icon: "minimize-2",
    process: "Compress image",
    drop: opts.drop,
    attrs: `data-tool="compress" data-accept="${opts.accept}"`,
    related: opts.related,
    title: opts.title,
    description: opts.description,
    path: opts.path,
    h1: opts.h1,
    intro: opts.intro,
    h2: opts.h2,
    body: opts.body,
    steps: opts.steps,
    faqs: opts.faqs,
    controls: `${qualitySlider}
      ${formatSelect}
      <div class="field-row">
        <div class="field"><label for="maxw">Maximum width</label><input id="maxw" name="maxw" type="number" min="1" placeholder="Original"></div>
        <div class="field"><label for="maxh">Maximum height</label><input id="maxh" name="maxh" type="number" min="1" placeholder="Original"></div>
      </div>
      <div class="meta">
        <div class="stat"><span>Original</span><b data-original> - </b></div>
        <div class="stat"><span>Compressed</span><b data-compressed> - </b></div>
        <div class="stat"><span>Saved</span><b data-saved> - </b></div>
      </div>`,
  });
}

compressPage({
  path: "/tools/image-compressor.html",
  title: "Image Compressor  -  ImageTools AI",
  description: "Compress JPG, PNG and WebP images in your browser. Control quality and maximum size, then see how much you saved.",
  h1: "Image compressor",
  intro: "Reduce image file size in the tab you already have open. Set quality, pick an output format, and optionally cap width or height.",
  h2: "How this compressor works",
  body: `<p>The compressor draws your image to a canvas, optionally scales it down to a maximum width and height, then encodes JPG, WebP or PNG. It reports original size, compressed size and the percentage saved, for example Original: 2.4 MB, Compressed: 640 KB, Saved: 73%.</p><p>PNG output may not shrink much because PNG encoding in the browser is not a dedicated PNG optimizer. For photos, JPG or WebP usually saves more. Nothing is uploaded.</p>`,
  drop: "JPG, PNG or WebP",
  accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  steps: ["Add an image.", "Set quality and optional max dimensions.", "Compress and compare sizes.", "Download if the result looks right."],
  related: [
    { href: "/tools/jpg-compressor.html", label: "JPG Compressor" },
    { href: "/tools/png-compressor.html", label: "PNG Compressor" },
    { href: "/tools/image-size-reducer.html", label: "Image Size Reducer" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "Why did PNG not get smaller?", a: "Browser PNG export is not a specialized PNG crush. Switch the output format to JPG or WebP for photos." },
    { q: "What does quality do?", a: "It is the encoder quality for JPG and WebP. Lower values make smaller files and more artifacts." },
    { q: "Can I keep the original dimensions?", a: "Leave maximum width and height empty." },
    { q: "Is the image uploaded?", a: "No. Compression runs locally." },
  ],
});

compressPage({
  path: "/tools/jpg-compressor.html",
  title: "JPG Compressor  -  ImageTools AI",
  description: "Compress JPG photos in your browser. Tune quality and maximum dimensions, then download a smaller JPEG.",
  h1: "JPG compressor",
  intro: "Target JPEG files only. Re-encode a photo at a quality you choose and optionally downscale it before download.",
  h2: "Smaller JPEGs without a desktop app",
  body: `<p>Each save of a JPEG can add artifacts, so start from the original camera file when you can. This page shows the new size before you keep the result. Use a quality around 70-85 for web photos, then drop maximum width to 1600 or 1920 if the picture is only going on a site.</p>`,
  drop: "JPG files",
  accept: "image/jpeg,.jpg,.jpeg",
  steps: ["Add a JPG.", "Choose quality and max size.", "Compress.", "Download the smaller JPEG."],
  related: [
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/webp-compressor.html", label: "WebP Compressor" },
    { href: "/tools/jpg-to-webp.html", label: "JPG to WebP" },
    { href: "/tools/image-size-reducer.html", label: "Image Size Reducer" },
  ],
  faqs: [
    { q: "Should I compress a JPG that was already compressed?", a: "You can, but quality falls each time. Prefer the original file." },
    { q: "Does EXIF stay in the file?", a: "Canvas export writes pixels only, so metadata is not copied into the new JPEG." },
    { q: "Can I aim for a exact byte size?", a: "No. You adjust quality and dimensions, then read the resulting size." },
    { q: "Is this local?", a: "Yes." },
  ],
});

compressPage({
  path: "/tools/png-compressor.html",
  title: "PNG Compressor  -  ImageTools AI",
  description: "Reduce PNG file size in your browser by resizing and optionally exporting JPG or WebP.",
  h1: "PNG compressor",
  intro: "Shrink PNG graphics by limiting dimensions or by exporting a more efficient format. The page always shows original versus new size.",
  h2: "Making PNGs lighter",
  body: `<p>True PNG optimization (indexed palettes, zopfli, and so on) is not faked here. What this tool does well is downscale a huge screenshot and, for photographic PNGs, export JPG or WebP. That is usually what people need when a PNG is “too big to upload.”</p>`,
  drop: "PNG files",
  accept: "image/png,.png",
  steps: ["Add a PNG.", "Cap width or height if needed.", "Pick an output format.", "Compress and download."],
  related: [
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/png-to-webp.html", label: "PNG to WebP" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "Will my PNG stay a PNG?", a: "Only if you keep PNG as the output format. That may not reduce size much." },
    { q: "What about transparency?", a: "Keep PNG or WebP if you need alpha. JPEG flattens it." },
    { q: "Can I compress icons?", a: "Yes, though small icons rarely benefit." },
    { q: "Is the PNG uploaded?", a: "No." },
  ],
});

compressPage({
  path: "/tools/webp-compressor.html",
  title: "WebP Compressor  -  ImageTools AI",
  description: "Compress WebP images in your browser with quality and maximum dimension controls.",
  h1: "WebP compressor",
  intro: "Re-encode a WebP file at a lower quality or smaller size. Useful when a WebP export from another app is still too heavy.",
  h2: "Second-pass WebP",
  body: `<p>If a design tool wrote a huge WebP, run it through this page. You can keep WebP or switch to JPG. The percentage saved is measured against the file you opened, not against some theoretical original.</p>`,
  drop: "WebP files",
  accept: "image/webp,.webp",
  steps: ["Add a WebP image.", "Set quality and max size.", "Compress.", "Download."],
  related: [
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/webp-to-jpg.html", label: "WebP to JPG" },
    { href: "/tools/jpg-to-webp.html", label: "JPG to WebP" },
    { href: "/tools/image-size-reducer.html", label: "Image Size Reducer" },
  ],
  faqs: [
    { q: "Can I make a lossless WebP?", a: "No. This encoder is the browser’s standard WebP export." },
    { q: "Why is saved 0%?", a: "The new file was not smaller. Lower quality or max width." },
    { q: "Animated WebP?", a: "Not supported." },
    { q: "Local processing?", a: "Yes." },
  ],
});

compressPage({
  path: "/tools/image-size-reducer.html",
  title: "Image Size Reducer  -  ImageTools AI",
  description: "Reduce image dimensions and file size in your browser. Set a maximum width and height, then download the smaller file.",
  h1: "Image size reducer",
  intro: "When the problem is megapixels as much as quality, cap the longest edge. This reducer scales the image down, then encodes it.",
  h2: "Dimensions first, then encoding",
  body: `<p>A 4000-pixel photo is larger than most websites need. Set a maximum width such as 1600 and a quality around 80. The tool keeps aspect ratio while fitting inside those limits. Check original versus compressed size before you keep the file.</p>`,
  drop: "Any common image",
  accept: "image/*",
  steps: ["Add an image.", "Enter a maximum width or height.", "Reduce.", "Download the smaller file."],
  related: [
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/jpg-compressor.html", label: "JPG Compressor" },
  ],
  faqs: [
    { q: "Does this crop the image?", a: "No. It scales the whole image to fit the maximum box." },
    { q: "Can I enlarge a picture?", a: "Use the resizer if you need larger pixel dimensions. This page is for reducing size." },
    { q: "Which format should I pick?", a: "JPG or WebP for photos, PNG for graphics with text or transparency." },
    { q: "Uploaded?", a: "No. It stays in the browser." },
  ],
});

toolPage({
  path: "/tools/image-resizer.html",
  title: "Image Resizer  -  ImageTools AI",
  description: "Resize images by width, height or percentage in your browser. Lock aspect ratio and choose JPG, PNG or WebP output.",
  h1: "Image resizer",
  intro: "Set exact pixel dimensions or scale by percentage. Lock aspect ratio to avoid stretching, then export JPG, PNG or WebP.",
  h2: "Exact sizes for uploads and layouts",
  body: `<p>Profile photos, product cards and email headers often demand a specific width and height. Enter those numbers here. With aspect lock on, changing width updates height. Percentage scale is handy when you want “half size” without doing the math.</p><p>Original and final dimensions stay visible so you can confirm the export before downloading.</p>`,
  section: "Edit",
  sectionHref: "/resize.html",
  scripts: ["js/resizer.js"],
  icon: "maximize-2",
  process: "Resize image",
  drop: "JPG, PNG, WebP and other browser-readable images",
  attrs: `data-tool="resize"`,
  controls: `<div class="field-row">
      <div class="field"><label for="width">Width</label><input id="width" name="width" type="number" min="1"></div>
      <div class="field"><label for="height">Height</label><input id="height" name="height" type="number" min="1"></div>
    </div>
    <label class="check"><input type="checkbox" name="lock" checked> Lock aspect ratio</label>
    <div class="field"><label for="percent">Percentage</label><input id="percent" name="percent" type="number" min="1" max="400" value="100"></div>
    ${formatSelect}
    <div class="field"><label for="quality">Quality</label><input id="quality" name="quality" type="range" min="40" max="100" value="90"></div>
    <p class="privacy-note">Final dimensions: <strong data-outdims> - </strong></p>`,
  steps: ["Add an image.", "Set width, height or percentage.", "Resize.", "Download."],
  related: [
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/image-size-reducer.html", label: "Image Size Reducer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-rotator.html", label: "Image Rotator" },
  ],
  faqs: [
    { q: "Will this stretch my photo?", a: "Not if aspect lock is on. Turn it off only when you want independent width and height." },
    { q: "Can I upscale?", a: "Yes, but enlarging cannot invent real detail. The enhancer is a better next step than huge upscales." },
    { q: "Does percentage use the original size?", a: "Yes. 50% is half the original width and height." },
    { q: "Local?", a: "Yes. Your images are processed locally in your browser and are not uploaded to our servers." },
  ],
});

toolPage({
  path: "/tools/image-cropper.html",
  title: "Image Cropper  -  ImageTools AI",
  description: "Crop images in your browser with free, 1:1, 4:3, 16:9 or custom ratios. Rotate and flip before you export.",
  h1: "Image cropper",
  intro: "Drag the crop box, snap to a ratio, rotate or flip, then export the selected region. The overlay updates as you move.",
  h2: "Framing without installing an editor",
  body: `<p>Use free crop when you just want to cut edges. Switch to 1:1 for avatars, 4:3 for classic prints, or 16:9 for banners. Custom ratio takes two numbers. Rotate and flip change the source before the crop is applied so the handles still make sense.</p>`,
  section: "Edit",
  sectionHref: "/resize.html",
  scripts: ["js/cropper.js"],
  icon: "crop",
  process: "Crop image",
  drop: "Any common image",
  attrs: `data-tool="crop"`,
  preview: `<div class="preview-wrap crop-stage" data-stage hidden>
      <img data-preview alt="Image to crop">
      <div class="crop-box" data-crop>
        <i class="handle nw" data-handle="nw"></i>
        <i class="handle ne" data-handle="ne"></i>
        <i class="handle sw" data-handle="sw"></i>
        <i class="handle se" data-handle="se"></i>
      </div>
    </div>`,
  controls: `<div class="field"><label for="ratio">Aspect ratio</label>
      <select id="ratio" name="ratio">
        <option value="free">Free</option>
        <option value="1:1">1:1</option>
        <option value="4:3">4:3</option>
        <option value="16:9">16:9</option>
        <option value="custom">Custom</option>
      </select></div>
    <div class="field-row">
      <div class="field"><label for="rw">Ratio width</label><input id="rw" name="rw" type="number" min="1" value="3"></div>
      <div class="field"><label for="rh">Ratio height</label><input id="rh" name="rh" type="number" min="1" value="2"></div>
    </div>
    ${formatSelect}
    <div class="actions">
      <button class="btn btn-ghost" type="button" data-rotate>${icon("rotate-cw", { size: 16 })}<span>Rotate</span></button>
      <button class="btn btn-ghost" type="button" data-flipx>${icon("flip-horizontal", { size: 16 })}<span>Flip horizontal</span></button>
      <button class="btn btn-ghost" type="button" data-flipy>${icon("flip-horizontal", { size: 16, className: "icon-rot-90" })}<span>Flip vertical</span></button>
    </div>`,
  steps: ["Add an image.", "Drag the crop box or pick a ratio.", "Rotate or flip if needed.", "Crop and download."],
  related: [
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-rotator.html", label: "Image Rotator" },
    { href: "/tools/image-flipper.html", label: "Image Flipper" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Can I crop on a phone?", a: "Yes. The handles are large enough for touch. Drag inside the box to move it." },
    { q: "Does rotate crop the corners off?", a: "90° rotation swaps width and height, then you crop the rotated picture." },
    { q: "Is there a live preview?", a: "The dimmed overlay is the live crop. Download after you press Crop image." },
    { q: "Local?", a: "Yes." },
  ],
});

const FILTER_ICONS = {
  rotate: "rotate-cw",
  flip: "flip-horizontal",
  grayscale: "contrast",
  blur: "droplet",
  sharpen: "focus",
  enhance: "wand-2",
};

function filterPage(opts) {
  toolPage({
    section: "Edit",
    sectionHref: "/edit.html",
    scripts: ["js/filters.js"],
    icon: FILTER_ICONS[opts.filter] || "wand-2",
    process: opts.process,
    drop: "Any common image",
    attrs: `data-tool="filter" data-filter="${opts.filter}"`,
    related: opts.related,
    title: opts.title,
    description: opts.description,
    path: opts.path,
    h1: opts.h1,
    intro: opts.intro,
    h2: opts.h2,
    body: opts.body,
    steps: opts.steps,
    faqs: opts.faqs,
    controls: opts.controls + formatSelect,
  });
}

filterPage({
  path: "/tools/image-rotator.html",
  title: "Image Rotator  -  ImageTools AI",
  description: "Rotate images 90, 180 or 270 degrees in your browser and download the turned file.",
  h1: "Image rotator",
  intro: "Turn a sideways photo upright. Rotation is 90, 180 or 270 degrees so pixels stay sharp.",
  h2: "Fix orientation without an app",
  body: `<p>Phone photos are sometimes stored with a sideways pixel buffer. Rotating on a canvas rewrites the pixels so the download looks correct everywhere, not only in viewers that honor EXIF orientation.</p>`,
  filter: "rotate",
  process: "Rotate image",
  controls: `<div class="field"><label for="amount">Degrees</label>
    <select id="amount" name="amount"><option value="90">90</option><option value="180">180</option><option value="270">270</option></select></div>`,
  steps: ["Add an image.", "Choose 90, 180 or 270 degrees.", "Rotate.", "Download."],
  related: [
    { href: "/tools/image-flipper.html", label: "Image Flipper" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-metadata-remover.html", label: "Metadata Remover" },
  ],
  faqs: [
    { q: "Can I rotate 15 degrees?", a: "This tool uses right angles so the canvas stays axis-aligned and sharp." },
    { q: "Does this fix EXIF orientation?", a: "It writes a new pixel layout. The download should appear upright even without EXIF." },
    { q: "Multiple rotations?", a: "Run the tool again on the download, or pick 180 / 270." },
    { q: "Local?", a: "Yes." },
  ],
});

filterPage({
  path: "/tools/image-flipper.html",
  title: "Image Flipper  -  ImageTools AI",
  description: "Flip images horizontally or vertically in your browser. Useful for mirrored selfies and layouts.",
  h1: "Image flipper",
  intro: "Mirror an image left-right, top-bottom, or both. The preview updates after you process.",
  h2: "Mirroring on a canvas",
  body: `<p>Horizontal flip is the usual fix for a selfie that feels backward. Vertical flip is rarer but useful for scans placed upside down together with rotation. This is a pixel flip, not a CSS preview.</p>`,
  filter: "flip",
  process: "Flip image",
  controls: `<label class="check"><input type="checkbox" name="flipx" checked> Flip horizontal</label>
    <label class="check"><input type="checkbox" name="flipy"> Flip vertical</label>`,
  steps: ["Add an image.", "Choose horizontal, vertical, or both.", "Flip.", "Download."],
  related: [
    { href: "/tools/image-rotator.html", label: "Image Rotator" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/grayscale-image.html", label: "Grayscale Image" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
  ],
  faqs: [
    { q: "Is text reversed?", a: "Yes. A horizontal flip mirrors letters. Crop text out first if that matters." },
    { q: "Can I undo?", a: "Use Reset and start again, or flip a second time." },
    { q: "Both axes?", a: "Check both boxes. That is the same as a 180° rotate for a rectangular photo." },
    { q: "Local?", a: "Yes." },
  ],
});

filterPage({
  path: "/tools/grayscale-image.html",
  title: "Grayscale Image Converter  -  ImageTools AI",
  description: "Convert images to grayscale in your browser using a standard luminance mix, then download the result.",
  h1: "Grayscale image",
  intro: "Strip color with a weighted luminance conversion (not a cheap average) and export the gray image.",
  h2: "Color to gray, on purpose",
  body: `<p>The page uses the 0.299 / 0.587 / 0.114 mix so greens stay relatively bright, which matches how people read photos. This is a local pixel walk, not a filter preset from an online editor.</p>`,
  filter: "grayscale",
  process: "Convert to grayscale",
  controls: "",
  steps: ["Add an image.", "Convert to grayscale.", "Check the preview.", "Download."],
  related: [
    { href: "/tools/blur-image.html", label: "Blur Image" },
    { href: "/tools/sharpen-image.html", label: "Sharpen Image" },
    { href: "/tools/image-quality-enhancer.html", label: "Image Quality Enhancer" },
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
  ],
  faqs: [
    { q: "Can I keep one color?", a: "No. This tool makes a full grayscale image." },
    { q: "Is it reversible?", a: "No. Keep the original color file." },
    { q: "Does it work on PNG?", a: "Yes. Any image the browser can decode." },
    { q: "Local?", a: "Yes." },
  ],
});

filterPage({
  path: "/tools/blur-image.html",
  title: "Blur Image Tool  -  ImageTools AI",
  description: "Blur images in your browser with a controllable radius. Useful for backgrounds and privacy on a still photo.",
  h1: "Blur image",
  intro: "Apply a Gaussian-style canvas blur. Raise the amount for a heavier frost, then export.",
  h2: "Soft-focus in the browser",
  body: `<p>This uses the canvas blur filter, which is fast enough for typical photos. It is not a selective portrait blur. The whole frame is softened. For hiding information, check the result at 100% before you share it.</p>`,
  filter: "blur",
  process: "Blur image",
  controls: `<div class="field"><label for="amount">Blur amount</label><input id="amount" name="amount" type="range" min="8" max="100" value="36"></div>`,
  steps: ["Add an image.", "Set the blur amount.", "Process.", "Download."],
  related: [
    { href: "/tools/sharpen-image.html", label: "Sharpen Image" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/grayscale-image.html", label: "Grayscale Image" },
    { href: "/tools/image-metadata-remover.html", label: "Metadata Remover" },
  ],
  faqs: [
    { q: "Can I blur one face only?", a: "Not on this page. Crop first or use a dedicated editor." },
    { q: "Why is it slow?", a: "Huge images plus a heavy blur cost GPU/CPU. Reduce size first." },
    { q: "Is the blur permanent in the download?", a: "Yes. The pixels are rewritten." },
    { q: "Local?", a: "Yes." },
  ],
});

filterPage({
  path: "/tools/sharpen-image.html",
  title: "Sharpen Image Tool  -  ImageTools AI",
  description: "Sharpen images in your browser with an unsharp-style convolution. Helpful for slightly soft photos and screenshots.",
  h1: "Sharpen image",
  intro: "Run a 3×3 sharpen kernel on the pixels. It can help mildly soft photos. It cannot recover a badly out-of-focus shot.",
  h2: "A real sharpen, not a slider screenshot",
  body: `<p>The kernel emphasizes edges by subtracting neighboring pixels. Overuse looks crunchy, especially on JPEGs that already have artifacts. Try once, inspect at 100%, then download or reset.</p>`,
  filter: "sharpen",
  process: "Sharpen image",
  controls: "",
  steps: ["Add an image.", "Sharpen.", "Inspect the preview.", "Download or reset."],
  related: [
    { href: "/tools/image-quality-enhancer.html", label: "Image Quality Enhancer" },
    { href: "/tools/blur-image.html", label: "Blur Image" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Will this fix blurry photos?", a: "Only a little softness. It will not reconstruct missing focus." },
    { q: "Why do I see halos?", a: "That is the kernel on high-contrast edges. Use the original if it looks worse." },
    { q: "PNG and JPG?", a: "Both. Sharpening happens on decoded pixels." },
    { q: "Local?", a: "Yes." },
  ],
});

filterPage({
  path: "/tools/image-quality-enhancer.html",
  title: "Image Quality Enhancer  -  ImageTools AI",
  description: "Enhance image contrast and edge detail in your browser. A local pixel pass, not a fake AI upscaler.",
  h1: "Image quality enhancer",
  intro: "A local contrast and sharpen pass. It is honest about what it is: a canvas enhancement, not a generative upscaler.",
  h2: "What “enhance” means here",
  body: `<p>Some tools advertise AI quality with no model behind them. This page applies a contrast stretch and a sharpen kernel. Flat photos often look a bit clearer. Noisy night shots may look worse. Judge the preview, then download only if it helps.</p>`,
  filter: "enhance",
  process: "Enhance image",
  controls: `<div class="field"><label for="amount">Strength</label><input id="amount" name="amount" type="range" min="10" max="80" value="36"></div>`,
  steps: ["Add an image.", "Set strength.", "Enhance.", "Download if the preview looks better."],
  related: [
    { href: "/tools/sharpen-image.html", label: "Sharpen Image" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/ai-image-analyzer.html", label: "AI Image Analyzer" },
  ],
  faqs: [
    { q: "Is this AI?", a: "No. It is a local contrast and sharpen pass. AI tools live in their own section." },
    { q: "Can it upscale 4×?", a: "No. Use the resizer if you only need more pixels, knowing that does not add real detail." },
    { q: "Why did it look harsher?", a: "Lower the strength or skip enhance on already contrasty photos." },
    { q: "Local?", a: "Yes." },
  ],
});

toolPage({
  path: "/tools/image-to-pdf.html",
  title: "Image to PDF  -  ImageTools AI",
  description: "Convert images to PDF in your browser. Add multiple files, reorder them, set page size, orientation, margins and quality.",
  h1: "Image to PDF",
  intro: "Build a PDF from one or more images. Reorder pages, pick A4, Letter or fit-to-image, and download. The PDF library loads only on this page.",
  h2: "Photos into a document",
  body: `<p>Add several pictures, remove any you do not want, and move them up or down before you create the file. Fit-to-image makes a page around each picture. A4 and Letter place the image centered with the margin you set. Images are embedded as JPEG inside the PDF so the download stays practical.</p>`,
  section: "Utilities",
  sectionHref: "/tools.html#utilities",
  scripts: ["js/pdf.js"],
  icon: "file-text",
  process: "Download PDF",
  hideDownload: true,
  drop: "One or more images",
  attrs: `data-tool="pdf"`,
  preview: `<div class="thumbs" data-thumbs></div>`,
  controls: `<div class="field-row">
      <div class="field"><label for="page">Page size</label>
        <select id="page" name="page">
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="fit">Fit to image</option>
        </select></div>
      <div class="field"><label for="orient">Orientation</label>
        <select id="orient" name="orient">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select></div>
    </div>
    <div class="field-row">
      <div class="field"><label for="margin">Margins (pt)</label><input id="margin" name="margin" type="number" min="0" value="36"></div>
      <div class="field"><label for="quality">PDF image quality</label><input id="quality" name="quality" type="range" min="50" max="95" value="80"></div>
    </div>`,
  steps: ["Add one or more images.", "Remove or reorder pages.", "Choose page size and margins.", "Download the PDF."],
  related: [
    { href: "/tools/jpg-to-png.html", label: "JPG to PNG" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
  ],
  faqs: [
    { q: "How many images can I add?", a: "As many as the browser can hold in memory. Very large batches may need smaller photos first." },
    { q: "Is the PDF created on a server?", a: "No. pdf-lib runs in the browser and is loaded only for this tool." },
    { q: "Can I mix JPG and PNG?", a: "Yes. Each file is drawn, then placed on its page." },
    { q: "Does fit-to-image ignore orientation?", a: "Fit uses the image’s own width and height. A4 and Letter use the orientation control." },
  ],
});

const UTILITY_ICONS = {
  picker: "pipette",
  dims: "ruler",
  size: "hard-drive",
  metadata: "eraser",
  base64: "code",
};

function utilityPage(opts) {
  toolPage({
    section: "Utilities",
    sectionHref: "/tools.html#utilities",
    scripts: ["js/utilities.js"],
    icon: UTILITY_ICONS[opts.utility] || "wrench",
    process: opts.process,
    drop: "Any common image",
    attrs: `data-tool="utility" data-utility="${opts.utility}"`,
    related: opts.related,
    title: opts.title,
    description: opts.description,
    path: opts.path,
    h1: opts.h1,
    intro: opts.intro,
    h2: opts.h2,
    body: opts.body,
    steps: opts.steps,
    faqs: opts.faqs,
    hideDownload: opts.hideDownload,
    extraActions: opts.extraActions,
    preview: opts.preview,
    after: `<pre class="ai-result" data-result></pre>${opts.after || ""}`,
    controls: opts.controls || "",
  });
}

utilityPage({
  path: "/tools/image-color-picker.html",
  title: "Image Color Picker  -  ImageTools AI",
  description: "Pick colors from an image in your browser. Click any pixel to see HEX and RGB values.",
  h1: "Image color picker",
  intro: "Open an image and click a pixel. The tool reads that pixel from a canvas and shows HEX plus RGB.",
  h2: "Sampling real pixels",
  body: `<p>This is not a guessed palette. Each click reads the canvas pixel under the cursor, which matches the preview including how the browser decoded the file. Zoom with your browser if you need a tighter target on a phone.</p>`,
  utility: "picker",
  process: "Read image",
  hideDownload: true,
  preview: `<div class="preview-wrap"><canvas class="picker-canvas" data-picker hidden></canvas></div><div class="swatch" data-swatch></div>`,
  steps: ["Add an image.", "Click the preview.", "Copy the HEX or RGB value.", "Reset to try another file."],
  related: [
    { href: "/tools/image-dimensions-checker.html", label: "Dimensions Checker" },
    { href: "/tools/grayscale-image.html", label: "Grayscale Image" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/ai-image-analyzer.html", label: "AI Image Analyzer" },
  ],
  faqs: [
    { q: "Why does the color differ from Photoshop?", a: "Color management and premultiplied alpha can shift values slightly. This reads the decoded canvas pixel." },
    { q: "Can I pick from a zoomed image?", a: "The click maps to canvas coordinates, so it still samples the correct pixel." },
    { q: "Does it work on PNG transparency?", a: "You still get RGB of that pixel. Alpha is not shown as a fourth value in the label." },
    { q: "Local?", a: "Yes." },
  ],
});

utilityPage({
  path: "/tools/image-dimensions-checker.html",
  title: "Image Dimensions Checker  -  ImageTools AI",
  description: "Check image width and height in pixels in your browser. Also see file name, size and format.",
  h1: "Image dimensions checker",
  intro: "Read pixel width and height without opening a heavy editor. The file never leaves the browser.",
  h2: "Width × height, immediately",
  body: `<p>Upload or paste an image to see its pixel size. This uses the decoded bitmap, which is what websites and most editors will use, not just a number buried in metadata.</p>`,
  utility: "dims",
  process: "Check dimensions",
  hideDownload: true,
  steps: ["Add an image.", "Read width and height.", "Note the format if you need it.", "Reset for the next file."],
  related: [
    { href: "/tools/image-file-size-checker.html", label: "File Size Checker" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-cropper.html", label: "Image Cropper" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Is this EXIF size or pixel size?", a: "Pixel size of the decoded image." },
    { q: "Do you support camera RAW?", a: "No. Use JPG, PNG, WebP, BMP or TIFF." },
    { q: "Can I see print size?", a: "Not inches or DPI. This page reports pixels." },
    { q: "Local?", a: "Yes." },
  ],
});

utilityPage({
  path: "/tools/image-file-size-checker.html",
  title: "Image File Size Checker  -  ImageTools AI",
  description: "Check image file size in bytes, KB or MB in your browser, along with dimensions and format.",
  h1: "Image file size checker",
  intro: "See how large an image file is before you upload it somewhere with a limit.",
  h2: "Bytes on disk, not pixels",
  body: `<p>File size is the number of bytes in the file you selected. Dimensions are separate. A huge pixel image saved as a high-quality PNG can be larger than a similar-looking JPEG. If the file is over a limit, open the <a href="/tools/image-compressor.html">compressor</a>.</p>`,
  utility: "size",
  process: "Check file size",
  hideDownload: true,
  steps: ["Add an image.", "Read the size in KB or MB.", "Check dimensions if needed.", "Compress if it is too large."],
  related: [
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-dimensions-checker.html", label: "Dimensions Checker" },
    { href: "/tools/image-size-reducer.html", label: "Image Size Reducer" },
    { href: "/tools/png-compressor.html", label: "PNG Compressor" },
  ],
  faqs: [
    { q: "Is this compressed size or pixel count?", a: "The file’s byte size, plus dimensions in the meta row." },
    { q: "Does opening the file change the size?", a: "No. Checking does not rewrite the file." },
    { q: "Why do two similar photos differ?", a: "JPEG quality, resolution and noise all change byte size." },
    { q: "Local?", a: "Yes." },
  ],
});

utilityPage({
  path: "/tools/image-metadata-remover.html",
  title: "Image Metadata Remover  -  ImageTools AI",
  description: "Remove EXIF and other metadata by re-encoding the image in your browser. Download a pixels-only JPEG.",
  h1: "Image metadata remover",
  intro: "Strip GPS, camera, and other metadata by drawing the picture and exporting a new JPEG that contains pixels only.",
  h2: "How metadata actually leaves the file",
  body: `<p>Deleting an extension or renaming a file does not remove EXIF. Re-encoding does. This page decodes the image, draws it to a canvas, and saves JPEG without copying metadata tags. That is also why the file may change size slightly.</p>`,
  utility: "metadata",
  process: "Remove metadata",
  steps: ["Add an image.", "Remove metadata.", "Download the new JPEG.", "Keep the original if you still need the tags."],
  related: [
    { href: "/tools/jpg-compressor.html", label: "JPG Compressor" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/image-file-size-checker.html", label: "File Size Checker" },
  ],
  faqs: [
    { q: "Is every tag gone?", a: "The download is a fresh JPEG from pixels. Embedded EXIF from the original is not copied." },
    { q: "Can I keep copyright tags?", a: "Not with this tool. It is a full strip via re-encode." },
    { q: "PNG input?", a: "Yes. Output is JPEG." },
    { q: "Local?", a: "Yes." },
  ],
});

utilityPage({
  path: "/tools/base64-image-converter.html",
  title: "Base64 Image Converter  -  ImageTools AI",
  description: "Convert an image to a Base64 data URL in your browser. Copy or download the text. Nothing is uploaded.",
  h1: "Base64 image converter",
  intro: "Turn an image into a data URL you can paste into CSS or HTML. The string is built locally from a canvas PNG.",
  h2: "Images as text",
  body: `<p>Base64 is verbose. A small icon is a reasonable use. A 12 megapixel photo is not. This converter always encodes PNG from the decoded bitmap so the string is predictable. Copy from the result box or download a .txt file.</p>`,
  utility: "base64",
  process: "Convert to Base64",
  extraActions: `<button class="btn btn-ghost" type="button" data-copy>
    <span class="btn-state state-default">${icon("copy", { size: 16 })}<span>Copy</span></span>
    <span class="btn-state state-success">${icon("check", { size: 16 })}<span>Copied</span></span>
  </button>`,
  steps: ["Add a small image.", "Convert to Base64.", "Copy the data URL.", "Paste it into your HTML or CSS."],
  related: [
    { href: "/tools/png-to-jpg.html", label: "PNG to JPG" },
    { href: "/tools/image-resizer.html", label: "Image Resizer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
    { href: "/tools/image-color-picker.html", label: "Color Picker" },
  ],
  faqs: [
    { q: "Why is the string so long?", a: "Base64 expands binary data. Resize first if you only need a tiny asset." },
    { q: "Is this still the original file?", a: "It is a PNG encoding of the decoded image, which may differ from the source bytes." },
    { q: "Can I decode Base64 back to an image?", a: "Paste a data URL into a browser address bar, or use an editor. This page focuses on encoding." },
    { q: "Local?", a: "Yes." },
  ],
});

function aiPage(opts) {
  toolPage({
    section: "AI Tools",
    sectionHref: "/ai-tools.html",
    scripts: ["js/ai-tools.js"],
    icon: "sparkles",
    process: opts.process,
    drop: "Any common image",
    attrs: `data-tool="ai" data-ai="${opts.ai}"`,
    related: opts.related,
    title: opts.title,
    description: opts.description,
    path: opts.path,
    h1: opts.h1,
    intro: opts.intro,
    h2: opts.h2,
    body: opts.body,
    steps: opts.steps,
    faqs: opts.faqs,
    ai: true,
    hideDownload: true,
    extraActions: `<button class="btn btn-ghost" type="button" data-copy>
      <span class="btn-state state-default">${icon("copy", { size: 16 })}<span>Copy result</span></span>
      <span class="btn-state state-success">${icon("check", { size: 16 })}<span>Copied</span></span>
    </button>`,
    after: `<div class="ai-result-head">${icon("sparkles", { size: 14 })}<span>AI result</span></div><pre class="ai-result" data-result></pre>`,
  });
}

aiPage({
  path: "/tools/ai-image-analyzer.html",
  title: "AI Image Analyzer  -  ImageTools AI",
  description: "Analyze an image with Gemini through ImageTools AI’s secure API. Get a written description of subject, color and composition.",
  h1: "AI image analyzer",
  intro: "Send a resized copy of your image through ImageTools AI’s API for a written analysis. Local convert tools do not use this path.",
  h2: "What the analyzer returns",
  body: `<p>The model is asked to describe subject, setting, composition, color and any readable text, without inventing objects. Treat it as a draft. If the API key is not configured, this page shows that AI features are currently unavailable and every other tool still works.</p>`,
  ai: "analyze",
  process: "Analyze image",
  steps: ["Add an image.", "Run analyze.", "Read the written result.", "Copy if you want to keep it."],
  related: [
    { href: "/tools/ai-alt-text-generator.html", label: "AI Alt Text Generator" },
    { href: "/tools/ai-image-description-generator.html", label: "AI Description Generator" },
    { href: "/tools/ai-image-seo-metadata-generator.html", label: "AI SEO Metadata" },
    { href: "/tools/image-color-picker.html", label: "Color Picker" },
  ],
  faqs: [
    { q: "Is this required for converting images?", a: "No. Converters never call Gemini." },
    { q: "Why is AI unavailable?", a: "The server has no Gemini key, or the upstream request failed. Local tools keep working." },
    { q: "Is the full-resolution file sent?", a: "The browser shrinks a copy to 1024px on the long edge first." },
    { q: "Can the analysis be wrong?", a: "Yes. Verify anything you publish." },
  ],
});

aiPage({
  path: "/tools/ai-alt-text-generator.html",
  title: "AI Alt Text Generator  -  ImageTools AI",
  description: "Generate image alt text with Gemini through a secure API. Copy a short, factual draft for your website.",
  h1: "AI alt text generator",
  intro: "Draft alt text from the picture itself. You still decide what goes on the site.",
  h2: "Alt text as a starting point",
  body: `<p>Good alt text says what is in the frame without stuffing keywords. The model is asked for at most 140 characters and not to start with “image of.” Edit the result so it matches the page context, especially if the photo is decorative.</p>`,
  ai: "alt",
  process: "Generate alt text",
  steps: ["Add an image.", "Generate alt text.", "Edit if needed.", "Copy into your site."],
  related: [
    { href: "/tools/ai-image-description-generator.html", label: "AI Description Generator" },
    { href: "/tools/ai-image-seo-metadata-generator.html", label: "AI SEO Metadata" },
    { href: "/tools/ai-image-analyzer.html", label: "AI Image Analyzer" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Should every image use this alt text?", a: "Decorative images often need empty alt. Use judgment." },
    { q: "Is the key in the page?", a: "No. The browser calls /api/ai. The Gemini key stays on the server." },
    { q: "What if AI is down?", a: "You will see that AI features are currently unavailable." },
    { q: "Local conversion still works?", a: "Yes." },
  ],
});

aiPage({
  path: "/tools/ai-image-description-generator.html",
  title: "AI Image Description Generator  -  ImageTools AI",
  description: "Generate a short image caption with Gemini through ImageTools AI’s API. Factual, two to three sentences.",
  h1: "AI image description generator",
  intro: "Write a caption from the photo for galleries, product pages, or social posts. It is a draft, not a guarantee.",
  h2: "Captions from the pixels",
  body: `<p>The prompt asks for two or three factual sentences and no hashtags. If the model misses a brand or a person, that is expected. Combine this with the analyzer when you need more detail.</p>`,
  ai: "description",
  process: "Generate description",
  steps: ["Add an image.", "Generate a description.", "Edit for your audience.", "Copy the text."],
  related: [
    { href: "/tools/ai-alt-text-generator.html", label: "AI Alt Text Generator" },
    { href: "/tools/ai-image-analyzer.html", label: "AI Image Analyzer" },
    { href: "/tools/ai-image-seo-metadata-generator.html", label: "AI SEO Metadata" },
    { href: "/tools/image-to-pdf.html", label: "Image to PDF" },
  ],
  faqs: [
    { q: "Will it name people?", a: "It may guess. Do not publish names you cannot confirm." },
    { q: "Does this change the image file?", a: "No. It only returns text." },
    { q: "Unavailable message?", a: "Gemini is not configured or the request failed." },
    { q: "Are convert tools affected?", a: "No." },
  ],
});

aiPage({
  path: "/tools/ai-image-seo-metadata-generator.html",
  title: "AI Image SEO Metadata Generator  -  ImageTools AI",
  description: "Generate image SEO title, description, filename slug and tags with Gemini through a secure API.",
  h1: "AI image SEO metadata generator",
  intro: "Ask the model for a title, meta description, filename slug and tags based on the picture. Review every field before you use it.",
  h2: "Metadata drafts, not ranking promises",
  body: `<p>The API asks for JSON with a short title, a description, a hyphenated slug and six tags. We do not invent reviews, ratings or traffic claims. You still need a real page and an honest filename.</p>`,
  ai: "seo",
  process: "Generate SEO metadata",
  steps: ["Add an image.", "Generate metadata.", "Check the JSON.", "Copy what you actually want to use."],
  related: [
    { href: "/tools/ai-alt-text-generator.html", label: "AI Alt Text Generator" },
    { href: "/tools/ai-image-description-generator.html", label: "AI Description Generator" },
    { href: "/tools/image-metadata-remover.html", label: "Metadata Remover" },
    { href: "/tools/image-compressor.html", label: "Image Compressor" },
  ],
  faqs: [
    { q: "Does this put metadata into the file?", a: "No. It returns text for you to copy. Use the metadata remover if you need a clean image file." },
    { q: "Will this rank my image?", a: "No tool can promise rankings." },
    { q: "Is the Gemini key public?", a: "No. It is only read on the server." },
    { q: "What if the JSON is messy?", a: "Copy the raw text and tidy it. Models sometimes wrap extra commentary." },
  ],
});

documentPage(
  "404.html",
  {
    title: "Page not found  -  ImageTools AI",
    description: "That page is not on ImageTools AI. Head back to all tools.",
    scripts: `<script type="module" src="./js/common.js"></script>`,
  },
  `<section class="page-hero wrap">
    <h1>Page not found</h1>
    <p class="lede">That URL is not a tool on ImageTools AI.</p>
    <p><a class="btn btn-primary" href="/tools.html">All tools</a></p>
  </section>`,
);

const urls = [
  "/",
  "/tools.html",
  "/convert.html",
  "/compress.html",
  "/resize.html",
  "/edit.html",
  "/ai-tools.html",
  "/about.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/tools/jpg-to-png.html",
  "/tools/png-to-jpg.html",
  "/tools/jpg-to-webp.html",
  "/tools/png-to-webp.html",
  "/tools/webp-to-jpg.html",
  "/tools/webp-to-png.html",
  "/tools/bmp-to-jpg.html",
  "/tools/tiff-to-jpg.html",
  "/tools/image-compressor.html",
  "/tools/jpg-compressor.html",
  "/tools/png-compressor.html",
  "/tools/webp-compressor.html",
  "/tools/image-size-reducer.html",
  "/tools/image-resizer.html",
  "/tools/image-cropper.html",
  "/tools/image-rotator.html",
  "/tools/image-flipper.html",
  "/tools/grayscale-image.html",
  "/tools/blur-image.html",
  "/tools/sharpen-image.html",
  "/tools/image-quality-enhancer.html",
  "/tools/image-to-pdf.html",
  "/tools/image-color-picker.html",
  "/tools/image-dimensions-checker.html",
  "/tools/image-file-size-checker.html",
  "/tools/image-metadata-remover.html",
  "/tools/base64-image-converter.html",
  "/tools/ai-image-analyzer.html",
  "/tools/ai-alt-text-generator.html",
  "/tools/ai-image-description-generator.html",
  "/tools/ai-image-seo-metadata-generator.html",
];

writeFileSync(
  join(ROOT, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u === "/" ? "/" : u}</loc></url>`).join("\n")}
</urlset>
`,
);

console.log(`Wrote pages and sitemap (${urls.length} urls)`);
