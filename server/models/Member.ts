import mongoose, { Schema, Document } from 'mongoose';

export type DepartmentEnum = 
  | 'TECHNICAL'
  | 'CREATIVE'
  | 'PHOTOGRAPHY'
  | 'SOCIAL_MEDIA'
  | 'MARKETING'
  | 'HOSPITALITY';

export type MemberRoleEnum = 'MEMBER' | 'ADMIN';

export interface IMember extends Document {
  googleId?: string;
  userId?: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  studentClass: string;
  section: string;
  contactNumber: string;
  department: DepartmentEnum;
  role: MemberRoleEnum;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    googleId: { type: String, unique: true, sparse: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    studentClass: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    contactNumber: { 
      type: String, 
      required: true, 
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{10}$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid 10-digit phone number!`
      }
    },
    department: {
      type: String,
      required: true,
      enum: ['TECHNICAL', 'CREATIVE', 'PHOTOGRAPHY', 'SOCIAL_MEDIA', 'MARKETING', 'HOSPITALITY'],
      uppercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['MEMBER', 'ADMIN'],
      default: 'MEMBER',
      index: true
    },
    profileCompleted: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Member = mongoose.model<IMember>('Member', MemberSchema);
