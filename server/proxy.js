#!/usr/bin/env node
/* Minimal proxy to forward generation/upscale requests to an Automatic1111 WebUI.
   Configuration via environment variables:
     WEBUI_URL (default: http://127.0.0.1:7860)
     WEBUI_API_KEY (optional)
     PORT (default: 3001)

   Endpoints:
     POST /api/generate  -> forwards to WEBUI /sdapi/v1/txt2img
     POST /api/upscale   -> forwards to WEBUI /sdapi/v1/extra-single-image (best-effort)
*/

const http = require('http');
const { URL } = require('url');

const WEBUI_URL = process.env.WEBUI_URL || 'http://127.0.0.1:7860';
const WEBUI_API_KEY = process.env.WEBUI_API_KEY || '';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
  });
  res.end(body);
}

async function forwardToWebUI(path, body) {
  const url = new URL(path, WEBUI_URL);
  const fetchOpts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  if (WEBUI_API_KEY) fetchOpts.headers['X-Api-Key'] = WEBUI_API_KEY;

  const resp = await fetch(url.toString(), fetchOpts);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upstream error ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  return json;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    });
    res.end();
    return;
  }

  if (req.url === '/api/generate' && req.method === 'POST') {
    try {
      const buf = [];
      for await (const chunk of req) buf.push(chunk);
      const body = JSON.parse(Buffer.concat(buf).toString());

      // Build payload for Automatic1111 txt2img
      const payload = {
        prompt: body.prompt || '',
        negative_prompt: body.negative_prompt || '',
        steps: body.options?.steps ?? 30,
        sampler_name: body.options?.sampler_name ?? 'DPM++ 2M Karras',
        cfg_scale: body.options?.cfg_scale ?? 7,
        width: body.options?.width ?? 1024,
        height: body.options?.height ?? 1024,
        seed: body.options?.seed ?? -1,
        batch_size: 1,
      };

      const json = await forwardToWebUI('/sdapi/v1/txt2img', payload);
      // respond with the raw JSON from WebUI to let client handle base64 image
      sendJson(res, 200, json);
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  if (req.url === '/api/upscale' && req.method === 'POST') {
    try {
      const buf = [];
      for await (const chunk of req) buf.push(chunk);
      const body = JSON.parse(Buffer.concat(buf).toString());

      // Try to call Automatic1111 "extra single image" endpoint (may require extras extension)
      const payload = {
        image: (body.image || '').replace(/^data:[^;]+;base64,/, ''),
        upscaler_name: body.upscaler_name || body.options?.upscaler_name || 'ESRGAN_4x',
        scale: body.scale || body.options?.scale || 2,
      };

      const json = await forwardToWebUI('/sdapi/v1/extra-single-image', payload);
      sendJson(res, 200, json);
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  // default
  sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`Proxy server listening on http://0.0.0.0:${PORT} -> ${WEBUI_URL}`);
});
