// Local, free replacement for remote Gemini image enhancement.
// This performs client-side upscaling to 4K and applies simple
// contrast/lighting filters to simulate a studio enhancement.

import { EnhancementOptions } from '../types';

let worker: Worker | null = null;

export const enhanceImage = async (
  base64Image: string,
  options: EnhancementOptions = {}
): Promise<string> => {
  // Try using worker with OffscreenCanvas for heavy processing
  const useWorker = typeof Worker !== 'undefined' && typeof (window as any).OffscreenCanvas !== 'undefined';
  if (useWorker) {
    try {
      if (!worker) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        worker = new Worker(new URL('../workers/upscale.worker.ts', import.meta.url));
      }

      const id = String(Math.random()).slice(2);
      const promise: Promise<string> = new Promise((resolve, reject) => {
        const onmsg = (ev: MessageEvent) => {
          const d = ev.data as any;
          if (d.id !== id) return;
          worker!.removeEventListener('message', onmsg as any);
          if (d.error) return reject(new Error(d.error));
          resolve(d.data as string);
        };
        worker!.addEventListener('message', onmsg as any);
        worker!.postMessage({ id, dataUrl: base64Image, options });
      });
      return await promise;
    } catch (e) {
      // fallthrough to main-thread implementation
      console.warn('worker upscale failed, falling back to main thread', e);
    }
  }

  // Main-thread fallback (existing canvas implementation)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = base64Image;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error('Failed to load image for enhancement.'));
  });

  // Determine target dimensions. Use provided options or default to 4K width.
  const defaultWidth = 3840;
  const targetWidth = options.width ?? defaultWidth;
  let targetHeight: number;
  if (options.height) {
    targetHeight = options.height;
  } else {
    const aspect = img.height / img.width;
    targetHeight = Math.round(targetWidth * aspect);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this environment.');

  // Use high-quality resizing when possible
  try {
    ctx.filter = 'contrast(1.12) saturate(1.08) brightness(1.02)';
    if ('createImageBitmap' in window) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bitmap = await createImageBitmap(img);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
    } else {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  } catch (err) {
    ctx.filter = 'contrast(1.08) saturate(1.04) brightness(1.01)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Add vignette and highlights (same as before)
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) * 0.2,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) * 0.8
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.7, 'rgba(0,0,0,0.07)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.22)');

  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  const light = ctx.createLinearGradient(0, 0, canvas.width * 0.6, canvas.height * 0.6);
  light.addColorStop(0, 'rgba(255,255,255,0.08)');
  light.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');
    if (tctx) {
      tctx.filter = 'blur(0.6px) contrast(1.06)';
      tctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 0.75;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
  } catch (e) {
    // ignore sharpening fallback
  }

  const format = options.format ?? 'png';
  const quality = typeof options.quality === 'number' ? options.quality : 0.92;
  let mime = 'image/png';
  if (format === 'jpeg') mime = 'image/jpeg';
  if (format === 'webp') mime = 'image/webp';
  const dataUrl = canvas.toDataURL(mime, format === 'png' ? undefined : quality);
  return dataUrl;
};
