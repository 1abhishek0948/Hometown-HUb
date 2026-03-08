import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  country: string;
  coverImage?: string;
  avatar?: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  rules: string[];
  isApproved: boolean;
  isPrivate: boolean;
  memberCount: number;
  category: string;
  tags: string[];
  createdAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    coverImage: { type: String, default: '' },
    avatar: { type: String, default: '' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rules: [{ type: String }],
    isApproved: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    memberCount: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CommunitySchema.pre('save', function (this: any) {
  this.memberCount = this.members.length;
});

export default mongoose.models.Community || mongoose.model<ICommunity>('Community', CommunitySchema);
