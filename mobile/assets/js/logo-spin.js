/* AI Dome — turning dome in the header logo (same globe projection as the hero logo). Off for prefers-reduced-motion. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = [].slice.call(document.querySelectorAll('.logo-spin')); if (!els.length) return;
  var tex = new Image(); tex.decoding = 'async'; tex.src = 'assets/img/dome-texture.webp';
  tex.onload = function () {
    var oc = document.createElement('canvas'), TW = oc.width = tex.naturalWidth, TH = oc.height = tex.naturalHeight;
    var o = oc.getContext('2d'); o.drawImage(tex, 0, 0);
    var T32; try { T32 = new Uint32Array(o.getImageData(0, 0, TW, TH).data.buffer); } catch (e) { return; }
    var items = els.map(function (el) {
      var g = el.dataset.geo.split(',').map(Number), CX = g[0], YB = g[1], RX = g[2], RY = g[3];
      var cv = el.querySelector('.ls-cv'), BX = CX - RX, BY = YB - RY, BW = 2 * RX, BH = RY, it = { cv: cv };
      it.build = function () {
        var scale = (el.clientHeight / g[5]) * Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.max(20, Math.round(BW * scale)), h = Math.max(10, Math.round(BH * scale));
        cv.width = w; cv.height = h; it.ctx = cv.getContext('2d'); it.img = it.ctx.createImageData(w, h); it.out = new Uint32Array(it.img.data.buffer);
        var L = [], U = [], V = [], S = [], A = [];
        for (var y = 0; y < h; y++) { var py = BY + (y + .5) / scale, ny = (YB - py) / RY; if (ny < 0) continue;
          for (var x = 0; x < w; x++) { var px = BX + (x + .5) / scale, nx = (px - CX) / RX, r2 = nx * nx + ny * ny; if (r2 >= 1) continue;
            var z = Math.sqrt(1 - r2), lat = Math.asin(Math.min(1, ny)), lon = Math.atan2(nx, z);
            L.push(y * w + x); U.push(lon / (2 * Math.PI) + .5); V.push(Math.min(.999, Math.max(0, 1 - lat / (Math.PI / 2 * 88 / 90))));
            S.push(.86 + .3 * Math.sqrt(z)); A.push(Math.min(1, (1 - Math.sqrt(r2)) * RX * scale * .9)); } }
        it.n = L.length; it.idx = new Int32Array(L); it.U = new Float32Array(U); it.V = new Int32Array(it.n); it.S = new Float32Array(S); it.A = new Uint8Array(it.n);
        for (var i = 0; i < it.n; i++) { it.V[i] = Math.floor(V[i] * TH) * TW; it.A[i] = Math.round(A[i] * 255); }
      };
      it.draw = function (ph) {
        for (var i = 0; i < it.n; i++) { var u = it.U[i] + ph; u -= Math.floor(u); var c = T32[it.V[i] + ((u * TW) | 0)], s = it.S[i];
          var b = ((c >> 16) & 255) * s, gg = ((c >> 8) & 255) * s, r = (c & 255) * s;
          it.out[it.idx[i]] = (it.A[i] << 24) | ((b > 255 ? 255 : b) << 16) | ((gg > 255 ? 255 : gg) << 8) | (r > 255 ? 255 : r); }
        it.ctx.putImageData(it.img, 0, 0);
      };
      it.build(); it.draw(0); el.classList.add('on'); return it;
    });
    var ph = 0, last = null, running = true;
    var loop = function (ts) { if (!running) { last = null; return; } if (last === null) last = ts;
      if (ts - last >= 40) { ph += (ts - last) / 20000; last = ts; items.forEach(function (it) { it.draw(ph); }); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(loop); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { items.forEach(function (it) { it.build(); it.draw(ph); }); }, 200); });
  };
})();
