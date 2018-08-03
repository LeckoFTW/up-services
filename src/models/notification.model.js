import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  type: { type: String, enum: ['addTutorialClassParticipant'], required: true },
  toUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
});

export const NotificationModel = mongoose.model('notification', notificationSchema);
