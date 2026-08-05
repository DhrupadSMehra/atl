import mongoose, { Schema, Document } from 'mongoose';

export type AdminPosition = 
  | 'President' 
  | 'Vice President' 
  | 'Head' 
  | 'Coordinator' 
  | 'Faculty' 
  | 'Teacher' 
  | 'Mentor';

export interface IAdminProfile {
  displayName: string;
  position: AdminPosition;
  createdAt: Date;
}

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: 'viewer' | 'admin';
  adminProfile?: IAdminProfile;
  createdAt: Date;
  updatedAt: Date;
}

const AdminProfileSchema = new Schema<IAdminProfile>(
  {
    displayName: { type: String, required: true, trim: true },
    position: { 
      type: String, 
      required: true,
      enum: ['President', 'Vice President', 'Head', 'Coordinator', 'Faculty', 'Teacher', 'Mentor'] 
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['viewer', 'admin'], default: 'viewer', index: true },
    adminProfile: { type: AdminProfileSchema, default: undefined }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
