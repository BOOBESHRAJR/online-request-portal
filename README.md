# Online Information Request Portal

## Overview
A PHP and MySQL web application for submitting, reviewing, and tracking information requests. The system supports separate user and admin flows, request attachments, admin replies, in-app request conversations, notifications, analytics, and CSV reporting.

## Current Features

### User features
- User registration and login
- Dashboard with request statistics for total, pending, approved, and rejected requests
- Submit new requests with title, description, and category
- Upload multiple supporting documents with each request
- View request history with search and pagination
- Download previously uploaded supporting documents
- Open a request conversation thread and exchange messages with admin
- Upload message attachments in request conversations
- View admin replies directly from the request list
- Receive notification records when requests are submitted or updated

### Admin features
- Admin-only login and role-based access control
- Dashboard with total, pending, and completed request counts
- Status analytics and requests-per-department/category chart
- Review pending requests and approve or reject them
- Search pending and processed requests
- View attached documents submitted with requests
- Send admin replies tied to a request
- Open request chat threads with users
- Export request data as CSV
- View all registered users and roles

## Project Structure
```text
online_request_portal/
|-- admin/
|   |-- approved_rejected.php
|   |-- dashboard.php
|   |-- export_report.php
|   |-- login.php
|   |-- logout.php
|   `-- view_requests.php
|-- assets/
|   `-- style.css
|-- config/
|   `-- database.php
|-- db/
|   `-- schema.sql
|-- uploads/
|   `-- messages/
|-- user/
|   |-- dashboard.php
|   |-- login.php
|   |-- logout.php
|   |-- submit_request.php
|   `-- view_status.php
|-- document_download.php
|-- index.php
|-- login.php
|-- message_attachment_download.php
|-- register.php
|-- request_messages.php
|-- setup.php
`-- README.md
```

## Tech Stack
- PHP with MySQLi
- MySQL
- HTML, CSS, and vanilla JavaScript
- Session-based authentication

## Database Tables
The schema in `db/schema.sql` currently includes:

- `users`
- `requests`
- `documents`
- `notifications`
- `messages`

The `requests` table also stores `admin_reply` for direct staff feedback on a request.

## Local Setup

### Requirements
- XAMPP or another PHP + MySQL environment
- PHP 7.4+ recommended
- MySQL 5.7+ or MariaDB equivalent

### Installation
1. Copy the project into your web root, for example `C:\xampp\htdocs\online_request_portal`.
2. Create a MySQL database named `online_request_portal`.
3. Import `db/schema.sql`.
4. Update `config/database.php` if your local database credentials differ.
5. Make sure the `uploads/` directory is writable by PHP.
6. Open `http://localhost/online_request_portal/`.

### Optional setup helper
You can also run `setup.php` once to create the database objects and upload folders in a local XAMPP-style setup.

## Main Workflows

### User flow
1. Register an account.
2. Sign in from the user portal.
3. Submit a request, optionally with supporting files.
4. Track request progress from the status page.
5. Open the request conversation page to read updates or send a message.
6. Download attached documents when needed.

### Admin flow
1. Sign in from the admin portal.
2. Review pending requests.
3. Approve or reject a request.
4. Send replies or continue the request conversation.
5. Review processed requests and export reports.

## File Upload Support

### Request documents
- Multiple files allowed
- Accepted formats: `pdf`, `docx`, `jpg`, `jpeg`, `png`
- Maximum size: 5 MB per file

### Message attachments
- Accepted formats: `pdf`, `docx`, `jpg`, `jpeg`, `png`
- Maximum size: 5 MB per file

## Security Notes
- Passwords are hashed with `password_hash()`
- Passwords are checked with `password_verify()`
- Most database writes use prepared statements
- Sessions are used for authentication and role checks
- Users can access only their own requests and request files
- Uploaded files are renamed before storage
- Output is escaped with `htmlspecialchars()` in views

## Notes
- `setup.php`, `debug.php`, and `delete_sample_accounts.php` are utility scripts and should not be exposed in production.
- The app stores uploaded request documents in `uploads/` and chat attachments in `uploads/messages/`.
- If you deploy this project to a cloud host, persistent storage is required for the upload directories.
