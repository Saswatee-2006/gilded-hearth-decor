const fs = require('fs');
let p = fs.readFileSync('src/routes/product.$slug.tsx', 'utf8');

// Change useState initialization
p = p.replace(
  /const \[size, setSize\] = useState\<string\>\([\s\S]*?\);/,
  'const [size, setSize] = useState<string>("");'
);

// Change useEffect size reset
p = p.replace(
  /setSize\([\s\S]*?\);/m,
  'setSize("");'
);

// Disable Add to Cart button if size is required but missing
p = p.replace(
  /disabled={product\.stock === 0}/g,
  'disabled={product.stock === 0 || ((product.category === "posters" || product.category === "wall-clocks" || product.category === "wall-decor") && !size)}'
);

fs.writeFileSync('src/routes/product.$slug.tsx', p);
