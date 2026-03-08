import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const comments = await Comment.find({ post: id, parentComment: { $exists: false } })
      .populate('author', 'name avatar city')
      .sort({ createdAt: -1 });
    return NextResponse.json({ comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { content, parentComment } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const comment = await Comment.create({ post: id, author: user._id, content, parentComment });
    await Post.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    if (post.author.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: user._id,
        type: 'comment',
        message: `${user.name} commented on your post`,
        relatedPost: post._id,
      });
    }

    const populated = await comment.populate('author', 'name avatar city');
    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
