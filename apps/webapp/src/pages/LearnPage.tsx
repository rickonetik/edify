import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Card, Skeleton, EmptyState, ErrorState } from '../shared/ui/index.js';

// Mock data
const mockCurrentCourse = {
  completed: 12,
  total: 30,
  title: 'Crypto Compliance Basics',
  courseId: '1',
};

const mockNextLesson = {
  number: 4,
  title: '08 — Risk Signals',
  courseId: '1',
};

const mockContinueLessons = [
  { id: '8', title: '08 — Risk Signals', meta: '8 мин', progress: 35, courseId: '1' },
  { id: '7', title: '07 — Cryptocurrency Risk...', meta: '95%', progress: 95, courseId: '1' },
  { id: '6', title: '06 — AML Basics', meta: '12 мин', progress: 0, courseId: '1' },
  { id: '5', title: '05 — KYC Procedures', meta: '15 мин', progress: 60, courseId: '1' },
];

const mockMyCourses = [
  { id: '1', title: 'Crypto Compliance', progress: 40, isNew: false },
  { id: '2', title: 'Web 3.0 Fundamentals', progress: 50, isNew: true },
  { id: '3', title: 'Blockchain Security', progress: 17, isNew: false },
  { id: '4', title: 'DeFi Essentials', progress: 25, isNew: false },
  { id: '5', title: 'NFT Marketplace', progress: 10, isNew: false },
  { id: '6', title: 'Smart Contracts', progress: 75, isNew: false },
];

const mockNews = [
  {
    id: '1',
    title: 'Новые требования к KYC в 2026',
    description: 'Обновлены правила идентификации клиентов для криптовалютных платформ',
    courseId: '1',
  },
  {
    id: '2',
    title: 'Изменения в регулировании DeFi',
    description: 'Европейский регулятор опубликовал новые рекомендации',
    courseId: '1',
  },
  {
    id: '3',
    title: 'Обновление курса Crypto Compliance',
    description: 'Добавлены новые модули по международному регулированию',
    courseId: '1',
  },
];

// Progress Circle Component
function ProgressCircle({ completed, total }: { completed: number; total: number }) {
  const percentage = (completed / total) * 100;
  const angle = (percentage / 100) * 360;

  return (
    <div
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `conic-gradient(
          var(--accent) 0deg ${angle}deg,
          rgba(255, 255, 255, 0.1) ${angle}deg 360deg
        )`,
        padding: '4px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: 'var(--card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
            lineHeight: 1.2,
          }}
        >
          {completed}/{total}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-fg)',
            marginTop: '2px',
          }}
        >
          уроков
        </div>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--sp-4)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--fg)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {right && <div>{right}</div>}
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: 'var(--sp-2)',
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'var(--accent)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

