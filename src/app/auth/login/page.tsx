'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { toast.error('Invalid email or password'); }
      else { toast.success('Welcome back!'); router.push('/communities'); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const demoLogin = async (email: string, password: string) => {
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { toast.error('Demo login failed'); setLoading(false); }
    else { toast.success('Logged in as demo user!'); router.push('/communities'); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 30%, #ede9fe 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MapPin size={24} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1c1917' }}>
              Hometown <span style={{ color: '#f97316' }}>Hub</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Sign in to your community account</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #f5f5f4' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type="email" className="form-input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }} required />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type={showPwd ? 'text' : 'password'} className="form-input" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 38 }} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1, height: 1, background: '#e7e5e4' }} />
              <span style={{ fontSize: '0.75rem', color: '#78716c', whiteSpace: 'nowrap' }}>Demo accounts</span>
              <div style={{ flex: 1, height: 1, background: '#e7e5e4' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: '👑 Admin', email: 'admin@hometownhub.com', password: 'admin123' },
                { label: '🛡️ Moderator', email: 'priya@hometownhub.com', password: 'user123' },
                { label: '👤 User', email: 'rahul@example.com', password: 'user123' },
              ].map((d) => (
                <button key={d.email} onClick={() => demoLogin(d.email, d.password)} disabled={loading}
                  style={{
                    padding: '0.5rem 0.75rem', border: '1.5px solid #e7e5e4', borderRadius: 10,
                    background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', color: '#57534e'
                  }}>
                  <span>{d.label}</span>
                  <span style={{ color: '#a8a29e' }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#78716c' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
