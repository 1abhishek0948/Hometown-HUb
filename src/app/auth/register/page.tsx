'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Mail, Lock, User, Eye, EyeOff, Home, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Nashik', 'Vadodara', 'Patna', 'Bhopal',
  'Coimbatore', 'Kochi', 'Chandigarh', 'Varanasi', 'Agra', 'Amritsar',
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', hometown: '', city: '', state: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, and password are required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Registration failed'); return; }
      toast.success('Account created! Signing you in...');
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (!result?.error) router.push('/communities');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #ede9fe 0%, #fef3c7 50%, #fff7ed 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Join your community</h1>
          <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Create a free account to connect with your hometown</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #f5f5f4' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type="text" name="name" className="form-input" placeholder="Rahul Gupta"
                  value={form.name} onChange={handleChange} style={{ paddingLeft: 38 }} required />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type="email" name="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} style={{ paddingLeft: 38 }} required />
              </div>
            </div>

            <div>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type={showPwd ? 'text' : 'password'} name="password" className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} style={{ paddingLeft: 38, paddingRight: 38 }} required minLength={6} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ height: 1, background: '#f5f5f4' }} />

            <div>
              <label className="form-label">Hometown / Village</label>
              <div style={{ position: 'relative' }}>
                <Home size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <input type="text" name="hometown" className="form-input" placeholder="Your village or hometown"
                  value={form.hometown} onChange={handleChange} style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label className="form-label">Current City</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                <select name="city" className="form-input" value={form.city} onChange={handleChange}
                  style={{ paddingLeft: 38, cursor: 'pointer', appearance: 'none', color: form.city ? '#1c1917' : '#78716c' }}>
                  <option value="">Select your city</option>
                  {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#78716c' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
