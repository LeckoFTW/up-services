import moment from 'moment';
import { PubSub, withFilter } from 'graphql-subscriptions';

import { UserController } from './user.controller';

import { TutorialClassModel } from '../models/tutorial.model';

const tutorialClassPubSub = new PubSub();

export const TutorialClassController = {
  async setWeekTutorials() {
    const teachers = await UserController.findTeachers()
      .populate(['tutorialsSchedule.classroom', 'tutorialsSchedule.subject']);

    let weekTutorials = [];

    for (const teacher of teachers) {
      const teacherWeekTutorials = await _scheduleWeekTutorials(teacher);
      weekTutorials = [...weekTutorials, ...teacherWeekTutorials];
    }

    await TutorialClassModel.remove({});

    await TutorialClassModel.insertMany(weekTutorials);
  },

  async tutorialClasses(userId, filter) {
    const { subjects, tutorialsAgenda } = await UserController.studentById(userId).populate('subjects');
    const subjectsNames = subjects.map(({ name }) => name);
    const startDate = moment().startOf('day').toDate();

    const queryFilter = {
      _id: { $nin: tutorialsAgenda },
      startDate: { $gte: startDate },
      subject: { $in: subjectsNames },
    };

    return TutorialClassModel.find(filter ?
      { ...await _checkSearchFilter(filter), ...queryFilter } : queryFilter)
      .sort({ startDate: 1 });
  },

  async teacherTutorialClasses(teacherId) {
    const startDate = moment().startOf('day').toDate();

    return TutorialClassModel.find({
      teacher: teacherId,
      startDate: { $gte: startDate },
    }).sort({ startDate: 1 });
  },

  async tutorialClassById(id) {
    return TutorialClassModel.findById(id);
  },

  async addTutorialClassParticipant(participantId, tutorialClassId, doubts) {
    await TutorialClassModel.findByIdAndUpdate(tutorialClassId, {
      $push: { participants: { user: participantId, doubts } },
    });

    const tutorialClass = await TutorialClassModel.findById(tutorialClassId);

    tutorialClassPubSub.publish('tutorialClass', {
      tutorialClass,
    });

    tutorialClassPubSub.publish('tutorialClassAsigned', {
      tutorialClassAsigned: tutorialClass,
      asignedToUser: participantId,
    });
  },

  async removeTutorialClassParticipant(participantId, tutorialClassIds) {
    await TutorialClassModel.update({
      _id: { $in: tutorialClassIds },
    }, {
      $pull: { participants: { 'participants.user': participantId } },
    });
  },

  subscribeToTutorialClassChange() {
    return withFilter(
      () => tutorialClassPubSub.asyncIterator('tutorialClass'),
      ({ tutorialClass }, { tutorialClassId }) => tutorialClass.id === tutorialClassId,
    );
  },

  subscribeToTutorialClassAsigned() {
    return withFilter(
      () => tutorialClassPubSub.asyncIterator('tutorialClassAsigned'),
      ({ asignedToUser }, { userId }) => {
        console.log('asdasdad', asignedToUser, userId);
        console.log(typeof asignedToUser, typeof userId);
        return asignedToUser === userId;
      },
    );
  },
};

const _checkSearchFilter = async (filter) => {
  const regexFilter = { $regex: `.*${filter}.*`, $options: 'i' };
  const teachers = await UserController.filterTeachersByName(filter);

  console.log(regexFilter, teachers);

  return {
    $or: [
      { subject: regexFilter },
      { teacher: { $in: teachers.map(({ id }) => id) } },
    ],
  };
};

const _scheduleWeekTutorials = async (teacher) => {
  const { tutorialsSchedule, id } = teacher;
  const teacherWeekTutorials = [];

  for (const schedule of tutorialsSchedule) {
    const { dayOfWeek, startHour, endHour, classroom, subject, topics } = schedule;
    const startDate = moment()
      .hour(startHour)
      .weekday(dayOfWeek)
      .startOf('hour')
      .add(1, 'week')
      .toDate();

    const endDate = moment()
      .hour(endHour)
      .weekday(dayOfWeek)
      .startOf('hour')
      .add(1, 'week')
      .toDate();

    const tutorial = {
      startDate,
      endDate,
      topics,
      teacher: id,
      subject: subject.name,
      classroom: classroom.location,
      active: true,
      participants: [],
    };

    teacherWeekTutorials.push(tutorial);
  }

  return teacherWeekTutorials;
};
