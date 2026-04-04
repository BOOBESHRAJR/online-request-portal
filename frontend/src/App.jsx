import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import Settings from './pages/Settings';
import Support from './pages/Support';
import EditRequest from './pages/EditRequest';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { borderRadius: '12px', background: '#ffffff', color: '#1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
        }} 
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout><UserDashboard /></Layout>} path="/dashboard" />
          <Route element={<Layout><CreateRequest /></Layout>} path="/create-request" />
          <Route element={<Layout><AdminDashboard /></Layout>} path="/admin" />
          <Route element={<Layout><RequestDetails /></Layout>} path="/request/:id" />
          <Route element={<Layout><EditRequest /></Layout>} path="/edit-request/:id" />
          <Route element={<Layout><Settings /></Layout>} path="/settings" />
          <Route element={<Layout><Support /></Layout>} path="/support" />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
