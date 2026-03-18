<?php
session_start();
require_once 'config/database.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    header("Location: login.php");
    exit();
}

function tableExists(mysqli $conn, string $table_name): bool
{
    $safe_name = $conn->real_escape_string($table_name);
    $result = $conn->query("SHOW TABLES LIKE '" . $safe_name . "'");
    if ($result === false) {
        return false;
    }
    $exists = $result->num_rows > 0;
    $result->free();
    return $exists;
}

function ensureMessagesTable(mysqli $conn): bool
{
    $sql = "
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT NOT NULL,
            sender_id INT NOT NULL,
            message_text TEXT NULL,
            attachment_name VARCHAR(255) NULL,
            attachment_stored_name VARCHAR(255) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_messages_request (request_id),
            INDEX idx_messages_created_at (created_at)
        )
    ";
    return $conn->query($sql) === true;
}

$messages_enabled = tableExists($conn, 'messages') || ensureMessagesTable($conn);
$request_id = intval($_GET['request_id'] ?? ($_POST['request_id'] ?? 0));
$user_id = (int) $_SESSION['user_id'];
$role = $_SESSION['role'];
$error = "";
$success_message = "";

if ($request_id <= 0) {
    http_response_code(400);
    exit('Invalid request ID.');
}

$request_stmt = $conn->prepare("SELECT r.id, r.user_id, r.title, r.details, r.category, r.status, r.submitted_at, u.name AS owner_name FROM requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?");
$request_stmt->bind_param("i", $request_id);
$request_stmt->execute();
$request_data = $request_stmt->get_result()->fetch_assoc();
$request_stmt->close();

if (!$request_data) {
    http_response_code(404);
    exit('Request not found.');
}

$is_admin = ($role === 'admin');
$is_owner = ((int) $request_data['user_id'] === $user_id);
if (!$is_admin && !$is_owner) {
    http_response_code(403);
    exit('You are not allowed to view this conversation.');
}

$back_url = $is_admin
    ? ((strtolower($request_data['status']) === 'pending') ? 'admin/view_requests.php' : 'admin/approved_rejected.php')
    : 'user/view_status.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$messages_enabled) {
        $error = "Messaging is temporarily unavailable.";
    } else {
        $message_text = trim($_POST['message_text'] ?? '');
        $attachment = $_FILES['attachment'] ?? null;
        $attachment_name = null;
        $stored_attachment_name = null;

        $max_file_size = 5 * 1024 * 1024;
        $allowed_extensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
        $allowed_mime_types = [
            'pdf' => ['application/pdf'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
            'jpg' => ['image/jpeg', 'image/pjpeg'],
            'jpeg' => ['image/jpeg', 'image/pjpeg'],
            'png' => ['image/png']
        ];

        if ($attachment && ($attachment['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            if ($attachment['error'] !== UPLOAD_ERR_OK) {
                $error = "Attachment upload failed.";
            } else {
                $attachment_name = $attachment['name'];
                $tmp_name = $attachment['tmp_name'];
                $file_size = (int) $attachment['size'];
                $extension = strtolower(pathinfo($attachment_name, PATHINFO_EXTENSION));

                if (!in_array($extension, $allowed_extensions, true)) {
                    $error = "Invalid attachment type. Allowed: PDF, DOCX, JPG, PNG.";
                } elseif ($file_size > $max_file_size) {
                    $error = "Attachment must be 5MB or smaller.";
                } else {
                    $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
                    if ($finfo) {
                        $detected_mime = finfo_file($finfo, $tmp_name);
                        finfo_close($finfo);
                        if (!in_array($detected_mime, $allowed_mime_types[$extension], true)) {
                            $error = "Invalid attachment content.";
                        }
                    }

                    if (empty($error)) {
                        $upload_dir = __DIR__ . '/uploads/messages';
                        if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
                            $error = "Unable to create message uploads directory.";
                        } elseif (!is_writable($upload_dir)) {
                            $error = "Message uploads directory is not writable.";
                        } else {
                            $stored_attachment_name = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
                            $target_path = $upload_dir . '/' . $stored_attachment_name;
                            if (!move_uploaded_file($tmp_name, $target_path)) {
                                $error = "Failed to save attachment.";
                            }
                        }
                    }
                }
            }
        }

        if (empty($error) && $message_text === '' && $stored_attachment_name === null) {
            $error = "Please enter a message or attach a file.";
        }

        if (empty($error)) {
            $insert_stmt = $conn->prepare("INSERT INTO messages (request_id, sender_id, message_text, attachment_name, attachment_stored_name) VALUES (?, ?, ?, ?, ?)");
            if (!$insert_stmt) {
                $error = "Unable to prepare message insert.";
            } else {
                $insert_stmt->bind_param("iisss", $request_id, $user_id, $message_text, $attachment_name, $stored_attachment_name);
                if ($insert_stmt->execute()) {
                    $insert_stmt->close();
                    header("Location: request_messages.php?request_id=" . $request_id . "&sent=1");
                    exit();
                }
                $error = "Failed to send message.";
                $insert_stmt->close();
            }

            if (!empty($stored_attachment_name)) {
                $uploaded_path = __DIR__ . '/uploads/messages/' . $stored_attachment_name;
                if (is_file($uploaded_path)) {
                    @unlink($uploaded_path);
                }
            }
        }
    }
}

