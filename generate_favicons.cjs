const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');

async function generate() {
  const svgBuffer = fs.readFileSync('public/favicon.svg');
  
  await sharp(svgBuffer).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(svgBuffer).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  
  // also create a temp 256x256 png for the ico
  await sharp(svgBuffer).resize(256, 256).png().toFile('public/temp-256.png');
  
  const buf = await pngToIco('public/temp-256.png');
  fs.writeFileSync('public/favicon.ico', buf);
  
  fs.unlinkSync('public/temp-256.png');
  console.log('Favicons generated!');
}

generate().catch(console.error);
