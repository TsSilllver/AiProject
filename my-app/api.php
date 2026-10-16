<?php
// api.php — прокси для GigaChat

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ⚠️ Authorization Key из Студии Сбера
$authKey = 'MDFhMTQwNWQtY2NkMi03OTQ2LTlkYTctMzNhNDE5ZWQxNmFiOmUwZDQxZjhlLWQyM2EtNDM5Ny05ODFhLWQwMjVkYjc2OWRjMQ==';

// ===== Шаг 1: Получаем Access Token =====

// Генерируем UUID v4 правильно
function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$ch = curl_init('https://ngw.devices.sberbank.ru:9443/api/v2/oauth');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'scope=GIGACHAT_API_PERS');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json',
    'RqUID: ' . generateUuid(),
    'Authorization: Basic ' . $authKey,
]);

// НЕ отключаем SSL — используем сертификат из php.ini
// (если локально не работает, можно временно вернуть false)

$tokenResponse = curl_exec($ch);

if ($tokenResponse === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'cURL error при получении токена',
        'curl_error' => curl_error($ch),
    ]);
    exit;
}

$tokenData = json_decode($tokenResponse, true);
$accessToken = $tokenData['access_token'] ?? null;

if (!$accessToken) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Не удалось получить токен',
        'raw' => $tokenResponse,
    ]);
    exit;
}

// ===== Шаг 2: Отправляем запрос в GigaChat =====

$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректное тело запроса']);
    exit;
}

// Указываем модель
$data['model'] = 'GigaChat-3-Ultra';

$ch2 = curl_init('https://api.giga.chat/v1/chat/completions');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $accessToken,
    'User-Agent: Argumentum/1.0',
]);

$response = curl_exec($ch2);

if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'cURL error при запросе к модели',
        'curl_error' => curl_error($ch2),
    ]);
    exit;
}

$httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);

http_response_code($httpCode);
echo $response;