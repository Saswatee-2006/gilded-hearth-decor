const fs = require("fs");

let code = fs.readFileSync("src/lib/catalog.ts", "utf8");

const blocks = code.split("name:");
const prices = [259, 269, 279, 289, 299];
let count = 0;
const report = [];

for (let i = 1; i < blocks.length; i++) {
  const nameMatch = blocks[i].match(/^\s*"([^"]+)"/);
  if (nameMatch) {
    const productName = nameMatch[1];
    const newPrice = prices[count % prices.length];

    blocks[i] = blocks[i].replace(/price:\s*\d+,/, `price: ${newPrice},`);

    // Make sure mrp is at least the price + 100 to avoid negative discounts
    blocks[i] = blocks[i].replace(/mrp:\s*(\d+),/, (match, p1) => {
      const oldMrp = parseInt(p1, 10);
      return oldMrp <= newPrice ? `mrp: ${newPrice + 100},` : match;
    });

    report.push(`- ${productName}: ₹${newPrice}`);
    count++;
  }
}

fs.writeFileSync("src/lib/catalog.ts", blocks.join("name:"));
console.log("Total products updated:", count);
console.log("REPORT_START");
console.log(report.join("\n"));
console.log("REPORT_END");
