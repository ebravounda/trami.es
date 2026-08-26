<?php
/**
 * Configuración del sistema de citas.
 *
 * IMPORTANTE: cambia esta contraseña antes de publicar el sitio.
 * Es la única credencial que protege el panel de administración
 * (bat/citas/admin_api.php) donde se abren/cierran días y se ven
 * los datos de contacto de quienes han reservado cita.
 */

define('CITAS_ADMIN_PASSWORD', 'Tramilex-Citas-2026');

// Email donde se avisa de cada nueva cita (además de guardarse en
// bat/citas/data/agenda.json). Déjalo en blanco ('') para desactivar el aviso.
define('CITAS_NOTIFY_EMAIL', 'info@tramilex.es');

// Zona horaria de las franjas horarias (oficina de España).
define('CITAS_TIMEZONE', 'Europe/Madrid');
