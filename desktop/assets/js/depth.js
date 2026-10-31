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
    var art = document.querySelector('.hero-art img'), hero = document.querySelector('.hero');
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
