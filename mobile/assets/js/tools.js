/* AI Dome — interactive tools: guardrails demo + time-back calculator. Runs entirely in the browser. */
(function () {
  'use strict';
  /* ---------- Guardrails demo ---------- */
  var gin = document.getElementById('g-in'), gout = document.getElementById('g-out'), tally = document.getElementById('g-tally');
  if (gin && gout) {
    var rules = [
      ['Card number', /\b\d(?:[ -]?\d){12,18}\b/g, function (m) { var d = m.replace(/\D/g, ''); if (d.length < 13) return false; var s = 0, alt = false; for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; }],
      ['Tax file number', /\b(?:TFN[:\s]*)?\d{3}[ -]?\d{3}[ -]?\d{3}\b/gi, function (m) { var d = m.replace(/\D/g, ''); if (d.length !== 9) return false; var w = [1, 4, 3, 7, 5, 8, 6, 9, 10], s = 0; for (var i = 0; i < 9; i++) s += +d[i] * w[i]; return s % 11 === 0 || /TFN/i.test(m); }],
      ['Email', /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g],
      ['Phone', /(?:\+?61[ -]?|\b0)[2-478](?:[ -]?\d){8}\b/g],
      ['Medicare', /\b[2-6]\d{3}[ -]?\d{5}[ -]?\d\b/g],
      ['BSB / account', /\b\d{3}-\d{3}\b(?:[ ,]+(?:acc(?:ount)?\.?\s*)?\d{6,10})?/gi],
      ['Health info', /\b(?:diagnos\w*|depression|anxiety|diabetes|cancer|pregnan\w*|medication|sick leave)\b/gi],
      ['Name', /\b(?:Mr|Mrs|Ms|Dr|Sarah Nguyen|James Wilson|Priya Patel)\.?(?:\s+[A-Z][a-z]+){0,2}\b/g]
    ];
    var samples = [
      'Hi, please draft a refund email to Sarah Nguyen (sarah.nguyen@example.com, 0412 345 678). Her card 4111 1111 1111 1111 was charged twice. TFN 123 456 782 is on file.',
      'Summarise this for the HR file: James Wilson has been on sick leave with anxiety since March. Medicare 2123 45670 1. Call him on 0398 765 432.',
      'Reconcile the payment from Priya Patel, BSB 063-000 account 12345678, invoice #4471. Email priya@example.com.au with the receipt.'
    ];
    var esc = function (t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var run = function () {
      var text = gin.value, hits = [], found = {};
      rules.forEach(function (r) {
        r[1].lastIndex = 0; var m;
        while ((m = r[1].exec(text))) {
          if (r[2] && !r[2](m[0])) continue;
          var a = m.index, b = a + m[0].length;
          if (hits.some(function (h) { return a < h.b && b > h.a; })) continue;
          hits.push({ a: a, b: b, k: r[0] }); found[r[0]] = (found[r[0]] || 0) + 1;
        }
      });
      hits.sort(function (x, y) { return x.a - y.a; });
      var out = '', pos = 0;
      hits.forEach(function (h) { out += esc(text.slice(pos, h.a)) + '<mark>[' + esc(h.k.toUpperCase()) + ' REMOVED]</mark>'; pos = h.b; });
      out += esc(text.slice(pos));
      gout.innerHTML = out || '<span style="color:var(--faint)">Nothing to send yet.</span>';
      var keys = Object.keys(found);
      tally.innerHTML = keys.length ? keys.map(function (k) { return '<span>' + esc(k) + (found[k] > 1 ? ' ×' + found[k] : '') + '</span>'; }).join('') : '<span class="ok">No sensitive data found — safe to send</span>';
    };
    var t; gin.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 120); });
    [].slice.call(document.querySelectorAll('[data-sample]')).forEach(function (b) { b.addEventListener('click', function () { gin.value = samples[+b.dataset.sample]; run(); }); });
    run();
  }

  /* ---------- Time-back calculator ---------- */
  var st = document.getElementById('c-staff');
  if (st) {
    var hr = document.getElementById('c-hours'), rt = document.getElementById('c-rate');
    var fmt = function (n) { return Math.round(n).toLocaleString('en-AU'); };
    var fill = function (el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); };
    var calc = function () {
      var s = +st.value, h = +hr.value, r = +rt.value, hours = s * h * 46, value = hours * r;
      document.getElementById('o-staff').textContent = s;
      document.getElementById('o-hours').textContent = h;
      document.getElementById('o-rate').textContent = '$' + r;
      document.getElementById('r-hours').textContent = fmt(hours);
      document.getElementById('r-value').textContent = 'A$' + fmt(value);
      document.getElementById('r-fte').textContent = (hours / 1656).toFixed(1);
      document.getElementById('r-pkg').textContent = s <= 15 ? 'Foundation (from A$2,500 + GST)' : s <= 100 ? 'Growth (from A$3,500 + GST)' : 'Enterprise (from A$5,500 + GST)';
      [st, hr, rt].forEach(fill);
    };
    [st, hr, rt].forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  }
})();
