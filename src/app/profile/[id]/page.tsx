'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { MapPin, Calendar, BookOpen, Crown, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data.user);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: '#78716c' }}>Loading profile...</div>
        </main>
      </div>
    </div>
  );

  if (!profile) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>User not found</h2>
      </div>
    </div>
  );

  const isOwnProfile = (session?.user as any)?.id === id;

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, #f97316, #8b5cf6)' }} />
            <div style={{ padding: '1.5rem', paddingTop: 0, position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -50, left: '1.5rem',
                width: 100, height: 100, borderRadius: '50%', border: '4px solid white',
                background: 'linear-gradient(135deg, #ea580c, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '2.5rem', fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {profile.name[0]}
                {profile.role === 'admin' && (
                  <Crown size={20} color="#f59e0b" fill="#f59e0b" style={{ position: 'absolute', bottom: 4, right: 4, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', height: 36 }}>
                {isOwnProfile && (
                  <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    <Edit3 size={14} /> Edit Profile
                  </button>
                )}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>{profile.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#78716c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} /> {profile.city || 'No city'}
                  </div>
                  {profile.hometown && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span role="img" aria-label="home">🏠</span> From: {profile.hometown}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} /> Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                  </div>
                </div>

                {profile.bio && (
                  <div style={{ background: '#fafaf9', padding: '1rem', borderRadius: 12, border: '1px solid #e7e5e4', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <BookOpen size={16} color="#8b5cf6" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.6 }}>{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1c1917' }}>Communities</h3>
              {profile.joinedCommunities?.length === 0 ? (
                <p style={{ color: '#78716c', fontSize: '0.85rem' }}>Not a member of any communities yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.joinedCommunities?.map((c: any) => (
                    <Link key={c._id} href={`/communities/${c.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '0.75rem', borderRadius: 10, background: '#fafaf9', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
                           onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; }}
                           onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e7e5e4'; }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🏘️</div>
                        <div>
                          <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1c1917' }}>{c.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#78716c' }}>{c.memberCount} members</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1c1917' }}>About</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#57534e' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Role</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile.role}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Email</span>
                  <span>{isOwnProfile || profile.role === 'admin' ? profile.email : 'Hidden'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716c' }}>Communities Joined</span>
                  <span className="badge badge-orange">{profile.joinedCommunities?.length || 0}</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
