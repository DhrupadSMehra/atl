import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatusEnum = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface IStayBackApplication extends Document {
  stayBackId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  status: ApplicationStatusEnum;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  internalNotes?: string; // Visible ONLY to administrators
  memberMessage?: string; // Visible to the applicant
  createdAt: Date;
  updatedAt: Date;
}

const StayBackApplicationSchema = new Schema<IStayBackApplication>(
  {
    stayBackId: { type: Schema.Types.ObjectId, ref: 'StayBack', required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    internalNotes: { type: String, trim: true, default: '' },
    memberMessage: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

// Compound Unique Index preventing duplicate applications per member per stayback
StayBackApplicationSchema.index({ stayBackId: 1, memberId: 1 }, { unique: true });

export const StayBackApplication = mongoose.model<IStayBackApplication>(
  'StayBackApplication',
  StayBackApplicationSchema
);
