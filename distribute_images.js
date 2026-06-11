const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\gowth\\.gemini\\antigravity\\brain\\6aa29c40-fd48-4fbf-9ff1-99a01585edbd';
const destDir = path.join(__dirname, 'assets', 'img');

// 1. Copy images (browsers can render PNGs even if extension is .webp)
try {
  fs.copyFileSync(path.join(srcDir, 'hero_fantasy_1781079770210.png'), path.join(destDir, 'hero_fantasy.webp'));
  fs.copyFileSync(path.join(srcDir, 'hero_sci_fi_1781079307956.png'), path.join(destDir, 'hero_scifi.webp'));
  console.log('Images copied');
} catch(e) { console.log('Copy error:', e.message); }

// 2. Distribute images in HTML based on genre
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // A simple regex to replace the background image URL of elements that contain certain genres
  // We'll just replace the HTML string by splitting on '<div class="content-card"' or '<div class="hero-slide"'
  
  let parts = c.split(/(<div class="content-card"|<div class="hero-slide"|<div class="featured-banner")/g);
  for (let i = 1; i < parts.length; i+=2) {
    let blockStart = parts[i];
    let blockContent = parts[i+1];
    
    // determine genre from blockContent
    let lowerContent = blockContent.toLowerCase();
    let newImg = 'hero_1.webp';
    if (lowerContent.includes('sci-fi')) {
      newImg = 'hero_scifi.webp';
    } else if (lowerContent.includes('adventure') || lowerContent.includes('fantasy')) {
      newImg = 'hero_fantasy.webp';
    } else if (lowerContent.includes('comedy') || lowerContent.includes('romance')) {
      newImg = 'hero_2.webp';
    } else {
      newImg = (i % 4 === 1) ? 'hero_1.webp' : 'hero_2.webp';
    }
    
    // replace any hero_X.webp inside this block
    parts[i+1] = blockContent.replace(/hero_[0-9a-z_]+\.webp/g, newImg);
  }
  
  c = parts.join('');
  fs.writeFileSync(f, c);
});
console.log('HTML images distributed properly');
