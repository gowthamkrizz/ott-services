const fs = require('fs');

try {
  let files = fs.readdirSync('assets/img');
  let logoFile = files.find(f => f.includes('stackly logo'));
  if (logoFile) {
    fs.renameSync('assets/img/' + logoFile, 'assets/img/stackly_logo.webp');
    console.log('Renamed ' + logoFile + ' to stackly_logo.webp');
  } else {
    console.log('Logo file not found');
  }
} catch(e) { console.log(e.message); }

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/assets\/img\/logo\.webp/g, 'assets/img/stackly_logo.webp');
  fs.writeFileSync(f, c);
});
console.log('HTML files updated to point to stackly_logo.webp');
