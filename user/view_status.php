<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'user') {
    header("Location: login.php");
    exit();
}

$user_id = (int) $_SESSION['user_id'];

// Ensure admin_reply column exists (for older databases)
$admin_reply_exists = false;
$column_check = $conn->query("SHOW COLUMNS FROM requests LIKE 'admin_reply'");
if ($column_check !== false) {
    $admin_reply_exists = ($column_check->num_rows > 0);
    $column_check->free();
}
if (!$admin_reply_exists) {
    $conn->query("ALTER TABLE requests ADD COLUMN admin_reply TEXT");
    $column_check_retry = $conn->query("SHOW COLUMNS FROM requests LIKE 'admin_reply'");
    if ($column_check_retry !== false) {
        $admin_reply_exists = ($column_check_retry->num_rows > 0);
        $column_check_retry->free();
    }
}

$has_department_column = false;
$department_check = $conn->query("SHOW COLUMNS FROM requests LIKE 'department'");
if ($department_check !== false) {
    $has_department_column = ($department_check->num_rows > 0);
    $department_check->free();
}

$search_term = trim($_GET['q'] ?? '');
$page = max(1, intval($_GET['page'] ?? 1));
$per_page = 8;
$offset = ($page - 1) * $per_page;

$where_parts = ["user_id = ?"];
$params = [$user_id];
$types = "i";

if ($search_term !== '') {
    if ($has_department_column) {
        $where_parts[] = "(title LIKE ? OR details LIKE ? OR department LIKE ? OR status LIKE ? OR category LIKE ?)";
        $like = '%' . $search_term . '%';
        array_push($params, $like, $like, $like, $like, $like);
        $types .= "sssss";
    } else {
        $where_parts[] = "(title LIKE ? OR details LIKE ? OR category LIKE ? OR status LIKE ?)";
        $like = '%' . $search_term . '%';
        array_push($params, $like, $like, $like, $like);
        $types .= "ssss";
    }
}

$where_sql = implode(' AND ', $where_parts);

$count_stmt = $conn->prepare("SELECT COUNT(*) AS total FROM requests WHERE $where_sql");
$count_stmt->bind_param($types, ...$params);
$count_stmt->execute();
$total_rows = (int) ($count_stmt->get_result()->fetch_assoc()['total'] ?? 0);
$count_stmt->close();

$total_pages = max(1, (int) ceil($total_rows / $per_page));
if ($page > $total_pages) {
    $page = $total_pages;
    $offset = ($page - 1) * $per_page;
}

$department_select = $has_department_column
    ? "COALESCE(NULLIF(TRIM(department), ''), category) AS department_name"
    : "category AS department_name";

$select_sql = "SELECT id, title, details, category, submitted_at, status, $department_select";
if ($admin_reply_exists) {
    $select_sql .= ", admin_reply";
}
$select_sql .= " FROM requests WHERE $where_sql ORDER BY submitted_at DESC LIMIT ? OFFSET ?";

$stmt = $conn->prepare($select_sql);
$data_types = $types . "ii";
$data_params = $params;
$data_params[] = $per_page;
$data_params[] = $offset;
$stmt->bind_param($data_types, ...$data_params);
$stmt->execute();
$result = $stmt->get_result();
$requests = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$base_query = $search_term !== '' ? ('q=' . urlencode($search_term) . '&') : '';

$documents_by_request = [];
$documents_table_ready = false;
$documents_check = $conn->query("SHOW TABLES LIKE 'documents'");
if ($documents_check !== false) {
    $documents_table_ready = ($documents_check->num_rows > 0);
    $documents_check->free();
}

if (!$documents_table_ready) {
    $create_documents_sql = "
        CREATE TABLE IF NOT EXISTS documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NULL,
            stored_name VARCHAR(255) NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
        )
    ";
    $documents_table_ready = ($conn->query($create_documents_sql) === true);
}

if ($documents_table_ready && !empty($requests)) {
    $request_ids = array_map(static function ($request) {
        return (int) $request['id'];
    }, $requests);
    $placeholders = implode(',', array_fill(0, count($request_ids), '?'));
    $types_doc = str_repeat('i', count($request_ids));

    $doc_sql = "SELECT id, request_id, file_name FROM documents WHERE request_id IN ($placeholders) ORDER BY uploaded_at DESC";
    $doc_stmt = $conn->prepare($doc_sql);
    $doc_stmt->bind_param($types_doc, ...$request_ids);
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
    <title>View Requests - Online Request Portal</title>
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
            <h1>My Requests</h1>
            <div class="user-info">
                <a href="dashboard.php" class="btn btn-secondary">Back to Dashboard</a>
                <a href="logout.php" class="btn btn-secondary">Sign Out</a>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="search-wrap">
            <form method="GET" action="" class="search-form">
                <span class="icon">&#128269;</span>
                <input type="text" name="q" value="<?php echo htmlspecialchars($search_term); ?>" placeholder="Search by title, category, description, or status">
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
        </div>

        <?php if ($total_rows === 0): ?>
            <div style="text-align: center; padding: 60px 20px;">
                <div class="alert alert-info">
                    <span><?php echo $search_term === '' ? "You haven't submitted any requests yet." : "No matching requests found."; ?></span>
                </div>
                <?php if ($search_term === ''): ?>
                    <a href="submit_request.php" class="btn btn-primary" style="margin-top: 20px;">Submit Your First Request</a>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="table-container">
                <table class="requests-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Submitted Date</th>
                            <th>Status</th>
                            <th>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($requests as $request): ?>
                            <tr>
                                <td>
                                    <strong><?php echo htmlspecialchars($request['title']); ?></strong>
                                    <br>
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
                                <td><?php echo htmlspecialchars($request['department_name']); ?></td>
                                <td><?php echo htmlspecialchars(date('M d, Y', strtotime($request['submitted_at']))); ?></td>
                                <td>
                                    <span class="status-badge <?php echo strtolower($request['status']); ?>">
                                        <?php echo htmlspecialchars($request['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <a class="btn btn-small btn-secondary" href="../request_messages.php?request_id=<?php echo (int) $request['id']; ?>">view details</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <?php if ($total_pages > 1): ?>
                    <div style="display:flex; gap:8px; justify-content:center; margin-top:16px; flex-wrap:wrap;">
                        <?php if ($page > 1): ?>
                            <a class="btn btn-small btn-secondary" href="?<?php echo $base_query; ?>page=<?php echo $page - 1; ?>">Previous</a>
                        <?php endif; ?>
                        <span style="padding:8px 10px; color:#55636f;">Page <?php echo $page; ?> of <?php echo $total_pages; ?></span>
                        <?php if ($page < $total_pages): ?>
                            <a class="btn btn-small btn-secondary" href="?<?php echo $base_query; ?>page=<?php echo $page + 1; ?>">Next</a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="submit_request.php" class="btn btn-primary">Submit New Request</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
