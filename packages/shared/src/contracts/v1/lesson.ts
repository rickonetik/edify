import { z } from 'zod';
import type { ApiOk } from './errors.js';
import type { ID, ISODateTime } from './common.js';
import type { Course } from './course.js';

export type LessonVideoV1 =
  | { kind: 'youtube'; youtubeId: string }
  | { kind: 'upload'; key: string; mime: string; size: number; originalFilename: string }
  | { kind: 'none' };

export type LessonV1 = {
  id: ID;
  courseId: ID;
  title: string;
  order: number;
  contentMarkdown?: string | null;
  updatedAt: ISODateTime;
  video?: LessonVideoV1;
};

const LessonVideoV1Schema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('youtube'), youtubeId: z.string() }),
  z.object({
    kind: z.literal('upload'),
    key: z.string(),
    mime: z.string(),
    size: z.number(),
    originalFilename: z.string(),
  }),
  z.object({ kind: z.literal('none') }),
]);

export const LessonV1Schema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  order: z.number(),
  contentMarkdown: z.string().nullable().optional(),
  updatedAt: z.string(),
  video: LessonVideoV1Schema.optional(),
});

export type Lesson = LessonV1;

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
