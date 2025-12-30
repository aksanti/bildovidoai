<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
  <h1>Bildovido AI — Professional Product Enhancer</h1>
</div>

Overview
--------

Bildovido AI is a Vite + React + TypeScript single-page app that enhances and generates marketing-ready product images. The project includes a client-side enhancement pipeline (canvas + worker) so it can run without external paid image APIs, and an optional Node proxy to forward requests to a local or remote Stable Diffusion WebUI (Automatic1111) for higher-quality server-based generation.

Quick Links
- File: [App.tsx](App.tsx)
- Service: [services/aiService.ts](services/aiService.ts)
- Enhancer: [services/geminiService.ts](services/geminiService.ts)
- Worker: [workers/upscale.worker.ts](workers/upscale.worker.ts)
- Proxy: [server/proxy.cjs](server/proxy.cjs) (optional)

Prerequisites
-------------

- Node.js 18+ is recommended (global `fetch` available). If you run an older Node version, install a fetch polyfill (`node-fetch@3`) and adjust the proxy server as noted below.
- A modern browser (Chrome/Edge/Firefox) for OffscreenCanvas support.

Getting Started (Dev)
---------------------

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server

   ```bash
   npm run dev
   ```

3. Open the app at the address printed by Vite (usually `http://localhost:3000`).

Production Build & Preview
--------------------------

```bash
npm run build
npm run preview
```

This generates `dist/` and serves the production build for verification. If you see old strings (for example, leftover "LuxeShot" text) in `dist/`, run `npm run build` again after ensuring source files are updated.

Environment & Optional Server Proxy
----------------------------------

- `.env.local` — optional environment variables for the client (was previously used for Gemini API keys; current client-side enhancer does not require a key).
- `WEBUI_URL` — when using the Node proxy to forward to an Automatic1111 WebUI, set the upstream WebUI URL (example: `http://127.0.0.1:7860`).
- `WEBUI_API_KEY` — optional API key for the upstream WebUI if configured.

Run the optional Node proxy (forwarder to Automatic1111)

```bash
# start the local proxy that forwards /api/generate -> Automatic1111
npm run server
```

Notes: If your Node runtime is <18 and the proxy fails due to missing `fetch`, install a polyfill:

```bash
npm install node-fetch@3
```

and require/import it at the top of `server/proxy.cjs` (or run Node 18+).

Core Concepts & Architecture
----------------------------

- `services/aiService.ts`: high-level abstraction that exposes `generateImage(prompt, options)` and `enhanceImage(file, options)`. It prefers the server proxy when available and falls back to client-side generation/enhancement.
- `services/geminiService.ts`: repurposed to perform client-side enhancement (canvas upscaling, filters, texture regeneration). No external Gemini API key is required for the built-in enhancer.
- `workers/upscale.worker.ts`: OffscreenCanvas-based worker that performs heavy pixel processing and returns a base64 data URL to the main thread. Main-thread fallback exists when workers/OffscreenCanvas are not available.
- `components/PromptEditor.tsx` and `components/GenerationControls.tsx`: UI for prompt editing, templates, and format/resolution controls (PNG/JPEG/WebP and 4K/2K/1080/custom resolutions).
- `server/proxy.cjs`: a minimal Node proxy that forwards generation/upscale requests to a configured Stable Diffusion WebUI (Automatic1111). This is optional — the app works with the client enhancer alone.

Usage (UI)
----------

- Upload an image and use the "Enhance" flow to apply studio-style filters and upscale for e-commerce product shots.
- Use the Prompt Editor to craft prompts and templates for marketing images. Generate images via the Generate control — if the server proxy is available and configured, generation may be higher-quality using Stable Diffusion.
- Export/download options include PNG, JPEG, and WebP at configured resolutions (4K/2K/1080 or custom dimensions).

Developer Notes
---------------

- To change the enhancement pipeline, edit `services/geminiService.ts`.
- The worker uses `OffscreenCanvas` — if debugging on Windows without worker support, use the fallback path in `services/geminiService.ts`.
- The `aiService` implements a graceful fallback: it tries the server (`/api/generate`), and if unavailable, uses the client generator/enhancer.

Troubleshooting
---------------

- Dist contains old branding: If you find old brand strings in `dist/`, rebuild with `npm run build` after ensuring your source files have the desired strings.
- Proxy errors / CORS: Ensure your `WEBUI_URL` is reachable from the machine running the proxy and that the upstream WebUI accepts the forwarded requests. The proxy simply forwards requests and responses.
- Node errors about `fetch`: upgrade Node to 18+ or install `node-fetch@3` and import it in `server/proxy.cjs`.

Testing & Validation
--------------------

Manual test steps:

1. Start dev server: `npm run dev`
2. Open UI, upload a 1–2 MP product photo and run "Enhance" — verify the result and download.
3. (Optional) Start the proxy with `npm run server` and configure `WEBUI_URL` to a running Automatic1111 instance, then request generation from a prompt and verify the server produced output.

Planned / Missing Items
-----------------------

- Persistent template storage improvements (IndexedDB) — currently localStorage-based.
- Unit tests and CI workflow (not yet implemented).
- Optional WASM-based upscaler for improved quality and performance.

Contributing
------------

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Run and verify locally
4. Open a PR with a concise description

License
-------

This repository does not include an explicit license file. Add `LICENSE` if you want to publish with a specific open-source license.

Contact
-------

If you want help integrating a specific server generator (SDXL/Real-ESRGAN) or adding WASM upscaling, ask in an issue or reach out directly.


This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1JmVYRvvI53HolSQk4IjOb7cR4GqXUweH

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
