import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { secureResolvers } from '../graphql/authPolicy';

// Import type definitions
import { tenantTypeDefs } from './tenant/typeDefs';
import { userTypeDefs } from './user/typeDefs';
import { courseTypeDefs } from './course/typeDefs';
import { groupTypeDefs } from './group/typeDefs';
import { dashboardTypeDefs } from './dashboard/typeDefs';
import { userRoleTypeDefs } from './userRole/typeDefs';
import { automationTypeDefs } from './automation/typeDefs';
import { billingTypeDefs } from './billing/typeDefs';
import { marketplaceTypeDefs } from './marketplace/typeDefs';
import { listingTypeDefs } from './listing/typeDefs';
import { activityEventTypeDefs } from './activityEvent/typeDefs';
import { enrollmentTypeDefs } from './enrollment/typeDefs';
import { certificateTypeDefs } from './certificate/typeDefs';

// Import resolvers
import { tenantResolvers } from './tenant/resolvers';
import { userResolvers } from './user/resolvers';
import { courseResolvers } from './course/resolvers';
import { groupResolvers } from './group/resolvers';
import { dashboardResolvers } from './dashboard/resolvers';
import { userRoleResolvers } from './userRole/resolvers';
import { automationResolvers } from './automation/resolvers';
import { billingResolvers } from './billing/resolvers';
import { marketplaceResolvers } from './marketplace/resolvers';
import { listingResolvers } from './listing/resolvers';
import { activityEventResolvers } from './activityEvent/resolvers';
import { enrollmentResolvers } from './enrollment/resolvers';
import { certificateResolvers } from './certificate/resolvers';

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
  automationTypeDefs,
  billingTypeDefs,
  marketplaceTypeDefs,
  listingTypeDefs,
  activityEventTypeDefs,
  enrollmentTypeDefs,
  certificateTypeDefs,
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

// Merge all resolvers, then enforce auth on protected Query/Mutation fields
const mergedResolvers = mergeResolvers([
  scalarResolvers,
  tenantResolvers,
  userResolvers,
  courseResolvers,
  groupResolvers,
  dashboardResolvers,
  userRoleResolvers,
  automationResolvers,
  billingResolvers,
  marketplaceResolvers,
  listingResolvers,
  activityEventResolvers,
  enrollmentResolvers,
  certificateResolvers,
]);

export const resolvers: any = secureResolvers(mergedResolvers);

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
