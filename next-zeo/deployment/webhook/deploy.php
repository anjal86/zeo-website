<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
if ($documentRoot === '') {
    respond(500, ['ok' => false, 'error' => 'Webhook is not configured']);
}

$accountHome = (string) (getenv('HOME') ?: ($_SERVER['HOME'] ?? ''));
if ($accountHome === '' && function_exists('posix_getpwuid') && function_exists('posix_geteuid')) {
    $account = posix_getpwuid(posix_geteuid());
    $accountHome = is_array($account) ? (string) ($account['dir'] ?? '') : '';
}
if ($accountHome === '') {
    $accountHome = dirname($documentRoot);
}
$configPath = rtrim($accountHome, '/') . '/.config/zeo/deploy-webhook.php';
if (!is_readable($configPath)) {
    respond(500, ['ok' => false, 'error' => 'Webhook is not configured']);
}

$config = require $configPath;
$requiredConfig = ['secret', 'activation_script', 'app_root', 'env_file', 'node_bin', 'keep_releases'];
foreach ($requiredConfig as $key) {
    if (!is_array($config) || !isset($config[$key]) || !is_string($config[$key])) {
        respond(500, ['ok' => false, 'error' => 'Webhook configuration is invalid']);
    }
}

$timestampHeader = (string) ($_SERVER['HTTP_X_ZEO_TIMESTAMP'] ?? '');
$signatureHeader = strtolower((string) ($_SERVER['HTTP_X_ZEO_SIGNATURE'] ?? ''));
if (!preg_match('/^[0-9]{10}$/', $timestampHeader) || !preg_match('/^(?:sha256=)?[a-f0-9]{64}$/', $signatureHeader)) {
    respond(401, ['ok' => false, 'error' => 'Invalid authentication']);
}

$timestamp = (int) $timestampHeader;
if (abs(time() - $timestamp) > 300) {
    respond(401, ['ok' => false, 'error' => 'Request expired']);
}

$body = file_get_contents('php://input', false, null, 0, 4097);
if ($body === false || strlen($body) === 0 || strlen($body) > 4096) {
    respond(400, ['ok' => false, 'error' => 'Invalid request body']);
}

$providedSignature = str_starts_with($signatureHeader, 'sha256=')
    ? substr($signatureHeader, 7)
    : $signatureHeader;
$expectedSignature = hash_hmac('sha256', $timestampHeader . '.' . $body, $config['secret']);
if (!hash_equals($expectedSignature, $providedSignature)) {
    respond(401, ['ok' => false, 'error' => 'Invalid authentication']);
}

$request = json_decode($body, true);
$action = is_array($request) ? ($request['action'] ?? '') : '';
$release = is_array($request) ? strtolower((string) ($request['sha'] ?? '')) : '';
$checksum = is_array($request) ? strtolower((string) ($request['checksum'] ?? '')) : '';

if (!in_array($action, ['deploy', 'rollback'], true)) {
    respond(422, ['ok' => false, 'error' => 'Invalid action']);
}
if (!preg_match('/^[a-f0-9]{40}$/', $release)) {
    respond(422, ['ok' => false, 'error' => 'Invalid release']);
}
if ($action === 'deploy' && !preg_match('/^[a-f0-9]{64}$/', $checksum)) {
    respond(422, ['ok' => false, 'error' => 'Invalid checksum']);
}

if (!str_starts_with($config['app_root'], '/') || !is_executable($config['activation_script'])) {
    respond(500, ['ok' => false, 'error' => 'Activation script is unavailable']);
}

if ($action === 'deploy') {
    $archive = rtrim($config['app_root'], '/') . '/.deploy/incoming/' . $release . '.zip';
    if (!is_file($archive) || !hash_equals($checksum, (string) hash_file('sha256', $archive))) {
        respond(422, ['ok' => false, 'error' => 'Uploaded archive checksum does not match']);
    }
}

set_time_limit(420);
$command = [
    $config['activation_script'],
    $config['app_root'],
    $release,
    $config['env_file'],
    $config['node_bin'],
    $action,
    $config['keep_releases'],
    $checksum,
];
$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['pipe', 'w'],
    2 => ['pipe', 'w'],
];
$process = proc_open($command, $descriptors, $pipes, null, null, ['bypass_shell' => true]);
if (!is_resource($process)) {
    respond(500, ['ok' => false, 'error' => 'Could not start deployment']);
}

fclose($pipes[0]);
$stdout = stream_get_contents($pipes[1]);
$stderr = stream_get_contents($pipes[2]);
fclose($pipes[1]);
fclose($pipes[2]);
$exitCode = proc_close($process);

respond($exitCode === 0 ? 200 : ($exitCode === 75 ? 409 : 500), [
    'ok' => $exitCode === 0,
    'action' => $action,
    'release' => $release,
    'exitCode' => $exitCode,
    'output' => trim((string) $stdout),
    'error' => trim((string) $stderr),
]);
