import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Skeleton,
  EmptyState,
  ErrorState,
  ListItem,
  useToast,
} from '../shared/ui/index.js';
import { useMe } from '../shared/query/index.js';

// Mock data
const mockProfile = {
  name: 'Никита',
  handle: '@rickonetik',
  status: 'Pro',
  avatar: null, // Will use placeholder
};

const mockReferralCode = 'KOL-9F2A';

const mockStats = {
  progress: { completed: 12, total: 30, label: 'Прогресс' },
  streak: { value: 5, label: 'Streak' },
  points: { value: 1240, label: 'Очки' },
};

// Copy to clipboard helper with fallback
async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: create temporary textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

// Avatar Placeholder Component
function AvatarPlaceholder() {
  return (
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        opacity: 0.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          border: '2px solid var(--card)',
        }}
      />
    </div>
  );
}

// Profile Card Component (name/handle from useMe when available, else mock)
function ProfileCard({ name, handle }: { name?: string; handle?: string } = {}) {
  const displayName = name ?? mockProfile.name;
  const displayHandle = handle ?? mockProfile.handle;
  return (
    <Card style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-4)',
        }}
      >
        <AvatarPlaceholder />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--fg)',
              marginBottom: 'var(--sp-1)',
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-fg)',
              marginBottom: 'var(--sp-2)',
            }}
          >
            {displayHandle}
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: 'var(--sp-1) var(--sp-2)',
              backgroundColor: 'var(--accent)',
              borderRadius: 'var(--r-sm)',
              fontSize: 'var(--text-xs)',
              color: 'var(--bg)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {mockProfile.status}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Referral Card Component
function ReferralCard() {
  const toast = useToast();
  const referralLink = `${window.location.origin}/?ref=${mockReferralCode}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      toast.show({
        title: 'Ссылка скопирована',
        variant: 'success',
      });
    } else {
      toast.show({
        title: 'Не удалось скопировать',
        variant: 'error',
      });
    }
  };

  return (
    <Card style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--fg)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        Реферальная программа
      </div>
      <div style={{ marginBottom: 'var(--sp-3)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          Реферальный код:
        </div>
        <div
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}
        >
          {mockReferralCode}
        </div>
      </div>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          Реферальная ссылка:
        </div>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--fg)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            padding: 'var(--sp-2)',
            backgroundColor: 'var(--card-2)',
            borderRadius: 'var(--r-sm)',
            marginBottom: 'var(--sp-3)',
          }}
        >
          {referralLink}
        </div>
      </div>
      <Button variant="primary" onClick={handleCopy} style={{ width: '100%' }}>
        Скопировать
      </Button>
    </Card>
  );
}

// Stats Row Component
function StatsRow() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
      }}
    >
      <Card style={{ flex: 1, padding: 'var(--sp-4)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          {mockStats.progress.label}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
          }}
        >
          {mockStats.progress.completed}/{mockStats.progress.total}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-fg)',
            marginTop: 'var(--sp-1)',
          }}
        >
          уроков
        </div>
      </Card>
      <Card style={{ flex: 1, padding: 'var(--sp-4)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          {mockStats.streak.label}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
          }}
        >
          {mockStats.streak.value}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-fg)',
            marginTop: 'var(--sp-1)',
          }}
        >
          дней
        </div>
      </Card>
      <Card style={{ flex: 1, padding: 'var(--sp-4)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-fg)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          {mockStats.points.label}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--fg)',
          }}
        >
          {mockStats.points.value.toLocaleString('ru-RU')}
        </div>
      </Card>
    </div>
  );
}

// Actions List Component
function ActionsList() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div>
      <ListItem
        title="Стать экспертом"
        subtitle="Создавайте курсы и зарабатывайте"
        right="›"
        onClick={() => navigate('/creator/onboarding')}
      />
      <ListItem
        title="Поддержка"
        subtitle="Помощь и обратная связь"
        right="›"
        onClick={() => {
          toast.show({
            title: 'Скоро',
            message: 'Поддержка будет доступна в следующей версии',
            variant: 'info',
          });
        }}
      />
      <ListItem
        title="Язык"
        subtitle="Русский (RU)"
        right="›"
        onClick={() => navigate('/settings')}
      />
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <Skeleton width="60%" height="24px" style={{ marginBottom: 'var(--sp-2)' }} />
      <Skeleton width="100%" height="120px" radius="lg" style={{ marginBottom: 'var(--sp-4)' }} />
      <Skeleton width="100%" height="200px" radius="lg" style={{ marginBottom: 'var(--sp-4)' }} />
      <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
        <Skeleton width="100%" height="100px" radius="lg" />
        <Skeleton width="100%" height="100px" radius="lg" />
        <Skeleton width="100%" height="100px" radius="lg" />
      </div>
      <Skeleton width="100%" height="60px" radius="md" style={{ marginBottom: 'var(--sp-2)' }} />
      <Skeleton width="100%" height="60px" radius="md" style={{ marginBottom: 'var(--sp-2)' }} />
      <Skeleton width="100%" height="60px" radius="md" />
    </div>
  );
}

// Main AccountPage Component
export function AccountPage() {
  const navigate = useNavigate();
  const { data: me, isLoading, isError, uiError, refetch } = useMe();
  const profileName = me?.name ?? mockProfile.name;
  const profileHandle = me?.handle ?? mockProfile.handle;

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

  // Default state (me can be undefined, fallback to mock)
  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <ProfileCard name={profileName} handle={profileHandle} />

      {/* Referral Card */}
      <ReferralCard />

      {/* Stats Row */}
      <StatsRow />

      {/* Actions List */}
      <ActionsList />
    </div>
  );
}
