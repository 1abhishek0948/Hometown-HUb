'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Search, Filter, MapPin, Users, Plus, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  memberCount: number;
  category: string;
  tags: string[];
  isPrivate: boolean;
  creator: { name: string; avatar: string };
  coverImage?: string;
  avatar?: string;
}

const CATEGORIES = ['All', 'City', 'Village/Town', 'General', 'Culture', 'Sports', 'Education', 'Business'];
const CITIES = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Nashik', 'Kochi', 'Chandigarh', 'Varanasi'];

const gradients = [
  'linear-gradient(135deg, #f97316, #ec4899)',
  'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #ef4444, #f97316)',
];

export default function CommunitiesPage() {
  const { data: session } = useSession();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city !== 'All') params.set('city', city);
      params.set('page', page.toString());
      const res = await fetch(`/api/communities?${params}`);
      const data = await res.json();
      setCommunities(data.communities || []);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load communities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCommunities(); }, [search, city, page]);

  const handleJoin = async (slug: string) => {
    if (!session) { toast.error('Please sign in to join communities'); return; }
    setJoining(slug);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchCommunities(); }
      else toast.error(data.error);
    } catch { toast.error('Failed to join community'); }
    finally { setJoining(null); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Discover Communities</h1>
                <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Find and join communities from your city, village, or hometown</p>
              </div>
              {session && (
                <Link href="/communities/new" className="btn-primary">
                  <Plus size={16} /> Create Community
                </Link>
              )}
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input className="form-input" placeholder="Search by name, description, or tag..."
                  value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ paddingLeft: 38 }} />
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <select className="form-input" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  style={{ paddingLeft: 36, minWidth: 150, cursor: 'pointer' }}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Community grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e7e5e4', background: 'white' }}>
                  <div style={{ height: 100, background: '#f5f5f4', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: 18, borderRadius: 8, background: '#f5f5f4', marginBottom: '0.5rem', width: '60%' }} />
                    <div style={{ height: 14, borderRadius: 8, background: '#f5f5f4', width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : communities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#78716c' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏘️</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1c1917' }}>No communities found</h3>
              <p style={{ marginBottom: '1.5rem' }}>Be the first to create a community for your city or village!</p>
              {session && (
                <Link href="/communities/new" className="btn-primary">Create Community</Link>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                {communities.map((c, idx) => (
                  <div key={c._id} className="community-card">
                    {/* Cover */}
                    <div style={{ height: 100, background: gradients[idx % gradients.length], position: 'relative' }}>
                      <div style={{
                        position: 'absolute', bottom: -24, left: 16,
                        width: 48, height: 48, borderRadius: 12, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '1.5rem'
                      }}>
                        🏘️
                      </div>
                      {c.isPrivate && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.7rem' }}>
                            <Lock size={10} style={{ marginRight: 3 }} /> Private
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '1.5rem 1rem 1rem', paddingTop: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <Link href={`/communities/${c.slug}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontWeight: 700, color: '#1c1917', fontSize: '1rem', lineHeight: 1.3 }}>{c.name}</h3>
                        </Link>
                        <span className="badge badge-orange" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{c.category}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        <MapPin size={12} color="#78716c" />
                        <span style={{ fontSize: '0.8rem', color: '#78716c' }}>{c.city}{c.state ? `, ${c.state}` : ''}</span>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: '#57534e', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </p>

                      {c.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} style={{ display: 'inline-block', fontSize: '0.7rem', color: '#78716c', background: '#f5f5f4', padding: '2px 8px', borderRadius: 20, marginRight: 4, marginBottom: 4 }}>
                          #{tag}
                        </span>
                      ))}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f4' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontSize: '0.8rem' }}>
                          <Users size={14} />
                          <span>{c.memberCount.toLocaleString()} members</span>
                        </div>
                        <button
                          onClick={() => handleJoin(c.slug)}
                          disabled={joining === c.slug}
                          style={{
                            padding: '0.375rem 0.875rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
                            border: '1.5px solid #f97316', background: 'transparent', color: '#f97316',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            opacity: joining === c.slug ? 0.6 : 1
                          }}>
                          {joining === c.slug ? '...' : 'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: page === i + 1 ? '#f97316' : 'white',
                        color: page === i + 1 ? 'white' : '#57534e',
                        fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
