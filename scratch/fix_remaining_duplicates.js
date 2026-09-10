const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const replacementUrls = {
  'wed-2': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
  'wed-5': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
  'wed-6': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
  'fest-4': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  'corp-4': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  'her-2': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  'her-5': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  for (const [id, url] of Object.entries(replacementUrls)) {
    const dest = path.join(__dirname, '..', 'images', `${id}.jpg`);
    console.log(`Downloading ${id}...`);
    try {
      await download(url, dest);
    } catch (e) {
      console.error(`Error for ${id}:`, e.message);
    }
  }

  // Hash check again
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
  if (dups.length > 0) console.log('Duplicates:', dups);
  else console.log('🎉 ALL 41 PRODUCT IMAGES ARE NOW 100% UNIQUE BY MD5 HASH AND LOCAL PATH!');
}

main();
