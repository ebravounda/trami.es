(function () {
  function ready(fn) {
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var page = document.querySelector('.page');
    if (!page) return;

    var sections = Array.prototype.slice.call(page.children).filter(function (el) {
      if (el.tagName !== 'SECTION') return false;
      if (el.classList.contains('section-footer')) return false;
      if (el.querySelector('.swiper-container')) return false;
      return true;
    });

    if (!sections.length || !('IntersectionObserver' in window)) return; // sin soporte: todo se queda visible

    var viewportH = window.innerHeight || document.documentElement.clientHeight;
    var pending = [];

    function reveal(el) {
      el.classList.add('is-visible');
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top < viewportH * 0.9) return; // ya está a la vista: se deja tal cual
      sec.classList.add('tramilex-reveal-pending');
      pending.push(sec);
      observer.observe(sec);
    });

    if (!pending.length) return;

    // Red de seguridad: por si el navegador retrasa o agrupa las llamadas del
    // observer durante un scroll muy rápido, se comprueba también a mano para
    // que ninguna sección quede invisible por error.
    var ticking = false;
    function fallbackCheck() {
      ticking = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      pending.forEach(function (sec) {
        if (sec.classList.contains('is-visible')) return;
        if (sec.getBoundingClientRect().top < h * 0.95) reveal(sec);
      });
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(fallbackCheck);
    }, { passive: true });

    // Última red de seguridad: si por lo que sea nada de esto se dispara,
    // el contenido nunca debe quedar oculto de forma permanente.
    setTimeout(function () {
      pending.forEach(reveal);
    }, 4000);
  });
})();
