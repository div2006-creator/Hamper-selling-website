const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const imageMapping = {
  // Birthday
  'bday-1': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', // Gift box tied with ribbon
  'bday-2': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', // Coffee & truffles hamper
  'bday-3': 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80', // Macaroon & candle hamper
  'bday-4': 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=800&q=80', // Gourmet roast nuts box
  'bday-5': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', // Organic tea & spoon set
  'bday-6': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', // Midnight dark chocolates

  // Anniversary
  'anniv-1': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80', // Romance edit silk ribbon
  'anniv-2': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80', // Golden milestone trunk
  'anniv-3': 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80', // Rose tea & spice edit
  'anniv-4': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', // Saffron & aromatherapy box
  'anniv-5': 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80', // Starlight candle box
  'anniv-6': 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80', // Eternal bond luxury basket

  // Wedding
  'royal-heritage': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', // Royal heritage diya hamper
  'wed-2': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80', // Shahi Shehnai wedding trunk
  'wed-3': 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80', // Brass lotus diya box
  'wed-4': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', // Bridal pamper box
  'wed-5': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', // Royal courtyard mithai box
  'wed-6': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', // Auspicious blessings box

  // Festivals
  'festival-light': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', // Diya & festival hamper
  'fest-2': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', // Shubh deepavali grand box
  'fest-3': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', // Rakhi festive keepsake
  'fest-4': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', // Navratri joy edit
  'fest-5': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80', // New year golden horizon
  'fest-6': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80', // Celebration of lights trunk

  // Corporate
  'corporate-curated': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', // Corporate curated box
  'corp-2': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80', // Executive desk kit
  'corp-3': 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=800&q=80', // Milestone corporate trunk
  'corp-4': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', // Artisanal tea & teak box
  'corp-5': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', // Leadership VIP hamper
  'corp-6': 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80', // Team appreciation kit

  // For Her
  'self-care-ritual': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // Self-care ritual box
  'her-2': 'https://images.unsplash.com/photo-1608248597263-0057e43a4524?auto=format&fit=crop&w=800&q=80', // Rose spa hamper
  'her-3': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', // Blossom botanical edit
  'her-4': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', // Goddess pamper set
  'her-5': 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80', // Sweet serenity box
  'her-6': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', // Floral dreams basket

  // For Him
  'gentlemans-edit': 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80', // Gentleman reserve box
  'him-1': 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80', // Grooming trunk
  'him-2': 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=800&q=80', // Grooming & roast edit
  'him-3': 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80', // Smokey bourbon hamper
  'him-4': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', // Maverick leather brew set
  'him-5': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'  // Urban professional kit
};

data.products.forEach(p => {
  if (imageMapping[p.id]) {
    p.image = imageMapping[p.id];
  } else if (!p.image || p.image.includes('lh3.googleusercontent')) {
    p.image = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated product images in data.json!');
