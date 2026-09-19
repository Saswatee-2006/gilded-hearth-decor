const fs = require("fs");
const code = fs.readFileSync("src/lib/catalog.ts", "utf8");
const blocks = code.split("name:");
for (let i = 1; i < blocks.length; i++) {
  const match = blocks[i].match(/^\s*"([^"]+)"/);
  if (match) {
    console.log(match[1]);
  }
}
