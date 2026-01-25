import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card, Skeleton, EmptyState, ErrorState } from '../shared/ui/index.js';

// Types
type Course = {
  id: string;
  title: string;
  subtitle?: string;
  progress?: number; // 0..100
  minutes?: number;
  isNew?: boolean;
  badge?: string; // например "PRO"
};

type News = {
  id: string;
  title: string;
  desc: string;
};

// Mock data
const catalogCourses: Course[] = [
  { id: '1', title: 'Crypto Compliance', subtitle: 'Basics', progress: 40, isNew: false },
  { id: '2', title: 'Web 3.0', subtitle: 'Fundamentals', progress: 0, isNew: false },
  { id: '3', title: 'Cybersecurity', subtitle: 'Essentials', minutes: 12, isNew: false },
  { id: '4', title: 'Anti-Fraud', subtitle: 'Investigations', minutes: 7, isNew: true },
  { id: '5', title: 'AML Compliance', subtitle: 'Advanced', progress: 25, isNew: false },
  {
    id: '6',
    title: 'KYC Procedures',
    subtitle: 'Complete Guide',
    progress: 60,
    minutes: 15,
    isNew: false,
  },
  { id: '7', title: 'Blockchain Security', subtitle: 'Best Practices', progress: 17, isNew: false },
  { id: '8', title: 'DeFi Regulations', subtitle: 'EU Framework', minutes: 8, isNew: true },
  { id: '9', title: 'Smart Contracts', subtitle: 'Audit & Security', progress: 75, isNew: false },
  { id: '10', title: 'NFT Marketplace', subtitle: 'Legal Aspects', progress: 10, isNew: false },
  { id: '11', title: 'Data Privacy', subtitle: 'GDPR & Crypto', progress: 30, isNew: false },
  {
    id: '12',
    title: 'Risk Management',
    subtitle: 'Financial Crime',
    progress: 45,
    minutes: 20,
    isNew: false,
  },
  { id: '13', title: 'Token Economics', subtitle: 'Regulatory View', isNew: false, badge: 'PRO' },
  { id: '14', title: 'Stablecoin Compliance', subtitle: 'US & EU', progress: 5, isNew: false },
  { id: '15', title: 'Exchange Operations', subtitle: 'Licensing', minutes: 25, isNew: true },
];

const recommendedCourses: Course[] = [
  { id: '16', title: 'AI & Compliance', subtitle: 'На основе вашего прогресса', isNew: true },
  { id: '17', title: 'Data Security', subtitle: 'Enterprise Level', isNew: false },
  {
    id: '18',
    title: 'Project Management',
    subtitle: 'Agile & Compliance',
    minutes: 8,
    isNew: true,
  },
  { id: '19', title: 'RegTech Solutions', subtitle: 'Automation', progress: 0, isNew: false },
  { id: '20', title: 'Crypto Tax', subtitle: 'International', minutes: 12, isNew: false },
  { id: '21', title: 'Whale Transactions', subtitle: 'Monitoring', isNew: false },
  { id: '22', title: 'Cross-Border Payments', subtitle: 'Compliance', progress: 15, isNew: false },
];

const news: News[] = [
  {
    id: '1',
    title: 'Новый модуль',
    desc: 'добавлен в курс CryptoCompliance',
  },
  {
    id: '2',
    title: 'Обновление требований KYC',
    desc: 'Новые правила идентификации клиентов',
  },
  {
    id: '3',
    title: 'Изменения в DeFi регулировании',
    desc: 'Европейский регулятор опубликовал рекомендации',
  },
];

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

