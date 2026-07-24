const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove intro overlay
html = html.replace(/<!-- ═══════════════════════════════════════[\s\S]*?INTRO OVERLAY[\s\S]*?<\/div>[\s\S]*?<!-- ═══════ Nav ═══════ -->/g, '<!-- ═══════ Nav ═══════ -->');

// 2. Remove script tag
html = html.replace(/<script src="intro3d\.js"><\/script>\s*/g, '');

// 3. Remove tagline in title
html = html.replace(/<title>L\.U\.C\.Y — a mind that was grown, not programmed<\/title>/g, '<title>L.U.C.Y</title>');

// 4. Remove hero tagline
html = html.replace(/<p class="hero-tagline">A mind that was <em>grown<\/em>, not programmed\.<\/p>/g, '');

// 5. Pink L in Nav
html = html.replace(/<span class="nav-brand-dot"><\/span> LUCY/g, '<span class="nav-brand-dot"></span> <span style="color:var(--accent)">L</span>UCY');

// 6. Pink L in Hero
html = html.replace(/<span class="initial">L<\/span><span class="remainder">ucent<\/span>/g, '<span class="initial" style="color:var(--accent)">L</span><span class="remainder">ucent</span>');

fs.writeFileSync('index.html', html);
