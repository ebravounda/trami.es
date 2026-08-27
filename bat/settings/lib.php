<?php
/**
 * Ajustes generales del sitio (por ahora: logo de cabecera y su altura).
 * Reutiliza la misma sesión de administrador que el calendario de citas
 * (bat/citas/admin_login.php) para no tener que mantener dos logins.
 */

require_once __DIR__ . '/../citas/lib.php'; // aporta citas_json_response(), citas_error() y la sesión

define('SETTINGS_DATA_FILE', __DIR__ . '/data/settings.json');
define('SETTINGS_UPLOAD_DIR', __DIR__ . '/../../images/brand/uploads');
define('SETTINGS_UPLOAD_URL', 'images/brand/uploads');
define('SETTINGS_MAX_UPLOAD_BYTES', 2 * 1024 * 1024); // 2 MB
define('SETTINGS_ALLOWED_TYPES', ['png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'svg' => 'image/svg+xml', 'webp' => 'image/webp']);
define('SETTINGS_MIN_LOGO_HEIGHT', 30);
define('SETTINGS_MAX_LOGO_HEIGHT', 90);

function settings_defaults() {
    return ['logo_url' => '', 'logo_height' => 52];
}

function settings_load() {
    if (!file_exists(SETTINGS_DATA_FILE)) {
        return settings_defaults();
    }
    $raw = file_get_contents(SETTINGS_DATA_FILE);
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = [];
    return $data + settings_defaults();
}

function settings_save($data) {
    $data = $data + settings_defaults();
    file_put_contents(SETTINGS_DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function settings_require_admin() {
    citas_require_admin();
}
