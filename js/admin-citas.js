(function () {
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  var state = { view: new Date(), selectedDate: null, days: {} };
  var els = {};

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayIso() { return isoDate(new Date()); }
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
      fetchJSON('bat/citas/admin_login.php', {
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
      (warnDefaultPassword ? '<div class="tramilex-booking-status is-error offset-bottom-20">⚠️ Sigues usando la contraseña de administración por defecto. Cámbiala en <code>bat/citas/config.php</code> antes de publicar el sitio.</div>' : '') +
      '<div class="row align-items-center offset-bottom-10">' +
      '  <div class="col-sm-6">' +
      '    <div class="tramilex-admin-tabs">' +
      '      <button type="button" class="tramilex-admin-tab is-active" data-tab="citas">Calendario de citas</button>' +
      '      <button type="button" class="tramilex-admin-tab" data-tab="ajustes">Ajustes del sitio</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-sm-6 text-sm-end"><button class="btn btn-silver-outline" id="admin-logout">Cerrar sesión</button></div>' +
      '</div>' +
      '<div id="admin-tab-citas"></div>' +
      '<div id="admin-tab-ajustes" style="display:none;"></div>';

    document.getElementById('admin-logout').addEventListener('click', function () {
      fetchJSON('bat/citas/admin_logout.php', { method: 'POST' }).then(function () { showLogin(); });
    });

    document.querySelectorAll('.tramilex-admin-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.tramilex-admin-tab').forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var target = tab.getAttribute('data-tab');
        document.getElementById('admin-tab-citas').style.display = target === 'citas' ? '' : 'none';
        document.getElementById('admin-tab-ajustes').style.display = target === 'ajustes' ? '' : 'none';
        if (target === 'ajustes') renderAjustesTab();
      });
    });

    renderCitasTab();
  }

  function renderCitasTab() {
    var wrap = document.getElementById('admin-tab-citas');
    wrap.innerHTML =
      '<div class="tramilex-booking">' +
      '  <div class="tramilex-cal">' +
      '    <div class="tramilex-cal-head">' +
      '      <button type="button" class="tramilex-cal-nav" id="admin-cal-prev">&#8249;</button>' +
      '      <h5 id="admin-cal-title"></h5>' +
      '      <button type="button" class="tramilex-cal-nav" id="admin-cal-next">&#8250;</button>' +
      '    </div>' +
      '    <div class="tramilex-cal-grid" id="admin-cal-grid" style="gap:8px;"></div>' +
      '    <p class="text-bismark offset-top-15" style="color:#6b7c78;">Haz clic en un día para ver y gestionar sus citas. El punto naranja indica un día cerrado o completo.</p>' +
      '  </div>' +
      '  <div class="tramilex-slots-panel" id="admin-day-panel"><p class="text-gray-base-05">Elige un día en el calendario.</p></div>' +
      '</div>';

    els.calTitle = document.getElementById('admin-cal-title');
    els.calGrid = document.getElementById('admin-cal-grid');
    els.dayPanel = document.getElementById('admin-day-panel');

    document.getElementById('admin-cal-prev').addEventListener('click', function () { changeMonth(-1); });
    document.getElementById('admin-cal-next').addEventListener('click', function () { changeMonth(1); });

    DOW.forEach(function (label) {
      var el = document.createElement('div');
      el.className = 'tramilex-cal-dow';
      el.textContent = label;
      els.calGrid.appendChild(el);
    });

    loadMonth();
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

  function loadMonth() {
    var y = state.view.getFullYear();
    var m = state.view.getMonth() + 1;
    els.calTitle.textContent = MONTHS[m - 1] + ' ' + y;
    fetchJSON('bat/citas/admin_api.php?action=month&year=' + y + '&month=' + m).then(function (data) {
      state.days = {};
      data.days.forEach(function (d) { state.days[d.date] = d; });
      renderCalendar();
    });
  }

  function renderCalendar() {
    els.calGrid.querySelectorAll('.tramilex-cal-day, .tramilex-cal-empty').forEach(function (el) { el.remove(); });

    var first = new Date(state.view.getFullYear(), state.view.getMonth(), 1);
    var startOffset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 0).getDate();
    var today = todayIso();

    for (var i = 0; i < startOffset; i++) {
      var empty = document.createElement('div');
      empty.className = 'tramilex-cal-empty';
      els.calGrid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(state.view.getFullYear(), state.view.getMonth(), d);
      var iso = isoDate(date);
      var info = state.days[iso];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tramilex-cal-day';
      btn.textContent = d;
      if (iso < today) btn.classList.add('is-past');
      if (info && info.closed) btn.classList.add('is-full');
      else if (info && info.booked_count >= info.total_slots) btn.classList.add('is-full');
      if (iso === state.selectedDate) btn.classList.add('is-selected');
      btn.addEventListener('click', function (isoClicked) {
        return function () { selectDay(isoClicked); };
      }(iso));
      els.calGrid.appendChild(btn);
    }
  }

  function selectDay(iso) {
    state.selectedDate = iso;
    renderCalendar();
    els.dayPanel.innerHTML = '<p class="text-gray-base-05">Cargando…</p>';
    fetchJSON('bat/citas/admin_api.php?action=day&date=' + iso).then(function (data) {
      renderDayPanel(iso, data);
    });
  }

  function formatDateLong(iso) {
    var parts = iso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var dow = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()];
    return dow + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function renderDayPanel(iso, data) {
    var html = '<div class="d-flex align-items-center justify-content-between" style="flex-wrap:wrap;gap:10px;">' +
      '<h5 class="offset-bottom-0">' + escapeHtml(formatDateLong(iso)) + '</h5>' +
      '<button type="button" class="tramilex-toggle-btn' + (data.closed ? ' is-closed' : '') + '" id="admin-toggle-day">' +
      (data.closed ? 'Día cerrado — abrir' : 'Día abierto — cerrar') +
      '</button></div>';

    var withAppt = data.slots.filter(function (s) { return s.appointment; });
    var without = data.slots.filter(function (s) { return !s.appointment; });

    html += '<div class="offset-top-20">';
    if (!withAppt.length) {
      html += '<p class="text-gray-base-05">Todavía no hay citas reservadas este día.</p>';
    } else {
      withAppt.forEach(function (s) {
        var a = s.appointment;
        html += '<div class="tramilex-admin-appt-row">' +
          '<div><strong>' + escapeHtml(s.time) + '</strong> — ' + escapeHtml(a.name) +
          '<br><span class="text-bismark" style="color:#6b7c78;">' + escapeHtml(a.email) + (a.phone ? ' · ' + escapeHtml(a.phone) : '') + '</span>' +
          (a.notes ? '<br><span class="text-bismark" style="color:#6b7c78;">' + escapeHtml(a.notes) + '</span>' : '') +
          '</div>' +
          '<button type="button" class="tramilex-toggle-btn is-closed" data-cancel-time="' + s.time + '">Cancelar</button>' +
          '</div>';
      });
    }
    html += '</div>';
    html += '<p class="text-bismark offset-top-20" style="color:#6b7c78;">Franjas libres ese día: ' + without.length + ' de ' + data.slots.length + '.</p>';

    els.dayPanel.innerHTML = html;

    document.getElementById('admin-toggle-day').addEventListener('click', function () {
      fetchJSON('bat/citas/admin_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_day', date: iso }),
      }).then(function () {
        loadMonth();
        selectDay(iso);
      });
    });

    els.dayPanel.querySelectorAll('[data-cancel-time]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var time = btn.getAttribute('data-cancel-time');
        if (!confirm('¿Cancelar la cita de las ' + time + '? Se avisará por separado a la persona.')) return;
        fetchJSON('bat/citas/admin_api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel', date: iso, time: time }),
        }).then(function () {
          loadMonth();
          selectDay(iso);
        });
      });
    });
  }

  function changeMonth(delta) {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() + delta, 1);
    state.selectedDate = null;
    els.dayPanel.innerHTML = '<p class="text-gray-base-05">Elige un día en el calendario.</p>';
    loadMonth();
  }

  function init() {
    els.app = document.getElementById('tramilex-admin-app');
    if (!els.app) return;
    fetchJSON('bat/citas/admin_api.php?action=session').then(function (data) {
      if (data.logged_in) renderApp(false);
      else showLogin();
    }).catch(function () { showLogin(); });
  }

  document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);
})();
