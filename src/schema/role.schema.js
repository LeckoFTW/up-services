import { Role } from '../models/role';

export const roleType = `
  type Role {
    id: ID!
    name: String!
  }
  
  type Query {
    roles: [Role]
  }
  
  type Mutation {
    createRole(name: String!): Role
  }
`;

export const roleResolver = {
  Query: {
    'roles': () => Role.find().exec(),
  },
  Mutation: {
    'createRole': (_, { name }) => new Role({
      name,
    }).save(),
  },
};
