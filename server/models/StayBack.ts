import mongoose, { Schema, Document } from 'mongoose';
import { DepartmentEnum } from './Member.js';

export type StayBackStatusEnum = 
  | 'DRAFT'
  | 'OPEN'
  | 'CLOSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IStayBack extends Document {
  title: string;
  projectName: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  applicationDeadline: Date;
  maxParticipants: number;
  requiredDepartments: DepartmentEnum[];
  status: StayBackStatusEnum;
  createdBy?: mongoose.Types.ObjectId;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StayBackSchema = new Schema<IStayBack>(
  {
    title: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    applicationDeadline: { type: Date, required: true, index: true },
    maxParticipants: { type: Number, required: true, min: 1 },
    requiredDepartments: [
      {
        type: String,
        enum: ['TECHNICAL', 'CREATIVE', 'PHOTOGRAPHY', 'SOCIAL_MEDIA', 'MARKETING', 'HOSPITALITY'],
        required: true
      }
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, default: 'ATL Head' }
  },
  { timestamps: true }
);

export const StayBack = mongoose.model<IStayBack>('StayBack', StayBackSchema);
