import { SubjectModel } from '../models/subject';

export const SubjectController = {
  findAllSubjects() {
    return SubjectModel.find();
  },

  findById(id) {
    return SubjectModel.findById(id);
  },

  subjectsByIds(ids) {
    return SubjectModel.find({ _id: { $in: ids } });
  },

  createSubject(body) {
    return new SubjectModel(body).save();
  },
};
