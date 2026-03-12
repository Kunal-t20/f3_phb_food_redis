import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DonorDashboard from './pages/donor/DonorDashboard';
import InspectorDashboard from './pages/inspector/InspectorDashboard';
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/donor" element={
            <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
          } />
          <Route path="/inspector" element={
            <ProtectedRoute role="inspector"><InspectorDashboard /></ProtectedRoute>
          } />
          <Route path="/recipient" element={
            <ProtectedRoute role="recipient"><RecipientDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
