<?php
/**
 * PHP Reverse Proxy to Node.js (port 3000)
 * Bridges Cloudways Apache → Node.js Express server
 */

$nodeUrl = 'http://127.0.0.1:3000';
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Build target URL
$target = $nodeUrl . $requestUri;

// Initialize cURL
$ch = curl_init($target);

// Forward request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);

// Forward request body for POST/PUT
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'multipart/form-data') !== false) {
        // Handle file uploads
        $postFields = [];
        foreach ($_FILES as $key => $fileGroup) {
            if (is_array($fileGroup['name'])) {
                for ($i = 0; $i < count($fileGroup['name']); $i++) {
                    if ($fileGroup['error'][$i] === UPLOAD_ERR_OK) {
                        $postFields[$key . '[' . $i . ']'] = new CURLFile(
                            $fileGroup['tmp_name'][$i],
                            $fileGroup['type'][$i],
                            $fileGroup['name'][$i]
                        );
                    }
                }
            } else {
                if ($fileGroup['error'] === UPLOAD_ERR_OK) {
                    $postFields[$key] = new CURLFile(
                        $fileGroup['tmp_name'],
                        $fileGroup['type'],
                        $fileGroup['name']
                    );
                }
            }
        }
        foreach ($_POST as $key => $value) {
            $postFields[$key] = $value;
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } else {
        // Forward raw body (JSON, etc.)
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: ' . $contentType,
            'Content-Length: ' . strlen($body)
        ]);
    }
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo "Node.js server unreachable: " . htmlspecialchars($error);
    exit;
}

// Parse response headers and body
$headerStr = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

// Forward response status
http_response_code($httpCode);

// Forward response headers
$headers = explode("\r\n", $headerStr);
foreach ($headers as $header) {
    $header = trim($header);
    if (empty($header)) continue;
    if (stripos($header, 'HTTP/') === 0) continue;
    if (stripos($header, 'Transfer-Encoding:') === 0) continue;
    if (stripos($header, 'Connection:') === 0) continue;
    header($header);
}

// Output response body
echo $body;
