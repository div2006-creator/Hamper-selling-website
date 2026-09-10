const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const imageMapping = {
  // Birthday
  'bday-1': 'images/bday_hamper.png',
  'bday-2': 'images/coffee_truffle_hamper.png',
  'bday-3': 'images/bday_hamper.png',
  'bday-4': 'images/coffee_truffle_hamper.png',
  'bday-5': 'images/bday_hamper.png',
  'bday-6': 'images/coffee_truffle_hamper.png',

  // Anniversary
  'anniv-1': 'images/anniversary_romance_hamper.png',
  'anniv-2': 'images/wedding_royal_trunk.png',
  'anniv-3': 'images/anniversary_romance_hamper.png',
  'anniv-4': 'images/anniversary_romance_hamper.png',
  'anniv-5': 'images/bday_hamper.png',
  'anniv-6': 'images/anniversary_romance_hamper.png',

  // Wedding
  'royal-heritage': 'images/wedding_royal_trunk.png',
  'wed-2': 'images/wedding_royal_trunk.png',
  'wed-3': 'images/wedding_royal_trunk.png',
  'wed-4': 'images/her_spa_hamper.png',
  'wed-5': 'images/wedding_royal_trunk.png',
  'wed-6': 'images/wedding_royal_trunk.png',

  // Festivals
  'festival-light': 'images/festive_diwali_hamper.png',
  'fest-2': 'images/festive_diwali_hamper.png',
  'fest-3': 'images/festive_diwali_hamper.png',
  'fest-4': 'images/festive_diwali_hamper.png',
  'fest-5': 'images/bday_hamper.png',
  'fest-6': 'images/wedding_royal_trunk.png',

  // Corporate
  'corporate-curated': 'images/corporate_executive_hamper.png',
  'corp-2': 'images/corporate_executive_hamper.png',
  'corp-3': 'images/corporate_executive_hamper.png',
  'corp-4': 'images/corporate_executive_hamper.png',
  'corp-5': 'images/corporate_executive_hamper.png',
  'corp-6': 'images/corporate_executive_hamper.png',

  // For Her
  'self-care-ritual': 'images/her_spa_hamper.png',
  'her-2': 'images/her_spa_hamper.png',
  'her-3': 'images/her_spa_hamper.png',
  'her-4': 'images/her_spa_hamper.png',
  'her-5': 'images/her_spa_hamper.png',
  'her-6': 'images/her_spa_hamper.png',

  // For Him
  'gentlemans-edit': 'images/corporate_executive_hamper.png',
  'him-1': 'images/corporate_executive_hamper.png',
  'him-2': 'images/corporate_executive_hamper.png',
  'him-3': 'images/corporate_executive_hamper.png',
  'him-4': 'images/corporate_executive_hamper.png',
  'him-5': 'images/corporate_executive_hamper.png'
};

data.products.forEach(p => {
  if (imageMapping[p.id]) {
    p.image = imageMapping[p.id];
  } else {
    p.image = 'images/bday_hamper.png';
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated data.json to use local hamper box images!');
