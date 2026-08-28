<?php
require_once __DIR__ . '/lib.php';

session_start();
$_SESSION = [];
session_destroy();

settings_json_response(['ok' => true]);