// Catalog Course Card Component
function CatalogCourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/course/${course.id}`}
      style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--sp-3)' }}
    >
      <Card
        style={{
          padding: 'var(--sp-4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--sp-3)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
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
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                opacity: 0.5,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--sp-2)',
                marginBottom: 'var(--sp-1)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--fg)',
                  flex: 1,
                }}
              >
                {course.title}
              </div>
              {course.isNew && (
                <div
                  style={{
                    padding: '2px var(--sp-2)',
                    backgroundColor: 'var(--accent)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--bg)',
                    fontWeight: 'var(--font-weight-medium)',
                    flexShrink: 0,
                  }}
                >
                  New
                </div>
              )}
              {course.badge && (
                <div
                  style={{
                    padding: '2px var(--sp-2)',
                    backgroundColor: 'var(--accent-2)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--bg)',
                    fontWeight: 'var(--font-weight-medium)',
                    flexShrink: 0,
                  }}
                >
                  {course.badge}
                </div>
              )}
            </div>
            {course.subtitle && (
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-fg)',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                {course.subtitle}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-fg)',
              }}
            >
              <div>
                {course.progress !== undefined && `${course.progress}%`}
                {course.minutes !== undefined && `${course.minutes} мин`}
                {course.progress === undefined && course.minutes === undefined && 'Новый курс'}
              </div>
            </div>
            {course.progress !== undefined && <ProgressBar progress={course.progress} />}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Recommended Course Card Component
function RecommendedCourseCard({ course }: { course: Course }) {
  return (
    <Link
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
            New
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
        {course.subtitle && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-fg)',
              marginTop: 'auto',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {course.subtitle}
          </div>
        )}
      </Card>
    </Link>
  );
}

// News Card Component
function NewsCard({ news }: { news: News }) {
  return (
    <Card
      style={{
        marginBottom: 'var(--sp-3)',
        padding: 'var(--sp-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
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
              opacity: 0.5,
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
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
            {news.desc}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Loading State
function LoadingState() {
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <Skeleton width="60%" height="32px" style={{ marginBottom: 'var(--sp-4)' }} />
      <Skeleton width="100%" height="48px" radius="md" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="50%" height="24px" style={{ marginBottom: 'var(--sp-4)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-3)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-3)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-3)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-5)' }} />
      <Skeleton width="50%" height="24px" style={{ marginBottom: 'var(--sp-4)' }} />
      <div
        style={{
          display: 'flex',
          gap: 'var(--sp-3)',
          overflowX: 'auto',
          paddingBottom: 'var(--sp-2)',
        }}
      >
        <Skeleton width="220px" height="140px" radius="lg" />
        <Skeleton width="220px" height="140px" radius="lg" />
        <Skeleton width="220px" height="140px" radius="lg" />
      </div>
    </div>
  );
}

// Main LibraryPage Component
export function LibraryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = searchParams.get('state') || 'default';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter courses based on search query
  const filteredCatalogCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return catalogCourses;
    }
    const query = searchQuery.toLowerCase();
    return catalogCourses.filter((course) => course.title.toLowerCase().includes(query));
  }, [searchQuery]);

  const filteredRecommendedCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return recommendedCourses;
    }
    const query = searchQuery.toLowerCase();
    return recommendedCourses.filter((course) => course.title.toLowerCase().includes(query));
  }, [searchQuery]);

  const hasSearchResults =
    filteredCatalogCourses.length > 0 || filteredRecommendedCourses.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  // Loading state
  if (state === 'loading') {
    return <LoadingState />;
  }

  // Empty state
  if (state === 'empty') {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <EmptyState
          title="Каталог пуст"
          description="Попробуйте изменить запрос или сбросить фильтр"
          actionLabel="Перейти в обучение"
          onAction={() => {
            navigate('/learn');
          }}
        />
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <ErrorState
          title="Не удалось загрузить каталог"
          description="Попробуйте ещё раз"
          actionLabel="Повторить"
          onAction={() => {
            navigate('/library');
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
          margin: '0 0 var(--sp-2) 0',
        }}
      >
        Edify
      </h1>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-fg)',
          margin: '0 0 var(--sp-4) 0',
        }}
      >
        Каталог курсов и материалов для обучения
      </p>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--sp-2)',
          marginBottom: 'var(--sp-5)',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Input
            placeholder="Поиск курсов"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingRight: searchQuery ? 'var(--sp-9)' : undefined,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 'var(--sp-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--muted-fg)',
                fontSize: 'var(--text-xl)',
                cursor: 'pointer',
                padding: 'var(--sp-1)',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            style={{
              flexShrink: 0,
            }}
          >
            Очистить
          </Button>
        )}
      </div>

      {/* Search Results Empty State */}
      {isSearchActive && !hasSearchResults && (
        <EmptyState
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или сбросить фильтр"
          actionLabel="Сбросить поиск"
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* Section A - Catalog Courses */}
      {!isSearchActive && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <SectionHeader
            title="Каталог курсов"
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
          <div>
            {catalogCourses.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Search Results - Catalog */}
      {isSearchActive && hasSearchResults && filteredCatalogCourses.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <SectionHeader title="Каталог курсов" />
          <div>
            {filteredCatalogCourses.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Section B - Recommendations */}
      {(!isSearchActive || (isSearchActive && filteredRecommendedCourses.length > 0)) && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <SectionHeader
            title="Рекомендации"
            right={
              !isSearchActive ? (
                <div
                  style={{
                    fontSize: 'var(--text-md)',
                    color: 'var(--muted-fg)',
                  }}
                >
                  ›
                </div>
              ) : undefined
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
            {filteredRecommendedCourses.map((course) => (
              <RecommendedCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Section C - News (only show when search is not active) */}
      {!isSearchActive && (
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
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
