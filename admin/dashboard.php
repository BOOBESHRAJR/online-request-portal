<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$admin_name = $_SESSION['name'];

// Core counts
$total_stmt = $conn->prepare("SELECT COUNT(*) AS count FROM requests");
$total_stmt->execute();
$total_count = (int) ($total_stmt->get_result()->fetch_assoc()['count'] ?? 0);
$total_stmt->close();

$pending_stmt = $conn->prepare("SELECT COUNT(*) AS count FROM requests WHERE status = 'Pending'");
$pending_stmt->execute();
$pending_count = (int) ($pending_stmt->get_result()->fetch_assoc()['count'] ?? 0);
$pending_stmt->close();

$completed_stmt = $conn->prepare("SELECT COUNT(*) AS count FROM requests WHERE status IN ('Approved', 'Rejected')");
$completed_stmt->execute();
$completed_count = (int) ($completed_stmt->get_result()->fetch_assoc()['count'] ?? 0);
$completed_stmt->close();

// Detect department column; fallback to category
$department_column = 'category';
$column_check = $conn->query("SHOW COLUMNS FROM requests LIKE 'department'");
if ($column_check && $column_check->num_rows > 0) {
    $department_column = 'department';
}
if ($column_check) {
    $column_check->free();
}

$dept_query = "
    SELECT COALESCE(NULLIF(TRIM($department_column), ''), 'Unspecified') AS department, COUNT(*) AS total
    FROM requests
    GROUP BY department
    ORDER BY total DESC, department ASC
";
$dept_result = $conn->query($dept_query);
$department_stats = [];
$max_dept_count = 0;
if ($dept_result) {
    while ($row = $dept_result->fetch_assoc()) {
        $department_stats[] = [
            'department' => $row['department'],
            'total' => (int) $row['total']
        ];
        if ((int) $row['total'] > $max_dept_count) {
            $max_dept_count = (int) $row['total'];
        }
    }
    $dept_result->free();
}

// Users table
$users_stmt = $conn->prepare("SELECT id, name, email, role FROM users ORDER BY id DESC");
$users_stmt->execute();
$users_result = $users_stmt->get_result();

$status_total = max(1, $total_count);
$pending_percent = round(($pending_count / $status_total) * 100, 1);
$completed_percent = round(($completed_count / $status_total) * 100, 1);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Online Request Portal</title>
    <link rel="stylesheet" href="../assets/style.css">
    <style>
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-top: 28px;
        }
        .chart-card {
            background: #fff;
            border-radius: 18px;
            padding: 24px;
            box-shadow: var(--shadow-2);
            border: 1px solid rgba(15, 23, 42, 0.06);
        }
        .chart-title {
            font-size: 20px;
            margin-bottom: 14px;
            color: var(--ink);
        }
        .status-track {
            height: 14px;
            border-radius: 999px;
            overflow: hidden;
            background: #e2e8f0;
            display: flex;
            margin-bottom: 14px;
        }
        .status-pending {
            background: linear-gradient(90deg, #d97706, #b45309);
        }
        .status-completed {
            background: linear-gradient(90deg, #16a34a, #15803d);
        }
        .legend-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: var(--muted);
            font-size: 14px;
        }
        .dept-row {
            margin-bottom: 12px;
        }
        .dept-head {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: var(--ink);
            margin-bottom: 6px;
        }
        .dept-bar-wrap {
            height: 10px;
            border-radius: 999px;
            background: #e2e8f0;
            overflow: hidden;
        }
        .dept-bar {
            height: 100%;
            background: linear-gradient(90deg, #0b7285, #0f3d3e);
        }
        .actions-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="container">
            <h1>Admin Dashboard</h1>
            <div class="user-info">
                <p>Welcome, <strong><?php echo htmlspecialchars($admin_name); ?></strong></p>
                <a href="logout.php" class="btn btn-secondary">Sign Out</a>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="dashboard-cards">
            <div class="card">
                <h3>Total Requests</h3>
                <p class="card-count"><?php echo $total_count; ?></p>
                <p>All requests received in the portal</p>
            </div>

            <div class="card">
                <h3>Pending Requests</h3>
                <p class="card-count"><?php echo $pending_count; ?></p>
                <p>Requests awaiting your review</p>
                <a href="view_requests.php" class="btn btn-primary">Review Requests</a>
            </div>

            <div class="card">
                <h3>Completed Requests</h3>
                <p class="card-count"><?php echo $completed_count; ?></p>
                <p>Approved and rejected requests</p>
                <a href="approved_rejected.php" class="btn btn-primary">View Completed</a>
            </div>
        </div>

        <div class="analytics-grid">
            <section class="chart-card">
                <h2 class="chart-title">Request Status Chart</h2>
                <div class="status-track">
                    <div class="status-pending" style="width: <?php echo $pending_percent; ?>%;"></div>
                    <div class="status-completed" style="width: <?php echo $completed_percent; ?>%;"></div>
                </div>
                <div class="legend-row"><span>Pending</span><strong><?php echo $pending_count; ?> (<?php echo $pending_percent; ?>%)</strong></div>
                <div class="legend-row"><span>Completed</span><strong><?php echo $completed_count; ?> (<?php echo $completed_percent; ?>%)</strong></div>
            </section>

            <section class="chart-card">
                <h2 class="chart-title">Requests Per Department</h2>
                <?php if (empty($department_stats)): ?>
                    <p style="color: var(--muted);">No request data available yet.</p>
                <?php else: ?>
                    <?php foreach ($department_stats as $item): ?>
                        <?php $width = $max_dept_count > 0 ? round(($item['total'] / $max_dept_count) * 100, 1) : 0; ?>
                        <div class="dept-row">
                            <div class="dept-head">
                                <span><?php echo htmlspecialchars($item['department']); ?></span>
                                <strong><?php echo $item['total']; ?></strong>
                            </div>
                            <div class="dept-bar-wrap">
                                <div class="dept-bar" style="width: <?php echo $width; ?>%;"></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </section>
        </div>

        <div class="actions-row">
            <a href="export_report.php" class="btn btn-primary">Export Report CSV</a>
        </div>

        <div class="table-container" style="margin-top: 36px;">
            <h2 style="margin-bottom: 12px;">All Users and Roles</h2>
            <table class="requests-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($users_result->num_rows > 0): ?>
                        <?php while ($user = $users_result->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo (int) $user['id']; ?></td>
                                <td><strong><?php echo htmlspecialchars($user['name']); ?></strong></td>
                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                <td>
                                    <span class="status-badge <?php echo strtolower($user['role']) === 'admin' ? 'approved' : 'pending'; ?>">
                                        <?php echo htmlspecialchars(ucfirst($user['role'])); ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="4">No users found.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php $users_stmt->close(); ?>
</body>
</html>
