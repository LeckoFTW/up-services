import mongoose, { Schema } from 'mongoose';

export const Role = mongoose.model('role', new Schema({
  name: { type: String, required: true },
}));

