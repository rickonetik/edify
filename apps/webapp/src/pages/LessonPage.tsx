import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Skeleton,
  ErrorState,
} from '../shared/ui/index.js';
import { useLesson } from '../shared/query/index.js';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, uiError, refetch } = useLesson(lessonId || '');

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--sp-4)' }}>
        <Card>
          <CardHeader>
            <Skeleton width="40%" height="24px" />
            <Skeleton width="60%" height="16px" style={{ marginTop: 'var(--sp-2)' }} />
          </CardHeader>
          <CardContent>
            <Skeleton width="100%" height="200px" />
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <Card>
        <CardHeader>
          <CardTitle>Урок #{lessonId}</CardTitle>
          <CardDescription>{data ? `Урок: ${data.title}` : 'Урок в разработке'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'flex',
              gap: 'var(--sp-2)',
              flexWrap: 'wrap',
              marginTop: 'var(--sp-4)',
            }}
          >
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Назад
            </Button>
            <Button variant="primary" onClick={() => navigate('/learn')}>
              К обучению
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
