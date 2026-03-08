'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Trash2, ExternalLink, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      if (res.status === 401 || res.status === 403) {
        router.push('/');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleAction = async (action: string, targetId: string, value?: string) => {
    setActionLoading(targetId);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId, value }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchAdminData();
      } else { toast.error(result.error); }
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  if (!session || (session.user as any)?.role !== 'admin') {
    return null; // Will redirect via useEffect or just show blank
  }

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
              <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Platform overview and moderation tools</p>
            </div>
          </div>

          {loading || !data ? (
            <div style={{ color: '#78716c' }}>Loading dashboard...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
                  <div style={{ color: '#78716c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL USERS</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1c1917' }}>{data.stats.totalUsers}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ color: '#78716c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>ACTIVE COMMUNITIES</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1c1917' }}>{data.stats.totalCommunities}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                  <div style={{ color: '#78716c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>POSTS PUBLISHED</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1c1917' }}>{data.stats.totalPosts}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
                  <div style={{ color: '#78716c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>EVENTS CREATED</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1c1917' }}>{data.stats.totalEvents}</div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Community Approvals <span className="badge badge-orange">{data.stats.pendingCommunities}</span>
                  </h2>
                </div>

                {data.communitiesForApproval.length === 0 ? (
                  <p style={{ color: '#78716c', fontSize: '0.9rem', padding: '1rem', background: '#fafaf9', borderRadius: 12, textAlign: 'center' }}>No communities pending approval.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.communitiesForApproval.map((c: any) => (
                      <div key={c._id} style={{ padding: '1.25rem', border: '1px solid #e7e5e4', borderRadius: 12, display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{c.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#78716c', marginBottom: '0.5rem' }}>
                            <span>City: {c.city}</span>
                            <span>•</span>
                            <span>Category: {c.category}</span>
                            <span>•</span>
                            <span>Creator: {c.creator.name} ({c.creator.email})</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#57534e', maxWidth: 600 }}>{c.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleAction('rejectCommunity', c._id)}
                            disabled={actionLoading === c._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                            <XCircle size={16} /> Reject
                          </button>
                          <button
                            onClick={() => handleAction('approveCommunity', c._id)}
                            disabled={actionLoading === c._id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
                            <CheckCircle size={16} /> Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Users */}
              <div className="card">
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Recent Users</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e7e5e4', color: '#78716c', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>User</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Email</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Location</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Joined</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentUsers.map((u: any) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{u.name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#57534e' }}>{u.email}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#57534e' }}>{u.city}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#57534e' }}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleAction('changeUserRole', u._id, e.target.value)}
                              style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid #e7e5e4', fontSize: '0.8rem', background: u.role === 'admin' ? '#f5f3ff' : u.role === 'moderator' ? '#fff7ed' : 'white', color: '#1c1917', cursor: 'pointer' }}
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
