import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
    admin: '/admin',
    donor: '/donor',
    inspector: '/inspector',
    recipient: '/recipient',
};

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // If wrong role, redirect to own dashboard
    if (role && user.role !== role) {
        return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
    }

    return children;
}
