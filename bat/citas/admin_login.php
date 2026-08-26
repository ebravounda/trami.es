<?php
require_once __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    citas_error('Método no permitido.', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) $body = $_POST;
$password = (string) ($body['password'] ?? '');

session_start();

if ($password === '' || !hash_equals(CITAS_ADMIN_PASSWORD, $password)) {
    citas_error('Contraseña incorrecta.', 401);
}

$_SESSION['citas_admin'] = true;
citas_json_response([
    'ok' => true,
    'warn_default_password' => hash_equals(CITAS_ADMIN_PASSWORD, 'Tramilex-Citas-2026'),
]);
