import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Community from '@/models/Community';
import Post from '@/models/Post';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [totalUsers, totalCommunities, pendingCommunities, totalPosts, totalEvents, recentUsers, communitiesForApproval] =
      await Promise.all([
        User.countDocuments(),
        Community.countDocuments({ isApproved: true }),
        Community.countDocuments({ isApproved: false }),
        Post.countDocuments(),
        Event.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(10).select('name email role city hometown createdAt avatar'),
        Community.find({ isApproved: false })
          .populate('creator', 'name email')
          .sort({ createdAt: -1 })
          .limit(20),
      ]);

    return NextResponse.json({
      stats: { totalUsers, totalCommunities, pendingCommunities, totalPosts, totalEvents },
      recentUsers,
      communitiesForApproval,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { action, targetId, targetType, value } = await req.json();

    if (action === 'approveCommunity') {
      await Community.findByIdAndUpdate(targetId, { isApproved: true });
      return NextResponse.json({ message: 'Community approved' });
    }
    if (action === 'rejectCommunity') {
      await Community.findByIdAndDelete(targetId);
      return NextResponse.json({ message: 'Community rejected' });
    }
    if (action === 'changeUserRole') {
      await User.findByIdAndUpdate(targetId, { role: value });
      return NextResponse.json({ message: 'User role updated' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
