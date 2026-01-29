import { Bot, InlineKeyboard } from 'grammy';
import { BotEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(BotEnvSchema, process.env);

// Startup validation: TELEGRAM_WEBAPP_URL (required, https, no trailing slash)
const raw = process.env.TELEGRAM_WEBAPP_URL;
if (raw === undefined || raw.trim() === '') {
  throw new Error(
    'TELEGRAM_WEBAPP_URL is required (free ngrok URL; set it before starting the bot)',
  );
}
const trimmed = raw.trim();
const parsed = new URL(trimmed);
if (parsed.protocol !== 'https:') {
  throw new Error(`TELEGRAM_WEBAPP_URL must be https (got: ${trimmed})`);
}
const WEBAPP_URL = trimmed.replace(/\/+$/, '');

const bot = new Bot(env.BOT_TOKEN);

const openWebAppKb = new InlineKeyboard().webApp('Open WebApp', WEBAPP_URL);

// Команда /start — inline-кнопка Open WebApp
bot.command('start', async (ctx) => {
  await ctx.reply('Open the app:', { reply_markup: openWebAppKb });
});

// Обработка ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  // Логируем ошибку без утечки токена
  if (e instanceof Error) {
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    if (e.stack) {
      // Убираем токен из stack trace, если он там есть
      const safeStack = e.stack.replace(new RegExp(env.BOT_TOKEN, 'g'), '***');
      console.error('Stack trace:', safeStack);
    }
  } else {
    console.error('Unknown error:', e);
  }
});

// Старт бота
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} started`);
  },
});
