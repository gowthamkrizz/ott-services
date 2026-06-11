const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // 1. Remove inline font sizes (e.g. style="font-size:3.5rem;...")
  c = c.replace(/font-size:\s*[0-9.]+rem;?/g, '');
  
  // 2. Remove STACKLY text next to logo image to make it image-only
  c = c.replace(/(<img[^>]+src="assets\/img\/logo\.webp"[^>]*>)\s*STACKLY/g, '$1');

  // 3. Add inline script for preloader directly in index.html to prevent stuck
  if (f === 'index.html' && !c.includes('id="pageLoaderScript"')) {
    c = c.replace('</div>\n\n<!-- NAVBAR -->', '</div>\n<script id="pageLoaderScript">\n  window.addEventListener("load", function() {\n    var loader = document.getElementById("pageLoader");\n    if (loader) {\n      loader.style.transition = "opacity 0.6s ease";\n      loader.style.opacity = "0";\n      loader.style.pointerEvents = "none";\n      setTimeout(function(){ loader.remove(); }, 600);\n    }\n  });\n</script>\n\n<!-- NAVBAR -->');
  }

  fs.writeFileSync(p, c);
});
console.log('HTML files patched successfully.');
