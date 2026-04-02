# Online Information Request Portal

## Overview
A modern, responsive MERN-stack web application designed for submitting, reviewing, and tracking information requests. The system supports separate user and admin flows, direct database-hosted document attachments, an admin review queue, a real-time messaging interface, protected routing, and robust analytics.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **File Storage**: MongoDB (stored as binary data/Buffers)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing

## Main Features

### User Experience
- **Secure Registration/Login**: Managed via JWT authentication.
- **Dynamic Dashboard**: Includes statistical breakdown of total, pending, approved, and rejected requests.
- **Request Creation**: Users can submit well-categorized requests with a description and up to 5 multi-format documents constraints.
- **Secure Storage**: Uploaded files are immediately processed and saved as binary data in MongoDB.
- **Request Status**: History table for tracking progress in real-time.

### Admin Experience
- **Privileged Access**: Only valid admins can access the admin-only routes.
- **Advanced Dashboard**: Features complete visibility of all system-wide request counts.
- **Data Review**: Admins can approve or reject tickets.
- **Documents Preview**: Seamless access to MongoDB-hosted items attached by applicants.

## Project Structure
```text
online_request_portal/
|-- backend/
|   |-- config/       # MongoDB Connection
|   |-- controllers/  # API Logic
|   |-- middleware/   # Authentication & Multer configs
|   |-- models/       # Mongoose Schemas (User, Request, Notification, Message)
|   |-- routes/       # Express Router instances
|   |-- server.js     # Entry point
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/ # Navbar, ProtectedRoutes
|   |   |-- context/    # User Auth Context
|   |   |-- pages/      # Login, Register, Dashboards, Create Request
|   |   |-- services/   # Axios instancing
|   |   |-- App.jsx     # Main React routes
|   |   `-- main.jsx
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- README.md
```

## Setup & Local Development

### Requirements
- Node.js (v16+)
- MongoDB locally installed or a MongoDB Atlas account

### Installation

1. Copy the project repository to your desired path.
2. Initialize **Backend**:
   ```bash
   cd backend
   npm install
   ```
3. Initialize **Frontend**:
   ```bash
   cd frontend
   npm install
   ```
4. Create an environment file at `backend/.env` containing:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/online_request_portal
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

### Running Locally

To launch the backend API:
```bash
cd backend
npm run dev
```

To launch the Vite frontend UI:
```bash
cd frontend
npm run dev
```

## Deployment Info
This structure is ready for cloud deployment. The backend `package.json` contains a unified `build` script (`npm install --prefix ../frontend && npm run build --prefix ../frontend`) allowing platforms like Render to build both stacks simultaneously and serve the static files dynamically through the Node instance in production.
