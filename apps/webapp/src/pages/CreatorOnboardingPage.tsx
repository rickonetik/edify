import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '../shared/ui/index.js';
import { useMyExpertSubscription } from '../shared/queries/useMyExpertSubscription.js';
import { deriveExpertCtaState } from '../features/account/expertCtaState.js';
import { getTelegramDisplayUser } from '../shared/auth/telegram.js';

const SUPPORT_LINK = import.meta.env.VITE_SUPPORT_TG_LINK as string | undefined;
const hasSupportLink = Boolean(SUPPORT_LINK && SUPPORT_LINK.startsWith('http'));

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-999999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function openSupportLink(): void {
  if (!hasSupportLink || !SUPPORT_LINK) return;
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(SUPPORT_LINK);
  } else {
    window.open(SUPPORT_LINK, '_blank', 'noopener,noreferrer');
  }
}

// DEV-only: force state from ?expertCta=none|expired|active
function getForcedState(searchParams: URLSearchParams): 'none' | 'expired' | 'active' | null {
  if (!import.meta.env.DEV) return null;
  const p = searchParams.get('expertCta');
  if (p === 'none' || p === 'expired' || p === 'active') return p;
  return null;
}

export function CreatorOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expertCtaParam = searchParams.get('expertCta') as 'none' | 'expired' | 'active' | null;
  const expertCta =
    expertCtaParam && ['none', 'expired', 'active'].includes(expertCtaParam)
      ? expertCtaParam
      : undefined;

  const forcedState = getForcedState(searchParams);
  const { data } = useMyExpertSubscription({ expertCta });
  const subscription = data ?? null;
  const state = forcedState ?? deriveExpertCtaState(subscription);

  const displayUser = getTelegramDisplayUser();
  const username = displayUser?.username ?? '';
  const applicationText = `Хочу стать экспертом. Мой @username: ${username || 'username'}.`;

  const statusLabel =
    state === 'active' ? 'Вы эксперт' : state === 'expired' ? 'Подписка истекла' : 'Вы студент';

  const handleCopyApplication = async () => {
    const ok = await copyToClipboard(applicationText);
    if (ok && window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({
        title: 'Скопировано',
        message: 'Текст заявки скопирован в буфер. Вставьте его в чат поддержки.',
      });
    }
  };

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardHeader>
          <CardTitle>Стать экспертом</CardTitle>
          <CardDescription>
            {statusLabel}.{' '}
            {state === 'active'
              ? 'Подписка активна. Ниже — информация для новых экспертов.'
              : state === 'expired'
                ? 'Продлите подписку, чтобы снова публиковать курсы.'
                : 'Подайте заявку, чтобы стать экспертом.'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardHeader>
          <CardTitle>Что получите</CardTitle>
          <CardDescription style={{ whiteSpace: 'pre-line', marginTop: 'var(--sp-2)' }}>
            {
              '• Эксперт-аккаунт: публикация курсов\n• Доступ к аналитике и монетизация\n• Подписка 0₽ на этапе запуска'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardHeader>
          <CardTitle>Условия</CardTitle>
          <CardDescription style={{ whiteSpace: 'pre-line', marginTop: 'var(--sp-2)' }}>
            {
              '• Заполнить профиль эксперта\n• Принять условия платформы\n• После одобрения заявки доступ включается вручную'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardHeader>
          <CardTitle>Подписка 0₽ (ручная активация)</CardTitle>
          <CardDescription>
            После одобрения мы активируем доступ. Оплата не требуется.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {hasSupportLink ? (
            <Button variant="primary" onClick={openSupportLink} style={{ width: '100%' }}>
              Подать заявку
            </Button>
          ) : (
            <>
              <div
                style={{
                  padding: 'var(--sp-3)',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-fg)',
                }}
              >
                Укажи VITE_SUPPORT_TG_LINK в .env (например https://t.me/your_support)
              </div>
              <Button variant="secondary" onClick={handleCopyApplication} style={{ width: '100%' }}>
                Скопировать @username для саппорта
              </Button>
            </>
          )}
          {hasSupportLink && (
            <Button variant="secondary" onClick={handleCopyApplication} style={{ width: '100%' }}>
              Скопировать текст заявки
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(-1)} style={{ width: '100%' }}>
            Назад
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
