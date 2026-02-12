/*
app.js — Optional helper library for the Valentines page

Usage:
- Place this file at the repo root (already done).
- From `src/index.html` include it with: <script src="../app.js"></script>
- Then call `ValentineApp.initAll()` (or call individual inits) in the page script.

This file intentionally does not auto-run to avoid double-binding if the
project already has `src/script.js`. It exposes a `ValentineApp` object on
`window` with idempotent init functions.
*/

if (typeof window === 'undefined' || typeof document === 'undefined') {
  // Running under Node: start a minimal static file server so Render can
  // execute `node app.js` to serve the site. The server serves files from
  // the repository root and maps `/` to `/src/index.html`.
  const http = require('http');
  const fs = require('fs');
  const path = require('path');

  const root = path.resolve(__dirname);

  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
  };

  function send404(res) {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Not found');
  }

  function serveFile(reqPath, res) {
    const safePath = path.normalize(reqPath).replace(/^\.+/, '');
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      send404(res);
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        send404(res);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('content-type', type);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => send404(res));
    });
  }

  const server = http.createServer((req, res) => {
    try {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/' || urlPath === '') {
        // serve the main HTML
        return serveFile('src/index.html', res);
      }

      // If request looks like /src/..., serve directly from repo
      // Otherwise try to serve from `src` folder as a convenience.
      const candidate = path.join('.', urlPath);
      const candidateSrc = path.join('src', urlPath.replace(/^\//, ''));

      // Prefer direct path if exists, else try src/
      const tryPaths = [candidate, candidateSrc];
      (function tryNext(i) {
        if (i >= tryPaths.length) return send404(res);
        const p = path.join(root, tryPaths[i]);
        fs.stat(p, (err, stat) => {
          if (!err && stat.isFile()) return serveFile(tryPaths[i], res);
          tryNext(i + 1);
        });
      })(0);
    } catch (e) {
      send404(res);
    }
  });

  const port = parseInt(process.env.PORT, 10) || 10000;
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Static server listening on port ${port}`);
  });

  // Export a minimal stub so `require('./app.js')` behaves sanely in tests.
  const stub = {
    initAll: () => {},
    initEnvelope: () => {},
    initIntroNext: () => {},
    initNoButtonShy: () => {},
    initYesButton: () => {},
    _server: server,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = stub;
  if (typeof global !== 'undefined') global.ValentineApp = stub;
  // keep the file from falling through to browser IIFE below
} else {
  (function (window, document) {
    const $ = (s) => document.querySelector(s);

    function safeOn(el, ev, fn) {
      if (!el) return;
      el.__valentine_listeners = el.__valentine_listeners || {};
      if (el.__valentine_listeners[ev]) return;
      el.addEventListener(ev, fn);
      el.__valentine_listeners[ev] = true;
    }

    const App = {
      initEnvelope() {
        const envelope = $('#envelope-container');
        const letter = $('#letter-container');
        if (!envelope || !letter) return;

        safeOn(envelope, 'click', () => {
          envelope.style.display = 'none';
          letter.style.display = 'flex';

          const introScreen = $('#intro-screen');
          const title = $('#letter-title');
          const catImg = $('#letter-cat');
          const buttons = $('#letter-buttons');
          const middleImage = $('#letter-middle-image');

          if (introScreen) introScreen.style.display = 'block';
          if (title) title.style.display = 'none';
          if (catImg) catImg.style.display = 'none';
          if (buttons) buttons.style.display = 'none';
          if (middleImage) middleImage.style.display = 'block';

          setTimeout(() => {
            const w = document.querySelector('.letter-window');
            if (w) w.classList.add('open');
          }, 50);
        });
      },

      initNoButtonShy() {
        const noBtn = document.querySelector('.no-btn');
        if (!noBtn) return;

        safeOn(noBtn, 'mouseover', () => {
          const min = 150;
          const max = 260;
          const distance = Math.random() * (max - min) + min;
          const angle = Math.random() * Math.PI * 2;
          const moveX = Math.cos(angle) * distance;
          const moveY = Math.sin(angle) * distance;
          noBtn.style.transition = 'transform 0.3s ease';
          noBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      },

      initYesButton() {
        const yesBtn = document.querySelector(".btn[alt='Yes']");
        if (!yesBtn) return;

        safeOn(yesBtn, 'click', () => {
          const title = $('#letter-title');
          const catImg = $('#letter-cat');
          const buttons = $('#letter-buttons');
          const finalText = $('#final-text');

          if (title) title.textContent = 'Yeiiiiiiiii! Sabía que aceptarías';
          if (catImg) catImg.src = '../media/cat_dance.gif';
          const w = document.querySelector('.letter-window');
          if (w) w.classList.add('final');
          if (buttons) buttons.style.display = 'none';
          if (finalText) finalText.style.display = 'block';
        });
      },

      initIntroNext() {
        const introNext = $('#intro-next');
        if (!introNext) return;

        safeOn(introNext, 'click', () => {
          const introScreen = $('#intro-screen');
          const title = $('#letter-title');
          const catImg = $('#letter-cat');
          const buttons = $('#letter-buttons');
          const middleImage = $('#letter-middle-image');

          if (introScreen) introScreen.style.display = 'none';
          if (title) title.style.display = 'block';
          if (catImg) catImg.style.display = 'block';
          if (buttons) buttons.style.display = 'flex';
          const w = document.querySelector('.letter-window');
          if (w) w.classList.add('open');
          if (middleImage) middleImage.style.display = 'none';
        });
      },

      // Convenience: initialize all available behaviors
      initAll() {
        this.initEnvelope();
        this.initIntroNext();
        this.initNoButtonShy();
        this.initYesButton();
      },
    };

    window.ValentineApp = App;
  })(window, document);
}
