import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { getInspectorPending, getInspectorHistory, inspectFood } from '../../api/api';
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const NAV = [{ to: '/inspector', label: 'Inspect Food', icon: <ClipboardCheck size={18} /> }];

export default function InspectorDashboard() {
    const { user } = useAuth();

    // ── state ────────────────────────────────────────────────────────────────
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [remarks, setRemarks] = useState({});   // { [foodId]: string }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({}); // { [foodId]: 'approve'|'reject'|false }
    const [msg, setMsg] = useState({ text: '', type: '' });

    const flash = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    };

    // ── Fetch pending queue from server ──────────────────────────────────────
    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInspectorPending();
            setPending(res.data);
        } catch (e) {
            flash(e.response?.data?.detail || 'Failed to load pending food items', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch inspection history from server ─────────────────────────────────
    const fetchHistory = useCallback(async () => {
        try {
            const res = await getInspectorHistory();
            setHistory(res.data);
        } catch { /* history is non-critical */ }
    }, []);

    useEffect(() => {
        fetchPending();
        fetchHistory();
    }, [fetchPending, fetchHistory]);

    // ── Submit inspection — result passed directly from button click ──────────
    const handleInspect = async (food, result) => {
        const key = result === 'Approved' ? 'approve' : 'reject';
        setSubmitting(prev => ({ ...prev, [food.id]: key }));
        const remark = remarks[food.id] || '';
        try {
            await inspectFood(food.id, {
                food_item_id: food.id,
                remarks: remark,
                result,
            });
            flash(`Food "${food.name}" marked as ${result} ${result === 'Approved' ? '✅' : '❌'}`);
            fetchPending();
            fetchHistory();
        } catch (e) {
            flash(e.response?.data?.detail || 'Inspection failed', 'error');
        } finally {
            setSubmitting(prev => ({ ...prev, [food.id]: false }));
        }
    };

    const getCategoryEmoji = (cat) => {
        const m = { edible: '🍽️', packaged: '📦', cooked: '🍲', raw: '🥦', beverages: '🥤' };
        return m[cat] || '🍱';
    };

    return (
        <div className="app-layout role-inspector">
            <Sidebar
                links={NAV} roleClass="role-inspector"
                roleLabel="Inspector" roleIcon="🔍"
                userName={user?.fullname || 'Inspector'}
            />
            <main className="main-content">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Food <span className="header-accent">Inspection</span></h1>
                        <p>Review and approve or reject donated food items</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { fetchPending(); fetchHistory(); }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card role-inspector">
                        <div className="stat-icon"><ClipboardCheck size={20} /></div>
                        <div className="stat-value">{pending.length}</div>
                        <div className="stat-label">Awaiting Inspection</div>
                    </div>
                    <div className="stat-card role-inspector">
                        <div className="stat-icon"><CheckCircle size={20} /></div>
                        <div className="stat-value">{history.filter(h => h.result === 'Approved').length}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card role-inspector">
                        <div className="stat-icon"><XCircle size={20} /></div>
                        <div className="stat-value">{history.filter(h => h.result === 'Rejected').length}</div>
                        <div className="stat-label">Rejected</div>
                    </div>
                </div>

                {/* Flash */}
                {msg.text && (
                    <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                        <AlertCircle size={16} /> {msg.text}
                    </div>
                )}

                {/* ── Pending Queue (server-driven, no manual ID entry) ── */}
                <div className="card">
                    <div className="card-header">
                        <h2>🔎 Pending Inspection Queue</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {pending.length} item{pending.length !== 1 ? 's' : ''} waiting
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">✅</div>
                            <h3>All caught up!</h3>
                            <p style={{ marginTop: '6px', fontSize: '0.85rem' }}>No food items pending inspection</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pending.map(food => (
                                <div key={food.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderLeft: '3px solid var(--inspector-primary)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                }}>
                                    {/* Food info row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '2rem' }}>{getCategoryEmoji(food.category)}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{food.name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                                                    📦 {food.quantity} &nbsp;·&nbsp;
                                                    <span style={{ textTransform: 'capitalize' }}>{food.category}</span> &nbsp;·&nbsp;
                                                    Food ID #{food.id}
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                                                    🗓️ Donated on {new Date(food.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="badge badge-pending">Pending</span>
                                    </div>

                                    {/* Remarks */}
                                    <div className="form-group" style={{ marginBottom: '14px' }}>
                                        <label>Remarks (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Add inspection notes..."
                                            value={remarks[food.id] || ''}
                                            onChange={e => setRemarks(prev => ({ ...prev, [food.id]: e.target.value }))}
                                        />
                                    </div>

                                    {/* Approve / Reject buttons */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            disabled={!!submitting[food.id]}
                                            onClick={() => handleInspect(food, 'Approved')}
                                            style={{ flex: 1, justifyContent: 'center' }}
                                        >
                                            <CheckCircle size={15} />
                                            {submitting[food.id] === 'approve' ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            disabled={!!submitting[food.id]}
                                            onClick={() => handleInspect(food, 'Rejected')}
                                            style={{ flex: 1, justifyContent: 'center' }}
                                        >
                                            <XCircle size={15} />
                                            {submitting[food.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Inspection History ── */}
                {history.length > 0 && (
                    <div className="card">
                        <div className="card-header"><h2>📋 Inspection History</h2></div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Record ID</th><th>Food ID</th><th>Result</th>
                                        <th>Remarks</th><th>Inspected At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(h => (
                                        <tr key={h.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{h.id}</td>
                                            <td style={{ fontWeight: 600 }}>#{h.food_item_id}</td>
                                            <td>
                                                <span className={`badge ${h.result === 'Approved' ? 'badge-approved' : 'badge-rejected'}`}>
                                                    {h.result}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{h.remarks || '—'}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(h.inspected_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
