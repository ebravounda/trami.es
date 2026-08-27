<?php
/**
 * GET  ?action=get                                -> ajustes públicos actuales (sin datos sensibles)
 * POST multipart/form-data {height, logo (fichero opcional), reset (opcional)}
 *      -> guarda los ajustes; requiere sesión de administrador
 */

require_once __DIR__ . '/lib.php';

header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action !== 'get') citas_error('Acción no reconocida.', 404);
    citas_json_response(['ok' => true] + settings_load());
}

if ($method === 'POST') {
    settings_require_admin();

    $current = settings_load();

    if (!empty($_POST['reset'])) {
        if ($current['logo_url'] !== '') {
            $oldPath = SETTINGS_UPLOAD_DIR . '/' . basename($current['logo_url']);
            if (is_file($oldPath)) @unlink($oldPath);
        }
        settings_save(settings_defaults());
        citas_json_response(['ok' => true] + settings_load());
    }

    $height = isset($_POST['height']) ? (int) $_POST['height'] : $current['logo_height'];
    if ($height < SETTINGS_MIN_LOGO_HEIGHT || $height > SETTINGS_MAX_LOGO_HEIGHT) {
        citas_error(sprintf('La altura debe estar entre %d y %d px.', SETTINGS_MIN_LOGO_HEIGHT, SETTINGS_MAX_LOGO_HEIGHT));
    }
    $current['logo_height'] = $height;

    if (!empty($_FILES['logo']) && $_FILES['logo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $file = $_FILES['logo'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            citas_error('No se pudo subir el archivo (código ' . $file['error'] . ').');
        }
        if ($file['size'] > SETTINGS_MAX_UPLOAD_BYTES) {
            citas_error('La imagen no puede superar los 2 MB.');
        }
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!isset(SETTINGS_ALLOWED_TYPES[$ext])) {
            citas_error('Formato no admitido. Usa PNG, JPG, WEBP o SVG.');
        }
        // Verificación básica del contenido real del archivo (no solo la extensión).
        if ($ext !== 'svg') {
            $info = @getimagesize($file['tmp_name']);
            if (!$info || $info['mime'] !== SETTINGS_ALLOWED_TYPES[$ext]) {
                citas_error('El archivo no parece ser una imagen válida.');
            }
        }

        if (!is_dir(SETTINGS_UPLOAD_DIR)) mkdir(SETTINGS_UPLOAD_DIR, 0755, true);

        // Nombre de archivo fijo con marca de tiempo: evita rutas arbitrarias
        // y sirve como "cache-busting" automático al cambiar el logo.
        $filename = 'logo-' . time() . '.' . $ext;
        $destination = SETTINGS_UPLOAD_DIR . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            citas_error('No se pudo guardar la imagen en el servidor.');
        }

        if ($current['logo_url'] !== '') {
            $oldPath = SETTINGS_UPLOAD_DIR . '/' . basename($current['logo_url']);
            if (is_file($oldPath)) @unlink($oldPath);
        }

        $current['logo_url'] = SETTINGS_UPLOAD_URL . '/' . $filename;
    }

    settings_save($current);
    citas_json_response(['ok' => true] + settings_load());
}

citas_error('Método no permitido.', 405);
