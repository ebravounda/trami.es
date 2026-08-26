<?php
/**
 * API pública del sistema de citas.
 *
 * GET  ?action=slots&date=YYYY-MM-DD   -> franjas disponibles ese día
 * GET  ?action=month&year=YYYY&month=MM -> qué días del mes están cerrados/completos
 * POST {action:"book", date, time, name, email, phone, notes, privacy, hp_field}
 *      -> reserva una franja si sigue libre
 */

require_once __DIR__ . '/lib.php';

header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'slots') {
        $date = $_GET['date'] ?? '';
        if (!citas_is_date_in_range($date)) {
            citas_error('Fecha no válida.');
        }
        $result = citas_slots_for_date($date);
        citas_json_response(['ok' => true, 'date' => $date] + $result);
    }

    if ($action === 'month') {
        $year = (int) ($_GET['year'] ?? 0);
        $month = (int) ($_GET['month'] ?? 0);
        if ($year < 2020 || $month < 1 || $month > 12) citas_error('Mes no válido.');
        citas_json_response(['ok' => true, 'days' => citas_month_status($year, $month)]);
    }

    citas_error('Acción no reconocida.', 404);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) $body = $_POST;

    $action = $body['action'] ?? '';
    if ($action !== 'book') {
        citas_error('Acción no reconocida.', 404);
    }

    // Honeypot anti-spam: los bots suelen rellenar todos los campos.
    if (!empty($body['hp_field'])) {
        citas_json_response(['ok' => true]); // respuesta silenciosa, no se guarda nada
    }

    $date = trim($body['date'] ?? '');
    $time = trim($body['time'] ?? '');
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $notes = trim($body['notes'] ?? '');
    $privacy = !empty($body['privacy']);

    if (!citas_is_date_in_range($date)) citas_error('Fecha no válida.');
    if (!in_array($time, citas_all_slots(), true)) citas_error('Hora no válida.');
    if ($name === '' || mb_strlen($name) > 150) citas_error('Indica tu nombre.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) citas_error('Indica un email válido.');
    if (!$privacy) citas_error('Debes aceptar la política de privacidad.');
    if (mb_strlen($phone) > 40) citas_error('Teléfono no válido.');
    if (mb_strlen($notes) > 1000) citas_error('El mensaje es demasiado largo.');

    try {
        citas_mutate(function (&$data) use ($date, $time, $name, $email, $phone, $notes) {
            if (in_array($date, $data['closed_days'], true)) {
                throw new RuntimeException('Ese día ya no admite citas. Elige otra fecha.');
            }
            if (isset($data['appointments'][$date][$time])) {
                throw new RuntimeException('Esa franja horaria acaba de reservarse. Elige otra.');
            }
            if (!isset($data['appointments'][$date])) {
                $data['appointments'][$date] = [];
            }
            $data['appointments'][$date][$time] = [
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'notes' => $notes,
                'created_at' => date('c'),
            ];
        });
    } catch (RuntimeException $e) {
        citas_error($e->getMessage(), 409);
    }

    citas_notify_new_appointment($date, $time, $name, $email, $phone, $notes);

    citas_json_response(['ok' => true, 'date' => $date, 'time' => $time]);
}

citas_error('Método no permitido.', 405);

function citas_notify_new_appointment($date, $time, $name, $email, $phone, $notes) {
    if (CITAS_NOTIFY_EMAIL === '') return;
    $subject = "Nueva cita: $date $time - $name";
    $bodyLines = [
        "Nueva cita reservada desde la web.",
        "",
        "Fecha: $date",
        "Hora: $time",
        "Nombre: $name",
        "Email: $email",
        "Teléfono: $phone",
        "Notas: $notes",
    ];
    $headers = "From: web@tramilex.es\r\nReply-To: " . $email;
    // El envío es best-effort: si el hosting no tiene mail() configurado,
    // la cita ya ha quedado guardada igualmente.
    @mail(CITAS_NOTIFY_EMAIL, $subject, implode("\n", $bodyLines), $headers);
}
