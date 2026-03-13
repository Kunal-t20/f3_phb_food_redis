import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Sidebar({ links, roleClass, roleLabel, roleIcon, userName }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${roleClass}`}>
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">{roleIcon}</div>
                <div>
                    <h2>Hunger Relief</h2>
                    <span>Network</span>
                </div>
            </div>

            <div className="sidebar-user">
                <div className="sidebar-user-name">{userName || 'User'}</div>
                <div className={`role-badge`}>{roleLabel}</div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={location.pathname === link.to ? 'active' : ''}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <button className="btn btn-ghost btn-full" onClick={handleLogout} style={{ fontSize: '0.85rem' }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
