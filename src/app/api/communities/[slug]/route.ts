import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    await connectDB();
    const community = await Community.findOne({ slug: slug })
      .populate('creator', 'name avatar email')
      .populate('members', 'name avatar city hometown')
      .populate('moderators', 'name avatar');

    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    return NextResponse.json({ community });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    const community = await Community.findOne({ slug: slug });
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const isMod = community.moderators.some((m: any) => m.toString() === user._id.toString());
    const isAdmin = user.role === 'admin';
    if (!isMod && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updates = await req.json();
    const allowed = ['description', 'rules', 'coverImage', 'avatar', 'isPrivate', 'category', 'tags', 'isApproved'];
    const safeUpdates: any = {};
    allowed.forEach((k) => { if (updates[k] !== undefined) safeUpdates[k] = updates[k]; });

    const updated = await Community.findOneAndUpdate({ slug: slug }, safeUpdates, { new: true });
    return NextResponse.json({ community: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
