const fs = require("fs");
const code = fs.readFileSync("src/lib/catalog.ts", "utf8");
const cats = {};
let total = 0;
const blocks = code.split("name:");
for (let i = 1; i < blocks.length; i++) {
  const match = blocks[i].match(/category:\s*"([^"]+)"/);
  if (match) {
    const cat = match[1];
    cats[cat] = (cats[cat] || 0) + 1;
    total++;
  }
}
console.log("Total products:", total);
console.log(cats);
