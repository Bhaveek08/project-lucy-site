const fs = require('fs');

const files = ['changelog.html', 'privacy.html', 'terms.html', 'donate.html'];

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
    <div class="foot-socials">
      <a href="https://instagram.com/lucy" target="_blank" rel="noopener" aria-label="Instagram">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>
      <a href="https://youtube.com/lucy" target="_blank" rel="noopener" aria-label="YouTube">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
      </a>
      <a href="https://github.com/lucy" target="_blank" rel="noopener" aria-label="GitHub">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      </a>
      <a href="https://twitch.tv/lucy" target="_blank" rel="noopener" aria-label="Twitch">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>
      </a>
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
