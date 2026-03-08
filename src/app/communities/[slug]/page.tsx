'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  MapPin, Users, Calendar, Heart, MessageCircle, Share2,
  Pin, Plus, Filter, Megaphone, Globe, Lock, UserCheck, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  content: string;
  images: string[];
  type: 'post' | 'announcement';
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  likes: string[];
  author: { _id: string; name: string; avatar: string; city: string };
  community: { name: string; slug: string };
  createdAt: string;
}

interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  memberCount: number;
  members: { _id: string; name: string; avatar: string; city: string }[];
  moderators: { _id: string; name: string }[];
  creator: { _id: string; name: string; email: string };
  rules: string[];
  category: string;
  tags: string[];
  isApproved: boolean;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostCard({ post, onLike, onPin, userId, isMod }: any) {
  return (
    <div className="card fade-in" style={{ marginBottom: '1rem' }}>
      {post.isPinned && (
        <div className="pinned-ribbon">
          <Pin size={12} /> Pinned Announcement
        </div>
      )}
      {post.type === 'announcement' && !post.isPinned && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Megaphone size={12} /> Announcement
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700
        }}>
          {post.author.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.author.name}</span>
            {post.author.city && <span style={{ fontSize: '0.75rem', color: '#78716c' }}>from {post.author.city}</span>}
            <span style={{ fontSize: '0.75rem', color: '#a8a29e', marginLeft: 'auto' }}>{timeAgo(post.createdAt)}</span>
          </div>
          <p style={{ color: '#292524', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f5f5f4', paddingTop: '0.75rem' }}>
            <button onClick={() => onLike(post._id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: post.likes?.includes(userId) ? '#fff7ed' : 'transparent',
                color: post.likes?.includes(userId) ? '#f97316' : '#78716c',
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
              }}>
              <Heart size={14} fill={post.likes?.includes(userId) ? '#f97316' : 'none'} />
              {post.likeCount || 0}
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.75rem', borderRadius: 8, border: 'none',
              background: 'transparent', color: '#78716c', fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              <MessageCircle size={14} /> {post.commentCount || 0}
            </button>
            {isMod && (
              <button onClick={() => onPin(post._id, !post.isPinned)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.75rem', borderRadius: 8, border: 'none',
                  background: post.isPinned ? '#fff7ed' : 'transparent',
                  color: post.isPinned ? '#f97316' : '#78716c', fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginLeft: 'auto'
                }}>
                <Pin size={12} /> {post.isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { data: session } = useSession();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<'feed' | 'members' | 'events' | 'about'>('feed');
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'post' | 'announcement'>('post');
  const [showPostForm, setShowPostForm] = useState(false);

  const userId = (session?.user as any)?.id;
  const isMember = community?.members?.some((m) => m._id.toString() === userId);
  const isMod = community?.moderators?.some((m) => m._id.toString() === userId) || (session?.user as any)?.role === 'admin';

  const fetchCommunity = async () => {
    const res = await fetch(`/api/communities/${slug}`);
    const data = await res.json();
    setCommunity(data.community);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const res = await fetch(`/api/posts?community=${slug}&limit=20`);
    const data = await res.json();
    setPosts(data.posts || []);
  };

  useEffect(() => { fetchCommunity(); fetchPosts(); }, [slug]);

  const handleJoin = async () => {
    if (!session) { toast.error('Please sign in first'); return; }
    setJoining(true);
    const res = await fetch(`/api/communities/${slug}/join`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchCommunity(); }
    else toast.error(data.error);
    setJoining(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPostLoading(true);
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPost, communitySlug: slug, type: postType }),
    });
    const data = await res.json();
    if (res.ok) { toast.success('Post shared!'); setPosts([data.post, ...posts]); setNewPost(''); setShowPostForm(false); }
    else toast.error(data.error);
    setPostLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!session) { toast.error('Please sign in'); return; }
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setPosts(posts.map((p) => {
        if (p._id !== postId) return p;
        const liked = p.likes?.includes(userId);
        return {
          ...p,
          likeCount: data.likeCount,
          likes: liked ? p.likes.filter((id) => id !== userId) : [...(p.likes || []), userId],
        };
      }));
    }
  };

  const handlePin = async (postId: string, pin: boolean) => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: pin }),
    });
    if (res.ok) { toast.success(pin ? 'Post pinned!' : 'Post unpinned'); fetchPosts(); }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: '#78716c' }}>Loading community...</div>
        </main>
      </div>
    </div>
  );

  if (!community) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h2>Community not found</h2>
        <Link href="/communities" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Browse Communities</Link>
      </div>
    </div>
  );

  if (!community.isApproved) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2>This community is pending approval</h2>
        <p style={{ color: '#78716c', marginTop: '0.5rem' }}>An admin will review it shortly.</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {/* Community Header */}
          <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', padding: 0 }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, #f97316, #8b5cf6)' }} />
            <div style={{ padding: '1.25rem', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.25rem' }}>{community.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontSize: '0.85rem' }}>
                      <MapPin size={14} /> {community.city}{community.state ? `, ${community.state}` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontSize: '0.85rem' }}>
                      <Users size={14} /> {community.memberCount} members
                    </div>
                    <span className="badge badge-orange">{community.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {isMember ? (
                    <>
                      <button onClick={() => setShowPostForm(!showPostForm)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        <Plus size={14} /> New Post
                      </button>
                      <button onClick={handleJoin} disabled={joining}
                        style={{ padding: '0.5rem 1rem', border: '1.5px solid #e7e5e4', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: '#78716c' }}>
                        {joining ? '...' : 'Leave'}
                      </button>
                    </>
                  ) : (
                    <button onClick={handleJoin} disabled={joining} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                      {joining ? '...' : <><UserCheck size={14} /> Join Community</>}
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: '#57534e', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{community.description}</p>
              <div>
                {community.tags?.map((tag) => (
                  <span key={tag} style={{ display: 'inline-block', fontSize: '0.75rem', color: '#78716c', background: '#f5f5f4', padding: '2px 10px', borderRadius: 20, marginRight: 6, marginBottom: 4 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
            {(['feed', 'members', 'about'] as const).map((t) => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Feed Tab */}
          {tab === 'feed' && (
            <div>
              {/* New Post Form */}
              {showPostForm && session && (
                <div className="card fade-in" style={{ marginBottom: '1rem' }}>
                  <form onSubmit={handlePost}>
                    {isMod && (
                      <div className="tab-bar" style={{ marginBottom: '0.75rem' }}>
                        <button type="button" className={`tab-btn${postType === 'post' ? ' active' : ''}`} onClick={() => setPostType('post')}>Post</button>
                        <button type="button" className={`tab-btn${postType === 'announcement' ? ' active' : ''}`} onClick={() => setPostType('announcement')}>Announcement</button>
                      </div>
                    )}
                    <textarea className="form-input" rows={4} placeholder={`Share something with ${community.name}...`}
                      value={newPost} onChange={(e) => setNewPost(e.target.value)}
                      style={{ resize: 'vertical', marginBottom: '0.75rem' }} required />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button type="button" className="btn-ghost" onClick={() => setShowPostForm(false)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={postLoading} style={{ fontSize: '0.85rem' }}>
                        {postLoading ? 'Posting...' : `Share ${postType === 'announcement' ? 'Announcement' : 'Post'}`}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Posts */}
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                  <p>No posts yet. Be the first to share!</p>
                  {isMember && (
                    <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowPostForm(true)}>
                      <Plus size={14} /> Create Post
                    </button>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} onLike={handleLike} onPin={handlePin} userId={userId} isMod={isMod} />
                ))
              )}
            </div>
          )}

          {/* Members Tab */}
          {tab === 'members' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Members ({community.memberCount})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {community.members?.slice(0, 30).map((member) => (
                  <Link key={member._id} href={`/profile/${member._id}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.625rem', borderRadius: 12, border: '1px solid #f5f5f4', background: '#fafaf9', transition: 'all 0.2s' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.875rem', position: 'relative'
                    }}>
                      {member.name[0]}
                      {community.moderators?.some((m) => m._id === member._id) && (
                        <Crown size={10} color="#f59e0b" style={{ position: 'absolute', top: -4, right: -4 }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1c1917' }}>{member.name}</div>
                      {member.city && <div style={{ fontSize: '0.7rem', color: '#78716c' }}>{member.city}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* About Tab */}
          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>About this Community</h3>
                <p style={{ color: '#57534e', lineHeight: 1.7 }}>{community.description}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontSize: '0.85rem' }}>
                    <MapPin size={14} /> {community.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontSize: '0.85rem' }}>
                    <Users size={14} /> {community.memberCount} members
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1917' }}>Created by: </span>
                  <span style={{ fontSize: '0.8rem', color: '#78716c' }}>{community.creator?.name}</span>
                </div>
              </div>

              {community.rules?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Community Rules</h3>
                  <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {community.rules.map((rule, i) => (
                      <li key={i} style={{ color: '#57534e', fontSize: '0.875rem' }}>{rule}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
