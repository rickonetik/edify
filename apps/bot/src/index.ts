import { Bot } from 'grammy';
import { BotEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(BotEnvSchema, process.env);

const bot = new Bot(env.BOT_TOKEN);

// Команда /start
bot.command('start', async (ctx) => {
  await ctx.reply('Edify bot is running. Use the Mini App button soon.');
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
