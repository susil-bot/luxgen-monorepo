export const courseTypeDefs = `
  type CourseCommerce {
    priceCents: Int
    compareAtPriceCents: Int
    sku: String
    category: String
    currency: String
  }

  type Course {
    id: ID!
    title: String!
    description: String
    instructor: User!
    students: [User!]!
    tenant: Tenant!
    startDate: Date
    endDate: Date
    status: CourseStatus!
    commerce: CourseCommerce
    createdAt: Date!
    updatedAt: Date!
  }

  enum CourseStatus {
    DRAFT
    PUBLISHED
    COMPLETED
    CANCELLED
  }

  input CourseCommerceInput {
    priceCents: Int
    compareAtPriceCents: Int
    sku: String
    category: String
    currency: String
  }

  input CreateCourseInput {
    title: String!
    description: String
    instructorId: ID!
    tenantId: ID!
    startDate: Date
    endDate: Date
    commerce: CourseCommerceInput
  }

  input UpdateCourseInput {
    title: String
    description: String
    instructorId: ID
    startDate: Date
    endDate: Date
    status: CourseStatus
    commerce: CourseCommerceInput
  }

  extend type Query {
    course(id: ID!): Course
    courses(tenantId: ID!): [Course!]!
    coursesByInstructor(instructorId: ID!): [Course!]!
  }

  extend type Mutation {
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    enrollStudent(courseId: ID!, studentId: ID!): Course!
    unenrollStudent(courseId: ID!, studentId: ID!): Course!
  }
`;
