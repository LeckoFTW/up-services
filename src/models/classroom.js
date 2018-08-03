import mongoose, { Schema } from 'mongoose';

export const ClassroomModel = mongoose.model('classroom', new Schema({
  location: { type: String, required: true }
}));
