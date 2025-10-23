import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// Import type definitions
import { tenantTypeDefs } from './tenant/typeDefs';
import { userTypeDefs } from './user/typeDefs';
import { courseTypeDefs } from './course/typeDefs';

// Import resolvers
import { tenantResolvers } from './tenant/resolvers';
import { userResolvers } from './user/resolvers';
import { courseResolvers } from './course/resolvers';

// Base schema
const baseTypeDefs = `
  scalar Date

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
]);

// Merge all resolvers
export const resolvers = mergeResolvers([
  tenantResolvers,
  userResolvers,
  courseResolvers,
]);

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
