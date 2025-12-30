
export interface ProductImage {
  id: string;
  url: string;
  label: string;
  category: 'bakery' | 'beverage' | 'savory';
}

export interface EnhancementState {
  originalImage: string | null;
  enhancedImage: string | null;
  isProcessing: boolean;
  error: string | null;
}

export interface EnhancementOptions {
  width?: number; // target width in pixels (keeps aspect ratio if height omitted)
  height?: number; // target height in pixels
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // 0-1 for lossy formats
}
