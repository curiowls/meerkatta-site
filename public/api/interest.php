<?php
// Small first-party interest signal. Requires PHP 8+, storage outside the web root.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $status, array $body): never {
    http_response_code($status); echo json_encode($body); exit;
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET','POST'], true)) { header('Allow: GET, POST'); respond(405, ['error'=>'Method not allowed']); }
if ($method === 'POST') {
    $allowed = ['https://meerkatta.com','https://www.meerkatta.com'];
    if (getenv('MEERKATTA_DEV_ORIGIN')) $allowed[] = getenv('MEERKATTA_DEV_ORIGIN');
    if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', $allowed, true) || ($_SERVER['HTTP_X_MEERKATTA_INTEREST'] ?? '') !== '1') respond(403, ['error'=>'Origin rejected']);
    if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) respond(415, ['error'=>'JSON required']);
    $raw = file_get_contents('php://input', false, null, 0, 513);
    if (strlen($raw) > 512) respond(413, ['error'=>'Payload too large']);
    $input = json_decode($raw, true);
    if (!is_array($input) || ($input['feature'] ?? '') !== 'visual-capture' || !is_bool($input['interested'] ?? null)) respond(400, ['error'=>'Invalid vote']);
}
try {
    $webroot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: dirname(__DIR__);
    $directory = getenv('MEERKATTA_INTEREST_DIR') ?: dirname($webroot).'/meerkatta-interest-private';
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Storage unavailable');
    $resolved = realpath($directory);
    if (!$resolved || $resolved === $webroot || str_starts_with($resolved, $webroot.DIRECTORY_SEPARATOR)) throw new RuntimeException('Storage must be outside web root');
    $lock = fopen($resolved.'/votes.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Storage unavailable');
    $path = $resolved.'/votes.json';
    $state = is_file($path) ? json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR) : ['secret'=>bin2hex(random_bytes(32)), 'votes'=>[], 'limits'=>[]];
    $token = $_COOKIE['mk_interest'] ?? '';
    $validToken = preg_match('/^[a-f0-9]{64}$/D', $token) === 1;
    $key = $validToken ? hash_hmac('sha256', $token, $state['secret']) : '';
    if ($method === 'GET') respond(200, ['interested'=>isset($state['votes'][$key])]);
    $now = time();
    $state['limits'] = array_filter($state['limits'], fn($v) => $v['until'] > $now);
    $ipKey = hash_hmac('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown').gmdate('Y-m-d'), $state['secret']);
    $limit = $state['limits'][$ipKey] ?? ['count'=>0, 'until'=>$now+86400];
    if ($limit['count'] >= 30) { header('Retry-After: 86400'); respond(429, ['error'=>'Please try again later']); }
    $limit['count']++; $state['limits'][$ipKey]=$limit;
    if (!$validToken) { $token=bin2hex(random_bytes(32)); $key=hash_hmac('sha256',$token,$state['secret']); }
    if ($input['interested']) {
        if (count($state['votes']) >= 100000 && !isset($state['votes'][$key])) respond(503, ['error'=>'Voting temporarily unavailable']);
        $state['votes'][$key] = true;
    } else { unset($state['votes'][$key]); }
    // The stable lock covers read/modify/atomic-replace, preventing lost concurrent votes.
    $temp = tempnam($resolved, 'votes-');
    if (!$temp || file_put_contents($temp, json_encode($state, JSON_THROW_ON_ERROR)) === false) throw new RuntimeException('Write failed');
    chmod($temp,0600);
    if (!rename($temp,$path)) throw new RuntimeException('Write failed');
    setcookie('mk_interest',$token,['expires'=>$now+31536000,'path'=>'/api/','secure'=>!getenv('MEERKATTA_DEV_ORIGIN'),'httponly'=>true,'samesite'=>'Strict']);
    respond(200, ['interested'=>$input['interested']]);
} catch (Throwable $error) {
    error_log('MeerKatta interest storage unavailable');
    respond(503, ['error'=>'Voting temporarily unavailable']);
}
