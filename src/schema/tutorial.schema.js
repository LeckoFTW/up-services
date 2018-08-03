import { TutorialClassController } from '../controllers/tutorial-class.controller';
import { UserController } from '../controllers/user.controller';

export const tutorialType = `
  type Participant {
    user: User
    doubts: String
  }

  type TutorialClass {
    id: ID!
    startDate: String!
    endDate: String!
    subject: String!
    classroom: String!
    active: Boolean
    teacher: User
    participants: [Participant]
    topics: [String]
  }
  
  type Query {
    tutorialClasses(filter: String): [TutorialClass]
    teacherSchedule: [TutorialClass]
    tutorialClassById(tutorialClassId: ID!): TutorialClass
  }

  type Mutation {
    addTutorialClassParticipant(tutorialClassId: ID!, doubts: String): Boolean
    removeTutorialClassParticipant(tutorialClassIds: [ID]!): Boolean
  }
  
  type Subscription {
    tutorialClass(tutorialClassId: ID!): TutorialClass
    tutorialClassAsigned(userId : Int!): TutorialClass
  }
`;

export const tutorialResolver = {
  Query: {
    tutorialClasses: (_, { filter }, { userId, requireAuth }) =>
      TutorialClassController.tutorialClasses(userId, filter),
    teacherSchedule: (_, args, { userId }) =>
      TutorialClassController.teacherTutorialClasses(userId),
    tutorialClassById: (_, { tutorialClassId }) =>
      TutorialClassController.tutorialClassById(tutorialClassId),
  },
  Mutation: {
    addTutorialClassParticipant: async (_, { tutorialClassId, doubts }, { userId }) => {
      await TutorialClassController.addTutorialClassParticipant(userId, tutorialClassId, doubts);
      await UserController.addTutorialClassToStudentAgenda(userId, tutorialClassId);
    },

    removeTutorialClassParticipant: async (_, { tutorialClassIds }, { userId }) => {
      await TutorialClassController.removeTutorialClassParticipant(userId, tutorialClassIds);
      await UserController.removeTutorialClassFromStudentAgenda(userId, tutorialClassIds);
    },
  },
  Subscription: {
    tutorialClass: {
      subscribe: TutorialClassController.subscribeToTutorialClassChange(),
    },
    tutorialClassAsigned: {
      subscribe: TutorialClassController.subscribeToTutorialClassAsigned(),
    },
  },
  TutorialClass: {
    teacher: ({ teacher }) => UserController.userById(teacher),
  },
  Participant: {
    user: ({ user }) => UserController.userById(user),
  },
};
