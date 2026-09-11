const fs = require('fs');
let code = fs.readFileSync('src/lib/catalog.ts', 'utf8');

const blocks = code.split('name:');
const report = [];
let total = 0;
let minPrice = Infinity;
let maxPrice = -Infinity;

for (let i = 1; i < blocks.length; i++) {
  const nameMatch = blocks[i].match(/^\s*"([^"]+)"/);
  const priceMatch = blocks[i].match(/price:\s*(\d+),/);
  
  if (nameMatch && priceMatch) {
    const price = parseInt(priceMatch[1], 10);
    report.push('- ' + nameMatch[1] + ': ₹' + price);
    total++;
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;
  }
}

console.log('Total real products updated:', total);
console.log('Min Price:', minPrice);
console.log('Max Price:', maxPrice);
console.log(report.join('\n'));
