const fs = require('fs');

const mappings = [
  { img: "img1", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.46 (1).webp", product: "Golden Swirl Resin Wall Art", cat: "abstract-art" },
  { img: "img2", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.46 (2).webp", product: "Carved Wooden Wall Art Panel", cat: "wall-decor" },
  { img: "img3", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.46.webp", product: "Geometric Wood Wall Set of 2", cat: "wall-decor" },
  { img: "img4", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.47 (1).webp", product: "Woven Cotton Wall Hanging", cat: "wall-decor" },
  { img: "img5", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.47.webp", product: "Macrame Dream Catcher", cat: "wall-decor" },
  { img: "img6", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.48 (1).webp", product: "Minimalist Wooden Wall Clock", cat: "wall-clocks" },
  { img: "img7", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.48 (2).webp", product: "Wooden Mandala Wall Panel", cat: "wall-decor" },
  { img: "img8", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.48.webp", product: "Rustic Wooden Photo Frame Set", cat: "wall-decor" },
  { img: "img9", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.49 (1).webp", product: "Antique Brass Wall Clock", cat: "wall-decor" },
  { img: "img10", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.49.webp", product: "Sculptural Wall Art in Sandstone", cat: "wall-decor" },
  { img: "img11", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.50 (1).webp", product: "Brass Accent Skeleton Clock", cat: "wall-clocks" },
  { img: "img12", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.50.webp", product: "Walnut Roman Numeral Clock", cat: "wall-clocks" },
  { img: "img13", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.51.webp", product: "Contemporary Table Vase", cat: "wall-decor" },
  { img: "img14", path: "/Images/WhatsApp Image 2026-09-10 at 16.28.52.webp", product: "Marble Centerpiece Bowl", cat: "wall-decor" },
  { img: "img15", path: "/Images/WhatsApp Image 2026-09-10 at 16.29.02.webp", product: "Typography Art Print — Home", cat: "posters" }
];

let code = fs.readFileSync('src/lib/catalog.ts', 'utf8');

// Ensure image type is string
code = code.replace(/image:\s*ImageKey;/g, 'image: string;');
code = code.replace(/gallery:\s*ImageKey\[\];/g, 'gallery: string[];');

// 1. Add mappings to IMAGES object
let newImages = "";
for (const m of mappings) {
  newImages += `  ${m.img}: "${m.path}",\n`;
}
code = code.replace(/export const IMAGES\s*=\s*{/, `export const IMAGES: Record<string, string> = {\n${newImages}`);

// 2. Update the products
const blocks = code.split('name:');
let matchedCount = 0;
for (let i = 1; i < blocks.length; i++) {
  const nameMatch = blocks[i].match(/^\s*"([^"]+)"/);
  if (nameMatch) {
    const productName = nameMatch[1];
    const mapping = mappings.find(m => m.product === productName);
    if (mapping) {
      blocks[i] = blocks[i].replace(/image:\s*"[^"]+"/, `image: "${mapping.img}"`);
      blocks[i] = blocks[i].replace(/category:\s*"[^"]+"/, `category: "${mapping.cat}"`);
      matchedCount++;
    }
  }
}

fs.writeFileSync('src/lib/catalog.ts', blocks.join('name:'));
console.log('Successfully matched products:', matchedCount);
