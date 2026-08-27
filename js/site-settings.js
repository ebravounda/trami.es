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
          var style = document.createElement('style');
          style.textContent = '.rd-navbar-brand img { height: ' + height + 'px !important; }';
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
