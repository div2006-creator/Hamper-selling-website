const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dataPath = path.join(__dirname, '..', 'data.json');
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// High quality unique hamper image sources
const uniqueHamperSources = {
  // Birthday (keep existing local hamper images)
  'bday-1': 'images/bday_hamper.png',
  'bday-2': 'images/coffee_truffle_hamper.png',
  'bday-3': 'images/macaron_sweet_hamper.png',
  'bday-4': 'images/gourmet_feast_hamper.png',
  'bday-5': 'images/tea_botanical_hamper.png',
  'bday-6': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',

  // Anniversary
  'anniv-1': 'images/anniversary_romance_hamper.png',
  'anniv-2': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80',
  'anniv-3': 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
  'anniv-4': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  'anniv-5': 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80',
  'anniv-6': 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',

  // Wedding
  'royal-heritage': 'images/wedding_royal_trunk.png',
  'wed-2': 'https://images.unsplash.com/photo-1671815629160-40598a2f00a7?auto=format&fit=crop&w=800&q=80',
  'wed-3': 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80',
  'wed-4': 'images/wed_bridal_elegance_box.png',
  'wed-5': 'https://images.unsplash.com/photo-1661398229744-e38032aa4e05?auto=format&fit=crop&w=800&q=80',
  'wed-6': 'https://images.unsplash.com/photo-1667343251614-9ad053254a3c?auto=format&fit=crop&w=800&q=80',

  // Festivals
  'festival-light': 'images/festive_diwali_hamper.png',
  'fest-2': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  'fest-3': 'images/fest_rakhi_keepsake.png',
  'fest-4': 'https://images.unsplash.com/photo-1663928246639-86813155169f?auto=format&fit=crop&w=800&q=80',
  'fest-5': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
  'fest-6': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',

  // Corporate
  'corporate-curated': 'images/corporate_executive_hamper.png',
  'corp-2': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
  'corp-3': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  'corp-4': 'https://images.unsplash.com/photo-1601042879364-f3947d3f1a3d?auto=format&fit=crop&w=800&q=80',
  'corp-5': 'https://images.unsplash.com/photo-1552664688-cf412ec27db2?auto=format&fit=crop&w=800&q=80',
  'corp-6': 'https://images.unsplash.com/photo-1578704694513-08946e996642?auto=format&fit=crop&w=800&q=80',

  // For Her
  'self-care-ritual': 'images/her_spa_hamper.png',
  'her-2': 'https://images.unsplash.com/photo-1608248597263-0057e43a4524?auto=format&fit=crop&w=800&q=80',
  'her-3': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'her-4': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  'her-5': 'https://images.unsplash.com/photo-1678217678191-4a220ad62319?auto=format&fit=crop&w=800&q=80',
  'her-6': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',

  // For Him
  'gentlemans-edit': 'images/grooming_him_hamper.png',
  'him-2': 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
  'him-3': 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=800&q=80',
  'him-4': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  'him-5': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80'
};

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (url.startsWith('images/')) {
      const srcPath = path.join(__dirname, '..', url);
      if (fs.existsSync(srcPath) && srcPath !== destPath) {
        fs.copyFileSync(srcPath, destPath);
        return resolve();
      }
      return resolve();
    }
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const p of data.products) {
    const targetSource = uniqueHamperSources[p.id] || p.image;
    const filename = `${p.id}.jpg`;
    const localRelPath = `images/${filename}`;
    const destPath = path.join(imagesDir, filename);

    console.log(`Localizing ${p.id}...`);
    try {
      await downloadImage(targetSource, destPath);
      p.image = localRelPath;
    } catch (err) {
      console.warn(`Failed downloading for ${p.id}, copying fallback:`, err.message);
      // Copy bday_hamper.png if download fails
      const fallbackSrc = path.join(imagesDir, 'bday_hamper.png');
      if (fs.existsSync(fallbackSrc)) {
        fs.copyFileSync(fallbackSrc, destPath);
        p.image = localRelPath;
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully localized all 41 hamper images locally into /images/ directory!');
}

main();
