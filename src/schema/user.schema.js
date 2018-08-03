import { UserController } from '../controllers/user.controller';
import { RoleController } from '../controllers/role.controller';
import { NotificationController, NotificationType } from '../controllers/notification.controller';
import { TutorialClassController } from '../controllers/tutorial-class.controller';
import { SubjectController } from '../controllers/subject.controller';

export const userType = `

  type Avatar {
    type: String
    description: String
  }

  interface User {
    id: ID!
    email: String
    name: String
    lastname: String
    gender: String
    subjects: [Subject]
    avatar: Avatar
  }
  
  type Student implements User{
    id: ID!
    email: String
    name: String
    lastname: String
    gender: String
    subjects: [Subject]
    avatar: Avatar
    tutorialsAgenda: [TutorialClass]
  }
  
  type Teacher implements User{
    id: ID!
    email: String
    name: String
    lastname: String
    gender: String
    subjects: [Subject]
    avatar: Avatar
    tutorialsSchedule: [Schedule]
  }
  
  type LoginResponse {
    token: String!
    user: User
  }
  
  type Schedule {
    classroom: Classroom
    subject: Subject
    dayOfWeek: Int!
    startHour: Int!
    endHour: Int!
  }
  
  type Query {
    users: [User]
    userById(userId: ID!): User
    studentAgenda(userId: ID!): [TutorialClass]
    logedUser: User
  }
  
  type Mutation {
    createStudent(
      _id: ID!
      email: String!
      password: String!
      name: String!
      lastname: String!
      gender: String!
    ): Student
    addSubjectToUser(userId: ID!, subjectId: ID!): Boolean
    changeUserPassword(userId: ID!, password: String!): Boolean
    loginUser(userId: ID!, password: String!): LoginResponse
    saveUserNotificationsToken(token: String!): String
  }
  
  type Subscription {
    studentAgenda(userId: ID!): [TutorialClass]
  }
`;

export const userResolver = {
  Query: {
    users: (_, args, { requireAuth }) =>
      requireAuth(UserController.users)(),
    userById: (_, { userId }) =>
      UserController.userById(userId),
    studentAgenda: (_, { userId }, { requireAuth }) =>
      requireAuth(UserController.studentAgenda)(userId),
    logedUser: (_, args, { userId }) =>
      UserController.userById(userId),
  },
  Mutation: {
    createStudent: (_, student) =>
      UserController.createStudent(student),
    addSubjectToUser: (_, { userId, subjectId }) =>
      UserController.addSubjectToUser(userId, subjectId),
    changeUserPassword: (_, { userId, password }) =>
      UserController.changeUserPassword(userId, password),
    loginUser: (_, { userId, password }) =>
      UserController.loginUser(userId, password),
    saveUserNotificationsToken: (_, { token }, { userId }) =>
      UserController.saveUserNotificationsToken(token, userId),
  },
  Subscription: {
    studentAgenda: {
      subscribe: UserController.subscribeToStudenAgendaChanges(),
    },
  },
  User: {
    __resolveType: (parent, context, { schema }) =>
      parent.role === 'student' ? schema.getType('Student') : schema.getType('Teacher'),
  },
  Student: {
    subjects: ({ subjects: ids }) => {
      return SubjectController.subjectsByIds(ids);
    },
  },
};
