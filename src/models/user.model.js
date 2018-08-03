import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const scheduleSchema = new Schema({
  classroom: { type: Schema.Types.ObjectId, ref: 'classroom' },
  subject: { type: Schema.Types.ObjectId, ref: 'subject' },
  dayOfWeek: { type: Number, required: true },
  startHour: { type: Number, required: true },
  endHour: { type: Number, required: true },
  topics: { type: [String] },
}, { _id: false });

const userSchema = new Schema({
  _id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'subject' }],
  avatar: new Schema({
    type: { type: String, required: true, enum: ['system', 'custom'] },
    description: { type: String, required: true },
  }, { _id: false }),
  notificationsToken: { type: String },
}, { discriminatorKey: 'role' });

userSchema.pre('save', async function (done) {
  try {
    if (!this.isModified('password')) return done();
    this.password = await bcrypt.hash(this.password, 10);
    done();
  } catch (err) {
    done(err);
  }
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.model('user', userSchema);

export const TeacherModel = UserModel.discriminator('teacher', new Schema({
  tutorialsSchedule: [scheduleSchema],
}));

export const StudentModel = UserModel.discriminator('student', new Schema({
  tutorialsAgenda: [{ type: Schema.Types.ObjectId, ref: 'tutorialClass' }],
}));
