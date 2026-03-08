'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Bell, Heart, MessageCircle, UserPlus, Calendar, Megaphone, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: { name: string; avatar: string };
  relatedPost?: string;
  relatedEvent?: string;
  relatedCommunity?: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Error marking as read'); }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case 'comment': return <MessageCircle size={16} color="#3b82f6" />;
      case 'join': return <UserPlus size={16} color="#10b981" />;
      case 'event': return <Calendar size={16} color="#f59e0b" />;
      case 'announcement': return <Megaphone size={16} color="#8b5cf6" />;
      case 'approved': return <CheckCircle size={16} color="#10b981" />;
      default: return <Bell size={16} color="#78716c" />;
    }
  };

  const getLink = (n: Notification) => {
    if (n.relatedPost) return `/posts/${n.relatedPost}`;
    if (n.relatedEvent) return `/events`;
    if (n.relatedCommunity) return `/communities/${n.relatedCommunity}`; // Note: need slug ideally, leaving as is
    return '#';
  };

  if (!session) return null;

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Notifications</h1>
              <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Stay updated with your community activities</p>
            </div>
            {notifications.some(n => !n.read) && (
              <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ color: '#78716c' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: 20, border: '1px solid #e7e5e4' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Bell size={32} color="#a8a29e" />
              </div>
              <h3 style={{ fontWeight: 700, color: '#1c1917', marginBottom: '0.5rem' }}>No notifications yet</h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem' }}>When you get likes, comments, or event invites, they&apos;ll show up here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div key={n._id} className="card" style={{ padding: '1rem 1.25rem', background: n.read ? 'white' : '#fff7ed', border: n.read ? '1px solid #e7e5e4' : '1px solid #fed7aa', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: n.read ? '#f5f5f4' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: n.read ? 500 : 600, color: '#1c1917', marginBottom: '0.25rem' }}>
                      {n.message}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
                      {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
