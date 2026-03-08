'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Calendar, MapPin, Users, Globe, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  meetLink?: string;
  attendees: string[];
  maxAttendees?: number;
  category: string;
  community: { _id: string; name: string; slug: string };
  organizer: { name: string; avatar: string };
}

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendingIds, setAttendingIds] = useState<Set<string>>(new Set());

  const userId = (session?.user as any)?.id;

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleRSVP = async (eventId: string) => {
    if (!session) { toast.error('Please sign in to RSVP'); return; }
    try {
      setAttendingIds(new Set([...attendingIds, eventId]));
      const res = await fetch(`/api/events/${eventId}/attend`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setEvents(events.map((e) => {
          if (e._id !== eventId) return e;
          const isAtt = e.attendees.includes(userId);
          return {
            ...e,
            attendees: isAtt ? e.attendees.filter(id => id !== userId) : [...e.attendees, userId]
          };
        }));
        toast.success(data.attending ? 'RSVP Successful!' : 'RSVP Cancelled');
      } else { toast.error(data.error); }
    } catch { toast.error('Something went wrong'); }
    finally {
      const newIds = new Set(attendingIds);
      newIds.delete(eventId);
      setAttendingIds(newIds);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Local Events</h1>
            <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Discover and join upcoming events in your communities</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card" style={{ height: 160, display: 'flex', gap: '1.5rem' }}>
                  <div style={{ width: 120, background: '#f5f5f4', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                    <div style={{ height: 20, background: '#f5f5f4', borderRadius: 6, width: '60%', marginBottom: '1rem' }} />
                    <div style={{ height: 16, background: '#f5f5f4', borderRadius: 6, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#78716c' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1c1917' }}>No upcoming events</h3>
              <p>Check back later or organize an event in your community!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {events.map((event) => {
                const dateObj = new Date(event.date);
                const isAttending = userId && event.attendees.includes(userId);
                const isFull = Boolean(event.maxAttendees && event.attendees.length >= event.maxAttendees);

                return (
                  <div key={event._id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    {/* Date badge */}
                    <div style={{
                      display: 'flex', background: '#fafaf9', borderBottom: '1px solid #e7e5e4',
                      padding: '1rem', alignItems: 'center', gap: '1rem'
                    }}>
                      <div style={{
                        background: 'white', border: '1.5px solid #f97316', borderRadius: 12,
                        minWidth: 60, textAlign: 'center', overflow: 'hidden', flexShrink: 0
                      }}>
                        <div style={{ background: '#f97316', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 0', textTransform: 'uppercase' }}>
                          {format(dateObj, 'MMM')}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316', padding: '0.2rem 0' }}>
                          {format(dateObj, 'dd')}
                        </div>
                      </div>
                      <div>
                        <Link href={`/communities/${event.community.slug}`} style={{ textDecoration: 'none' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {event.community.name}
                          </span>
                        </Link>
                        <h3 style={{ fontWeight: 800, color: '#1c1917', fontSize: '1.1rem', marginTop: 2 }}>{event.title}</h3>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '0.85rem', color: '#57534e', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#78716c' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} /> {format(dateObj, 'h:mm a')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {event.isOnline ? (
                            <><Globe size={16} color="#0ea5e9" /> <span style={{ color: '#0ea5e9' }}>Online Event</span></>
                          ) : (
                            <><MapPin size={16} /> {event.location}</>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f5f5f4', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#57534e', fontWeight: 500 }}>
                          <Users size={16} color="#78716c" />
                          {event.attendees.length} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} going
                        </div>

                        <button
                          onClick={() => handleRSVP(event._id)}
                          disabled={attendingIds.has(event._id) || (!isAttending && isFull)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                            borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                            background: isAttending ? '#ecfdf5' : (!isAttending && isFull ? '#f5f5f4' : '#f97316'),
                            color: isAttending ? '#10b981' : (!isAttending && isFull ? '#a8a29e' : 'white'),
                            opacity: attendingIds.has(event._id) ? 0.6 : 1, transition: 'all 0.2s',
                            boxShadow: isAttending || isFull ? 'none' : '0 2px 8px rgba(249,115,22,0.3)'
                          }}
                        >
                          {attendingIds.has(event._id) ? '...' : isAttending ? <><Check size={16} /> Going</> : isFull ? 'Full' : 'RSVP Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
