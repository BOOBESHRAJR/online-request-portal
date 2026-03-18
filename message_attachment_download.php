<?php
session_start();
require_once 'config/database.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    http_response_code(403);
    exit('Access denied.');
}

$message_id = intval($_GET['id'] ?? 0);
if ($message_id <= 0) {
    http_response_code(400);
    exit('Invalid message id.');
}

$stmt = $conn->prepare("
    SELECT m.attachment_name, m.attachment_stored_name, r.user_id
    FROM messages m
    JOIN requests r ON m.request_id = r.id
    WHERE m.id = ?
");
$stmt->bind_param("i", $message_id);
$stmt->execute();
$message = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$message || empty($message['attachment_stored_name'])) {
    http_response_code(404);
    exit('Attachment not found.');
}

$is_admin = ($_SESSION['role'] === 'admin');
$is_owner = ((int) $_SESSION['user_id'] === (int) $message['user_id']);
if (!$is_admin && !$is_owner) {
    http_response_code(403);
    exit('Not allowed.');
}

$file_path = __DIR__ . '/uploads/messages/' . $message['attachment_stored_name'];
if (!is_file($file_path)) {
    http_response_code(404);
    exit('File missing on server.');
}

$download_name = basename($message['attachment_name']);
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
