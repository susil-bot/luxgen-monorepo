import React, { memo } from 'react';
export const CourseListRow = memo(function CourseListRow({ title }: { title: string }) {
  return <li>{title}</li>;
});
