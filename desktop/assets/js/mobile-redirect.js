/* Optional (Option B in README): send phone visitors to the separate mobile site.
   Not linked by default. To use, add <script src="assets/js/mobile-redirect.js"></script> before </head>.
   Visitors can stay on the desktop site with ?desktop=1 (remembered for the session). */
(function () {
  var MOBILE_HOST = 'https://m.aidome.com.au';
  try {
    if (/[?&]desktop=1/.test(location.search)) { sessionStorage.setItem('aidome-desktop', '1'); return; }
    if (sessionStorage.getItem('aidome-desktop') === '1') return;
  } catch (e) {}
  if (window.matchMedia && window.matchMedia('(max-width: 640px)').matches) {
    location.replace(MOBILE_HOST + location.pathname + location.search + location.hash);
  }
})();
