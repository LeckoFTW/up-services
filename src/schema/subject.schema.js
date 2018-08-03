import { SubjectController } from '../controllers/subject.controller';

export const subjectType = `
  type Subject {
    id: ID!
    name: String
  }
  
  type Query {
    subjects: [Subject]
  }
  
  type Mutation {
    createSubject(name: String!): Subject
  }
`;

export const subjectResolver = {
  Query: {
    subjects: () => SubjectController.findAllSubjects(),
  },
  Mutation: {
    createSubject: (_, { name }) => SubjectController.createSubject({ name }),
  },
};
