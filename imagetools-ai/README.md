# ImageTools AI

ImageTools AI is a browser-based image utility website for converting, compressing, resizing, cropping, and editing images without requiring an account. It is built with Vite and vanilla JavaScript, and it processes most image tasks directly in the browser for privacy and speed.

## Features

- Image conversion: JPG, PNG, WebP, BMP, TIFF and PDF workflows
- Compression for JPG, PNG and WebP files
- Resize and crop tools
- Rotate, flip, grayscale, blur, sharpen and enhancement actions
- PDF generation from images
- Optional AI-powered features for image analysis and metadata generation

## Tech Stack

- Vite
- JavaScript and CSS
- Canvas API for browser-side image processing
- pdf-lib for PDF export
- utif for TIFF handling
- Optional Gemini API integration for AI tools

## Project Structure

```text
imagetools-ai/
├── ai/
│   └── ai-service.js
├── api/
│   └── ai.js
├── css/
├── js/
├── public/
├── tools/
├── index.html
├── style.css
├── script.js
├── package.json
├── vite.config.js
├── vercel.json
├── worker.js
├── wrangler.json
├── manifest.json
└── README.md
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local Vite URL shown in the terminal.

## Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## AI Features

Some tools, such as image analysis and metadata generation, call a server-side AI endpoint. That endpoint reads the API key from the environment variable:

```bash
GEMINI_API_KEY=your_key_here
```

If this value is missing or invalid, the AI tools will return an unavailable message instead of processing the image.

## Deployment

This project includes deployment config for Vite and Whop/Cloudflare workflows.

```bash
npm run deploy
```

## Notes

- Most image operations are done locally in the browser for privacy.
- AI tools are optional and separate from the main editing tools.
- The application is static-site friendly and optimized for quick image workflows.

## License

This project is provided as-is for educational and local use. Update the license terms before publishing or commercial deployment.
