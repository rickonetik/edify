import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
const env = validateOrThrow(ApiEnvSchema, process.env);
console.log('api env ok', { nodeEnv: env.NODE_ENV, port: env.API_PORT });
console.log('api bootstrap (stub)');