if (isset($_GET['sent']) && $_GET['sent'] === '1') {
    $success_message = "Message sent.";
}

$messages = [];
if ($messages_enabled) {
    $messages_stmt = $conn->prepare("SELECT m.id, m.sender_id, m.message_text, m.attachment_name, m.created_at, COALESCE(u.name, 'Unknown User') AS sender_name, COALESCE(u.role, 'user') AS sender_role FROM messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.request_id = ? ORDER BY m.created_at ASC, m.id ASC");
    $messages_stmt->bind_param("i", $request_id);
    $messages_stmt->execute();
    $messages = $messages_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $messages_stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Messages - Online Request Portal</title>
    <link rel="stylesheet" href="assets/style.css">
    <style>
        .chat-section {
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
        }
        .chat-shell {
            background: #d4d3cd;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 22px;
            overflow: hidden;
            margin-top: 18px;
            box-shadow: var(--shadow-3);
        }
        .chat-header {
            background: linear-gradient(120deg, #0f3d3e 0%, #0b7285 65%, #0a5867 100%);
            color: #fff;
            padding: 12px 16px;
            font-weight: 700;
            font-size: 20px;
        }
        .chat-window {
            padding: 18px;
            min-height: 260px;
            max-height: 460px;
            overflow-y: auto;
        }
        .msg-row {
            display: flex;
            margin-bottom: 10px;
        }
        .msg-row.mine {
            justify-content: flex-end;
        }
        .msg-bubble {
            max-width: 78%;
            border-radius: 10px;
            padding: 8px 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.16);
            background: #ffffff;
            color: #111827;
        }
        .msg-row.mine .msg-bubble {
            background: #b7ddb0;
        }
        .msg-meta {
            font-size: 10px;
            color: #5f6368;
            margin-bottom: 4px;
        }
        .msg-text {
            white-space: pre-wrap;
            font-size: 13px;
            line-height: 1.45;
        }
        .msg-attach {
            margin-top: 6px;
            font-size: 12px;
        }
        .composer {
            padding: 12px;
            background: linear-gradient(180deg, #0f172a, #0b2230);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .composer-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .attach-btn {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid rgba(148, 163, 184, 0.4);
            color: #e2e8f0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 22px;
            line-height: 1;
            background: rgba(15, 23, 42, 0.35);
            user-select: none;
        }
        .chat-input {
            flex: 1;
            height: 44px;
            border-radius: 999px;
            border: 1px solid rgba(56, 189, 248, 0.2);
            background: linear-gradient(90deg, #1f2937, #223443);
            color: #f8fafc;
            padding: 10px 14px;
            resize: none;
            font-size: 16px;
            outline: none;
            font-family: inherit;
            line-height: 1.2;
        }
        .chat-input::placeholder {
            color: #9ca3af;
        }
        .send-btn {
            height: 34px;
            border-radius: 999px;
            padding: 0 14px;
            font-size: 14px;
        }
        .selected-file {
            margin-top: 8px;
            color: #cbd5e1;
            font-size: 12px;
        }
        @media (max-width: 768px) {
            .chat-header { font-size: 18px; }
            .chat-input { font-size: 14px; }
            .send-btn { font-size: 13px; }
            .selected-file { font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="container">
            <h1>Request Conversation</h1>
            <div class="user-info">
                <a href="<?php echo htmlspecialchars($back_url); ?>" class="btn btn-secondary">Back</a>
                <?php if ($is_admin): ?>
                    <a href="admin/logout.php" class="btn btn-secondary">Sign Out</a>
                <?php else: ?>
                    <a href="user/logout.php" class="btn btn-secondary">Sign Out</a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <main class="page">
    <div class="container">
        <section class="card">
            <h3>Request Details</h3>
            <p><strong>Title:</strong> <?php echo htmlspecialchars($request_data['title']); ?></p>
            <p><strong>Description:</strong> <?php echo nl2br(htmlspecialchars($request_data['details'])); ?></p>
            <p><strong>Date Submitted:</strong> <?php echo htmlspecialchars(date('M d, Y h:i A', strtotime($request_data['submitted_at']))); ?></p>
            <p><strong>Status:</strong> <?php echo htmlspecialchars($request_data['status']); ?></p>
            <p><strong>Category:</strong> <?php echo htmlspecialchars($request_data['category']); ?></p>
        </section>

        <?php if ($success_message): ?>
            <div class="alert alert-success" style="margin-top: 16px;"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert alert-error" style="margin-top: 16px;"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

    </div>
    </main>

    <script>
        (function () {
            var input = document.getElementById('attachment');
            var output = document.getElementById('selectedFile');
            if (input && output) {
                input.addEventListener('change', function () {
                    output.textContent = input.files && input.files.length ? ('Attached: ' + input.files[0].name) : '';
                });
            }
        })();
    </script>
</body>
</html>
