import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Community from '@/models/Community';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const communitySlug = searchParams.get('community');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

    const query: any = { status: { $in: ['upcoming', 'ongoing'] }, date: { $gte: new Date() } };

    if (communitySlug) {
      const community = await Community.findOne({ slug: communitySlug });
      if (community) query.community = community._id;
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name avatar')
      .populate('community', 'name slug avatar')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ events, total, page, totalPages: Math.ceil(total / limit) });
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

    const { title, description, communitySlug, date, endDate, location, isOnline, meetLink, maxAttendees, category, tags } = await req.json();
    if (!title || !description || !communitySlug || !date) {
      return NextResponse.json({ error: 'Title, description, community, and date are required' }, { status: 400 });
    }

    const community = await Community.findOne({ slug: communitySlug });
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const event = await Event.create({
      title, description,
      community: community._id,
      organizer: user._id,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location: location || '',
      isOnline: isOnline || false,
      meetLink,
      maxAttendees,
      attendees: [user._id],
      category: category || 'Community',
      tags: tags || [],
    });

    // Notify community members
    const memberIds = community.members.filter((m: any) => m.toString() !== user._id.toString());
    const notifications = memberIds.slice(0, 100).map((memberId: any) => ({
      recipient: memberId,
      sender: user._id,
      type: 'event',
      message: `New event "${title}" in ${community.name}`,
      relatedEvent: event._id,
      relatedCommunity: community._id,
    }));
    if (notifications.length) await Notification.insertMany(notifications);

    const populated = await event.populate([
      { path: 'organizer', select: 'name avatar' },
      { path: 'community', select: 'name slug avatar' },
    ]);
    return NextResponse.json({ event: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
