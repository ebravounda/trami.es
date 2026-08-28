(function () {
  var els = {};

  function escapeHtml(s) { var div = document.createElement('div'); div.textContent = s == null ? '' : s; return div.innerHTML; }

  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || data.ok === false) throw new Error(data.error || 'Ha ocurrido un error.');
        return data;
      });
    });
  }

  function showLogin(message) {
    els.app.innerHTML =
      '<div class="tramilex-admin-login">' +
      '<h4 class="text-center">Acceso al panel</h4>' +
      (message ? '<div class="tramilex-booking-status is-error">' + escapeHtml(message) + '</div>' : '') +
      '<form id="admin-login-form" class="offset-top-20">' +
      '  <div class="tramilex-field"><label class="tramilex-field-label" for="admin-password">Contraseña</label><input class="form-control" type="password" id="admin-password" name="password" autocomplete="current-password" required></div>' +
      '  <button class="btn btn-primary btn-block offset-top-15" type="submit">Entrar</button>' +
      '</form>' +
      '</div>';

    document.getElementById('admin-login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var password = document.getElementById('admin-password').value;
      fetchJSON('bat/settings/admin_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password }),
      }).then(function (data) {
        renderApp(data.warn_default_password);
      }).catch(function (err) {
        showLogin(err.message);
      });
    });
  }

  function renderApp(warnDefaultPassword) {
    els.app.innerHTML =
      (warnDefaultPassword ? '<div class="tramilex-booking-status is-error offset-bottom-20">⚠️ Sigues usando la contraseña de administración por defecto. Cámbiala en <code>bat/settings/config.php</code> antes de publicar el sitio.</div>' : '') +
      '<div class="d-flex justify-content-end offset-bottom-10"><button class="btn btn-silver-outline" id="admin-logout">Cerrar sesión</button></div>' +
      '<div id="admin-tab-ajustes"></div>';

    document.getElementById('admin-logout').addEventListener('click', function () {
      fetchJSON('bat/settings/admin_logout.php', { method: 'POST' }).then(function () { showLogin(); });
    });

    renderAjustesTab();
  }

  function renderAjustesTab() {
    var wrap = document.getElementById('admin-tab-ajustes');
    wrap.innerHTML = '<p class="text-gray-base-05">Cargando…</p>';

    fetchJSON('bat/settings/settings.php?action=get').then(function (settings) {
      var previewSrc = settings.logo_url || 'images/brand/tramilex-logo-header.png';
      wrap.innerHTML =
        '<div class="tramilex-admin-login" style="max-width:520px;margin:0;">' +
        '  <h5>Logo de la cabecera</h5>' +
        '  <p class="text-bismark" style="color:#6b7c78;">Sube una imagen (PNG, JPG, WEBP o SVG, máx. 2&nbsp;MB) y ajusta su altura en el menú. El ancho se adapta solo.</p>' +
        '  <div class="offset-top-15" style="background:#f4f6f5;border-radius:8px;padding:20px;text-align:center;">' +
        '    <img id="ajustes-logo-preview" src="' + previewSrc + '" alt="Logo actual" style="height:' + settings.logo_height + 'px;width:auto;max-width:100%;">' +
        '  </div>' +
        '  <form id="ajustes-logo-form" class="offset-top-20">' +
        '    <div class="tramilex-field">' +
        '      <label class="tramilex-field-label" for="ajustes-logo-file">Nueva imagen (opcional)</label>' +
        '      <input class="form-control" type="file" id="ajustes-logo-file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml">' +
        '    </div>' +
        '    <div class="tramilex-field">' +
        '      <label class="tramilex-field-label" for="ajustes-logo-height">Altura: <span id="ajustes-logo-height-value">' + settings.logo_height + '</span>&nbsp;px</label>' +
        '      <input type="range" id="ajustes-logo-height" min="30" max="90" value="' + settings.logo_height + '" style="width:100%;">' +
        '    </div>' +
        '    <div class="offset-top-15" style="display:flex;gap:12px;flex-wrap:wrap;">' +
        '      <button class="btn btn-primary" type="submit">Guardar cambios</button>' +
        '      <button class="btn btn-silver-outline" type="button" id="ajustes-logo-reset">Restaurar logo por defecto</button>' +
        '    </div>' +
        '    <div id="ajustes-logo-result" class="offset-top-15"></div>' +
        '  </form>' +
        '</div>';

      var fileInput = document.getElementById('ajustes-logo-file');
      var heightInput = document.getElementById('ajustes-logo-height');
      var preview = document.getElementById('ajustes-logo-preview');
      var heightValue = document.getElementById('ajustes-logo-height-value');

      heightInput.addEventListener('input', function () {
        heightValue.textContent = heightInput.value;
        preview.style.height = heightInput.value + 'px';
      });

      fileInput.addEventListener('change', function () {
        if (!fileInput.files || !fileInput.files[0]) return;
        preview.src = URL.createObjectURL(fileInput.files[0]);
      });

      document.getElementById('ajustes-logo-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var resultEl = document.getElementById('ajustes-logo-result');
        var formData = new FormData();
        formData.append('height', heightInput.value);
        if (fileInput.files && fileInput.files[0]) formData.append('logo', fileInput.files[0]);

        fetchJSON('bat/settings/settings.php', { method: 'POST', body: formData }).then(function () {
          resultEl.innerHTML = '<div class="tramilex-booking-status is-success">Cambios guardados. Recarga cualquier página del sitio para verlos.</div>';
          renderAjustesTab();
        }).catch(function (err) {
          resultEl.innerHTML = '<div class="tramilex-booking-status is-error">' + escapeHtml(err.message) + '</div>';
        });
      });

      document.getElementById('ajustes-logo-reset').addEventListener('click', function () {
        if (!confirm('¿Restaurar el logo original de Tramilex?')) return;
        var formData = new FormData();
        formData.append('reset', '1');
        fetchJSON('bat/settings/settings.php', { method: 'POST', body: formData }).then(function () {
          renderAjustesTab();
        });
      });
    });
  }

  function init() {
    els.app = document.getElementById('tramilex-admin-app');
    if (!els.app) return;
    fetchJSON('bat/settings/session.php').then(function (data) {
      if (data.logged_in) renderApp(false);
      else showLogin();
    }).catch(function () { showLogin(); });
  }

  document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);
})();
