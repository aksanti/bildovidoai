import { EnhancementOptions } from '../types';
import { enhanceImage as clientEnhance } from './geminiService';

type ImageResult = {
  dataUrl: string;
  width: number;
  height: number;
  source: 'client' | 'server';
};

async function tryServerGenerate(prompt: string, options: EnhancementOptions): Promise<ImageResult> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, options }),
    });
    if (!res.ok) throw new Error('server generate failed');
    const json = await res.json();
    if (json.image) {
      return { dataUrl: json.image, width: json.width || options.width || 3840, height: json.height || options.height || 2160, source: 'server' };
    }
    throw new Error('no image from server');
  } catch (e) {
    throw e;
  }
}

async function clientGenerate(prompt: string, options: EnhancementOptions): Promise<ImageResult> {
  // Simple client-side placeholder generator that composes a studio-like canvas
  const width = options.width ?? 1536;
  const height = options.height ?? Math.round((width * 9) / 16);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Background: gentle gradient
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, '#f7fafc');
  g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // Simulated floor shadow ellipse
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.75, width * 0.28, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simulated product: a centered glossy shape
  const productSize = Math.min(width, height) * 0.45;
  const cx = width / 2;
  const cy = height / 2.6;
  const grad = ctx.createLinearGradient(cx - productSize / 2, cy - productSize / 2, cx + productSize / 2, cy + productSize / 2);
  grad.addColorStop(0, '#e6e6e6');
  grad.addColorStop(0.5, '#cfcfcf');
  grad.addColorStop(1, '#f8f8f8');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, productSize / 2, productSize / 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(cx - productSize * 0.18, cy - productSize * 0.28, productSize * 0.12, productSize * 0.06, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Product label from prompt (best-effort extract)
  const label = (prompt.match(/of\s+([a-zA-Z0-9\s\-]+)/i) || [])[1] || prompt.split(',')[0] || 'Product';
  ctx.fillStyle = '#111827';
  ctx.font = `${Math.round(Math.min(width, height) * 0.04)}px Inter, system-ui, -apple-system`;
  ctx.textAlign = 'center';
  ctx.fillText(label.trim(), cx, cy + productSize / 1.9);

  const dataUrl = canvas.toDataURL(options.format === 'jpeg' ? 'image/jpeg' : options.format === 'webp' ? 'image/webp' : 'image/png', options.quality ?? 0.92);
  return { dataUrl, width, height, source: 'client' };
}

export async function generateImage(prompt: string, options: EnhancementOptions = {}): Promise<ImageResult> {
  // Try server proxy first, then client fallback
  try {
    return await tryServerGenerate(prompt, options);
  } catch (e) {
    // fallback to client generator
    return await clientGenerate(prompt, options);
  }
}

export async function enhanceImage(inputDataUrl: string, options: EnhancementOptions = {}): Promise<ImageResult> {
  // Delegate to existing client enhancer (which returns a data URL)
  const dataUrl = await clientEnhance(inputDataUrl, options as EnhancementOptions);
  // derive width/height from options if possible
  const width = options.width ?? 3840;
  const height = options.height ?? Math.round((width * 9) / 16);
  return { dataUrl, width, height, source: 'client' };
}

export type { ImageResult };
