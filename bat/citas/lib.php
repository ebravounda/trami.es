<?php
/**
 * Funciones compartidas del sistema de citas: generación de franjas horarias
 * y lectura/escritura con bloqueo del almacén de datos (bat/citas/data/agenda.json).
 *
 * No hay base de datos: se usa un único fichero JSON protegido de acceso
 * directo por bat/citas/data/.htaccess. flock() evita que dos reservas
 * simultáneas choquen entre sí.
 */

require_once __DIR__ . '/config.php';

date_default_timezone_set(CITAS_TIMEZONE);

define('CITAS_DATA_FILE', __DIR__ . '/data/agenda.json');
define('CITAS_SLOT_START_MIN', 9 * 60);   // 09:00
define('CITAS_SLOT_END_MIN', 20 * 60);    // 20:00 (ninguna cita puede terminar más tarde)
define('CITAS_SLOT_DURATION_MIN', 45);
define('CITAS_MAX_DAYS_AHEAD', 90);

function citas_json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function citas_error($message, $status = 400) {
    citas_json_response(['ok' => false, 'error' => $message], $status);
}

/** Lista de horas "HH:MM" de inicio de cada franja de 45 minutos entre las 09:00 y las 20:00. */
function citas_all_slots() {
    $slots = [];
    for ($m = CITAS_SLOT_START_MIN; $m + CITAS_SLOT_DURATION_MIN <= CITAS_SLOT_END_MIN; $m += CITAS_SLOT_DURATION_MIN) {
        $slots[] = sprintf('%02d:%02d', intdiv($m, 60), $m % 60);
    }
    return $slots;
}

function citas_is_valid_date($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function citas_today() {
    return (new DateTime('today'))->format('Y-m-d');
}

function citas_is_date_in_range($date) {
    if (!citas_is_valid_date($date)) return false;
    $today = new DateTime('today');
    $max = (clone $today)->modify('+' . CITAS_MAX_DAYS_AHEAD . ' days');
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d >= $today && $d <= $max;
}

/** Lee el almacén completo (lectura compartida, no bloquea otras lecturas). */
function citas_load() {
    if (!file_exists(CITAS_DATA_FILE)) {
        return ['closed_days' => [], 'appointments' => []];
    }
    $fp = fopen(CITAS_DATA_FILE, 'r');
    if (!$fp) return ['closed_days' => [], 'appointments' => []];
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = [];
    $data += ['closed_days' => [], 'appointments' => []];
    return $data;
}

/**
 * Abre el almacén con bloqueo exclusivo, deja que $mutator(&$data) lo modifique
 * y guarda el resultado. $mutator debe devolver un valor que se propaga como
 * resultado de citas_mutate(); puede lanzar una excepción para abortar sin guardar.
 */
function citas_mutate(callable $mutator) {
    $fp = fopen(CITAS_DATA_FILE, 'c+');
    if (!$fp) {
        throw new RuntimeException('No se pudo abrir el almacén de citas (revisa permisos de escritura en bat/citas/data/).');
    }
    flock($fp, LOCK_EX);
    $size = filesize(CITAS_DATA_FILE);
    $raw = $size > 0 ? fread($fp, $size) : '';
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = [];
    $data += ['closed_days' => [], 'appointments' => []];

    try {
        $result = $mutator($data);
    } catch (Exception $e) {
        flock($fp, LOCK_UN);
        fclose($fp);
        throw $e;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $result;
}

/** Devuelve [slots => [['time'=>..,'available'=>bool], ...], closed => bool] para una fecha. */
function citas_slots_for_date($date) {
    $data = citas_load();
    $closed = in_array($date, $data['closed_days'], true);
    $booked = $data['appointments'][$date] ?? [];
    $isToday = $date === citas_today();
    $nowMin = $isToday ? ((int) date('G') * 60 + (int) date('i')) : -1;

    $slots = [];
    foreach (citas_all_slots() as $time) {
        list($h, $mi) = array_map('intval', explode(':', $time));
        $slotMin = $h * 60 + $mi;
        $isPast = $isToday && $slotMin <= $nowMin;
        $slots[] = [
            'time' => $time,
            'available' => !$closed && !$isPast && !isset($booked[$time]),
        ];
    }
    return ['closed' => $closed, 'slots' => $slots];
}

/** Estado público (sin datos personales) de cada día de un mes: cerrado / completo. */
function citas_month_status($year, $month) {
    $data = citas_load();
    $totalSlots = count(citas_all_slots());
    $daysInMonth = (int) date('t', mktime(0, 0, 0, $month, 1, $year));
    $today = citas_today();
    $days = [];
    for ($d = 1; $d <= $daysInMonth; $d++) {
        $date = sprintf('%04d-%02d-%02d', $year, $month, $d);
        if ($date < $today) continue; // no exponemos estado de días pasados
        $bookedCount = isset($data['appointments'][$date]) ? count($data['appointments'][$date]) : 0;
        $closed = in_array($date, $data['closed_days'], true);
        $days[] = [
            'date' => $date,
            'closed' => $closed,
            'full' => $closed || $bookedCount >= $totalSlots,
        ];
    }
    return $days;
}

function citas_require_admin() {
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    if (empty($_SESSION['citas_admin'])) {
        citas_error('No has iniciado sesión.', 401);
    }
}
