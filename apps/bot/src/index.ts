import { BotEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(BotEnvSchema, process.env);

console.log('bot env ok', { nodeEnv: env.NODE_ENV, logLevel: env.BOT_LOG_LEVEL });

console.log('bot bootstrap (stub)');
