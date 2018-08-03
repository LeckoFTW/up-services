import { ClassroomController } from '../controllers/classroom.controller';

export const classroomType = `
  type Classroom {
    id: ID!
    location: String!
  }
  
  type Query {
    classrooms: [Classroom]
  }
  
  type Mutation {
    createClassroom(location: String!): Classroom
  }
`;

export const classroomResolver = {
  Query: {
    classrooms: () => ClassroomController.classrooms(),
  },
  Mutation: {
    createClassroom: (_, { location }) => ClassroomController.createClassroom({ location }),
  },
};
