const fs = require('fs');

const imageToCategory = {
  "clock": "wall-clocks",
  "woodart": "wall-decor",
  "frame": "frames",
  "poster": "posters",
  "canvas": "canvas-art",
  "sculpture": "sculptures",
  "vase": "vases",
  "planter": "plants-planters",
  "mirror": "mirrors",
  "lamp": "showpieces",
  "candle": "showpieces",
  "showpiece": "sculptures",
  "dreamcatcher": "wall-decor",
  "tray": "showpieces",
  "resin": "abstract-art"
};

let code = fs.readFileSync('src/lib/catalog.ts', 'utf8');

// Regex to replace category based on image
// The format is:
// category: "wall-decor",
// subcategory: "...",
// ...
// image: "woodart",
// We want to replace the category value. 

let newCode = code;
const blocks = newCode.split('name:');

for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  const imgMatch = block.match(/image:\s*"([^"]+)"/);
  if (imgMatch) {
    const imgKey = imgMatch[1];
    const newCat = imageToCategory[imgKey];
    if (newCat) {
      blocks[i] = block.replace(/category:\s*"([^"]+)"/, `category: "${newCat}"`);
    }
  }
}

newCode = blocks.join('name:');
fs.writeFileSync('src/lib/catalog.ts', newCode);
console.log("Updated categories in catalog.ts");
