<?php
/**
 * Automated Setup Script for Online Information Request Portal
 * This script creates the database and imports the schema
 */

// Database credentials
$servername = "localhost";
$username = "root";
$password = "";
$database = "online_request_portal";

// Connect to MySQL without specifying database
$conn = new mysqli($servername, $username, $password);

if ($conn->connect_error) {
    die("<div style='color: red; font-family: Arial; padding: 20px; background: #ffe0e0; border-radius: 5px;'>
        <h2>Connection Failed</h2>
        <p>Could not connect to MySQL: " . htmlspecialchars($conn->connect_error) . "</p>
        <p>Make sure MySQL is running and credentials are correct in this file.</p>
    </div>");
}

// Step 1: Create Database
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $database";
if ($conn->query($sql_create_db) !== TRUE) {
    die("<div style='color: red; font-family: Arial; padding: 20px; background: #ffe0e0; border-radius: 5px;'>
        <h2>Error Creating Database</h2>
        <p>" . htmlspecialchars($conn->error) . "</p>
    </div>");
}

// Step 2: Select Database
$conn->select_db($database);

// Step 3: Read and Execute Schema File
$schema_file = __DIR__ . '/db/schema.sql';
if (!file_exists($schema_file)) {
    die("<div style='color: red; font-family: Arial; padding: 20px; background: #ffe0e0; border-radius: 5px;'>
        <h2>Schema File Not Found</h2>
        <p>Could not find: $schema_file</p>
    </div>");
}

$schema_content = file_get_contents($schema_file);
$queries = array_filter(array_map('trim', explode(';', $schema_content)));

$errors = [];
$executed = 0;

foreach ($queries as $query) {
    if (empty($query)) continue;
    
    if (!$conn->query($query)) {
        // Ignore duplicate key errors - they're expected on re-run
        if (strpos($conn->error, 'Duplicate entry') === false) {
            $errors[] = $conn->error;
        }
    } else {
        $executed++;
    }
}

// Step 4: Ensure uploads directory exists
$uploads_dir = __DIR__ . '/uploads';
if (!is_dir($uploads_dir)) {
    @mkdir($uploads_dir, 0755, true);
}
$message_uploads_dir = $uploads_dir . '/messages';
if (!is_dir($message_uploads_dir)) {
    @mkdir($message_uploads_dir, 0755, true);
}

$conn->close();

// Display Results
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup - Online Request Portal</title>
    <style>
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            background: white;
            padding: 48px;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 700px;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #7c3aed);
        }
        h1 {
            color: #111827;
            margin-bottom: 32px;
            text-align: center;
            font-size: 32px;
            font-weight: 800;
        }
        .success {
            background: #f0fdf4;
            color: #15803d;
            padding: 20px;
            border-left: 4px solid #10b981;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .success strong {
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .success p {
            margin: 8px 0;
            font-size: 14px;
        }
        .error {
            background: #fef2f2;
            color: #991b1b;
            padding: 20px;
            border-left: 4px solid #ef4444;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .error strong {
            display: block;
            margin-bottom: 12px;
            font-size: 16px;
        }
        .error ul {
            margin-left: 20px;
        }
        .error li {
            margin: 6px 0;
            font-size: 14px;
        }
        .info {
            background: #eff6ff;
            color: #0c4a6e;
            padding: 20px;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .info strong {
            display: block;
            margin-bottom: 12px;
            font-size: 16px;
        }
        .info p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.6;
        }
        .info ol {
            margin-left: 20px;
            margin-top: 8px;
        }
        .info li {
            margin: 6px 0;
            font-size: 14px;
        }
        .button-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 40px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            cursor: pointer;
            text-decoration: none;
            font-weight: 700;
            transition: all 0.3s ease;
            display: inline-block;
            text-transform: uppercase;
        }
        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        .btn-secondary {
            background-color: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
        }
        .btn-secondary:hover {
            background-color: #e5e7eb;
            border-color: #d1d5db;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Setup Complete!</h1>
        
        <div class="success">
            <strong>✓ Database created successfully</strong>
            <p>Database name: <code><?php echo htmlspecialchars($database); ?></code></p>
            <p><?php echo $executed; ?> queries executed</p>
        </div>

        <?php if (!empty($errors)): ?>
            <div class="error">
                <strong>⚠ Some warnings:</strong>
                <ul>
                    <?php foreach ($errors as $error): ?>
                        <li><?php echo htmlspecialchars($error); ?></li>
                    <?php endforeach; ?>
                </ul>
                <p><em>(These are usually expected on re-runs)</em></p>
            </div>
        <?php endif; ?>

        <div class="info">
            <strong>� Security Note</strong>
            <p>No default accounts have been created. You must register a new user account or create an admin account manually.</p>
        </div>

        <div class="info">
            <strong>📋 Next Steps:</strong>
            <ol>
                <li>Click "Go to Home Page" to start using the portal</li>
                <li>Register new users via the registration form</li>
                <li>To create an admin account, manually insert a record into the users table with role='admin'</li>
                <li><strong>Important:</strong> Delete this setup.php file after first use for security</li>
            </ol>
        </div>

        <div class="button-group">
            <a href="index.php" class="btn btn-primary">Go to Home Page</a>
            <a href="admin/login.php" class="btn btn-secondary">Admin Login</a>
            <a href="user/login.php" class="btn btn-secondary">User Login</a>
        </div>
    </div>
</body>
</html>
