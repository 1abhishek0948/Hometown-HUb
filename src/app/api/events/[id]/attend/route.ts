import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const [user, event] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Event.findById(id),
    ]);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const isAttending = event.attendees.includes(user._id);
    if (isAttending) {
      event.attendees.pull(user._id);
      await event.save();
      return NextResponse.json({ attending: false, count: event.attendees.length });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is full' }, { status: 409 });
    }

    event.attendees.push(user._id);
    await event.save();
    return NextResponse.json({ attending: true, count: event.attendees.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
