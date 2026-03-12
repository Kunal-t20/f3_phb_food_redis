import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const ROLE_HOME = { admin: '/admin', donor: '/donor', inspector: '/inspector', recipient: '/recipient' };

export default function Register() {
    const { register, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullname: '', email: '', password: '', role: 'donor' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await register(form);
            // Auto-login after registration
            const role = await login(form.email, form.password);
            navigate(ROLE_HOME[role] || '/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    const roles = [
        { value: 'donor', label: '🍎 Donor', desc: 'Donate surplus food' },
        { value: 'recipient', label: '🙏 Recipient', desc: 'Claim available food' },
        { value: 'inspector', label: '🔍 Inspector', desc: 'Inspect food quality' },
    ];

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🍱</div>
                    <h1>FoodShare</h1>
                </div>
                <h2 className="auth-title">Create account</h2>
                <p className="auth-sub">Join the food redistribution network</p>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text" placeholder="Your full name"
                            value={form.fullname}
                            onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                            required
                        />
                    </div>
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
                            type="password" placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {roles.map(r => (
                                <button
                                    key={r.value} type="button"
                                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                                    style={{
                                        padding: '10px 8px', borderRadius: '10px', cursor: 'pointer',
                                        border: form.role === r.value
                                            ? '1px solid var(--role-primary,#8B5CF6)'
                                            : '1px solid var(--glass-border)',
                                        background: form.role === r.value
                                            ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
                                        color: form.role === r.value ? 'var(--role-primary,#8b5cf6)' : 'var(--text-muted)',
                                        fontSize: '0.78rem', textAlign: 'center', transition: 'all 0.15s',
                                        fontFamily: 'var(--font)', fontWeight: 600,
                                    }}
                                >
                                    <div style={{ fontSize: '1.2rem', marginBottom: '3px' }}>{r.label.split(' ')[0]}</div>
                                    <div>{r.label.split(' ').slice(1).join(' ')}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        <UserPlus size={16} />
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
