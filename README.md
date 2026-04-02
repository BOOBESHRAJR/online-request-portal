# Online Information Request Portal

## 🚀 Live Demo
- **Frontend (Vercel)**: [https://online-request-portal.vercel.app](https://online-request-portal.vercel.app)
- **Backend (Render)**: [https://online-request-portal.onrender.com](https://online-request-portal.onrender.com)

## Overview
A high-performance, real-time MERN-stack SaaS dashboard designed for handling information requests, support tickets, and secure document sharing. This project has been modernized with a premium "Glassmorphism" UI, automatic live-syncing, and a robust binary-to-buffer file storage architecture.

## 🛠 Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Framer Motion (Animations), Lucide Icons
- **Backend**: Node.js, Express.js (REST API)
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT (JSON Web Tokens), Bcrypt.js, CORS Protection
- **Hosting**: Render (Backend & API), Vercel (Frontend & Static Assets)

## ✨ Modern Features

### 🔄 Real-Time "Live Sync" (New!)
- **Near-Live Chat**: Support conversations refresh every 3 seconds for a seamless messaging experience.
- **Auto-Updating Dashboards**: Your stats and request queue refresh every 15 seconds automatically.
- **Smart Retries**: Automatic connection handling for Render "Cold Starts" — if the server is asleep, the app waits and retries until connected.

### 📁 Advanced File Architecture
- **No Third-Party Bloat**: Removed Cloudinary to simplify architecture. Files are now stored directly in **MongoDB as binary Buffers**.
- **Secure Stream Proxy**: Documents are served through a secure backend proxy with token-gated access.
- **Instant Preview**: Built-in support for image previews and document downloads.

### 🎨 Premium UI/UX
- **App-Like Feel**: Split-screen layouts with independent scrolling for request details and chat.
- **Glassmorphism**: Modern frosted-glass components with fluid animations.
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile screens.

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_key
FRONTEND_URL=https://your-vercel-domain.app
```

### Frontend (Vercel Settings)
```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

## 🚀 Deployment Guide

### Phase 1: Backend (Render)
1. Link your GitHub to Render as a **Web Service**.
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. Add the `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` environment variables.

### Phase 2: Frontend (Vercel)
1. Import your Repo and select the `frontend/` folder as the **Root Directory**.
2. Add the `VITE_API_URL` environment variable.
3. Deploy!

## 🔧 Local Setup
1. Clone the repository.
2. Run `npm install` in both `backend/` and `frontend/` folders.
3. Start the backend: `cd backend && npm run dev`.
4. Start the frontend: `cd frontend && npm run dev`.
5. Access the app at `http://localhost:5173`.
