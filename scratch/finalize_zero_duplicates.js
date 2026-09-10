const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\39572e5c-b603-492c-9013-1bfd245016de';
const imagesDir = path.join(__dirname, '..', 'images');

// Map products to distinct generated PNGs
const customPngMap = {
  'wed-5': path.join(brainDir, 'gourmet_feast_hamper_1789053357226.png'),
  'wed-6': path.join(brainDir, 'wedding_royal_trunk_1789052962809.png'),
  'fest-5': path.join(brainDir, 'festive_diwali_hamper_1789052989354.png'),
  'her-2': path.join(brainDir, 'her_spa_hamper_box_1789053042223.png'),
  'her-5': path.join(brainDir, 'wed_bridal_elegance_box_1789053501981.png')
};

for (const [id, srcPath] of Object.entries(customPngMap)) {
  const destPath = path.join(imagesDir, `${id}.jpg`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Updated ${id}.jpg from ${path.basename(srcPath)}`);
  }
}

// Final Hash Check across all 41 products in data.json
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data.json')));
const hashes = {};
const dups = [];

data.products.forEach(p => {
  const pPath = path.join(__dirname, '..', p.image);
  const buf = fs.readFileSync(pPath);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (hashes[hash]) {
    dups.push({ id: p.id, original: hashes[hash] });
  } else {
    hashes[hash] = p.id;
  }
});

console.log('Final Duplicates Count:', dups.length);
if (dups.length === 0) {
  console.log('SUCCESS! ALL 41 PRODUCT HAMPER IMAGES ARE 100% UNIQUE!');
} else {
  console.log('Remaining dups:', dups);
}
