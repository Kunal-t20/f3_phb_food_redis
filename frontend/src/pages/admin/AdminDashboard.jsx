import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { getUsers, deleteUser, getAdminDeliveries } from '../../api/api';
import { Users, Trash2, ShieldCheck, Package, AlertCircle, RefreshCw, Truck } from 'lucide-react';

const NAV = [
    { to: '/admin', label: 'Dashboard', icon: <ShieldCheck size={18} /> },
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveriesLoading, setDeliveriesLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (e) {
            setError(e.response?.data?.detail || 'Failed to load users');
        } finally { setLoading(false); }
    }, []);

    const fetchDeliveries = useCallback(async () => {
        setDeliveriesLoading(true);
        try {
            const res = await getAdminDeliveries();
            setDeliveries(res.data);
        } catch (e) {
            // deliveries are non-critical, fail silently
        } finally { setDeliveriesLoading(false); }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchDeliveries();
    }, [fetchUsers, fetchDeliveries]);

    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            setActionMsg('User deleted successfully');
            setTimeout(() => setActionMsg(''), 3000);
            fetchDeliveries(); // refresh deliveries — recipient may have had claims
        } catch (e) {
            setError(e.response?.data?.detail || 'Delete failed');
        } finally { setDeleteConfirm(null); }
    };

    const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1; return acc;
    }, {});

    const getRoleBadge = (role) => {
        const map = {
            admin: 'badge badge-delivered',
            donor: 'badge badge-approved',
            inspector: 'badge badge-pending',
            recipient: 'badge badge-claimed',
        };
        return <span className={map[role] || 'badge'}>{role}</span>;
    };

    const DELIVERY_STATUS_BADGE = {
        'Pending': 'badge badge-pending',
        'Assigned': 'badge badge-approved',
        'Delivered': 'badge badge-delivered',
        'Received': 'badge badge-approved',
    };

    return (
        <div className="app-layout role-admin">
            <Sidebar
                links={NAV} roleClass="role-admin"
                roleLabel="Administrator" roleIcon="🛡️"
                userName={user?.fullname || 'Admin'}
            />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Admin <span className="header-accent">Dashboard</span></h1>
                        <p>Manage users and monitor the hunger relief network</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { fetchUsers(); fetchDeliveries(); }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card role-admin">
                        <div className="stat-icon"><Users size={20} /></div>
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    {['donor', 'inspector', 'recipient'].map(r => (
                        <div key={r} className="stat-card role-admin">
                            <div className="stat-icon"><Package size={20} /></div>
                            <div className="stat-value">{roleCounts[r] || 0}</div>
                            <div className="stat-label" style={{ textTransform: 'capitalize' }}>{r}s</div>
                        </div>
                    ))}
                    <div className="stat-card role-admin">
                        <div className="stat-icon"><Truck size={20} /></div>
                        <div className="stat-value">{deliveries.length}</div>
                        <div className="stat-label">Total Deliveries</div>
                    </div>
                </div>

                {actionMsg && <div className="alert alert-success"><AlertCircle size={16} /> {actionMsg}</div>}
                {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}

                {/* Users Table */}
                <div className="card">
                    <div className="card-header">
                        <h2>All Users</h2>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <h3>No users found</h3>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Full Name</th><th>Email</th>
                                        <th>Role</th><th>Joined</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{u.id}</td>
                                            <td style={{ fontWeight: 600 }}>{u.fullname}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                            <td>{getRoleBadge(u.role)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    deleteConfirm === u.id ? (
                                                        <div className="actions-cell">
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirm?</span>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Yes</button>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                                                        </div>
                                                    ) : (
                                                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(u.id)}>
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Deliveries Table */}
                <div className="card">
                    <div className="card-header">
                        <h2><Truck size={18} style={{ display: 'inline', marginRight: 6 }} />All Deliveries</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {deliveries.length} record{deliveries.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {deliveriesLoading ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : deliveries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🚚</div>
                            <h3>No deliveries yet</h3>
                            <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                                Deliveries are created when recipients claim food
                            </p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Food Item</th>
                                        <th>Recipient</th>
                                        <th>Status</th>
                                        <th>Requested At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveries.map(d => (
                                        <tr key={d.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{d.id}</td>
                                            <td style={{ fontWeight: 600 }}>Food #{d.food_item_id}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>User #{d.recipient_id}</td>
                                            <td>
                                                <span className={DELIVERY_STATUS_BADGE[d.delivery_status] || 'badge'}>
                                                    {d.delivery_status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(d.requested_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
