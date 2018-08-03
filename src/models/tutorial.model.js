import mongoose, { Schema } from 'mongoose';

const participantSchema = new Schema({
  user: { type: Schema.Types.Number, ref: 'user' },
  doubts: String,
}, { _id: false });

const tutorialClassSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  teacher: { type: Schema.Types.Number, ref: 'user' },
  subject: { type: String, required: true },
  classroom: { type: String, required: true },
  active: { type: Boolean, required: true },
  participants: [participantSchema],
  topics: { type: [String] },
});

export const TutorialClassModel = mongoose.model('tutorialClass', tutorialClassSchema);
