<?php
/**
 * PUIG & ASOCIADOS — contact.php
 * Procesa el formulario "Solicitar una propuesta".
 * Compatible con hosting compartido Linux/cPanel (GoDaddy).
 *
 * Editar aquí el destinatario si cambia:
 */
$DESTINATARIO = 'administracion@puigyasociados.com';

/** Remitente técnico. Debe ser una casilla del MISMO dominio para que el hosting lo acepte. */
$REMITENTE    = 'no-reply@puigyasociados.com';

$LIMITE_ENVIOS   = 5;   // envíos permitidos...
$VENTANA_MINUTOS = 15;  // ...cada X minutos, por IP

// -------------------------------------------------------------
session_start();
$esAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']);

function responder($ok, $mensaje, $codigo = 200) {
    global $esAjax;
    http_response_code($codigo);
    if ($esAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $mensaje]);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $titulo = $ok ? 'Consulta enviada' : 'No pudimos enviar la consulta';
        echo '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
           . '<meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>' . $titulo . ' — Puig &amp; Asociados</title>'
           . '<style>body{font-family:system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;padding:2rem;color:#16211D}'
           . 'a{color:#1F6E51}main{max-width:34rem;text-align:center}</style></head><body><main>'
           . '<h1>' . $titulo . '</h1><p>' . htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8') . '</p>'
           . '<p><a href="index.html">Volver al sitio</a></p></main></body></html>';
    }
    exit;
}

/** Limpia texto: sin etiquetas, sin saltos de línea peligrosos en cabeceras. */
function limpiar($valor, $max) {
    $valor = is_string($valor) ? $valor : '';
    $valor = strip_tags($valor);
    $valor = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valor);
    $valor = trim(preg_replace('/\s+/u', ' ', $valor));
    return mb_substr($valor, 0, $max);
}

/** Limpia el mensaje conservando saltos de línea. */
function limpiarMensaje($valor, $max) {
    $valor = is_string($valor) ? $valor : '';
    $valor = strip_tags($valor);
    $valor = str_replace("\r\n", "\n", $valor);
    return mb_substr(trim($valor), 0, $max);
}

// 1. Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// 2. Honeypot: si viene completo, es un bot. Respondemos ok y descartamos.
if (!empty($_POST['sitio'])) {
    responder(true, 'Gracias.');
}

// 3. Rate limiting básico por sesión
$ahora = time();
if (!isset($_SESSION['envios']) || !is_array($_SESSION['envios'])) {
    $_SESSION['envios'] = [];
}
$_SESSION['envios'] = array_values(array_filter($_SESSION['envios'], function ($t) use ($ahora, $VENTANA_MINUTOS) {
    return $t > $ahora - ($VENTANA_MINUTOS * 60);
}));
if (count($_SESSION['envios']) >= $LIMITE_ENVIOS) {
    responder(false, 'Recibimos varias consultas desde este dispositivo. Probá nuevamente en unos minutos o escribinos por WhatsApp.', 429);
}

// 4. Recolección y validación server-side
$nombre   = limpiar($_POST['nombre']   ?? '', 80);
$telefono = limpiar($_POST['telefono'] ?? '', 30);
$email    = limpiar($_POST['email']    ?? '', 120);
$edificio = limpiar($_POST['edificio'] ?? '', 120);
$unidades = limpiar($_POST['unidades'] ?? '', 6);
$mensaje  = limpiarMensaje($_POST['mensaje'] ?? '', 2000);

$errores = [];
if ($nombre === '')   { $errores[] = 'nombre'; }
if ($telefono === '') { $errores[] = 'teléfono'; }
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errores[] = 'email'; }
if ($mensaje === '')  { $errores[] = 'mensaje'; }
if ($unidades !== '' && (!ctype_digit($unidades) || (int)$unidades < 1 || (int)$unidades > 9999)) {
    $errores[] = 'cantidad de unidades';
}

if ($errores) {
    responder(false, 'Revisá estos campos: ' . implode(', ', $errores) . '.', 422);
}

// 5. Armado del email
$asunto = 'Consulta web — ' . ($edificio !== '' ? $edificio : $nombre);
$asunto = limpiar($asunto, 120);

$cuerpo  = "Nueva consulta desde puigyasociados.com\n";
$cuerpo .= "-------------------------------------------\n\n";
$cuerpo .= "Nombre: {$nombre}\n";
$cuerpo .= "Teléfono: {$telefono}\n";
$cuerpo .= "Email: {$email}\n";
$cuerpo .= "Edificio: " . ($edificio !== '' ? $edificio : '(no indicado)') . "\n";
$cuerpo .= "Cantidad de unidades: " . ($unidades !== '' ? $unidades : '(no indicada)') . "\n\n";
$cuerpo .= "Mensaje:\n{$mensaje}\n\n";
$cuerpo .= "-------------------------------------------\n";
$cuerpo .= "Fecha: " . date('d/m/Y H:i') . "\n";
$cuerpo .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'desconocida') . "\n";

$cabeceras   = [];
$cabeceras[] = 'From: Puig & Asociados Web <' . $REMITENTE . '>';
$cabeceras[] = 'Reply-To: ' . $nombre . ' <' . $email . '>';
$cabeceras[] = 'Content-Type: text/plain; charset=UTF-8';
$cabeceras[] = 'MIME-Version: 1.0';
$cabeceras[] = 'X-Mailer: PHP/' . phpversion();

$enviado = @mail(
    $DESTINATARIO,
    '=?UTF-8?B?' . base64_encode($asunto) . '?=',
    $cuerpo,
    implode("\r\n", $cabeceras),
    '-f' . $REMITENTE
);

if (!$enviado) {
    responder(false, 'No pudimos enviar tu consulta. Podés comunicarte directamente por WhatsApp o email.', 500);
}

$_SESSION['envios'][] = $ahora;
responder(true, 'Gracias. Recibimos tu consulta y nos comunicaremos contigo.');
