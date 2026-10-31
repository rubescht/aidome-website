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

  /* Security shield orbiting the AI Dome logo */
  (function () {
    var st = document.querySelector('.orbit-stage'); if (!st) return;
    var c = st.dataset.orbit.split(',').map(Number), cx = c[0], cy = c[1], rx = c[2], ry = c[3], ang = c[4] * Math.PI / 180;
    var sh = st.querySelector('.orbit-shield'), trails = [].slice.call(st.querySelectorAll('.orbit-trail'));
    var ca = Math.cos(ang), sa = Math.sin(ang), W = 1100, H = 612;
    var pos = function (t) { var x = rx * Math.cos(t), y = ry * Math.sin(t); return [cx + x * ca - y * sa, cy + x * sa + y * ca, Math.sin(t)]; };
    var place = function (t) {
      var w = st.clientWidth, h = st.clientHeight, k = w / W, p = pos(t), depth = p[2]; /* +1 = nearest the viewer */
      sh.style.setProperty('--sx', (p[0] * k).toFixed(1) + 'px'); sh.style.setProperty('--sy', (p[1] * h / H).toFixed(1) + 'px');
      sh.style.setProperty('--ss', (0.78 + 0.32 * (depth + 1) / 2).toFixed(3)); sh.style.setProperty('--sb', (0.65 + 0.35 * (depth + 1) / 2).toFixed(2));
      st.classList.toggle('is-behind', depth < -0.05);
      trails.forEach(function (el, i) { var q = pos(t - (i + 1) * 0.09); el.style.setProperty('--tx', (q[0] * k).toFixed(1) + 'px'); el.style.setProperty('--ty', (q[1] * h / H).toFixed(1) + 'px'); });
    };
    if (reduce) { place(Math.PI * 0.3); trails.forEach(function (el) { el.style.display = 'none'; }); return; }
    var t0 = null, period = 9000, visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) raf(loop); }).observe(st);
    var loop = function (ts) { if (!visible) return; if (t0 === null) t0 = ts; place(Math.PI * 0.3 + (ts - t0) / period * Math.PI * 2); raf(loop); };
    raf(loop);
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
