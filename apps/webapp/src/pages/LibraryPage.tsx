import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card, Skeleton, EmptyState, ErrorState } from '../shared/ui/index.js';
import { useLibrary } from '../shared/query/index.js';
import type { Course } from '@tracked/shared';

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
              {course.badges?.includes('NEW') && (
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
              {course.badges
                ?.filter((b) => b !== 'NEW')
                .map((badge) => (
                  <div
                    key={badge}
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
                    {badge}
                  </div>
                ))}
            </div>
            {course.description && (
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-fg)',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                {course.description}
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
                {course.progressPct > 0 && `${course.progressPct}%`}
                {course.durationMinutes && `${course.durationMinutes} мин`}
                {course.progressPct === 0 && !course.durationMinutes && 'Новый курс'}
              </div>
            </div>
            {course.progressPct > 0 && <ProgressBar progress={course.progressPct} />}
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
        {course.badges?.includes('NEW') && (
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
            paddingRight: course.badges?.includes('NEW') ? 'var(--sp-6)' : 0,
          }}
        >
          {course.title}
        </div>
        {course.description && (
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
            {course.description}
          </div>
        )}
      </Card>
    </Link>
  );
}

// News Card Component (kept for compatibility, but news not in LibraryResponse yet)
function NewsCard({ news }: { news: { id: string; title: string; desc: string } }) {
  return (
    <Link to={`/update/${news.id}`} style={{ textDecoration: 'none', display: 'block' }}>
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
    </Link>
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
  const navigate = useNavigate();
  const { data, isLoading, isError, uiError, refetch } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const catalogCourses = data?.catalog || [];
  const recommendedCourses = data?.recommendations || [];
  // News not in LibraryResponse, keep empty for now (can be added later)
  const news: Array<{ id: string; title: string; desc: string }> = [];

  // Filter courses based on search query
  const filteredCatalogCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return catalogCourses;
    }
    const query = searchQuery.toLowerCase();
    return catalogCourses.filter((course) => course.title.toLowerCase().includes(query));
  }, [searchQuery, catalogCourses]);

  const filteredRecommendedCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return recommendedCourses;
    }
    const query = searchQuery.toLowerCase();
    return recommendedCourses.filter((course) => course.title.toLowerCase().includes(query));
  }, [searchQuery, recommendedCourses]);

  const hasSearchResults =
    filteredCatalogCourses.length > 0 || filteredRecommendedCourses.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (isError && uiError) {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <ErrorState
          title={uiError.title}
          description={uiError.description}
          actionLabel="Повторить"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  // Empty state (no data or empty after filtering)
  if (!data || (catalogCourses.length === 0 && recommendedCourses.length === 0)) {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <EmptyState
          title={isSearchActive ? 'Ничего не найдено' : 'Каталог пуст'}
          description={
            isSearchActive ? 'Попробуйте изменить запрос или сбросить фильтр' : 'Попробуйте позже'
          }
          actionLabel={isSearchActive ? 'Сбросить поиск' : 'Перейти в обучение'}
          onAction={() => {
            if (isSearchActive) {
              setSearchQuery('');
            } else {
              navigate('/learn');
            }
          }}
        />
      </div>
    );
  }

  // Empty search results
  if (isSearchActive && !hasSearchResults) {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <EmptyState
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или сбросить фильтр"
          actionLabel="Сбросить поиск"
          onAction={() => setSearchQuery('')}
        />
      </div>
    );
  }

  // Default state
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
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
