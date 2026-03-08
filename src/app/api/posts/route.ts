import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Community from '@/models/Community';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const communitySlug = searchParams.get('community');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = { isApproved: true };

    if (communitySlug) {
      const community = await Community.findOne({ slug: communitySlug });
      if (community) query.community = community._id;
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name avatar city hometown')
      .populate('community', 'name slug avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { content, communitySlug, images, type, tags } = await req.json();
    if (!content || !communitySlug) {
      return NextResponse.json({ error: 'Content and community are required' }, { status: 400 });
    }

    const community = await Community.findOne({ slug: communitySlug });
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const isMember = community.members.some((m: any) => m.toString() === user._id.toString());
    if (!isMember) return NextResponse.json({ error: 'You must join this community to post' }, { status: 403 });

    const post = await Post.create({
      author: user._id,
      community: community._id,
      content,
      images: images || [],
      type: type || 'post',
      tags: tags || [],
    });

    const populated = await post.populate([
      { path: 'author', select: 'name avatar city hometown' },
      { path: 'community', select: 'name slug avatar' },
    ]);

    return NextResponse.json({ post: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
