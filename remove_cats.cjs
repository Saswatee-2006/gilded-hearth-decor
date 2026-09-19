const fs = require("fs");

let code = fs.readFileSync("src/lib/catalog.ts", "utf8");

// Remove from CATEGORIES
code = code.replace(
  /[\s]*\{\s*slug:\s*"stone-art",[\s\S]*?blurb:\s*"Hand-finished marble and sandstone.",\s*\},/,
  "",
);

code = code.replace(
  /[\s]*\{\s*slug:\s*"sculptures",[\s\S]*?blurb:\s*"Sculptural pieces with presence.",\s*\},/,
  "",
);

// Remove from NAV_GROUPS
code = code.replace(/[\s]*\{\s*name:\s*"Stone Art",\s*slug:\s*"stone-art"\s*\},/, "");
code = code.replace(/[\s]*\{\s*name:\s*"Sculptures",\s*slug:\s*"sculptures"\s*\},/, "");

// Remove seed objects where category is "sculptures" or "stone-art"
// We can use a regex to match the objects in the array.
// But it's safer to just eval the array or replace them carefully.

const blocks = code.split('  {\n    name: "');
let newBlocks = [blocks[0]];

for (let i = 1; i < blocks.length; i++) {
  if (blocks[i].includes('category: "sculptures"') || blocks[i].includes('category: "stone-art"')) {
    // Skip this block (it's a product with these categories)
  } else {
    newBlocks.push(blocks[i]);
  }
}

let newCode = newBlocks.join('  {\n    name: "');
fs.writeFileSync("src/lib/catalog.ts", newCode);
console.log("Done!");
