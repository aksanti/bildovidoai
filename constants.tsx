
import { ProductImage } from './types';

export const SAMPLE_IMAGES: ProductImage[] = [
  { id: 'cake1', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', label: 'Chocolate Cake', category: 'bakery' },
  { id: 'juice1', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80', label: 'Mango Juice', category: 'beverage' },
  { id: 'savory1', url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&q=80', label: 'Garden Wrap', category: 'savory' },
  { id: 'cake2', url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80', label: 'Pink Celebration', category: 'bakery' },
];

export const SYSTEM_PROMPT = `
Enhance this product image to ultra-realistic 4K quality. 
Keep the original product exactly the same (no redesign, no change of shape or colors).

Improve:
- Professional studio lighting
- Soft natural shadows
- Balanced contrast and sharp details
- Clean textures and smooth surfaces
- Accurate and appetizing colors
- Premium commercial photography look

Background:
- Minimal, elegant, neutral background (soft beige / light gray / white)
- Subtle depth of field (background slightly blurred)

Style & Mood:
- Luxury bakery / premium food brand
- Warm, inviting, high-end tone
- Perfect for e-commerce and professional website presentation

Camera & Quality:
- DSLR look, 85mm lens
- High dynamic range (HDR)
- Crisp focus, no noise
- Ultra sharp, 4K resolution

Do NOT:
- Add text
- Add logos
- Add people
- Change product structure

Final result should look like a professional product photoshoot for a modern food brand website.
`;
