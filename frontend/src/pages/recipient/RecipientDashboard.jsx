import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { getAvailableFoods, claimFood, getRecipientClaims, confirmReceived } from '../../api/api';
import { ShoppingBag, Utensils, CheckCircle, AlertCircle, RefreshCw, ClipboardList } from 'lucide-react';

const NAV = [{ to: '/recipient', label: 'Available Food', icon: <ShoppingBag size={18} /> }];

export default function RecipientDashboard() {
    const { user } = useAuth();
    const [foods, setFoods] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimsLoading, setClaimsLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const flash = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    };

    // ── Fetch approved foods from server ─────────────────────────────────────
    const fetchFoods = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAvailableFoods(0, 50);
            setFoods(res.data);
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to load available food', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch claim history from server ──────────────────────────────────────
    const fetchClaims = useCallback(async () => {
        setClaimsLoading(true);
        try {
            const res = await getRecipientClaims();
            setClaims(res.data);
        } catch (e) {
            // claims are non-critical, fail silently
        } finally {
            setClaimsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFoods();
        fetchClaims();
    }, [fetchFoods, fetchClaims]);

    // ── Claim food ────────────────────────────────────────────────────────────
    const handleClaim = async (food) => {
        setClaimingId(food.id);
        try {
            await claimFood(food.id);
            flash(`"${food.name}" claimed successfully! 🎉`);
            fetchFoods();    // food status → Claimed, removed from available list
            fetchClaims();   // update claim history
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to claim food', 'error');
        } finally {
            setClaimingId(null);
        }
    };

    // ── Confirm Received (only after Delivered) ──────────────────────────
    const handleConfirmReceived = async (claim) => {
        try {
            await confirmReceived(claim.food_item_id);
            flash(`Food #${claim.food_item_id} confirmed as received! ✅`);
            fetchClaims();
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to confirm receipt', 'error');
        }
    };

    const getCategoryEmoji = (cat) => {
        const m = { edible: '🍽️', packaged: '📦', cooked: '🍲', raw: '🥦', beverages: '🥤' };
        return m[cat] || '🍱';
    };

    const formatLocation = (lat, lng) => {
        if (lat == null && lng == null) return 'N/A';
        if (lat == null || lng == null) return 'Partial';
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    };

    const STATUS_BADGE = {
        'Pending': 'badge badge-pending',
        'Delivered': 'badge badge-approved',
        'Claimed': 'badge badge-claimed',
        'Received': 'badge badge-approved',
    };

    return (
        <div className="app-layout role-recipient">
            <Sidebar
                links={NAV} roleClass="role-recipient"
                roleLabel="Recipient" roleIcon="🙏"
                userName={user?.fullname || 'Recipient'}
            />
            <main className="main-content">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Available <span className="header-accent">Food</span></h1>
                        <p>Browse and claim approved food donations in your area</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { fetchFoods(); fetchClaims(); }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card role-recipient">
                        <div className="stat-icon"><Utensils size={20} /></div>
                        <div className="stat-value">{foods.length}</div>
                        <div className="stat-label">Available Now</div>
                    </div>
                    <div className="stat-card role-recipient">
                        <div className="stat-icon"><CheckCircle size={20} /></div>
                        <div className="stat-value">{claims.length}</div>
                        <div className="stat-label">Total Claims</div>
                    </div>
                </div>

                {/* Flash message */}
                {msg.text && (
                    <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                        <AlertCircle size={16} /> {msg.text}
                    </div>
                )}

                {/* ── Food Grid (server-driven) ── */}
                <div className="card">
                    <div className="card-header">
                        <h2>Approved Food Donations</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {foods.length} item{foods.length !== 1 ? 's' : ''} available
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : foods.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🍽️</div>
                            <h3>No food available right now</h3>
                            <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                                Check back after inspectors have approved donations
                            </p>
                        </div>
                    ) : (
                        <div className="food-grid">
                            {foods.map(food => (
                                <div key={food.id} className="food-card role-recipient">
                                    <div className="food-card-header">
                                        <div>
                                            <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                                                {getCategoryEmoji(food.category)}
                                            </div>
                                            <div className="food-card-name">{food.name}</div>
                                        </div>
                                        <span className="badge badge-approved">Approved</span>
                                    </div>

                                    <div className="food-card-meta">
                                        <span>📦 Quantity: <strong>{food.quantity}</strong></span>
                                        <span style={{ textTransform: 'capitalize' }}>🏷️ Category: {food.category}</span>
                                        <span>🗓️ Listed: {new Date(food.created_at).toLocaleDateString()}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Food ID #{food.id}</span>
                                    </div>

                                    <div className="food-card-footer">
                                        <span />
                                        <button
                                            className="btn btn-primary btn-sm"
                                            disabled={claimingId === food.id}
                                            onClick={() => handleClaim(food)}
                                        >
                                            {claimingId === food.id ? 'Claiming...' : '✋ Claim'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Claim History ── */}
                <div className="card">
                    <div className="card-header">
                        <h2><ClipboardList size={18} style={{ display: 'inline', marginRight: 6 }} />My Claim History</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {claims.length} claim{claims.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {claimsLoading ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No claims yet</h3>
                            <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>Claim a food item above to get started</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Food Item ID</th>
                                        <th>Pickup Location</th>
                                        <th>Status</th>
                                        <th>Requested At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {claims.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{c.id}</td>
                                            <td style={{ fontWeight: 600 }}>#{c.food_item_id}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                                {formatLocation(c.pickup_latitude, c.pickup_longitude)}
                                            </td>
                                            <td>
                                                <span className={STATUS_BADGE[c.delivery_status] || 'badge'}>
                                                    {c.delivery_status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(c.requested_at).toLocaleString()}
                                            </td>
                                            <td>
                                                {c.delivery_status === 'Delivered' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleConfirmReceived(c)}
                                                    >
                                                        ✋ Confirm Received
                                                    </button>
                                                )}
                                                {c.delivery_status === 'Received' && (
                                                    <span className="badge badge-approved">✔ Received</span>
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
