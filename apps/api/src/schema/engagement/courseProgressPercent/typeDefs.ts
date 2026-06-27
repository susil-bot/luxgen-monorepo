export const CourseProgressPercentTypeDefs = `type CourseProgressPercent{courseId:ID!studentId:ID!progressPercent:Int!} extend type Query{courseProgressPercent(courseId:ID!):CourseProgressPercent!}`;
