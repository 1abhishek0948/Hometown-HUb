import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  type: 'post' | 'announcement';
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isApproved: boolean;
  tags: string[];
  sharedFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    type: { type: String, enum: ['post', 'announcement'], default: 'post' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    tags: [{ type: String }],
    sharedFrom: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

PostSchema.pre('save', function (this: any) {
  this.likeCount = this.likes.length;
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
