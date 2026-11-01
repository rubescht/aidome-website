/* AI Dome website — shared behaviour (no dependencies) */
(function () {
  'use strict';

  /* ---------- Videos: play muted while on screen, pause when scrolled away ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = [].slice.call(document.querySelectorAll('video[data-autoplay]'));
  if (!reduce && 'IntersectionObserver' in window && vids.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (v.dataset.userPaused === '1') return;
          if (v.preload === 'none') v.preload = 'auto';
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) { v.dataset.autoPaused = '1'; v.pause(); }
      });
    }, { threshold: [0, 0.5] });
    vids.forEach(function (v) {
      v.addEventListener('pause', function () { if (v.dataset.autoPaused === '1') { v.dataset.autoPaused = ''; } else { v.dataset.userPaused = '1'; } });
      v.addEventListener('play', function () { v.dataset.userPaused = ''; });
      io.observe(v);
    });
  }

  /* ---------- Forms ----------
     Each <form data-form="name" data-endpoint="URL">.
     Rendr: set data-endpoint to your form handler (e.g. Formspree, HubSpot, a serverless function).
     With no endpoint, the form shows the thank-you message and logs the payload to the console. */
  [].slice.call(document.querySelectorAll('form[data-form]')).forEach(function (form) {
    var wrap = form.closest('[data-form-wrap]');
    var err = form.querySelector('.form-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [].slice.call(form.querySelectorAll('[required]')).filter(function (f) {
        return f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      });
      if (bad.length) {
        err.textContent = 'Please complete the required fields: ' + bad.map(function (f) { var l = form.querySelector('label[for="' + f.id + '"]'); return l ? l.textContent : 'the investor confirmation tick-box'; }).join(', ') + '.';
        err.style.display = 'block'; bad[0].focus(); return;
      }
      err.style.display = 'none';
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.form = form.dataset.form; data.page = location.pathname; data.submittedAt = new Date().toISOString();
      var done = function () { if (wrap) wrap.classList.add('sent'); var m = wrap && wrap.querySelector('.form-msg'); if (m) { m.setAttribute('tabindex', '-1'); m.focus(); } };
      var url = form.dataset.endpoint;
      if (!url) { console.log('AI Dome form submission (no endpoint set):', data); done(); return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(function () { btn.disabled = false; btn.textContent = 'Try again'; err.textContent = 'Sorry, something went wrong. Please call 1300 737 562 or email admin@aidome.com.au.'; err.style.display = 'block'; });
    });
  });
})();
/* Phone menu + sticky call-to-action */
(function () {
  var h = document.querySelector('.site-header'), t = h && h.querySelector('.nav-toggle');
  if (t) {
    var set = function (open) { h.classList.toggle('nav-open', open); t.setAttribute('aria-expanded', open ? 'true' : 'false'); t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
    t.addEventListener('click', function () { set(!h.classList.contains('nav-open')); });
    [].slice.call(h.querySelectorAll('.nav-links a, .nav-cta')).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && h.classList.contains('nav-open')) { set(false); t.focus(); } });
  }
  var bar = document.querySelector('.m-cta');
  if (bar) {
    var links = [].slice.call(bar.querySelectorAll('a')), shown = false;
    var foot = document.querySelector('.site-footer, footer'), contact = document.getElementById('contact');
    var upd = function () {
      var y = window.scrollY, vh = window.innerHeight, near = false;
      [foot, contact].forEach(function (el) { if (el) { var r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) near = true; } });
      var s = y > vh * 0.75 && !near;
      if (s !== shown) { shown = s; bar.classList.toggle('show', s); bar.setAttribute('aria-hidden', s ? 'false' : 'true'); links.forEach(function (a) { a.tabIndex = s ? 0 : -1; }); }
    };
    window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  }
})();
