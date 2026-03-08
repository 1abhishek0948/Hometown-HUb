'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MapPin, Users, Calendar, Bell, Shield, Globe, ArrowRight, Star, Heart, Zap } from 'lucide-react';

const features = [
  {
    icon: '🏘️',
    title: 'Hyperlocal Communities',
    desc: 'Find and join communities specific to your city, village, or hometown. Connect with people who truly understand your roots.',
  },
  {
    icon: '📢',
    title: 'Community Announcements',
    desc: 'Stay informed with pinned announcements, local news, and important updates from your community leaders.',
  },
  {
    icon: '🎉',
    title: 'Local Events',
    desc: 'Discover and RSVP to local events, cultural festivals, and community gatherings right from the platform.',
  },
  {
    icon: '💬',
    title: 'Meaningful Discussions',
    desc: 'Share posts, exchange ideas, and build genuine connections with people who share your local identity.',
  },
  {
    icon: '🛡️',
    title: 'Moderated Spaces',
    desc: 'Community moderators ensure a safe, respectful environment where everyone contributes positively.',
  },
  {
    icon: '🌱',
    title: 'Cultural Preservation',
    desc: 'Celebrate and preserve local traditions, languages, art, and culture with your extended community.',
  },
];

const stats = [
  { value: '500+', label: 'Cities & Villages', icon: '🏙️' },
  { value: '10K+', label: 'Active Members', icon: '👥' },
  { value: '200+', label: 'Communities', icon: '🏘️' },
  { value: '1K+', label: 'Events Hosted', icon: '🎊' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    city: 'Delhi → Bangalore',
    quote: 'Hometown Hub helped me stay connected to Delhi while living in Bangalore. I now know what\'s happening back home in real time!',
    avatar: 'P',
  },
  {
    name: 'Rahul Gupta',
    city: 'Nashik',
    quote: 'I found my school friends and childhood neighbors through our Nashik community page. This platform is magical!',
    avatar: 'R',
  },
  {
    name: 'Sunita Devi',
    city: 'Varanasi',
    quote: 'Our cultural events and festivals get so much more participation now. Hometown Hub has truly strengthened our community.',
    avatar: 'S',
  },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 25%, #ede9fe 60%, #ecfeff 100%)',
        padding: '2rem 1rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* BG decorations */}
        <div style={{
          position: 'absolute', top: '10%', left: '5%', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(249,115,22,0.08)', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(139,92,246,0.08)', filter: 'blur(80px)'
        }} />

        <div style={{ textAlign: 'center', maxWidth: 800, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'white', border: '1.5px solid #fed7aa', borderRadius: 40,
            padding: '0.4rem 1rem', marginBottom: '1.5rem',
            boxShadow: '0 2px 12px rgba(249,115,22,0.15)'
          }}>
            <span style={{ fontSize: '1rem' }}>🏡</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f97316', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Your Digital Hometown
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: '#1c1917' }}>
            Connect with your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Hometown
            </span>
            <br />wherever you are
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#57534e', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            A dedicated digital space for local communities to connect, share stories,
            organize events, and preserve the culture and bonds of their hometown.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {session ? (
              <Link href="/communities" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Explore Communities <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                  Join Your Community <ArrowRight size={18} />
                </Link>
                <Link href="/auth/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Floating stats */}
          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap'
          }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.8)', borderRadius: 16,
                padding: '0.875rem 1.25rem', textAlign: 'center', minWidth: 120,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1rem', background: '#fafaf9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-orange" style={{ marginBottom: '0.75rem' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#1c1917', marginBottom: '1rem' }}>
              Everything your community needs
            </h2>
            <p style={{ color: '#78716c', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
              Purpose-built tools to connect, communicate, and celebrate what makes your hometown unique.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'white', border: '1px solid #e7e5e4', borderRadius: 20,
                padding: '1.75rem', transition: 'all 0.3s'
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = '#e7e5e4'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1c1917' }}>{f.title}</h3>
                <p style={{ color: '#78716c', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>How It Works</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#1c1917', marginBottom: '3rem' }}>
            Get started in 3 simple steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Create Your Account', desc: 'Register with your name, email, and hometown details. It takes less than a minute!', color: '#fff7ed', accent: '#f97316' },
              { step: '02', title: 'Find Your Community', desc: 'Search for communities from your city or village, or create a new one for your hometown.', color: '#f5f3ff', accent: '#8b5cf6' },
              { step: '03', title: 'Connect & Engage', desc: 'Share posts, join events, engage in discussions, and strengthen your hometown bonds.', color: '#ecfeff', accent: '#06b6d4' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: 900, color: item.accent,
                  border: `2px solid ${item.accent}20`
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1c1917' }}>{item.title}</h3>
                <p style={{ color: '#78716c', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1rem', background: '#fafaf9' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-green" style={{ marginBottom: '0.75rem' }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#1c1917' }}>
              Loved by communities across India
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 20, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1rem'
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1c1917' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#78716c' }}>{t.city}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f97316" color="#f97316" />)}
                </div>
                <p style={{ color: '#57534e', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 1rem',
        background: 'linear-gradient(135deg, #f97316 0%, #8b5cf6 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
            Ready to find your hometown community?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Join thousands of people staying connected to their roots while building
            meaningful relationships across cities and villages.
          </p>
          <Link href="/auth/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem 2.5rem', background: 'white', color: '#f97316',
            borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.2s'
          }}>
            Get Started – It&apos;s Free! <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1c1917', color: '#a8a29e', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MapPin size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
              Hometown <span style={{ color: '#f97316' }}>Hub</span>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: 400 }}>
            A digital community platform connecting people to their cities, villages, and hometowns across India.
          </p>
          <div style={{ borderTop: '1px solid #292524', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span>© 2026 Hometown Hub. All rights reserved.</span>
            <span>Built with ❤️ for local communities</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
