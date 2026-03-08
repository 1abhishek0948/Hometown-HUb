import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  community: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  date: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  meetLink?: string;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    meetLink: { type: String },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    maxAttendees: { type: Number },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'Community' },
    tags: [{ type: String }],
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
