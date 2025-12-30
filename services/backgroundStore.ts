const KEY = 'bildovido_backgrounds_v1';

export type BackgroundDescriptor = {
  id: string;
  type: 'solid' | 'gradient' | 'image';
  value: string; // color or gradient CSS or image data URL
  label?: string;
};

export function saveBackground(bg: BackgroundDescriptor) {
  const items = getAllBackgrounds();
  const filtered = items.filter(i => i.id !== bg.id);
  filtered.unshift(bg);
  localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, 20)));
}

export function getAllBackgrounds(): BackgroundDescriptor[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function clearBackgrounds() {
  localStorage.removeItem(KEY);
}

export function defaultBackground(): BackgroundDescriptor {
  return { id: 'studio-white', type: 'solid', value: '#ffffff', label: 'Studio White' };
}
