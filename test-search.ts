import mongoose from 'mongoose';
import { User } from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const q = 'Riddhiman';
  let filter: any = { isBanned: { $ne: true } };
  filter.$or = [
    { name: { $regex: new RegExp(q, 'i') } },
    { 'adminProfile.displayName': { $regex: new RegExp(q, 'i') } }
  ];
  const users = await User.find(filter).select('name adminProfile _id');
  console.log(users);
  await mongoose.disconnect();
}
main().catch(console.error);
