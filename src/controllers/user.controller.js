import { StudentModel, TeacherModel, UserModel } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { JWT_SECRET } from '../config';

const userPubSub = new PubSub();

export const UserController = {

  users() {
    return UserModel.find().exec();
  },

  usersByIds(ids) {
    return UserModel.find({ _id: { $in: ids } });
  },

  userById(userId) {
    return UserModel.findById(userId);
  },

  studentById(studentId) {
    return StudentModel.findById(studentId);
  },

  teacherById(teacherId) {
    return TeacherModel.findById(teacherId);
  },

  async studentAgenda(userId) {
    const { tutorialsAgenda } = await StudentModel.findById(userId)
      .populate('tutorialsAgenda')
      .exec();

    return tutorialsAgenda;
  },

  async createStudent(student) {
    try {
      return await new StudentModel({
        ...student,
        avatar: {
          type: 'system',
          description: student.gender === 'male' ? 'businessman' : 'businesswoman',
        },
      }).save();
    } catch (error) {
      throw new Error('Student already exists!!');
    }
  },

  addSubjectToUser(userId, subjectId) {
    return UserModel.findByIdAndUpdate(userId, {
      $push: { subjects: subjectId },
    });
  },

  findTeachers() {
    return TeacherModel.find();
  },

  filterTeachersByName(teacherName) {
    const regexFilter = { $regex: `.*${teacherName}.*`, $options: 'i' };
    return TeacherModel.find({
      $or: [
        { name: regexFilter },
        { lastname: regexFilter },
      ],
    });
  },

  async loginUser(userId, password) {
    const user = await UserModel.findById(userId);
    if (!user || !await user.validatePassword(password)) {
      throw new Error(`User or password for id ${userId} are wrong`);
    }

    const token = jwt.sign({ userId }, JWT_SECRET);
    return { token, user };
  },

  async changeUserPassword(userId, password) {
    const user = await UserModel.findById(userId);
    console.log(user);
    user.password = password;
    return user.save();
  },

  async addTutorialClassToStudentAgenda(studentId, tutorialClassId) {
    await StudentModel
      .findByIdAndUpdate(studentId, { $addToSet: { tutorialsAgenda: tutorialClassId } });

    const { id, tutorialsAgenda: studentAgenda } = await StudentModel.findById(studentId)
      .populate('tutorialsAgenda')
      .exec();

    userPubSub.publish('studentAgenda', {
      studentAgenda,
      studentId: id,
    });
  },

  async removeTutorialClassFromStudentAgenda(studentId, tutorialClassIds) {
    await StudentModel
      .findByIdAndUpdate(studentId, { $pull: { tutorialsAgenda: { $in: tutorialClassIds } } });
  },

  subscribeToStudenAgendaChanges() {
    return withFilter(
      () => userPubSub.asyncIterator('studentAgenda'),
      ({ studentId }, { userId }) => {
        return studentId === userId;
      },
    );
  },

  async saveUserNotificationsToken(notificationsToken, userId) {
    await UserModel.findByIdAndUpdate(userId, { $set: { notificationsToken } });
    return 'Notifications token saved';
  },
};
