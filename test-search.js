const mongoose = require('mongoose');
const { User } = require('./server/models/User');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const q = 'Riddhiman';
  let filter = { isBanned: { $ne: true } };
  filter.$or = [
    { name: { $regex: new RegExp(q, 'i') } },
    { 'adminProfile.displayName': { $regex: new RegExp(q, 'i') } }
  ];
  
  const users = await User.find(filter).select('name adminProfile _id');
  console.log(users);
  
  await mongoose.disconnect();
}
main().catch(console.error);
