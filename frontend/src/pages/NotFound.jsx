import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px',
            background: 'var(--bg)',
        }}>
            <div style={{ fontSize: '5rem' }}>🍽️</div>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-muted)' }}>404</h1>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>
                The page you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
        </div>
    );
}
