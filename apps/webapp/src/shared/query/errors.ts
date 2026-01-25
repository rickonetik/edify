import { isApiClientError } from '../api/index.js';

export type UiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'unknown';

export type UiErrorState = {
  kind: UiErrorKind;
  title: string;
  description: string;
  requestId?: string;
};

const DEFAULT_TITLE = 'Произошла ошибка';
const DEFAULT_DESCRIPTION = 'Попробуйте ещё раз или обновите страницу.';

export function mapErrorToUiState(err: unknown): UiErrorState {
  if (!isApiClientError(err)) {
    return {
      kind: 'unknown',
      title: DEFAULT_TITLE,
      description: err instanceof Error ? err.message : DEFAULT_DESCRIPTION,
    };
  }

  const requestId = err.requestId;
  const code = err.code;
  const status = err.status;
  const message = err.message || DEFAULT_DESCRIPTION;

  if (status === 0) {
    return {
      kind: 'network',
      title: 'Нет соединения',
      description: 'Проверьте интернет и попробуйте снова.',
      requestId,
    };
  }

  switch (code) {
    case 'UNAUTHORIZED':
      return {
        kind: 'unauthorized',
        title: 'Требуется вход',
        description: message,
        requestId,
      };
    case 'FORBIDDEN':
      return {
        kind: 'forbidden',
        title: 'Доступ запрещён',
        description: message,
        requestId,
      };
    case 'NOT_FOUND':
      return {
        kind: 'not_found',
        title: 'Не найдено',
        description: message,
        requestId,
      };
    case 'VALIDATION_ERROR':
      return {
        kind: 'validation',
        title: 'Ошибка проверки',
        description: message,
        requestId,
      };
    default:
      return {
        kind: 'unknown',
        title: DEFAULT_TITLE,
        description: message,
        requestId,
      };
  }
}
