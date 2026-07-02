import mongoose from 'mongoose';

export const USER_MODEL = 'User';
export const UserSchema = new mongoose.Schema({ name: String });
