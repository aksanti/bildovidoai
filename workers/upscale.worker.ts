/* eslint-disable no-restricted-globals */
type Options = {
  width?: number;
  height?: number;
  format?: 'png'|'jpeg'|'webp';
  quality?: number;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

self.onmessage = async (ev: MessageEvent) => {
  const { id, dataUrl, options } = ev.data as { id: string; dataUrl: string; options: Options };
  try {
    const resp = await fetch(dataUrl);
    const blob = await resp.blob();
    // create bitmap
    // @ts-ignore
    const bitmap = await createImageBitmap(blob);

    const targetWidth = options.width ?? 3840;
    const aspect = bitmap.height / bitmap.width;
    const targetHeight = options.height ?? Math.round(targetWidth * aspect);

    if (typeof OffscreenCanvas !== 'undefined') {
      const off = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = off.getContext('2d');
      if (!ctx) throw new Error('OffscreenCanvas context unavailable');

      ctx.filter = 'contrast(1.12) saturate(1.08) brightness(1.02)';
      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

      // vignette
      const g = ctx.createRadialGradient(
        targetWidth / 2,
        targetHeight / 2,
        Math.min(targetWidth, targetHeight) * 0.2,
        targetWidth / 2,
        targetHeight / 2,
        Math.max(targetWidth, targetHeight) * 0.8
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.7, 'rgba(0,0,0,0.07)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.globalCompositeOperation = 'source-over';

      // highlight
      const light = ctx.createLinearGradient(0, 0, targetWidth * 0.6, targetHeight * 0.6);
      light.addColorStop(0, 'rgba(255,255,255,0.08)');
      light.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.globalCompositeOperation = 'source-over';

      const mime = options.format === 'jpeg' ? 'image/jpeg' : options.format === 'webp' ? 'image/webp' : 'image/png';
      const quality = typeof options.quality === 'number' ? options.quality : 0.92;

      // convert to blob and then to base64
      // @ts-ignore
      const outBlob = await off.convertToBlob({ type: mime, quality });
      const buffer = await outBlob.arrayBuffer();
      const b64 = arrayBufferToBase64(buffer);
      const data = `data:${mime};base64,${b64}`;
      self.postMessage({ id, data, width: targetWidth, height: targetHeight });
      bitmap.close?.();
    } else {
      // OffscreenCanvas not supported; fallback error to let main thread handle
      self.postMessage({ id, error: 'OffscreenCanvas not supported in this environment' });
      bitmap.close?.();
    }
  } catch (err:any) {
    self.postMessage({ id, error: err?.message || String(err) });
  }
};
