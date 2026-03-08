'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  MapPin, Bell, Search, Menu, X, Home, Users, Calendar,
  User, LogOut, Settings, Shield, ChevronDown, Plus
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/communities?search=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <MapPin size={20} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1917' }}>
          Hometown <span style={{ color: '#f97316' }}>Hub</span>
        </span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
        <input
          type="text"
          placeholder="Search communities, cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
            border: '1.5px solid #e7e5e4', borderRadius: 10, fontSize: '0.875rem',
            outline: 'none', background: '#fafaf9', fontFamily: 'Inter, sans-serif'
          }}
        />
      </form>

      {/* Desktop nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
        {session ? (
          <>
            <Link href="/communities" className="btn-ghost">
              <Users size={16} /> Communities
            </Link>
            <Link href="/events" className="btn-ghost">
              <Calendar size={16} /> Events
            </Link>
            <Link href="/notifications" style={{ position: 'relative' }} className="btn-ghost">
              <Bell size={18} />
            </Link>
            <Link href="/communities/new" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              <Plus size={15} /> Create
            </Link>

            {/* User menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem', border: '1.5px solid #e7e5e4',
                  borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.user?.name}
                </span>
                <ChevronDown size={14} color="#78716c" />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', width: 200,
                  background: 'white', border: '1px solid #e7e5e4', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100
                }}>
                  <Link href={`/profile/${(session.user as any)?.id}`}
                    onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#1c1917', fontSize: '0.875rem', fontWeight: 500 }}>
                    <User size={16} color="#78716c" /> My Profile
                  </Link>
                  {(session.user as any)?.role === 'admin' && (
                    <Link href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#1c1917', fontSize: '0.875rem', fontWeight: 500, borderTop: '1px solid #f5f5f4' }}>
                      <Shield size={16} color="#f97316" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem', fontWeight: 500, borderTop: '1px solid #f5f5f4', fontFamily: 'Inter, sans-serif' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn-ghost">Sign In</Link>
            <Link href="/auth/register" className="btn-primary">Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
}
