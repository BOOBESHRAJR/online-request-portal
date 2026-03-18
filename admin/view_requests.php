<?php
session_start();
require_once '../config/database.php';

// Allow both admin and user to access this page
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || !in_array($_SESSION['role'], ['admin', 'user'], true)) {
    header("Location: login.php");
    exit();
}

$is_admin = ($_SESSION['role'] === 'admin');
$current_user_id = (int) $_SESSION['user_id'];
$action_message = "";

function tableExists(mysqli $conn, string $table_name): bool
{
    $safe = $conn->real_escape_string($table_name);
    $result = $conn->query("SHOW TABLES LIKE '" . $safe . "'");
    if ($result === false) {
        return false;
    }
    $exists = $result->num_rows > 0;
    $result->free();
    return $exists;
}

function notifyUser(mysqli $conn, int $user_id, int $request_id, string $title, string $message): void
{
    if (!tableExists($conn, 'notifications')) {
        return;
    }

    $stmt = $conn->prepare("INSERT INTO notifications (user_id, request_id, title, message) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        return;
    }
    $stmt->bind_param("iiss", $user_id, $request_id, $title, $message);
    $stmt->execute();
    $stmt->close();
}

// Admin actions only
if ($is_admin && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $request_id = intval($_POST['request_id'] ?? 0);
    $action = trim($_POST['action'] ?? '');

    if ($request_id > 0 && in_array($action, ['Approved', 'Rejected'], true)) {
        $info_stmt = $conn->prepare("SELECT user_id, title FROM requests WHERE id = ?");
        $info_stmt->bind_param("i", $request_id);
        $info_stmt->execute();
        $request_info = $info_stmt->get_result()->fetch_assoc();
        $info_stmt->close();

        if ($request_info) {
            $stmt = $conn->prepare("UPDATE requests SET status = ? WHERE id = ?");
            $stmt->bind_param("si", $action, $request_id);

            if ($stmt->execute()) {
                $action_message = "Request " . strtolower($action) . " successfully.";
                notifyUser($conn, (int) $request_info['user_id'], $request_id, "Request Status Updated", "Your request \"" . $request_info['title'] . "\" is now " . $action . ".");
            } else {
                $action_message = "Error processing request.";
            }
            $stmt->close();
        }
    } elseif ($request_id > 0 && $action === 'reply') {
        $reply_text = trim($_POST['admin_reply'] ?? '');
        if ($reply_text !== '') {
            $info_stmt = $conn->prepare("SELECT user_id, title FROM requests WHERE id = ?");
            $info_stmt->bind_param("i", $request_id);
            $info_stmt->execute();
            $request_info = $info_stmt->get_result()->fetch_assoc();
            $info_stmt->close();

            if ($request_info) {
                $reply_stmt = $conn->prepare("UPDATE requests SET admin_reply = ? WHERE id = ?");
                $reply_stmt->bind_param("si", $reply_text, $request_id);
                if ($reply_stmt->execute()) {
                    $action_message = "Reply sent successfully.";
                    notifyUser($conn, (int) $request_info['user_id'], $request_id, "Admin Reply", "Admin replied to your request \"" . $request_info['title'] . "\".");
                } else {
                    $action_message = "Failed to send reply.";
                }
                $reply_stmt->close();
            }
        }
    }
}

$search_term = trim($_GET['q'] ?? '');
$where_parts = [];
$params = [];
$types = "";

if ($is_admin) {
    // Keep existing admin behavior: pending requests page
    $where_parts[] = "r.status = 'Pending'";
} else {
    // User can search only their own requests
    $where_parts[] = "r.user_id = ?";
    $params[] = $current_user_id;
    $types .= "i";
}

if ($search_term !== '') {
    $where_parts[] = "(r.title LIKE ? OR r.category LIKE ? OR r.details LIKE ? OR r.status LIKE ?)";
    $like = '%' . $search_term . '%';
    array_push($params, $like, $like, $like, $like);
    $types .= "ssss";
}

$where_sql = implode(' AND ', $where_parts);
$sql = "
    SELECT r.*, u.name, u.email, u.phone
    FROM requests r
    JOIN users u ON r.user_id = u.id
    WHERE $where_sql
    ORDER BY r.submitted_at DESC
";

