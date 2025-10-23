export const courseTypeDefs = `
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
    createdAt: Date!
    updatedAt: Date!
  }

  enum CourseStatus {
    DRAFT
    PUBLISHED
    COMPLETED
    CANCELLED
  }

  input CreateCourseInput {
    title: String!
    description: String
    instructorId: ID!
    tenantId: ID!
    startDate: Date
    endDate: Date
  }

  input UpdateCourseInput {
    title: String
    description: String
    instructorId: ID
    startDate: Date
    endDate: Date
    status: CourseStatus
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
