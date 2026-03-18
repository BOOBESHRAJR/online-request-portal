<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'user') {
    header("Location: login.php");
    exit();
}

$user_id = (int) ($_SESSION['user_id'] ?? 0);
$register_id = $user_id; // Using user_id as register_id
$error = "";
$success = false;
$category = "";

$max_file_size = 5 * 1024 * 1024; // 5MB
$allowed_extensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
$allowed_mime_types = [
    'pdf' => ['application/pdf'],
    'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
    'jpg' => ['image/jpeg', 'image/pjpeg'],
    'jpeg' => ['image/jpeg', 'image/pjpeg'],
    'png' => ['image/png']
];

function tableExists(mysqli $conn, string $table_name): bool
{
    $safe_table_name = $conn->real_escape_string($table_name);
    $result = $conn->query("SHOW TABLES LIKE '" . $safe_table_name . "'");
    if ($result === false) {
        return false;
    }
    $exists = $result->num_rows > 0;
    $result->free();
    return $exists;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if ($user_id <= 0) {
        header("Location: login.php");
        exit();
    }

    // Validate authenticated user exists before request insert
    $user_check_stmt = $conn->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
    $user_check_stmt->bind_param("i", $user_id);
    $user_check_stmt->execute();
    $user_exists = $user_check_stmt->get_result()->num_rows === 1;
    $user_check_stmt->close();

    if (!$user_exists) {
        $error = "Invalid session. Please sign in again.";
    }

    $title = trim($_POST['title'] ?? '');
    $details = trim($_POST['details'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $documents = $_FILES['documents'] ?? null;
    $files_to_upload = [];
    
    // Validate inputs
    if (!empty($error)) {
        // Keep the authentication/session error
    } elseif (empty($title) || empty($details) || empty($category)) {
        $error = "All fields are required.";
    } else {
        // Validate uploaded documents if provided
        if ($documents && isset($documents['name']) && is_array($documents['name'])) {
            $file_count = count($documents['name']);
            $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;

            for ($i = 0; $i < $file_count; $i++) {
                $upload_error = $documents['error'][$i];
                if ($upload_error === UPLOAD_ERR_NO_FILE) {
                    continue;
                }
                if ($upload_error !== UPLOAD_ERR_OK) {
                    $error = "One of the uploaded files failed to upload.";
                    break;
                }

                $original_name = $documents['name'][$i];
                $tmp_name = $documents['tmp_name'][$i];
                $file_size = (int) $documents['size'][$i];
                $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

                if (!in_array($extension, $allowed_extensions, true)) {
                    $error = "Invalid file type. Allowed: PDF, DOCX, JPG, PNG.";
                    break;
                }
                if ($file_size > $max_file_size) {
                    $error = "Each file must be 5MB or smaller.";
                    break;
                }

                if ($finfo) {
                    $detected_mime = finfo_file($finfo, $tmp_name);
                    if (!in_array($detected_mime, $allowed_mime_types[$extension], true)) {
                        $error = "Invalid file content detected.";
                        break;
                    }
                }

                $files_to_upload[] = [
                    'original_name' => $original_name,
                    'tmp_name' => $tmp_name,
                    'extension' => $extension
                ];
            }

            if ($finfo) {
                finfo_close($finfo);
            }
        }

        if (empty($error)) {
            $uploads_dir = dirname(__DIR__) . '/uploads';
            if (!is_dir($uploads_dir) && !mkdir($uploads_dir, 0755, true)) {
                $error = "Unable to create uploads directory.";
            } elseif (!is_writable($uploads_dir)) {
                $error = "Uploads directory is not writable.";
            }
        }

        if (empty($error)) {
            $submitted_at = date('Y-m-d H:i:s');
            $status = 'Pending';
            $saved_files = [];
            $documents_table_exists = tableExists($conn, 'documents');
            $notifications_table_exists = tableExists($conn, 'notifications');

            try {
                $conn->begin_transaction();

                $stmt = $conn->prepare("INSERT INTO requests (user_id, register_id, title, details, category, submitted_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("iisssss", $user_id, $register_id, $title, $details, $category, $submitted_at, $status);
                $stmt->execute();
                $request_id = (int) $stmt->insert_id;
                $stmt->close();

                if ($notifications_table_exists) {
                    $notification_title = "Request Submitted";
                    $notification_message = "Your request \"" . $title . "\" has been submitted successfully and is pending review.";
                    $notif_stmt = $conn->prepare("INSERT INTO notifications (user_id, request_id, title, message) VALUES (?, ?, ?, ?)");
                    $notif_stmt->bind_param("iiss", $user_id, $request_id, $notification_title, $notification_message);
                    $notif_stmt->execute();
                    $notif_stmt->close();
                }

                if (!empty($files_to_upload)) {
                    if (!$documents_table_exists) {
                        throw new Exception("Document upload is not ready yet. Please run setup.php once and try again.");
                    }
                    $doc_stmt = $conn->prepare("INSERT INTO documents (request_id, file_name, stored_name) VALUES (?, ?, ?)");

                    foreach ($files_to_upload as $file) {
                        $stored_name = time() . '_' . bin2hex(random_bytes(8)) . '.' . $file['extension'];
                        $target_path = $uploads_dir . '/' . $stored_name;

                        if (!move_uploaded_file($file['tmp_name'], $target_path)) {
                            throw new Exception("Failed to store one of the uploaded files.");
                        }

                        $doc_stmt->bind_param("iss", $request_id, $file['original_name'], $stored_name);
                        $doc_stmt->execute();
                        $saved_files[] = $target_path;
                    }

                    $doc_stmt->close();
                }

                $conn->commit();
                $success = true;
            } catch (Throwable $e) {
                $conn->rollback();

                foreach ($saved_files as $saved_file) {
                    if (is_file($saved_file)) {
                        @unlink($saved_file);
                    }
                }

                $error = $e->getMessage() ?: "Failed to submit request. Please try again.";
            }
        }
    }
}

if ($success) {
    $title = "";
    $details = "";
    $category = "";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submit Request - Online Request Portal</title>
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
    <div class="navbar">
        <div class="container">
            <h1>📋 Submit Request</h1>
            <div class="user-info">
                <a href="dashboard.php" class="btn btn-secondary">← Dashboard</a>
                <a href="logout.php" class="btn btn-secondary">Sign Out</a>
            </div>
        </div>
    </div>
    <main class="page">
        <?php if ($success): ?>
            <div class="modal-overlay active" id="successModal">
                <div class="modal">
                    <h2>✓ Success!</h2>
                    <p>Your request has been submitted successfully and is now pending review.</p>
                    <div class="modal-buttons">
                        <button onclick="submitAnother()" class="btn btn-primary">Submit Another</button>
                        <button onclick="viewRequests()" class="btn btn-secondary">View My Requests</button>
                        <button onclick="goToDashboard()" class="btn btn-secondary">Return to Dashboard</button>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        
        <div class="container">
            <div class="form-container" style="max-width: 600px;">
            <?php if ($error): ?>
                <div class="alert alert-error">
                    <span>⚠️</span>
                    <span><?php echo htmlspecialchars($error); ?></span>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="title">Request Title</label>
                    <input type="text" id="title" name="title" placeholder="Brief title for your request" required value="<?php echo htmlspecialchars($title ?? ''); ?>">
                </div>
                
                <div class="form-group">
                    <label for="details">Detailed Description</label>
                    <textarea id="details" name="details" placeholder="Provide detailed information about your request..." required><?php echo htmlspecialchars($details ?? ''); ?></textarea>
                </div>
                
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" name="category" required>
                        <option value="" disabled <?php echo empty($category) ? 'selected' : ''; ?>>Select Category</option>
                        <option value="Service Delay" <?php echo ($category === 'Service Delay') ? 'selected' : ''; ?>>Service Delay</option>
                        <option value="Technical Issue" <?php echo ($category === 'Technical Issue') ? 'selected' : ''; ?>>Technical Issue</option>
                        <option value="Document Request" <?php echo ($category === 'Document Request') ? 'selected' : ''; ?>>Document Request</option>
                        <option value="Information Clarification" <?php echo ($category === 'Information Clarification') ? 'selected' : ''; ?>>Information Clarification</option>
                        <option value="Complaint / Grievance" <?php echo ($category === 'Complaint / Grievance') ? 'selected' : ''; ?>>Complaint / Grievance</option>
                        <option value="General Inquiry" <?php echo ($category === 'General Inquiry') ? 'selected' : ''; ?>>General Inquiry</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="documents">Supporting Documents (Optional)</label>
                    <input type="file" id="documents" name="documents[]" multiple accept=".pdf,.docx,.jpg,.jpeg,.png">
                    <small style="display:block; color:#55636f; margin-top:6px;">Allowed: PDF, DOCX, JPG, PNG. Max 5MB per file.</small>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%; text-align: center;">Submit Request</button>
            </form>
            </div>
        </div>
    
    </main>
    <script>
        function submitAnother() {
            location.reload();
        }
        
        function viewRequests() {
            window.location.href = 'view_status.php';
        }
        
        function goToDashboard() {
            window.location.href = 'dashboard.php';
        }
    </script>
</body>
</html>
