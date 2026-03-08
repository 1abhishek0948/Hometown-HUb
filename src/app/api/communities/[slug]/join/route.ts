import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const [user, community] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Community.findOne({ slug: slug }),
    ]);
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const isMember = community.members.includes(user._id);

    if (isMember) {
      // Leave
      await Community.findByIdAndUpdate(community._id, {
        $pull: { members: user._id },
        $inc: { memberCount: -1 },
      });
      await User.findByIdAndUpdate(user._id, { $pull: { joinedCommunities: community._id } });
      return NextResponse.json({ message: 'Left community', joined: false });
    } else {
      // Join
      await Community.findByIdAndUpdate(community._id, {
        $addToSet: { members: user._id },
        $inc: { memberCount: 1 },
      });
      await User.findByIdAndUpdate(user._id, { $addToSet: { joinedCommunities: community._id } });

      // Notify creator
      await Notification.create({
        recipient: community.creator,
        sender: user._id,
        type: 'join',
        message: `${user.name} joined your community "${community.name}"`,
        relatedCommunity: community._id,
      });

      return NextResponse.json({ message: 'Joined community', joined: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