// Current Course Card
function CurrentCourseCard() {
  return (
    <Card
      style={{
        marginBottom: 'var(--sp-5)',
        padding: 'var(--sp-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--sp-4)',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Progress circle + text */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--sp-4)',
            alignItems: 'flex-start',
            flex: 1,
          }}
        >
          <ProgressCircle completed={mockCurrentCourse.completed} total={mockCurrentCourse.total} />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-1)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-fg)',
              }}
            >
              Текущий курс:
            </div>
            <div
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--fg)',
              }}
            >
              {mockCurrentCourse.title}
            </div>
          </div>
        </div>
        {/* Right: Action area with button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Button
            asChild
            variant="primary"
            size="sm"
            style={{
              borderRadius: '999px',
              padding: 'var(--sp-2) var(--sp-4)',
              minHeight: '36px',
            }}
          >
            <Link to={`/course/${mockCurrentCourse.courseId}`}>Продолжить</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Next Lesson Card
function NextLessonCard() {
  return (
    <Card
      style={{
        marginBottom: 'var(--sp-5)',
        padding: 'var(--sp-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--r-md)',
          backgroundColor: 'var(--accent)',
          opacity: 0.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-1)',
          }}
        >
          Следующий урок:
        </div>
        <div
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
          }}
        >
          {mockNextLesson.title}
        </div>
      </div>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--r-md)',
          backgroundColor: 'var(--accent)',
          opacity: 0.1,
          flexShrink: 0,
        }}
      />
    </Card>
  );
}

// Continue Learning Section
function ContinueLearningSection() {
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <SectionHeader
        title="Продолжить обучение"
        right={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
            }}
          >
            <div
              style={{
                padding: 'var(--sp-1) var(--sp-2)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--r-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--fg)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              +18%
            </div>
          </div>
        }
      />
      <div>
        {mockContinueLessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/course/${lesson.courseId}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <Card
              style={{
                marginBottom: 'var(--sp-2)',
                padding: 'var(--sp-3) var(--sp-4)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--fg)',
                    flex: 1,
                  }}
                >
                  {lesson.title}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-fg)',
                    marginLeft: 'var(--sp-3)',
                  }}
                >
                  {lesson.meta}
                </div>
              </div>
              <ProgressBar progress={lesson.progress} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// My Courses Section
function MyCoursesSection() {
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <SectionHeader
        title="Мои курсы"
        right={
          <div
            style={{
              fontSize: 'var(--text-md)',
              color: 'var(--muted-fg)',
            }}
          >
            ›
          </div>
        }
      />
      <div
        style={{
          display: 'flex',
          gap: 'var(--sp-3)',
          overflowX: 'auto',
          paddingBottom: 'var(--sp-2)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {mockMyCourses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            style={{
              textDecoration: 'none',
              flexShrink: 0,
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
            }}
          >
            <Card
              style={{
                width: '220px',
                height: '140px',
                padding: 'var(--sp-3)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {course.isNew && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'var(--sp-2)',
                    right: 'var(--sp-2)',
                    padding: '2px var(--sp-2)',
                    backgroundColor: 'var(--accent)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--bg)',
                    fontWeight: 'var(--font-weight-medium)',
                    zIndex: 1,
                  }}
                >
                  New!
                </div>
              )}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--accent)',
                  opacity: 0.2,
                  marginBottom: 'var(--sp-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    opacity: 0.5,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--fg)',
                  marginBottom: 'var(--sp-2)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4',
                  height: '2.8em',
                  paddingRight: course.isNew ? 'var(--sp-6)' : 0,
                }}
              >
                {course.title}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-fg)',
                  marginTop: 'auto',
                }}
              >
                {course.progress}%
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// News Section
function NewsSection() {
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <SectionHeader
        title="Новости"
        right={
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-fg)',
            }}
          >
            48
          </div>
        }
      />
      <div>
        {mockNews.map((news) => (
          <Link
            key={news.id}
            to={`/course/${news.courseId}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <Card
              style={{
                marginBottom: 'var(--sp-3)',
                padding: 'var(--sp-4)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--fg)',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                {news.title}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-fg)',
                }}
              >
                {news.description}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <Skeleton width="60%" height="32px" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="100%" height="80px" radius="lg" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="50%" height="24px" style={{ marginBottom: 'var(--sp-4)' }} />
      <Skeleton width="100%" height="60px" radius="md" style={{ marginBottom: 'var(--sp-2)' }} />
      <Skeleton width="100%" height="60px" radius="md" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="50%" height="24px" style={{ marginBottom: 'var(--sp-4)' }} />
      <div style={{ display: 'flex', gap: 'var(--sp-3)', overflowX: 'auto' }}>
        <Skeleton width="140px" height="160px" radius="lg" />
        <Skeleton width="140px" height="160px" radius="lg" />
        <Skeleton width="140px" height="160px" radius="lg" />
      </div>
    </div>
  );
}

// Main LearnPage Component
export function LearnPage() {
  const [searchParams] = useSearchParams();
  const state = searchParams.get('state') || 'default';

  if (state === 'loading') {
    return <LoadingState />;
  }

  if (state === 'empty') {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <EmptyState
          title="Нет активного обучения"
          description="Начните обучение, выбрав курс из библиотеки"
          actionLabel="Открыть библиотеку"
          onAction={() => {
            window.location.href = '/library';
          }}
        />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <ErrorState
          title="Не удалось загрузить данные"
          description="Проверьте подключение к интернету и попробуйте снова"
          actionLabel="Повторить"
          onAction={() => {
            window.location.href = '/learn';
          }}
        />
      </div>
    );
  }

  // Default state
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      {/* Header */}
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--fg)',
          margin: '0 0 var(--sp-5) 0',
        }}
      >
        Привет, Никита
      </h1>

      {/* Current Course Card */}
      <CurrentCourseCard />

      {/* Next Lesson Card */}
      <NextLessonCard />

      {/* Continue Learning Section */}
      <ContinueLearningSection />

      {/* My Courses Section */}
      <MyCoursesSection />

      {/* News Section */}
      <NewsSection />
    </div>
  );
}
