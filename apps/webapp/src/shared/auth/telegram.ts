/**
 * Telegram WebApp utilities
 */

/**
 * Telegram WebApp type definition
 */
interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: unknown;
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: unknown;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  headerColor?: string;
  backgroundColor?: string;
  BackButton?: unknown;
  MainButton?: unknown;
  HapticFeedback?: unknown;
  CloudStorage?: unknown;
  BiometricManager?: unknown;
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
  sendData?: (data: string) => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink?: (url: string) => void;
  openInvoice?: (url: string, callback?: (status: string) => void) => void;
  showPopup?: (params: unknown, callback?: (id: string) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup?: (params: unknown, callback?: (data: string) => void) => void;
  closeScanQrPopup?: () => void;
  readTextFromClipboard?: (callback?: (text: string) => void) => void;
  requestWriteAccess?: (callback?: (granted: boolean) => void) => void;
  requestContact?: (callback?: (granted: boolean) => void) => void;
}

interface Telegram {
  WebApp?: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

/**
 * Get Telegram initData safely
 * @returns initData string or null if not in Telegram or initData unavailable
 */
export function getTelegramInitData(): string | null {
  try {
    // Check if we're in Telegram WebApp environment
    if (typeof window === 'undefined') {
      return null;
    }

    const telegram = window.Telegram;
    if (!telegram?.WebApp) {
      return null;
    }

    const initData = telegram.WebApp.initData;
    if (!initData || typeof initData !== 'string' || initData.trim().length === 0) {
      return null;
    }

    return initData;
  } catch {
    // Silently fail if Telegram API is not available
    return null;
  }
}
