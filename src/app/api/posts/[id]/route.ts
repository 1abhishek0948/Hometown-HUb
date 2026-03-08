import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name avatar city hometown')
      .populate('community', 'name slug avatar');
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const [user, post] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Post.findById(id),
    ]);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const isAuthor = post.author.toString() === user._id.toString();
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { content, isPinned } = await req.json();
    const updates: any = {};
    if (content !== undefined) updates.content = content;
    if (isPinned !== undefined && isAdmin) updates.isPinned = isPinned;

    const updated = await Post.findByIdAndUpdate(id, updates, { new: true })
      .populate('author', 'name avatar')
      .populate('community', 'name slug');

    return NextResponse.json({ post: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const [user, post] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Post.findById(id),
    ]);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const isAuthor = post.author.toString() === user._id.toString();
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
