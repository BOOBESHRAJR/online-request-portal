<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'user') {
    header("Location: login.php");
    exit();
}

$user_id = (int) $_SESSION['user_id'];
$user_name = $_SESSION['name'];

// Request statistics for logged-in user
$stats_stmt = $conn->prepare("
    SELECT
        COUNT(*) AS total_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_requests,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_requests
    FROM requests
    WHERE user_id = ?
");
$stats_stmt->bind_param("i", $user_id);
$stats_stmt->execute();
$stats = $stats_stmt->get_result()->fetch_assoc();
$stats_stmt->close();

$total_requests = (int) ($stats['total_requests'] ?? 0);
$pending_requests = (int) ($stats['pending_requests'] ?? 0);
$approved_requests = (int) ($stats['approved_requests'] ?? 0);
$rejected_requests = (int) ($stats['rejected_requests'] ?? 0);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard - Online Request Portal</title>
    <link rel="stylesheet" href="../assets/style.css">
    <style>
        .welcome-banner {
            background: #f8fbfc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 16px;
            padding: 20px 24px;
            box-shadow: var(--shadow-1);
            margin-bottom: 22px;
        }
        .welcome-banner h2 {
            margin: 0 0 6px;
            font-size: 24px;
            color: var(--ink);
        }
        .welcome-banner p {
            margin: 0;
            color: var(--muted);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 26px;
        }
        .stat-card {
            border-radius: 16px;
            padding: 18px;
            color: #0f172a;
            box-shadow: var(--shadow-2);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .stat-card .icon {
            font-size: 20px;
            margin-bottom: 8px;
            display: inline-block;
        }
        .stat-card h4 {
            margin: 0;
            font-size: 14px;
            color: #334155;
            font-weight: 600;
        }
        .stat-card .count {
            margin-top: 6px;
            font-size: 30px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
        }
        .stat-total { background: linear-gradient(135deg, #e0f2fe, #f0f9ff); }
        .stat-pending { background: linear-gradient(135deg, #fef3c7, #fffbeb); }
        .stat-approved { background: linear-gradient(135deg, #dcfce7, #f0fdf4); }
        .stat-rejected { background: linear-gradient(135deg, #fee2e2, #fef2f2); }
        .help-card {
            margin-top: 26px;
            background: #f8fbfc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 16px;
            padding: 22px 24px;
            box-shadow: var(--shadow-1);
        }
        .help-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        .help-card ol {
            margin: 0;
            padding-left: 20px;
            color: var(--muted);
        }
        .help-card li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="container">
            <h1>User Dashboard</h1>
            <div class="user-info">
                <p>Welcome back, <strong><?php echo htmlspecialchars($user_name); ?></strong></p>
                <a href="logout.php" class="btn btn-secondary">Sign Out</a>
            </div>
        </div>
    </div>

    <main class="page">
    <div class="container">
        <section class="welcome-banner">
            <h2>Welcome, <?php echo htmlspecialchars($user_name); ?>!</h2>
            <p>Manage and track your information requests easily.</p>
        </section>

        <section class="stats-grid">
            <div class="stat-card stat-total">
                <span class="icon">📌</span>
                <h4>Total Requests</h4>
                <div class="count"><?php echo $total_requests; ?></div>
            </div>
            <div class="stat-card stat-pending">
                <span class="icon">⏳</span>
                <h4>Pending Requests</h4>
                <div class="count"><?php echo $pending_requests; ?></div>
            </div>
            <div class="stat-card stat-approved">
                <span class="icon">✅</span>
                <h4>Approved Requests</h4>
                <div class="count"><?php echo $approved_requests; ?></div>
            </div>
            <div class="stat-card stat-rejected">
                <span class="icon">❌</span>
                <h4>Rejected Requests</h4>
                <div class="count"><?php echo $rejected_requests; ?></div>
            </div>
        </section>

        <div class="dashboard-cards">
            <div class="card">
                <h3>Submit Request</h3>
                <p>Create a new information request and track its progress in real-time</p>
                <a href="submit_request.php" class="btn btn-primary">Submit New Request</a>
            </div>

            <div class="card">
                <h3>View Status</h3>
                <p>Check the status and details of all your submitted requests</p>
                <a href="view_status.php" class="btn btn-primary">View My Requests</a>
            </div>
        </div>

        <section class="help-card">
            <h3>How to Use the Portal</h3>
            <ol>
                <li>Submit a new request using the request form.</li>
                <li>Track the request status in the View Requests page.</li>
                <li>Receive notifications when the admin updates your request.</li>
                <li>Contact admin through the messaging feature if needed.</li>
            </ol>
        </section>
    </div>
    </main>
</body>
</html>
