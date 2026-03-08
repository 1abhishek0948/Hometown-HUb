import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Community from '@/models/Community';
import Post from '@/models/Post';
import Event from '@/models/Event';

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Community.deleteMany({}),
      Post.deleteMany({}),
      Event.deleteMany({}),
    ]);

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hometownhub.com',
      password: 'admin123',
      role: 'admin',
      city: 'Mumbai',
      hometown: 'Pune',
      bio: 'Platform administrator',
    });

    const moderator = await User.create({
      name: 'Priya Sharma',
      email: 'priya@hometownhub.com',
      password: 'user123',
      role: 'moderator',
      city: 'Delhi',
      hometown: 'Jaipur',
      bio: 'Community moderator & local activist',
    });

    const usersData = [
      { name: 'Rahul Gupta', email: 'rahul@example.com', password: 'user123', city: 'Mumbai', hometown: 'Nashik', bio: 'Software engineer from Nashik', role: 'user' },
      { name: 'Anita Patel', email: 'anita@example.com', password: 'user123', city: 'Ahmedabad', hometown: 'Surat', bio: 'Teacher & community enthusiast', role: 'user' },
      { name: 'Vikram Singh', email: 'vikram@example.com', password: 'user123', city: 'Bangalore', hometown: 'Chandigarh', bio: 'Startup founder', role: 'user' },
      { name: 'Sunita Devi', email: 'sunita@example.com', password: 'user123', city: 'Chennai', hometown: 'Varanasi', bio: 'Homemaker & culture preservationist', role: 'user' },
      { name: 'Arjun Nair', email: 'arjun@example.com', password: 'user123', city: 'Kochi', hometown: 'Trivandrum', bio: 'Doctor and weekend photographer', role: 'user' },
    ];
    const users = await Promise.all(usersData.map((u) => User.create(u)));

    const allUsers = [admin, moderator, ...users];

    // Create communities
    const mumbaian = await Community.create({
      name: 'Mumbaikars Connect',
      slug: 'mumbaikars-connect',
      description: 'A community for people living in or from Mumbai. Share stories, events, and connect with fellow Mumbaikars.',
      city: 'Mumbai',
      state: 'Maharashtra',
      category: 'City',
      tags: ['mumbai', 'maharashtra', 'city-life'],
      creator: admin._id,
      members: allUsers.slice(0, 4).map((u) => u._id),
      moderators: [admin._id, moderator._id],
      isApproved: true,
      memberCount: 4,
    });

    const delhiHub = await Community.create({
      name: 'Delhi Dillwalon Ka',
      slug: 'delhi-dillwalon-ka',
      description: 'Connect with people from Delhi NCR. Discuss local news, events, food, and everything Delhi.',
      city: 'Delhi',
      state: 'Delhi',
      category: 'City',
      tags: ['delhi', 'ncr', 'north-india'],
      creator: moderator._id,
      members: allUsers.slice(1, 5).map((u) => u._id),
      moderators: [moderator._id],
      isApproved: true,
      memberCount: 4,
    });

    const nashikFarm = await Community.create({
      name: 'Nashik Farmers & Foodies',
      slug: 'nashik-farmers-foodies',
      description: 'For people from Nashik – discuss local agriculture, wine tourism, festivals and reconnect with roots.',
      city: 'Nashik',
      state: 'Maharashtra',
      category: 'Village/Town',
      tags: ['nashik', 'farming', 'wine', 'festivals'],
      creator: users[0]._id,
      members: [users[0]._id, admin._id, moderator._id],
      moderators: [users[0]._id],
      isApproved: true,
      memberCount: 3,
    });

    const pendingCommunity = await Community.create({
      name: 'Varanasi Ghaat Community',
      slug: 'varanasi-ghaat-community',
      description: 'Connect with people from the holy city of Varanasi. Share culture, traditions and news.',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      category: 'City',
      tags: ['varanasi', 'culture', 'ghaat'],
      creator: users[3]._id,
      members: [users[3]._id],
      moderators: [users[3]._id],
      isApproved: false,
      memberCount: 1,
    });

    const jaipur = await Community.create({
      name: 'Jaipur Pink City Hub',
      slug: 'jaipur-pink-city-hub',
      description: 'For Jaipurites across the world. Celebrate culture, heritage, and the spirit of the Pink City.',
      city: 'Jaipur',
      state: 'Rajasthan',
      category: 'City',
      tags: ['jaipur', 'rajasthan', 'heritage', 'pink-city'],
      creator: moderator._id,
      members: [moderator._id, admin._id, users[2]._id],
      moderators: [moderator._id],
      isApproved: true,
      memberCount: 3,
    });

    // Update user joinedCommunities
    await User.findByIdAndUpdate(admin._id, { joinedCommunities: [mumbaian._id, delhiHub._id, nashikFarm._id, jaipur._id] });
    await User.findByIdAndUpdate(moderator._id, { joinedCommunities: [mumbaian._id, delhiHub._id, nashikFarm._id, jaipur._id] });

    // Create posts
    const post1 = await Post.create({
      author: admin._id,
      community: mumbaian._id,
      content: '🎉 Welcome to Mumbaikars Connect! This is your go-to space for all things Mumbai. Share your local stories, upcoming events, and connect with fellow Mumbaikars from around the world. Let\'s keep the Mumbai spirit alive! 🌊',
      type: 'announcement',
      isPinned: true,
      isApproved: true,
      likes: [users[0]._id, users[1]._id, moderator._id],
      likeCount: 3,
    });

    const post2 = await Post.create({
      author: users[0]._id,
      community: mumbaian._id,
      content: 'Anyone else missing the monsoon vibes at Marine Drive? Just moved to Bangalore but those memories are irreplaceable 🌧️ The sound of waves and the street food... nothing beats it!',
      type: 'post',
      isApproved: true,
      likes: [admin._id, moderator._id],
      likeCount: 2,
      commentCount: 1,
    });

    const post3 = await Post.create({
      author: moderator._id,
      community: delhiHub._id,
      content: '📢 ANNOUNCEMENT: The annual Dilli Haat Winter Festival is coming up next month! A great opportunity to support local artisans and enjoy Delhi\'s diverse cultural offerings. Mark your calendars! 🎨',
      type: 'announcement',
      isPinned: true,
      isApproved: true,
      likes: [users[1]._id, users[2]._id, admin._id],
      likeCount: 3,
    });

    const post4 = await Post.create({
      author: users[1]._id,
      community: delhiHub._id,
      content: 'Looking for recommendations for the best chhole bhature in Old Delhi! My family is visiting next week and I want to show them the real Delhi food experience 😋',
      type: 'post',
      isApproved: true,
      likes: [moderator._id],
      likeCount: 1,
      commentCount: 2,
    });

    const post5 = await Post.create({
      author: users[0]._id,
      community: nashikFarm._id,
      content: 'Grape harvest season is starting in Nashik! 🍇 If you\'re planning to visit, this is the best time. The vineyards are beautiful and you can do wine tastings. Who wants to organize a community trip?',
      type: 'post',
      isApproved: true,
      likes: [admin._id, moderator._id, users[3]._id],
      likeCount: 3,
      commentCount: 1,
    });

    // Create events
    await Event.insertMany([
      {
        title: 'Mumbai Beach Cleanup Drive',
        description: 'Join us for a community beach cleanup at Juhu Beach. Let\'s keep our city clean! Bring gloves and bags. Refreshments will be provided to all volunteers.',
        community: mumbaian._id,
        organizer: admin._id,
        date: new Date('2026-03-15T08:00:00'),
        endDate: new Date('2026-03-15T12:00:00'),
        location: 'Juhu Beach, Mumbai',
        isOnline: false,
        attendees: [admin._id, users[0]._id, moderator._id],
        category: 'Social',
        tags: ['cleanup', 'environment', 'community'],
        status: 'upcoming',
      },
      {
        title: 'Virtual Nashik Heritage Walk',
        description: 'A virtual guided tour of Nashik\'s historical monuments, temples, and vineyards. Perfect for Nashikars living away from home who want to reconnect with their roots.',
        community: nashikFarm._id,
        organizer: users[0]._id,
        date: new Date('2026-03-20T18:00:00'),
        endDate: new Date('2026-03-20T20:00:00'),
        isOnline: true,
        meetLink: 'https://meet.google.com/example',
        attendees: [users[0]._id, admin._id],
        maxAttendees: 50,
        category: 'Culture',
        tags: ['heritage', 'virtual', 'nashik'],
        status: 'upcoming',
      },
      {
        title: 'Delhi Food Walk – Old Delhi',
        description: 'Explore the narrow lanes of Old Delhi and taste iconic street foods! From paranthas at Paranthe Wali Gali to dahi bhalle at Natraj. A culinary journey through history.',
        community: delhiHub._id,
        organizer: moderator._id,
        date: new Date('2026-03-25T10:00:00'),
        location: 'Chandni Chowk Metro Station Exit 6, Delhi',
        isOnline: false,
        attendees: [moderator._id, users[1]._id, users[2]._id],
        maxAttendees: 30,
        category: 'Food',
        tags: ['food', 'olddelhi', 'streetfood'],
        status: 'upcoming',
      },
      {
        title: 'Jaipur Holi Celebration 2026',
        description: 'Celebrate Holi with fellow Jaipurites! Traditional colors, folk music, and Rajasthani delicacies. A tribute to the Pink City\'s vibrant culture.',
        community: jaipur._id,
        organizer: moderator._id,
        date: new Date('2026-03-14T10:00:00'),
        location: 'Amer Fort Grounds, Jaipur',
        isOnline: false,
        attendees: [moderator._id, admin._id],
        category: 'Festival',
        tags: ['holi', 'jaipur', 'festival', 'rajasthan'],
        status: 'upcoming',
      },
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        users: allUsers.length,
        communities: 5,
        posts: 5,
        events: 4,
        credentials: [
          { role: 'admin', email: 'admin@hometownhub.com', password: 'admin123' },
          { role: 'moderator', email: 'priya@hometownhub.com', password: 'user123' },
          { role: 'user', email: 'rahul@example.com', password: 'user123' },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
