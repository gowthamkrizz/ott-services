const fs = require('fs');
const path = require('path');

try {
  fs.renameSync('assets/img/stackly logo .webp', 'assets/img/logo.webp');
  console.log('Renamed logo');
} catch(e) { console.log(e.message); }

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/<span class="logo-text">STACKLY<\/span>/g, '');
  fs.writeFileSync(f, c);
});
console.log('HTML fixed');
