import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { donateFood, getDonorDonations, deleteDonation, markDelivered } from '../../api/api';
import { Heart, PlusCircle, Trash2, AlertCircle, Package, RefreshCw } from 'lucide-react';

const NAV = [{ to: '/donor', label: 'My Donations', icon: <Heart size={18} /> }];

const STATUS_BADGE = {
    'Pending Inspection': 'badge badge-pending',
    'Approved': 'badge badge-approved',
    'Rejected': 'badge badge-rejected',
    'Claimed': 'badge badge-claimed',
    'Delivered': 'badge badge-approved',
};

export default function DonorDashboard() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '', quantity: '', category: 'edible', latitude: '', longitude: '',
    });

    const flash = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    };

    // ── Fetch from server ────────────────────────────────────────────────────
    const fetchDonations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDonorDonations();
            setDonations(res.data);
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to load donations', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDonations(); }, [fetchDonations]);

    // ── Submit donation ──────────────────────────────────────────────────────
    const handleDonate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await donateFood({
                name: form.name,
                quantity: form.quantity,
                category: form.category,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
            });
            setForm({ name: '', quantity: '', category: 'edible', latitude: '', longitude: '' });
            setShowForm(false);
            flash('Donation submitted successfully! 🎉');
            fetchDonations();           // ← re-fetch from server
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to submit donation', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete (only Pending) ────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await deleteDonation(id);
            flash('Donation removed');
            fetchDonations();           // ← re-fetch from server
        } catch (e) {
            flash(e.response?.data?.detail || 'Cannot delete this donation', 'error');
        }
    };

    // ── Mark Delivered (only Claimed) ────────────────────────────────────────
    const handleMarkDelivered = async (id) => {
        try {
            await markDelivered(id);
            flash('Marked as delivered! ✅');
            fetchDonations();           // ← re-fetch from server
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to mark as delivered', 'error');
        }
    };

    return (
        <div className="app-layout role-donor">
            <Sidebar
                links={NAV} roleClass="role-donor"
                roleLabel="Donor" roleIcon="🍎"
                userName={user?.fullname || 'Donor'}
            />
            <main className="main-content">
                {/* Page header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Donor <span className="header-accent">Dashboard</span></h1>
                        <p>Share food and make a difference in your community</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={fetchDonations}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
                            <PlusCircle size={16} />
                            {showForm ? 'Cancel' : 'Donate Food'}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card role-donor">
                        <div className="stat-icon"><Package size={20} /></div>
                        <div className="stat-value">{donations.length}</div>
                        <div className="stat-label">Total Donations</div>
                    </div>
                    <div className="stat-card role-donor">
                        <div className="stat-icon"><AlertCircle size={20} /></div>
                        <div className="stat-value">{donations.filter(d => d.status === 'Pending Inspection').length}</div>
                        <div className="stat-label">Pending Inspection</div>
                    </div>
                    <div className="stat-card role-donor">
                        <div className="stat-icon"><Heart size={20} /></div>
                        <div className="stat-value">{donations.filter(d => d.status === 'Approved' || d.status === 'Claimed').length}</div>
                        <div className="stat-label">Accepted</div>
                    </div>
                    <div className="stat-card role-donor">
                        <div className="stat-icon"><AlertCircle size={20} /></div>
                        <div className="stat-value">{donations.filter(d => d.status === 'Rejected').length}</div>
                        <div className="stat-label">Rejected</div>
                    </div>
                </div>

                {/* Flash message */}
                {msg.text && (
                    <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                        <AlertCircle size={16} /> {msg.text}
                    </div>
                )}

                {/* Donate Form */}
                {showForm && (
                    <div className="card" style={{ borderColor: 'var(--donor-primary)', animation: 'slideUp 0.3s ease' }}>
                        <div className="card-header">
                            <h2>🍎 New Food Donation</h2>
                        </div>
                        <form onSubmit={handleDonate}>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Food Name *</label>
                                    <input type="text" placeholder="e.g. Cooked Rice, Fresh Apples"
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input type="text" placeholder="e.g. 5 kg, 20 plates"
                                        value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                    <option value="edible">Edible</option>
                                    <option value="packaged">Packaged</option>
                                    <option value="cooked">Cooked</option>
                                    <option value="raw">Raw / Produce</option>
                                    <option value="beverages">Beverages</option>
                                </select>
                            </div>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Latitude (optional)</label>
                                    <input type="number" step="any" placeholder="e.g. 28.6139"
                                        value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Longitude (optional)</label>
                                    <input type="number" step="any" placeholder="e.g. 77.2090"
                                        value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                <Heart size={16} /> {submitting ? 'Submitting...' : 'Submit Donation'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Donations Table — server-driven */}
                <div className="card">
                    <div className="card-header"><h2>My Donations</h2></div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🍽️</div>
                            <h3>No donations yet</h3>
                            <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>Click "Donate Food" to get started</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th><th>Food Name</th><th>Quantity</th>
                                        <th>Category</th><th>Status</th><th>Date</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map(d => (
                                        <tr key={d.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{d.id}</td>
                                            <td style={{ fontWeight: 600 }}>{d.name}</td>
                                            <td>{d.quantity}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{d.category}</td>
                                            <td><span className={STATUS_BADGE[d.status] || 'badge'}>{d.status}</span></td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(d.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {d.status === 'Pending Inspection' && (
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                )}
                                                {d.status === 'Claimed' && (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleMarkDelivered(d.id)}>
                                                        <Heart size={13} /> Mark Delivered
                                                    </button>
                                                )}
                                                {d.status === 'Delivered' && (
                                                    <span className="badge badge-approved">✔ Delivered</span>
                                                )}
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
