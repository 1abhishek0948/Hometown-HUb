import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const query: any = { isApproved: true };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Community.countDocuments(query);
    const communities = await Community.find(query)
      .populate('creator', 'name avatar')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ communities, total, page, totalPages: Math.ceil(total / limit) });
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

    const { name, description, city, state, country, category, tags, rules, isPrivate } = await req.json();
    if (!name || !description || !city) {
      return NextResponse.json({ error: 'Name, description, and city are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const community = await Community.create({
      name, slug, description, city, state, country, category,
      tags: tags || [],
      rules: rules || [],
      isPrivate: isPrivate || false,
      creator: user._id,
      members: [user._id],
      moderators: [user._id],
      isApproved: user.role === 'admin',
      memberCount: 1,
    });

    await User.findByIdAndUpdate(user._id, { $push: { joinedCommunities: community._id, createdCommunities: community._id } });

    return NextResponse.json({ community, message: 'Community created and pending approval' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
