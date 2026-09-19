const fs = require('fs');

const content = fs.readFileSync('src/lib/catalog.ts', 'utf8');

// Simple regex to extract seeds array block
const seedsMatch = content.match(/const seeds: Seed\[\] = \[([\s\S]*?)\];/);
if (!seedsMatch) {
  console.log('Could not find seeds in catalog.ts');
  process.exit(1);
}

// Evaluate it safely by wrapping it
let seeds = [];
try {
  const evaluate = new Function('return [' + seedsMatch[1] + '];');
  seeds = evaluate();
} catch (e) {
  console.log('Error parsing seeds:', e);
}

let sql = '-- Seed Products\n\n';
seeds.forEach((p, i) => {
  const id = '00000000-0000-0000-0000-' + (i + 1).toString().padStart(12, '0');
  const slug = (p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const cleanStr = (s) => (s || '').replace(/'/g, "''");

  sql += `INSERT INTO public.products (id, slug, name, category, subcategory, price, mrp, rating, reviews, image, style, material, color, size, dimensions, weight, description, care) VALUES (
    '${id}', '${slug}', '${cleanStr(p.name)}', '${p.category}', '${p.subcategory}', ${p.price}, ${p.mrp}, ${p.rating || 0}, ${p.reviews || 0}, '${p.image}', '${cleanStr(p.style)}', '${cleanStr(p.material)}', '${cleanStr(p.color)}', '${cleanStr(p.size)}', '${cleanStr(p.dimensions)}', '${cleanStr(p.weight)}', '${cleanStr(p.description)}', '${cleanStr(p.care)}'
  ) ON CONFLICT (slug) DO NOTHING;\n`;
  
  sql += `INSERT INTO public.inventory (product_id, variant, stock) VALUES ('${id}', 'Default', ${p.stock || 0}) ON CONFLICT (product_id, variant) DO NOTHING;\n\n`;
});

fs.writeFileSync('supabase/migrations/20260919010001_seed_products.sql', sql);
console.log('Done writing seed sql');
