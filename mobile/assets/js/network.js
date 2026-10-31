/* AI Dome — "neural network" background.
   Slowly drifting nodes link up when close; small pink data pulses travel along the links.
   Fixed canvas behind all content. ~30 fps, fewer nodes on phones, pauses in background tabs,
   shows a still frame for prefers-reduced-motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.createElement('canvas');
  cv.className = 'net-bg'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;opacity:.7';
  if (getComputedStyle(document.body).isolation !== 'isolate') document.body.style.isolation = 'isolate';
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d'), W, H, dpr, nodes = [], pulses = [], LINK, mouse = { x: -9999, y: -9999 };
  var size = function () {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var small = W < 640, target = Math.round(Math.min(small ? 38 : 85, (W * H) / (small ? 9000 : 16000)));
    LINK = small ? 110 : 150;
    while (nodes.length < target) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: 1.2 + Math.random() * 1.8, hot: Math.random() < .14 });
    nodes.length = target;
  };
  size();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

  var draw = function (move) {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d, n = nodes.length, links = [];
    for (i = 0; i < n; i++) {
      a = nodes[i];
      if (move) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = W + 20; else if (a.x > W + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
        dx = mouse.x - a.x; dy = mouse.y - a.y; d = dx * dx + dy * dy;        /* gentle pull toward the pointer */
        if (d < 40000 && d > 400) { a.x += dx * .0035; a.y += dy * .0035; }
      }
    }
    ctx.lineWidth = 1;
    for (i = 0; i < n; i++) {
      a = nodes[i];
      for (j = i + 1; j < n; j++) {
        b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          var t = 1 - Math.sqrt(d) / LINK;
          ctx.strokeStyle = 'rgba(143,162,255,' + (t * .38).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          links.push([a, b]);
        }
      }
      dx = mouse.x - a.x; dy = mouse.y - a.y; d = dx * dx + dy * dy;           /* links to the pointer */
      if (d < 32400) { ctx.strokeStyle = 'rgba(242,166,216,' + ((1 - Math.sqrt(d) / 180) * .5).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    for (i = 0; i < n; i++) {
      a = nodes[i];
      ctx.fillStyle = a.hot ? 'rgba(242,166,216,.9)' : 'rgba(185,175,255,.85)';
      ctx.shadowColor = a.hot ? '#B83C90' : '#7C6CF2'; ctx.shadowBlur = a.hot ? 12 : 8;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (!move) return;
    if (links.length && pulses.length < (W < 640 ? 4 : 9) && Math.random() < .08) {   /* data pulses */
      var l = links[(Math.random() * links.length) | 0]; pulses.push({ a: l[0], b: l[1], t: 0, s: .012 + Math.random() * .02 });
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i]; p.t += p.s;
      dx = p.a.x - p.b.x; dy = p.a.y - p.b.y;
      if (p.t >= 1 || dx * dx + dy * dy > LINK * LINK * 1.2) { pulses.splice(i, 1); continue; }
      var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      var g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(242,166,216,.8)'); g.addColorStop(1, 'rgba(184,60,144,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
    }
  };
  if (reduce) { draw(false); window.addEventListener('resize', function () { setTimeout(function () { draw(false); }, 250); }); return; }
  var last = 0, running = true;
  var frame = function (ts) { if (!running) return; requestAnimationFrame(frame); if (ts - last < 32) return; last = ts; draw(true); };
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
})();
