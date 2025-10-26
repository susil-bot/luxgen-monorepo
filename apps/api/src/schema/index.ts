import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// Import type definitions
import { tenantTypeDefs } from './tenant/typeDefs';
import { userTypeDefs } from './user/typeDefs';
import { courseTypeDefs } from './course/typeDefs';
import { groupTypeDefs } from './group/typeDefs';
import { dashboardTypeDefs } from './dashboard/typeDefs';
import { userRoleTypeDefs } from './userRole/typeDefs';

// Import resolvers
import { tenantResolvers } from './tenant/resolvers';
import { userResolvers } from './user/resolvers';
import { courseResolvers } from './course/resolvers';
import { groupResolvers } from './group/resolvers';
import { dashboardResolvers } from './dashboard/resolvers';
import { userRoleResolvers } from './userRole/resolvers';

// Base schema
const baseTypeDefs = `
  scalar Date
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

// Merge all type definitions
export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  tenantTypeDefs,
  userTypeDefs,
  courseTypeDefs,
  groupTypeDefs,
  dashboardTypeDefs,
  userRoleTypeDefs,
]);

// Scalar resolvers
const scalarResolvers = {
  Date: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value),
  },
  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => {
      switch (ast.kind) {
        case 'StringValue':
        case 'BooleanValue':
          return ast.value;
        case 'IntValue':
        case 'FloatValue':
          return parseFloat(ast.value);
        case 'ObjectValue':
          return ast.fields.reduce((obj: any, field: any) => {
            obj[field.name.value] = JSON.parse(field.value.value);
            return obj;
          }, {});
        case 'ListValue':
          return ast.values.map((value: any) => JSON.parse(value.value));
        default:
          return null;
      }
    },
  },
};

// Merge all resolvers
export const resolvers: any = mergeResolvers([
  scalarResolvers,
  tenantResolvers,
  userResolvers,
  courseResolvers,
  groupResolvers,
  dashboardResolvers,
  userRoleResolvers,
]);

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
