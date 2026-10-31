/* AI Dome — "digital rain" background in brand colours.
   Fixed canvas behind all content; low opacity so text stays readable.
   ~20 fps, lighter on phones, pauses in background tabs, off for prefers-reduced-motion. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas');
  cv.className = 'matrix-bg'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;opacity:.42';
  if (getComputedStyle(document.body).isolation !== 'isolate') document.body.style.isolation = 'isolate';
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d');
  var glyphs = 'アイドームｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789AIDOME<>{}[]=+*'.split('');
  var small = window.innerWidth < 640, fs, cols, drops, speed, W, H, dpr;
  var size = function () {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight; small = W < 640;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = small ? 13 : 15;
    var n = Math.ceil(W / fs), keep = small ? 0.45 : 0.6;       /* not every column rains */
    cols = []; drops = []; speed = [];
    for (var i = 0; i < n; i++) if (Math.random() < keep) { cols.push(i * fs); drops.push(Math.random() * -H / fs); speed.push(0.35 + Math.random() * 0.75); }
    ctx.fillStyle = '#160F19'; ctx.fillRect(0, 0, W, H);
  };
  size();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  var last = 0, running = true, step = small ? 60 : 50;
  var frame = function (ts) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (ts - last < step) return; last = ts;
    ctx.fillStyle = 'rgba(22,15,25,0.16)'; ctx.fillRect(0, 0, W, H);     /* fade trails */
    ctx.font = '600 ' + fs + 'px "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';
    for (var i = 0; i < cols.length; i++) {
      var y = drops[i] * fs, ch = glyphs[(Math.random() * glyphs.length) | 0];
      if (y > 0) {
        ctx.fillStyle = '#F4F0FA'; ctx.fillText(ch, cols[i], y);                       /* bright head */
        ctx.fillStyle = (i % 5 === 0) ? 'rgba(242,166,216,.85)' : 'rgba(143,162,255,.8)';  /* pink / periwinkle body */
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], cols[i], y - fs);
      }
      drops[i] += speed[i];
      if (y > H + fs * 4 && Math.random() > 0.975) { drops[i] = Math.random() * -20; speed[i] = 0.35 + Math.random() * 0.75; }
    }
  };
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
})();
