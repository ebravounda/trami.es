(function () {
  var DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  var state = {
    view: new Date(),
    selectedDate: null,
    selectedTime: null,
    monthStatus: {},
  };

  var els = {};

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayIso() { return isoDate(new Date()); }

  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || data.ok === false) throw new Error(data.error || 'Ha ocurrido un error.');
        return data;
      });
    });
  }

  function loadMonthStatus() {
    var y = state.view.getFullYear();
    var m = state.view.getMonth() + 1;
    return fetchJSON('bat/citas/api.php?action=month&year=' + y + '&month=' + m).then(function (data) {
      state.monthStatus = {};
      data.days.forEach(function (d) { state.monthStatus[d.date] = d; });
    });
  }

  function renderCalendar() {
    els.calTitle.textContent = MONTHS[state.view.getMonth()] + ' ' + state.view.getFullYear();
    els.calGrid.querySelectorAll('.tramilex-cal-day, .tramilex-cal-empty').forEach(function (el) { el.remove(); });

    var first = new Date(state.view.getFullYear(), state.view.getMonth(), 1);
    var startOffset = (first.getDay() + 6) % 7; // lunes=0
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
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tramilex-cal-day';
      btn.textContent = d;

      var status = state.monthStatus[iso];
      var isPast = iso < today;
      var isFull = status && status.full;

      if (isPast || isFull) {
        btn.disabled = true;
        if (isFull && !isPast) btn.classList.add('is-full');
      } else {
        btn.addEventListener('click', function (isoClicked) {
          return function () { selectDate(isoClicked); };
        }(iso));
      }
      if (iso === state.selectedDate) btn.classList.add('is-selected');
      els.calGrid.appendChild(btn);
    }
  }

  function selectDate(iso) {
    state.selectedDate = iso;
    state.selectedTime = null;
    renderCalendar();
    loadSlots(iso);
  }

  function loadSlots(iso) {
    els.slotsPanel.innerHTML = '<p class="text-gray-base-05">Cargando horas disponibles…</p>';
    fetchJSON('bat/citas/api.php?action=slots&date=' + iso).then(function (data) {
      renderSlots(iso, data);
    }).catch(function (err) {
      els.slotsPanel.innerHTML = '<div class="tramilex-booking-status is-error">' + escapeHtml(err.message) + '</div>';
    });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDateLong(iso) {
    var parts = iso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var dow = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()];
    return dow + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function renderSlots(iso, data) {
    if (data.closed) {
      els.slotsPanel.innerHTML =
        '<h5><span class="tramilex-step-label">2</span>' + escapeHtml(formatDateLong(iso)) + '</h5>' +
        '<div class="tramilex-booking-status is-error">Ese día no tenemos disponibilidad. Elige otra fecha en el calendario.</div>';
      return;
    }

    var available = data.slots.filter(function (s) { return s.available; });
    var html = '<h5><span class="tramilex-step-label">2</span>' + escapeHtml(formatDateLong(iso)) + '</h5>';

    if (!available.length) {
      html += '<div class="tramilex-booking-status is-error">Ya no quedan franjas libres ese día. Prueba con otra fecha.</div>';
      els.slotsPanel.innerHTML = html;
      return;
    }

    html += '<p class="text-gray-base-05">Cada cita dura 45 minutos. Elige la hora que prefieras:</p>';
    html += '<div class="tramilex-slots-grid" id="tramilex-slots-grid">';
    data.slots.forEach(function (s) {
      html += '<button type="button" class="tramilex-slot-btn" data-time="' + s.time + '"' + (s.available ? '' : ' disabled') + '>' + s.time + '</button>';
    });
    html += '</div>';
    html += '<div id="tramilex-booking-form-wrap"></div>';
    els.slotsPanel.innerHTML = html;

    els.slotsPanel.querySelectorAll('.tramilex-slot-btn').forEach(function (btn) {
      if (btn.disabled) return;
      btn.addEventListener('click', function () {
        els.slotsPanel.querySelectorAll('.tramilex-slot-btn').forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        state.selectedTime = btn.getAttribute('data-time');
        renderBookingForm(iso, state.selectedTime);
      });
    });
  }

  function renderBookingForm(iso, time) {
    var wrap = document.getElementById('tramilex-booking-form-wrap');
    if (!wrap) return;
    wrap.innerHTML =
      '<h5 class="offset-top-30"><span class="tramilex-step-label">3</span>Tus datos — ' + escapeHtml(formatDateLong(iso)) + ' a las ' + escapeHtml(time) + '</h5>' +
      '<form id="tramilex-booking-form" class="rd-mailform form-modern">' +
      '  <div class="row row-30">' +
      '    <div class="col-md-6"><div class="tramilex-field"><label class="tramilex-field-label" for="cita-name">Nombre</label><input class="form-control" id="cita-name" type="text" name="name" required></div></div>' +
      '    <div class="col-md-6"><div class="tramilex-field"><label class="tramilex-field-label" for="cita-email">Email</label><input class="form-control" id="cita-email" type="email" name="email" required></div></div>' +
      '    <div class="col-md-6"><div class="tramilex-field"><label class="tramilex-field-label" for="cita-phone">Teléfono</label><input class="form-control" id="cita-phone" type="text" name="phone"></div></div>' +
      '    <div class="col-sm-12"><div class="tramilex-field"><label class="tramilex-field-label" for="cita-notes">Cuéntanos brevemente qué necesitas (opcional)</label><textarea class="form-control" id="cita-notes" name="notes"></textarea></div></div>' +
      '    <div class="tramilex-hp" aria-hidden="true"><label for="cita-hp">Por favor, deja este campo vacío</label><input type="text" id="cita-hp" name="hp_field" tabindex="-1" autocomplete="off"></div>' +
      '    <div class="col-sm-12"><div class="form-group form-group-checkbox"><label class="checkbox"><input type="checkbox" name="privacy" required><span class="checkbox-decor"></span> He leído y acepto la <a class="link-primary" href="politica-privacidad.html" target="_blank">Política de Privacidad</a>.</label></div></div>' +
      '    <div class="col-sm-12"><button class="btn btn-primary btn-block" type="submit">Confirmar cita</button></div>' +
      '  </div>' +
      '  <div id="tramilex-booking-result"></div>' +
      '</form>';

    document.getElementById('tramilex-booking-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submitBooking(iso, time, e.target);
    });
  }

  function submitBooking(iso, time, form) {
    var resultEl = document.getElementById('tramilex-booking-result');
    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    var payload = {
      action: 'book',
      date: iso,
      time: time,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      notes: form.notes.value.trim(),
      privacy: form.privacy.checked,
      hp_field: form.hp_field.value,
    };

    fetchJSON('bat/citas/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function () {
      els.slotsPanel.innerHTML =
        '<div class="tramilex-booking-status is-success">' +
        '<strong>¡Cita confirmada!</strong> Te esperamos el ' + escapeHtml(formatDateLong(iso)) + ' a las ' + escapeHtml(time) + '. ' +
        'Te hemos enviado los detalles a ' + escapeHtml(payload.email) + '.' +
        '</div>';
      loadMonthStatus().then(renderCalendar);
    }).catch(function (err) {
      resultEl.innerHTML = '<div class="tramilex-booking-status is-error">' + escapeHtml(err.message) + '</div>';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar cita';
    });
  }

  function changeMonth(delta) {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() + delta, 1);
    state.selectedDate = null;
    state.selectedTime = null;
    els.slotsPanel.innerHTML = '<p class="text-gray-base-05">Elige un día disponible en el calendario para ver las horas.</p>';
    loadMonthStatus().then(renderCalendar);
  }

  function init() {
    els.calTitle = document.getElementById('tramilex-cal-title');
    els.calGrid = document.getElementById('tramilex-cal-grid');
    els.slotsPanel = document.getElementById('tramilex-slots-panel');
    if (!els.calGrid) return;

    DOW.forEach(function (label) {
      var el = document.createElement('div');
      el.className = 'tramilex-cal-dow';
      el.textContent = label;
      els.calGrid.appendChild(el);
    });

    document.getElementById('tramilex-cal-prev').addEventListener('click', function () { changeMonth(-1); });
    document.getElementById('tramilex-cal-next').addEventListener('click', function () { changeMonth(1); });

    loadMonthStatus().then(renderCalendar).catch(function (err) {
      els.slotsPanel.innerHTML = '<div class="tramilex-booking-status is-error">' + escapeHtml(err.message) + '</div>';
    });
  }

  document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);
})();
