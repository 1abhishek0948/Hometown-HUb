import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'join' | 'event' | 'announcement' | 'approved' | 'mention';
  message: string;
  relatedPost?: mongoose.Types.ObjectId;
  relatedEvent?: mongoose.Types.ObjectId;
  relatedCommunity?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'join', 'event', 'announcement', 'approved', 'mention'],
      required: true,
    },
    message: { type: String, required: true },
    relatedPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    relatedEvent: { type: Schema.Types.ObjectId, ref: 'Event' },
    relatedCommunity: { type: Schema.Types.ObjectId, ref: 'Community' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
