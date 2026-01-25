import type { ApiOk } from './errors.js';
import type { ID } from './common.js';
import type { Course } from './course.js';

export type Lesson = {
  id: ID;
  courseId: ID;
  title: string;
  order: number;
  durationMinutes?: number;
  progressPct?: number;
  isCompleted: boolean;
};

export type LearnSummary = {
  greetingName: string;
  currentCourse?: Course;
  nextLesson?: Lesson;
  continueLessons: Lesson[];
  myCourses: Course[];
  news: { id: ID; title: string; description?: string; badge?: string }[];
};

export type LearnResponse = ApiOk<LearnSummary>;

export type CourseResponse = ApiOk<{
  course: Course;
  lessons: Lesson[];
}>;
