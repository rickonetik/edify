/**
 * MSW mocks - Public exports
 * Note: MSW worker initialization is done in Story 2.5
 */

export { handlers } from './handlers.js';
export {
  mockUser,
  mockCourses,
  mockLessons,
  getMockCourse,
  getMockLessons,
  getMockLesson,
  paginate,
} from './fixtures.js';
