const fs = require('fs');
let code = fs.readFileSync('src/lib/catalog.ts', 'utf8');

const matches = [...code.matchAll(/name:\s*"([^"]+)"[\s\S]*?price:\s*(\d+)/g)];
console.log('Total products with price:', matches.length);
const report = matches.map(m => '- ' + m[1] + ': ₹' + m[2]);
console.log('REPORT_START');
console.log(report.join('\n'));
console.log('REPORT_END');
