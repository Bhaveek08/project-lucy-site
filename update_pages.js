const fs = require('fs');

const files = ['changelog.html', 'privacy.html', 'terms.html'];

const navContent = `<nav class="nav">
  <div class="wrap">
    <a class="brand" href="/"><b>L</b>UCY</a>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links">
      <a href="/changelog">Changelog</a>
      <a href="/donate">Support</a>
    </div>
  </div>
</nav>`;

const footerContent = `<footer>
  <div class="wrap foot-wrap">
    <div>
      <a class="brand" href="/"><b>L</b>UCY</a>
    </div>
    <div class="foot-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/changelog">Changelog</a>
    </div>
  </div>
</footer>
<script src="site.js"></script>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace nav
  content = content.replace(/<nav class="nav">[\s\S]*?<\/nav>/, navContent);
  
  // Replace footer
  content = content.replace(/<footer[\s\S]*?<\/footer>/, footerContent);
  
  // Remove duplicate site.js if footer added it
  content = content.replace(/<script src="site.js"><\/script>\s*<script src="site.js"><\/script>/, '<script src="site.js"></script>');

  fs.writeFileSync(f, content);
  console.log(`Updated ${f}`);
});
