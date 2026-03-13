import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const ROLE_HOME = { admin: '/admin', donor: '/donor', inspector: '/inspector', recipient: '/recipient' };

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const role = await login(form.email, form.password);
            navigate(ROLE_HOME[role] || '/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🍱</div>
                    <h1>Hunger Relief Network</h1>
                </div>
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-sub">Sign in to your account to continue</p>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email" placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password" placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        <LogIn size={16} />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
