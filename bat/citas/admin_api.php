<?php
/**
 * API del panel de administración de citas. Requiere sesión iniciada
 * (bat/citas/admin_login.php).
 *
 * GET  ?action=session                          -> { logged_in }
 * GET  ?action=month&year=YYYY&month=MM         -> estado de cada día del mes
 * GET  ?action=day&date=YYYY-MM-DD              -> franjas + datos de quien reservó
 * POST {action:"toggle_day", date}              -> abre/cierra un día completo
 * POST {action:"cancel", date, time}            -> libera una franja reservada
 */

require_once __DIR__ . '/lib.php';

if (session_status() !== PHP_SESSION_ACTIVE) session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && ($_GET['action'] ?? '') === 'session') {
    citas_json_response(['ok' => true, 'logged_in' => !empty($_SESSION['citas_admin'])]);
}

citas_require_admin();

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'month') {
        $year = (int) ($_GET['year'] ?? 0);
        $month = (int) ($_GET['month'] ?? 0);
        if ($year < 2020 || $month < 1 || $month > 12) citas_error('Mes no válido.');

        $data = citas_load();
        $daysInMonth = (int) date('t', mktime(0, 0, 0, $month, 1, $year));
        $days = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $d);
            $days[] = [
                'date' => $date,
                'closed' => in_array($date, $data['closed_days'], true),
                'booked_count' => isset($data['appointments'][$date]) ? count($data['appointments'][$date]) : 0,
                'total_slots' => count(citas_all_slots()),
            ];
        }
        citas_json_response(['ok' => true, 'days' => $days]);
    }

    if ($action === 'day') {
        $date = $_GET['date'] ?? '';
        if (!citas_is_valid_date($date)) citas_error('Fecha no válida.');
        $data = citas_load();
        $booked = $data['appointments'][$date] ?? [];
        $slots = [];
        foreach (citas_all_slots() as $time) {
            $slots[] = [
                'time' => $time,
                'appointment' => $booked[$time] ?? null,
            ];
        }
        citas_json_response([
            'ok' => true,
            'date' => $date,
            'closed' => in_array($date, $data['closed_days'], true),
            'slots' => $slots,
        ]);
    }

    citas_error('Acción no reconocida.', 404);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) $body = $_POST;
    $action = $body['action'] ?? '';

    if ($action === 'toggle_day') {
        $date = $body['date'] ?? '';
        if (!citas_is_valid_date($date)) citas_error('Fecha no válida.');
        $closedNow = citas_mutate(function (&$data) use ($date) {
            $key = array_search($date, $data['closed_days'], true);
            if ($key !== false) {
                array_splice($data['closed_days'], $key, 1);
                return false;
            }
            $data['closed_days'][] = $date;
            return true;
        });
        citas_json_response(['ok' => true, 'date' => $date, 'closed' => $closedNow]);
    }

    if ($action === 'cancel') {
        $date = $body['date'] ?? '';
        $time = $body['time'] ?? '';
        if (!citas_is_valid_date($date)) citas_error('Fecha no válida.');
        citas_mutate(function (&$data) use ($date, $time) {
            unset($data['appointments'][$date][$time]);
            if (empty($data['appointments'][$date])) {
                unset($data['appointments'][$date]);
            }
        });
        citas_json_response(['ok' => true]);
    }

    citas_error('Acción no reconocida.', 404);
}

citas_error('Método no permitido.', 405);
