'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Bell, User, Shield, PlusCircle, MapPin } from 'lucide-react';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const links = [
    { href: '/communities', icon: Users, label: 'Communities' },
    { href: '/events', icon: Calendar, label: 'Events' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  if (!session) return null;

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {/* User profile mini */}
      <div style={{ padding: '0.75rem', background: '#fafaf9', borderRadius: 14, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0
        }}>
          {session.user?.name?.[0].toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.user?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={10} />
            {(session.user as any)?.city || 'No city set'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {links.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem 0.875rem', borderRadius: 10, textDecoration: 'none',
          fontSize: '0.875rem', fontWeight: 500,
          color: isActive(href) ? '#f97316' : '#57534e',
          background: isActive(href) ? '#fff7ed' : 'transparent',
          transition: 'all 0.2s'
        }}>
          <Icon size={18} color={isActive(href) ? '#f97316' : '#78716c'} />
          {label}
          {label === 'Notifications' && (
            <span style={{
              marginLeft: 'auto', background: '#ef4444', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700
            }}>
              3
            </span>
          )}
        </Link>
      ))}

      <div style={{ height: 1, background: '#e7e5e4', margin: '0.5rem 0' }} />

      <Link href="/communities/new" style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.625rem 0.875rem', borderRadius: 10, textDecoration: 'none',
        fontSize: '0.875rem', fontWeight: 600, color: '#f97316',
        background: '#fff7ed', transition: 'all 0.2s'
      }}>
        <PlusCircle size={18} /> Create Community
      </Link>

      {(session.user as any)?.role === 'admin' && (
        <Link href="/admin" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem 0.875rem', borderRadius: 10, textDecoration: 'none',
          fontSize: '0.875rem', fontWeight: 600, color: '#8b5cf6',
          background: isActive('/admin') ? '#f5f3ff' : 'transparent',
          transition: 'all 0.2s'
        }}>
          <Shield size={18} /> Admin Dashboard
        </Link>
      )}

      <div style={{ height: 1, background: '#e7e5e4', margin: '0.5rem 0' }} />

      <Link href={`/profile/${(session.user as any)?.id}`} style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.625rem 0.875rem', borderRadius: 10, textDecoration: 'none',
        fontSize: '0.875rem', fontWeight: 500, color: '#57534e',
        transition: 'all 0.2s'
      }}>
        <User size={18} color="#78716c" /> My Profile
      </Link>
    </aside>
  );
}
