<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$action_message = "";

function notifyUser(mysqli $conn, int $user_id, int $request_id, string $title, string $message): void
{
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, request_id, title, message) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $user_id, $request_id, $title, $message);
    $stmt->execute();
    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $request_id = intval($_POST['request_id'] ?? 0);
    $action = trim($_POST['action'] ?? '');

    if ($request_id > 0 && $action === 'reply') {
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
                    $title = "Admin Reply";
                    $message = "Admin replied to your request \"" . $request_info['title'] . "\".";
                    notifyUser($conn, (int) $request_info['user_id'], $request_id, $title, $message);
                } else {
                    $action_message = "Failed to send reply.";
                }
                $reply_stmt->close();
            }
        }
    }
}

$search_term = trim($_GET['q'] ?? '');
$where_sql = "r.status IN ('Approved', 'Rejected')";
$params = [];
$types = "";

if ($search_term !== '') {
    $where_sql .= " AND (r.title LIKE ? OR r.category LIKE ? OR r.details LIKE ? OR r.status LIKE ?)";
    $like = '%' . $search_term . '%';
    array_push($params, $like, $like, $like, $like);
    $types = "ssss";
}

// Fetch processed requests (Approved or Rejected status)
$sql = "
    SELECT r.*, u.name, u.email
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
$result = $stmt->get_result();
$requests = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$documents_by_request = [];
if (!empty($requests)) {
    $request_ids = array_map(static function ($request) {
        return (int) $request['id'];
    }, $requests);
    $placeholders = implode(',', array_fill(0, count($request_ids), '?'));
    $types = str_repeat('i', count($request_ids));

    $doc_sql = "SELECT id, request_id, file_name FROM documents WHERE request_id IN ($placeholders) ORDER BY uploaded_at DESC";
    $doc_stmt = $conn->prepare($doc_sql);
    $doc_stmt->bind_param($types, ...$request_ids);
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processed Requests - Admin Portal</title>
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
            <h1>Processed Requests</h1>
            <div class="user-info">
                <a href="dashboard.php" class="btn btn-secondary">Back to Dashboard</a>
                <a href="logout.php" class="btn btn-secondary">Sign Out</a>
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
                <span class="icon">&#128269;</span>
                <input type="text" name="q" value="<?php echo htmlspecialchars($search_term); ?>" placeholder="Search by title, category, description, or status">
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
        </div>

        <?php if (count($requests) === 0): ?>
            <div style="text-align: center; padding: 60px 20px;">
                <div class="alert alert-info">
                    <span>No matching requests found.</span>
                </div>
                <a href="dashboard.php" class="btn btn-primary" style="margin-top: 20px;">Back to Dashboard</a>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="requests-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Requester</th>
                            <th>Email</th>
                            <th>Request Title</th>
                            <th>Category</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $serial = 1; foreach ($requests as $request): ?>
                            <tr>
                                <td><?php echo $serial++; ?></td>
                                <td>
                                    <strong><?php echo htmlspecialchars($request['name']); ?></strong>
                                </td>
                                <td><?php echo htmlspecialchars($request['email']); ?></td>
                                <td>
                                    <strong><?php echo htmlspecialchars($request['title']); ?></strong>
                                </td>
                                <td><?php echo htmlspecialchars($request['category']); ?></td>
                                <td><?php echo htmlspecialchars(date('M d, Y', strtotime($request['submitted_at']))); ?></td>
                                <td>
                                    <span class="status-badge <?php echo strtolower($request['status']); ?>">
                                        <?php echo htmlspecialchars($request['status']); ?>
                                    </span>
                                </td>
                                <td style="min-width: 220px;">
                                    <form method="POST" action="">
                                        <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">
                                    </form>
                                    <a href="../request_messages.php?request_id=<?php echo (int) $request['id']; ?>" class="btn btn-small btn-secondary" style="width: 60%; margin-top: 6px;">view details</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
