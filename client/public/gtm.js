window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-PKP9YKF18K');

(function() {
  var loaded = false;
  function loadGtag() {
    if (loaded) return;
    loaded = true;
    ['scroll', 'touchstart', 'pointerdown', 'keydown'].forEach(function(e) {
      window.removeEventListener(e, loadGtag);
    });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-PKP9YKF18K';
    document.head.appendChild(s);
  }
  ['scroll', 'touchstart', 'pointerdown', 'keydown'].forEach(function(e) {
    window.addEventListener(e, loadGtag, { once: true, passive: true });
  });
  setTimeout(loadGtag, 8000);
})();
