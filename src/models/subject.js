import mongoose, { Schema } from 'mongoose';

const subjectSchema = new Schema({
  name: { type: String, required: true }
});

export const SubjectModel = mongoose.model('subject', subjectSchema);


