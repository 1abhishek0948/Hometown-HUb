'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { MapPin, Users, ArrowRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['General', 'City', 'Village/Town', 'Culture', 'Sports', 'Education', 'Business', 'Agriculture', 'Youth', 'Women'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Kerala', 'Punjab', 'Haryana', 'Other'];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', city: '', state: '', country: 'India',
    category: 'General', tags: '', rules: '', isPrivate: false,
  });

  if (!session) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Please sign in to create a community</h2>
          <Link href="/auth/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Sign In</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.city) {
      toast.error('Name, description, and city are required'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        rules: form.rules.split('\n').map((r) => r.trim()).filter(Boolean),
      };
      const res = await fetch('/api/communities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Community created! Pending admin approval.');
        router.push('/communities');
      } else toast.error(data.error || 'Failed to create community');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>Create a Community</h1>
            <p style={{ color: '#78716c', fontSize: '0.9rem' }}>Start a new space for your city, village, or hometown</p>
          </div>

          <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Info size={18} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.85rem', color: '#7c2d12' }}>
              Your community will be reviewed by an admin before being made public. This usually takes a few hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Basic Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Community Name *</label>
                  <input name="name" className="form-input" placeholder="e.g. Nashik Foodies Circle" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Description *</label>
                  <textarea name="description" className="form-input" rows={4} placeholder="Describe what your community is about, who it's for, and what members can expect..."
                    value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">City / Village *</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                      <input name="city" className="form-input" placeholder="e.g. Nashik" value={form.city} onChange={handleChange} style={{ paddingLeft: 36 }} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <select name="state" className="form-input" value={form.state} onChange={handleChange}>
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tags (comma-separated)</label>
                  <input name="tags" className="form-input" placeholder="e.g. food, culture, festivals, nashik"
                    value={form.tags} onChange={handleChange} />
                  <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.25rem' }}>Help others discover your community</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '1rem' }}>Community Rules</h2>
              <p style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '0.75rem' }}>Optional: Add rules to guide member behavior (one per line)</p>
              <textarea name="rules" className="form-input" rows={4} placeholder="Be respectful to all members.&#10;No hate speech or offensive content.&#10;Post only relevant local content."
                value={form.rules} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Private Community</div>
                  <div style={{ fontSize: '0.8rem', color: '#78716c' }}>Members need approval to join</div>
                </div>
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                  <div style={{
                    width: 44, height: 24, background: form.isPrivate ? '#f97316' : '#d6d3d1',
                    borderRadius: 12, transition: 'background 0.2s', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form.isPrivate ? 22 : 2,
                      width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s'
                    }} />
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link href="/communities" className="btn-ghost">Cancel</Link>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : <><span>Create Community</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
