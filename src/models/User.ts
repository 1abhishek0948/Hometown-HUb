import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  hometown?: string;
  city?: string;
  state?: string;
  role: 'user' | 'moderator' | 'admin';
  joinedCommunities: mongoose.Types.ObjectId[];
  createdCommunities: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isVerified: boolean;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    hometown: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    joinedCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    createdCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
