<?php
require_once __DIR__ . '/lib.php';

session_start();
$_SESSION = [];
session_destroy();

citas_json_response(['ok' => true]);
