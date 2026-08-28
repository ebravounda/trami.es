<?php
require_once __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    settings_error('Método no permitido.', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) $body = $_POST;
$password = (string) ($body['password'] ?? '');

session_start();

if ($password === '' || !hash_equals(SETTINGS_ADMIN_PASSWORD, $password)) {
    settings_error('Contraseña incorrecta.', 401);
}

$_SESSION['tramilex_admin'] = true;
settings_json_response([
    'ok' => true,
    'warn_default_password' => hash_equals(SETTINGS_ADMIN_PASSWORD, 'Tramilex-Admin-2026'),
]);
