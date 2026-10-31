/* AI Dome — 3D depth interactions: card tilt, hero parallax, diagram tilt-on-scroll, reveal-on-scroll */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Reveal on scroll */
  var revealSel = '.sec h2, .band h2, .card, .seg, .person, .track, .eq-tile, .kpi, .feature, .dome-hero, .price, .model, .timeline, .journey, .milestones, .duel, .stackbar, .maturity';
  var els = [].slice.call(document.querySelectorAll(revealSel)).filter(function (el) { return !el.closest('.hero') && !el.closest('header'); });
  if (!reduce) {
    var pending = [];
    els.forEach(function (el) { if (el.getBoundingClientRect().top > window.innerHeight * 0.9) { el.classList.add('reveal'); pending.push(el); } });
    var queued = false;
    var check = function () {
      queued = false;
      var vh = window.innerHeight, n = 0;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.92) {
          el.style.transitionDelay = Math.min(n++, 4) * 80 + 'ms';
          el.classList.add('in');
          setTimeout(function () { el.style.transitionDelay = ''; }, 1300);
          return false;
        }
        return true;
      });
      if (!pending.length) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
    };
    var onScroll = function () { if (!queued) { queued = true; raf(check); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    /* safety net: never leave content hidden (e.g. jump links, print, odd browsers) */
    window.addEventListener('hashchange', function () { setTimeout(check, 50); });
    window.addEventListener('beforeprint', function () { pending.forEach(function (el) { el.classList.add('in'); }); });
  }

  /* The AI Dome turns around the letters "AI" (canvas globe projection) */
  (function () {
    var st = document.querySelector('.dome-stage'); if (!st) return;
    var cv = st.querySelector('.dome-spin'); if (!cv || !cv.getContext) return;
    var g = st.dataset.dome.split(',').map(Number), CX = g[0], YB = g[1], RX = g[2], RY = g[3];
    var BX = 245, BY = 74, BW = 740, BH = 360, SRC_W = 1100;
    var tex = new Image(); tex.decoding = 'async'; tex.src = 'assets/img/dome-texture.webp';
    var ctx, img, out, TW, TH, T32, mapU, mapV, mapS, mapA, idx, n, w, h, phase = 0, last = null, visible = true, period = 22000;
    var build = function () {
      var scale = Math.min(1, (st.clientWidth / SRC_W) * (window.devicePixelRatio || 1));
      w = Math.max(60, Math.round(BW * scale)); h = Math.max(30, Math.round(BH * scale));
      cv.width = w; cv.height = h; ctx = cv.getContext('2d');
      img = ctx.createImageData(w, h); out = new Uint32Array(img.data.buffer);
      var list = [], U = [], V = [], S = [], A = [];
      for (var y = 0; y < h; y++) {
        var py = BY + (y + 0.5) / scale, ny = (YB - py) / RY; if (ny < 0) continue;
        for (var x = 0; x < w; x++) {
          var px = BX + (x + 0.5) / scale, nx = (px - CX) / RX, r2 = nx * nx + ny * ny; if (r2 >= 1) continue;
          var z = Math.sqrt(1 - r2), lat = Math.asin(Math.min(1, ny)), lon = Math.atan2(nx, z);
          list.push(y * w + x);
          U.push((lon / (2 * Math.PI) + 0.5));            /* 0..1 around the globe, 0.5 = front centre */
          V.push(Math.min(0.999, Math.max(0, 1 - lat / (Math.PI / 2 * 88 / 90))));
          S.push(0.86 + 0.3 * Math.sqrt(z));              /* limb darkening keeps it spherical */
          A.push(Math.min(1, (1 - Math.sqrt(r2)) * RX * scale * 0.9));   /* soft edge */
        }
      }
      n = list.length; idx = new Int32Array(list); mapU = new Float32Array(U); mapV = new Int32Array(n); mapS = new Float32Array(S); mapA = new Uint8Array(n);
      for (var i = 0; i < n; i++) { mapV[i] = Math.floor(V[i] * TH) * TW; mapA[i] = Math.round(A[i] * 255); }
    };
    var draw = function () {
      for (var i = 0; i < n; i++) {
        var u = mapU[i] + phase; u -= Math.floor(u);
        var c = T32[mapV[i] + ((u * TW) | 0)], s = mapS[i];
        var b = ((c >> 16) & 255) * s, gg = ((c >> 8) & 255) * s, r = (c & 255) * s;
        out[idx[i]] = (mapA[i] << 24) | ((b > 255 ? 255 : b) << 16) | ((gg > 255 ? 255 : gg) << 8) | (r > 255 ? 255 : r);
      }
      ctx.putImageData(img, 0, 0);
    };
    var loop = function (ts) {
      if (!visible) { last = null; return; }
      if (last === null) last = ts;
      if (ts - last >= 30) { phase += (ts - last) / period; last = ts; draw(); }
      raf(loop);
    };
    tex.onload = function () {
      var oc = document.createElement('canvas'); TW = oc.width = tex.naturalWidth; TH = oc.height = tex.naturalHeight;
      var o = oc.getContext('2d'); o.drawImage(tex, 0, 0); T32 = new Uint32Array(o.getImageData(0, 0, TW, TH).data.buffer);
      build(); draw(); st.classList.add('spinning');
      if (reduce) return;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) raf(loop); }).observe(st);
      raf(loop);
      var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); draw(); }, 200); });
    };
  })();
  if (reduce) return;

  /* Card tilt + moving highlight (mouse / trackpad only) */
  if (fine) {
    var tiltSel = '.card, .seg, .person, .eq-tile, .track, .kpi, .res';
    [].slice.call(document.querySelectorAll(tiltSel)).forEach(function (el) {
      if (el.querySelector('form') || el.closest('form')) return; /* keep forms steady */
      var max = el.offsetWidth > 420 ? 4 : 7, pending = null;
      el.addEventListener('pointermove', function (ev) {
        pending = ev;
        raf(function () {
          if (!pending) return;
          var r = el.getBoundingClientRect(), x = (pending.clientX - r.left) / r.width, y = (pending.clientY - r.top) / r.height;
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max).toFixed(2) + 'deg) translateZ(6px)';
          el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          pending = null;
        });
      });
      el.addEventListener('pointerenter', function () { el.classList.add('is-tilting'); });
      el.addEventListener('pointerleave', function () { pending = null; el.classList.remove('is-tilting'); el.style.transform = ''; });
    });

    /* Hero art follows the pointer */
    var art = document.querySelector('.orbit-stage') || document.querySelector('.hero-art img'), hero = document.querySelector('.hero');
    if (art && hero) {
      hero.addEventListener('pointermove', function (ev) {
        var r = hero.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        art.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); art.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
        art.style.setProperty('--px', (x * 16).toFixed(1) + 'px'); art.style.setProperty('--py', (y * 12).toFixed(1) + 'px');
      });
      hero.addEventListener('pointerleave', function () { ['--rx', '--ry', '--px', '--py'].forEach(function (p) { art.style.removeProperty(p); }); });
    }
  }

  /* Security dome diagram tilts upright as it scrolls into view */
  var dome = document.querySelector('.dome-hero img');
  if (dome) {
    var tick = false;
    var upd = function () {
      tick = false;
      var r = dome.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      dome.style.setProperty('--dx', ((1 - p) * 14).toFixed(2) + 'deg');
      dome.style.setProperty('--ds', (0.92 + p * 0.08).toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; raf(upd); } }, { passive: true });
    upd();
  }
})();