$stmt = $conn->prepare($sql);
if ($types !== '') {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$requests = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$documents_by_request = [];
if (tableExists($conn, 'documents') && !empty($requests)) {
    $request_ids = array_map(static function ($request) {
        return (int) $request['id'];
    }, $requests);
    $placeholders = implode(',', array_fill(0, count($request_ids), '?'));
    $doc_types = str_repeat('i', count($request_ids));

    $doc_sql = "SELECT id, request_id, file_name FROM documents WHERE request_id IN ($placeholders) ORDER BY uploaded_at DESC";
    $doc_stmt = $conn->prepare($doc_sql);
    $doc_stmt->bind_param($doc_types, ...$request_ids);
    $doc_stmt->execute();
    $doc_result = $doc_stmt->get_result();

    while ($document = $doc_result->fetch_assoc()) {
        $req_id = (int) $document['request_id'];
        if (!isset($documents_by_request[$req_id])) {
            $documents_by_request[$req_id] = [];
        }
        $documents_by_request[$req_id][] = $document;
    }
    $doc_stmt->close();
}

$back_dashboard = $is_admin ? 'dashboard.php' : '../user/dashboard.php';
$logout_link = $is_admin ? 'logout.php' : '../user/logout.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $is_admin ? 'Review Requests - Admin Portal' : 'View Requests - User Portal'; ?></title>
    <link rel="stylesheet" href="../assets/style.css">
    <style>
        .search-wrap {
            margin: 22px 0 18px;
            display: flex;
            justify-content: center;
        }
        .search-form {
            width: 100%;
            max-width: 760px;
            position: relative;
        }
        .search-form .icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            pointer-events: none;
            font-size: 14px;
        }
        .search-form input[type="text"] {
            width: 100%;
            height: 46px;
            border-radius: 999px;
            border: 1px solid rgba(15, 23, 42, 0.14);
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
            padding: 0 126px 0 40px;
            font-size: 14px;
            background: #fff;
        }
        .search-form input[type="text"]:focus {
            outline: none;
            border-color: rgba(11, 114, 133, 0.6);
            box-shadow: 0 0 0 4px rgba(11, 114, 133, 0.12), 0 8px 16px rgba(15, 23, 42, 0.08);
        }
        .search-form .btn {
            position: absolute;
            top: 50%;
            right: 6px;
            transform: translateY(-50%);
            border-radius: 999px;
            height: 34px;
            padding: 0 14px;
        }
        @media (max-width: 640px) {
            .search-form input[type="text"] {
                padding-right: 98px;
            }
            .search-form .btn {
                padding: 0 12px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="container">
            <h1><?php echo $is_admin ? 'Pending Requests' : 'My Requests'; ?></h1>
            <div class="user-info">
                <a href="<?php echo htmlspecialchars($back_dashboard); ?>" class="btn btn-secondary">Back to Dashboard</a>
                <a href="<?php echo htmlspecialchars($logout_link); ?>" class="btn btn-secondary">Sign Out</a>
            </div>
        </div>
    </div>

    <div class="container">
        <?php if ($action_message): ?>
            <div class="alert alert-success">
                <span><?php echo htmlspecialchars($action_message); ?></span>
            </div>
        <?php endif; ?>

        <div class="search-wrap">
            <form method="GET" action="" class="search-form">
                <span class="icon">??</span>
                <input type="text" name="q" value="<?php echo htmlspecialchars($search_term); ?>" placeholder="Search by title, category, description, or status">
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
        </div>

        <?php if (count($requests) === 0): ?>
            <div style="text-align: center; padding: 50px 20px;">
                <div class="alert alert-info">
                    <span>No matching requests found.</span>
                </div>
                <a href="<?php echo htmlspecialchars($is_admin ? 'dashboard.php' : '../user/submit_request.php'); ?>" class="btn btn-primary" style="margin-top: 20px;">
                    <?php echo $is_admin ? 'Back to Dashboard' : 'Submit New Request'; ?>
                </a>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="requests-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Requester</th>
                            <th>Contact</th>
                            <th>Request Title</th>
                            <th>Category</th>
                            <th>Submitted</th>
                            <?php if ($is_admin): ?><th>Action</th><?php else: ?><th>Status</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $serial = 1; foreach ($requests as $request): ?>
                            <tr>
                                <td><?php echo $serial++; ?></td>
                                <td><strong><?php echo htmlspecialchars($request['name']); ?></strong></td>
                                <td>
                                    <small>
                                        <div><?php echo htmlspecialchars($request['email']); ?></div>
                                        <div><?php echo htmlspecialchars($request['phone']); ?></div>
                                    </small>
                                </td>
                                <td>
                                    <strong><?php echo htmlspecialchars($request['title']); ?></strong>
                                    <br>
                                    <small style="color: #6b7280;">
                                        <?php echo htmlspecialchars(substr($request['details'], 0, 60)) . (strlen($request['details']) > 60 ? '...' : ''); ?>
                                    </small>
                                    <?php if (!empty($request['admin_reply'])): ?>
                                        <div style="margin-top: 8px; color: #0f3d3e;">
                                            <small><strong>Admin Reply:</strong> <?php echo htmlspecialchars($request['admin_reply']); ?></small>
                                        </div>
                                    <?php endif; ?>
                                    <?php $request_documents = $documents_by_request[(int) $request['id']] ?? []; ?>
                                    <?php if (!empty($request_documents)): ?>
                                        <div style="margin-top: 8px;">
                                            <small style="color: #0f172a; font-weight: 600;">Documents:</small>
                                            <div style="margin-top: 4px;">
                                                <?php foreach ($request_documents as $document): ?>
                                                    <a href="../document_download.php?id=<?php echo (int) $document['id']; ?>" style="display: inline-block; margin-right: 8px; margin-bottom: 4px;">
                                                        <?php echo htmlspecialchars($document['file_name']); ?>
                                                    </a>
                                                <?php endforeach; ?>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo htmlspecialchars($request['category']); ?></td>
                                <td><?php echo htmlspecialchars(date('M d, Y', strtotime($request['submitted_at']))); ?></td>
                                <?php if ($is_admin): ?>
                                    <td>
                                        <form method="POST" action="" style="display: flex; gap: 6px; margin-bottom: 8px;">
                                            <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">
                                            <button type="submit" name="action" value="Approved" class="btn btn-small btn-success">Approve</button>
                                            <button type="submit" name="action" value="Rejected" class="btn btn-small btn-danger">Reject</button>
                                        </form>
                                       
                                    </td>
                                <?php else: ?>
                                    <td>
                                        <span class="status-badge <?php echo strtolower($request['status']); ?>">
                                            <?php echo htmlspecialchars($request['status']); ?>
                                        </span>
                                        <div style="margin-top: 6px;">
                                            <a href="../request_messages.php?request_id=<?php echo (int) $request['id']; ?>" class="btn btn-small btn-secondary">Open Chat</a>
                                        </div>
                                    </td>
                                <?php endif; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
