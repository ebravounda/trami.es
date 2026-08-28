<?php
require_once __DIR__ . '/lib.php';

if (session_status() !== PHP_SESSION_ACTIVE) session_start();
settings_json_response(['ok' => true, 'logged_in' => !empty($_SESSION['tramilex_admin'])]);
