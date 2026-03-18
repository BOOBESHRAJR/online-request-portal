<?php
session_start();
require_once 'config/database.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    http_response_code(403);
    exit('Access denied.');
}

$document_id = intval($_GET['id'] ?? 0);
if ($document_id <= 0) {
    http_response_code(400);
    exit('Invalid document id.');
}

$stmt = $conn->prepare("
    SELECT d.id, d.file_name, d.stored_name, r.user_id
    FROM documents d
    JOIN requests r ON d.request_id = r.id
    WHERE d.id = ?
");
$stmt->bind_param("i", $document_id);
$stmt->execute();
$result = $stmt->get_result();
$document = $result->fetch_assoc();
$stmt->close();

if (!$document) {
    http_response_code(404);
    exit('Document not found.');
}

$is_admin = ($_SESSION['role'] === 'admin');
$is_owner = ((int) $_SESSION['user_id'] === (int) $document['user_id']);
if (!$is_admin && !$is_owner) {
    http_response_code(403);
    exit('You are not allowed to download this file.');
}

$file_path = __DIR__ . '/uploads/' . $document['stored_name'];
if (!is_file($file_path)) {
    http_response_code(404);
    exit('File missing on server.');
}

$download_name = basename($document['file_name']);
$mime_type = function_exists('mime_content_type') ? mime_content_type($file_path) : 'application/octet-stream';

header('Content-Description: File Transfer');
header('Content-Type: ' . $mime_type);
header('Content-Disposition: attachment; filename="' . rawurlencode($download_name) . '"');
header('Content-Length: ' . filesize($file_path));
header('Cache-Control: private, must-revalidate');
header('Pragma: public');
header('Expires: 0');
readfile($file_path);
exit();
?>
