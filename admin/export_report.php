<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$department_column = 'category';
$column_check = $conn->query("SHOW COLUMNS FROM requests LIKE 'department'");
if ($column_check && $column_check->num_rows > 0) {
    $department_column = 'department';
}
if ($column_check) {
    $column_check->free();
}

$summary_query = "
    SELECT
        COUNT(*) AS total_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_requests,
        SUM(CASE WHEN status IN ('Approved', 'Rejected') THEN 1 ELSE 0 END) AS completed_requests
    FROM requests
";
$summary_result = $conn->query($summary_query);
$summary = $summary_result ? $summary_result->fetch_assoc() : [
    'total_requests' => 0,
    'pending_requests' => 0,
    'completed_requests' => 0
];
if ($summary_result) {
    $summary_result->free();
}

$dept_query = "
    SELECT COALESCE(NULLIF(TRIM($department_column), ''), 'Unspecified') AS department, COUNT(*) AS total
    FROM requests
    GROUP BY department
    ORDER BY total DESC, department ASC
";
$dept_result = $conn->query($dept_query);

$details_query = "
    SELECT
        r.id,
        u.name AS requester_name,
        u.email AS requester_email,
        r.title,
        r.category,
        r.status,
        r.submitted_at
    FROM requests r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.submitted_at DESC
";
$details_result = $conn->query($details_query);

$filename = 'admin_report_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');

fputcsv($output, ['Summary']);
fputcsv($output, ['Total Requests', (int) ($summary['total_requests'] ?? 0)]);
fputcsv($output, ['Pending Requests', (int) ($summary['pending_requests'] ?? 0)]);
fputcsv($output, ['Completed Requests', (int) ($summary['completed_requests'] ?? 0)]);
fputcsv($output, []);

fputcsv($output, ['Requests Per Department']);
fputcsv($output, ['Department', 'Total']);
if ($dept_result) {
    while ($row = $dept_result->fetch_assoc()) {
        fputcsv($output, [$row['department'], (int) $row['total']]);
    }
    $dept_result->free();
}
fputcsv($output, []);

fputcsv($output, ['Request Details']);
fputcsv($output, ['Request ID', 'Requester Name', 'Requester Email', 'Title', 'Category', 'Status', 'Submitted At']);
if ($details_result) {
    while ($row = $details_result->fetch_assoc()) {
        fputcsv($output, [
            (int) $row['id'],
            $row['requester_name'],
            $row['requester_email'],
            $row['title'],
            $row['category'],
            $row['status'],
            $row['submitted_at']
        ]);
    }
    $details_result->free();
}

fclose($output);
exit();
?>
