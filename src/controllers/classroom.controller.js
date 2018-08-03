import { ClassroomModel } from '../models/classroom';

export const ClassroomController = {
  classrooms() {
    return ClassroomModel.find();
  },

  createClassroom(body) {
    return new ClassroomModel(body).save();
  },
};
