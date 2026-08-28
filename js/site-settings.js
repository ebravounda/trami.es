(function () {
  function ready(fn) {
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    fetch('bat/settings/settings.php?action=get')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.ok === false) return;

        var height = data.logo_height;
        if (height) {
          // En móvil (layout "fijo") la cabecera mide 56px de alto: una
          // altura de logo mayor que la que ya viene por defecto (52px)
          // no cabría entera, así que en móvil se limita a como mucho eso
          // y se respeta el valor elegido tal cual en el escritorio.
          var mobileHeight = Math.min(height, 52);
          var style = document.createElement('style');
          style.textContent =
            '.rd-navbar-brand img { height: ' + height + 'px !important; }' +
            '@media (max-width: 991.98px) { .rd-navbar-brand img { height: ' + mobileHeight + 'px !important; } }';
          document.head.appendChild(style);
        }

        if (data.logo_url) {
          document.querySelectorAll('.rd-navbar-brand img').forEach(function (img) {
            img.src = data.logo_url;
          });
        }
      })
      .catch(function () {
        // Sin conexión con el backend: se mantiene el logo por defecto tal cual.
      });
  });
})();
