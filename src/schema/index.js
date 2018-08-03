import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';

import { classroomResolver, classroomType } from './classroom.schema';
import { subjectResolver, subjectType } from './subject.schema';
import { tutorialResolver, tutorialType } from './tutorial.schema';
import { userResolver, userType } from './user.schema';
import { roleResolver, roleType } from './role.schema';
import { notificationResolver, notificationType } from './notification.schema';

const resolvers = mergeResolvers([
  classroomResolver,
  subjectResolver,
  tutorialResolver,
  userResolver,
  roleResolver,
  notificationResolver,
]);

const typeDefs = mergeTypes([
  classroomType,
  subjectType,
  tutorialType,
  userType,
  roleType,
  notificationType,
]);

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
