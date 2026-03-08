import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';

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

    const hasLiked = post.likes.includes(user._id);
    if (hasLiked) {
      post.likes.pull(user._id);
    } else {
      post.likes.push(user._id);
      // Notify post author
      if (post.author.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: user._id,
          type: 'like',
          message: `${user.name} liked your post`,
          relatedPost: post._id,
        });
      }
    }
    post.likeCount = post.likes.length;
    await post.save();

    return NextResponse.json({ liked: !hasLiked, likeCount: post.likeCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
